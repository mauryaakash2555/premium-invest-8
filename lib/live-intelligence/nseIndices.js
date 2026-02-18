// Shared NSE indices snapshot helper (server-side only)

function safeHead(text) {
  return String(text || '').slice(0, 180).replace(/\s+/g, ' ');
}

function nseHeaders(extra = {}) {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    Accept: 'application/json,text/plain,*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.nseindia.com/',
    Connection: 'keep-alive',
    ...extra,
  };
}

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function fetchNseAllIndices() {
  const url = 'https://www.nseindia.com/api/allIndices';

  const direct = await fetchWithTimeout(url, { headers: nseHeaders(), cache: 'no-store' }, 8000);
  const directText = await direct.text();
  if (direct.ok) {
    try {
      return JSON.parse(directText);
    } catch {
      throw new Error(`nse_json_parse_failed head=${safeHead(directText)}`);
    }
  }

  const home = await fetchWithTimeout('https://www.nseindia.com/', { headers: nseHeaders(), cache: 'no-store' }, 8000);
  const cookie = home.headers.get('set-cookie');

  const retry = await fetchWithTimeout(url, { headers: nseHeaders(cookie ? { cookie } : {}), cache: 'no-store' }, 8000);
  const retryText = await retry.text();
  if (!retry.ok) {
    throw new Error(`nse_fetch_failed status=${retry.status} head=${safeHead(retryText)}`);
  }

  try {
    return JSON.parse(retryText);
  } catch {
    throw new Error(`nse_json_parse_failed head=${safeHead(retryText)}`);
  }
}

function safeNumber(val) {
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  if (val == null) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function pickIndexRows(rows, wanted) {
  const byName = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const name = String(row?.index || row?.name || '').trim();
    if (!name) continue;
    byName.set(name.toUpperCase(), row);
  }

  return wanted
    .map((name) => {
      const row = byName.get(String(name).toUpperCase());
      if (!row) return null;
      return {
        name,
        last: safeNumber(row?.last),
        change: safeNumber(row?.change),
        percentChange: safeNumber(row?.percChange ?? row?.percentChange),
      };
    })
    .filter(Boolean);
}

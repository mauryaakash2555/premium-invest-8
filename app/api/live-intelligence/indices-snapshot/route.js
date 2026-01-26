import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_KEY = '__li_indices_snapshot_cache__';
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min

function getCache() {
  const c = globalThis[CACHE_KEY];
  if (!c || !c.ts || !c.payload) return null;
  if (Date.now() - c.ts > CACHE_TTL_MS) return null;
  return c.payload;
}

function setCache(payload) {
  globalThis[CACHE_KEY] = { ts: Date.now(), payload };
}

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

async function fetchNseAllIndices() {
  const url = 'https://www.nseindia.com/api/allIndices';

  const direct = await fetch(url, { headers: nseHeaders(), cache: 'no-store' });
  const directText = await direct.text();
  if (direct.ok) {
    try {
      return JSON.parse(directText);
    } catch {
      throw new Error(`nse_json_parse_failed head=${safeHead(directText)}`);
    }
  }

  const home = await fetch('https://www.nseindia.com/', { headers: nseHeaders(), cache: 'no-store' });
  const cookie = home.headers.get('set-cookie');

  const retry = await fetch(url, { headers: nseHeaders(cookie ? { cookie } : {}), cache: 'no-store' });
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

function pickIndexRows(rows, wanted) {
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
        last: typeof row?.last === 'number' ? row.last : Number(row?.last) || null,
        change: typeof row?.change === 'number' ? row.change : Number(row?.change) || null,
        percentChange:
          typeof row?.percChange === 'number'
            ? row.percChange
            : typeof row?.percentChange === 'number'
              ? row.percentChange
              : Number(row?.percChange ?? row?.percentChange) || null,
      };
    })
    .filter(Boolean);
}

export async function GET() {
  const cached = getCache();
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'no-store', 'x-li-cache': 'HIT' },
    });
  }

  const startedAt = Date.now();
  let indices = null;
  let error = null;

  const wanted = [
    'NIFTY 50',
    'NIFTY BANK',
    'NIFTY FIN SERVICE',
    'NIFTY IT',
    'NIFTY FMCG',
    'NIFTY PHARMA',
    'NIFTY AUTO',
    'NIFTY METAL',
    'NIFTY REALTY',
    'INDIA VIX',
  ];

  try {
    const json = await fetchNseAllIndices();
    const rows = json?.data;
    indices = pickIndexRows(rows, wanted);
  } catch (e) {
    error = String(e?.message || e);
  }

  const payload = {
    lastUpdated: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
    indices,
    notes: ['Best-effort snapshot; may be delayed/incomplete.', 'Educational context only; not investment advice.'],
    error,
  };

  setCache(payload);

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store', 'x-li-cache': 'MISS' },
  });
}

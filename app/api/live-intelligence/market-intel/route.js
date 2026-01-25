import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_KEY = '__li_market_intel_cache__';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function getCache() {
  const c = globalThis[CACHE_KEY];
  if (!c || !c.ts || !c.payload) return null;
  if (Date.now() - c.ts > CACHE_TTL_MS) return null;
  return c.payload;
}

function setCache(payload) {
  globalThis[CACHE_KEY] = { ts: Date.now(), payload };
}

function parseMaybeNumber(value) {
  if (value == null) return null;
  const s = String(value)
    .replace(/[₹,]/g, '')
    .replace(/\s*cr\b/gi, '')
    .trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function findRow(rows, matcher) {
  if (!Array.isArray(rows)) return null;
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const hay = [
      row.clientType,
      row.participantType,
      row.participant,
      row.category,
      row.investorType,
      row.name,
      row.label,
      row.type,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (matcher(hay, row)) return row;
  }
  return null;
}

function extractNetValue(row) {
  if (!row) return null;
  // Common NSE shapes: netValue | net | netValueInCrores
  const candidates = [row.netValue, row.net, row.netValueInCrores, row.net_value, row.netValueCr];
  for (const c of candidates) {
    const n = parseMaybeNumber(c);
    if (n != null) return n;
  }
  // Derive from buy/sell if present
  const buy = parseMaybeNumber(row.buyValue ?? row.buy ?? row.buyValueInCrores);
  const sell = parseMaybeNumber(row.sellValue ?? row.sell ?? row.sellValueInCrores);
  if (buy != null && sell != null) return buy - sell;
  return null;
}

async function fetchFiiDiiFromNse() {
  const url = 'https://www.nseindia.com/api/fiidiiTradeReact';

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    Accept: 'application/json,text/plain,*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.nseindia.com/',
    Connection: 'keep-alive',
  };

  const res = await fetch(url, { headers, cache: 'no-store' });
  const text = await res.text();
  if (!res.ok) {
    const head = text.slice(0, 140).replace(/\s+/g, ' ');
    throw new Error(`nse_fiidii_failed status=${res.status} head=${head}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    const head = text.slice(0, 140).replace(/\s+/g, ' ');
    throw new Error(`nse_fiidii_json_parse_failed head=${head}`);
  }

  const rows = Array.isArray(json) ? json : json?.data;
  const fiiRow = findRow(rows, (hay) => hay.includes('fii'));
  const diiRow = findRow(rows, (hay) => hay.includes('dii'));

  const date = json?.date || json?.tradeDate || fiiRow?.tradeDate || diiRow?.tradeDate || null;

  const fiiNetCr = extractNetValue(fiiRow);
  const diiNetCr = extractNetValue(diiRow);

  return {
    source: 'nse',
    date,
    fiiNetCr,
    diiNetCr,
    ok: fiiNetCr != null || diiNetCr != null,
  };
}

export async function GET() {
  const cached = getCache();
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'no-store',
        'x-li-cache': 'HIT',
      },
    });
  }

  const startedAt = Date.now();
  let fiiDii = null;
  let error = null;

  try {
    fiiDii = await fetchFiiDiiFromNse();
  } catch (e) {
    error = String(e?.message || e);
  }

  const payload = {
    lastUpdated: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
    fiiDii,
    notes: [
      'Best-effort snapshot for informational purposes only.',
      'May be delayed/incomplete depending on upstream availability.',
    ],
    error,
  };

  setCache(payload);

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store',
      'x-li-cache': 'MISS',
    },
  });
}

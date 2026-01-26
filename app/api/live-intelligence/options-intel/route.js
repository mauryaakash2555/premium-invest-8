import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_KEY = '__li_options_intel_cache__';
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

function clampNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

async function fetchNseJson(url) {
  // NSE often blocks direct API calls unless a session cookie exists.
  // Best-effort approach: try direct; on failure, fetch homepage to get cookies and retry.
  const direct = await fetch(url, { headers: nseHeaders(), cache: 'no-store' });
  const directText = await direct.text();

  if (direct.ok) {
    try {
      return JSON.parse(directText);
    } catch {
      throw new Error(`nse_json_parse_failed head=${safeHead(directText)}`);
    }
  }

  // Retry with cookie from homepage
  const home = await fetch('https://www.nseindia.com/', { headers: nseHeaders(), cache: 'no-store' });
  const cookie = home.headers.get('set-cookie');

  const retry = await fetch(url, {
    headers: nseHeaders(cookie ? { cookie } : {}),
    cache: 'no-store',
  });

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

function summarizeOptionChain(ocJson) {
  const records = ocJson?.records;
  const filtered = ocJson?.filtered;

  const underlying = clampNumber(records?.underlyingValue);
  const timestamp = records?.timestamp || records?.data?.[0]?.timestamp || null;

  const callsOi = clampNumber(filtered?.CE?.totOI ?? records?.totOI ?? null);
  const putsOi = clampNumber(filtered?.PE?.totOI ?? records?.totOI ?? null);

  // Common in option-chain-indices: filtered.CE.totOI and filtered.PE.totOI
  const calls = clampNumber(filtered?.CE?.totOI);
  const puts = clampNumber(filtered?.PE?.totOI);

  const totalCallOI = calls ?? callsOi;
  const totalPutOI = puts ?? putsOi;

  const pcr =
    totalPutOI != null && totalCallOI != null && totalCallOI > 0
      ? Number((totalPutOI / totalCallOI).toFixed(2))
      : null;

  let tone = 'neutral';
  if (pcr != null) {
    if (pcr >= 1.2) tone = 'put-heavy';
    else if (pcr <= 0.85) tone = 'call-heavy';
    else tone = 'balanced';
  }

  return {
    underlying,
    timestamp,
    totalCallOI,
    totalPutOI,
    pcr,
    tone,
  };
}

export async function GET() {
  const cached = getCache();
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'no-store', 'x-li-cache': 'HIT' },
    });
  }

  const startedAt = Date.now();
  let nifty = null;
  let bankNifty = null;
  let error = null;

  try {
    const [niftyJson, bankJson] = await Promise.all([
      fetchNseJson('https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY'),
      fetchNseJson('https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY'),
    ]);

    nifty = summarizeOptionChain(niftyJson);
    bankNifty = summarizeOptionChain(bankJson);
  } catch (e) {
    error = String(e?.message || e);
  }

  const payload = {
    lastUpdated: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
    nifty,
    bankNifty,
    notes: [
      'Best-effort snapshot; NSE may throttle/deny requests.',
      'Educational context only; not investment advice.',
    ],
    error,
  };

  setCache(payload);

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store', 'x-li-cache': 'MISS' },
  });
}

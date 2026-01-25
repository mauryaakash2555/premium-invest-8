import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_KEY = '__li_deals_intel_cache__';
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
  const direct = await fetch(url, { headers: nseHeaders(), cache: 'no-store' });
  const directText = await direct.text();
  if (direct.ok) {
    try {
      return JSON.parse(directText);
    } catch {
      throw new Error(`nse_json_parse_failed url=${url} head=${safeHead(directText)}`);
    }
  }

  const home = await fetch('https://www.nseindia.com/', { headers: nseHeaders(), cache: 'no-store' });
  const cookie = home.headers.get('set-cookie');

  const retry = await fetch(url, {
    headers: nseHeaders(cookie ? { cookie } : {}),
    cache: 'no-store',
  });

  const retryText = await retry.text();
  if (!retry.ok) {
    throw new Error(`nse_fetch_failed url=${url} status=${retry.status} head=${safeHead(retryText)}`);
  }

  try {
    return JSON.parse(retryText);
  } catch {
    throw new Error(`nse_json_parse_failed url=${url} head=${safeHead(retryText)}`);
  }
}

function asNumber(value) {
  const n = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function findFirstArray(json) {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== 'object') return null;

  const preferredKeys = [
    'data',
    'bulkDeals',
    'blockDeals',
    'blockDealData',
    'bulkDealData',
    'result',
    'rows',
  ];

  for (const k of preferredKeys) {
    if (Array.isArray(json[k])) return json[k];
  }

  for (const v of Object.values(json)) {
    if (Array.isArray(v)) return v;
  }

  return null;
}

function normalizeDealRow(row, kind) {
  if (!row || typeof row !== 'object') return null;

  const symbol =
    row.symbol ||
    row.security ||
    row.securityName ||
    row.security_name ||
    row.scrip ||
    row.scripName ||
    row.company ||
    row.stock ||
    row.name ||
    null;

  const client =
    row.clientName ||
    row.client_name ||
    row.client ||
    row.clientCode ||
    row.client_code ||
    row.clientNameBuyer ||
    row.clientNameSeller ||
    null;

  const sideRaw = String(row.buySell || row.side || row.bs || row.buy_sell || row.type || '').toUpperCase();
  const side = sideRaw.includes('BUY') ? 'BUY' : sideRaw.includes('SELL') ? 'SELL' : null;

  const quantity = asNumber(row.quantity ?? row.qty ?? row.tradedQuantity ?? row.trdQty ?? row.qtyTraded);
  const price = asNumber(row.price ?? row.tradePrice ?? row.tradedPrice ?? row.avgPrice ?? row.rate);

  const tradeDate = row.tradeDate || row.date || row.tradedDate || row.trade_date || null;

  const valueCr =
    asNumber(row.valueCr ?? row.valueCR ?? row.value_cr ?? row.turnoverCr ?? row.turnoverCR) ??
    (quantity != null && price != null ? Number(((quantity * price) / 1e7).toFixed(2)) : null); // INR to Cr

  const cleanedSymbol = symbol ? String(symbol).trim() : null;
  if (!cleanedSymbol) return null;

  return {
    kind,
    symbol: cleanedSymbol,
    client: client ? String(client).trim() : null,
    side,
    quantity,
    price,
    valueCr,
    tradeDate: tradeDate ? String(tradeDate).trim() : null,
  };
}

async function fetchDeals(kind) {
  const candidates = kind === 'bulk'
    ? [
        'https://www.nseindia.com/api/live-analysis-bulk-deals',
        'https://www.nseindia.com/api/bulk-deals',
      ]
    : [
        'https://www.nseindia.com/api/live-analysis-block-deals',
        'https://www.nseindia.com/api/block-deals',
      ];

  let lastError = null;
  for (const url of candidates) {
    try {
      const json = await fetchNseJson(url);
      const arr = findFirstArray(json);
      if (!arr || arr.length === 0) continue;
      const normalized = arr
        .map((row) => normalizeDealRow(row, kind))
        .filter(Boolean)
        .slice(0, 12);
      if (normalized.length) return { ok: true, source: 'nse', url, deals: normalized };
    } catch (e) {
      lastError = String(e?.message || e);
    }
  }

  return { ok: false, source: null, deals: [], error: lastError };
}

export async function GET() {
  const cached = getCache();
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'no-store', 'x-li-cache': 'HIT' },
    });
  }

  const startedAt = Date.now();

  const [bulk, block] = await Promise.all([fetchDeals('bulk'), fetchDeals('block')]);

  const payload = {
    lastUpdated: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
    bulk,
    block,
    notes: [
      'Best-effort snapshot; upstream may throttle/deny requests.',
      'Educational context only; not investment advice.',
    ],
  };

  setCache(payload);

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store', 'x-li-cache': 'MISS' },
  });
}

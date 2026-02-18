import { NextResponse } from 'next/server';
import { fetchNseAllIndices, pickIndexRows } from '@/lib/live-intelligence/nseIndices';

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
    const rows = json?.data || json?.indices || [];
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

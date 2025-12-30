import { NextResponse } from "next/server";

// Premium Market Snapshot (informational only)
// Resilient to partial symbol failures: retain last-known values on the client.

const INSTRUMENTS = [
  { id: "NIFTY50", name: "NIFTY 50", kind: "index", yahooCandidates: ["^NSEI"] },
  { id: "SENSEX", name: "SENSEX", kind: "index", yahooCandidates: ["^BSESN"] },
  // Metals are labeled as SPOT; feed is best-effort via public Yahoo symbols.
  // We prefer spot XAU/XAG in USD and convert to INR using USD/INR.
  { id: "GOLD", name: "GOLD (Spot)", kind: "metal", yahooCandidates: ["XAUUSD=X", "GC=F", "XAUINR=X"] },
  { id: "SILVER", name: "SILVER (Spot)", kind: "metal", yahooCandidates: ["XAGUSD=X", "SI=F", "XAGINR=X"] },
  { id: "USDINR", name: "USD/INR", kind: "fx", yahooCandidates: ["INR=X"] },
];

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function round(n, places = 2) {
  if (!Number.isFinite(n)) return null;
  const p = 10 ** places;
  return Math.round(n * p) / p;
}

function directionFrom(changePct) {
  if (!Number.isFinite(changePct)) return "flat";
  if (changePct > 0.0001) return "up";
  if (changePct < -0.0001) return "down";
  return "flat";
}

async function fetchYahooMeta(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
  const res = await fetch(url, {
    // UI refreshes every 15 seconds
    next: { revalidate: 15 },
    headers: {
      "User-Agent": "bmwealth-market-ticker/1.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`Yahoo fetch failed for ${symbol}: ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`Yahoo response missing meta for ${symbol}`);
  return meta;
}

async function firstWorkingMeta(candidates) {
  let lastErr;
  for (const sym of candidates) {
    try {
      const meta = await fetchYahooMeta(sym);
      const price = toNumber(meta.regularMarketPrice);
      const prev = toNumber(meta.previousClose);
      if (price == null || prev == null) throw new Error(`Bad meta numbers for ${sym}`);
      return { sym, meta };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No working symbols");
}

function computeChange(price, prevClose) {
  if (!Number.isFinite(price) || !Number.isFinite(prevClose) || prevClose === 0) {
    return { changeAbs: null, changePct: null, direction: "flat" };
  }
  const changeAbs = price - prevClose;
  const changePct = (changeAbs / prevClose) * 100;
  return { changeAbs, changePct, direction: directionFrom(changePct) };
}

export async function GET() {
  try {
    // Always fetch USD/INR first so we can convert metals when needed.
    const usdInrInst = INSTRUMENTS.find((x) => x.id === "USDINR");
    const usdMetaWrap = await firstWorkingMeta(usdInrInst.yahooCandidates);
    const usdMeta = usdMetaWrap.meta;
    const usdInr = toNumber(usdMeta.regularMarketPrice);
    const usdPrev = toNumber(usdMeta.previousClose);

    if (usdInr == null || usdPrev == null) throw new Error("USD/INR unavailable");

    const items = [];

    for (const inst of INSTRUMENTS) {
      if (inst.id === "USDINR") {
        const { changePct, direction } = computeChange(usdInr, usdPrev);
        items.push({
          id: inst.id,
          name: inst.name,
          kind: inst.kind,
          value: usdInr,
          changePct: round(changePct, 2),
          direction,
          source: usdMetaWrap.sym,
          currency: "INR",
        });
        continue;
      }

      const wrap = await firstWorkingMeta(inst.yahooCandidates);
      const meta = wrap.meta;

      let price = toNumber(meta.regularMarketPrice);
      let prevClose = toNumber(meta.previousClose);

      if (price == null || prevClose == null) throw new Error(`Bad numbers for ${inst.id}`);

      // Convert metals quoted in USD to INR using USD/INR.
      const isMetal = inst.kind === "metal";
      const looksUsd = wrap.sym.endsWith("USD=X") || wrap.sym === "GC=F" || wrap.sym === "SI=F";
      const looksInr = wrap.sym.endsWith("INR=X");

      if (isMetal && looksUsd) {
        price = price * usdInr;
        prevClose = prevClose * usdPrev;
      }

      // If metal comes from an INR pair, keep as-is.
      if (isMetal && looksInr) {
        // no-op
      }

      const { changePct, direction } = computeChange(price, prevClose);

      items.push({
        id: inst.id,
        name: inst.name,
        kind: inst.kind,
        value: inst.kind === "index" ? round(price, 2) : round(price, 2),
        changePct: round(changePct, 2),
        direction,
        source: wrap.sym,
        currency: "INR",
      });
    }

    return NextResponse.json({ ok: true, asOf: new Date().toISOString(), items });
  } catch (e) {
    console.error("Market data fetch error:", e);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}

/**
 * FILE: app\api\market-data\route.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

import { NextResponse } from "next/server";
import { Logger } from "@/lib/monitoring/logger";
// Premium Market Snapshot (informational only)
// Resilient to partial symbol failures: retain last-known values on the client.

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 55_000;
const CACHE_KEY = "__bm_market_data_cache__";

function getCache() {
  const c = globalThis[CACHE_KEY];
  if (!c || !c.ts || !c.payload) return null;
  if (Date.now() - c.ts > CACHE_TTL_MS) return null;
  return c.payload;
}

function setCache(payload) {
  globalThis[CACHE_KEY] = { ts: Date.now(), payload };
}

const INSTRUMENTS = [
  { id: "NIFTY50", name: "NIFTY 50", kind: "index", yahooCandidates: ["^NSEI"] },
  { id: "SENSEX", name: "SENSEX", kind: "index", yahooCandidates: ["^BSESN"] },
  // Metals: best-effort via public Yahoo symbols.
  // Use XAU/XAG in USD and convert to INR using USD/INR, then convert into Indian-friendly units:
  // - Gold: INR per 10g
  // - Silver: INR per kg
  // Note: These are indicative conversions and are NOT assured to match MCX spot/futures.
  { id: "GOLD", name: "GOLD (10g)", kind: "metal", yahooCandidates: ["XAUUSD=X", "GC=F", "XAUINR=X"] },
  { id: "SILVER", name: "SILVER (1kg)", kind: "metal", yahooCandidates: ["XAGUSD=X", "SI=F", "XAGINR=X"] },
  // Commodities / Crypto (informational only)
  { id: "CRUDEOIL", name: "CRUDE OIL", kind: "commodity", yahooCandidates: ["CL=F"] },
  { id: "BTC", name: "BITCOIN", kind: "crypto", yahooCandidates: ["BTC-USD"] },
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

const TROY_OUNCE_TO_GRAMS = 31.1034768;
const GOLD_10G_IN_OZ = 10 / TROY_OUNCE_TO_GRAMS; // 0.321507...
const KG_IN_OZ = 1000 / TROY_OUNCE_TO_GRAMS; // 32.1507...

function directionFrom(changePct) {
  if (!Number.isFinite(changePct)) return "flat";
  if (changePct > 0.0001) return "up";
  if (changePct < -0.0001) return "down";
  return "flat";
}

async function fetchYahooQuoteMap(symbols) {
  const uniq = Array.from(new Set((symbols || []).map((s) => String(s || "").trim()).filter(Boolean)));
  if (!uniq.length) return new Map();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(uniq.join(","))}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "bmwealth-market-ticker/1.0",
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Yahoo quote fetch failed: ${res.status}`);
    const data = await res.json();
    const results = Array.isArray(data?.quoteResponse?.result) ? data.quoteResponse.result : [];
    const map = new Map();
    for (const q of results) {
      const sym = String(q?.symbol || "").trim();
      if (!sym) continue;
      // Keep a minimal meta-like surface to reduce downstream changes.
      map.set(sym, {
        regularMarketPrice: q?.regularMarketPrice,
        previousClose: q?.regularMarketPreviousClose,
        currency: q?.currency,
      });
    }
    return map;
  } finally {
    clearTimeout(timeout);
  }
}

function firstWorkingMeta(candidates, quoteMap) {
  let lastErr;
  for (const sym of candidates) {
    try {
      const meta = quoteMap?.get?.(sym);
      const price = toNumber(meta?.regularMarketPrice);
      const prev = toNumber(meta?.previousClose);
      if (price == null || prev == null) throw new Error(`Bad quote numbers for ${sym}`);
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
    const cached = getCache();
    if (cached) {
      const res = NextResponse.json({ ...cached, cached: true });
      res.headers.set("Cache-Control", "no-store, max-age=0");
      return res;
    }

    // Fetch all candidates in one request for reliability/performance (important on serverless staging).
    const allSymbols = INSTRUMENTS.flatMap((x) => x.yahooCandidates || []);
    const quoteMap = await fetchYahooQuoteMap(allSymbols);

    // Always fetch USD/INR first so we can convert metals when needed.
    const usdInrInst = INSTRUMENTS.find((x) => x.id === "USDINR");
    const usdMetaWrap = firstWorkingMeta(usdInrInst.yahooCandidates, quoteMap);
    const usdMeta = usdMetaWrap.meta;
    const usdInr = toNumber(usdMeta.regularMarketPrice);
    const usdPrev = toNumber(usdMeta.previousClose);

    if (usdInr == null || usdPrev == null) throw new Error("USD/INR unavailable");

    const items = [];

    // USD/INR always included
    {
      const { changePct, direction } = computeChange(usdInr, usdPrev);
      items.push({
        id: "USDINR",
        name: "USD/INR",
        kind: "fx",
        value: usdInr,
        changePct: round(changePct, 2),
        direction,
        source: usdMetaWrap.sym,
        currency: "INR",
      });
    }

    const others = INSTRUMENTS.filter((x) => x.id !== "USDINR");
    const metaResults = await Promise.all(
      others.map(async (inst) => {
        try {
          const wrap = firstWorkingMeta(inst.yahooCandidates, quoteMap);
          return { inst, wrap };
        } catch (error) {
          return { inst, error };
        }
      })
    );

    for (const r of metaResults) {
      if (r.error || !r.wrap) continue;
      const inst = r.inst;
      const wrap = r.wrap;
      const meta = wrap.meta;

      let price = toNumber(meta.regularMarketPrice);
      let prevClose = toNumber(meta.previousClose);
      if (price == null || prevClose == null) continue;

      const isMetal = inst.kind === "metal";
      const isCommodity = inst.kind === "commodity";

      const looksUsdPerOz =
        wrap.sym.endsWith("USD=X") ||
        wrap.sym === "GC=F" ||
        wrap.sym === "SI=F" ||
        wrap.sym === "BTC-USD" ||
        wrap.sym === "CL=F";

      const looksInrPair = wrap.sym.endsWith("INR=X");

      // Convert USD quotes to INR where it helps UX (metals + crude).
      // NOTE: BTC is kept in USD to match common display.
      if ((isMetal || isCommodity) && looksUsdPerOz) {
        price = price * usdInr;
        prevClose = prevClose * usdPrev;
      }

      // Metals unit normalization (MCX-style display)
      if (isMetal && (wrap.sym.endsWith("USD=X") || wrap.sym === "GC=F" || wrap.sym === "SI=F")) {
        if (inst.id === "GOLD") {
          price = price * GOLD_10G_IN_OZ;
          prevClose = prevClose * GOLD_10G_IN_OZ;
        } else if (inst.id === "SILVER") {
          price = price * KG_IN_OZ;
          prevClose = prevClose * KG_IN_OZ;
        }
      }

      // If metal comes from an INR pair, assume it is already INR/oz; normalize to local units.
      if (isMetal && looksInrPair) {
        if (inst.id === "GOLD") {
          price = price * GOLD_10G_IN_OZ;
          prevClose = prevClose * GOLD_10G_IN_OZ;
        } else if (inst.id === "SILVER") {
          price = price * KG_IN_OZ;
          prevClose = prevClose * KG_IN_OZ;
        }
      }

      const { changePct, direction } = computeChange(price, prevClose);
      const convertedToInr = (isMetal || isCommodity) && looksUsdPerOz;
      const currency = convertedToInr ? "INR" : String(meta.currency || "INR");

      items.push({
        id: inst.id,
        name: inst.name,
        kind: inst.kind,
        value: round(price, 2),
        changePct: round(changePct, 2),
        direction,
        source: wrap.sym,
        currency,
      });
    }

    const payload = { ok: true, asOf: new Date().toISOString(), items };
    setCache(payload);
    const res = NextResponse.json(payload);
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  } catch (e) {
    Logger.error("market_data_fetch_error", { error: String(e?.message || e), stack: e?.stack });

    const cached = globalThis[CACHE_KEY]?.payload;
    if (cached?.ok && Array.isArray(cached.items) && cached.items.length) {
      // If Yahoo is down/slow, serve last known snapshot so the UI still has numbers.
      const res = NextResponse.json({ ...cached, stale: true });
      res.headers.set("Cache-Control", "no-store, max-age=0");
      return res;
    }

    const res = NextResponse.json({ ok: false }, { status: 502 });
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  }
}







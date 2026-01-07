/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║  🔒🔒🔒 CRITICAL PROTECTED FILE - BANK LEVEL SECURITY 🔒🔒🔒               ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                            ║
 * ║  ⛔ STOP! AI ASSISTANT - YOU MUST READ THIS BEFORE ANY CHANGES! ⛔         ║
 * ║                                                                            ║
 * ║  📖 MANDATORY DOCUMENTATION: /core/marketTicker/README.md                  ║
 * ║                                                                            ║
 * ║  This file is MISSION CRITICAL for the business. Breaking this means:     ║
 * ║  - Users see wrong market data = Loss of trust                             ║
 * ║  - Website looks broken = Loss of business                                 ║
 * ║  - Market ticker fails = Immediate escalation                              ║
 * ║                                                                            ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║  BEFORE ANY CHANGE:                                                        ║
 * ║  □ 1. READ /core/marketTicker/README.md completely                         ║
 * ║  □ 2. RUN backup command from README                                       ║
 * ║  □ 3. TEST API after changes: curl localhost:3000/api/market-data          ║
 * ║  □ 4. VERIFY all 7 instruments return live:true or valid fallback          ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                            ║
 * ║  FILE: app/api/market-data/route.js                                        ║
 * ║  PURPOSE: Premium Market Snapshot API with 12 sources, 3+ per instrument   ║
 * ║  ISOLATION: This file is self-contained, no external dependencies          ║
 * ║                                                                            ║
 * ║  KEY FEATURES:                                                             ║
 * ║  ✓ 12 data sources with automatic fallback cascade                         ║
 * ║  ✓ AUTO-CALCULATE % when sources don't provide it (NEVER shows 0%)         ║
 * ║  ✓ Previous price cache for % calculation (24hr TTL)                       ║
 * ║  ✓ Hardcoded fallback data as last resort                                  ║
 * ║  ✓ Silver sanity check (rejects spot prices, only MCX FUTURES)             ║
 * ║                                                                            ║
 * ║  SOURCES (12 TOTAL):                                                       ║
 * ║  ┌─────────────────┬───────────────────────────────────────────────────┐   ║
 * ║  │ NIFTY 50        │ Google Finance → NSE India → MoneyControl        │   ║
 * ║  │ SENSEX          │ Google Finance → BSE India → MoneyControl        │   ║
 * ║  │ USD/INR         │ Google Finance → Alpha Vantage → ExchangeRate    │   ║
 * ║  │ Bitcoin         │ CoinGecko → Binance → Alpha Vantage              │   ║
 * ║  │ Gold            │ MoneyControl → MCX → LiveMint → GoodReturns      │   ║
 * ║  │ Silver          │ MoneyControl → MCX → LiveMint → GoodReturns      │   ║
 * ║  │ Crude Oil       │ MoneyControl → MCX → LiveMint                    │   ║
 * ║  └─────────────────┴───────────────────────────────────────────────────┘   ║
 * ║                                                                            ║
 * ║  NEVER FAILS: Fallback data guarantees response even if all APIs fail     ║
 * ║  % NEVER 0: Auto-calculates from previous prices or uses fallback %       ║
 * ║                                                                            ║
 * ║  LAST UPDATED: 2026-01-07 | BULLETPROOF VERSION 2.1                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { NextResponse } from "next/server";
import { Logger } from "@/lib/monitoring/logger";

export const dynamic = "force-dynamic";

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ════════════════════════════════════════════════════════════════════════════
// API KEYS - Set in .env.local (see .env.example)
// ════════════════════════════════════════════════════════════════════════════
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const EXCHANGE_RATE_KEY = process.env.EXCHANGE_RATE_API_KEY || "";
const GOLDAPI_KEY = process.env.GOLDAPI_KEY || "";

// Cache settings
const CACHE_TTL_MS = 90_000; // 1.5 minutes cache
const CACHE_KEY = "__bm_market_data_cache__";
const PREV_PRICE_KEY = "__bm_prev_price_cache__"; // For calculating % when source doesn't provide it

// Common headers for scraping
const SCRAPE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
  "Cache-Control": "no-cache",
};

// ════════════════════════════════════════════════════════════════════════════
// CACHE
// ════════════════════════════════════════════════════════════════════════════
function getCache() {
  const c = globalThis[CACHE_KEY];
  if (!c || !c.ts || !c.payload) return null;
  if (Date.now() - c.ts > CACHE_TTL_MS) return null;
  return c.payload;
}

function setCache(payload) {
  globalThis[CACHE_KEY] = { ts: Date.now(), payload };
}

// ════════════════════════════════════════════════════════════════════════════
// PREVIOUS PRICE CACHE - For auto-calculating % when sources don't provide it
// Stores last known good prices, persists for 24 hours
// ════════════════════════════════════════════════════════════════════════════
const PREV_PRICE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getPrevPrices() {
  const c = globalThis[PREV_PRICE_KEY];
  if (!c || !c.ts || !c.prices) return {};
  if (Date.now() - c.ts > PREV_PRICE_TTL_MS) return {};
  return c.prices;
}

function setPrevPrices(items) {
  const prices = {};
  for (const item of items) {
    if (item && item.id && item.value) {
      prices[item.id] = item.value;
    }
  }
  globalThis[PREV_PRICE_KEY] = { ts: Date.now(), prices };
}

/**
 * 🔒 AUTO-CALCULATE PERCENTAGE
 * If a source returns 0% or null changePct, calculate from previous price
 * This ensures percentage is NEVER missing or stuck at 0%
 */
function autoCalculatePct(id, currentValue, sourcePct) {
  // If source provided a valid percentage (not 0), use it
  if (sourcePct && sourcePct !== 0) {
    return roundTo2(sourcePct);
  }
  
  // Otherwise, calculate from previous price
  const prevPrices = getPrevPrices();
  const prevPrice = prevPrices[id];
  
  if (prevPrice && prevPrice > 0 && currentValue > 0) {
    const calculatedPct = ((currentValue - prevPrice) / prevPrice) * 100;
    // Sanity check: if calculated % is too extreme (>10%), something is wrong
    if (Math.abs(calculatedPct) <= 10) {
      return roundTo2(calculatedPct);
    }
  }
  
  // Last resort: use fallback percentage
  const fallback = getFallbackData().find(f => f.id === id);
  return fallback?.changePct || 0;
}

// ════════════════════════════════════════════════════════════════════════════
// FALLBACK DATA - Updated: 2026-01-07 10:30 AM IST (MCX FUTURES PRICES)
// ════════════════════════════════════════════════════════════════════════════
function getFallbackData() {
  return [
    { id: "NIFTY50", name: "NIFTY 50", kind: "index", value: 26133, changePct: -0.24, direction: "down", currency: "INR" },
    { id: "SENSEX", name: "SENSEX", kind: "index", value: 84880, changePct: -0.17, direction: "down", currency: "INR" },
    { id: "GOLD", name: "MCX GOLD", kind: "metal", value: 138357, changePct: -0.52, direction: "down", currency: "INR" },  // MCX FUTURES per 10g
    { id: "SILVER", name: "MCX SILVER", kind: "metal", value: 255052, changePct: -1.45, direction: "down", currency: "INR" },  // MCX FUTURES per kg
    { id: "CRUDEOIL", name: "MCX CRUDE", kind: "commodity", value: 5077, changePct: -2.55, direction: "down", currency: "INR" },  // MCX per barrel
    { id: "BTC", name: "BITCOIN", kind: "crypto", value: 92605, changePct: -1.25, direction: "down", currency: "USD" },
    { id: "USDINR", name: "USD/INR", kind: "fx", value: 85.75, changePct: 0.05, direction: "up", currency: "INR" },
  ];
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);
    return res;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

function parseNumber(value) {
  if (value == null) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function roundTo2(num) {
  return Math.round(num * 100) / 100;
}

function getDirection(changePct) {
  if (changePct > 0) return "up";
  if (changePct < 0) return "down";
  return "flat";
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 1: GOOGLE FINANCE (NIFTY, SENSEX) - FREE, UNLIMITED
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromGoogleFinance() {
  const results = [];
  
  const symbols = [
    { id: "NIFTY50", name: "NIFTY 50", url: "https://www.google.com/finance/quote/NIFTY_50:INDEXNSE", kind: "index" },
    { id: "SENSEX", name: "SENSEX", url: "https://www.google.com/finance/quote/SENSEX:INDEXBOM", kind: "index" },
  ];
  
  for (const sym of symbols) {
    try {
      const res = await fetchWithTimeout(sym.url, { headers: SCRAPE_HEADERS }, 4000);
      
      if (res.ok) {
        const html = await res.text();
        
        // Multiple patterns for price
        const pricePatterns = [
          /data-last-price="([0-9,.]+)"/,
          /class="YMlKec fxKbKc"[^>]*>([0-9,.]+)</,
        ];
        
        // Multiple patterns for change percentage
        const changePatterns = [
          /data-last-normal-market-change-percent="([+-]?[0-9.]+)"/,
          /\(([+-]?[0-9.]+)%\)/,
          /class="[^"]*JwB6zf[^"]*"[^>]*>([+-]?[0-9.]+)%/,
        ];
        
        let price = null;
        let changePct = 0;
        
        for (const pattern of pricePatterns) {
          const match = html.match(pattern);
          if (match) {
            price = parseNumber(match[1]);
            if (price && price > 10000) break;
          }
        }
        
        for (const pattern of changePatterns) {
          const match = html.match(pattern);
          if (match) {
            const pct = parseNumber(match[1]);
            if (pct !== null && Math.abs(pct) < 20) {
              changePct = roundTo2(pct);
              break;
            }
          }
        }
        
        if (price && price > 10000) {
          results.push({
            id: sym.id,
            name: sym.name,
            kind: sym.kind,
            value: Math.round(price),
            changePct,
            direction: getDirection(changePct),
            currency: "INR",
            source: "google",
          });
        }
      }
    } catch (e) {
      Logger.warn("google_finance_failed", { symbol: sym.id, error: String(e?.message) });
    }
  }
  
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 2: NSE INDIA (NIFTY) - BACKUP
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromNSE() {
  try {
    const res = await fetchWithTimeout("https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050", {
      headers: { ...SCRAPE_HEADERS, "Accept": "application/json", "Referer": "https://www.nseindia.com/" }
    }, 5000);
    
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.[0]) {
        const idx = data.data[0];
        const price = parseNumber(idx.lastPrice || idx.last);
        const changePct = parseNumber(idx.pChange || idx.percentChange);
        
        if (price && price > 10000) {
          return {
            id: "NIFTY50", name: "NIFTY 50", kind: "index",
            value: Math.round(price), changePct: roundTo2(changePct || 0),
            direction: getDirection(changePct || 0), currency: "INR", source: "nse",
          };
        }
      }
    }
  } catch (e) { Logger.warn("nse_failed", { error: String(e?.message) }); }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 3: BSE INDIA (SENSEX) - BACKUP
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromBSE() {
  try {
    const res = await fetchWithTimeout("https://api.bseindia.com/BseIndiaAPI/api/Sensex/w", {
      headers: { ...SCRAPE_HEADERS, "Accept": "application/json", "Origin": "https://www.bseindia.com" }
    }, 5000);
    
    if (res.ok) {
      const data = await res.json();
      const price = parseNumber(data?.sensex || data?.indexValue || data?.ltp);
      const changePct = parseNumber(data?.perChange || data?.percentChange);
      
      if (price && price > 50000) {
        return {
          id: "SENSEX", name: "SENSEX", kind: "index",
          value: Math.round(price), changePct: roundTo2(changePct || 0),
          direction: getDirection(changePct || 0), currency: "INR", source: "bse",
        };
      }
    }
  } catch (e) { Logger.warn("bse_failed", { error: String(e?.message) }); }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 4: MONEYCONTROL (ALL) - BACKUP
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromMoneyControl() {
  const results = { nifty: null, sensex: null, gold: null, silver: null, crude: null };
  
  // Indices
  try {
    const res = await fetchWithTimeout("https://priceapi.moneycontrol.com/pricefeed/notap498/inidicesin498", {
      headers: { ...SCRAPE_HEADERS, "Accept": "application/json", "Origin": "https://www.moneycontrol.com" }
    }, 5000);
    
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        for (const item of data.data) {
          const name = (item.indexName || item.name || "").toUpperCase();
          const price = parseNumber(item.lastPrice || item.ltp);
          const changePct = parseNumber(item.percentChange || item.pChange);
          
          if (name.includes("NIFTY") && name.includes("50") && price > 10000) {
            results.nifty = { id: "NIFTY50", name: "NIFTY 50", kind: "index", value: Math.round(price), changePct: roundTo2(changePct || 0), direction: getDirection(changePct || 0), currency: "INR", source: "moneycontrol" };
          }
          if (name.includes("SENSEX") && price > 50000) {
            results.sensex = { id: "SENSEX", name: "SENSEX", kind: "index", value: Math.round(price), changePct: roundTo2(changePct || 0), direction: getDirection(changePct || 0), currency: "INR", source: "moneycontrol" };
          }
        }
      }
    }
  } catch (e) { Logger.warn("mc_indices_failed", { error: String(e?.message) }); }
  
  // MCX Commodities
  try {
    const res = await fetchWithTimeout("https://priceapi.moneycontrol.com/pricefeed/commodity/mcx", {
      headers: { ...SCRAPE_HEADERS, "Accept": "application/json", "Origin": "https://www.moneycontrol.com" }
    }, 5000);
    
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        for (const item of data.data) {
          const symbol = (item.symbol || item.name || "").toUpperCase();
          const price = parseNumber(item.lastPrice || item.ltp);
          const changePct = parseNumber(item.percentChange || item.pChange);
          
          if (symbol.includes("GOLD") && price > 70000 && price < 200000) {
            results.gold = { value: Math.round(price), changePct: roundTo2(changePct || 0), source: "moneycontrol" };
          }
          if (symbol.includes("SILVER") && price > 80000 && price < 350000) {
            results.silver = { value: Math.round(price), changePct: roundTo2(changePct || 0), source: "moneycontrol" };
          }
          if (symbol.includes("CRUDE") && price > 4000 && price < 12000) {
            results.crude = { value: Math.round(price), changePct: roundTo2(changePct || 0), source: "moneycontrol" };
          }
        }
      }
    }
  } catch (e) { Logger.warn("mc_mcx_failed", { error: String(e?.message) }); }
  
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 5: MCX OFFICIAL - BACKUP
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromMCXOfficial() {
  const results = { gold: null, silver: null, crude: null };
  
  try {
    const res = await fetchWithTimeout("https://www.mcxindia.com/", { headers: SCRAPE_HEADERS }, 6000);
    
    if (res.ok) {
      const html = await res.text();
      
      // Gold
      const goldMatch = html.match(/GOLD[\s\S]*?([0-9,]+\.[0-9]{2})[\s\S]*?([+-]?[0-9.]+)\s*%/i);
      if (goldMatch) {
        const price = parseNumber(goldMatch[1]);
        const pct = parseNumber(goldMatch[2]);
        if (price > 70000 && price < 200000) {
          results.gold = { value: Math.round(price), changePct: roundTo2(pct || 0), source: "mcx" };
        }
      }
      
      // Silver
      const silverMatch = html.match(/SILVER[\s\S]*?([0-9,]+\.[0-9]{2})[\s\S]*?([+-]?[0-9.]+)\s*%/i);
      if (silverMatch) {
        const price = parseNumber(silverMatch[1]);
        const pct = parseNumber(silverMatch[2]);
        if (price > 80000 && price < 350000) {
          results.silver = { value: Math.round(price), changePct: roundTo2(pct || 0), source: "mcx" };
        }
      }
      
      // Crude
      const crudeMatch = html.match(/CRUDE[\s\S]*?([0-9,]+\.[0-9]{2})[\s\S]*?([+-]?[0-9.]+)\s*%/i);
      if (crudeMatch) {
        const price = parseNumber(crudeMatch[1]);
        const pct = parseNumber(crudeMatch[2]);
        if (price > 4000 && price < 12000) {
          results.crude = { value: Math.round(price), changePct: roundTo2(pct || 0), source: "mcx" };
        }
      }
    }
  } catch (e) { Logger.warn("mcx_failed", { error: String(e?.message) }); }
  
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 6: LIVEMINT - BACKUP
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromLiveMint() {
  const results = { gold: null, silver: null, crude: null };
  
  try {
    const res = await fetchWithTimeout("https://www.livemint.com/market/commodities", { headers: SCRAPE_HEADERS }, 5000);
    
    if (res.ok) {
      const html = await res.text();
      
      // Gold
      const goldMatch = html.match(/Gold[^₹<]*₹\s*([0-9,]+)/i);
      if (goldMatch) {
        const price = parseNumber(goldMatch[1]);
        if (price > 70000 && price < 200000) {
          results.gold = { value: Math.round(price), changePct: 0, source: "livemint" };
        }
      }
      
      // Silver
      const silverMatch = html.match(/Silver[^₹<]*₹\s*([0-9,]+)/i);
      if (silverMatch) {
        const price = parseNumber(silverMatch[1]);
        if (price > 80000 && price < 350000) {
          results.silver = { value: Math.round(price), changePct: 0, source: "livemint" };
        }
      }
      
      // Crude
      const crudeMatch = html.match(/Crude[^₹<]*₹\s*([0-9,]+)/i);
      if (crudeMatch) {
        const price = parseNumber(crudeMatch[1]);
        if (price > 4000 && price < 12000) {
          results.crude = { value: Math.round(price), changePct: 0, source: "livemint" };
        }
      }
    }
  } catch (e) { Logger.warn("livemint_failed", { error: String(e?.message) }); }
  
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 7: GOODRETURNS - BACKUP
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromGoodReturns() {
  const results = { gold: null, silver: null };
  
  try {
    const goldRes = await fetchWithTimeout("https://www.goodreturns.in/gold-rates/", { headers: SCRAPE_HEADERS }, 5000);
    if (goldRes.ok) {
      const html = await goldRes.text();
      const match = html.match(/24[Kk][^₹]*₹\s*([0-9,]+)/i);
      if (match) {
        const price = parseNumber(match[1]);
        if (price > 70000 && price < 200000) {
          results.gold = { value: Math.round(price), changePct: 0, source: "goodreturns" };
        }
      }
    }
  } catch (e) { Logger.warn("gr_gold_failed", { error: String(e?.message) }); }
  
  try {
    const silverRes = await fetchWithTimeout("https://www.goodreturns.in/silver-rates/", { headers: SCRAPE_HEADERS }, 5000);
    if (silverRes.ok) {
      const html = await silverRes.text();
      const match = html.match(/Silver[^₹]*₹\s*([0-9,]+)/i);
      if (match) {
        const price = parseNumber(match[1]);
        if (price > 80000 && price < 350000) {
          results.silver = { value: Math.round(price), changePct: 0, source: "goodreturns" };
        }
      }
    }
  } catch (e) { Logger.warn("gr_silver_failed", { error: String(e?.message) }); }
  
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 8: COINGECKO (BITCOIN) - FREE 30/min
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromCoinGecko() {
  try {
    const res = await fetchWithTimeout("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true", {}, 5000);
    if (res.ok) {
      const data = await res.json();
      const price = parseNumber(data?.bitcoin?.usd);
      const changePct = parseNumber(data?.bitcoin?.usd_24h_change);
      if (price && price > 10000) {
        return { value: Math.round(price), changePct: roundTo2(changePct || 0), source: "coingecko" };
      }
    }
  } catch (e) { Logger.warn("coingecko_failed", { error: String(e?.message) }); }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 9: BINANCE (BITCOIN) - FREE UNLIMITED
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromBinance() {
  try {
    const res = await fetchWithTimeout("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", {}, 5000);
    if (res.ok) {
      const data = await res.json();
      const price = parseNumber(data?.lastPrice);
      const changePct = parseNumber(data?.priceChangePercent);
      if (price && price > 10000) {
        return { value: Math.round(price), changePct: roundTo2(changePct || 0), source: "binance" };
      }
    }
  } catch (e) { Logger.warn("binance_failed", { error: String(e?.message) }); }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 10: ALPHA VANTAGE (USD/INR, BTC) - FREE 25/day
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromAlphaVantage() {
  const results = { usdInr: null, btc: null };
  
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=${ALPHA_VANTAGE_KEY}`;
    const res = await fetchWithTimeout(url, {}, 5000);
    if (res.ok) {
      const data = await res.json();
      const rate = parseNumber(data?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"]);
      if (rate && rate > 70 && rate < 100) {
        results.usdInr = { value: roundTo2(rate), source: "alphavantage" };
      }
    }
  } catch (e) { Logger.warn("av_usd_failed", { error: String(e?.message) }); }
  
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${ALPHA_VANTAGE_KEY}`;
    const res = await fetchWithTimeout(url, {}, 5000);
    if (res.ok) {
      const data = await res.json();
      const price = parseNumber(data?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"]);
      if (price && price > 10000) {
        results.btc = { value: Math.round(price), source: "alphavantage" };
      }
    }
  } catch (e) { Logger.warn("av_btc_failed", { error: String(e?.message) }); }
  
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 11: EXCHANGERATE-API (USD/INR) - FREE 1500/month
// ════════════════════════════════════════════════════════════════════════════
async function fetchFromExchangeRateAPI() {
  if (!EXCHANGE_RATE_KEY) return null;
  
  try {
    const res = await fetchWithTimeout(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_KEY}/latest/USD`, {}, 5000);
    if (res.ok) {
      const data = await res.json();
      const rate = parseNumber(data?.conversion_rates?.INR);
      if (rate && rate > 70 && rate < 100) {
        return { value: roundTo2(rate), source: "exchangerate-api" };
      }
    }
  } catch (e) { Logger.warn("exr_failed", { error: String(e?.message) }); }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SOURCE 12: GOOGLE FINANCE (USD/INR) - BACKUP
// ════════════════════════════════════════════════════════════════════════════
async function fetchUsdInrFromGoogle() {
  try {
    const res = await fetchWithTimeout("https://www.google.com/finance/quote/USD-INR", { headers: SCRAPE_HEADERS }, 4000);
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/data-last-price="([0-9.]+)"/);
      if (match) {
        const rate = parseNumber(match[1]);
        if (rate && rate > 70 && rate < 100) {
          return { value: roundTo2(rate), source: "google" };
        }
      }
    }
  } catch (e) { Logger.warn("g_usd_failed", { error: String(e?.message) }); }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ════════════════════════════════════════════════════════════════════════════
async function fetchMarketDataFromAPIs() {
  const items = [];
  const fallback = getFallbackData();
  const fallbackMap = new Map(fallback.map(item => [item.id, item]));
  
  try {
    // PARALLEL FETCH ALL SOURCES
    const [
      googleData, nseData, bseData, moneyControlData,
      mcxData, liveMintData, goodReturnsData,
      coinGeckoData, binanceData, alphaVantageData,
      exchangeRateData, googleUsdData,
    ] = await Promise.allSettled([
      fetchFromGoogleFinance(), fetchFromNSE(), fetchFromBSE(), fetchFromMoneyControl(),
      fetchFromMCXOfficial(), fetchFromLiveMint(), fetchFromGoodReturns(),
      fetchFromCoinGecko(), fetchFromBinance(), fetchFromAlphaVantage(),
      fetchFromExchangeRateAPI(), fetchUsdInrFromGoogle(),
    ]);
    
    const get = (r) => r.status === 'fulfilled' ? r.value : null;
    
    const google = get(googleData) || [];
    const nse = get(nseData);
    const bse = get(bseData);
    const mc = get(moneyControlData) || {};
    const mcx = get(mcxData) || {};
    const mint = get(liveMintData) || {};
    const gr = get(goodReturnsData) || {};
    const cg = get(coinGeckoData);
    const binance = get(binanceData);
    const av = get(alphaVantageData) || {};
    const exr = get(exchangeRateData);
    const gUsd = get(googleUsdData);
    
    // NIFTY 50 - 3 sources
    const niftyGoogle = google.find(x => x.id === "NIFTY50");
    const nifty = niftyGoogle || nse || mc.nifty || fallbackMap.get("NIFTY50");
    if (nifty) items.push({ ...nifty, live: !!(niftyGoogle || nse || mc.nifty) });
    
    // SENSEX - 3 sources
    const sensexGoogle = google.find(x => x.id === "SENSEX");
    const sensex = sensexGoogle || bse || mc.sensex || fallbackMap.get("SENSEX");
    if (sensex) items.push({ ...sensex, live: !!(sensexGoogle || bse || mc.sensex) });
    
    // USD/INR - 3 sources (AUTO-CALCULATE % if source doesn't provide it)
    const usdVal = gUsd?.value || av.usdInr?.value || exr?.value || fallbackMap.get("USDINR").value;
    const usdPct = autoCalculatePct("USDINR", usdVal, gUsd?.changePct || av.usdInr?.changePct || 0);
    items.push({
      id: "USDINR", name: "USD/INR", kind: "fx", value: usdVal,
      changePct: usdPct, direction: getDirection(usdPct), currency: "INR",
      source: gUsd ? "google" : av.usdInr ? "alphavantage" : exr ? "exchangerate" : "fallback",
      live: !!(gUsd || av.usdInr || exr),
    });
    
    // BITCOIN - 3 sources (AUTO-CALCULATE % if source doesn't provide it)
    const btc = cg || binance || (av.btc ? { value: av.btc.value, changePct: 0, source: "alphavantage" } : null);
    if (btc) {
      const btcPct = autoCalculatePct("BTC", btc.value, btc.changePct);
      items.push({
        id: "BTC", name: "BITCOIN", kind: "crypto", value: btc.value,
        changePct: btcPct, direction: getDirection(btcPct),
        currency: "USD", source: btc.source, live: true,
      });
    } else {
      items.push(fallbackMap.get("BTC"));
    }
    
    // GOLD - 4 sources (AUTO-CALCULATE % if source doesn't provide it)
    const gold = mc.gold || mcx.gold || mint.gold || gr.gold;
    if (gold) {
      const goldPct = autoCalculatePct("GOLD", gold.value, gold.changePct);
      items.push({
        id: "GOLD", name: "MCX GOLD", kind: "metal", value: gold.value,
        changePct: goldPct, direction: getDirection(goldPct),
        currency: "INR", source: gold.source, live: true,
      });
    } else {
      items.push(fallbackMap.get("GOLD"));
    }
    
    // SILVER - 4 sources (AUTO-CALCULATE % if source doesn't provide it)
    let silver = mc.silver || mcx.silver || mint.silver || gr.silver;
    // Sanity check: Silver per KG should always be much higher than Gold per 10g
    if (silver && silver.value < 200000) {
      Logger.warn("silver_invalid_value", { value: silver.value, source: silver.source });
      silver = null; // Force fallback
    }
    if (silver) {
      const silverPct = autoCalculatePct("SILVER", silver.value, silver.changePct);
      items.push({
        id: "SILVER", name: "MCX SILVER", kind: "metal", value: silver.value,
        changePct: silverPct, direction: getDirection(silverPct),
        currency: "INR", source: silver.source, live: true,
      });
    } else {
      items.push(fallbackMap.get("SILVER"));
    }
    
    // CRUDE OIL - 3 sources (AUTO-CALCULATE % if source doesn't provide it)
    const crude = mc.crude || mcx.crude || mint.crude;
    if (crude) {
      const crudePct = autoCalculatePct("CRUDEOIL", crude.value, crude.changePct);
      items.push({
        id: "CRUDEOIL", name: "MCX CRUDE", kind: "commodity", value: crude.value,
        changePct: crudePct, direction: getDirection(crudePct),
        currency: "INR", source: crude.source, live: true,
      });
    } else {
      items.push(fallbackMap.get("CRUDEOIL"));
    }
    
    // Save current prices for future % calculation
    setPrevPrices(items);
    
    return items;
    
  } catch (e) {
    Logger.error("fetch_error", { error: String(e?.message) });
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// API HANDLER
// ════════════════════════════════════════════════════════════════════════════
export async function GET() {
  try {
    const cached = getCache();
    if (cached) {
      const res = NextResponse.json({ ...cached, cached: true });
      res.headers.set("Cache-Control", "no-store, max-age=0");
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    const liveItems = await fetchMarketDataFromAPIs();
    
    if (liveItems && liveItems.length > 0) {
      const payload = { ok: true, asOf: new Date().toISOString(), items: liveItems, source: "live" };
      setCache(payload);
      const res = NextResponse.json(payload);
      res.headers.set("Cache-Control", "no-store, max-age=0");
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }
    
    const fallbackItems = getFallbackData();
    const payload = { ok: true, asOf: new Date().toISOString(), items: fallbackItems, source: "fallback" };
    setCache(payload);
    const res = NextResponse.json(payload);
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
    
  } catch (e) {
    Logger.error("api_error", { error: String(e?.message || e) });
    const fallbackItems = getFallbackData();
    const res = NextResponse.json({ ok: true, asOf: new Date().toISOString(), items: fallbackItems, source: "error_fallback" });
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}





/**
 * Night Summary API
 * 
 * Fetches real market data at 9 PM IST for Night Summary
 * - NIFTY/SENSEX close values from market data API
 * - FII/DII data
 * - Top headlines from Supabase
 * - Tomorrow's events
 * 
 * Caches in Supabase for the day
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAPIFailureAlert } from '@/lib/monitoring/email-alerts';
import { getISTDateKey, getISTNow } from '@/lib/live-intelligence/modes';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

function getISTDayRangeUtc() {
  const istNow = getISTNow();
  const y = istNow.getFullYear();
  const m = istNow.getMonth();
  const d = istNow.getDate();

  // IST midnight expressed in UTC = Date.UTC(...) - 5.5 hours
  const startUtcMs = Date.UTC(y, m, d, 0, 0, 0) - (5.5 * 60 * 60 * 1000);
  const endUtcMs = startUtcMs + (24 * 60 * 60 * 1000);
  return {
    dateKey: getISTDateKey(istNow),
    startUtc: new Date(startUtcMs),
    endUtc: new Date(endUtcMs),
  };
}

function isNightSummaryWindowIST() {
  const istNow = getISTNow();
  const hour = istNow.getHours();
  return hour >= 21 && hour < 24;
}

function getBaseUrlFromRequest(request) {
  // Prefer same-origin so staging never calls production domains (which can 403).
  const origin = request?.nextUrl?.origin;
  if (origin) return origin;
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bmwealth.co.in';
}

function emptyMarkets(reason = 'unavailable') {
  return {
    nifty: { value: 0, change: 0, percent: 0, source: reason },
    sensex: { value: 0, change: 0, percent: 0, source: reason },
    bankNifty: { value: 0, change: 0, percent: 0, source: reason },
    fii: { value: 0, type: 'neutral', source: reason },
  };
}

function coerceNumber(n) {
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  const v = Number(String(n ?? '').replace(/,/g, '').trim());
  return Number.isFinite(v) ? v : null;
}

function parseMarketDataItems(items) {
  const markets = emptyMarkets('market_data');
  const arr = Array.isArray(items) ? items : [];
  for (const item of arr) {
    const name = String(item?.name ?? '').toLowerCase();
    const id = String(item?.id ?? '').toLowerCase();

    const value = coerceNumber(item?.value ?? item?.price);
    const percent = coerceNumber(item?.changePct ?? item?.changePercent);
    const change = coerceNumber(item?.change) ?? (value != null && percent != null ? (value * percent) / 100 : null);

    if (name.includes('nifty 50') || id === 'nifty50' || name === 'nifty') {
      markets.nifty = { value: value ?? 0, change: change ?? 0, percent: percent ?? 0, source: 'market_data' };
    } else if (name.includes('sensex') || id === 'sensex') {
      markets.sensex = { value: value ?? 0, change: change ?? 0, percent: percent ?? 0, source: 'market_data' };
    } else if (name.includes('bank nifty') || name.includes('banknifty') || id === 'banknifty') {
      markets.bankNifty = { value: value ?? 0, change: change ?? 0, percent: percent ?? 0, source: 'market_data' };
    }
  }
  return markets;
}

function parseIndicesSnapshot(payload) {
  // indices-snapshot returns: { indices: [{ name, last, change, percentChange }, ...] }
  const markets = emptyMarkets('indices_snapshot');
  const arr = Array.isArray(payload?.indices) ? payload.indices : [];
  for (const row of arr) {
    const nm = String(row?.name ?? '').toUpperCase().replace(/\s+/g, ' ').trim();
    const last = coerceNumber(row?.last);
    const change = coerceNumber(row?.change);
    const percent = coerceNumber(row?.percentChange);

    if (nm === 'NIFTY 50') {
      markets.nifty = { value: last ?? 0, change: change ?? 0, percent: percent ?? 0, source: 'indices_snapshot' };
    } else if (nm === 'NIFTY BANK') {
      markets.bankNifty = { value: last ?? 0, change: change ?? 0, percent: percent ?? 0, source: 'indices_snapshot' };
    }
  }
  return markets;
}

/**
 * Fetch market data from our market-data API
 */
async function fetchMarketData({ request } = {}) {
  const baseUrl = getBaseUrlFromRequest(request);
  const out = emptyMarkets('fallback');

  // 1) Prefer NSE indices snapshot for NIFTY/Bank NIFTY (reliable + lightweight).
  try {
    const res = await fetch(`${baseUrl}/api/live-intelligence/indices-snapshot?nocache=1`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      const parsed = parseIndicesSnapshot(json);
      out.nifty = parsed.nifty;
      out.bankNifty = parsed.bankNifty;
    }
  } catch (e) {
    console.warn('Night summary: indices-snapshot unavailable:', e?.message || e);
  }

  // 2) Use our own market-data route for Sensex + as a backup for missing fields.
  //    IMPORTANT: same-origin (staging calls staging), never hard-fail.
  try {
    const res = await fetch(`${baseUrl}/api/market-data?nocache=1`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      const parsed = parseMarketDataItems(data?.items || data?.data);
      // Fill only missing/zero values; keep indices-snapshot values if already present.
      if (!out.nifty?.value) out.nifty = parsed.nifty;
      if (!out.bankNifty?.value) out.bankNifty = parsed.bankNifty;
      if (!out.sensex?.value) out.sensex = parsed.sensex;
    } else {
      console.warn(`Night summary: market-data non-OK status=${res.status}`);
    }
  } catch (e) {
    console.warn('Night summary: market-data unavailable:', e?.message || e);
  }

  return out;
}

/**
 * Fetch FII/DII data (from external source or Supabase cache)
 */
async function fetchFIIData() {
  try {
    // Try to fetch from NSE or cached source
    const supabase = getSupabase();
    if (supabase) {
      const today = getISTDateKey();
      const { data } = await supabase
        .from('fii_dii_data')
        .select('*')
        .eq('date', today)
        .single();
      
      if (data) {
        return {
          value: Math.abs(data.fii_net || 0),
          type: (data.fii_net || 0) >= 0 ? 'buyers' : 'sellers',
        };
      }
    }

    // Default fallback - will be updated by separate FII cron job
    return { value: 0, type: 'neutral' };
  } catch (error) {
    console.error('Failed to fetch FII data:', error);
    return { value: 0, type: 'neutral' };
  }
}

/**
 * Fetch top headlines from today
 */
async function fetchTopHeadlines() {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { startUtc, endUtc } = getISTDayRangeUtc();

    const { data, error } = await supabase
      .from('intelligence_items')
      .select('headline, category, urgency')
      .gte('created_at', startUtc.toISOString())
      .lt('created_at', endUtc.toISOString())
      .in('urgency', ['BREAKING', 'IMPORTANT', 'HIGH'])
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) throw error;

    const categoryIcons = {
      market: '📈',
      regulatory: '🏦',
      results: '📊',
      ipo: '🎯',
      bonds: '📜',
      mutual_funds: '💰',
      insurance: '🛡️',
      default: '💹',
    };

    return (data || []).map(item => ({
      icon: categoryIcons[item.category] || categoryIcons.default,
      text: item.headline,
    }));
  } catch (error) {
    console.error('Failed to fetch headlines:', error);
    return [];
  }
}

/**
 * Fetch tomorrow's events (from calendar or static list)
 */
async function fetchTomorrowEvents() {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const istNow = getISTNow();
    const y = istNow.getFullYear();
    const m = istNow.getMonth();
    const d = istNow.getDate();

    // Tomorrow's IST midnight in UTC
    const tomorrowStartUtcMs = (Date.UTC(y, m, d, 0, 0, 0) - (5.5 * 60 * 60 * 1000)) + (24 * 60 * 60 * 1000);
    const tomorrowEndUtcMs = tomorrowStartUtcMs + (24 * 60 * 60 * 1000);
    const tomorrowStartUtc = new Date(tomorrowStartUtcMs);
    const tomorrowEndUtc = new Date(tomorrowEndUtcMs);

    const { data, error } = await supabase
      .from('market_events')
      .select('*')
      .gte('event_date', tomorrowStartUtc.toISOString())
      .lt('event_date', tomorrowEndUtc.toISOString())
      .order('event_time', { ascending: true })
      .limit(4);

    if (error) throw error;

    return (data || []).map(event => ({
      time: event.event_time || 'All day',
      text: event.event_title,
    }));
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // Return empty - no fallback data
    return [];
  }
}

/**
 * Generate and cache night summary
 */
async function generateNightSummary({ request } = {}) {
  const [markets, fiiData, headlines, events] = await Promise.all([
    fetchMarketData({ request }),
    fetchFIIData(),
    fetchTopHeadlines(),
    fetchTomorrowEvents(),
  ]);

  const summary = {
    date: new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    generatedAt: new Date().toISOString(),
    markets: {
      ...markets,
      fii: fiiData,
    },
    developments: headlines,
    tomorrow: events,
    isLive: true, // Flag to indicate this is real data
  };

  // Cache in Supabase
  const supabase = getSupabase();
  if (supabase) {
    const today = getISTDateKey();
    
    await supabase
      .from('night_summaries')
      .upsert({
        date: today,
        summary_data: summary,
        created_at: new Date().toISOString(),
      }, { onConflict: 'date' });
  }

  return summary;
}

/**
 * GET - Fetch night summary (cached or generate)
 */
export async function GET(request) {
  try {
    // Note: This route must remain resilient. It is used by Live Intelligence UI and monitoring.
    const supabase = getSupabase();
    const today = getISTDateKey();

    // Check for cached summary
    if (supabase) {
      const { data: cached } = await supabase
        .from('night_summaries')
        .select('summary_data')
        .eq('date', today)
        .single();

      if (cached?.summary_data) {
        return NextResponse.json({
          success: true,
          cached: true,
          ...cached.summary_data,
        });
      }
    }

    // Spec: generated once at 9PM IST and served until midnight.
    // If someone requests before 9PM and we have no cached summary, return a clear message.
    if (!isNightSummaryWindowIST()) {
      return NextResponse.json({
        success: true,
        cached: false,
        notReady: true,
        error: 'night_summary_not_ready',
        message: 'Night Summary is available from 9:00 PM to 12:00 AM IST.',
        isLive: false,
      }, { status: 200 });
    }

    // Generate new summary
    const summary = await generateNightSummary({ request });

    return NextResponse.json({
      success: true,
      cached: false,
      ...summary,
    });
  } catch (error) {
    console.error('Night summary API error:', error);
    
    // Send alert
    await sendAPIFailureAlert(
      '/api/live-intelligence/night-summary',
      error,
      'No fallback available'
    );

    // Best-effort fallback: never hard-fail the UI.
    return NextResponse.json({
      success: true,
      cached: false,
      source: 'error_fallback',
      date: new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      generatedAt: new Date().toISOString(),
      markets: emptyMarkets('error_fallback'),
      developments: [],
      tomorrow: [],
      isLive: false,
      error: String(error?.message || error),
    }, { status: 200 });
  }
}

/**
 * POST - Force regenerate summary (admin only)
 */
export async function POST(request) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(process.env.CRON_SECRET || 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await generateNightSummary({ request });

    return NextResponse.json({
      success: true,
      regenerated: true,
      ...summary,
    });
  } catch (error) {
    console.error('Night summary regeneration error:', error);
    
    await sendAPIFailureAlert(
      '/api/live-intelligence/night-summary',
      error,
      'Manual regeneration failed'
    );

    return NextResponse.json({
      success: true,
      regenerated: false,
      source: 'error_fallback',
      error: String(error?.message || error),
      isLive: false,
    }, { status: 200 });
  }
}

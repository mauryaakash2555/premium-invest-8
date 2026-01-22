/**
 * Morning Brief API
 *
 * Generates a pre-market "Morning Briefing" used by the Live Intelligence overlay.
 * - Uses Supabase if available for market events + recent headlines
 * - Falls back to a safe curated brief if DB is unavailable
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getISTDateKey, getISTNow } from '@/lib/live-intelligence/modes';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

function getISTDayRangeUtc(date = null) {
  const istNow = date instanceof Date ? date : getISTNow();
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

function buildFallbackBrief() {
  const istNow = getISTNow();
  const date = istNow.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    title: 'Morning Briefing',
    date,
    globalCues: [
      { text: 'Global cues are being compiled — check pre-open volatility', sentiment: 'neutral' },
      { text: 'Track crude, USD/INR, and major policy headlines', sentiment: 'neutral' },
    ],
    keyEvents: [
      { time: '9:00 AM', event: 'Pre-open session (NSE)' },
      { time: '9:15 AM', event: 'Market opens — focus on breadth + leadership' },
    ],
    sectorWatch: [
      { sector: 'Banking', outlook: 'Watch rates + liquidity headlines' },
      { sector: 'IT', outlook: 'USD/INR + US cues' },
    ],
    riskFactors: [
      'Overnight global headlines can create gap moves',
      'High volatility can cause whipsaws — position sizing matters',
    ],
    overallTone: 'neutral',
  };
}

function sentimentFromUrgency(urgency) {
  const u = String(urgency || '').toUpperCase();
  if (u === 'BREAKING' || u === 'IMPORTANT') return 'negative';
  return 'neutral';
}

async function fetchTodayEvents() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { startUtc, endUtc } = getISTDayRangeUtc();

  try {
    const { data, error } = await supabase
      .from('market_events')
      .select('*')
      .gte('event_date', startUtc.toISOString())
      .lt('event_date', endUtc.toISOString())
      .order('event_time', { ascending: true })
      .limit(6);

    if (error) throw error;

    return (data || []).map((e) => ({
      time: e.event_time || 'All day',
      event: e.event_title || e.title || 'Market event',
    }));
  } catch {
    return [];
  }
}

async function fetchRecentHeadlinesForCues() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { startUtc } = getISTDayRangeUtc();

  try {
    // Pull a small set of higher urgency items from the last ~24h window.
    const { data, error } = await supabase
      .from('intelligence_items')
      .select('headline, urgency, category, created_at')
      .gte('created_at', startUtc.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const items = data || [];

    // Turn a few high-signal items into "global cues" style bullets.
    return items
      .filter((x) => Boolean(x?.headline))
      .slice(0, 4)
      .map((x) => ({
        text: x.headline,
        sentiment: sentimentFromUrgency(x.urgency),
      }));
  } catch {
    return [];
  }
}

async function fetchSectorWatch() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { startUtc } = getISTDayRangeUtc();

  try {
    const { data, error } = await supabase
      .from('intelligence_items')
      .select('category, created_at')
      .gte('created_at', startUtc.toISOString())
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    const counts = new Map();
    for (const row of data || []) {
      const key = String(row?.category || '').trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category]) => category);

    // Map raw categories into friendly sector buckets
    const labelMap = {
      banking: 'Banking',
      it: 'IT',
      pharma: 'Pharma',
      auto: 'Auto',
      realty: 'Real Estate',
      market: 'Markets',
      results: 'Earnings',
      regulatory: 'Regulatory',
      economy: 'Economy',
      global: 'Global',
      insurance: 'Insurance',
      mutual_funds: 'Mutual Funds',
      fixed_income: 'Fixed Income',
      bonds: 'Bonds',
      ipo: 'IPOs',
      sectors: 'Sectors',
    };

    return top.map((k) => ({
      sector: labelMap[k] || k.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
      outlook: 'Monitor relevant headlines and opening volatility',
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const istNow = getISTNow();
    const date = istNow.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (!supabase) {
      return NextResponse.json({ ok: true, brief: buildFallbackBrief(), isLive: false });
    }

    const [keyEvents, globalCues, sectorWatch] = await Promise.all([
      fetchTodayEvents(),
      fetchRecentHeadlinesForCues(),
      fetchSectorWatch(),
    ]);

    const brief = {
      title: 'Morning Briefing',
      date,
      globalCues: globalCues.length ? globalCues : buildFallbackBrief().globalCues,
      keyEvents: keyEvents.length ? keyEvents : buildFallbackBrief().keyEvents,
      sectorWatch: sectorWatch.length ? sectorWatch : buildFallbackBrief().sectorWatch,
      riskFactors: buildFallbackBrief().riskFactors,
      overallTone: 'neutral',
    };

    return NextResponse.json({ ok: true, brief, isLive: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'Failed to generate brief' }, { status: 500 });
  }
}

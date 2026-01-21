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

/**
 * Fetch market data from our market-data API
 */
async function fetchMarketData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bmwealth.co.in';
    const response = await fetch(`${baseUrl}/api/market-data`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Market data API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Parse market data - API returns { items: [...] } with value/changePct fields
    const markets = {
      nifty: { value: 0, change: 0, percent: 0 },
      sensex: { value: 0, change: 0, percent: 0 },
      bankNifty: { value: 0, change: 0, percent: 0 },
      fii: { value: 0, type: 'buyers' },
    };

    // Support both legacy 'data' and new 'items' response format
    const items = data.items || data.data || [];
    if (Array.isArray(items)) {
      for (const item of items) {
        const name = item.name?.toLowerCase() || '';
        const id = item.id?.toLowerCase() || '';
        // Get value from either 'value' or 'price' field
        const value = parseFloat(item.value ?? item.price) || 0;
        // Get percent from either 'changePct' or 'changePercent' field
        const percent = parseFloat(item.changePct ?? item.changePercent) || 0;
        // Estimate change from value and percent if not provided
        const change = parseFloat(item.change) || (value * percent / 100);
        
        if (name.includes('nifty 50') || id === 'nifty50' || name === 'nifty') {
          markets.nifty = { value, change, percent };
        } else if (name.includes('sensex') || id === 'sensex') {
          markets.sensex = { value, change, percent };
        } else if (name.includes('bank nifty') || name.includes('banknifty') || id === 'banknifty') {
          markets.bankNifty = { value, change, percent };
        }
      }
    }

    return markets;
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    throw error;
  }
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
async function generateNightSummary() {
  const [markets, fiiData, headlines, events] = await Promise.all([
    fetchMarketData(),
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
export async function GET() {
  try {
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
        success: false,
        error: 'night_summary_not_ready',
        message: 'Night Summary is available from 9:00 PM to 12:00 AM IST.',
        isLive: false,
      }, { status: 404 });
    }

    // Generate new summary
    const summary = await generateNightSummary();

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

    return NextResponse.json({
      success: false,
      error: 'Failed to generate night summary',
      message: 'Unable to load market summary. Please try again.',
      isLive: false,
    }, { status: 500 });
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

    const summary = await generateNightSummary();

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
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

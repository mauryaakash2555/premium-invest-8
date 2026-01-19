/**
 * Live Intelligence Public Feed API
 * 
 * Returns filtered, sorted headlines for the frontend display
 * - Filters out expired headlines (valid_until check)
 * - Enforces category balance (max 2 consecutive from same category)
 * - Sorts by priority score
 * 
 * @file app/api/live-intelligence/feed/route.js
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CURATED_HEADLINES, getHeadlinesByCategory } from '@/lib/live-intelligence/headlines';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

// Urgency level weights for priority calculation
const URGENCY_WEIGHTS = {
  BREAKING: 100,
  MARKET_MOVE: 80,
  REGULATORY: 70,
  OPPORTUNITY: 60,
  HIGH: 50,
  MEDIUM: 40,
  REGULAR: 30,
  LOW: 20,
  ROUTINE: 10,
};

// Category priority weights
const CATEGORY_WEIGHTS = {
  market_update: 10,
  market_move: 10,
  regulatory: 8,
  opportunity: 7,
  rbi: 6,
  sebi: 6,
  portfolio_tip: 5,
  tax_insight: 4,
  global: 3,
};

/**
 * Calculate priority score for a headline
 * Priority = (Urgency × 3) + (Recency × 2) + (Category_Weight × 1)
 */
function calculatePriority(headline) {
  const now = Date.now();
  
  // Urgency component
  const urgency = URGENCY_WEIGHTS[headline.urgency?.toUpperCase()] || 30;
  
  // Recency component (higher = more recent, max 60 for items < 1 hour old)
  const timestamp = new Date(headline.created_at || headline.timestamp);
  const ageMinutes = (now - timestamp.getTime()) / 60000;
  const recency = Math.max(0, 60 - ageMinutes);
  
  // Category weight component
  const categoryWeight = CATEGORY_WEIGHTS[headline.category] || 5;
  
  return (urgency * 3) + (recency * 2) + categoryWeight;
}

/**
 * Filter out expired headlines
 * A headline is expired if:
 * 1. valid_until is set and in the past
 * 2. OR it's older than 24 hours (to prevent stale data)
 */
function filterExpired(headlines) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  return headlines.filter(h => {
    // Check valid_until expiry
    if (h.valid_until) {
      const expiryDate = new Date(h.valid_until);
      if (expiryDate <= now) return false;
    }
    
    // Check freshness - headlines older than 24 hours are stale
    if (h.created_at) {
      const createdAt = new Date(h.created_at);
      if (createdAt < oneDayAgo) return false;
    }
    
    return true;
  });
}

/**
 * Enforce category balance in rotation
 * Max 2 consecutive headlines from the same category
 */
function enforceCategoryBalance(headlines) {
  if (headlines.length <= 2) return headlines;
  
  const result = [];
  const remaining = [...headlines];
  
  while (remaining.length > 0) {
    // Get the last two categories in result
    const lastCats = result.slice(-2).map(h => h.category);
    
    // Find the first headline that doesn't continue the streak
    let foundIndex = -1;
    
    if (lastCats.length >= 2 && lastCats[0] === lastCats[1]) {
      // We have 2 consecutive same-category items, force a different one
      foundIndex = remaining.findIndex(h => h.category !== lastCats[0]);
    }
    
    if (foundIndex === -1) {
      // No streak issue or no different category available, take the first one
      foundIndex = 0;
    }
    
    // Move the item from remaining to result
    result.push(remaining.splice(foundIndex, 1)[0]);
  }
  
  return result;
}

/**
 * GET - Fetch headlines for frontend display
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    
    const supabase = getSupabase();
    
    // Use curated headlines if database unavailable
    if (!supabase) {
      console.warn('Live Intelligence feed: Database unavailable, using curated content');
      const curatedHeadlines = getCuratedHeadlines(category);
      return NextResponse.json({
        ok: true,
        headlines: curatedHeadlines,
        source: 'curated',
        count: curatedHeadlines.length,
      });
    }
    
    // Fetch from headlines table (cron-populated from RSS feeds)
    let headlinesQuery = supabase
      .from('headlines')
      .select('*')
      .eq('is_sebi_safe', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    // Fetch from intelligence_items (legacy auto-generated from RSS)
    let autoQuery = supabase
      .from('intelligence_items')
      .select('*')
      .eq('status', 'processed')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Fetch from live_intelligence_headlines (admin-created)
    let adminQuery = supabase
      .from('live_intelligence_headlines')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Apply category filter if specified
    if (category && category !== 'all') {
      headlinesQuery = headlinesQuery.eq('category', category);
      autoQuery = autoQuery.eq('category', category);
      adminQuery = adminQuery.eq('category', category);
    }
    
    // Execute queries with error handling
    const safeQuery = async (query) => {
      try {
        const result = await query;
        return result;
      } catch (e) {
        return { data: [], error: e };
      }
    };
    
    const [headlinesResult, autoResult, adminResult] = await Promise.all([
      safeQuery(headlinesQuery),
      safeQuery(autoQuery),
      safeQuery(adminQuery),
    ]);
    
    // Combine headlines from all sources
    const combined = [
      // Headlines table (main source - cron-populated)
      ...(headlinesResult.data || []).map(item => ({
        id: item.id,
        category: item.category || 'market_update',
        icon: getCategoryIcon(item.category),
        headline: item.title,
        whyItMatters: item.why_it_matters || item.summary,
        dataPoint: item.data_point || '',
        urgency: item.urgency || 'REGULAR',
        timestamp: item.published_at || item.created_at,
        created_at: item.created_at,
        source: item.source,
        valid_until: item.valid_until,
        type: 'headlines',
        url: item.url,
      })),
      // Intelligence items (legacy)
      ...(autoResult.data || []).map(item => ({
        id: item.id,
        category: item.category || 'market_update',
        icon: getCategoryIcon(item.category),
        headline: item.block_what_happened,
        whyItMatters: item.block_why_it_matters,
        dataPoint: item.block_where_fits,
        urgency: item.urgency || 'REGULAR',
        timestamp: item.created_at,
        created_at: item.created_at,
        source: item.source_name,
        valid_until: item.valid_until,
        type: 'auto',
      })),
      ...(adminResult.data || []).map(item => ({
        id: item.id,
        category: item.category || 'market_update',
        icon: getCategoryIcon(item.category),
        headline: item.headline,
        whyItMatters: item.why_it_matters,
        dataPoint: item.data_point,
        urgency: item.urgency || 'REGULAR',
        timestamp: item.created_at,
        created_at: item.created_at,
        source: item.source,
        valid_until: item.valid_until,
        type: 'admin',
      })),
    ];
    
    // Step 1: Filter expired headlines (includes 24hr freshness check)
    const notExpired = filterExpired(combined);
    const staleCount = combined.length - notExpired.length;
    
    // If ALL headlines are stale (older than 24h), show a warning
    if (notExpired.length === 0 && combined.length > 0) {
      console.warn('[Live Intelligence] All headlines are stale (older than 24h). Database needs fresh content.');
    }
    
    // Step 2: Sort by priority
    const sorted = notExpired.sort((a, b) => {
      return calculatePriority(b) - calculatePriority(a);
    });
    
    // Step 3: Enforce category balance
    const balanced = enforceCategoryBalance(sorted);
    
    // Step 4: Apply limit
    const final = balanced.slice(0, limit);
    
    // If no headlines available, fallback to curated content
    if (final.length === 0) {
      console.log('[Live Intelligence] No fresh headlines in database, using curated fallback');
      const curatedHeadlines = getCuratedHeadlines(category);
      return NextResponse.json({
        ok: true,
        headlines: curatedHeadlines,
        source: 'curated',
        count: curatedHeadlines.length,
        stats: {
          total_fetched: combined.length,
          stale_filtered: staleCount,
          fresh_remaining: 0,
          returned: curatedHeadlines.length,
          warning: 'No fresh headlines in database - showing curated content',
        },
      });
    }
    
    return NextResponse.json({
      ok: true,
      headlines: final,
      source: 'database',
      count: final.length,
      stats: {
        total_fetched: combined.length,
        stale_filtered: staleCount,
        fresh_remaining: notExpired.length,
        returned: final.length,
        warning: staleCount > 0 ? `${staleCount} headlines filtered (expired or older than 24h)` : null,
      },
    });
  } catch (error) {
    console.error('Live Intelligence feed error:', error);
    
    // Use curated headlines on error
    const curated = getCuratedHeadlines('all');
    return NextResponse.json({
      ok: true,
      headlines: curated,
      source: 'curated',
      count: curated.length,
      warning: error.message,
    });
  }
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
  const icons = {
    market_update: '📊',
    market_move: '📈',
    regulatory: '⚖️',
    opportunity: '💎',
    rbi: '🏦',
    sebi: '📋',
    portfolio_tip: '💡',
    tax_insight: '💰',
    global: '🌐',
  };
  return icons[category] || '📰';
}

/**
 * Curated headlines - use rich content from lib/live-intelligence/headlines.js
 * These are real, factual, SEBI-safe headlines (not placeholder data)
 */
function getCuratedHeadlines(category) {
  // Use the comprehensive curated headlines from lib
  let headlines = CURATED_HEADLINES.map(h => ({
    ...h,
    // Ensure fresh timestamp for curated items
    timestamp: h.timestamp || new Date().toISOString(),
    icon: h.icon || getCategoryIcon(h.category),
  }));
  
  if (category && category !== 'all') {
    headlines = headlines.filter(h => h.category === category);
  }
  
  // Return first 20 headlines, sorted by priority
  return headlines.slice(0, 20);
}

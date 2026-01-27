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
import { normalizeCategoryToSpec } from '@/lib/live-intelligence/headlines';
import { getCurrentMode } from '@/lib/modes';
import { dedupeHeadlines, enrichHeadline } from '@/lib/live-intelligence/intelligenceScoring';

// Strict mode: no curated/dummy fallbacks.
const ALLOW_CURATED_FALLBACK = false;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Spec (Jan 21, 2026): headlines cached 5 minutes
export const revalidate = 300;

// This route reads request-scoped data (query params) and must not be statically optimized.
export const dynamic = 'force-dynamic';

const FEED_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

const MAX_ROTATION_HEADLINES = 15;
const GLOBAL_WATCH_MAX = 5;
const MIN_ROTATION_HEADLINES = 5;

// Urgency level weights for priority calculation
const URGENCY_WEIGHTS = {
  BREAKING: 100,
  IMPORTANT: 50,
  PREMIUM: 40,
  REGULAR: 20,
  EDUCATIONAL: 15,
};

// Category priority weights
const CATEGORY_WEIGHTS = {
  market: 10,
  mutual_funds: 9,
  breaking: 12,
  insurance: 7,
  fixed_income: 7,
  pms: 6,
  real_estate: 5,
  forex_gold: 5,
};

function normalizeUrgencyToSpec(urgency) {
  const u = String(urgency || '').trim().toUpperCase();
  if (!u) return 'REGULAR';
  if (u === 'BREAKING' || u === 'IMPORTANT' || u === 'PREMIUM' || u === 'REGULAR' || u === 'EDUCATIONAL') {
    return u;
  }
  // Legacy → spec
  if (u === 'HIGH') return 'IMPORTANT';
  if (u === 'MEDIUM') return 'REGULAR';
  if (u === 'LOW' || u === 'ROUTINE') return 'EDUCATIONAL';
  if (u === 'MARKET_MOVE' || u === 'REGULATORY' || u === 'OPPORTUNITY') return 'IMPORTANT';
  return 'REGULAR';
}

function isBreakingSpec(headline) {
  return normalizeUrgencyToSpec(headline?.urgency) === 'BREAKING' || headline?.category === 'breaking';
}

function getInternalCategoryKeysForSpec(specKey) {
  // Map spec keys to the categories that exist in DB/legacy systems.
  // This keeps the UI stable even if sources store different category names.
  const key = String(specKey || '').trim();
  if (!key || key === 'all') return null;
  const map = {
    market: [
      'market',
      'market_update',
      'market_move',
      'corporate',
      'results',
      'regulatory',
      'economy',
      'sebi',
      'rbi',
      'sectors',
      'ipo',
      'global',
      'portfolio_tip',
      'tax_insight',
      'opportunity',
      'trading',
    ],
    mutual_funds: ['mutual_funds', 'sip'],
    breaking: ['breaking'],
    insurance: ['insurance'],
    fixed_income: ['fixed_income', 'bonds'],
    pms: ['pms', 'pms_aif'],
    real_estate: ['real_estate'],
    forex_gold: ['forex_gold'],
  };
  return map[key] || [key];
}

/**
 * Calculate priority score for a headline
 * Priority = (Urgency × 3) + (Recency × 2) + (Category_Weight × 1)
 */
function calculatePriority(headline) {
  const now = Date.now();
  
  // Urgency component
  const urgency = URGENCY_WEIGHTS[normalizeUrgencyToSpec(headline.urgency)] || URGENCY_WEIGHTS.REGULAR;
  
  // Recency component (higher = more recent, max 60 for items < 1 hour old)
  const timestamp = new Date(headline.created_at || headline.timestamp);
  const ageMinutes = (now - timestamp.getTime()) / 60000;
  const recency = Math.max(0, 60 - ageMinutes);
  
  // Category weight component
  const categoryWeight = CATEGORY_WEIGHTS[headline.category] || 5;
  
  const pinnedBoost = headline?.pinned ? 100000 : 0;
  return pinnedBoost + (urgency * 3) + (recency * 2) + categoryWeight;
}

/**
 * Filter out headlines that are not currently valid (scheduled/expired)
 * - valid_from in the future => excluded
 * - valid_until in the past  => excluded
 */
function filterByValidityWindow(headlines) {
  const now = new Date();
  return headlines.filter((h) => {
    if (h.valid_from) {
      const startDate = new Date(h.valid_from);
      if (startDate > now) return false;
    }

    if (h.valid_until) {
      const expiryDate = new Date(h.valid_until);
      if (expiryDate <= now) return false;
    }

    return true;
  });
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
    // Check valid_from (scheduled headlines)
    if (h.valid_from) {
      const startDate = new Date(h.valid_from);
      if (startDate > now) return false;
    }

    // Check valid_until expiry
    if (h.valid_until) {
      const expiryDate = new Date(h.valid_until);
      if (expiryDate <= now) return false;
    }
    
    // Check freshness - headlines older than 24 hours are stale
    const freshnessValue = h.created_at || h.timestamp;
    if (freshnessValue) {
      const createdAt = new Date(freshnessValue);
      if (createdAt < oneDayAgo) return false;
    }
    
    return true;
  });
}

function buildRotation(items, { limit, modeKey }) {
  // Step 2: Sort by priority
  const sorted = items.sort((a, b) => calculatePriority(b) - calculatePriority(a));

  // Pin-to-top override (admin pinned items first)
  const pinned = sorted.filter((h) => h?.pinned);
  const rest = sorted.filter((h) => !h?.pinned);

  // Step 2.5: Ensure category variety when available
  const seeded = ensureAtLeastOnePerCategory(rest);

  // Step 3: Enforce category balance
  const balanced = enforceCategoryBalance(seeded);

  // Step 4: Apply limit
  let final = [...pinned, ...balanced].slice(0, limit);

  // Step 4.5: Intelligent enrichment + lightweight noise suppression + dedupe
  const minQuality = modeKey === 'night' || modeKey === 'global' ? 60 : 65;
  final = dedupeHeadlines(
    final
      .map((h) => enrichHeadline(h))
      .filter((h) => {
        if (h?.pinned) return true;
        if (isBreakingSpec(h)) return true;
        return (h?.qualityScore ?? 0) >= minQuality;
      })
  ).slice(0, limit);

  return final;
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

function ensureAtLeastOnePerCategory(headlines) {
  // Spec: At least 1 from each active category (when available)
  const byCategory = new Map();
  for (const h of headlines) {
    const cat = h?.category || 'market';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(h);
  }

  const selected = [];
  const remaining = [];

  for (const [cat, items] of byCategory.entries()) {
    if (items.length > 0) selected.push(items[0]);
    for (let i = 1; i < items.length; i++) remaining.push(items[i]);
  }

  // If we already exceed the max, keep the highest-priority ones.
  if (selected.length >= MAX_ROTATION_HEADLINES) {
    return selected.slice(0, MAX_ROTATION_HEADLINES);
  }

  return [...selected, ...remaining];
}

/**
 * GET - Fetch headlines for frontend display
 */
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category') || 'all';
    const requested = parseInt(searchParams.get('limit') || String(MAX_ROTATION_HEADLINES), 10);
    const requestedLimit = Number.isFinite(requested) ? requested : MAX_ROTATION_HEADLINES;

    // Spec: global_watch shows minimal items (max 5)
    const modeKey = getCurrentMode();
    const hardMax = modeKey === 'global_watch' ? GLOBAL_WATCH_MAX : MAX_ROTATION_HEADLINES;
    const limit = Math.min(Math.max(1, requestedLimit), hardMax);
    const minRequired = Math.min(MIN_ROTATION_HEADLINES, limit);
    
    const supabase = getSupabase();
    
    // No curated fallback if database unavailable
    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          headlines: [],
          source: 'unavailable',
          count: 0,
          mode: modeKey,
          error: 'Database not configured for live headlines',
          hint: 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (and ensure /api/cron/headlines is running).',
        },
        { status: 503, headers: FEED_CACHE_HEADERS }
      );
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
      const internalKeys = getInternalCategoryKeysForSpec(category);
      if (internalKeys && internalKeys.length > 0) {
        headlinesQuery = headlinesQuery.in('category', internalKeys);
        autoQuery = autoQuery.in('category', internalKeys);
        adminQuery = adminQuery.in('category', internalKeys);
      } else {
        headlinesQuery = headlinesQuery.eq('category', category);
        autoQuery = autoQuery.eq('category', category);
        adminQuery = adminQuery.eq('category', category);
      }
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
        rawCategory: item.category || 'market_update',
        category: normalizeCategoryToSpec(item.category || 'market_update'),
        icon: getCategoryIcon(normalizeCategoryToSpec(item.category || 'market_update')),
        headline: item.title,
        whyItMatters: item.why_it_matters || item.summary,
        why_it_matters: item.why_it_matters || item.summary,
        dataPoint: item.data_point || '',
        data_point: item.data_point || '',
        urgency: normalizeUrgencyToSpec(item.urgency || 'REGULAR'),
        timestamp: item.published_at || item.created_at,
        created_at: item.created_at,
        source: item.source,
        valid_until: item.valid_until,
        valid_from: item.valid_from || item.published_at || item.created_at,
        cta_button: item.cta_button || { text: 'Learn More', link: '/contact', icon: '→' },
        pinned: false,
        type: 'headlines',
        url: item.url,
      })),
      // Intelligence items (legacy)
      ...(autoResult.data || []).map(item => ({
        id: item.id,
        rawCategory: item.category || 'market_update',
        category: normalizeCategoryToSpec(item.category || 'market_update'),
        icon: getCategoryIcon(normalizeCategoryToSpec(item.category || 'market_update')),
        headline: item.block_what_happened,
        whyItMatters: item.block_why_it_matters,
        why_it_matters: item.block_why_it_matters,
        dataPoint: item.block_where_fits,
        data_point: item.block_where_fits,
        urgency: normalizeUrgencyToSpec(item.urgency || 'REGULAR'),
        timestamp: item.created_at,
        created_at: item.created_at,
        source: item.source_name,
        valid_until: item.valid_until,
        valid_from: item.valid_from || item.created_at,
        cta_button: item.cta_button || { text: 'Learn More', link: '/contact', icon: '→' },
        pinned: false,
        type: 'auto',
        url: item.url || item.source_url || null,
      })),
      ...(adminResult.data || []).map(item => ({
        id: item.id,
        rawCategory: item.category || 'market_update',
        category: normalizeCategoryToSpec(item.category || 'market_update'),
        icon: getCategoryIcon(normalizeCategoryToSpec(item.category || 'market_update')),
        headline: item.headline,
        whyItMatters: item.why_it_matters,
        why_it_matters: item.why_it_matters,
        dataPoint: item.data_point,
        data_point: item.data_point,
        urgency: normalizeUrgencyToSpec(item.urgency || 'REGULAR'),
        timestamp: item.created_at,
        created_at: item.created_at,
        source: item.source,
        valid_until: item.valid_until,
        valid_from: item.valid_from || item.created_at,
        cta_button: item.cta_button || { text: 'Learn More', link: '/contact', icon: '→' },
        // Use existing schema field as a production-ready "pin to top" flag
        pinned: Boolean(item.is_breaking),
        type: 'admin',
        url: item.url || item.source_url || null,
      })),
    ];

    // Step 1: Apply validity window (scheduled/expired)
    const withinWindow = filterByValidityWindow(combined);

    // Step 1.5: Filter stale headlines (includes 24hr freshness check)
    const fresh = filterExpired(withinWindow);
    const staleCount = withinWindow.length - fresh.length;

    // If ALL headlines are stale (older than 24h), show a warning
    if (fresh.length === 0 && withinWindow.length > 0) {
      console.warn('[Live Intelligence] All headlines are stale (older than 24h). Database needs fresh content.');
    }

    let final = buildRotation(fresh, { limit, modeKey });

    // Spec: Minimum headlines in rotation = 5 (when possible)
    // Strict mode: never mix curated/dummy items.
    
    // If no headlines available, fallback behavior:
    // - prod strict/live: return latest available DB items even if stale (still real data)
    if (final.length === 0) {
      if (withinWindow.length > 0) {
        // Serve latest available DB items (even if older than freshness window).
        // This keeps the site functional without inventing data.
        let staleFinal = buildRotation(withinWindow, { limit, modeKey });
        if (staleFinal.length === 0) {
          staleFinal = dedupeHeadlines(withinWindow.map((h) => enrichHeadline(h))).slice(0, limit);
        }

        return NextResponse.json(
          {
            ok: true,
            headlines: staleFinal,
            source: 'database_stale',
            count: staleFinal.length,
            mode: modeKey,
            stats: {
              total_fetched: withinWindow.length,
              stale_filtered: staleCount,
              fresh_remaining: 0,
              returned: staleFinal.length,
              warning: 'No fresh headlines in last 24h; showing latest available database items.',
            },
          },
          { headers: FEED_CACHE_HEADERS }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          headlines: [],
          source: 'empty',
          count: 0,
          mode: modeKey,
          stats: {
            total_fetched: withinWindow.length,
            stale_filtered: staleCount,
            fresh_remaining: 0,
            returned: 0,
            warning: 'No fresh headlines available (live mode).',
          },
        },
        { headers: FEED_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        headlines: final,
        source: 'database',
        count: final.length,
        mode: modeKey,
        stats: {
          total_fetched: withinWindow.length,
          stale_filtered: staleCount,
          fresh_remaining: fresh.length,
          returned: final.length,
          warning: staleCount > 0 ? `${staleCount} headlines filtered (expired or older than 24h)` : null,
        },
      },
      { headers: FEED_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Live Intelligence feed error:', error);

    const modeKey = getCurrentMode();
    return NextResponse.json(
      {
        ok: false,
        headlines: [],
        source: 'error',
        count: 0,
        mode: modeKey,
        error: error?.message || 'Feed error',
      },
      { status: 500, headers: FEED_CACHE_HEADERS }
    );
  }
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
  const icons = {
    market: '📈',
    mutual_funds: '💰',
    breaking: '🔴',
    insurance: '🛡️',
    fixed_income: '🏦',
    pms: '💎',
    real_estate: '🏠',
    forex_gold: '💵',
  };
  return icons[category] || '📰';
}



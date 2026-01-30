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
// Prefer service role for server-side reads; fall back to anon key for read-only queries.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
};

const MAX_ROTATION_HEADLINES = 15;
const GLOBAL_WATCH_MAX = 5;
const MIN_ROTATION_HEADLINES = 5;

// Live RSS fallback feeds (real-time external sources; not curated/dummy).
// Used only when database is unavailable/empty.
const RSS_FALLBACK_FEEDS = [
  {
    sourceKey: 'moneycontrol',
    sourceName: 'MoneyControl',
    url: 'https://www.moneycontrol.com/rss/latestnews.xml',
    category: 'market',
  },
  {
    sourceKey: 'moneycontrol',
    sourceName: 'MoneyControl',
    url: 'https://www.moneycontrol.com/rss/mfnews.xml',
    category: 'mutual_funds',
  },
  {
    sourceKey: 'economicTimes',
    sourceName: 'Economic Times',
    url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    category: 'market',
  },
  {
    sourceKey: 'mint',
    sourceName: 'Mint',
    url: 'https://www.livemint.com/rss/markets',
    category: 'market',
  },
];

function stripCdata(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .trim();
}

function decodeHtmlEntities(input) {
  const str = String(input || '');
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number.parseInt(n, 10);
      if (!Number.isFinite(code)) return _;
      try {
        return String.fromCharCode(code);
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      if (!Number.isFinite(code)) return _;
      try {
        return String.fromCharCode(code);
      } catch {
        return _;
      }
    });
}

function extractTag(xmlChunk, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const m = String(xmlChunk || '').match(re);
  if (!m) return '';
  return decodeHtmlEntities(stripCdata(m[1]));
}

function extractAtomLink(xmlChunk) {
  const m = String(xmlChunk || '').match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
  return m ? decodeHtmlEntities(m[1].trim()) : '';
}

function simpleHash(value) {
  const s = String(value || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

function parseRssXml(xml) {
  const items = [];
  const raw = String(xml || '');
  if (!raw) return items;

  const rssItems = raw.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of rssItems) {
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link') || extractTag(block, 'guid');
    const pubDate = extractTag(block, 'pubDate');
    if (!title) continue;
    items.push({ title, link, pubDate });
  }

  if (items.length > 0) return items;

  // Atom fallback
  const entries = raw.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  for (const block of entries) {
    const title = extractTag(block, 'title');
    const link = extractAtomLink(block);
    const pubDate = extractTag(block, 'published') || extractTag(block, 'updated');
    if (!title) continue;
    items.push({ title, link, pubDate });
  }

  return items;
}

async function fetchRssFallbackHeadlines({ request, limit, categorySpecKey, modeKey, noCache = false }) {
  const origin = request?.nextUrl?.origin;
  if (!origin) return [];

  const filteredFeeds = RSS_FALLBACK_FEEDS.filter((f) => {
    if (!categorySpecKey || categorySpecKey === 'all') return true;
    return normalizeCategoryToSpec(f.category) === categorySpecKey;
  });

  // If filter removes all feeds, still attempt market feed as a safe default.
  const feedsToUse = filteredFeeds.length > 0 ? filteredFeeds : RSS_FALLBACK_FEEDS.filter((f) => f.category === 'market');

  const responses = await Promise.allSettled(
    feedsToUse.map(async (feed) => {
      const proxyUrl = `${origin}/api/rss-proxy?url=${encodeURIComponent(feed.url)}${noCache ? '&nocache=1' : ''}`;
      const res = await fetch(proxyUrl, { cache: 'no-store' });
      if (!res.ok) return [];
      const xml = await res.text();
      const parsed = parseRssXml(xml);
      return parsed.map((p) => ({ ...p, feed }));
    })
  );

  const merged = [];
  for (const r of responses) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) merged.push(...r.value);
  }

  // Map to internal headline objects.
  const normalized = merged
    .map(({ title, link, pubDate, feed }) => {
      const ts = pubDate ? new Date(pubDate) : null;
      const timestamp = ts && !Number.isNaN(ts.getTime()) ? ts.toISOString() : new Date().toISOString();
      const specCategory = normalizeCategoryToSpec(feed?.category || 'market');
      const idSeed = link || `${feed?.sourceKey}:${title}:${timestamp}`;
      const url = link && /^https?:\/\//i.test(link) ? link : null;

      return {
        id: `rss_${feed?.sourceKey || 'src'}_${simpleHash(idSeed)}`,
        rawCategory: feed?.category || 'market',
        category: specCategory,
        icon: getCategoryIcon(specCategory),
        headline: title,
        what_happened: title,
        whyItMatters: '',
        why_it_matters: '',
        dataPoint: '',
        data_point: '',
        urgency: 'REGULAR',
        timestamp,
        created_at: timestamp,
        source: feed?.sourceName || 'RSS',
        valid_from: timestamp,
        valid_until: null,
        pinned: false,
        type: 'rss',
        url,
        cta_button: url ? { text: 'Open Source', link: url, icon: '↗' } : { text: 'Learn More', link: '/contact', icon: '→' },
      };
    })
    .filter((h) => Boolean(h?.headline))
    .sort((a, b) => {
      const at = new Date(a.timestamp).getTime();
      const bt = new Date(b.timestamp).getTime();
      return bt - at;
    });

  // De-dupe by URL/headline
  const seen = new Set();
  const unique = [];
  for (const h of normalized) {
    const key = (h.url || h.headline || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(h);
    if (unique.length >= Math.max(limit * 3, limit)) break;
  }

  // Apply the same pipeline used for DB items.
  const withinWindow = filterByValidityWindow(unique);
  const fresh = filterExpired(withinWindow);
  const final = buildRotation(fresh, { limit, modeKey });
  return final.slice(0, limit);
}

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
  const minQuality = modeKey === 'nightsummary' || modeKey === 'globalwatch' ? 60 : 65;
  final = dedupeHeadlines(
    final
      .map((h) => enrichHeadline(h))
      .filter((h) => {
        if (h?.pinned) return true;
        // RSS fallback items are real-source headlines and may not have full enrichment fields.
        // Keep them rather than dropping the rotation to empty.
        if (h?.type === 'rss') return true;
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
    const cacheHeaders = searchParams.get('nocache') === '1' ? NO_CACHE_HEADERS : FEED_CACHE_HEADERS;
    const noCache = searchParams.get('nocache') === '1';
    const category = searchParams.get('category') || 'all';
    const requested = parseInt(searchParams.get('limit') || String(MAX_ROTATION_HEADLINES), 10);
    const requestedLimit = Number.isFinite(requested) ? requested : MAX_ROTATION_HEADLINES;

    // Spec: globalwatch shows minimal items (max 5)
    const mode = getCurrentMode();
    const modeKey = mode?.key || 'globalwatch';
    const hardMax = modeKey === 'globalwatch' ? GLOBAL_WATCH_MAX : MAX_ROTATION_HEADLINES;
    const limit = Math.min(Math.max(1, requestedLimit), hardMax);
    const minRequired = Math.min(MIN_ROTATION_HEADLINES, limit);
    
    const supabase = getSupabase();
    
    // Strict mode: if DB is unavailable, fall back to LIVE RSS (real sources) rather than dummy/curated.
    if (!supabase) {
      const rssHeadlines = await fetchRssFallbackHeadlines({ request, limit, categorySpecKey: category, modeKey, noCache });
      return NextResponse.json(
        {
          ok: true,
          headlines: rssHeadlines,
          source: rssHeadlines.length > 0 ? 'rss' : 'unavailable',
          count: rssHeadlines.length,
          mode,
          stats: {
            warning: 'Database not configured; serving live RSS headlines.',
          },
          error: rssHeadlines.length > 0 ? null : 'Database not configured and RSS unavailable',
          hint: 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (and ensure /api/cron/headlines is running) for enriched headlines.',
        },
        { status: 200, headers: cacheHeaders }
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
            mode,
            stats: {
              total_fetched: withinWindow.length,
              stale_filtered: staleCount,
              fresh_remaining: 0,
              returned: staleFinal.length,
              warning: 'No fresh headlines in last 24h; showing latest available database items.',
            },
          },
          { headers: cacheHeaders }
        );
      }

      // DB is configured but empty/no content: fall back to LIVE RSS.
      const rssHeadlines = await fetchRssFallbackHeadlines({ request, limit, categorySpecKey: category, modeKey, noCache });
      if (rssHeadlines.length > 0) {
        return NextResponse.json(
          {
            ok: true,
            headlines: rssHeadlines,
            source: 'rss',
            count: rssHeadlines.length,
            mode,
            stats: {
              total_fetched: 0,
              stale_filtered: staleCount,
              fresh_remaining: 0,
              returned: rssHeadlines.length,
              warning: 'Database has no fresh headlines; serving live RSS headlines.',
            },
          },
          { headers: cacheHeaders }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          headlines: [],
          source: 'empty',
          count: 0,
          mode,
          stats: {
            total_fetched: withinWindow.length,
            stale_filtered: staleCount,
            fresh_remaining: 0,
            returned: 0,
            warning: 'No fresh headlines available (live mode).',
          },
        },
        { headers: cacheHeaders }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        headlines: final,
        source: 'database',
        count: final.length,
        mode,
        stats: {
          total_fetched: withinWindow.length,
          stale_filtered: staleCount,
          fresh_remaining: fresh.length,
          returned: final.length,
          warning: staleCount > 0 ? `${staleCount} headlines filtered (expired or older than 24h)` : null,
        },
      },
      { headers: cacheHeaders }
    );
  } catch (error) {
    console.error('Live Intelligence feed error:', error);

    // Strict mode: never invent data. If the DB/feed handler fails, fall back to LIVE RSS (real sources).
    try {
      const { searchParams } = request?.nextUrl || { searchParams: new URLSearchParams() };
      const noCache = searchParams.get('nocache') === '1';
      const category = searchParams.get('category') || 'all';
      const requested = parseInt(searchParams.get('limit') || String(MAX_ROTATION_HEADLINES), 10);
      const requestedLimit = Number.isFinite(requested) ? requested : MAX_ROTATION_HEADLINES;

      const mode = getCurrentMode();
      const modeKey = mode?.key || 'globalwatch';
      const hardMax = modeKey === 'globalwatch' ? GLOBAL_WATCH_MAX : MAX_ROTATION_HEADLINES;
      const limit = Math.min(Math.max(1, requestedLimit), hardMax);

      const rssHeadlines = await fetchRssFallbackHeadlines({
        request,
        limit,
        categorySpecKey: category,
        modeKey,
        noCache,
      });

      if (rssHeadlines.length > 0) {
        return NextResponse.json(
          {
            ok: true,
            headlines: rssHeadlines,
            source: 'rss_error_fallback',
            count: rssHeadlines.length,
            mode,
            stats: {
              warning: 'Primary feed handler failed; serving live RSS headlines.',
            },
            error: null,
          },
          { status: 200, headers: NO_CACHE_HEADERS }
        );
      }
    } catch (fallbackError) {
      console.error('Live Intelligence RSS fallback error:', fallbackError);
    }

    const mode = getCurrentMode();
    return NextResponse.json(
      {
        ok: false,
        headlines: [],
        source: 'error',
        count: 0,
        mode,
        error: error?.message || 'Feed error',
      },
      { status: 500, headers: NO_CACHE_HEADERS }
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



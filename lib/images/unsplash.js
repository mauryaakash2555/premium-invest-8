/**
 * Unsplash API wrapper for auto-fetching headline images.
 *
 * Features:
 * - Smart keyword extraction from financial headlines
 * - India-relevant category-based search context
 * - Duplicate image prevention via in-memory Set
 * - Multi-result fetching with random selection for variety
 * - Curated static fallbacks per category
 */

const UNSPLASH_API = 'https://api.unsplash.com';

/* ─── category → search context + static fallback URL ─────────────── */
const CATEGORY_MAP = {
  market:       { context: 'indian stock market sensex nifty',           fallback: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' },
  sebi:         { context: 'SEBI India financial regulation',            fallback: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80' },
  rbi:          { context: 'Reserve Bank India monetary policy',         fallback: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80' },
  tax:          { context: 'India income tax filing',                    fallback: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80' },
  insurance:    { context: 'life insurance India family',                fallback: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80' },
  mutual_funds: { context: 'mutual fund investment India',               fallback: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80' },
  ipo:          { context: 'IPO stock listing India',                    fallback: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' },
  regulatory:   { context: 'India financial regulatory',                 fallback: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80' },
  breaking:     { context: 'breaking news India finance',                fallback: 'https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80' },
  fixed_income: { context: 'bonds fixed income India',                   fallback: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80' },
  pms:          { context: 'wealth management India portfolio',          fallback: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80' },
  real_estate:  { context: 'real estate property India',                 fallback: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' },
  forex_gold:   { context: 'gold bars forex India',                      fallback: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80' },
};

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';

/* ─── deduplication: track used image URLs across a single batch ───── */
const _usedUrls = new Set();

/** Call before a batch (e.g. digest send) to reset tracking. */
export function resetUsedImages() {
  _usedUrls.clear();
}

/* ─── noise words to strip from headlines ─────────────────────────── */
const NOISE = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'shall', 'would',
  'should', 'may', 'might', 'can', 'could', 'of', 'in', 'to', 'for',
  'with', 'on', 'at', 'from', 'by', 'up', 'about', 'into', 'through',
  'during', 'before', 'after', 'this', 'that', 'these', 'those', 'and',
  'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither',
  'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
  'also', 'its', 'it', 'as', 'vs', 'per', 'new', 'now', 'says', 'said',
  'eyes', 'set', 'gets', 'got', 'big', 'top', 'key', 'how', 'what',
  'why', 'when', 'who', 'which', 'where', 'after', 'amid', 'over',
]);

/* ─── financial junk to remove before keyword extraction ──────────── */
const FINANCIAL_JUNK = /\b(rs|crore|lakh|cr|bps|inr|usd|eur|gbp|mn|bn|fy\d{2,4}|q[1-4]|h[12]|yoy|qoq|cagr)\b/gi;
const NUMBERS_AND_PERCENT = /[\d,.]+%?/g;
const DATE_PATTERNS = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*\d{0,4}\b/gi;

/**
 * Extract the best 3-4 word search query from a headline.
 *
 * Strategy:
 * 1. Remove financial junk (Rs, Crore, Lakh, numbers, %)
 * 2. Remove dates
 * 3. Remove noise/stop words
 * 4. Keep company names, proper nouns, action words
 * 5. Take the first 3-4 meaningful words
 * 6. Append "India finance" for relevance
 */
export function extractSearchQuery(headline, category) {
  let text = headline || '';

  // Strip financial junk, numbers, dates
  text = text.replace(FINANCIAL_JUNK, ' ');
  text = text.replace(NUMBERS_AND_PERCENT, ' ');
  text = text.replace(DATE_PATTERNS, ' ');
  text = text.replace(/[^a-zA-Z\s]/g, ' ');

  const words = text
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !NOISE.has(w.toLowerCase()));

  // Prefer proper nouns (capitalized) and longer words
  const scored = words.map(w => ({
    word: w,
    score: (w[0] === w[0].toUpperCase() ? 3 : 0) + Math.min(w.length, 6),
  }));
  scored.sort((a, b) => b.score - a.score);

  const picked = scored.slice(0, 4).map(s => s.word);

  if (picked.length === 0) {
    // Headline was pure numbers/junk → fall back to category context
    return CATEGORY_MAP[category]?.context || 'India finance investing';
  }

  return picked.join(' ') + ' India finance';
}

/**
 * Pick a non-duplicate image URL from Unsplash search results.
 * Returns null if all results are already used.
 */
function pickUnusedImage(results) {
  // Shuffle results for variety
  const shuffled = [...results].sort(() => Math.random() - 0.5);
  for (const photo of shuffled) {
    const url = photo.urls?.small || photo.urls?.regular;
    if (url && !_usedUrls.has(url)) {
      _usedUrls.add(url);
      return url;
    }
  }
  return null;
}

/**
 * Fetch an image from Unsplash that matches the headline + category.
 *
 * @param {string} headline  – The headline text
 * @param {string} category  – One of the SPEC category keys
 * @returns {Promise<string|null>} – The image URL, or null on total failure
 */
export async function getHeadlineImage(headline, category) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const catKey = (category || 'market').toLowerCase();

  if (!accessKey) {
    console.warn('[unsplash] UNSPLASH_ACCESS_KEY not set – using fallback');
    return CATEGORY_MAP[catKey]?.fallback || DEFAULT_FALLBACK;
  }

  const query = extractSearchQuery(headline, catKey);

  // Try headline-derived query first
  let imageUrl = await searchUnsplash(accessKey, query);
  if (imageUrl) return imageUrl;

  // Retry with category context only
  const catContext = CATEGORY_MAP[catKey]?.context;
  if (catContext && catContext !== query) {
    imageUrl = await searchUnsplash(accessKey, catContext);
    if (imageUrl) return imageUrl;
  }

  return CATEGORY_MAP[catKey]?.fallback || DEFAULT_FALLBACK;
}

/**
 * Search Unsplash and return a non-duplicate image URL.
 */
async function searchUnsplash(accessKey, query) {
  try {
    const url = new URL(`${UNSPLASH_API}/search/photos`);
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('per_page', '5');
    url.searchParams.set('content_filter', 'high');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`[unsplash] API ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return pickUnusedImage(data.results);
    }
    return null;
  } catch (err) {
    console.error('[unsplash] fetch error:', err.message);
    return null;
  }
}

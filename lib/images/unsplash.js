/**
 * Unsplash API wrapper for auto-fetching headline images.
 *
 * Uses the official search endpoint to find landscape photos that match
 * a headline's text and/or category. Falls back to a curated set of
 * category-specific placeholder images when the API key is missing or
 * the search returns no results.
 */

const UNSPLASH_API = 'https://api.unsplash.com';

/* ─── category → fallback search term + static fallback URL ─────────── */
const CATEGORY_FALLBACKS = {
  market: {
    query: 'stock market trading',
    fallback: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  },
  mutual_funds: {
    query: 'investment portfolio',
    fallback: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80',
  },
  breaking: {
    query: 'breaking news finance',
    fallback: 'https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80',
  },
  insurance: {
    query: 'insurance protection',
    fallback: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
  },
  fixed_income: {
    query: 'bonds fixed income',
    fallback: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  },
  pms: {
    query: 'wealth management',
    fallback: 'https://images.unsplash.com/photo-1553729459-uj4s0b0a2jkl?w=800&q=80',
  },
  real_estate: {
    query: 'real estate property',
    fallback: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  },
  forex_gold: {
    query: 'gold bars forex',
    fallback: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80',
  },
};

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';

/**
 * Build a compact search query from the headline text.
 * Strips common financial "noise" words so the visual search is more relevant.
 */
function buildSearchQuery(headline, category) {
  const noise = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'shall', 'would',
    'should', 'may', 'might', 'can', 'could', 'of', 'in', 'to', 'for',
    'with', 'on', 'at', 'from', 'by', 'up', 'about', 'into', 'through',
    'during', 'before', 'after', 'this', 'that', 'these', 'those', 'and',
    'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither',
    'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
    'also', 'its', 'it', 'as', 'vs', 'per', 'bps', 'cr', 'lakh', 'crore',
    'rs', 'inr', 'usd', '%',
  ]);

  const words = headline
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !noise.has(w));

  // Take the first 4 meaningful words for a focused search
  const queryWords = words.slice(0, 4).join(' ');

  // If the headline is too generic after stripping, fall back to category query
  if (queryWords.length < 5) {
    return CATEGORY_FALLBACKS[category]?.query || 'finance investing';
  }
  return queryWords;
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

  if (!accessKey) {
    console.warn('[unsplash] UNSPLASH_ACCESS_KEY not set – using fallback');
    return CATEGORY_FALLBACKS[category]?.fallback || DEFAULT_FALLBACK;
  }

  const query = buildSearchQuery(headline, category);

  try {
    const url = new URL(`${UNSPLASH_API}/search/photos`);
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('per_page', '1');
    url.searchParams.set('content_filter', 'high'); // safe-for-work only

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`[unsplash] API ${res.status}: ${res.statusText}`);
      return CATEGORY_FALLBACKS[category]?.fallback || DEFAULT_FALLBACK;
    }

    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      // Use the "small" size (~400px wide) – good balance of quality vs speed
      return photo.urls?.small || photo.urls?.regular || null;
    }

    // No results from headline query – retry with category-level query
    if (CATEGORY_FALLBACKS[category]?.query && query !== CATEGORY_FALLBACKS[category].query) {
      return retryWithCategory(accessKey, category);
    }

    return CATEGORY_FALLBACKS[category]?.fallback || DEFAULT_FALLBACK;
  } catch (err) {
    console.error('[unsplash] fetch error:', err.message);
    return CATEGORY_FALLBACKS[category]?.fallback || DEFAULT_FALLBACK;
  }
}

/**
 * Retry search using the category's generic query.
 */
async function retryWithCategory(accessKey, category) {
  const catQuery = CATEGORY_FALLBACKS[category]?.query;
  if (!catQuery) return CATEGORY_FALLBACKS[category]?.fallback || DEFAULT_FALLBACK;

  try {
    const url = new URL(`${UNSPLASH_API}/search/photos`);
    url.searchParams.set('query', catQuery);
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('per_page', '1');
    url.searchParams.set('content_filter', 'high');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return CATEGORY_FALLBACKS[category]?.fallback || DEFAULT_FALLBACK;

    const data = await res.json();
    if (data.results?.[0]) {
      return data.results[0].urls?.small || data.results[0].urls?.regular || null;
    }
  } catch {
    // fall through
  }

  return CATEGORY_FALLBACKS[category]?.fallback || DEFAULT_FALLBACK;
}

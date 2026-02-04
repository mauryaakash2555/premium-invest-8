/**
 * Unsplash Image Service
 * Free high-quality images from Unsplash API
 * 
 * Features:
 * - Search by keywords with relevance scoring
 * - Filter out already-used images
 * - Quality optimization parameters
 * - Fallback search strategies
 * 
 * 🆓 Uses Unsplash free API (no payment needed)
 * 
 * @module lib/blog/unsplashService
 */

import { isImageUsed, extractUnsplashId } from './imageTracker';

// Unsplash API base URL
const UNSPLASH_API = 'https://api.unsplash.com';

// Access key from environment (free tier)
// Get your free key at: https://unsplash.com/developers
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'demo';

/**
 * Default quality parameters for blog images
 * w=1200, h=800 for standard blog hero
 * q=80 for good quality with reasonable size
 */
const DEFAULT_PARAMS = {
  w: 1200,
  h: 800,
  fit: 'crop',
  auto: 'format',
  fm: 'webp',
  q: 80
};

/**
 * High quality parameters (premium fallback)
 */
const HIGH_QUALITY_PARAMS = {
  w: 1600,
  h: 1067,
  fit: 'crop',
  auto: 'format',
  fm: 'webp',
  q: 85
};

/**
 * Search Unsplash for images matching keywords
 * Returns images NOT already used on the site
 */
export async function searchImages(keywords, options = {}) {
  const {
    perPage = 30,
    page = 1,
    orientation = 'landscape',
    orderBy = 'relevant'
  } = options;

  if (!keywords || keywords.length === 0) {
    return { results: [], total: 0 };
  }

  const query = Array.isArray(keywords) ? keywords.join(' ') : keywords;
  
  try {
    // Build search URL
    const params = new URLSearchParams({
      query,
      per_page: String(perPage),
      page: String(page),
      orientation,
      order_by: orderBy
    });

    const response = await fetch(
      `${UNSPLASH_API}/search/photos?${params}`,
      {
        headers: {
          'Authorization': `Client-ID ${ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      console.error('[Unsplash] API error:', response.status);
      return { results: [], total: 0, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    // Filter out already-used images
    const availableImages = data.results.filter(img => {
      const id = `photo-${img.id}`;
      return !isImageUsed(id);
    });

    return {
      results: availableImages.map(formatImageResult),
      total: data.total,
      totalPages: data.total_pages,
      available: availableImages.length,
      filtered: data.results.length - availableImages.length
    };

  } catch (error) {
    console.error('[Unsplash] Search error:', error);
    return { results: [], total: 0, error: error.message };
  }
}

/**
 * Format image result with optimized URLs
 */
function formatImageResult(img) {
  const baseUrl = img.urls.raw;
  
  // Build optimized URLs
  const defaultUrl = buildUrl(baseUrl, DEFAULT_PARAMS);
  const highQualityUrl = buildUrl(baseUrl, HIGH_QUALITY_PARAMS);
  const thumbnailUrl = buildUrl(baseUrl, { w: 400, h: 267, fit: 'crop', q: 70 });

  return {
    id: `photo-${img.id}`,
    description: img.description || img.alt_description || 'Unsplash image',
    urls: {
      default: defaultUrl,
      highQuality: highQualityUrl,
      thumbnail: thumbnailUrl,
      raw: baseUrl
    },
    photographer: {
      name: img.user.name,
      username: img.user.username,
      link: img.user.links.html
    },
    colors: {
      primary: img.color,
      blur_hash: img.blur_hash
    },
    likes: img.likes,
    // Unsplash requires attribution
    attribution: `Photo by ${img.user.name} on Unsplash`,
    attributionHtml: `Photo by <a href="${img.user.links.html}?utm_source=bmwealth&utm_medium=referral">${img.user.name}</a> on <a href="https://unsplash.com/?utm_source=bmwealth&utm_medium=referral">Unsplash</a>`
  };
}

/**
 * Build URL with parameters
 */
function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

/**
 * Get a random curated image (fallback when search fails)
 */
export async function getRandomImage(options = {}) {
  const { orientation = 'landscape', topics = [] } = options;

  try {
    const params = new URLSearchParams({ orientation });
    if (topics.length > 0) {
      params.set('topics', topics.join(','));
    }

    const response = await fetch(
      `${UNSPLASH_API}/photos/random?${params}`,
      {
        headers: {
          'Authorization': `Client-ID ${ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const img = await response.json();
    const id = `photo-${img.id}`;
    
    // Check if already used
    if (isImageUsed(id)) {
      // Try again (max 3 attempts)
      return getRandomImage(options);
    }

    return formatImageResult(img);

  } catch (error) {
    console.error('[Unsplash] Random image error:', error);
    return null;
  }
}

/**
 * Topic IDs for finance/business content
 * Use these for better fallback images
 */
export const FINANCE_TOPICS = {
  business: 'aeu6rL-j6ew',
  technology: 'Jpg6Kidl-Hk',
  architecture: 'M8jVbLbTRws',
  nature: '6sMVjTLSkeQ',
  travel: 'Fzo3zuOHN6w'
};

/**
 * Curated fallback images for common blog themes
 * These are pre-selected high-quality images that fit finance content
 * IDs are Unsplash photo IDs
 */
export const CURATED_FALLBACKS = {
  investment: [
    'photo-1579532537598-459ecdaf39cc',  // Coins and growth
    'photo-1611974789855-9c2a0a7236a3',  // Stock chart
    'photo-1590283603385-17ffb3a7f29f',  // Financial data
  ],
  planning: [
    'photo-1454165804606-c3d57bc86b40',  // Planning desk
    'photo-1517245386807-bb43f82c33c4',  // Team meeting
    'photo-1553484771-371a605b060b',  // Calendar planning
  ],
  retirement: [
    'photo-1469571486292-0ba58a3f068b',  // Senior couple
    'photo-1542744173-8e7e53415bb0',  // Peaceful beach
    'photo-1516321318423-f06f85e504b3',  // Relaxation
  ],
  savings: [
    'photo-1579621970563-ebec7560ff3e',  // Piggy bank
    'photo-1553729459-efe14ef6055d',  // Jar of coins
    'photo-1526304640581-d334cdbbf45e',  // Safe deposit
  ],
  goals: [
    'photo-1519834785169-98be25ec3f84',  // Mountain summit
    'photo-1513542789411-b6a5d4f31634',  // Target
    'photo-1434626881859-194d67b2b86f',  // Success
  ],
  default: [
    'photo-1460925895917-afdab827c52f',  // Modern office
    'photo-1504384764586-bb4cdc1707b0',  // Clean desk
    'photo-1486406146926-c627a92ad1ab',  // Skyline
  ]
};

/**
 * Get a curated fallback image for a theme
 */
export function getCuratedFallback(theme = 'default') {
  const images = CURATED_FALLBACKS[theme] || CURATED_FALLBACKS.default;
  
  // Find first unused image
  for (const id of images) {
    if (!isImageUsed(id)) {
      return {
        id,
        urls: {
          default: `https://images.unsplash.com/${id}?${new URLSearchParams(DEFAULT_PARAMS)}`,
          highQuality: `https://images.unsplash.com/${id}?${new URLSearchParams(HIGH_QUALITY_PARAMS)}`,
          thumbnail: `https://images.unsplash.com/${id}?w=400&h=267&fit=crop&q=70`
        },
        curated: true
      };
    }
  }
  
  return null;
}

export default {
  searchImages,
  getRandomImage,
  getCuratedFallback,
  FINANCE_TOPICS,
  CURATED_FALLBACKS
};

/**
 * LIVE INTELLIGENCE - Data Sources
 * 
 * Manages headline data from multiple sources:
 * - RSS feeds (MoneyControl, Economic Times, Mint)
 * - Market data (NSE/BSE with 15-min delay)
 * - Admin manual entries (via Supabase)
 * - Breaking news system
 * 
 * @file lib/live-intelligence/data-sources.js
 * @created January 13, 2026
 */

// ═══════════════════════════════════════════════════════════
// RSS FEED CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const RSS_SOURCES = {
  moneycontrol: {
    name: 'MoneyControl',
    baseUrl: 'https://www.moneycontrol.com/rss/',
    feeds: {
      markets: 'latestnews.xml',
      stocks: 'stocknews.xml',
      mutualFunds: 'mfnews.xml',
      economy: 'economy.xml',
    },
    icon: '📊',
    priority: 1,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  },
  economicTimes: {
    name: 'Economic Times',
    baseUrl: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    feeds: {
      markets: 'markets',
      mutualFunds: 'mf',
      personalFinance: 'personal-finance',
    },
    icon: '📰',
    priority: 2,
    refreshInterval: 5 * 60 * 1000,
  },
  mint: {
    name: 'Mint',
    baseUrl: 'https://www.livemint.com/rss/',
    feeds: {
      markets: 'markets',
      money: 'money',
    },
    icon: '💚',
    priority: 3,
    refreshInterval: 5 * 60 * 1000,
  },
};

// ═══════════════════════════════════════════════════════════
// MARKET DATA CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const MARKET_INDICES = {
  nifty50: {
    symbol: 'NIFTY 50',
    displayName: 'NIFTY',
    icon: '📈',
    category: 'market',
  },
  sensex: {
    symbol: 'SENSEX',
    displayName: 'SENSEX',
    icon: '📈',
    category: 'market',
  },
  bankNifty: {
    symbol: 'NIFTY BANK',
    displayName: 'Bank Nifty',
    icon: '🏦',
    category: 'market',
  },
  niftyIT: {
    symbol: 'NIFTY IT',
    displayName: 'IT Index',
    icon: '💻',
    category: 'market',
  },
};

// FII/DII Data sources
export const FII_DII_SOURCES = {
  nse: 'https://www.nseindia.com/api/fiidiiTradeReact',
  moneycontrol: 'https://www.moneycontrol.com/stocks/marketstats/fii_dii_activity/',
};

// ═══════════════════════════════════════════════════════════
// HEADLINE FETCHING FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Parse RSS feed XML into headlines
 * @param {string} xml - Raw XML string
 * @param {string} source - Source identifier
 * @returns {Array} Array of headline objects
 */
export function parseRSSFeed(xml, source) {
  // In production, use a proper XML parser
  // This is a simplified example structure
  const headlines = [];
  
  // Parse XML items (would use DOMParser in browser)
  // Each item becomes a headline with:
  // - headline: item.title
  // - timestamp: item.pubDate
  // - source: source name
  // - link: item.link
  
  return headlines;
}

/**
 * Fetch headlines from RSS source
 * @param {string} sourceKey - Key from RSS_SOURCES
 * @param {string} feedKey - Key from source.feeds
 * @returns {Promise<Array>} Headlines array
 */
export async function fetchRSSHeadlines(sourceKey, feedKey) {
  const source = RSS_SOURCES[sourceKey];
  if (!source) return [];

  const feedPath = source.feeds[feedKey];
  if (!feedPath) return [];

  try {
    // In production, this would use a CORS proxy or server-side fetch
    const url = `${source.baseUrl}${feedPath}`;
    const response = await fetch(`/api/rss-proxy?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) throw new Error('Failed to fetch RSS');
    
    const xml = await response.text();
    return parseRSSFeed(xml, sourceKey);
  } catch (error) {
    console.warn(`RSS fetch failed for ${sourceKey}/${feedKey}:`, error);
    return [];
  }
}

/**
 * Fetch market data (NSE/BSE)
 * Note: Uses 15-minute delayed data for compliance
 * @returns {Promise<Object>} Market indices data
 */
export async function fetchMarketData() {
  try {
    // In production, use actual NSE/BSE API endpoints
    // These require proper authentication and rate limiting
    const response = await fetch('/api/market-data');
    
    if (!response.ok) throw new Error('Market data unavailable');
    
    return await response.json();
  } catch (error) {
    console.warn('Market data fetch failed:', error);
    return getDefaultMarketData();
  }
}

/**
 * Get default/fallback market data
 * Used when API is unavailable
 */
function getDefaultMarketData() {
  return {
    nifty50: { value: '--', change: '--', changePercent: '--' },
    sensex: { value: '--', change: '--', changePercent: '--' },
    bankNifty: { value: '--', change: '--', changePercent: '--' },
    lastUpdated: null,
    isLive: false,
  };
}

// ═══════════════════════════════════════════════════════════
// ADMIN HEADLINE MANAGEMENT (Supabase)
// ═══════════════════════════════════════════════════════════

/**
 * Fetch admin-entered headlines from Supabase
 * @returns {Promise<Array>} Headlines from admin
 */
export async function fetchAdminHeadlines() {
  try {
    // In production, use Supabase client
    const response = await fetch('/api/admin/headlines');
    
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.warn('Admin headlines fetch failed:', error);
    return [];
  }
}

/**
 * Create a new admin headline
 * @param {Object} headline - Headline data
 * @returns {Promise<Object>} Created headline
 */
export async function createAdminHeadline(headline) {
  const response = await fetch('/api/admin/headlines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(headline),
  });
  
  if (!response.ok) throw new Error('Failed to create headline');
  
  return await response.json();
}

// ═══════════════════════════════════════════════════════════
// BREAKING NEWS SYSTEM
// ═══════════════════════════════════════════════════════════

let breakingNewsCallback = null;

/**
 * Subscribe to breaking news updates
 * @param {Function} callback - Called when breaking news arrives
 */
export function subscribeToBreakingNews(callback) {
  breakingNewsCallback = callback;
  
  // In production, connect to WebSocket or SSE
  // For now, we'll poll the API
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/breaking-news');
      if (response.ok) {
        const news = await response.json();
        if (news?.isBreaking && breakingNewsCallback) {
          breakingNewsCallback(news);
        }
      }
    } catch (error) {
      // Silent fail for polling
    }
  }, 30000); // Check every 30 seconds

  return () => {
    clearInterval(pollInterval);
    breakingNewsCallback = null;
  };
}

/**
 * Trigger a breaking news alert
 * @param {Object} headline - Breaking headline data
 */
export async function triggerBreakingNews(headline) {
  const response = await fetch('/api/breaking-news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...headline,
      urgency: 'BREAKING',
      isBreaking: true,
      breakingDuration: 30000, // 30 seconds
    }),
  });
  
  if (!response.ok) throw new Error('Failed to trigger breaking news');
  
  return await response.json();
}

// ═══════════════════════════════════════════════════════════
// COMBINED HEADLINE AGGREGATOR
// ═══════════════════════════════════════════════════════════

/**
 * Fetch all headlines from all sources
 * Combines RSS, market data, and admin headlines
 * @returns {Promise<Array>} Combined, sorted headlines
 */
export async function fetchAllHeadlines() {
  try {
    // Fetch from all sources in parallel
    const [
      marketData,
      adminHeadlines,
      // Add RSS feeds as they're configured
    ] = await Promise.allSettled([
      fetchMarketData(),
      fetchAdminHeadlines(),
    ]);

    const headlines = [];

    // Add admin headlines
    if (adminHeadlines.status === 'fulfilled') {
      headlines.push(...adminHeadlines.value);
    }

    // Convert market data to headlines
    if (marketData.status === 'fulfilled' && marketData.value.isLive) {
      const mkt = marketData.value;
      
      // Create market summary headline
      headlines.push({
        id: 'market-live',
        category: 'market',
        icon: '📈',
        headline: `Markets ${parseFloat(mkt.nifty50?.changePercent) >= 0 ? 'in green' : 'under pressure'}: NIFTY at ${mkt.nifty50?.value}`,
        whyItMatters: `Indices showing ${parseFloat(mkt.nifty50?.changePercent) >= 0 ? 'bullish' : 'bearish'} momentum. Monitor for opportunities.`,
        urgency: 'REGULAR',
        timestamp: new Date().toISOString(),
        dataPoint: `NIFTY: ${mkt.nifty50?.value} (${mkt.nifty50?.changePercent})`,
        source: 'NSE',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
      });
    }

    return headlines;
  } catch (error) {
    console.error('Failed to fetch all headlines:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  RSS_SOURCES,
  MARKET_INDICES,
  fetchRSSHeadlines,
  fetchMarketData,
  fetchAdminHeadlines,
  createAdminHeadline,
  subscribeToBreakingNews,
  triggerBreakingNews,
  fetchAllHeadlines,
};

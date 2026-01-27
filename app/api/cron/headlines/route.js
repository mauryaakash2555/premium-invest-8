/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIVE INTELLIGENCE HEADLINES CRON
 * 
 * Fetches headlines from MULTIPLE sources:
 * 1. NewsAPI - Global news aggregator
 * 2. Moneycontrol RSS - Indian finance news
 * 3. Economic Times RSS - Business & economy
 * 4. LiveMint RSS - Markets & finance
 * 5. Business Standard RSS
 * 
 * ⚠️ SEBI COMPLIANCE: All headlines are filtered to remove:
 * - Buy/sell recommendations
 * - Stock tips
 * - Target prices
 * - Investment advice
 * - Future predictions
 * 
 * Run manually: /api/cron/headlines
 * Vercel Cron: Set in vercel.json to run every 30 minutes
 * 
 * @file app/api/cron/headlines/route.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─────────────────────────────────────────────────────────────────────────────
// SEBI COMPLIANCE FILTER - Remove advisory content
// ⚠️ CRITICAL: You are NOT a SEBI registered advisor
// This filter removes any content that could be construed as investment advice
// ─────────────────────────────────────────────────────────────────────────────
const BLOCKED_PHRASES = [
  // Buy/Sell recommendations
  'buy now', 'sell now', 'strong buy', 'strong sell', 'must buy', 'must sell',
  'buy this stock', 'sell this stock', 'buy recommendation', 'sell recommendation',
  'recommended buy', 'recommended sell', 'time to buy', 'time to sell',
  'buying opportunity', 'selling opportunity', 'accumulate', 'underweight', 'overweight',
  
  // Stock tips
  'stock tip', 'stock pick', 'hot tip', 'insider tip', 'multibagger',
  'next multibagger', 'penny stock', 'double your money', 'triple your money',
  'guaranteed return', 'assured return', 'fixed return', 'high return guaranteed',
  
  // Target prices
  'target price', 'target ₹', 'target rs', 'price target', 'upside of',
  'can reach', 'will reach', 'expected to reach', 'could touch', 'may hit',
  
  // Future predictions (advice)
  'will go up', 'will go down', 'will rise', 'will fall', 'will rally',
  'expected to rise', 'expected to fall', 'likely to rise', 'likely to fall',
  'should invest', 'should buy', 'should sell', 'you should', 'we recommend',
  'our recommendation', 'we suggest', 'our pick', 'top pick',
  
  // Personalized advice
  'invest now', 'invest today', 'don\'t miss', 'last chance', 'limited time',
  'act now', 'hurry', 'before it\'s too late', 'subscribe now', 'join now',
  
  // Specific advice language
  'portfolio allocation', 'allocate to', 'increase exposure', 'reduce exposure',
  'add to portfolio', 'remove from portfolio', 'rebalance to', 'switch to',
];

function isSebiCompliant(text) {
  const lower = text.toLowerCase();
  
  // Check for blocked phrases
  for (const phrase of BLOCKED_PHRASES) {
    if (lower.includes(phrase)) {
      return { compliant: false, reason: `Contains: "${phrase}"` };
    }
  }
  
  // Check for specific patterns
  // Pattern: "buy XYZ" or "sell XYZ" where XYZ is likely a stock
  if (/\b(buy|sell)\s+[A-Z]{2,10}\b/i.test(text)) {
    return { compliant: false, reason: 'Contains buy/sell stock pattern' };
  }
  
  // Pattern: target price like "target ₹500" or "target 500"
  if (/target\s*[₹rs.]*\s*\d+/i.test(text)) {
    return { compliant: false, reason: 'Contains target price' };
  }
  
  // Pattern: "up X%" or "down X%" predictions
  if (/\b(can|will|should|may|could)\s+(go\s+)?(up|down|rise|fall)\s+\d+%/i.test(text)) {
    return { compliant: false, reason: 'Contains percentage prediction' };
  }
  
  return { compliant: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// RSS FEED SOURCES - Diverse sources for balanced coverage
// ─────────────────────────────────────────────────────────────────────────────
const RSS_SOURCES = [
  // ═══ Moneycontrol - Major financial portal ═══
  { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/marketreports.xml', category: 'market_update' },
  { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/business.xml', category: 'market_update' },
  { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/latestnews.xml', category: 'market_update' },
  
  // ═══ Economic Times - Largest business daily ═══
  { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'market_update' },
  { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms', category: 'market_update' },
  { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms', category: 'market_update' },
  { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/wealth/rssfeeds/2688008.cms', category: 'market_update' },
  
  // ═══ LiveMint - Business news from HT ═══
  { name: 'Mint', url: 'https://www.livemint.com/rss/markets', category: 'market_update' },
  { name: 'Mint', url: 'https://www.livemint.com/rss/money', category: 'market_update' },
  { name: 'Mint', url: 'https://www.livemint.com/rss/companies', category: 'market_update' },
  
  // ═══ Business Standard - Premium business news ═══
  { name: 'Business Standard', url: 'https://www.business-standard.com/rss/markets-106.rss', category: 'market_update' },
  { name: 'Business Standard', url: 'https://www.business-standard.com/rss/finance-102.rss', category: 'market_update' },
  { name: 'Business Standard', url: 'https://www.business-standard.com/rss/economy-102.rss', category: 'market_update' },
  
  // ═══ Financial Express - Business news ═══
  { name: 'Financial Express', url: 'https://www.financialexpress.com/feed/', category: 'market_update' },
  
  // ═══ NDTV Profit - Business channel ═══
  { name: 'NDTV Profit', url: 'https://feeds.feedburner.com/ndtvprofit-latest', category: 'market_update' },
  
  // ═══ Zeebiz - Zee Business ═══
  { name: 'Zee Business', url: 'https://www.zeebiz.com/rss/top-stories.xml', category: 'market_update' },
  
  // ═══ Reuters India - International wire service ═══
  { name: 'Reuters India', url: 'https://www.reuters.com/rssFeed/INBusinessNews', category: 'global' },
  
  // ═══ Bloomberg Quint (Now NDTV Profit) - Already covered above ═══
];

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY DETECTION - Maps keywords to categories
// ─────────────────────────────────────────────────────────────────────────────
function detectCategory(text) {
  const lower = text.toLowerCase();
  
  // RBI / Monetary Policy
  if (lower.includes('rbi') || lower.includes('reserve bank') || lower.includes('monetary policy') || lower.includes('repo rate')) 
    return 'rbi';
  
  // SEBI / Regulations
  if (lower.includes('sebi') || lower.includes('securities') || lower.includes('regulator')) 
    return 'sebi';
  
  // Tax Related
  if (lower.includes('tax') || lower.includes('gst') || lower.includes('income tax') || lower.includes('80c') || lower.includes('itr')) 
    return 'tax_insight';
  
  // Mutual Funds / SIP
  if (lower.includes('mutual fund') || lower.includes('sip') || lower.includes('amfi') || lower.includes('nav') || lower.includes('aum')) 
    return 'mutual_funds';
  
  // Fixed Deposits
  if (lower.includes('fixed deposit') || lower.includes(' fd ') || lower.includes('fd rate')) 
    return 'fixed_income';
  
  // Insurance
  if (lower.includes('insurance') || lower.includes('irdai') || lower.includes('lic') || lower.includes('premium')) 
    return 'insurance';
  
  // Gold / Commodities
  if (lower.includes('gold') || lower.includes('silver') || lower.includes('commodity') || lower.includes('mcx')) 
    return 'forex_gold';
  
  // IPO
  if (lower.includes('ipo') || lower.includes('initial public offer') || lower.includes('listing')) 
    return 'ipo';
  
  // Global Markets
  if (lower.includes('global') || lower.includes('us market') || lower.includes('dow jones') || lower.includes('nasdaq') || lower.includes('fed ')) 
    return 'global';
  
  // Market Movements (crashes, rallies)
  if (lower.includes('crash') || lower.includes('fall') || lower.includes('drop') || lower.includes('rally') || lower.includes('surge') || lower.includes('plunge')) 
    return 'market_move';
  
  // Regulatory / Policy
  if (lower.includes('regulation') || lower.includes('policy') || lower.includes('government') || lower.includes('ministry')) 
    return 'regulatory';
  
  // Corporate Actions
  if (lower.includes('dividend') || lower.includes('bonus') || lower.includes('split') || lower.includes('buyback') || lower.includes('merger') || lower.includes('acquisition')) 
    return 'corporate';
  
  // Default
  return 'market_update';
}

// ─────────────────────────────────────────────────────────────────────────────
// URGENCY DETECTION - Determines importance level
// ─────────────────────────────────────────────────────────────────────────────
function detectUrgency(text) {
  const lower = text.toLowerCase();
  
  // BREAKING - Immediate market impact
  if (lower.includes('breaking') || lower.includes('urgent') || lower.includes('just in') || lower.includes('flash')) 
    return 'BREAKING';
  
  // IMPORTANT - Significant news
  if (lower.includes('crash') || lower.includes('plunge') || lower.includes('surge') || 
      lower.includes('rbi') || lower.includes('sebi') || lower.includes('rate cut') || 
      lower.includes('rate hike') || lower.includes('record high') || lower.includes('record low')) 
    return 'IMPORTANT';
  
  // REGULAR - Normal news
  return 'REGULAR';
}

// ─────────────────────────────────────────────────────────────────────────────
// ICON MAPPING - Category to emoji
// ─────────────────────────────────────────────────────────────────────────────
const ICON_MAP = {
  'rbi': '🏛️',
  'sebi': '📋',
  'tax_insight': '📊',
  'mutual_funds': '💰',
  'fixed_income': '🏦',
  'insurance': '🛡️',
  'forex_gold': '💎',
  'ipo': '🚀',
  'global': '🌍',
  'market_move': '📈',
  'regulatory': '⚖️',
  'corporate': '🏢',
  'market_update': '📰',
};

// ─────────────────────────────────────────────────────────────────────────────
// RSS PARSER - Extracts items from RSS XML
// ─────────────────────────────────────────────────────────────────────────────
function parseRSS(xml) {
  const items = [];
  
  // Match all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    // Extract title
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    
    // Extract description
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    let description = descMatch ? descMatch[1].trim() : '';
    // Remove HTML tags from description
    description = description.replace(/<[^>]+>/g, '').trim();
    
    // Extract link
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
    const link = linkMatch ? linkMatch[1].trim() : null;
    
    // Extract pubDate
    const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
    const pubDate = dateMatch ? new Date(dateMatch[1].trim()) : new Date();
    
    if (title) {
      items.push({
        title: title.slice(0, 500), // Limit title length
        description: description.slice(0, 1000), // Limit description
        link,
        pubDate,
      });
    }
  }
  
  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH RSS FEED - Gets and parses a single RSS feed
// ─────────────────────────────────────────────────────────────────────────────
async function fetchRSSFeed(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'BMWealth-Bot/1.0 (+https://bmwealth.co.in)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.warn(`RSS fetch failed for ${source.name}: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const items = parseRSS(xml);
    
    // Add source info to each item
    return items.map(item => ({
      ...item,
      sourceName: source.name,
      defaultCategory: source.category,
    }));
  } catch (error) {
    console.warn(`RSS error for ${source.name}:`, error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH NEWSAPI - Gets headlines from NewsAPI
// ─────────────────────────────────────────────────────────────────────────────
async function fetchNewsAPI() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=(finance OR stock OR market OR investment OR mutual fund OR RBI OR SEBI) AND india&sortBy=publishedAt&language=en&pageSize=30&apiKey=${apiKey}`,
      { 
        headers: { 'User-Agent': 'BMWealth-Bot/1.0' }, 
        cache: 'no-store',
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return (data.articles || []).map(article => ({
      title: article.title,
      description: article.description || '',
      link: article.url,
      pubDate: new Date(article.publishedAt),
      sourceName: article.source?.name || 'NewsAPI',
      defaultCategory: 'market_update',
    }));
  } catch (error) {
    console.warn('NewsAPI error:', error.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSERT HEADLINE - Inserts a single headline to Supabase
// ⚠️ SEBI COMPLIANCE CHECK IS PERFORMED HERE
// ─────────────────────────────────────────────────────────────────────────────
async function insertHeadline(item) {
  const text = `${item.title} ${item.description}`;
  
  // ⚠️ SEBI COMPLIANCE CHECK - Filter out advisory content
  const compliance = isSebiCompliant(text);
  if (!compliance.compliant) {
    console.log(`🚫 BLOCKED (SEBI): "${item.title.slice(0, 50)}..." - ${compliance.reason}`);
    return { success: false, blocked: true, reason: compliance.reason };
  }
  
  const category = detectCategory(text);
  const urgency = detectUrgency(text);
  
  const payload = {
    category: category,
    icon: ICON_MAP[category] || '📰',
    headline: item.title,
    why_it_matters: item.description || item.title,
    urgency: urgency,
    data_point: item.sourceName,
    source: item.sourceName,
    cta_button: item.link ? { text: 'Read More', link: item.link, icon: '→' } : null,
    valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    is_active: true,
    is_breaking: urgency === 'BREAKING',
    created_by: 'cron',
  };
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/live_intelligence_headlines`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    }
  );
  
  return response.ok;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER - The cron endpoint
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req) {
  const startTime = Date.now();
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 500 });
    }
    
    // Collect headlines from ALL sources in parallel
    console.log('🚀 Starting multi-source headline fetch...');
    
    const [newsAPIItems, ...rssResults] = await Promise.all([
      fetchNewsAPI(),
      ...RSS_SOURCES.map(source => fetchRSSFeed(source)),
    ]);
    
    // Flatten all RSS results
    const rssItems = rssResults.flat();
    
    // Combine all items
    const allItems = [...newsAPIItems, ...rssItems];
    
    console.log(`📥 Fetched: NewsAPI=${newsAPIItems.length}, RSS=${rssItems.length}, Total=${allItems.length}`);
    
    if (allItems.length === 0) {
      return NextResponse.json({ 
        ok: true, 
        message: 'No articles found from any source',
        headlines_inserted: 0,
      });
    }
    
    // Deduplicate by title similarity (simple check)
    const seen = new Set();
    const uniqueItems = allItems.filter(item => {
      if (!item.title) return false;
      const key = item.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    console.log(`🔄 After dedup: ${uniqueItems.length} unique headlines`);
    
    // Insert headlines with SEBI compliance check
    let insertedCount = 0;
    let errorCount = 0;
    let blockedCount = 0;  // SEBI compliance blocks
    
    for (const item of uniqueItems) {
      const result = await insertHeadline(item);
      
      if (result && result.blocked) {
        blockedCount++;
      } else if (result === true || (result && result.success)) {
        insertedCount++;
      } else {
        errorCount++;
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Completed in ${duration}ms: Inserted=${insertedCount}, Blocked=${blockedCount}, Errors=${errorCount}`);
    
    return NextResponse.json({
      ok: true,
      sources: {
        newsapi: newsAPIItems.length,
        rss: rssItems.length,
        rss_sources: RSS_SOURCES.map(s => s.name),
        total_fetched: allItems.length,
        unique_after_dedup: uniqueItems.length,
      },
      headlines_inserted: insertedCount,
      sebi_blocked: blockedCount,  // Headlines blocked for compliance
      errors: errorCount,
      compliance_note: blockedCount > 0 
        ? `${blockedCount} headlines blocked for containing investment advice/recommendations (SEBI compliance)` 
        : 'All headlines passed SEBI compliance check',
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Headlines cron error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

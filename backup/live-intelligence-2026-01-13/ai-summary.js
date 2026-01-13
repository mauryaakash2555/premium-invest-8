/**
 * LIVE INTELLIGENCE - AI Summary Generator
 * 
 * Generates intelligent summaries for different market modes:
 * - Morning briefing (6AM): Pre-market preparation
 * - Night summary (9PM): "What You Missed Today"
 * - "Why it matters" for headlines
 * - SEBI compliance checking
 * 
 * @file lib/live-intelligence/ai-summary.js
 * @created January 13, 2026
 */

import { CATEGORIES, URGENCY_LEVELS } from './headlines';

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY PROMPTS
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are a senior financial analyst at BM Wealth, a premium wealth management firm in India. 
Your role is to provide clear, insightful market analysis in a professional yet accessible tone.

STRICT RULES:
- NEVER use phrases: "buy", "sell", "invest now", "guaranteed returns", "strong buy"
- ALWAYS use: "accumulation phase", "observational", "educational", "historical trend"
- All content is educational, not investment advice
- Be factual, cite sources when possible
- Use Indian financial context (NSE, BSE, SEBI, RBI, INR)
- Keep responses concise and actionable
- Format: Short sentences, bullet points where appropriate`;

const MORNING_PROMPT = `Generate a Morning Briefing for Indian market investors.

Include:
1. Global Cues (US market close, Asia opening, SGX Nifty)
2. Key Events Today (economic data, earnings, policy announcements)
3. Sector Watch (which sectors to monitor)
4. Risk Factors (things that could move markets)

Format as JSON:
{
  "title": "Morning Briefing - [Date]",
  "globalCues": [{"text": "...", "sentiment": "positive|negative|neutral"}],
  "keyEvents": [{"time": "9:00 AM", "event": "..."}],
  "sectorWatch": [{"sector": "...", "outlook": "..."}],
  "riskFactors": ["..."],
  "overallTone": "cautiously optimistic|neutral|cautious"
}`;

const NIGHT_SUMMARY_PROMPT = `Generate a Night Summary ("What You Missed Today") for Indian market investors.

Include:
1. Market Performance (NIFTY, SENSEX, key moves)
2. Top 3 Headlines of the Day
3. FII/DII Activity
4. Key Takeaways
5. Tomorrow's Watch

Format as JSON:
{
  "title": "What You Missed Today - [Date]",
  "marketSummary": {
    "nifty": {"close": "...", "change": "...", "changePercent": "..."},
    "sensex": {"close": "...", "change": "...", "changePercent": "..."},
    "trend": "bullish|bearish|sideways"
  },
  "topHeadlines": [{"headline": "...", "impact": "..."}],
  "fiiDii": {"fii": "...", "dii": "...", "trend": "..."},
  "keyTakeaways": ["..."],
  "tomorrowWatch": [{"event": "...", "time": "..."}],
  "overallTone": "optimistic|neutral|cautious"
}`;

// ═══════════════════════════════════════════════════════════════════════════
// SEBI COMPLIANCE CHECKER
// ═══════════════════════════════════════════════════════════════════════════

const SEBI_BANNED_PHRASES = [
  'buy now',
  'sell now',
  'strong buy',
  'strong sell',
  'guaranteed',
  'risk-free',
  'assured returns',
  'invest now',
  'don\'t miss',
  'act fast',
  'limited time',
  'our tip',
  'insider',
  'sure shot',
  'multibagger',
  '100% safe',
  'no risk',
];

const SEBI_SAFE_ALTERNATIVES = {
  'buy': 'accumulation phase visible',
  'sell': 'profit booking observed',
  'strong buy': 'bullish sentiment',
  'guaranteed': 'historically trending',
  'invest now': 'opportunity window',
  'multibagger': 'high growth potential',
};

/**
 * Check content for SEBI compliance
 * @param {string} content - Text to check
 * @returns {Object} Compliance result
 */
export function checkSEBICompliance(content) {
  const lowerContent = content.toLowerCase();
  const violations = [];
  
  for (const phrase of SEBI_BANNED_PHRASES) {
    if (lowerContent.includes(phrase)) {
      violations.push({
        phrase,
        suggestion: SEBI_SAFE_ALTERNATIVES[phrase] || 'Remove or rephrase',
      });
    }
  }
  
  return {
    isCompliant: violations.length === 0,
    violations,
    originalContent: content,
  };
}

/**
 * Auto-fix content for SEBI compliance
 * @param {string} content - Text to fix
 * @returns {string} Compliant content
 */
export function makeCompliant(content) {
  let fixed = content;
  
  for (const [banned, safe] of Object.entries(SEBI_SAFE_ALTERNATIVES)) {
    const regex = new RegExp(banned, 'gi');
    fixed = fixed.replace(regex, safe);
  }
  
  return fixed;
}

// ═══════════════════════════════════════════════════════════════════════════
// "WHY IT MATTERS" GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

const WHY_IT_MATTERS_TEMPLATES = {
  market: {
    positive: [
      'Indicates strong market sentiment, potential for continued upside',
      'Bullish signal for equity portfolios, monitor for opportunities',
      'Positive momentum could benefit large-cap holdings',
    ],
    negative: [
      'Suggests caution, review portfolio risk exposure',
      'Volatility expected, consider reviewing stop-losses',
      'Defensive positioning may be prudent in near term',
    ],
    neutral: [
      'Market awaiting direction, watch for breakout signals',
      'Consolidation phase, opportunities in stock-specific moves',
    ],
  },
  mutual_funds: {
    positive: [
      'Indicates retail investor confidence remains strong',
      'SIP flows provide stability to market liquidity',
      'Good time to review fund performance and rebalance',
    ],
    negative: [
      'Monitor redemption trends, may impact NAVs',
      'Consider reviewing expense ratios and fund selection',
    ],
    neutral: [
      'Normal fund activity, continue SIP as planned',
    ],
  },
  breaking: {
    positive: [
      'Major development, could reshape market dynamics',
      'Significant news, review portfolio alignment',
    ],
    negative: [
      'Breaking development requires immediate attention',
      'Major news, assess impact on current holdings',
    ],
    neutral: [
      'Important update, monitor for follow-up developments',
    ],
  },
  fixed_income: {
    positive: [
      'Attractive rates available, good for conservative investors',
      'Lock-in opportunity before potential rate cuts',
    ],
    negative: [
      'Rate environment changing, review FD laddering strategy',
    ],
    neutral: [
      'Steady rates, maintain diversified debt allocation',
    ],
  },
  forex_gold: {
    positive: [
      'Safe haven demand strong, portfolio hedge performing',
      'Currency moves favor export-oriented investments',
    ],
    negative: [
      'Volatility in commodities, review hedging needs',
    ],
    neutral: [
      'Commodity prices stable, maintain allocation',
    ],
  },
  insurance: {
    positive: [
      'Sector seeing growth, review coverage adequacy',
      'New products may offer better features',
    ],
    negative: [
      'Regulatory changes ahead, review policy terms',
    ],
    neutral: [
      'Steady sector, annual review recommended',
    ],
  },
  pms: {
    positive: [
      'HNI sentiment positive, PMS strategies performing',
      'Alpha generation visible in select strategies',
    ],
    negative: [
      'Volatility impacting returns, long-term view needed',
    ],
    neutral: [
      'Performance in line with benchmarks',
    ],
  },
  real_estate: {
    positive: [
      'Property market showing momentum, good for existing holders',
      'Rental yields improving in key metros',
    ],
    negative: [
      'Regulatory changes may impact transactions',
      'Rate hikes could affect EMIs and affordability',
    ],
    neutral: [
      'Steady market, location-specific opportunities exist',
    ],
  },
};

/**
 * Generate "Why It Matters" text for a headline
 * @param {Object} headline - Headline object
 * @returns {string} Why it matters text
 */
export function generateWhyItMatters(headline) {
  const category = headline.category || 'market';
  const templates = WHY_IT_MATTERS_TEMPLATES[category] || WHY_IT_MATTERS_TEMPLATES.market;
  
  // Determine sentiment from urgency or dataPoint
  let sentiment = 'neutral';
  if (headline.urgency === 'BREAKING' || headline.urgency === 'IMPORTANT') {
    // Check dataPoint for positive/negative
    const dataPoint = (headline.dataPoint || '').toLowerCase();
    if (dataPoint.includes('+') || dataPoint.includes('up') || dataPoint.includes('high')) {
      sentiment = 'positive';
    } else if (dataPoint.includes('-') || dataPoint.includes('down') || dataPoint.includes('low')) {
      sentiment = 'negative';
    }
  }
  
  const options = templates[sentiment] || templates.neutral;
  return options[Math.floor(Math.random() * options.length)];
}

// ═══════════════════════════════════════════════════════════════════════════
// AI SUMMARY GENERATOR (API-based)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate AI summary using OpenAI API
 * @param {string} type - 'morning' or 'night'
 * @param {Object} context - Market data, headlines, etc.
 * @returns {Promise<Object>} Generated summary
 */
export async function generateAISummary(type, context = {}) {
  try {
    const prompt = type === 'morning' ? MORNING_PROMPT : NIGHT_SUMMARY_PROMPT;
    
    const response = await fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        prompt,
        context,
        systemPrompt: SYSTEM_PROMPT,
      }),
    });
    
    if (!response.ok) {
      throw new Error('AI summary generation failed');
    }
    
    const result = await response.json();
    
    // Check compliance
    const compliance = checkSEBICompliance(JSON.stringify(result));
    if (!compliance.isCompliant) {
      console.warn('AI summary has compliance issues:', compliance.violations);
    }
    
    return result;
  } catch (error) {
    console.error('AI summary generation error:', error);
    return getFallbackSummary(type);
  }
}

/**
 * Get fallback summary when AI is unavailable
 */
function getFallbackSummary(type) {
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  if (type === 'morning') {
    return {
      title: `Morning Briefing - ${date}`,
      globalCues: [
        { text: 'US markets closed mixed overnight', sentiment: 'neutral' },
        { text: 'Asian markets trading flat', sentiment: 'neutral' },
      ],
      keyEvents: [
        { time: '9:15 AM', event: 'Market opens' },
        { time: '9:30 AM', event: 'F&O expiry data expected' },
      ],
      sectorWatch: [
        { sector: 'Banking', outlook: 'Watch for RBI policy impact' },
        { sector: 'IT', outlook: 'Dollar movement key factor' },
      ],
      riskFactors: [
        'Global uncertainty remains elevated',
        'FII flows need monitoring',
      ],
      overallTone: 'neutral',
    };
  }
  
  return {
    title: `What You Missed Today - ${date}`,
    marketSummary: {
      nifty: { close: '--', change: '--', changePercent: '--' },
      sensex: { close: '--', change: '--', changePercent: '--' },
      trend: 'neutral',
    },
    topHeadlines: [
      { headline: 'Markets traded in a range today', impact: 'Neutral' },
    ],
    fiiDii: { fii: '--', dii: '--', trend: 'Awaiting data' },
    keyTakeaways: ['Market awaiting fresh triggers'],
    tomorrowWatch: [],
    overallTone: 'neutral',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULED GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if it's time to generate a scheduled summary
 * @returns {Object|null} Summary type to generate or null
 */
export function checkScheduledSummary() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Morning summary at 6:00-6:05 AM
  if (hour === 6 && minute < 5) {
    return { type: 'morning', scheduled: true };
  }
  
  // Night summary at 21:00-21:05 (9 PM)
  if (hour === 21 && minute < 5) {
    return { type: 'night', scheduled: true };
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  checkSEBICompliance,
  makeCompliant,
  generateWhyItMatters,
  generateAISummary,
  checkScheduledSummary,
};

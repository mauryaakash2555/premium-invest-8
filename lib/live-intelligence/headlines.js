/**
 * LIVE INTELLIGENCE - HEADLINES DATA
 * 
 * Manages headline content, categories, and rotation logic.
 * For Phase 3: Using dummy data. Phase 4 will connect to real APIs.
 */

// Category definitions - All BM Wealth services
export const CATEGORIES = {
  market: {
    key: 'market',
    label: 'Share Market',
    icon: '📈',
    priority: 'HIGH',
  },
  mutual_funds: {
    key: 'mutual_funds',
    label: 'Mutual Funds',
    icon: '💰',
    priority: 'HIGH',
  },
  sip: {
    key: 'sip',
    label: 'SIP',
    icon: '📊',
    priority: 'HIGH',
  },
  breaking: {
    key: 'breaking',
    label: 'Breaking News',
    icon: '🔴',
    priority: 'URGENT',
  },
  insurance: {
    key: 'insurance',
    label: 'Insurance',
    icon: '🛡️',
    priority: 'MEDIUM',
  },
  fixed_income: {
    key: 'fixed_income',
    label: 'FD/RD/Bonds',
    icon: '🏦',
    priority: 'MEDIUM',
  },
  trading: {
    key: 'trading',
    label: 'Trading Services',
    icon: '📉',
    priority: 'HIGH',
  },
  pms: {
    key: 'pms',
    label: 'PMS/AIF',
    icon: '💎',
    priority: 'LOW',
  },
  real_estate: {
    key: 'real_estate',
    label: 'Real Estate',
    icon: '🏠',
    priority: 'MEDIUM',
  },
  forex_gold: {
    key: 'forex_gold',
    label: 'Forex/Gold',
    icon: '💵',
    priority: 'MEDIUM',
  },
};

// Urgency levels with visual properties
export const URGENCY_LEVELS = {
  BREAKING: {
    key: 'BREAKING',
    label: 'Breaking',
    color: 'rgba(255, 80, 80, 1)',
    colorDim: 'rgba(255, 80, 80, 0.25)',
    glow: 'rgba(255, 80, 80, 0.4)',
    duration: 30000, // 30 seconds
    weight: 100,
  },
  IMPORTANT: {
    key: 'IMPORTANT',
    label: 'Important',
    color: 'rgba(140, 180, 255, 1)',      // Premium blue (NOT gold)
    colorDim: 'rgba(140, 180, 255, 0.25)',
    glow: 'rgba(140, 180, 255, 0.4)',
    duration: 12000, // 12 seconds
    weight: 50,
  },
  PREMIUM: {
    key: 'PREMIUM',
    label: 'Premium',
    color: 'rgba(180, 120, 220, 1)',
    colorDim: 'rgba(180, 120, 220, 0.25)',
    glow: 'rgba(180, 120, 220, 0.4)',
    duration: 15000, // 15 seconds
    weight: 40,
  },
  REGULAR: {
    key: 'REGULAR',
    label: 'Regular',
    color: 'rgba(170, 198, 255, 1)',
    colorDim: 'rgba(170, 198, 255, 0.25)',
    glow: 'rgba(170, 198, 255, 0.3)',
    duration: 8000, // 8 seconds
    weight: 20,
  },
  EDUCATIONAL: {
    key: 'EDUCATIONAL',
    label: 'Learn',
    color: 'rgba(100, 180, 255, 1)',
    colorDim: 'rgba(100, 180, 255, 0.25)',
    glow: 'rgba(100, 180, 255, 0.3)',
    duration: 10000, // 10 seconds
    weight: 15,
  },
};

// Dummy headlines for Phase 3 testing
// Format: [CATEGORY] → [WHAT HAPPENED] → [WHY IT MATTERS]
export const DUMMY_HEADLINES = [
  {
    id: 'h1',
    category: 'market',
    headline: 'NIFTY crosses 25,000 for the first time in history',
    whyItMatters: 'Positive sentiment continues — momentum plays gaining strength',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: 'NIFTY: 25,047 (+0.38%)',
    source: 'NSE',
  },
  {
    id: 'h2',
    category: 'market',
    headline: 'Smart Money Alert: FIIs added ₹2,300 Cr into large-cap banks',
    whyItMatters: 'Accumulation phase visible in banking sector',
    urgency: 'PREMIUM',
    timestamp: new Date().toISOString(),
    dataPoint: 'Bank Nifty: +1.8%',
    source: 'NSE',
  },
  {
    id: 'h3',
    category: 'mutual_funds',
    headline: 'SIP inflows hit all-time high of ₹21,262 Cr in December',
    whyItMatters: 'Retail conviction remains strong despite market volatility',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: 'MF AUM: ₹52.7L Cr',
    source: 'AMFI',
  },
  {
    id: 'h4',
    category: 'fixed_income',
    headline: 'SBI revises FD rates: Now offering 7.25% for senior citizens',
    whyItMatters: 'Best rates in 18 months — good for conservative allocations',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '7.25% p.a.',
    source: 'SBI',
  },
  {
    id: 'h5',
    category: 'market',
    headline: 'IT sector leads gains on strong Q3 guidance from TCS',
    whyItMatters: 'Deal pipeline healthy — revival expectations building',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'IT Index: +2.3%',
    source: 'NSE',
  },
  {
    id: 'h6',
    category: 'insurance',
    headline: 'LIC launches new term plan with 20% lower premiums',
    whyItMatters: 'More affordable protection — review your coverage',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'Jeevan Amar 2.0',
    source: 'LIC',
  },
  {
    id: 'h7',
    category: 'forex_gold',
    headline: 'Gold touches ₹63,500/10g as global uncertainty rises',
    whyItMatters: 'Safe-haven demand increasing — consider gold allocation',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '₹63,500/10g (+0.8%)',
    source: 'MCX',
  },
  {
    id: 'h8',
    category: 'market',
    headline: 'RBI signals potential rate cut in February policy meet',
    whyItMatters: 'Rate-sensitive sectors may benefit — watch banks & realty',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: 'Repo: 6.50%',
    source: 'RBI',
  },
  {
    id: 'h9',
    category: 'mutual_funds',
    headline: 'Top 5 large-cap funds delivered 18%+ returns in 2025',
    whyItMatters: 'Quality outperformed — stick to consistent performers',
    urgency: 'EDUCATIONAL',
    timestamp: new Date().toISOString(),
    dataPoint: 'Avg: 18.4% CAGR',
    source: 'Value Research',
  },
  {
    id: 'h10',
    category: 'pms',
    headline: 'Marcellus CCP portfolio up 24% in 2025, beats benchmark',
    whyItMatters: 'Quality-focused approach continues to deliver alpha',
    urgency: 'PREMIUM',
    timestamp: new Date().toISOString(),
    dataPoint: '+24% vs +12% Nifty',
    source: 'Marcellus',
  },
  // SIP Headlines
  {
    id: 'h11',
    category: 'sip',
    headline: 'SIP inflows hit all-time high of ₹26,459 Cr in January',
    whyItMatters: 'Retail investors show strong conviction — consistency pays off',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '₹26,459 Cr',
    source: 'AMFI',
  },
  {
    id: 'h12',
    category: 'sip',
    headline: '10-year SIP in Nifty 50 index fund delivered 12.8% CAGR',
    whyItMatters: 'Long-term SIPs smooth out volatility — time is your friend',
    urgency: 'EDUCATIONAL',
    timestamp: new Date().toISOString(),
    dataPoint: '12.8% CAGR',
    source: 'NSE',
  },
  {
    id: 'h13',
    category: 'sip',
    headline: 'Step-up SIP: Increase amount by 10% yearly for 3x wealth',
    whyItMatters: 'Small increments compound massively over 15+ years',
    urgency: 'OPPORTUNITY',
    timestamp: new Date().toISOString(),
    dataPoint: '3x in 15 yrs',
    source: 'Premium Invest',
  },
  // Trading Services Headlines
  {
    id: 'h14',
    category: 'trading',
    headline: 'Nifty breaks 25,000 resistance — bulls in control',
    whyItMatters: 'Momentum traders eye 25,500 target, keep stops at 24,800',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: 'Nifty: 25,047',
    source: 'NSE',
  },
  {
    id: 'h15',
    category: 'trading',
    headline: 'Bank Nifty weekly options: Key strike levels for Thursday expiry',
    whyItMatters: 'Max pain at 50,000 — option writers likely to defend',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: 'OI: 50,000 PE/CE',
    source: 'NSE',
  },
  {
    id: 'h16',
    category: 'trading',
    headline: 'FII net buyers in cash market after 3-day selling streak',
    whyItMatters: 'Sentiment shift positive — watch for follow-through buying',
    urgency: 'MARKET_MOVE',
    timestamp: new Date().toISOString(),
    dataPoint: '+₹1,245 Cr',
    source: 'NSDL',
  },
];

/**
 * Get headlines filtered by category
 * @param {string|null} category - Category key or null for all
 * @returns {Array} Filtered headlines
 */
export function getHeadlinesByCategory(category = null) {
  if (!category || category === 'all') {
    return DUMMY_HEADLINES;
  }
  return DUMMY_HEADLINES.filter(h => h.category === category);
}

/**
 * Get headlines sorted by priority score
 * Priority = (Urgency × 3) + (Recency × 2) + (Category_Weight × 1)
 * @param {Array} headlines - Headlines to sort
 * @returns {Array} Sorted headlines
 */
export function sortByPriority(headlines) {
  const now = Date.now();
  
  return [...headlines].sort((a, b) => {
    const urgencyA = URGENCY_LEVELS[a.urgency]?.weight || 20;
    const urgencyB = URGENCY_LEVELS[b.urgency]?.weight || 20;
    
    const recencyA = Math.max(0, 60 - ((now - new Date(a.timestamp).getTime()) / 60000)); // Minutes old
    const recencyB = Math.max(0, 60 - ((now - new Date(b.timestamp).getTime()) / 60000));
    
    const catWeightA = CATEGORIES[a.category]?.priority === 'HIGH' ? 10 : 
                       CATEGORIES[a.category]?.priority === 'URGENT' ? 15 : 5;
    const catWeightB = CATEGORIES[b.category]?.priority === 'HIGH' ? 10 : 
                       CATEGORIES[b.category]?.priority === 'URGENT' ? 15 : 5;
    
    const scoreA = (urgencyA * 3) + (recencyA * 2) + catWeightA;
    const scoreB = (urgencyB * 3) + (recencyB * 2) + catWeightB;
    
    return scoreB - scoreA;
  });
}

/**
 * Get rotation speed for a headline based on urgency
 * @param {string} urgency - Urgency level key
 * @returns {number} Duration in milliseconds
 */
export function getRotationSpeed(urgency) {
  return URGENCY_LEVELS[urgency]?.duration || 8000;
}

/**
 * Format timestamp to relative time
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string
 */
export function formatRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

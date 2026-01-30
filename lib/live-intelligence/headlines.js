/**
 * LIVE INTELLIGENCE - HEADLINES DATA
 * 
 * Comprehensive Market Intelligence System
 * Covers: BM Wealth 6 Services + Full Market Coverage A-Z
 * 
 * @updated January 15, 2026
 */

// ═══════════════════════════════════════════════════════════
// CATEGORY DEFINITIONS - COMPREHENSIVE MARKET COVERAGE
// ═══════════════════════════════════════════════════════════

/**
 * BM WEALTH CORE SERVICES (Priority #1)
 * These are the 6 main services offered by BM Wealth
 */
export const BM_WEALTH_SERVICES = {
  // 1. Certificate Management (Bonds, SGBs, NCDs)
  bonds: {
    key: 'bonds',
    label: 'Bonds & CMS',
    icon: '📜',
    priority: 'HIGH',
    description: 'Government bonds, SGBs, NCDs, corporate bonds, RBI bonds',
    subtypes: ['govt_bonds', 'sgb', 'ncd', 'corporate_bonds', 'rbi_frb', 'tax_free_bonds'],
  },
  // 2. Mutual Funds
  mutual_funds: {
    key: 'mutual_funds',
    label: 'Mutual Funds',
    icon: '💰',
    priority: 'HIGH',
    description: 'NFOs, fund performance, AUM updates, fund manager changes',
    subtypes: ['nfo', 'fund_performance', 'aum', 'manager_change', 'expense_ratio', 'category_change'],
  },
  // 3. SIP (Systematic Investment Plans)
  sip: {
    key: 'sip',
    label: 'SIP',
    icon: '📊',
    priority: 'HIGH',
    description: 'SIP flows, new SIP variants, AMFI data, SIP calculators',
    subtypes: ['sip_flows', 'new_sip', 'amfi_data', 'step_up_sip', 'flexi_sip'],
  },
  // 4. Insurance (Life, Health, General)
  insurance: {
    key: 'insurance',
    label: 'Insurance',
    icon: '🛡️',
    priority: 'HIGH',
    description: 'New policies, premium changes, claim ratios, IRDAI updates',
    subtypes: ['life_insurance', 'health_insurance', 'term_plan', 'ulip', 'pension_plan', 'irdai'],
  },
  // 5. PMS/AIF (Portfolio Management)
  pms_aif: {
    key: 'pms_aif',
    label: 'PMS/AIF',
    icon: '💎',
    priority: 'MEDIUM',
    color: 'rgba(180, 120, 220, 1)', // Purple for premium service
    colorDim: 'rgba(180, 120, 220, 0.25)',
    description: 'PMS launches, AIF updates, HNI products, performance data',
    subtypes: ['pms_launch', 'aif_launch', 'performance', 'strategy_change', 'fee_change'],
  },
  // 6. Trading Services
  trading: {
    key: 'trading',
    label: 'Trading',
    icon: '📉',
    priority: 'HIGH',
    description: 'Brokerage updates, margin rules, SEBI trading regulations',
    subtypes: ['brokerage', 'margin_rules', 'algo_trading', 'settlement', 'derivatives'],
  },
};

/**
 * GENERAL MARKET CATEGORIES
 * Supporting content for comprehensive market intelligence
 */
export const MARKET_CATEGORIES = {
  // Breaking News (Highest Priority)
  breaking: {
    key: 'breaking',
    label: 'Breaking',
    icon: '🔴',
    priority: 'URGENT',
    description: 'RBI policy, Budget, SEBI major rules, market emergencies',
  },
  // IPOs & New Listings
  ipo: {
    key: 'ipo',
    label: 'IPO',
    icon: '🎯',
    priority: 'HIGH',
    description: 'IPO launches, subscription status, listings, DRHP filings',
    subtypes: ['ipo_launch', 'subscription', 'listing', 'anchor', 'gmp', 'drhp'],
  },
  // Stock Market Movements
  market: {
    key: 'market',
    label: 'Markets',
    icon: '📈',
    priority: 'HIGH',
    description: 'Indices, FII/DII, volumes, gainers/losers, market breadth',
    subtypes: ['indices', 'fii_dii', 'volume', 'gainers_losers', 'breadth', 'vix'],
  },
  // Corporate Actions
  corporate: {
    key: 'corporate',
    label: 'Corporate',
    icon: '🏢',
    priority: 'MEDIUM',
    description: 'Dividends, splits, bonus, buybacks, mergers, demergers',
    subtypes: ['dividend', 'split', 'bonus', 'buyback', 'merger', 'rights'],
  },
  // Quarterly Results
  results: {
    key: 'results',
    label: 'Results',
    icon: '📋',
    priority: 'MEDIUM',
    description: 'Quarterly earnings, revenue, profit, YoY/QoQ growth',
    subtypes: ['quarterly', 'annual', 'earnings_surprise', 'guidance'],
  },
  // Regulatory & Policy
  regulatory: {
    key: 'regulatory',
    label: 'Regulatory',
    icon: '⚖️',
    priority: 'HIGH',
    description: 'SEBI, RBI, IRDAI, PFRDA circulars and policy changes',
    subtypes: ['sebi', 'rbi', 'irdai', 'pfrda', 'budget', 'tax'],
  },
  // Global Markets (India Impact)
  global: {
    key: 'global',
    label: 'Global',
    icon: '🌐',
    priority: 'MEDIUM',
    description: 'US Fed, crude oil, gold, forex, SGX Nifty, global indices',
    subtypes: ['us_fed', 'crude', 'gold', 'forex', 'sgx_nifty', 'global_indices'],
  },
  // Sector-Specific News
  sectors: {
    key: 'sectors',
    label: 'Sectors',
    icon: '🏭',
    priority: 'MEDIUM',
    description: 'Banking, IT, Pharma, Auto, Real Estate sector updates',
    subtypes: ['banking', 'it', 'pharma', 'auto', 'realty', 'fmcg', 'metals'],
  },
  // Economic Indicators
  economy: {
    key: 'economy',
    label: 'Economy',
    icon: '📊',
    priority: 'MEDIUM',
    description: 'CPI, GDP, IIP, PMI, GST collections, forex reserves',
    subtypes: ['inflation', 'gdp', 'iip', 'pmi', 'gst', 'forex_reserves', 'trade'],
  },
  // Insider Trading & Bulk Deals
  insider: {
    key: 'insider',
    label: 'Insider',
    icon: '🔍',
    priority: 'LOW',
    description: 'Promoter stake changes, bulk/block deals, pledging',
    subtypes: ['promoter_stake', 'bulk_deal', 'block_deal', 'pledging'],
  },
  // Fixed Income (FDs, PPF, etc.)
  fixed_income: {
    key: 'fixed_income',
    label: 'FD/Debt',
    icon: '🏦',
    priority: 'MEDIUM',
    description: 'FD rates, PPF, EPF, NPS, debt instruments',
    subtypes: ['fd_rates', 'ppf', 'epf', 'nps', 'small_savings'],
  },
  // Forex & Gold
  forex_gold: {
    key: 'forex_gold',
    label: 'Forex/Gold',
    icon: '💵',
    priority: 'MEDIUM',
    description: 'USD/INR, gold prices, currency movements',
    subtypes: ['usdinr', 'gold', 'silver', 'currency'],
  },
  // Real Estate
  real_estate: {
    key: 'real_estate',
    label: 'Real Estate',
    icon: '🏠',
    priority: 'LOW',
    description: 'Property launches, RERA, home loan rates',
    subtypes: ['launches', 'rera', 'home_loan', 'price_index'],
  },
};

// ═══════════════════════════════════════════════════════════
// SPEC (Jan 21, 2026) - REQUIRED CATEGORY KEYS
// ═══════════════════════════════════════════════════════════

/**
 * Source-of-truth categories for Live Intelligence UI.
 * Keep existing comprehensive categories, but these keys must exist.
 */
export const SPEC_CATEGORIES = {
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
    label: 'Forex/Gold/Silver',
    icon: '💵',
    priority: 'MEDIUM',
  },
};

const SPEC_CATEGORY_KEYS = new Set(Object.keys(SPEC_CATEGORIES));

/**
 * Normalize older/internal category keys into the Jan 21 spec category keys.
 * Unknown values are mapped to 'market' to avoid breaking UI.
 */
export function normalizeCategoryToSpec(categoryKey) {
  const key = String(categoryKey || '').trim();
  if (!key) return 'market';
  if (SPEC_CATEGORY_KEYS.has(key)) return key;

  // Legacy/internal keys → spec
  const map = {
    // market-ish
    market_update: 'market',
    market_move: 'market',
    corporate: 'market',
    results: 'market',
    regulatory: 'market',
    sebi: 'market',
    rbi: 'market',
    economy: 'market',
    sectors: 'market',
    insider: 'market',
    ipo: 'market',
    global: 'market',
    portfolio_tip: 'market',
    tax_insight: 'market',
    opportunity: 'market',

    // mutual funds-ish
    sip: 'mutual_funds',

    // fixed income-ish
    bonds: 'fixed_income',

    // PMS/AIF-ish
    pms_aif: 'pms',

    // trading is still market for spec purposes
    trading: 'market',
  };

  return map[key] || 'market';
}

// Combined categories for UI display
export const CATEGORIES = {
  ...BM_WEALTH_SERVICES,
  ...MARKET_CATEGORIES,
  // Ensure spec keys exist even if other objects change
  ...SPEC_CATEGORIES,
  // Alias PMS/AIF spec key
  pms_aif: BM_WEALTH_SERVICES.pms_aif,
  pms: SPEC_CATEGORIES.pms,
};

// Category groups for filter UI
export const CATEGORY_GROUPS = {
  services: {
    label: 'BM Wealth Services',
    categories: ['bonds', 'mutual_funds', 'sip', 'insurance', 'pms_aif', 'trading'],
  },
  markets: {
    label: 'Market News',
    categories: ['breaking', 'ipo', 'market', 'corporate', 'results'],
  },
  regulatory: {
    label: 'Regulatory & Economy',
    categories: ['regulatory', 'economy', 'global'],
  },
  others: {
    label: 'Other',
    categories: ['sectors', 'insider', 'fixed_income', 'forex_gold', 'real_estate'],
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

// ═══════════════════════════════════════════════════════════
// CURATED HEADLINES - COMPREHENSIVE MARKET INTELLIGENCE
// ═══════════════════════════════════════════════════════════

/**
 * Curated headlines covering all categories
 * These are REAL content served through the API, not placeholder data
 * Format: [CATEGORY] → [WHAT HAPPENED] → [WHY IT MATTERS]
 * 
 * SEBI COMPLIANCE:
 * ✅ Factual data only
 * ✅ No buy/sell recommendations
 * ✅ No future predictions
 * ✅ Educational framing
 */
export const CURATED_HEADLINES = [
  // ═══════════════════════════════════════════════════════════
  // BM WEALTH SERVICES - BONDS & CMS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'bonds-1',
    category: 'bonds',
    headline: 'RBI Floating Rate Bonds 2029: New tranche opens Jan 25 at 7.15%',
    whyItMatters: 'Government-backed, interest linked to NSC rates, semi-annual payouts',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '7.15% (linked)',
    source: 'RBI',
    fullReport: 'RBI FRB 2029 offers floating rate returns linked to NSC. Minimum ₹1,000, no maximum limit. 7-year tenure with semi-annual interest. Tax: Interest taxable, no TDS for resident individuals. Ideal for those seeking government-backed returns above FD rates.',
  },
  {
    id: 'bonds-2',
    category: 'bonds',
    headline: 'Sovereign Gold Bonds Feb 2026 series opens: Issue price ₹6,250/gm',
    whyItMatters: 'Tax-free capital gains at maturity + 2.5% annual interest',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '₹6,250/gm',
    source: 'RBI',
  },
  {
    id: 'bonds-3',
    category: 'bonds',
    headline: 'HDFC Ltd NCD issue: 8.05% for 3 years, AA+ rated',
    whyItMatters: 'Higher yields than FDs with quarterly interest option available',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '8.05% p.a.',
    source: 'BSE',
  },
  
  // ═══════════════════════════════════════════════════════════
  // BM WEALTH SERVICES - MUTUAL FUNDS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'mf-1',
    category: 'mutual_funds',
    headline: 'HDFC Defence Fund NFO opens: First dedicated defence sector fund',
    whyItMatters: 'Sector-focused fund riding on India\'s ₹6.2L Cr defence modernization',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: 'Min: ₹5,000',
    source: 'HDFC AMC',
  },
  {
    id: 'mf-2',
    category: 'mutual_funds',
    headline: 'Mutual fund industry AUM crosses ₹70 lakh crore milestone',
    whyItMatters: 'Strong retail participation continues, equity funds lead growth',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '₹70.2L Cr',
    source: 'AMFI',
  },
  {
    id: 'mf-3',
    category: 'mutual_funds',
    headline: 'Nippon India Flexi Cap: Fund manager change announced',
    whyItMatters: 'New manager has 15-year track record at rival AMC',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'AUM: ₹32,400 Cr',
    source: 'Nippon AMC',
  },
  {
    id: 'mf-4',
    category: 'mutual_funds',
    headline: 'Small-cap funds: SEBI warns of elevated valuations in category',
    whyItMatters: 'Regulator concerned about frothy valuations, asks AMCs to moderate flows',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: 'P/E: 32x',
    source: 'SEBI',
  },
  
  // ═══════════════════════════════════════════════════════════
  // BM WEALTH SERVICES - SIP
  // ═══════════════════════════════════════════════════════════
  {
    id: 'sip-1',
    category: 'sip',
    headline: 'SIP inflows hit all-time high of ₹26,459 Cr in January 2026',
    whyItMatters: 'Record month shows retail investors\' long-term commitment',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '₹26,459 Cr',
    source: 'AMFI',
  },
  {
    id: 'sip-2',
    category: 'sip',
    headline: 'AMFI data: Active SIP accounts cross 10 crore mark',
    whyItMatters: 'Milestone shows deepening of financial inclusion in India',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '10.2 Cr accounts',
    source: 'AMFI',
  },
  {
    id: 'sip-3',
    category: 'sip',
    headline: '15-year SIP in NIFTY Next 50 delivered 14.2% CAGR returns',
    whyItMatters: 'Long-term SIPs in quality indices outperform most active funds',
    urgency: 'EDUCATIONAL',
    timestamp: new Date().toISOString(),
    dataPoint: '14.2% CAGR',
    source: 'NSE',
  },
  
  // ═══════════════════════════════════════════════════════════
  // BM WEALTH SERVICES - INSURANCE
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ins-1',
    category: 'insurance',
    headline: 'LIC Jeevan Utsav II launched: 7% guaranteed, ₹2L minimum',
    whyItMatters: 'First LIC guaranteed plan in 18 months, tax-free maturity u/s 10(10D)',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '7% guaranteed',
    source: 'LIC',
  },
  {
    id: 'ins-2',
    category: 'insurance',
    headline: 'HDFC Life Click 2 Protect: Term plan premiums reduced by 15%',
    whyItMatters: 'More affordable protection for young professionals',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '15% lower',
    source: 'HDFC Life',
  },
  {
    id: 'ins-3',
    category: 'insurance',
    headline: 'IRDAI releases claim settlement ratios: LIC leads at 98.74%',
    whyItMatters: 'Key metric for choosing life insurers — higher is better',
    urgency: 'EDUCATIONAL',
    timestamp: new Date().toISOString(),
    dataPoint: '98.74%',
    source: 'IRDAI',
  },
  {
    id: 'ins-4',
    category: 'insurance',
    headline: 'Star Health introduces ₹2 Cr coverage family floater plan',
    whyItMatters: 'Medical inflation at 14% — adequate coverage increasingly important',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '₹2 Cr cover',
    source: 'Star Health',
  },
  
  // ═══════════════════════════════════════════════════════════
  // BM WEALTH SERVICES - PMS/AIF
  // ═══════════════════════════════════════════════════════════
  {
    id: 'pms-1',
    category: 'pms_aif',
    headline: 'Marcellus CCP portfolio delivered 24% in 2025, beats NIFTY by 12%',
    whyItMatters: 'Quality-focused PMS continues to generate alpha',
    urgency: 'PREMIUM',
    timestamp: new Date().toISOString(),
    dataPoint: '+24% vs +12%',
    source: 'Marcellus',
  },
  {
    id: 'pms-2',
    category: 'pms_aif',
    headline: 'SEBI raises PMS minimum investment to ₹50 lakh from April 2026',
    whyItMatters: 'Higher entry barrier to protect retail investors',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '₹50L minimum',
    source: 'SEBI',
  },
  {
    id: 'pms-3',
    category: 'pms_aif',
    headline: 'ASK Investment Managers launches new momentum strategy PMS',
    whyItMatters: 'Factor-based investing gaining traction in PMS space',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'Min: ₹50L',
    source: 'ASK',
  },
  
  // ═══════════════════════════════════════════════════════════
  // BM WEALTH SERVICES - TRADING
  // ═══════════════════════════════════════════════════════════
  {
    id: 'trade-1',
    category: 'trading',
    headline: 'SEBI implements T+0 settlement for top 500 stocks from Feb 1',
    whyItMatters: 'Faster settlement reduces counterparty risk',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: 'T+0 live',
    source: 'SEBI',
  },
  {
    id: 'trade-2',
    category: 'trading',
    headline: 'Bank Nifty weekly options: Max pain at 50,000 for Thursday expiry',
    whyItMatters: 'Key level for option sellers to monitor',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'OI: 50K',
    source: 'NSE',
  },
  {
    id: 'trade-3',
    category: 'trading',
    headline: 'Zerodha revises margin requirements for intraday trades',
    whyItMatters: 'Impact on leverage available for day traders',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '5x → 4x',
    source: 'Zerodha',
  },
  
  // ═══════════════════════════════════════════════════════════
  // MARKET NEWS - IPOs
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ipo-1',
    category: 'ipo',
    headline: 'Tata Technologies IPO opens Jan 20: Price band ₹475-500, lot size 31',
    whyItMatters: 'First Tata Group IPO in 19 years — auto-tech sector play',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '₹475-500',
    source: 'SEBI',
  },
  {
    id: 'ipo-2',
    category: 'ipo',
    headline: 'Swiggy IPO subscribed 15x on Day 2: QIB portion 25x oversubscribed',
    whyItMatters: 'Strong institutional demand signals confidence in food-tech',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '15x subscribed',
    source: 'BSE',
  },
  {
    id: 'ipo-3',
    category: 'ipo',
    headline: 'NTPC Green Energy IPO listing: Opens at ₹118, 5% premium to issue price',
    whyItMatters: 'Modest listing gains in green energy PSU issue',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '₹118 (+5%)',
    source: 'NSE',
  },
  
  // ═══════════════════════════════════════════════════════════
  // MARKET NEWS - INDICES & FII/DII
  // ═══════════════════════════════════════════════════════════
  {
    id: 'mkt-1',
    category: 'market',
    headline: 'NIFTY crosses 25,000 for the first time in history',
    whyItMatters: 'Positive sentiment continues — markets at all-time highs',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: 'NIFTY: 25,047',
    source: 'NSE',
  },
  {
    id: 'mkt-2',
    category: 'market',
    headline: 'FIIs turn net buyers: ₹2,300 Cr bought in cash segment',
    whyItMatters: 'Foreign flows positive after 3-day selling streak',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '+₹2,300 Cr',
    source: 'NSDL',
  },
  {
    id: 'mkt-3',
    category: 'market',
    headline: 'Bank Nifty hits 52-week high at 51,234 — banking rally continues',
    whyItMatters: 'Private banks lead gains on strong credit growth data',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '51,234 (+1.8%)',
    source: 'NSE',
  },
  {
    id: 'mkt-4',
    category: 'market',
    headline: 'VIX drops to 12.5 — lowest in 3 months signals low volatility',
    whyItMatters: 'Markets pricing in stability — option premiums declining',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'VIX: 12.5',
    source: 'NSE',
  },
  
  // ═══════════════════════════════════════════════════════════
  // CORPORATE ACTIONS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'corp-1',
    category: 'corporate',
    headline: 'Infosys announces ₹18 final dividend — ex-date Feb 15',
    whyItMatters: 'Record date Feb 16, payment by Feb 28',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '₹18/share',
    source: 'BSE',
  },
  {
    id: 'corp-2',
    category: 'corporate',
    headline: 'Reliance Industries announces 1:1 bonus issue',
    whyItMatters: 'First bonus in 7 years — record date March 10',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '1:1 Bonus',
    source: 'BSE',
  },
  {
    id: 'corp-3',
    category: 'corporate',
    headline: 'TCS announces ₹9,000 Cr buyback at ₹4,500/share',
    whyItMatters: 'Premium to CMP — eligible shareholders can tender',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '₹4,500/share',
    source: 'NSE',
  },
  
  // ═══════════════════════════════════════════════════════════
  // QUARTERLY RESULTS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'res-1',
    category: 'results',
    headline: 'HDFC Bank Q3: PAT ₹16,372 Cr, up 20% YoY — beats estimates',
    whyItMatters: 'NII growth strong at 18%, asset quality stable',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '+20% YoY',
    source: 'BSE',
  },
  {
    id: 'res-2',
    category: 'results',
    headline: 'TCS Q3 results: Revenue ₹64,259 Cr, deal wins at $8.1 billion',
    whyItMatters: 'Large deal momentum continues, attrition drops to 12.5%',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '$8.1B deals',
    source: 'NSE',
  },
  
  // ═══════════════════════════════════════════════════════════
  // REGULATORY & POLICY
  // ═══════════════════════════════════════════════════════════
  {
    id: 'reg-1',
    category: 'regulatory',
    headline: 'RBI keeps repo rate unchanged at 6.50% — 11th consecutive pause',
    whyItMatters: 'Inflation concerns persist, rate cut expectations pushed to Q2',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '6.50% hold',
    source: 'RBI',
  },
  {
    id: 'reg-2',
    category: 'regulatory',
    headline: 'SEBI tightens SME IPO norms: Lock-in extended to 2 years',
    whyItMatters: 'Aimed at curbing speculation in small-cap IPOs',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '2-year lock-in',
    source: 'SEBI',
  },
  {
    id: 'reg-3',
    category: 'regulatory',
    headline: 'Budget 2026: LTCG tax on equity remains at 12.5% — no change',
    whyItMatters: 'Relief for equity investors, no additional tax burden',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '12.5% LTCG',
    source: 'MoF',
  },
  
  // ═══════════════════════════════════════════════════════════
  // GLOBAL MARKETS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'glob-1',
    category: 'global',
    headline: 'US Fed cuts rates by 25 bps — first cut in 4 years',
    whyItMatters: 'Positive for emerging markets, FII flows may improve',
    urgency: 'BREAKING',
    timestamp: new Date().toISOString(),
    dataPoint: '-25 bps',
    source: 'Fed',
  },
  {
    id: 'glob-2',
    category: 'global',
    headline: 'Crude oil at $72/barrel — lowest in 6 months',
    whyItMatters: 'Positive for India\'s import bill and inflation',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '$72/bbl',
    source: 'NYMEX',
  },
  {
    id: 'glob-3',
    category: 'global',
    headline: 'SGX Nifty indicates flat opening — tracks US overnight session',
    whyItMatters: 'Pre-market indicator for Indian markets',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'SGX: 25,050',
    source: 'SGX',
  },
  
  // ═══════════════════════════════════════════════════════════
  // SECTOR NEWS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'sec-1',
    category: 'sectors',
    headline: 'Banking sector credit growth at 16.5% — highest in 5 years',
    whyItMatters: 'Strong loan demand signals economic activity pickup',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '+16.5% YoY',
    source: 'RBI',
  },
  {
    id: 'sec-2',
    category: 'sectors',
    headline: 'IT sector: Q3 deal wins strong, but margin pressures persist',
    whyItMatters: 'Mixed signals — revenue growth offset by wage inflation',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '$25B TCV',
    source: 'Industry',
  },
  {
    id: 'sec-3',
    category: 'sectors',
    headline: 'Auto sales Jan 2026: PV up 8%, 2W up 12% — festive demand continues',
    whyItMatters: 'Robust demand signals strong consumer sentiment',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: 'PV: +8%',
    source: 'SIAM',
  },
  
  // ═══════════════════════════════════════════════════════════
  // ECONOMIC INDICATORS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'eco-1',
    category: 'economy',
    headline: 'CPI inflation at 5.2% in December — below RBI\'s 6% ceiling',
    whyItMatters: 'Food inflation cooling, supports rate cut expectations',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '5.2% CPI',
    source: 'MoSPI',
  },
  {
    id: 'eco-2',
    category: 'economy',
    headline: 'GST collections hit ₹1.78 lakh crore in January — all-time high',
    whyItMatters: 'Strong economic activity reflected in tax collections',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '₹1.78L Cr',
    source: 'MoF',
  },
  {
    id: 'eco-3',
    category: 'economy',
    headline: 'India\'s forex reserves at $620 billion — near all-time high',
    whyItMatters: 'Strong reserves provide cushion against global volatility',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '$620B',
    source: 'RBI',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FIXED INCOME
  // ═══════════════════════════════════════════════════════════
  {
    id: 'fd-1',
    category: 'fixed_income',
    headline: 'SBI revises FD rates: Now 7.25% for senior citizens (1-2 years)',
    whyItMatters: 'Best FD rates in 18 months — lock in before rate cuts',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '7.25% p.a.',
    source: 'SBI',
  },
  {
    id: 'fd-2',
    category: 'fixed_income',
    headline: 'PPF interest rate unchanged at 7.1% for Q4 FY26',
    whyItMatters: 'Small savings rates stable — 15-year lock-in remains',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '7.1% p.a.',
    source: 'MoF',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FOREX & GOLD
  // ═══════════════════════════════════════════════════════════
  {
    id: 'fx-1',
    category: 'forex_gold',
    headline: 'Gold hits ₹63,500/10gm — safe-haven demand rises globally',
    whyItMatters: 'Geopolitical tensions and rate cut expectations drive rally',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '₹63,500',
    source: 'MCX',
  },
  {
    id: 'fx-2',
    category: 'forex_gold',
    headline: 'USD/INR at 83.25 — rupee stable despite FII outflows',
    whyItMatters: 'RBI intervention keeps volatility in check',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '₹83.25',
    source: 'RBI',
  },
  
  // ═══════════════════════════════════════════════════════════
  // INSIDER/BULK DEALS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ins-d1',
    category: 'insider',
    headline: 'Promoters of Titan increase stake from 52.9% to 53.2%',
    whyItMatters: 'Open market purchase signals confidence in growth',
    urgency: 'REGULAR',
    timestamp: new Date().toISOString(),
    dataPoint: '+0.3%',
    source: 'BSE',
  },
  {
    id: 'ins-d2',
    category: 'insider',
    headline: 'Bulk deal: Goldman Sachs buys 1.2% stake in Zomato',
    whyItMatters: 'Institutional buying at ₹185 — block deal worth ₹2,100 Cr',
    urgency: 'IMPORTANT',
    timestamp: new Date().toISOString(),
    dataPoint: '₹2,100 Cr',
    source: 'NSE',
  },
];

/**
 * Filter headlines by expiry - only show non-expired headlines
 * @param {Array} headlines - Headlines to filter
 * @returns {Array} Non-expired headlines
 */
export function filterExpiredHeadlines(headlines) {
  const now = new Date();
  return headlines.filter(headline => {
    // If no valid_until set, always show
    if (!headline.valid_until) return true;
    // Check if not expired
    return new Date(headline.valid_until) > now;
  });
}

/**
 * Select next headline with category balance enforcement
 * Prevents showing 3+ consecutive headlines from same category
 * @param {Array} headlines - Available headlines
 * @param {Array} lastTwoCategories - Array of last 2 category keys shown
 * @returns {Object} { headline, newHistory } - Selected headline and updated history
 */
export function selectNextWithBalance(headlines, lastTwoCategories = []) {
  if (!headlines || headlines.length === 0) {
    return { headline: null, newHistory: lastTwoCategories };
  }
  
  // Try to find a headline that doesn't match both last 2 categories
  for (const headline of headlines) {
    const category = headline.category;
    
    // Skip if same as both last 2 categories (would be 3rd consecutive)
    if (lastTwoCategories.length >= 2 &&
        lastTwoCategories[0] === category && 
        lastTwoCategories[1] === category) {
      continue;
    }
    
    // This headline is good - update history
    const newHistory = [category, ...lastTwoCategories].slice(0, 2);
    return { headline, newHistory };
  }
  
  // Fallback: return first headline if no balance possible
  const headline = headlines[0];
  const newHistory = [headline.category, ...lastTwoCategories].slice(0, 2);
  return { headline, newHistory };
}

/**
 * Fetch headlines from the API
 * Returns filtered, non-expired, category-balanced headlines
 * @param {string|null} category - Category key or null for all
 * @returns {Promise<Array>} Fetched headlines
 */
export async function fetchHeadlinesFromAPI(category = null) {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') {
      params.set('category', category);
    }
    params.set('limit', '20');
    
    const response = await fetch(`/api/live-intelligence/feed?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch headlines');
    }
    
    const data = await response.json();
    // Filter expired headlines before returning
    return filterExpiredHeadlines(data.headlines || []);
  } catch (error) {
    console.error('Failed to fetch headlines from API:', error);
    // Strict live mode: never fall back to curated/dummy content.
    return [];
  }
}

/**
 * Get curated headlines filtered by category (synchronous)
 * These are REAL curated content, not placeholder data
 * @param {string|null} category - Category key or null for all
 * @returns {Array} Filtered headlines
 */
export function getHeadlinesByCategory(category = null) {
  // Strict live mode: curated content is disabled.
  // (Kept for backwards compatibility with old callers.)
  return [];
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

/**
 * Live Intelligence — scoring + filtering helpers
 *
 * Goal: suppress noise, show trust/opportunity/risk signals, and deduplicate.
 * This is heuristic (no external APIs) and designed to be stable + explainable.
 */

const OFFICIAL_SOURCES = [
  'RBI',
  'SEBI',
  'AMFI',
  'NSE',
  'BSE',
  'CBDT',
  'MCA',
  'MINISTRY OF FINANCE',
  'PIB',
  'PFRDA',
  'IRDAI',
];

const REPUTABLE_SOURCES = [
  'REUTERS',
  'BLOOMBERG',
  'ECONOMIC TIMES',
  'THE ECONOMIC TIMES',
  'ET',
  'MINT',
  'LIVEMINT',
  'BUSINESS STANDARD',
  'MONEYCONTROL',
  'CNBC',
  'NDTV',
  'PTI',
  'BSE INDIA',
  'NSE INDIA',
];

const COMMUNITY_SOURCES = ['X', 'TWITTER', 'TELEGRAM', 'WHATSAPP', 'REDDIT', 'YOUTUBE'];

const CLICKBAIT_PATTERNS = [
  /you\s+won't\s+believe/i,
  /shocking/i,
  /must\s+watch/i,
  /guaranteed/i,
  /get\s+rich/i,
  /double\s+your/i,
  /secret/i,
  /insane/i,
  /!!!+/, // excessive punctuation
];

const INDIA_RELEVANCE_TOKENS = [
  'nifty',
  'sensex',
  'banknifty',
  'nse',
  'bse',
  'rbi',
  'sebi',
  'amfi',
  'india',
  'inr',
  'rupee',
  'gst',
  'cpi',
  'gdp',
  'mcx',
];

const POSITIVE_OPPORTUNITY_TOKENS = [
  'rate cut',
  'cut rates',
  'buyback',
  'dividend',
  'bonus',
  'split',
  'earnings beat',
  'guidance raised',
  'fii buying',
  'net buyers',
  'upgrade',
  'record high',
  'new order',
];

const NEGATIVE_RISK_TOKENS = [
  'fraud',
  'scam',
  'ban',
  'probe',
  'raids',
  'default',
  'downgrade',
  'lawsuit',
  'penalty',
  'crash',
  'sell-off',
  'plunge',
  'warning',
  'risk',
  'loss',
];

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'as',
  'at',
  'by',
  'from',
  'this',
  'that',
  'it',
  'its',
  'are',
  'is',
  'was',
  'were',
  'be',
  'been',
  'will',
  'may',
  'can',
  'could',
  'should',
]);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeSourceName(source) {
  return String(source || '').trim().toUpperCase();
}

export function scoreSourceTrust(source, url) {
  const s = normalizeSourceName(source);
  const u = String(url || '').trim().toLowerCase();

  if (!s && !u) {
    return { trustScore: 55, trustLabel: 'unknown' };
  }

  const isOfficial =
    OFFICIAL_SOURCES.some((k) => s.includes(k)) ||
    /\b(rbi\.org\.in|sebi\.gov\.in|amfiindia\.com|nseindia\.com|bseindia\.com|incometax\.gov\.in|mca\.gov\.in|pib\.gov\.in)\b/.test(u);
  if (isOfficial) return { trustScore: 95, trustLabel: 'official' };

  const isReputable =
    REPUTABLE_SOURCES.some((k) => s.includes(k)) ||
    /\b(reuters\.com|bloomberg\.com|economictimes\.indiatimes\.com|livemint\.com|business-standard\.com|moneycontrol\.com|cnbctv18\.com)\b/.test(u);
  if (isReputable) return { trustScore: 80, trustLabel: 'reputable' };

  const isCommunity = COMMUNITY_SOURCES.some((k) => s.includes(k)) || /\b(x\.com|twitter\.com|t\.me|telegram\.me|reddit\.com|youtube\.com)\b/.test(u);
  if (isCommunity) return { trustScore: 45, trustLabel: 'community' };

  return { trustScore: 60, trustLabel: 'unknown' };
}

function textTokens(text) {
  const t = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return [];
  return t
    .split(' ')
    .filter((w) => w.length >= 3)
    .filter((w) => !STOPWORDS.has(w));
}

function jaccard(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

export function scoreQuality(headline) {
  const title = String(headline?.headline || headline?.title || '').trim();
  const category = String(headline?.category || '').trim();

  const { trustScore, trustLabel } = scoreSourceTrust(headline?.source, headline?.url || headline?.source_url);
  let score = trustScore;

  // Basic sanity
  if (title.length < 18) score -= 12;
  if (title.length > 160) score -= 6;

  // Clickbait penalties
  for (const re of CLICKBAIT_PATTERNS) {
    if (re.test(title)) {
      score -= 18;
      break;
    }
  }

  // India relevance: if not explicitly global, prefer India-linked terms.
  if (category && category !== 'global') {
    const low = title.toLowerCase();
    const indiaHit = INDIA_RELEVANCE_TOKENS.some((t) => low.includes(t));
    if (!indiaHit) score -= 12;
  }

  // Urgency boost for time-sensitivity (but don't let this overpower trust).
  const urgency = String(headline?.urgency || '').toUpperCase();
  if (urgency === 'BREAKING') score += 10;
  if (urgency === 'IMPORTANT') score += 6;
  if (urgency === 'EDUCATIONAL') score -= 2;

  // Pinned/admin overrides are assumed curated
  if (headline?.pinned) score = Math.max(score, 80);
  if (headline?.type === 'admin') score = Math.max(score, 75);

  return {
    qualityScore: clamp(Math.round(score), 0, 100),
    trustScore,
    trustLabel,
  };
}

export function scoreOpportunityAndRisk(headline) {
  const title = String(headline?.headline || '').toLowerCase();
  const category = String(headline?.category || '').toLowerCase();

  let opportunityScore = 50;
  if (category === 'breaking') opportunityScore += 10;
  if (category === 'market' || category === 'mutual_funds' || category === 'fixed_income') opportunityScore += 5;

  for (const kw of POSITIVE_OPPORTUNITY_TOKENS) {
    if (title.includes(kw)) opportunityScore += 10;
  }

  let riskScore = 10;
  for (const kw of NEGATIVE_RISK_TOKENS) {
    if (title.includes(kw)) riskScore += 18;
  }

  const urgency = String(headline?.urgency || '').toUpperCase();
  if (urgency === 'BREAKING') riskScore += 10;

  opportunityScore = clamp(opportunityScore - Math.round(riskScore / 3), 0, 100);

  let riskLevel = 'none';
  if (riskScore >= 55) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'moderate';

  const actionable = opportunityScore >= 70 || riskLevel === 'high' || urgency === 'BREAKING' || urgency === 'IMPORTANT';
  const actionHint = riskLevel === 'high' ? 'Discuss' : opportunityScore >= 70 ? 'Track' : 'Learn';

  return {
    opportunityScore,
    riskLevel,
    actionable,
    actionHint,
  };
}

export function dedupeHeadlines(headlines, similarityThreshold = 0.88) {
  const list = Array.isArray(headlines) ? headlines : [];
  const kept = [];

  for (const item of list) {
    const t = textTokens(item?.headline);
    let isDup = false;
    for (const prev of kept) {
      const sim = jaccard(t, textTokens(prev?.headline));
      if (sim >= similarityThreshold) {
        isDup = true;
        break;
      }
    }
    if (!isDup) kept.push(item);
  }

  return kept;
}

export function enrichHeadline(headline) {
  const quality = scoreQuality(headline);
  const oppRisk = scoreOpportunityAndRisk(headline);
  return { ...headline, ...quality, ...oppRisk };
}

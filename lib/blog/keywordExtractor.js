/**
 * Blog Keyword Extractor
 * Analyzes blog content and extracts high-impact keywords for image search
 * 
 * Features:
 * - TF-IDF inspired keyword extraction
 * - Finance/investment domain awareness
 * - Multi-strategy extraction for best results
 * - Title and content weighting
 * 
 * @module lib/blog/keywordExtractor
 */

/**
 * Finance domain keywords - weighted higher in search
 */
const FINANCE_KEYWORDS = new Set([
  // Investment terms
  'investment', 'investing', 'investor', 'portfolio', 'stocks', 'equity',
  'mutual fund', 'sip', 'wealth', 'returns', 'compound', 'compounding',
  'money', 'finance', 'financial', 'capital', 'asset', 'assets',
  
  // Planning terms
  'planning', 'retirement', 'goals', 'savings', 'budget', 'emergency',
  'insurance', 'tax', 'taxation', 'strategy', 'allocation',
  
  // Market terms
  'market', 'bull', 'bear', 'rally', 'crash', 'volatility', 'risk',
  'nifty', 'sensex', 'index', 'benchmark', 'performance',
  
  // Product terms
  'ulip', 'elss', 'ppf', 'epf', 'nps', 'fd', 'bonds', 'debt',
  'real estate', 'property', 'gold', 'commodity',
  
  // Action terms
  'growth', 'build', 'create', 'earn', 'save', 'protect', 'secure',
  'maximize', 'optimize', 'diversify', 'rebalance'
]);

/**
 * Visual theme mappings for better image search
 * Maps abstract concepts to concrete visual terms
 */
const VISUAL_THEMES = {
  // Financial concepts → visual representations
  'wealth': ['success', 'prosperity', 'luxury office', 'city skyline'],
  'investment': ['growth chart', 'rising graph', 'financial data'],
  'retirement': ['peaceful beach', 'senior couple happy', 'relaxation sunset'],
  'savings': ['piggy bank', 'money jar', 'coins growing'],
  'planning': ['desk calendar', 'strategy meeting', 'business planning'],
  'risk': ['tightrope walking', 'balance', 'chess strategy'],
  'goals': ['mountain summit', 'target bullseye', 'finish line'],
  'emergency': ['safety net', 'umbrella rain', 'protection shield'],
  'tax': ['documents paperwork', 'calculator desk', 'filing cabinet'],
  'family': ['family happy', 'children education', 'home family'],
  'education': ['graduation cap', 'books studying', 'learning classroom'],
  'loss': ['storm clouds', 'difficult decision', 'turning point'],
  'success': ['celebration victory', 'achievement trophy', 'milestone'],
  'mistake': ['lesson learning', 'growth mindset', 'overcoming challenge'],
  'advisor': ['professional meeting', 'consultation office', 'handshake trust'],
  'market': ['stock exchange', 'trading floor', 'financial district'],
  'compound': ['exponential growth', 'snowball effect', 'tree growing'],
  'debt': ['freedom breaking chains', 'relief burden', 'fresh start']
};

/**
 * Stop words to filter out
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
  'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'also', 'now', 'here', 'there', 'then', 'once', 'if', 'even',
  'because', 'until', 'while', 'about', 'after', 'before', 'between',
  'into', 'through', 'during', 'above', 'below', 'up', 'down', 'out',
  'off', 'over', 'under', 'again', 'further', 'any', 'much', 'many',
  'well', 'way', 'want', 'said', 'make', 'like', 'get', 'got', 'see',
  'know', 'time', 'year', 'years', 'day', 'days', 'thing', 'things',
  'part', 'point', 'read', 'minute', 'minutes', 'sir', 'please', 'one',
  'two', 'three', 'first', 'second', 'third', 'new', 'old', 'good', 'bad'
]);

/**
 * Clean HTML tags from content
 */
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    .trim();
}

/**
 * Tokenize text into words
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[₹$%]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Count word frequencies
 */
function countWords(tokens) {
  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return counts;
}

/**
 * Extract n-grams (2-word phrases)
 */
function extractBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    // Only keep if at least one word is meaningful
    if (!STOP_WORDS.has(tokens[i]) || !STOP_WORDS.has(tokens[i + 1])) {
      bigrams.push(bigram);
    }
  }
  return bigrams;
}

/**
 * Score and rank keywords
 */
function scoreKeywords(wordCounts, titleTokens = []) {
  const scores = [];
  const titleSet = new Set(titleTokens);
  
  for (const [word, count] of wordCounts) {
    let score = count;
    
    // Boost finance keywords
    if (FINANCE_KEYWORDS.has(word)) {
      score *= 2.5;
    }
    
    // Boost words from title
    if (titleSet.has(word)) {
      score *= 3;
    }
    
    // Boost longer words (usually more meaningful)
    if (word.length > 6) {
      score *= 1.3;
    }
    
    scores.push({ word, score, count });
  }
  
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Map keywords to visual search terms
 */
function mapToVisualTerms(keywords) {
  const visual = [];
  
  for (const keyword of keywords) {
    // Check if keyword has visual mapping
    for (const [concept, visuals] of Object.entries(VISUAL_THEMES)) {
      if (keyword.includes(concept) || concept.includes(keyword)) {
        visual.push(...visuals);
      }
    }
  }
  
  // Dedupe and return
  return [...new Set(visual)];
}

/**
 * Detect dominant theme from content
 */
function detectTheme(content) {
  const text = content.toLowerCase();
  
  const themes = {
    investment: /invest|portfolio|stock|equity|mutual fund|sip/g,
    retirement: /retire|pension|golden years|post-work/g,
    savings: /save|saving|emergency fund|rainy day/g,
    planning: /plan|goal|strategy|allocation/g,
    tax: /tax|80c|elss|deduction/g,
    loss: /loss|lost|mistake|wrong|fail/g,
    success: /success|achieve|win|milestone|growth/g,
    risk: /risk|volatile|danger|protect/g,
    education: /education|college|school|child/g,
    family: /family|child|kid|spouse|parent/g
  };
  
  let maxScore = 0;
  let dominantTheme = 'investment';
  
  for (const [theme, regex] of Object.entries(themes)) {
    const matches = text.match(regex);
    const score = matches ? matches.length : 0;
    if (score > maxScore) {
      maxScore = score;
      dominantTheme = theme;
    }
  }
  
  return dominantTheme;
}

/**
 * Main extraction function
 * 
 * @param {string} content - Blog content (can include HTML)
 * @param {string} title - Blog title
 * @param {Object} options - Extraction options
 * @returns {Object} Extracted keywords and search terms
 */
export function extractKeywords(content, title = '', options = {}) {
  const {
    maxKeywords = 10,
    includeVisual = true,
    includePhrases = true
  } = options;

  // Clean content
  const cleanContent = stripHtml(content);
  const cleanTitle = stripHtml(title);
  
  // Tokenize
  const contentTokens = tokenize(cleanContent);
  const titleTokens = tokenize(cleanTitle);
  
  // Count frequencies
  const wordCounts = countWords(contentTokens);
  
  // Score and rank
  const rankedKeywords = scoreKeywords(wordCounts, titleTokens);
  
  // Extract top keywords
  const topKeywords = rankedKeywords
    .slice(0, maxKeywords)
    .map(k => k.word);
  
  // Extract meaningful bigrams
  let phrases = [];
  if (includePhrases) {
    const allBigrams = extractBigrams([...titleTokens, ...contentTokens]);
    const bigramCounts = countWords(allBigrams);
    phrases = Array.from(bigramCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase]) => phrase);
  }
  
  // Get visual search terms
  let visualTerms = [];
  if (includeVisual) {
    visualTerms = mapToVisualTerms([...topKeywords, ...phrases]);
  }
  
  // Detect theme
  const theme = detectTheme(cleanContent);
  
  // Build search queries (most to least specific)
  const searchQueries = [
    // Most specific: title-based
    topKeywords.slice(0, 3).join(' '),
    // Finance + top keyword
    `finance ${topKeywords[0] || 'investment'}`,
    // Visual interpretation
    visualTerms[0] || 'business professional',
    // Theme-based fallback
    `${theme} finance professional`
  ];

  return {
    keywords: topKeywords,
    phrases,
    visualTerms: visualTerms.slice(0, 5),
    theme,
    searchQueries,
    stats: {
      totalWords: contentTokens.length,
      uniqueWords: wordCounts.size,
      titleWeight: titleTokens.length
    }
  };
}

/**
 * Quick extract - just get search query string
 */
export function quickExtract(content, title = '') {
  const result = extractKeywords(content, title, { maxKeywords: 5 });
  return result.searchQueries[0] || 'professional finance business';
}

/**
 * Analyze blog for image requirements
 */
export function analyzeBlogForImage(blog) {
  // Handle both string content and array content
  const contentStr = Array.isArray(blog.content) 
    ? blog.content.join(' ') 
    : blog.content || '';
  
  const extracted = extractKeywords(contentStr, blog.title || '');
  
  return {
    ...extracted,
    suggestedSearch: extracted.searchQueries[0],
    fallbackSearches: extracted.searchQueries.slice(1),
    mood: detectMood(contentStr),
    slug: blog.slug
  };
}

/**
 * Detect emotional mood for image tone
 */
function detectMood(content) {
  const text = content.toLowerCase();
  
  // Positive indicators
  const positive = (text.match(/success|grow|win|achieve|happy|prosper|gain|build/g) || []).length;
  
  // Negative indicators  
  const negative = (text.match(/loss|fail|mistake|wrong|worry|fear|risk|danger|crash/g) || []).length;
  
  // Educational indicators
  const educational = (text.match(/learn|understand|explain|guide|how to|basics|101/g) || []).length;
  
  if (educational > 3) return 'educational';
  if (positive > negative + 2) return 'optimistic';
  if (negative > positive + 2) return 'cautionary';
  return 'professional';
}

export default {
  extractKeywords,
  quickExtract,
  analyzeBlogForImage,
  VISUAL_THEMES,
  FINANCE_KEYWORDS
};

/**
 * Blog Post Schema - World-Class Blog Architecture
 * 
 * This defines the enhanced schema for all blog posts,
 * supporting the three pillars: Community Impact, Guest Columns, Developer Insight
 */

/**
 * Reading time calculator based on average reading speed
 * @param {string} content - HTML or text content
 * @returns {number} - Minutes to read
 */
export function calculateReadingTime(content) {
  if (!content) return 1;
  
  // Handle array of content blocks (legacy format)
  const text = Array.isArray(content) 
    ? content.join(' ') 
    : String(content);
  
  // Strip HTML tags
  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Average reading speed: 200 words per minute for technical content
  const wordCount = plainText.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  
  return Math.max(1, minutes);
}

/**
 * Pillar configurations with iconic series formats
 */
export const PILLAR_CONFIG = {
  IMPACT: {
    id: 'IMPACT',
    title: 'Community Impact',
    tagline: 'Before → After → Playbook',
    description: 'Real scenarios, constraints, outcomes. 5-minute reads with actionable playbooks.',
    format: {
      structure: ['situation', 'constraints', 'action', 'outcome', 'playbook'],
      readingTime: '5 min',
      includes: ['keyNumbers', 'checklist', 'relatedTool'],
    },
    color: 'var(--lux-accent)',
    icon: '📊',
    series: [
      { id: 'tax-leaks', name: 'Tax Leak Case Files', description: 'How we plugged tax leaks for real clients' },
      { id: 'wealth-rescue', name: 'Wealth Rescue Stories', description: 'Portfolios we helped restructure' },
      { id: 'goal-wins', name: 'Goal Achievement Stories', description: 'Clients who hit their targets' },
    ],
  },
  GUEST: {
    id: 'GUEST',
    title: 'Guest Columns',
    tagline: 'Voices of the Ecosystem',
    description: 'Expert perspectives from verified professionals: CAs, lawyers, PMS managers.',
    format: {
      structure: ['expertise', 'insight', 'actionable'],
      readingTime: '7 min',
      includes: ['authorCredentials', 'disclaimer'],
    },
    color: '#7CB9E8',
    icon: '🎙️',
    series: [
      { id: 'ca-tax-trap', name: "CA's Monthly Tax Trap", description: 'Common tax mistakes exposed by CAs' },
      { id: 'lawyers-fine-print', name: "Lawyer's Fine Print", description: 'Legal angles you missed' },
      { id: 'pms-insider', name: 'PMS Insider View', description: 'Portfolio managers share strategy' },
      { id: 'founder-wealth', name: 'Founder Wealth Diaries', description: 'Startup founders on money' },
    ],
  },
  DEV: {
    id: 'DEV',
    title: 'Developer Insight',
    tagline: 'Open Kitchen: How We Build',
    description: 'Product engineering, AI, and systems thinking. The fintech lab.',
    format: {
      structure: ['problem', 'approach', 'implementation', 'learnings'],
      readingTime: '10 min',
      includes: ['diagrams', 'codeSnippets', 'metrics'],
    },
    color: '#10B981',
    icon: '⚡',
    series: [
      { id: 'build-log', name: 'Build Log', description: 'How we built our tools' },
      { id: 'ab-tests', name: 'A/B Test Results', description: 'What worked and what failed' },
      { id: 'tech-decisions', name: 'Tech Decisions', description: 'Why we chose what we chose' },
      { id: 'performance', name: 'Performance Diaries', description: 'Speed and scale learnings' },
    ],
  },
  EDITORIAL: {
    id: 'EDITORIAL',
    title: 'BM Editorial',
    tagline: 'Premium Wealth Intelligence',
    description: 'In-depth analysis and market commentary from the BM Wealth team.',
    format: {
      structure: ['context', 'analysis', 'implications', 'action'],
      readingTime: '8 min',
      includes: ['charts', 'dataPoints'],
    },
    color: 'var(--lux-accent)',
    icon: '📰',
    series: [],
  },
};

/**
 * Authority badges that can be shown on posts
 */
export const AUTHORITY_BADGES = {
  AMFI: { label: 'AMFI ARN 90008', tooltip: 'Registered Mutual Fund Distributor', icon: '✓' },
  IRDAI: { label: 'IRDAI Licensed', tooltip: 'Insurance Regulatory Authority', icon: '✓' },
  SEBI: { label: 'SEBI Registered', tooltip: 'Securities and Exchange Board', icon: '✓' },
  PMS: { label: 'PMS Specialist', tooltip: 'Portfolio Management Services', icon: '✓' },
};

/**
 * Tag categories for filtering
 */
export const TAG_CATEGORIES = {
  audience: {
    label: 'Audience',
    tags: [
      { id: 'high-income', label: 'High Income (₹25L+)', color: '#C0A062' },
      { id: 'salaried', label: 'Salaried Professionals', color: '#7CB9E8' },
      { id: 'business-owners', label: 'Business Owners', color: '#10B981' },
      { id: 'nri', label: 'NRIs', color: '#F59E0B' },
      { id: 'msme', label: 'MSME Founders', color: '#8B5CF6' },
      { id: 'early-career', label: 'Early Career', color: '#EC4899' },
    ],
  },
  topic: {
    label: 'Topic',
    tags: [
      { id: 'tax-leaks', label: 'Tax Leaks', color: '#EF4444' },
      { id: 'sip-strategy', label: 'SIP Strategy', color: '#3B82F6' },
      { id: 'retire-early', label: 'Retire Early', color: '#10B981' },
      { id: 'real-estate', label: 'Real Estate', color: '#F59E0B' },
      { id: 'insurance', label: 'Insurance', color: '#8B5CF6' },
      { id: 'tax-planning', label: 'Tax Planning', color: '#EC4899' },
      { id: 'portfolio-review', label: 'Portfolio Review', color: '#6366F1' },
      { id: 'goal-planning', label: 'Goal Planning', color: '#14B8A6' },
    ],
  },
  format: {
    label: 'Format',
    tags: [
      { id: 'case-study', label: 'Case Study', color: '#C0A062' },
      { id: 'deep-dive', label: 'Deep Dive', color: '#7CB9E8' },
      { id: 'quick-read', label: 'Quick Read', color: '#10B981' },
      { id: 'calculator', label: 'Has Calculator', color: '#F59E0B' },
      { id: 'checklist', label: 'Has Checklist', color: '#8B5CF6' },
    ],
  },
};

/**
 * Related tools mapping for automatic linking
 */
export const TOOL_MAPPINGS = {
  'tax-leaks': { path: '/tools/tax-optimization', name: 'Tax Leak Detector', icon: '🔍' },
  'tax-planning': { path: '/tools/tax-optimization', name: 'Tax Calculator', icon: '📊' },
  'sip-strategy': { path: '/sip-calculator', name: 'SIP Calculator', icon: '📈' },
  'real-estate': { path: '/tools/property-vs-sip', name: 'Property vs SIP', icon: '🏠' },
  'retire-early': { path: '/tools/retirement-gap', name: 'Retirement Gap Calculator', icon: '🎯' },
  'insurance': { path: '/tools/insurance-value', name: 'Insurance Value Check', icon: '🛡️' },
  'goal-planning': { path: '/tools/lumpsum-planner', name: 'Lumpsum Planner', icon: '💰' },
};

/**
 * Enhanced post schema type definition (for reference)
 * 
 * @typedef {Object} EnhancedBlogPost
 * @property {string} slug - URL slug
 * @property {string} title - Post title (SEO-optimized)
 * @property {string} summary - One-line summary for cards
 * @property {string} metaDescription - SEO meta description
 * @property {string} imageUrl - Hero image URL
 * @property {string} author - Author name
 * @property {string} published - ISO date string
 * @property {string} [lastUpdated] - ISO date string for updates
 * @property {string[]} tags - Tag IDs from TAG_CATEGORIES
 * @property {string} pillar - IMPACT | GUEST | DEV | EDITORIAL
 * @property {string} [series] - Series ID from pillar config
 * @property {boolean} [featured] - Show in featured section
 * @property {number} [readingTime] - Override calculated reading time
 * @property {string} [tldr] - 2-3 line TL;DR summary
 * @property {Object[]} [keyNumbers] - Key stats to highlight
 * @property {string[]} [relatedTools] - Tool IDs for linking
 * @property {string[]} [relatedPosts] - Related post slugs
 * @property {Object} [downloads] - Downloadable resources
 * @property {string[]} [authorCredentials] - For guest posts
 * @property {string[]} [badges] - Authority badge IDs
 * @property {string|string[]} content - Post content
 */

/**
 * Validate and enhance a blog post with defaults
 * @param {Object} post - Raw post data
 * @returns {Object} - Enhanced post with computed fields
 */
export function enhancePost(post) {
  if (!post || !post.slug) return null;
  
  const pillar = post.pillar || 'EDITORIAL';
  const pillarConfig = PILLAR_CONFIG[pillar] || PILLAR_CONFIG.EDITORIAL;
  
  // Calculate reading time if not provided
  const readingTime = post.readingTime || calculateReadingTime(post.content);
  
  // Find related tools based on tags
  const relatedTools = (post.tags || [])
    .map(tag => TOOL_MAPPINGS[tag])
    .filter(Boolean)
    .slice(0, 2);
  
  return {
    ...post,
    pillar,
    pillarConfig,
    readingTime,
    relatedTools: post.relatedTools || relatedTools,
    badges: post.badges || ['AMFI'],
    featured: post.featured || false,
    lastUpdated: post.lastUpdated || post.published,
  };
}

/**
 * Get posts for a specific pillar with filtering
 * @param {Object[]} posts - All posts
 * @param {string} pillar - Pillar ID
 * @param {Object} [options] - Filter options
 * @returns {Object[]} - Filtered and enhanced posts
 */
export function getPostsByPillar(posts, pillar, options = {}) {
  const { tags = [], series = null, featured = null } = options;
  
  let filtered = posts
    .filter(p => p.pillar === pillar)
    .map(enhancePost)
    .filter(Boolean);
  
  if (tags.length > 0) {
    filtered = filtered.filter(p => 
      tags.some(tag => (p.tags || []).includes(tag))
    );
  }
  
  if (series) {
    filtered = filtered.filter(p => p.series === series);
  }
  
  if (featured !== null) {
    filtered = filtered.filter(p => p.featured === featured);
  }
  
  // Sort by date, newest first
  return filtered.sort((a, b) => 
    new Date(b.published).getTime() - new Date(a.published).getTime()
  );
}

/**
 * Get featured posts across all pillars
 * @param {Object[]} posts - All posts
 * @param {number} [limit=3] - Max posts to return
 * @returns {Object[]} - Featured posts
 */
export function getFeaturedPosts(posts, limit = 3) {
  return posts
    .filter(p => p.featured)
    .map(enhancePost)
    .filter(Boolean)
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .slice(0, limit);
}

export default {
  PILLAR_CONFIG,
  AUTHORITY_BADGES,
  TAG_CATEGORIES,
  TOOL_MAPPINGS,
  calculateReadingTime,
  enhancePost,
  getPostsByPillar,
  getFeaturedPosts,
};

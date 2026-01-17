/**
 * LIVE INTELLIGENCE - Personalization System
 * 
 * Tracks user behavior and preferences to personalize content.
 * All tracking is anonymous (uses session IDs, not PII).
 * 
 * Features:
 * - Category preference detection
 * - Smart headline prioritization
 * - Learning streaks/gamification
 * - Behavioral patterns
 * 
 * @file lib/live-intelligence/personalization.js
 * @created January 13, 2026
 */

import { CATEGORIES } from './headlines';

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  PREFERENCES: 'li_user_preferences',
  INTERACTIONS: 'li_user_interactions',
  STREAK: 'li_streak_data',
  LAST_VISIT: 'li_last_visit',
};

// ═══════════════════════════════════════════════════════════════════════════
// USER PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user preferences from localStorage
 * @returns {Object} User preferences
 */
export function getUserPreferences() {
  if (typeof window === 'undefined') return getDefaultPreferences();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to read preferences:', error);
  }
  
  return getDefaultPreferences();
}

/**
 * Save user preferences
 * @param {Object} preferences - Preferences to save
 */
export function saveUserPreferences(preferences) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences:', error);
  }
}

/**
 * Get default preferences
 */
function getDefaultPreferences() {
  return {
    favoriteCategories: [],
    dismissedHeadlines: [],
    rotationSpeed: 'auto', // auto, slow, medium, fast
    notificationsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BEHAVIORAL TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record a user interaction
 * @param {string} type - Interaction type
 * @param {Object} data - Interaction data
 */
export function recordInteraction(type, data = {}) {
  if (typeof window === 'undefined') return;
  
  try {
    const interactions = getInteractions();
    
    interactions.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    
    // Keep last 100 interactions
    const trimmed = interactions.slice(-100);
    
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to record interaction:', error);
  }
}

/**
 * Get stored interactions
 * @returns {Array} Interactions
 */
export function getInteractions() {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze interactions to determine category preferences
 * @returns {Object} Category scores
 */
export function analyzeCategoryPreferences() {
  const interactions = getInteractions();
  const categoryScores = {};
  
  // Initialize all categories
  Object.keys(CATEGORIES).forEach(key => {
    categoryScores[key] = 0;
  });
  
  // Score based on interactions
  interactions.forEach(interaction => {
    const category = interaction.data?.category;
    if (!category || !categoryScores.hasOwnProperty(category)) return;
    
    // Weight by interaction type
    switch (interaction.type) {
      case 'headline_click':
        categoryScores[category] += 5;
        break;
      case 'headline_share':
        categoryScores[category] += 10;
        break;
      case 'headline_pause':
        categoryScores[category] += 2;
        break;
      case 'category_filter':
        categoryScores[category] += 3;
        break;
      case 'headline_view':
        categoryScores[category] += 1;
        break;
    }
  });
  
  return categoryScores;
}

/**
 * Get top preferred categories
 * @param {number} count - Number of categories to return
 * @returns {Array} Top categories
 */
export function getTopCategories(count = 3) {
  const scores = analyzeCategoryPreferences();
  
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .filter(([, score]) => score > 0)
    .map(([key]) => key);
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART HEADLINE PRIORITIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate personalized priority score for a headline
 * @param {Object} headline - Headline object
 * @returns {number} Priority score
 */
export function calculatePersonalizedScore(headline) {
  const categoryScores = analyzeCategoryPreferences();
  const categoryPreference = categoryScores[headline.category] || 0;
  
  // Base score from urgency
  let score = 0;
  switch (headline.urgency) {
    case 'BREAKING': score = 100; break;
    case 'IMPORTANT': score = 50; break;
    case 'PREMIUM': score = 40; break;
    case 'REGULAR': score = 20; break;
    case 'EDUCATIONAL': score = 15; break;
  }
  
  // Add personalization bonus (up to 30 points)
  score += Math.min(categoryPreference * 2, 30);
  
  // Recency bonus (last 2 hours = +10, last day = +5)
  const headlineTime = new Date(headline.timestamp).getTime();
  const now = Date.now();
  const hoursAgo = (now - headlineTime) / (1000 * 60 * 60);
  
  if (hoursAgo < 2) {
    score += 10;
  } else if (hoursAgo < 24) {
    score += 5;
  }
  
  return score;
}

/**
 * Sort headlines by personalized priority
 * @param {Array} headlines - Headlines to sort
 * @returns {Array} Sorted headlines
 */
export function sortByPersonalizedPriority(headlines) {
  return [...headlines].sort((a, b) => {
    const scoreA = calculatePersonalizedScore(a);
    const scoreB = calculatePersonalizedScore(b);
    return scoreB - scoreA;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// STREAK SYSTEM / GAMIFICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current streak data
 * @returns {Object} Streak data
 */
export function getStreakData() {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastVisit: null };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STREAK);
    return stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      lastVisit: null,
      totalVisits: 0,
    };
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastVisit: null, totalVisits: 0 };
  }
}

/**
 * Update streak on visit
 * @returns {Object} Updated streak data with changes
 */
export function updateStreak() {
  if (typeof window === 'undefined') return null;
  
  const now = new Date();
  const today = now.toDateString();
  
  const streakData = getStreakData();
  const lastVisitDate = streakData.lastVisit ? new Date(streakData.lastVisit).toDateString() : null;
  
  // Already visited today
  if (lastVisitDate === today) {
    return { ...streakData, isNewVisit: false };
  }
  
  // Calculate new streak
  let newStreak = streakData.currentStreak;
  let streakBroken = false;
  let streakExtended = false;
  
  if (lastVisitDate) {
    const lastDate = new Date(streakData.lastVisit);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.toDateString() === yesterday.toDateString()) {
      // Consecutive day - extend streak
      newStreak += 1;
      streakExtended = true;
    } else {
      // Streak broken - reset to 1
      newStreak = 1;
      streakBroken = streakData.currentStreak > 0;
    }
  } else {
    // First visit
    newStreak = 1;
  }
  
  const updated = {
    currentStreak: newStreak,
    longestStreak: Math.max(streakData.longestStreak, newStreak),
    lastVisit: now.toISOString(),
    totalVisits: (streakData.totalVisits || 0) + 1,
  };
  
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save streak:', error);
  }
  
  return {
    ...updated,
    isNewVisit: true,
    streakExtended,
    streakBroken,
    previousStreak: streakData.currentStreak,
  };
}

/**
 * Get streak milestone message
 * @param {number} streak - Current streak
 * @returns {Object|null} Milestone message or null
 */
export function getStreakMilestone(streak) {
  const milestones = {
    3: { emoji: '🔥', message: '3-day streak! You\'re building momentum.' },
    7: { emoji: '⭐', message: '1 week streak! Financial awareness is growing.' },
    14: { emoji: '🏆', message: '2 weeks! You\'re becoming an informed investor.' },
    30: { emoji: '💎', message: '30 days! Premium investor mindset unlocked.' },
    60: { emoji: '🎯', message: '2 months! Your financial IQ is exceptional.' },
    90: { emoji: '👑', message: '90 days! You\'re in the top 1% of informed investors.' },
  };
  
  return milestones[streak] || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART OVERLAY (Personalized recommendations)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate personalized recommendations
 * @returns {Object} Recommendations
 */
export function getPersonalizedRecommendations() {
  const topCategories = getTopCategories(3);
  const streakData = getStreakData();
  const preferences = getUserPreferences();
  
  const recommendations = {
    categories: topCategories.map(cat => CATEGORIES[cat]),
    streak: streakData,
    suggestions: [],
  };
  
  // Suggest based on behavior
  if (topCategories.length === 0) {
    recommendations.suggestions.push({
      type: 'explore',
      text: 'Explore different categories to personalize your feed',
    });
  }
  
  if (streakData.currentStreak >= 3 && !preferences.notificationsEnabled) {
    recommendations.suggestions.push({
      type: 'notifications',
      text: 'Enable notifications to never miss market updates',
    });
  }
  
  if (streakData.currentStreak === 0 && streakData.totalVisits > 5) {
    recommendations.suggestions.push({
      type: 'streak',
      text: 'Visit daily to build your learning streak',
    });
  }
  
  return recommendations;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// PERSONALIZATION ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PersonalizationEngine - Stateful personalization manager
 * Used for feed personalization and user insights
 */
class PersonalizationEngine {
  constructor() {
    this.profile = null;
    this.initialized = false;
  }
  
  init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;
    
    this.profile = this.loadProfile();
    this.initialized = true;
  }
  
  loadProfile() {
    if (typeof window === 'undefined') return this.getDefaultProfile();
    
    try {
      const saved = localStorage.getItem('li_user_profile');
      if (saved) {
        return { ...this.getDefaultProfile(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load user profile:', e);
    }
    
    return this.getDefaultProfile();
  }
  
  getDefaultProfile() {
    return {
      preferred_categories: {},
      read_times: [],
      interaction_patterns: {},
      interests: [],
      feed_mode: 'market', // 'market' | 'personalized'
      created_at: new Date().toISOString()
    };
  }
  
  saveProfile() {
    if (typeof window === 'undefined' || !this.profile) return;
    
    try {
      localStorage.setItem('li_user_profile', JSON.stringify(this.profile));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  }
  
  recordInteraction(category, duration, timestamp) {
    if (!this.profile) this.init();
    if (!this.profile) return;
    
    // Track category preference
    if (category) {
      if (!this.profile.preferred_categories[category]) {
        this.profile.preferred_categories[category] = 0;
      }
      // Weight by duration
      const weight = duration >= 12000 ? 3 : duration >= 5000 ? 2 : 1;
      this.profile.preferred_categories[category] += weight;
    }
    
    // Track read times
    const hour = new Date(timestamp || Date.now()).getHours();
    this.profile.read_times.push(hour);
    
    // Keep only last 100 interactions
    if (this.profile.read_times.length > 100) {
      this.profile.read_times = this.profile.read_times.slice(-100);
    }
    
    this.saveProfile();
  }
  
  getTopCategories(limit = 3) {
    if (!this.profile) this.init();
    if (!this.profile) return [];
    
    const sorted = Object.entries(this.profile.preferred_categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category]) => category);
    
    return sorted;
  }
  
  getPreferredReadTime() {
    if (!this.profile) this.init();
    if (!this.profile || this.profile.read_times.length < 5) return null;
    
    // Find most common hour
    const hourCounts = {};
    this.profile.read_times.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const mostCommon = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    return mostCommon ? parseInt(mostCommon[0]) : null;
  }
  
  async getPersonalizedFeed(allHeadlines) {
    if (!this.profile) this.init();
    
    const topCategories = this.getTopCategories();
    
    if (topCategories.length === 0 || !allHeadlines || allHeadlines.length === 0) {
      // No personalization data yet
      return allHeadlines || [];
    }
    
    // Score headlines based on user preferences
    const scored = allHeadlines.map(headline => {
      let score = 0;
      
      // Category preference (0-9 points)
      const categoryIndex = topCategories.indexOf(headline.category);
      if (categoryIndex !== -1) {
        score += (3 - categoryIndex) * 3;
      }
      
      // Urgency (0-5 points)
      const urgency = (headline.urgency || '').toUpperCase();
      if (urgency === 'BREAKING') score += 5;
      else if (urgency === 'IMPORTANT' || urgency === 'MARKET_MOVE') score += 4;
      else if (urgency === 'HIGH') score += 3;
      else if (urgency === 'MEDIUM') score += 2;
      
      // Recency (0-5 points)
      const publishedAt = headline.published_at || headline.timestamp || headline.created_at;
      if (publishedAt) {
        const ageHours = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
        if (ageHours < 1) score += 5;
        else if (ageHours < 6) score += 3;
        else if (ageHours < 24) score += 1;
      }
      
      return { ...headline, personalization_score: score };
    });
    
    // Sort by score
    return scored.sort((a, b) => b.personalization_score - a.personalization_score);
  }
  
  getFeedMode() {
    if (!this.profile) this.init();
    return this.profile?.feed_mode || 'market';
  }
  
  setFeedMode(mode) {
    if (!this.profile) this.init();
    if (!this.profile) return;
    
    this.profile.feed_mode = mode;
    this.saveProfile();
  }
  
  getInsights() {
    if (!this.profile) this.init();
    
    return {
      topCategories: this.getTopCategories(),
      preferredTime: this.getPreferredReadTime(),
      totalInteractions: Object.values(this.profile?.preferred_categories || {})
        .reduce((sum, val) => sum + val, 0),
      hasPersonalization: Object.keys(this.profile?.preferred_categories || {}).length > 0
    };
  }
  
  resetProfile() {
    if (typeof window === 'undefined') return;
    
    this.profile = this.getDefaultProfile();
    localStorage.removeItem('li_user_profile');
  }
}

// Singleton instance
let engineInstance = null;

export function getPersonalizationEngine() {
  if (typeof window === 'undefined') return null;
  
  if (!engineInstance) {
    engineInstance = new PersonalizationEngine();
    engineInstance.init();
  }
  return engineInstance;
}

export const personalizationEngine = typeof window !== 'undefined'
  ? (() => {
      const engine = new PersonalizationEngine();
      engine.init();
      return engine;
    })()
  : null;

export default {
  getUserPreferences,
  saveUserPreferences,
  recordInteraction,
  getInteractions,
  analyzeCategoryPreferences,
  getTopCategories,
  calculatePersonalizedScore,
  sortByPersonalizedPriority,
  getStreakData,
  updateStreak,
  getStreakMilestone,
  getPersonalizedRecommendations,
  getPersonalizationEngine,
  personalizationEngine,
};


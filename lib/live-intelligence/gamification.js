/**
 * Gamification System for Live Intelligence
 * @file lib/live-intelligence/gamification.js
 * 
 * Badge tracking, achievements, and progress persistence
 * Supports 6 badge types with Bronze/Silver/Gold tiers
 */

'use client';

export const badges = {
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🌅',
    description: 'Check intelligence before market opens (before 9:15 AM)',
    levels: [
      { tier: 'bronze', requirement: 3, reward: 'Bronze Early Bird' },
      { tier: 'silver', requirement: 10, reward: 'Silver Early Bird' },
      { tier: 'gold', requirement: 30, reward: 'Gold Early Bird' }
    ]
  },
  
  streak_master: {
    id: 'streak_master',
    name: 'Streak Master',
    icon: '🔥',
    description: 'Visit Live Intelligence X days in a row',
    levels: [
      { tier: 'bronze', requirement: 3, reward: '3-Day Streak' },
      { tier: 'silver', requirement: 7, reward: '7-Day Streak' },
      { tier: 'gold', requirement: 30, reward: '30-Day Streak' }
    ]
  },
  
  news_scholar: {
    id: 'news_scholar',
    name: 'Market Scholar',
    icon: '📚',
    description: 'Read X headlines thoroughly (pause > 12s)',
    levels: [
      { tier: 'bronze', requirement: 10, reward: 'Bronze Scholar' },
      { tier: 'silver', requirement: 50, reward: 'Silver Scholar' },
      { tier: 'gold', requirement: 100, reward: 'Gold Scholar' }
    ]
  },
  
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    icon: '🦉',
    description: 'Check night summary (after 9 PM) X times',
    levels: [
      { tier: 'bronze', requirement: 5, reward: 'Bronze Night Owl' },
      { tier: 'silver', requirement: 15, reward: 'Silver Night Owl' },
      { tier: 'gold', requirement: 30, reward: 'Gold Night Owl' }
    ]
  },
  
  category_explorer: {
    id: 'category_explorer',
    name: 'Category Explorer',
    icon: '🗺️',
    description: 'Read headlines from all 8 categories',
    levels: [
      { tier: 'bronze', requirement: 4, reward: 'Half Explorer' },
      { tier: 'silver', requirement: 6, reward: 'Advanced Explorer' },
      { tier: 'gold', requirement: 8, reward: 'Complete Explorer' }
    ]
  },
  
  sharing_champion: {
    id: 'sharing_champion',
    name: 'Sharing Champion',
    icon: '📤',
    description: 'Share intelligence X times',
    levels: [
      { tier: 'bronze', requirement: 3, reward: 'Bronze Sharer' },
      { tier: 'silver', requirement: 10, reward: 'Silver Sharer' },
      { tier: 'gold', requirement: 25, reward: 'Gold Sharer' }
    ]
  }
};

// Tier colors for UI
export const tierColors = {
  bronze: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    gradient: 'from-orange-600 to-orange-400'
  },
  silver: {
    bg: 'bg-gray-400/20',
    text: 'text-gray-300',
    border: 'border-gray-400/30',
    gradient: 'from-gray-400 to-gray-200'
  },
  gold: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    gradient: 'from-yellow-500 to-yellow-300'
  }
};

class GamificationTracker {
  constructor() {
    this.progress = null;
    this.initialized = false;
    this.listeners = [];
  }
  
  init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;
    
    this.progress = this.loadProgress();
    this.initialized = true;
    
    // Check streak and early bird on init
    this.checkStreak();
    this.checkEarlyBird();
  }
  
  loadProgress() {
    if (typeof window === 'undefined') return this.getDefaultProgress();
    
    try {
      const saved = localStorage.getItem('li_gamification');
      if (saved) {
        return { ...this.getDefaultProgress(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load gamification progress:', e);
    }
    
    return this.getDefaultProgress();
  }
  
  getDefaultProgress() {
    return {
      early_bird_count: 0,
      current_streak: 0,
      longest_streak: 0,
      last_visit: null,
      headlines_read: 0,
      night_checks: 0,
      categories_explored: [],
      shares_count: 0,
      earned_badges: [],
      total_time_spent: 0, // in seconds
      first_visit: null
    };
  }
  
  saveProgress() {
    if (typeof window === 'undefined' || !this.progress) return;
    
    try {
      localStorage.setItem('li_gamification', JSON.stringify(this.progress));
    } catch (e) {
      console.error('Failed to save gamification progress:', e);
    }
  }
  
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (e) {
        console.error('Gamification listener error:', e);
      }
    });
  }
  
  checkEarlyBird() {
    if (!this.progress) return;
    
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour + minute / 60;
    
    // Before 9:15 AM (market opens at 9:15)
    if (time < 9.25 && time >= 6) {
      const today = now.toDateString();
      const lastEarlyBird = this.progress.last_early_bird_date;
      
      if (lastEarlyBird !== today) {
        this.progress.early_bird_count++;
        this.progress.last_early_bird_date = today;
        this.saveProgress();
        this.checkBadgeUnlock('early_bird', this.progress.early_bird_count);
      }
    }
  }
  
  checkStreak() {
    if (!this.progress) return;
    
    const today = new Date().toDateString();
    const lastVisit = this.progress.last_visit;
    
    if (!this.progress.first_visit) {
      this.progress.first_visit = new Date().toISOString();
    }
    
    if (lastVisit) {
      const lastDate = new Date(lastVisit).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastDate === yesterday) {
        // Continuing streak
        this.progress.current_streak++;
      } else if (lastDate !== today) {
        // Streak broken (or first visit today after a gap)
        this.progress.current_streak = 1;
      }
      // If lastDate === today, don't change streak
    } else {
      // First ever visit
      this.progress.current_streak = 1;
    }
    
    if (this.progress.current_streak > this.progress.longest_streak) {
      this.progress.longest_streak = this.progress.current_streak;
    }
    
    this.progress.last_visit = new Date().toISOString();
    this.saveProgress();
    this.checkBadgeUnlock('streak_master', this.progress.current_streak);
  }
  
  recordHeadlineRead(category, duration = 0) {
    if (!this.progress) this.init();
    if (!this.progress) return;
    
    // Only count if spent more than 3 seconds (to filter accidental clicks)
    if (duration >= 3000) {
      this.progress.headlines_read++;
      
      if (category && !this.progress.categories_explored.includes(category)) {
        this.progress.categories_explored.push(category);
        this.checkBadgeUnlock('category_explorer', this.progress.categories_explored.length);
      }
      
      // Only count for scholar badge if spent > 12 seconds
      if (duration >= 12000) {
        this.checkBadgeUnlock('news_scholar', this.progress.headlines_read);
      }
      
      this.saveProgress();
    }
  }
  
  recordNightCheck() {
    if (!this.progress) this.init();
    if (!this.progress) return;
    
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) { // 9 PM to 6 AM
      const today = new Date().toDateString();
      const lastNightCheck = this.progress.last_night_check_date;
      
      if (lastNightCheck !== today) {
        this.progress.night_checks++;
        this.progress.last_night_check_date = today;
        this.saveProgress();
        this.checkBadgeUnlock('night_owl', this.progress.night_checks);
      }
    }
  }
  
  recordShare() {
    if (!this.progress) this.init();
    if (!this.progress) return;
    
    this.progress.shares_count++;
    this.saveProgress();
    this.checkBadgeUnlock('sharing_champion', this.progress.shares_count);
  }
  
  recordTimeSpent(seconds) {
    if (!this.progress) this.init();
    if (!this.progress) return;
    
    this.progress.total_time_spent += seconds;
    this.saveProgress();
  }
  
  checkBadgeUnlock(badgeId, currentCount) {
    const badge = badges[badgeId];
    if (!badge || !this.progress) return;
    
    for (const level of badge.levels) {
      const badgeKey = `${badgeId}_${level.tier}`;
      
      if (currentCount >= level.requirement && 
          !this.progress.earned_badges.includes(badgeKey)) {
        
        // Unlock badge!
        this.progress.earned_badges.push(badgeKey);
        this.saveProgress();
        
        // Trigger achievement popup
        this.showAchievement(badge, level);
      }
    }
  }
  
  showAchievement(badge, level) {
    // Dispatch custom event for popup
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('achievement-unlocked', {
        detail: { badge, level }
      }));
      
      this.notifyListeners('achievement', { badge, level });
    }
  }
  
  getEarnedBadges() {
    if (!this.progress) this.init();
    if (!this.progress) return [];
    
    return this.progress.earned_badges.map(key => {
      const parts = key.split('_');
      const tier = parts.pop();
      const badgeId = parts.join('_');
      const badge = badges[badgeId];
      const level = badge?.levels.find(l => l.tier === tier);
      return { badge, level, key };
    }).filter(item => item.badge && item.level);
  }
  
  getBadgeProgress(badgeId) {
    if (!this.progress) this.init();
    if (!this.progress) return { current: 0, levels: [] };
    
    const badge = badges[badgeId];
    if (!badge) return { current: 0, levels: [] };
    
    let current = 0;
    switch (badgeId) {
      case 'early_bird':
        current = this.progress.early_bird_count;
        break;
      case 'streak_master':
        current = this.progress.current_streak;
        break;
      case 'news_scholar':
        current = this.progress.headlines_read;
        break;
      case 'night_owl':
        current = this.progress.night_checks;
        break;
      case 'category_explorer':
        current = this.progress.categories_explored.length;
        break;
      case 'sharing_champion':
        current = this.progress.shares_count;
        break;
    }
    
    const levelStatus = badge.levels.map(level => ({
      ...level,
      unlocked: current >= level.requirement,
      progress: Math.min(100, (current / level.requirement) * 100)
    }));
    
    return { current, levels: levelStatus };
  }
  
  getProgress() {
    if (!this.progress) this.init();
    return this.progress || this.getDefaultProgress();
  }
  
  getStats() {
    const progress = this.getProgress();
    return {
      totalBadges: progress.earned_badges.length,
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      headlinesRead: progress.headlines_read,
      categoriesExplored: progress.categories_explored.length,
      sharesCount: progress.shares_count,
      timeSpent: progress.total_time_spent
    };
  }
  
  resetProgress() {
    if (typeof window === 'undefined') return;
    
    this.progress = this.getDefaultProgress();
    localStorage.removeItem('li_gamification');
  }
}

// Singleton instance
let trackerInstance = null;

export function getGamificationTracker() {
  if (typeof window === 'undefined') return null;
  
  if (!trackerInstance) {
    trackerInstance = new GamificationTracker();
    trackerInstance.init();
  }
  return trackerInstance;
}

export const gamificationTracker = typeof window !== 'undefined' 
  ? (() => {
      const tracker = new GamificationTracker();
      tracker.init();
      return tracker;
    })()
  : null;

export default GamificationTracker;

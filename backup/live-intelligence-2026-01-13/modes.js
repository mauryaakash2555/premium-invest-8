/**
 * LIVE INTELLIGENCE - TIME-BASED MODES
 * 
 * Detects current market mode based on IST time.
 * Each mode has different visuals, rotation speed, and content tone.
 */

// Mode configurations
export const MODES = {
  morning_brief: {
    key: 'morning_brief',
    label: 'Morning Briefing',
    shortLabel: 'Morning',
    icon: '☀️',
    rotationSpeed: 10000, // 10 seconds
    tone: 'Alert, Preparatory',
    description: 'Pre-market preparation & global cues',
    accentColor: 'rgba(100, 180, 255, 1)',      // Blue
    accentColorDim: 'rgba(100, 180, 255, 0.25)',
    glowColor: 'rgba(100, 180, 255, 0.4)',
  },
  live_market: {
    key: 'live_market',
    label: 'Live Market Pulse',
    shortLabel: 'Live',
    icon: '📡',
    rotationSpeed: 6000, // 6 seconds - fastest
    tone: 'Dynamic, Urgent',
    description: 'Real-time market action',
    accentColor: 'rgba(80, 220, 120, 1)',       // Green (can switch to red)
    accentColorDim: 'rgba(80, 220, 120, 0.25)',
    glowColor: 'rgba(80, 220, 120, 0.4)',
  },
  market_close: {
    key: 'market_close',
    label: 'Market Close',
    shortLabel: 'Closing',
    icon: '📊',
    rotationSpeed: 10000, // 10 seconds
    tone: 'Analytical',
    description: 'Day summary & what worked',
    accentColor: 'rgba(212, 175, 100, 1)',      // Gold
    accentColorDim: 'rgba(212, 175, 100, 0.25)',
    glowColor: 'rgba(212, 175, 100, 0.4)',
  },
  evening_intel: {
    key: 'evening_intel',
    label: 'Evening Intelligence',
    shortLabel: 'Evening',
    icon: '🌆',
    rotationSpeed: 8000, // 8 seconds
    tone: 'Informative',
    description: 'News digest & next day outlook',
    accentColor: 'rgba(180, 120, 220, 1)',      // Purple
    accentColorDim: 'rgba(180, 120, 220, 0.25)',
    glowColor: 'rgba(180, 120, 220, 0.4)',
  },
  night_summary: {
    key: 'night_summary',
    label: 'What You Missed',
    shortLabel: 'Summary',
    icon: '🌙',
    rotationSpeed: 8000, // 8 seconds
    tone: 'Comprehensive',
    description: 'Full day recap & tomorrow preview',
    accentColor: 'rgba(100, 140, 220, 1)',      // Dark blue
    accentColorDim: 'rgba(100, 140, 220, 0.25)',
    glowColor: 'rgba(100, 140, 220, 0.4)',
    isDashboard: true, // Special layout for this mode
  },
  global_watch: {
    key: 'global_watch',
    label: 'Global Watch',
    shortLabel: 'Global',
    icon: '🌏',
    rotationSpeed: 12000, // 12 seconds - slowest
    tone: 'Minimal',
    description: 'Overnight & global developments',
    accentColor: 'rgba(140, 150, 170, 1)',      // Gray muted
    accentColorDim: 'rgba(140, 150, 170, 0.25)',
    glowColor: 'rgba(140, 150, 170, 0.3)',
  },
};

/**
 * Get current mode based on IST time
 * @returns {string} Mode key
 */
export function getCurrentMode() {
  const now = new Date();
  
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
  
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const time = hour + (minute / 60);

  if (time >= 6 && time < 9.5) return 'morning_brief';
  if (time >= 9.5 && time < 15.5) return 'live_market';
  if (time >= 15.5 && time < 17) return 'market_close';
  if (time >= 17 && time < 21) return 'evening_intel';
  if (time >= 21 && time < 24) return 'night_summary';
  return 'global_watch'; // 00:00 - 06:00
}

/**
 * Get mode config for current time
 * @returns {object} Mode configuration object
 */
export function getCurrentModeConfig() {
  const modeKey = getCurrentMode();
  return MODES[modeKey];
}

/**
 * Get formatted IST time string
 * @returns {string} Time in HH:MM format
 */
export function getISTTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
  
  return ist.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get time until next mode change
 * @returns {number} Milliseconds until next mode
 */
export function getTimeUntilNextMode() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
  
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  
  // Mode boundaries in hours
  const boundaries = [6, 9.5, 15.5, 17, 21, 24];
  const currentTime = hour + (minute / 60);
  
  // Find next boundary
  let nextBoundary = boundaries.find(b => b > currentTime);
  if (!nextBoundary) nextBoundary = 6; // Wrap to next day
  
  // Calculate minutes until next boundary
  let hoursUntil = nextBoundary - currentTime;
  if (hoursUntil < 0) hoursUntil += 24;
  
  return hoursUntil * 60 * 60 * 1000;
}

/**
 * Check if market is currently open (9:15 AM - 3:30 PM IST)
 * @returns {boolean}
 */
export function isMarketOpen() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
  
  const day = ist.getDay();
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const time = hour + (minute / 60);
  
  // Weekday check (Monday = 1, Friday = 5)
  if (day === 0 || day === 6) return false;
  
  // Market hours: 9:15 AM to 3:30 PM
  return time >= 9.25 && time < 15.5;
}

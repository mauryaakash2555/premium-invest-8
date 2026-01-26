// FILE: lib/modes.js
// PURPOSE: Central configuration for all time-based modes used by Live Intelligence.

export const MODES = {
  morningbrief: {
    key: 'morningbrief',
    name: 'Morning Briefing',
    icon: '🌅',
    timeStart: 6,
    timeEnd: 9.5,
    rotationSpeed: 10,
    tone: 'Alert, Preparatory',
    description: 'Pre-market preparation',
    accentColor: '#3B82F6',
    bgGradient: 'from-slate-900 via-blue-900 to-slate-900',
  },

  livemarket: {
    key: 'livemarket',
    name: 'Live Market Pulse',
    icon: '📈',
    timeStart: 9.5,
    timeEnd: 15.5,
    rotationSpeed: 6,
    tone: 'Dynamic, Urgent',
    description: 'Real-time market moves',
    accentColor: '#EF4444',
    bgGradient: 'from-slate-900 via-red-900 to-slate-900',
  },

  marketclose: {
    key: 'marketclose',
    name: 'Market Close',
    icon: '🔔',
    timeStart: 15.5,
    timeEnd: 17,
    rotationSpeed: 10,
    tone: 'Analytical',
    description: 'Day summary & analysis',
    accentColor: '#F59E0B',
    bgGradient: 'from-slate-900 via-amber-900 to-slate-900',
  },

  eveningintel: {
    key: 'eveningintel',
    name: 'Evening Intelligence',
    icon: '🌆',
    timeStart: 17,
    timeEnd: 21,
    rotationSpeed: 8,
    tone: 'Informative',
    description: 'News digest & insights',
    accentColor: '#A855F7',
    bgGradient: 'from-slate-900 via-purple-900 to-slate-900',
  },

  nightsummary: {
    key: 'nightsummary',
    name: 'What You Missed',
    icon: '🌙',
    timeStart: 21,
    timeEnd: 24,
    rotationSpeed: 8,
    tone: 'Comprehensive summary',
    description: 'Full day recap & preview',
    accentColor: '#1E3A8A',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    isDashboardMode: true,
  },

  globalwatch: {
    key: 'globalwatch',
    name: 'Global Watch',
    icon: '🌍',
    timeStart: 0,
    timeEnd: 6,
    rotationSpeed: 12,
    tone: 'Minimal, informative',
    description: 'Overnight developments',
    accentColor: '#9CA3AF',
    bgGradient: 'from-slate-950 via-slate-800 to-slate-950',
    maxHeadlines: 5,
  },
};

export function getISTNow(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60 * 1000);
}

function getTimeValue(date = new Date()) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return hour + minute / 60;
}

// HELPER FUNCTION: Get current mode
export function getCurrentMode(date = new Date()) {
  const ist = getISTNow(date);
  const timeValue = getTimeValue(ist);

  if (timeValue >= 6 && timeValue < 9.5) return MODES.morningbrief;
  if (timeValue >= 9.5 && timeValue < 15.5) return MODES.livemarket;
  if (timeValue >= 15.5 && timeValue < 17) return MODES.marketclose;
  if (timeValue >= 17 && timeValue < 21) return MODES.eveningintel;
  if (timeValue >= 21 && timeValue < 24) return MODES.nightsummary;
  return MODES.globalwatch;
}

export function getISTTimeHHMM(date = new Date()) {
  const ist = getISTNow(date);
  const hh = String(ist.getHours()).padStart(2, '0');
  const mm = String(ist.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// NSE market hours (Mon–Fri) 9:15–15:30 IST
export function isMarketOpen(date = new Date()) {
  const ist = getISTNow(date);
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;

  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const time = hour + minute / 60;
  return time >= 9.25 && time < 15.5;
}

// HELPER FUNCTION: Get mode by key/name
export function getModeByName(modeName) {
  return MODES[modeName] || MODES.globalwatch;
}

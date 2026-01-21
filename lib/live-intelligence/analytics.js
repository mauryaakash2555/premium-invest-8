/**
 * LIVE INTELLIGENCE - Analytics Tracking
 * 
 * Tracks user engagement with headlines and features.
 * All tracking is anonymous (no PII).
 * 
 * @file lib/live-intelligence/analytics.js
 * @created January 13, 2026
 */

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const EVENT_TYPES = {
  // Spec (Jan 21, 2026) events
  HEADLINE_IMPRESSION: 'headline_impression',
  HEADLINE_PAUSE: 'headline_pause',
  PANEL_EXPAND: 'panel_expand',
  PANEL_COLLAPSE: 'panel_collapse',
  CATEGORY_CLICK: 'category_click',
  CTA_CLICK: 'cta_click',
  SHARE_CLICK: 'share_click',
  NIGHT_SUMMARY_VIEW: 'night_summary_view',

  // Page events
  PAGE_VIEW: 'page_view',
  PAGE_EXIT: 'page_exit',
  
  // Headline events
  // Legacy aliases (kept for backward compatibility)
  HEADLINE_VIEW: 'headline_view',
  HEADLINE_CLICK: 'headline_click',
  HEADLINE_SHARE: 'headline_share',
  
  // Category events
  CATEGORY_FILTER: 'category_filter',
  
  // Mode events
  MODE_CHANGE: 'mode_change',
  
  // Summary events
  SUMMARY_VIEW: 'summary_view',
  SUMMARY_SHARE: 'summary_share',
  
  // Engagement
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
};

// ═══════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

let sessionId = null;

/**
 * Get or create session ID
 * @returns {string} Session ID
 */
export function getSessionId() {
  if (sessionId) return sessionId;
  
  // Try to get from sessionStorage
  if (typeof window !== 'undefined') {
    sessionId = sessionStorage.getItem('li_session_id');
    if (!sessionId) {
      sessionId = `li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('li_session_id', sessionId);
    }
  } else {
    sessionId = `li_ssr_${Date.now()}`;
  }
  
  return sessionId;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TRACKING
// ═══════════════════════════════════════════════════════════════════════════

// Event queue for batching
const eventQueue = [];
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds

/**
 * Track an analytics event
 * @param {string} eventType - Type of event
 * @param {Object} data - Event data
 */
export function trackEvent(eventType, data = {}) {
  const event = {
    type: eventType,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  eventQueue.push(event);
  
  // Send if batch is full
  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents();
  }
}

/**
 * Send queued events to server
 */
async function flushEvents() {
  if (eventQueue.length === 0) return;
  
  const events = eventQueue.splice(0, eventQueue.length);
  
  try {
    await fetch('/api/analytics/live-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
  } catch (error) {
    // Re-queue events on failure
    eventQueue.unshift(...events);
    console.warn('Analytics flush failed:', error);
  }
}

// Start batch interval
if (typeof window !== 'undefined') {
  setInterval(flushEvents, BATCH_INTERVAL);
  
  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery
      navigator.sendBeacon(
        '/api/analytics/live-intelligence',
        JSON.stringify({ events: eventQueue })
      );
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Track headline impression
 * @param {Object} headline - Headline object
 */
export function trackHeadlineView(headline) {
  // Spec name
  trackEvent(EVENT_TYPES.HEADLINE_IMPRESSION, {
    headlineId: headline.id,
    category: headline.category,
    urgency: headline.urgency,
  });

  // Legacy alias
  trackEvent(EVENT_TYPES.HEADLINE_VIEW, {
    headlineId: headline.id,
    category: headline.category,
    urgency: headline.urgency,
  });
}

/**
 * Track headline click
 * @param {Object} headline - Headline object
 */
export function trackHeadlineClick(headline) {
  trackEvent(EVENT_TYPES.CTA_CLICK, {
    headlineId: headline.id,
    category: headline.category,
    urgency: headline.urgency,
  });

  // Legacy alias
  trackEvent(EVENT_TYPES.HEADLINE_CLICK, {
    headlineId: headline.id,
    category: headline.category,
    urgency: headline.urgency,
  });
}

/**
 * Track headline share
 * @param {Object} headline - Headline object
 * @param {string} platform - Share platform
 */
export function trackHeadlineShare(headline, platform = 'native') {
  trackEvent(EVENT_TYPES.SHARE_CLICK, {
    headlineId: headline.id,
    category: headline.category,
    platform,
  });

  // Legacy alias
  trackEvent(EVENT_TYPES.HEADLINE_SHARE, {
    headlineId: headline.id,
    category: headline.category,
    platform,
  });
}

/**
 * Track rotation pause (user engagement)
 * @param {Object} headline - Headline that was paused on
 * @param {number} duration - Pause duration in ms
 */
export function trackHeadlinePause(headline, duration) {
  trackEvent(EVENT_TYPES.HEADLINE_PAUSE, {
    headlineId: headline.id,
    category: headline.category,
    pauseDuration: duration,
  });
}

/**
 * Track category filter
 * @param {string} category - Selected category
 */
export function trackCategoryFilter(category) {
  trackEvent(EVENT_TYPES.CATEGORY_CLICK, {
    category,
  });

  // Legacy alias
  trackEvent(EVENT_TYPES.CATEGORY_FILTER, {
    category,
  });
}

export function trackPanelExpand(data = {}) {
  trackEvent(EVENT_TYPES.PANEL_EXPAND, { ...data });
}

export function trackPanelCollapse(data = {}) {
  trackEvent(EVENT_TYPES.PANEL_COLLAPSE, { ...data });
}

export function trackCtaClick(headline, cta = {}) {
  trackEvent(EVENT_TYPES.CTA_CLICK, {
    headlineId: headline?.id,
    category: headline?.category,
    urgency: headline?.urgency,
    ctaText: cta?.text,
    ctaLink: cta?.link,
  });
}

export function trackShareClick(headline, platform = 'native', meta = {}) {
  trackEvent(EVENT_TYPES.SHARE_CLICK, {
    headlineId: headline?.id,
    category: headline?.category,
    urgency: headline?.urgency,
    platform,
    ...meta,
  });
}

export function trackNightSummaryView(meta = {}) {
  trackEvent(EVENT_TYPES.NIGHT_SUMMARY_VIEW, { ...meta });
}

/**
 * Track mode change
 * @param {string} oldMode - Previous mode
 * @param {string} newMode - New mode
 */
export function trackModeChange(oldMode, newMode) {
  trackEvent(EVENT_TYPES.MODE_CHANGE, {
    fromMode: oldMode,
    toMode: newMode,
  });
}

/**
 * Track summary view
 * @param {string} type - Summary type (morning/night)
 */
export function trackSummaryView(type) {
  trackEvent(EVENT_TYPES.SUMMARY_VIEW, {
    summaryType: type,
  });
}

/**
 * Track summary share
 * @param {string} type - Summary type
 * @param {string} platform - Share platform
 */
export function trackSummaryShare(type, platform = 'whatsapp') {
  trackEvent(EVENT_TYPES.SUMMARY_SHARE, {
    summaryType: type,
    platform,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGAGEMENT METRICS
// ═══════════════════════════════════════════════════════════════════════════

let pageLoadTime = null;

/**
 * Initialize page engagement tracking
 */
export function initEngagementTracking() {
  if (typeof window === 'undefined') return;
  
  pageLoadTime = Date.now();
  
  // Track page view
  trackEvent(EVENT_TYPES.PAGE_VIEW, {
    url: window.location.pathname,
  });
  
  // Track scroll depth
  let maxScrollDepth = 0;
  const trackScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = Math.round((window.scrollY / scrollHeight) * 100);
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      // Track at 25%, 50%, 75%, 100%
      if ([25, 50, 75, 100].includes(scrollDepth)) {
        trackEvent(EVENT_TYPES.SCROLL_DEPTH, {
          depth: scrollDepth,
        });
      }
    }
  };
  
  window.addEventListener('scroll', trackScroll, { passive: true });
  
  // Track time on page when leaving
  const trackTimeOnPage = () => {
    if (pageLoadTime) {
      const duration = Date.now() - pageLoadTime;
      trackEvent(EVENT_TYPES.TIME_ON_PAGE, {
        duration,
        durationSeconds: Math.round(duration / 1000),
      });
    }
  };
  
  window.addEventListener('beforeunload', trackTimeOnPage);
  
  // Cleanup function
  return () => {
    window.removeEventListener('scroll', trackScroll);
    window.removeEventListener('beforeunload', trackTimeOnPage);
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PAUSE DETECTION (12-second threshold)
// ═══════════════════════════════════════════════════════════════════════════

const PAUSE_THRESHOLD_MS = 12000; // 12 seconds
let pauseTimer = null;
let currentHeadlineForPause = null;
let pauseStartTime = null;

/**
 * Start tracking pause for a headline
 * Fires 'headline_pause' event if headline stays visible > 12 seconds
 * @param {Object} headline - The headline being viewed
 */
export function startPauseDetection(headline) {
  // Clear any existing timer
  stopPauseDetection();
  
  if (!headline) return;
  
  currentHeadlineForPause = headline;
  pauseStartTime = Date.now();
  
  pauseTimer = setTimeout(() => {
    if (currentHeadlineForPause && pauseStartTime) {
      const duration = Date.now() - pauseStartTime;
      trackHeadlinePause(currentHeadlineForPause, duration);
      
      // Also store in sessionStorage for engagement tracking
      try {
        const pausedHeadlines = JSON.parse(
          sessionStorage.getItem('li_paused_headlines') || '[]'
        );
        const headlineId = currentHeadlineForPause.id || currentHeadlineForPause.headline;
        if (!pausedHeadlines.includes(headlineId)) {
          pausedHeadlines.push(headlineId);
          sessionStorage.setItem('li_paused_headlines', JSON.stringify(pausedHeadlines));
        }
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, PAUSE_THRESHOLD_MS);
}

/**
 * Stop pause detection (headline changed or panel closed)
 */
export function stopPauseDetection() {
  if (pauseTimer) {
    clearTimeout(pauseTimer);
    pauseTimer = null;
  }
  currentHeadlineForPause = null;
  pauseStartTime = null;
}

/**
 * Reset pause detection (e.g., when user scrolls away)
 */
export function resetPauseDetection() {
  stopPauseDetection();
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  EVENT_TYPES,
  trackEvent,
  trackHeadlineView,
  trackHeadlineClick,
  trackHeadlineShare,
  trackHeadlinePause,
  trackCategoryFilter,
  trackModeChange,
  trackSummaryView,
  trackSummaryShare,
  initEngagementTracking,
  startPauseDetection,
  stopPauseDetection,
  resetPauseDetection,
};

# COMPONENT CODES - BACKUP

> Last Updated: January 13, 2026
> All code backups for Live Intelligence page

---

## 1. MODES.JS (lib/live-intelligence/modes.js)

```javascript
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
```

---

## 2. MODE INDICATOR COMPONENT

```jsx
'use client';

import { useState, useEffect } from 'react';
import { getCurrentModeConfig, getISTTime, isMarketOpen } from '@/lib/live-intelligence/modes';

export default function ModeIndicator() {
  const [mode, setMode] = useState(null);
  const [time, setTime] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMode(getCurrentModeConfig());
    setTime(getISTTime());
    setMarketOpen(isMarketOpen());

    const clockInterval = setInterval(() => {
      setTime(getISTTime());
    }, 1000);

    const modeInterval = setInterval(() => {
      const newMode = getCurrentModeConfig();
      setMarketOpen(isMarketOpen());
      
      if (newMode.key !== mode?.key) {
        setIsTransitioning(true);
        setTimeout(() => {
          setMode(newMode);
          setIsTransitioning(false);
        }, 300);
      }
    }, 60000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(modeInterval);
    };
  }, [mode?.key]);

  if (!mode) return null;

  return (
    <>
      <div
        className={`li-mode-indicator ${isTransitioning ? 'transitioning' : ''}`}
        style={{
          '--accent': mode.accentColor,
          '--accent-dim': mode.accentColorDim,
          '--glow': mode.glowColor,
        }}
      >
        <span className="li-mode-icon">{mode.icon}</span>
        <div className="li-mode-info">
          <span className="li-mode-label">{mode.label}</span>
          <span className="li-mode-time">{time} IST</span>
        </div>
        <div className={`li-market-status ${marketOpen ? 'open' : 'closed'}`}>
          <span className="li-market-dot" />
          <span className="li-market-label">{marketOpen ? 'LIVE' : 'CLOSED'}</span>
        </div>
      </div>
      {/* Styles in component */}
    </>
  );
}
```

---

## 3. CLOSE BUTTON (in page.jsx)

```jsx
{/* CLOSE BUTTON - Fixed top-right, Apple minimal style */}
<button
  type="button"
  onClick={handleClose}
  aria-label="Go back to homepage"
  className="li-close-btn"
>
  ←
</button>

<style>{`
  .li-close-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 28px;
    line-height: 1;
    padding: 10px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .li-close-btn:hover {
    color: rgba(255, 255, 255, 1);
    transform: translateX(-3px);
  }
`}</style>
```

---

## 4. LASER SECTION (LOCKED - DO NOT MODIFY)

```jsx
{/* LASER (LOCKED): fullscreen, no filters, no overlays, no masking */}
<section
  aria-label="Live Intelligence Laser"
  style={{
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    background: '#090A0C',
  }}
>
  <video
    src={VIDEO_SRC}
    autoPlay
    muted
    playsInline
    loop
    preload="auto"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center bottom',
      pointerEvents: 'none',
      filter: 'none',
      transform: 'none',
      opacity: 1,
    }}
  />
</section>
```

---

## 5. GLOBALS.CSS FOOTER VISIBILITY

```css
/* Ensure footer is visible on laser page */
body[data-laser-active="true"] footer {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
```

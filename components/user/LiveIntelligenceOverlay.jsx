'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔒 LOCKED FILE - LIVE INTELLIGENCE OVERLAY                                  ║
 * ║  Last Updated: January 15, 2026                                               ║
 * ║                                                                               ║
 * ║  ⚠️  DO NOT MODIFY WITHOUT READING:                                          ║
 * ║      backup/live-intelligence-locked-2026-01-15/RESTORE_GUIDE.md             ║
 * ║                                                                               ║
 * ║  CRITICAL SECTIONS MARKED WITH: ⚠️ PROTECTED CODE - DO NOT MODIFY ⚠️        ║
 * ║                                                                               ║
 * ║  IF YOU BREAK THIS FILE:                                                      ║
 * ║  Copy-Item "backup\live-intelligence-locked-2026-01-15\LiveIntelligenceOverlay.jsx" "components\user\" -Force ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useRef, useCallback, useMemo, cloneElement, isValidElement } from 'react';
import { createPortal } from 'react-dom';

import HeadlineFeed from '@/components/live-intelligence/HeadlineFeed';
import ModeIndicator from '@/components/live-intelligence/ModeIndicator';
import DonutCalculator from '@/components/live-intelligence/DonutCalculator';
import StreakBadge from '@/components/live-intelligence/StreakBadge';
import MorningBrief from '@/components/live-intelligence/MorningBrief';
import NightSummary from '@/components/live-intelligence/NightSummary';
import QuickLearn from '@/components/live-intelligence/QuickLearn';
import MarketMoodIndicator from '@/components/live-intelligence/MarketMoodIndicator';
import MarketIntelPanel from '@/components/live-intelligence/MarketIntelPanel';
import OptionsIntelPanel from '@/components/live-intelligence/OptionsIntelPanel';
import SectorPulsePanel from '@/components/live-intelligence/SectorPulsePanel';
import DealsIntelPanel from '@/components/live-intelligence/DealsIntelPanel';
import PortfolioTickersPanel from '@/components/live-intelligence/PortfolioTickersPanel';
import { savedHeadlines } from '@/components/live-intelligence/HeadlineCard';

// New feature imports for voice, theme, gamification, personalization
import { BadgeDisplay } from '@/components/live-intelligence/BadgeDisplay';
import { AchievementPopup } from '@/components/live-intelligence/AchievementPopup';
import { FeedToggle } from '@/components/live-intelligence/FeedToggle';
// Theme toggle removed - we follow the main system theme
import { getVoiceReader } from '@/lib/live-intelligence/voice';
import { getGamificationTracker } from '@/lib/live-intelligence/gamification';
import { getPersonalizationEngine } from '@/lib/live-intelligence/personalization';
import Link from 'next/link';
import LazyTradingView from '@/components/shared/LazyTradingView';
import MarketClockStatusBadge from '@/components/live-intelligence/MarketClockStatusBadge';
import AnimatedNumber from '@/components/animations/AnimatedNumber';
import { ShareDropdown } from '@/components/ShareDropdown';
import { AddGoalButton } from '@/components/GoalModal';

// Session storage key to track if auto-open happened this session
const SESSION_KEY = 'li-overlay-auto-opened';

/**
 * VoiceControl - Button to read headlines aloud
 */
const VoiceControl = ({ headline, summary, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [rate, setRate] = useState(1.0);
  
  useEffect(() => {
    const reader = getVoiceReader();
    if (reader?.isSupported()) {
      setIsEnabled(true);
    }
  }, []);
  
  const handleToggle = useCallback(() => {
    const reader = getVoiceReader();
    if (!reader) return;
    
    if (isPlaying) {
      reader.stop();
      setIsPlaying(false);
    } else {
      reader.setRate(rate);
      if (headline) {
        reader.readHeadline(headline);
      } else if (summary) {
        reader.readSummary(summary);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, headline, summary, rate]);
  
  // Listen for speech end
  useEffect(() => {
    if (!isPlaying) return;
    
    const checkInterval = setInterval(() => {
      const reader = getVoiceReader();
      if (reader && !reader.isPlaying) {
        setIsPlaying(false);
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [isPlaying]);
  
  // Keyboard shortcut (Space to play/pause)
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        handleToggle();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleToggle]);
  
  if (!isEnabled) return null;
  
  return (
    <button
      onClick={handleToggle}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '10px',
        border: `1px solid ${isPlaying ? 'rgba(100, 255, 150, 0.35)' : 'rgba(170, 198, 255, 0.28)'}`,
        background: isPlaying ? 'rgba(100, 255, 150, 0.16)' : 'rgba(170, 198, 255, 0.14)',
        color: isPlaying ? 'rgba(170, 255, 210, 0.98)' : 'rgba(235, 242, 255, 0.92)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isPlaying ? '0 10px 26px rgba(0,0,0,0.30)' : '0 8px 22px rgba(0,0,0,0.22)',
      }}
      title={isPlaying ? 'Stop reading (Space)' : 'Read aloud (Space)'}
      aria-label={isPlaying ? 'Stop reading' : 'Read aloud'}
      onMouseOver={(e) => {
        if (!isPlaying) {
          e.currentTarget.style.background = 'rgba(170, 198, 255, 0.20)';
          e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.40)';
        }
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = isPlaying ? 'rgba(100, 255, 150, 0.16)' : 'rgba(170, 198, 255, 0.14)';
        e.currentTarget.style.borderColor = isPlaying ? 'rgba(100, 255, 150, 0.35)' : 'rgba(170, 198, 255, 0.28)';
      }}
    >
      <span>{isPlaying ? '⏸️' : '🔊'}</span>
      <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Listen'}</span>
    </button>
  );
};

/**
 * MarketStatusBadge - Shows NSE OPEN/CLOSED status
 * ⚠️ NOTE: DO NOT CHANGE COLORS WITHOUT ASKING USER FIRST
 * Uses icy blue colors to match laser page palette
 */
const MarketStatusBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + (istOffset - now.getTimezoneOffset() * 60 * 1000));
      const day = istTime.getDay();
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      // NSE: Mon-Fri, 9:15 AM - 3:30 PM IST
      const marketOpen = 9 * 60 + 15;
      const marketClose = 15 * 60 + 30;
      setIsOpen(day >= 1 && day <= 5 && totalMinutes >= marketOpen && totalMinutes <= marketClose);
    };
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '9px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      background: isOpen ? 'rgba(100, 220, 180, 0.12)' : 'rgba(120, 150, 200, 0.12)',
      border: `1px solid ${isOpen ? 'rgba(100, 220, 180, 0.30)' : 'rgba(120, 150, 200, 0.30)'}`,
      color: isOpen ? 'rgba(100, 220, 180, 0.95)' : 'rgba(160, 185, 220, 0.95)',
    }}>
      NSE {isOpen ? 'OPEN' : 'CLOSED'}
    </span>
  );
};

const TradingViewEmbed = ({ scriptSrc, options, className, style }) => {
  const containerRef = useRef(null);
  const optionsJson = useMemo(() => JSON.stringify(options ?? {}), [options]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = scriptSrc;
    script.innerHTML = optionsJson;

    el.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [scriptSrc, optionsJson]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#131722',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

/**
 * LiveIntelligenceOverlay
 * 
 * Full-page overlay containing:
 * - Laser (top)
 * - Panel with dashboard (middle)
 * - Footer (bottom)
 * 
 * Opens when: user scrolls past LIVE MOOD bar (once per session)
 * Closes when: 75% footer visible OR click ← arrow
 */
export default function LiveIntelligenceOverlay({ 
  liveMoodRef,  // ref to the LIVE MOOD bar element for scroll detection
  footerContent // the actual footer JSX to render inside overlay
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef(null);
  const hasAutoOpenedRef = useRef(false);

  // TradingView chart interval UX (keep minimal + isolated)
  const [tvInterval, setTvInterval] = useState('D');
  const [tvSymbol, setTvSymbol] = useState('TVC:NIFTY');
  const [tvIsSwitching, setTvIsSwitching] = useState(false);
  const tvSwitchTimersRef = useRef([]);

  // Defensive: avoid runtime crashes if a bundler/edit regression ever removes these bindings.
  // `typeof` is safe even if the identifier is undeclared.
  const tvIntervalSafe = typeof tvInterval === 'string' && tvInterval ? tvInterval : 'D';
  const tvSymbolSafe = typeof tvSymbol === 'string' && tvSymbol ? tvSymbol : 'TVC:NIFTY';

  useEffect(() => {
    return () => {
      try {
        tvSwitchTimersRef.current.forEach((t) => clearTimeout(t));
      } catch {}
      tvSwitchTimersRef.current = [];
    };
  }, []);

  const handleTvIntervalChange = useCallback((nextInterval) => {
    if (!nextInterval || nextInterval === tvIntervalSafe) return;
    try {
      tvSwitchTimersRef.current.forEach((t) => clearTimeout(t));
    } catch {}
    tvSwitchTimersRef.current = [];

    setTvIsSwitching(true);
    tvSwitchTimersRef.current.push(
      setTimeout(() => setTvInterval(nextInterval), 140)
    );
    tvSwitchTimersRef.current.push(
      setTimeout(() => setTvIsSwitching(false), 520)
    );
  }, [tvIntervalSafe]);

  const handleTvSymbolChange = useCallback((nextSymbol) => {
    if (!nextSymbol || nextSymbol === tvSymbolSafe) return;
    try {
      tvSwitchTimersRef.current.forEach((t) => clearTimeout(t));
    } catch {}
    tvSwitchTimersRef.current = [];

    setTvIsSwitching(true);
    tvSwitchTimersRef.current.push(
      setTimeout(() => setTvSymbol(nextSymbol), 120)
    );
    tvSwitchTimersRef.current.push(
      setTimeout(() => setTvIsSwitching(false), 520)
    );
  }, [tvSymbolSafe]);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safety cleanup: ensure we never leave the page scroll-locked
  // if the overlay component unmounts while open.
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = '';
        document.body.removeAttribute('data-laser-active');
      }
    };
  }, []);

  // Open the overlay
  const openOverlay = useCallback(() => {
    if (isOpen || isAnimating) return;
    setIsAnimating(true);
    setIsOpen(true);
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-laser-active', 'true');
    }
    
    // Animation complete
    setTimeout(() => setIsAnimating(false), 400);
  }, [isOpen, isAnimating]);

  // Close the overlay
  const closeOverlay = useCallback(() => {
    if (!isOpen || isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = '';
        document.body.removeAttribute('data-laser-active');
      }
    }, 300);
  }, [isOpen, isAnimating]);

  const handleFooterHome = useCallback(() => {
    // "Home" inside overlay should return to the real homepage content:
    // close overlay and restore underlying page scroll.
    closeOverlay();
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }, 340);
    }
  }, [closeOverlay]);

  // Expose open function globally for manual triggers
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__openLiveIntelligence = openOverlay;
    return () => {
      delete window.__openLiveIntelligence;
    };
  }, [openOverlay]);

  // Session-based auto-open: Only triggers ONCE per browser session.
  // The flag persists in sessionStorage until the browser/tab is closed.
  // DO NOT clear on beforeunload - that defeats the purpose of session-based triggering.

  // Auto-open when scrolling past LIVE MOOD (once per session)
  useEffect(() => {
    let rafId = 0;
    let cancelled = false;
    let observer;

    // Guard: some browsers/environments may not support this API.
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return () => {};
    }
    
    // Check if already auto-opened this session
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        hasAutoOpenedRef.current = true;
      }
    }

    const attach = () => {
      if (cancelled) return;
      const target = liveMoodRef?.current;
      if (!target) {
        rafId = window.requestAnimationFrame(attach);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          // When LIVE MOOD bar goes OUT of view (user scrolled past it)
          if (!entry.isIntersecting && !hasAutoOpenedRef.current && !isOpen) {
            // Check scroll direction - only trigger on scroll DOWN
            if (entry.boundingClientRect.top < 0) {
              hasAutoOpenedRef.current = true;
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(SESSION_KEY, 'true');
              }
              openOverlay();
            }
          }
        },
        { threshold: 0, rootMargin: '0px' }
      );

      observer.observe(target);
    };

    attach();
    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [liveMoodRef, openOverlay, isOpen]);

  // NOTE: We intentionally do NOT auto-close when footer becomes visible.
  // Users want to view and use the full LaserFooter (client-portal version).

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeOverlay();
    };
    
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOverlay]);

  if (!mounted) return null;

  const footerWithHandlers = isValidElement(footerContent)
    ? cloneElement(footerContent, {
        inLiveOverlay: true,
        onHomeClick: handleFooterHome,
        onNavigate: closeOverlay,
      })
    : footerContent;

  const overlayContent = (
    <div
      ref={overlayRef}
      className={`li-overlay ${isOpen ? 'li-overlay-open' : ''} ${isAnimating && !isOpen ? 'li-overlay-closing' : ''}`}
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: '#090A0C',
        overflowY: 'auto',
        overflowX: 'hidden',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'scale(1)' : 'scale(0.98)',
        transition: isOpen 
          ? 'opacity 400ms ease-out, transform 400ms ease-out' 
          : 'opacity 300ms ease-in, transform 300ms ease-in',
        pointerEvents: isOpen ? 'auto' : 'none',
        visibility: isOpen || isAnimating ? 'visible' : 'hidden',
      }}
    >
      {/* Hide body scroll when overlay is open */}
      {isOpen && (
        <style>{`
          html, body {
            overflow: hidden !important;
            height: 100% !important;
          }
          /* Safe area fix for mobile browsers - CSS fallback */
          .li-overlay {
            top: env(safe-area-inset-top, 0px) !important;
          }
          .li-page-wrapper {
            padding-top: env(safe-area-inset-top, 0px) !important;
          }
        `}</style>
      )}
      {/* Global styles for overlay */}
      <style>{`
        /* Show scrollbar (users want visible scroll feedback) */
        .li-overlay {
          -ms-overflow-style: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(170, 198, 255, 0.35) rgba(0, 0, 0, 0);
        }
        .li-overlay::-webkit-scrollbar {
          width: 10px;
        }
        .li-overlay::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0);
        }
        .li-overlay::-webkit-scrollbar-thumb {
          background: rgba(170, 198, 255, 0.22);
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0);
          background-clip: padding-box;
        }
        .li-overlay::-webkit-scrollbar-thumb:hover {
          background: rgba(170, 198, 255, 0.32);
          background-clip: padding-box;
        }

        /* Hide number input spinners (desktop browsers) */
        .li-number-input::-webkit-outer-spin-button,
        .li-number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .li-number-input {
          -moz-appearance: textfield;
          border-bottom: 1px solid rgba(170, 198, 255, 0.18) !important;
          padding-bottom: 2px !important;
        }
        .li-number-input:focus {
          border-bottom-color: rgba(170, 198, 255, 0.55) !important;
          box-shadow: 0 10px 22px rgba(100, 160, 255, 0.12);
        }
        
        /* Ensure footer inside overlay has normal styling */
        .li-footer-wrapper footer {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Quick Access grid - responsive (match laser page intent) */
        .li-qa-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (min-width: 640px) {
          .li-qa-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .li-qa-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }

        /* FORCE Global Markets TradingView widget to black */
        .li-global-markets-widget {
          background: #000000 !important;
        }
        .li-tv-widget,
        .li-tv-widget iframe,
        .li-tv-widget > div,
        .li-global-markets-widget,
        .li-global-markets-widget iframe {
          background: #131722 !important;
        }
        .li-global-markets-widget * {
          background-color: transparent;
        }

        /* Category filter - premium scroll */
        .li-category-filter {
          overflow-x: auto !important;
          max-width: 100%;
          scrollbar-width: thin;
          scrollbar-color: rgba(170, 198, 255, 0.30) rgba(0, 0, 0, 0);
        }
        .li-category-filter::-webkit-scrollbar {
          height: 5px;
        }
        .li-category-filter::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0);
        }
        .li-category-filter::-webkit-scrollbar-thumb {
          background: rgba(170, 198, 255, 0.22);
          border-radius: 5px;
        }
        .li-category-filter::-webkit-scrollbar-thumb:hover {
          background: rgba(170, 198, 255, 0.35);
        }
        .li-category-scroll {
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          padding-right: 20px;
          padding-bottom: 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(170, 198, 255, 0.30) rgba(0, 0, 0, 0);
        }
        .li-category-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .li-category-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0);
        }
        .li-category-scroll::-webkit-scrollbar-thumb {
          background: rgba(170, 198, 255, 0.22);
          border-radius: 5px;
        }
        .li-category-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(170, 198, 255, 0.35);
        }

        /* ═══════════════════════════════════════════════════════════
           ICON STYLES - Clean premium look without spinning
           ═══════════════════════════════════════════════════════════ */

        /* Global Markets Icon - Static with subtle glow */
        .li-globe-icon {
          filter: drop-shadow(0 0 6px rgba(140, 190, 255, 0.4));
        }

        /* Live Chart Icon - Static with glow */
        .li-chart-icon {
          filter: drop-shadow(0 0 6px rgba(140, 190, 255, 0.4));
        }

        /* Live Signals Icon - Static with glow */
        .li-signals-icon {
          filter: drop-shadow(0 0 6px rgba(140, 190, 255, 0.4));
        }

        /* Live dot animation - subtle pulse only */
        .li-live-dot {
          width: 8px;
          height: 8px;
          background: rgba(140, 220, 180, 0.9);
          border-radius: 50%;
          animation: liveDotPulse 1.5s ease-in-out infinite;
        }

        @keyframes liveDotPulse {
          0%, 100% { 
            opacity: 0.5; 
            box-shadow: 0 0 0 0 rgba(140, 220, 180, 0.4); 
          }
          50% { 
            opacity: 1; 
            box-shadow: 0 0 0 6px rgba(140, 220, 180, 0); 
          }
        }
      `}</style>

      {/* PANEL SECTION - Laser video removed, panel starts at top */}
      <LiveIntelligencePanel onClose={closeOverlay} scrollContainerRef={overlayRef} />
      
      {/* Achievement Popup - Shows when badge is unlocked */}
      <AchievementPopup />

      {/* FOOTER - rendered with original styling (data-laser-active handles the special colors) */}
      <div
        data-li-footer
        className="li-footer-wrapper"
        style={{
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          position: 'relative',
          zIndex: 100,
          width: '100%',
          marginTop: 0,
          background: '#090A0C',
        }}
      >
        {footerWithHandlers}
      </div>
    </div>
  );

  const portalTarget = typeof document !== 'undefined' ? (document.body || document.documentElement) : null;
  if (!portalTarget) return null;
  return createPortal(overlayContent, portalTarget);
}

/**
 * SavedHeadlinesSection - Shows bookmarked headlines from localStorage
 */
function SavedHeadlinesSection() {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    setSaved(savedHeadlines.getAll());
  }, []);

  const handleRemove = (headlineId) => {
    savedHeadlines.unsave(headlineId);
    setSaved(savedHeadlines.getAll());
  };

  if (saved.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        background: 'rgba(20, 25, 35, 0.6)',
        borderRadius: '16px',
        border: '1px solid rgba(100, 160, 255, 0.1)',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔖</div>
        <h4 style={{
          margin: '0 0 8px',
          color: 'rgba(200, 215, 240, 0.85)',
          fontSize: '16px',
          fontWeight: 600,
        }}>
          No Saved Headlines
        </h4>
        <p style={{
          margin: 0,
          color: 'rgba(180, 195, 230, 0.6)',
          fontSize: '14px',
        }}>
          Tap the 📑 icon on any headline to save it for later
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        margin: '0 0 16px',
        color: 'rgba(230, 240, 255, 0.95)',
        fontSize: '17px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>🔖</span> Saved Headlines
        <span style={{
          marginLeft: 'auto',
          fontSize: '12px',
          color: 'rgba(180, 195, 230, 0.6)',
        }}>
          {saved.length} saved
        </span>
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {saved.map((headline) => (
          <div
            key={headline.id}
            style={{
              background: 'linear-gradient(180deg, rgba(20, 25, 35, 0.90) 0%, rgba(12, 14, 20, 0.95) 100%)',
              border: '1px solid rgba(100, 160, 255, 0.15)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: 'rgba(235, 242, 255, 0.95)',
                flex: 1,
                lineHeight: 1.4,
              }}>
                {headline.headline}
              </h4>
              <button
                onClick={() => handleRemove(headline.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 100, 100, 0.7)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 8px',
                  marginLeft: '12px',
                }}
                title="Remove from saved"
              >
                ✕
              </button>
            </div>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: 'rgba(200, 215, 240, 0.65)',
              lineHeight: 1.5,
            }}>
              {headline.whyItMatters}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: 'rgba(180, 195, 230, 0.5)',
              marginTop: '4px',
            }}>
              <span>{headline.source}</span>
              <span>
                Saved {new Date(headline.savedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/**
 * Panel component with dashboard content and EPIC DONUT
 */
function LiveIntelligencePanel({ onClose, scrollContainerRef = null }) {
  const [portfolioValue] = useState(28.3);
  const [totalInvested] = useState(24.8);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pulse'); // Tab state: pulse, live, timings, 2days, 4days
  const [breakingHeadline, setBreakingHeadline] = useState(null); // For breaking news click
  const [allocations, setAllocations] = useState({
    equity: 58,
    debt: 24,
    gold: 8,
    cash: 10,
  });

  const [isAllocationEditing, setIsAllocationEditing] = useState(false);

  // TradingView chart interval/symbol state (local to panel)
  const [tvInterval, setTvInterval] = useState('D');
  const [tvSymbol, setTvSymbol] = useState('TVC:NIFTY');
  const [tvIsSwitching, setTvIsSwitching] = useState(false);
  const tvSwitchTimersRef = useRef([]);

  // Defensive: derived safe values for TradingView bindings
  const tvIntervalSafe = typeof tvInterval === 'string' && tvInterval ? tvInterval : 'D';
  const tvSymbolSafe = typeof tvSymbol === 'string' && tvSymbol ? tvSymbol : 'TVC:NIFTY';

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      tvSwitchTimersRef.current.forEach((t) => clearTimeout(t));
      tvSwitchTimersRef.current = [];
    };
  }, []);

  const handleTvIntervalChange = useCallback((nextInterval) => {
    if (!nextInterval || nextInterval === tvIntervalSafe) return;
    tvSwitchTimersRef.current.forEach((t) => clearTimeout(t));
    tvSwitchTimersRef.current = [];
    setTvIsSwitching(true);
    tvSwitchTimersRef.current.push(setTimeout(() => setTvInterval(nextInterval), 140));
    tvSwitchTimersRef.current.push(setTimeout(() => setTvIsSwitching(false), 520));
  }, [tvIntervalSafe]);

  const handleTvSymbolChange = useCallback((nextSymbol) => {
    if (!nextSymbol || nextSymbol === tvSymbolSafe) return;
    tvSwitchTimersRef.current.forEach((t) => clearTimeout(t));
    tvSwitchTimersRef.current = [];
    setTvIsSwitching(true);
    tvSwitchTimersRef.current.push(setTimeout(() => setTvSymbol(nextSymbol), 120));
    tvSwitchTimersRef.current.push(setTimeout(() => setTvIsSwitching(false), 520));
  }, [tvSymbolSafe]);

  // Handle breaking news headline click - scroll to feed and highlight
  const handleBreakingClick = useCallback((headline) => {
    // For now, just scroll to the headline feed section
    // Could expand to show a modal or highlight specific headline
    const feedSection = document.querySelector('[data-headline-feed]');
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setBreakingHeadline(headline);
  }, []);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://bmwealth.co.in';
    const baseUrl = window.location.origin || 'https://bmwealth.co.in';
    return baseUrl;
  }, []);

  const shareText = useMemo(
    () => 'Check out BM Wealth Live Intelligence — real-time portfolio insights and market signals.',
    []
  );

  // ═══════════════════════════════════════════════════════════
  // UTM TRACKING - All share links include tracking parameters
  // ═══════════════════════════════════════════════════════════
  const shareLinks = useMemo(() => {
    const addUtm = (url, medium) => {
      const utmParams = `?utm_source=live_intelligence&utm_medium=${medium}&utm_campaign=share`;
      return `${url}${utmParams}`;
    };
    
    const urlWithWhatsapp = addUtm(shareUrl, 'whatsapp');
    const urlWithEmail = addUtm(shareUrl, 'email');
    const urlWithTwitter = addUtm(shareUrl, 'twitter');
    const urlWithLinkedin = addUtm(shareUrl, 'linkedin');
    
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${urlWithWhatsapp}`)}`,
      email: `mailto:?subject=${encodeURIComponent('BM Wealth Live Intelligence')}&body=${encodeURIComponent(`${shareText}\n\n${urlWithEmail}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(urlWithTwitter)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlWithLinkedin)}`,
    };
  }, [shareText, shareUrl]);

  // Tab order for keyboard navigation
  const tabOrder = ['pulse', 'live', 'timings', '2days', '4days', 'saved'];

  // ═══════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS for navigation
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      // Escape - close overlay
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }
      
      // Arrow Left/Right - Navigate tabs
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = tabOrder.indexOf(activeTab);
        if (e.key === 'ArrowLeft') {
          const newIndex = currentIndex > 0 ? currentIndex - 1 : tabOrder.length - 1;
          setActiveTab(tabOrder[newIndex]);
        } else {
          const newIndex = currentIndex < tabOrder.length - 1 ? currentIndex + 1 : 0;
          setActiveTab(tabOrder[newIndex]);
        }
      }
      
      // Ctrl+S or Cmd+S - Open share menu
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowShareMenu(prev => !prev);
      }
      
      // Number keys 1-6 for quick tab switch
      if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (tabOrder[index]) {
          setActiveTab(tabOrder[index]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, setActiveTab, setShowShareMenu]);

  // Store scroll position in ref to persist across re-renders
  const savedScrollRef = useRef({ container: 0, window: 0 });

  // ⚠️ PROTECTED CODE - DO NOT MODIFY ⚠️
  // PDF modal handlers - Keep simple! Do NOT manipulate body.overflow or scrollTop
  // Any overflow/scroll manipulation causes the page to jump to top
  const handlePdfOpen = useCallback((url) => {
    setPdfUrl(url);
    setShowPdfModal(true);
  }, []);

  // ⚠️ PROTECTED CODE - DO NOT MODIFY ⚠️
  const handlePdfClose = useCallback(() => {
    setShowPdfModal(false);
    setPdfUrl(null);
  }, []);

  // ESC key to close PDF modal
  useEffect(() => {
    if (!showPdfModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handlePdfClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showPdfModal, handlePdfClose]);

  const kpi = useMemo(() => {
    const currentValue = portfolioValue;
    const invested = totalInvested;
    const unrealized = currentValue - invested;
    const totalReturnPct = invested > 0 ? (unrealized / invested) * 100 : 0;

    const equityPct = Number(allocations?.equity) || 0;
    const xirr = totalReturnPct;

    // Keep this computed locally to avoid any accidental undeclared identifier crashes.
    const riskScoreLabel = equityPct >= 80 ? 'High' : equityPct >= 50 ? 'Moderate' : 'Low';

    return [
      {
        label: 'Total Invested',
        kind: 'moneyL',
        number: invested,
        hint: 'Across MF + PMS + FD',
        trend: null,
      },
      {
        label: 'Current Value',
        kind: 'moneyL',
        number: currentValue,
        hint: `${unrealized >= 0 ? '+' : '−'}₹ ${Math.abs(unrealized).toFixed(1)}L unrealized`,
        trend: `${totalReturnPct >= 0 ? '+' : ''}${totalReturnPct.toFixed(1)}%`,
      },
      {
        label: 'XIRR',
        kind: 'percent',
        number: xirr,
        hint: 'Last 12 months (est.)',
        trend: null,
      },
      {
        label: 'Risk Score',
        kind: 'text',
        value: riskScoreLabel,
        hint: `Equity ${equityPct}% allocation`,
        trend: null,
      },
    ];
  }, [allocations?.equity, portfolioValue, totalInvested]);

  const tvMarketsOptions = useMemo(
    () => ({
      colorTheme: 'dark',
      dateRange: '12M',
      showChart: true,
      locale: 'in',
      showSymbolLogo: true,
      showFloatingTooltip: false,
      tabs: [
        {
          title: 'India',
          symbols: [
            { s: 'NSE:NIFTY', d: 'NIFTY 50' },
            { s: 'NSE:BANKNIFTY', d: 'BANKNIFTY' },
            { s: 'BSE:SENSEX', d: 'SENSEX' },
            { s: 'NSE:NIFTYIT', d: 'NIFTY IT' },
            { s: 'NSE:NIFTYPHARMA', d: 'NIFTY Pharma' },
            { s: 'NSE:NIFTYFMCG', d: 'NIFTY FMCG' },
            { s: 'NSE:NIFTYAUTO', d: 'NIFTY Auto' },
            { s: 'NSE:NIFTYMETAL', d: 'NIFTY Metal' },
            { s: 'NSE:NIFTYMIDCAP50', d: 'NIFTY MIDCAP 50' },
          ],
        },
        {
          title: 'Global',
          symbols: [
            { s: 'OANDA:SPX500USD', d: 'S&P 500' },
            { s: 'OANDA:NAS100USD', d: 'Nasdaq 100' },
            { s: 'OANDA:US30USD', d: 'Dow 30' },
            { s: 'OANDA:DE30EUR', d: 'DAX 40' },
            { s: 'OANDA:UK100GBP', d: 'FTSE 100' },
            { s: 'OANDA:JP225USD', d: 'Nikkei 225' },
            { s: 'OANDA:HK33HKD', d: 'Hang Seng' },
          ],
        },
        {
          title: 'Commodities',
          symbols: [
            { s: 'TVC:GOLD', d: 'Gold' },
            { s: 'TVC:SILVER', d: 'Silver' },
            { s: 'NYMEX:CL1!', d: 'Crude Oil' },
            { s: 'TVC:DXY', d: 'US Dollar Index' },
          ],
        },
        {
          title: 'Forex',
          symbols: [
            { s: 'FX_IDC:USDINR', d: 'USD/INR' },
            { s: 'FX:EURUSD', d: 'EUR/USD' },
            { s: 'FX:USDJPY', d: 'USD/JPY' },
            { s: 'FX:GBPUSD', d: 'GBP/USD' },
          ],
        },
        {
          title: 'Crypto',
          symbols: [
            { s: 'BINANCE:BTCUSDT', d: 'BTC' },
            { s: 'BINANCE:ETHUSDT', d: 'ETH' },
          ],
        },
      ],
    }),
    []
  );

  const tvMarketsSrc = useMemo(() => {
    try {
      const tabsEncoded = encodeURIComponent(JSON.stringify(tvMarketsOptions.tabs));
      return `https://s.tradingview.com/embed-widget/market-overview/?colorTheme=${tvMarketsOptions.colorTheme}` +
        `&dateRange=${tvMarketsOptions.dateRange}` +
        `&showChart=${tvMarketsOptions.showChart ? 'true' : 'false'}` +
        `&locale=${tvMarketsOptions.locale}` +
        `&largeChartUrl=` +
        `&isTransparent=true` +
        `&showSymbolLogo=${tvMarketsOptions.showSymbolLogo ? 'true' : 'false'}` +
        `&showFloatingTooltip=${tvMarketsOptions.showFloatingTooltip ? 'true' : 'false'}` +
        `&width=100%25&height=100%25` +
        `&tabs=${tabsEncoded}`;
    } catch {
      return 'https://s.tradingview.com/embed-widget/market-overview/?colorTheme=dark&dateRange=12M&showChart=true&locale=in&largeChartUrl=&isTransparent=true&showSymbolLogo=true&showFloatingTooltip=false&width=100%25&height=100%25';
    }
  }, [tvMarketsOptions]);

  const handleAllocationChange = (key, raw) => {
    const next = String(raw ?? '').replace(/[^0-9]/g, '');
    const num = next === '' ? 0 : Math.max(0, Math.min(100, parseInt(next, 10)));
    setAllocations((prev) => ({ ...prev, [key]: num }));
    setAllocationBumpKey(key);
    window.clearTimeout(allocationBumpTimerRef.current);
    allocationBumpTimerRef.current = window.setTimeout(() => setAllocationBumpKey(null), 1200);
  };

  // Donut rotation speed intentionally fixed (avoid debug controls)
  const donutRotationSeconds = 30;

  const allocationBumpTimerRef = useRef(null);
  const [allocationBumpKey, setAllocationBumpKey] = useState(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(allocationBumpTimerRef.current);
    };
  }, []);

 

  const onRipplePointerDown = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top;
    el.style.setProperty('--li-ripple-x', `${x}px`);
    el.style.setProperty('--li-ripple-y', `${y}px`);
    el.classList.remove('li-ripple-animate');
    void el.offsetWidth;
    el.classList.add('li-ripple-animate');
  };

  const donutGradient = (() => {
    const segments = [
      { key: 'equity', color: 'rgba(100, 160, 255, 0.90)' },
      { key: 'debt', color: 'rgba(140, 220, 180, 0.85)' },
      { key: 'gold', color: 'rgba(255, 200, 120, 0.85)' },
      { key: 'cash', color: 'rgba(180, 150, 255, 0.80)' },
    ];

    const total = segments.reduce((sum, seg) => sum + (Number(allocations?.[seg.key]) || 0), 0);
    if (!total) {
      return 'conic-gradient(rgba(100, 160, 255, 0.10) 0deg 360deg)';
    }

    let start = 0;
    const parts = [];
    for (const seg of segments) {
      const value = Number(allocations?.[seg.key]) || 0;
      if (value <= 0) continue;
      const end = start + (value / total) * 360;
      parts.push(`${seg.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
      start = end;
    }

    // Ensure we always fill the whole ring (handles rounding drift)
    if (parts.length && start < 360) {
      parts[parts.length - 1] = parts[parts.length - 1].replace(/\s[0-9.]+deg\s[0-9.]+deg$/, (m) => {
        const pieces = m.trim().split(/\s+/);
        return ` ${pieces[0]} 360deg`;
      });
    }

    return `conic-gradient(${parts.join(', ')})`;
  })();

  return (
    <section
      aria-label="Live Intelligence Panel"
      style={{
        position: 'relative',
        width: '100%',
        margin: 0,
        padding: 0,
        background: '#090A0C',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
      data-li-panel
    >
      {/* Static top fade (panel-only): calm continuity */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '180px',
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.00) 78%),' +
            'radial-gradient(78% 170% at 50% 0%, rgba(150,190,255,0.10) 0%, rgba(150,190,255,0.00) 66%),' +
            'radial-gradient(40% 120% at 50% 0%, rgba(230,247,255,0.06) 0%, rgba(230,247,255,0.00) 60%)',
          opacity: 1,
        }}
      />

      {/* Premium vertical laser beams (DataBahn-style) */}
      <div aria-hidden="true" className="li-laser-beams">
        <div className="li-beam li-beam-center" />
        <div className="li-beam li-beam-l1" />
        <div className="li-beam li-beam-l2" />
        <div className="li-beam li-beam-l3" />
        <div className="li-beam li-beam-r1" />
        <div className="li-beam li-beam-r2" />
        <div className="li-beam li-beam-r3" />
      </div>

      <style>{`
        /* Container for all laser beams */
        .li-laser-beams {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        /* Base laser beam style */
        .li-beam {
          position: absolute;
          top: 0;
          width: 1px;
          height: 100%;
          pointer-events: none;
          opacity: 0;
        }

        /* The actual moving light pulse (::before) */
        .li-beam::before {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 80px;
          background: linear-gradient(
            180deg,
            rgba(170, 210, 255, 0.00) 0%,
            rgba(200, 230, 255, 0.45) 30%,
            rgba(235, 250, 255, 0.85) 50%,
            rgba(200, 230, 255, 0.45) 70%,
            rgba(170, 210, 255, 0.00) 100%
          );
          border-radius: 999px;
          filter: blur(0.5px);
          box-shadow:
            0 0 8px rgba(170, 210, 255, 0.55),
            0 0 20px rgba(140, 190, 255, 0.35),
            0 0 40px rgba(120, 170, 255, 0.20);
          animation: liBeamPulse var(--beam-duration, 4s) ease-in-out infinite;
          animation-delay: var(--beam-delay, 0s);
        }

        /* Static faint track line (::after) */
        .li-beam::after {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(170, 210, 255, 0.12) 0%,
            rgba(170, 210, 255, 0.06) 30%,
            rgba(170, 210, 255, 0.03) 60%,
            rgba(170, 210, 255, 0.00) 100%
          );
          opacity: 0.65;
        }

        /* Center beam (main, most prominent) */
        .li-beam-center {
          left: 50%;
          transform: translateX(-50%);
          opacity: 1;
          --beam-duration: 3.2s;
          --beam-delay: 0s;
        }
        .li-beam-center::before {
          width: 3px;
          height: 120px;
          box-shadow:
            0 0 12px rgba(170, 210, 255, 0.65),
            0 0 28px rgba(140, 190, 255, 0.45),
            0 0 56px rgba(120, 170, 255, 0.25);
        }

        /* Left beams */
        .li-beam-l1 { left: calc(50% - 120px); opacity: 0.75; --beam-duration: 4.4s; --beam-delay: 0.8s; }
        .li-beam-l2 { left: calc(50% - 240px); opacity: 0.55; --beam-duration: 5.2s; --beam-delay: 1.6s; }
        .li-beam-l3 { left: calc(50% - 380px); opacity: 0.40; --beam-duration: 6.0s; --beam-delay: 2.4s; }

        /* Right beams */
        .li-beam-r1 { left: calc(50% + 120px); opacity: 0.75; --beam-duration: 4.2s; --beam-delay: 0.5s; }
        .li-beam-r2 { left: calc(50% + 240px); opacity: 0.55; --beam-duration: 5.0s; --beam-delay: 1.3s; }
        .li-beam-r3 { left: calc(50% + 380px); opacity: 0.40; --beam-duration: 5.8s; --beam-delay: 2.1s; }

        @keyframes liBeamPulse {
          0% { top: -100px; opacity: 0; }
          5% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: calc(100% + 100px); opacity: 0; }
        }

        /* KPI Card styling */
        .li-kpi-card {
          position: relative;
          display: flex;
          flex-direction: column;
          text-align: left;
          border-radius: 18px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: linear-gradient(180deg, rgba(20, 24, 32, 0.95) 0%, rgba(10, 10, 12, 0.98) 100%);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04);
          padding: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .li-kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          /* Match height of the trend pill so cards align */
          min-height: 22px;
        }

        .li-kpi-trend-pill {
          color: rgba(140, 220, 180, 0.90);
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(140, 220, 180, 0.10);
          line-height: 1.2;
          white-space: nowrap;
        }

        .li-kpi-trend-pill.is-placeholder {
          opacity: 0;
        }

        .li-kpi-value {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1, "lnum" 1;
          line-height: 1.05;
          white-space: nowrap;
        }

        .li-kpi-hint {
          min-height: 17px;
        }

        .li-kpi-card:hover {
          border-color: rgba(170, 198, 255, 0.28);
          transform: translateY(-2px);
        }

        .li-dash-card {
          border-radius: 20px;
          border: 1px solid rgba(170, 198, 255, 0.10);
          background: linear-gradient(180deg, rgba(16, 20, 28, 0.92) 0%, rgba(10, 10, 12, 0.96) 100%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.40);
          padding: 24px;
        }

        /* Ensure donut effects (glow, orbit) are never clipped */
        .li-allocation-card {
          overflow: visible !important;
        }

        .li-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(140, 220, 180, 0.9);
          box-shadow: 0 0 8px rgba(140, 220, 180, 0.6);
          animation: liLivePulse 2s ease-in-out infinite;
        }

        @keyframes liLivePulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .li-section-divider {
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px 0;
        }

        /* Chart area scan-box */
        .li-chart-area {
          position: relative;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background:
            radial-gradient(55% 85% at 50% 0%, rgba(160, 190, 255, 0.12) 0%, rgba(10, 10, 12, 0.0) 65%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.00) 50%),
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, rgba(0, 0, 0, 0.00) 2px, rgba(0, 0, 0, 0.00) 40px),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.008) 0px, rgba(255, 255, 255, 0.008) 1px, rgba(0, 0, 0, 0.00) 2px, rgba(0, 0, 0, 0.00) 40px);
          overflow: hidden;
        }

        .li-chart-area::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            rgba(170, 210, 255, 0.00) 0%,
            rgba(200, 230, 255, 0.50) 50%,
            rgba(170, 210, 255, 0.00) 100%
          );
          box-shadow: 0 0 20px rgba(170, 210, 255, 0.4);
          animation: liChartScan 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes liChartScan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }

        .li-section-divider::before {
          content: "";
          position: absolute;
          left: 0; right: 0;
          top: 50%;
          height: 1px;
          background: linear-gradient(90deg, rgba(170, 198, 255, 0.00) 0%, rgba(170, 198, 255, 0.20) 20%, rgba(170, 198, 255, 0.20) 80%, rgba(170, 198, 255, 0.00) 100%);
        }

        /* Scanning highlight */
        .li-section-divider::after {
          content: "";
          position: absolute;
          width: 60px;
          height: 1px;
          background: linear-gradient(
            90deg,
            rgba(170, 210, 255, 0.00) 0%,
            rgba(200, 230, 255, 0.70) 50%,
            rgba(170, 210, 255, 0.00) 100%
          );
          box-shadow: 0 0 12px rgba(170, 210, 255, 0.5);
          animation: liHorizontalScan 3s ease-in-out infinite;
        }

        @keyframes liHorizontalScan {
          0% { left: -60px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: calc(100% + 60px); opacity: 0; }
        }

        .li-stat-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.30);
          border: 1px solid rgba(170, 198, 255, 0.08);
          transition: all 0.25s ease;
        }

        .li-stat-pill:hover {
          border-color: rgba(170, 198, 255, 0.18);
          background: rgba(130, 160, 255, 0.08);
        }

        .li-signal-card {
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(170, 198, 255, 0.08);
          transition: all 0.3s ease;
        }

        .li-signal-card:hover {
          border-color: rgba(170, 198, 255, 0.18);
          background: rgba(10, 15, 25, 0.50);
        }

        .li-table-wrapper {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(170, 198, 255, 0.30) rgba(0, 0, 0, 0);
        }
        .li-table-wrapper::-webkit-scrollbar {
          height: 5px;
        }
        .li-table-wrapper::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0);
        }
        .li-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(170, 198, 255, 0.22);
          border-radius: 5px;
        }
        .li-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(170, 198, 255, 0.35);
        }

        .li-table-header {
          display: grid;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .li-table-row {
          display: grid;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.25s ease;
        }

        .li-table-row:hover {
          background: rgba(130, 160, 255, 0.04);
        }

        .li-table-row:last-child {
          border-bottom: none;
        }

        /* ═══════════════════════════════════════════════════════════
           EPIC DONUT CHART STYLES
           ═══════════════════════════════════════════════════════════ */
        
        .li-donut-container {
          position: relative;
          width: 180px;
          height: 180px;
        }

        /* Outer glow ring - pulsing */
        .li-donut-glow {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(100, 160, 255, 0.15) 0%,
            rgba(100, 160, 255, 0.05) 50%,
            transparent 70%
          );
          animation: liDonutGlow 3s ease-in-out infinite;
        }

        @keyframes liDonutGlow {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.08);
          }
        }

        /* Rotating outer ring */
        .li-donut-orbit {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px solid rgba(170, 198, 255, 0.14);
          border-top-color: rgba(100, 160, 255, 0.55);
          border-right-color: rgba(140, 220, 180, 0.35);
          box-shadow: 0 0 16px rgba(100, 160, 255, 0.10);
          animation: liOrbitSpin 8s linear infinite;
        }

        /* Smooth pause/resume on interaction */
        .li-donut-container:hover .li-donut-orbit,
        .li-donut-container:hover .li-donut-main,
        .li-donut-container:active .li-donut-orbit,
        .li-donut-container:active .li-donut-main {
          animation-play-state: paused;
        }

        .li-donut-orbit::before {
          content: "";
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(100, 160, 255, 0.90);
          box-shadow: 0 0 10px rgba(100, 160, 255, 0.80);
        }

        @keyframes liOrbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* The main donut */
        .li-donut-main {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            rgba(100, 160, 255, 0.90) 0deg 208deg,
            rgba(140, 220, 180, 0.85) 208deg 295deg,
            rgba(255, 200, 120, 0.85) 295deg 324deg,
            rgba(180, 150, 255, 0.80) 324deg 360deg
          );
          box-shadow: 
            0 0 40px rgba(100, 160, 255, 0.25),
            0 0 80px rgba(100, 160, 255, 0.10),
            inset 0 0 30px rgba(0, 0, 0, 0.3);
          animation:
            liDonutShimmer 4s ease-in-out infinite,
            liDonutRotate var(--li-donut-rot-dur, 30s) linear infinite;
          will-change: transform;
        }

        @keyframes liDonutRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes liDonutShimmer {
          0%, 100% { 
            filter: brightness(1) saturate(1);
          }
          50% { 
            filter: brightness(1.1) saturate(1.15);
          }
        }

        /* Inner cutout with depth */
        .li-donut-center {
          position: absolute;
          inset: 28%;
          border-radius: 50%;
          background: 
            radial-gradient(circle at 50% 30%, rgba(30, 35, 45, 0.95) 0%, rgba(12, 14, 18, 0.98) 100%);
          box-shadow:
            inset 0 4px 20px rgba(0, 0, 0, 0.5),
            inset 0 -2px 10px rgba(100, 160, 255, 0.08),
            0 0 20px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 3px;
          text-align: center;
          /* Premium circular border */
          border: 2px solid rgba(100, 160, 255, 0.25);
        }

        .li-donut-value {
          color: rgba(245, 248, 255, 0.98);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.05;
          text-shadow: 0 0 20px rgba(100, 160, 255, 0.30);
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1, "lnum" 1;
        }

        .li-donut-label {
          color: rgba(200, 215, 240, 0.55);
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Segment highlight particles */
        .li-donut-particles {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          pointer-events: none;
        }

        .li-donut-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.80);
          animation: liParticleFloat 3s ease-in-out infinite;
        }

        .li-donut-particle:nth-child(1) { top: 15%; left: 70%; animation-delay: 0s; }
        .li-donut-particle:nth-child(2) { top: 60%; left: 90%; animation-delay: 0.5s; }
        .li-donut-particle:nth-child(3) { top: 85%; left: 50%; animation-delay: 1s; }
        .li-donut-particle:nth-child(4) { top: 40%; left: 8%; animation-delay: 1.5s; }

        @keyframes liParticleFloat {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          20% { opacity: 1; transform: translate(-5px, -8px) scale(1); }
          80% { opacity: 0.8; transform: translate(5px, -15px) scale(0.8); }
        }

        /* ═══════════════════════════════════════════════════════════
           RESPONSIVE STYLES
           ═══════════════════════════════════════════════════════════ */
        
        /* Base padding - desktop */
        .li-panel-shell {
          padding: max(60px, calc(60px + env(safe-area-inset-top, 0px))) 20px 48px 20px;
        }

        /* Sticky back button - MUST respect safe-area on all devices */
        .li-sticky-back-btn {
          top: max(18px, calc(18px + env(safe-area-inset-top, 0px))) !important;
        }
        
        @media (max-width: 900px) {
          .li-panel-shell {
            padding: max(70px, calc(70px + env(safe-area-inset-top, 0px))) 16px 72px 16px !important;
          }
          .li-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .li-dash-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
        
        @media (max-width: 768px) {
          .li-beam-l3, .li-beam-r3 { display: none; }

          /* Allow donut effects to breathe (avoid clipping) */
          .li-allocation-card { overflow: visible !important; }
        }

        @media (max-width: 600px) {
          .li-beam-l2, .li-beam-r2 { display: none; }
          .li-donut-container { width: 150px; height: 150px; }
          .li-kpi-card { padding: 14px; }
          .li-kpi-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .li-panel-shell { padding: 50px 12px 60px 12px !important; }
          .li-dash-card { padding: 16px !important; }
          .li-asset-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .li-sticky-back-btn { top: 14px !important; left: 12px !important; }

          /* MOBILE HEADER - Stack everything vertically with proper spacing */
          .li-header-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-left: 0 !important;
          }
          .li-header-section h2 {
            font-size: 22px !important;
            margin-left: 0 !important;
          }
          .li-header-badges {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .li-header-actions {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }

          /* Mobile scroll fix - ensure all content is visible and scrollable */
          .li-dash-grid {
            overflow: visible !important;
            min-height: auto !important;
          }
          .li-dash-card {
            overflow: visible !important;
            max-width: 100% !important;
          }
          /* TradingView iframe responsive on mobile */
          .li-dash-card iframe {
            max-width: 100% !important;
            min-height: 280px !important;
          }
        }

        /* ═══════════════════════════════════════════════════════════
           ICON ANIMATIONS - Globe 3D spin, Chart wave
           ═══════════════════════════════════════════════════════════ */
        
        /* Globe icon - Earth-like horizontal spin (right-to-left) + shine/glow each full rotation */
        .li-globe-icon {
          animation: liGlobeSpinEarth 3.6s linear infinite;
          transform-style: preserve-3d;
          transform-origin: 50% 50%;
          will-change: transform, filter;
        }

        @keyframes liGlobeSpinEarth {
          0% {
            transform: perspective(700px) rotateX(10deg) rotateY(0deg);
            filter: drop-shadow(0 0 4px rgba(140, 190, 255, 0.45));
          }
          70% {
            transform: perspective(700px) rotateX(10deg) rotateY(-252deg);
            filter: drop-shadow(0 0 4px rgba(140, 190, 255, 0.45));
          }
          88% {
            transform: perspective(700px) rotateX(10deg) rotateY(-318deg);
            filter: drop-shadow(0 0 10px rgba(140, 200, 255, 0.7));
          }
          94% {
            transform: perspective(700px) rotateX(10deg) rotateY(-338deg) scale(1.03);
            filter: drop-shadow(0 0 18px rgba(170, 230, 255, 1)) drop-shadow(0 0 44px rgba(120, 210, 255, 0.9));
          }
          100% {
            transform: perspective(700px) rotateX(10deg) rotateY(-360deg);
            filter: drop-shadow(0 0 4px rgba(140, 190, 255, 0.45));
          }
        }
        
        /* Chart icon - subtle wave/pulse animation */
        .li-chart-icon {
          animation: liChartWave 2.5s ease-in-out infinite;
          transform-origin: center center;
        }
        
        @keyframes liChartWave {
          0%, 100% { 
            transform: scaleY(1) translateY(0);
            filter: drop-shadow(0 0 6px rgba(140, 190, 255, 0.4));
          }
          25% { 
            transform: scaleY(1.05) translateY(-1px);
            filter: drop-shadow(0 0 8px rgba(140, 190, 255, 0.6));
          }
          50% { 
            transform: scaleY(0.95) translateY(1px);
            filter: drop-shadow(0 0 6px rgba(140, 190, 255, 0.4));
          }
          75% { 
            transform: scaleY(1.02) translateY(-0.5px);
            filter: drop-shadow(0 0 10px rgba(140, 190, 255, 0.7));
          }
        }

        /* Calculator icon animation */
        .li-calc-icon {
          animation: liCalcPulse 3s ease-in-out infinite;
        }
        
        @keyframes liCalcPulse {
          0%, 100% { 
            filter: drop-shadow(0 0 4px rgba(140, 190, 255, 0.4));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 12px rgba(140, 220, 255, 0.8));
            transform: scale(1.05);
          }
        }
      `}</style>

      <div
        className="li-panel-shell max-w-7xl mx-auto"
        style={{
          position: 'relative',
          zIndex: 2,
          overflowX: 'hidden',
        }}
      >
        {/* Sticky Close/Back Button - TOP RIGHT, refined */}
        <button
          onClick={onClose}
          aria-label="Close (Esc)"
          title="Close (Esc)"
          className="li-sticky-back-btn"
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 99999,
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            background: 'rgba(10, 10, 12, 0.72)',
            color: 'rgba(235, 242, 255, 0.95)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.18s ease, background 0.18s ease, border-color 0.18s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(220, 50, 50, 0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderColor = 'rgba(255, 100, 100, 0.30)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(10, 10, 12, 0.72)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Dashboard header with navigation tabs and actions - MOBILE: STACKED VERTICALLY */}
        <div className="li-header-section" style={{ marginBottom: '8px' }}>
          {/* Row 1: Title + Feature Controls (top-right) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: 'rgba(235,242,255,0.96)', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                BM Wealth
              </h2>
              <span style={{ color: 'rgba(200,215,240,0.75)', fontSize: '14px', fontWeight: 600 }}>
                Live Intelligence
              </span>
            </div>
            
            {/* Feature Controls: Voice, Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <VoiceControl />
              <BadgeDisplay />
            </div>
          </div>
          
          {/* Row 2: Mode indicator + Streak badge */}
          <div className="li-header-badges" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
            <ModeIndicator />
            <StreakBadge showDetails={true} />
            <FeedToggle />
          </div>
          
          {/* Row 3: Subtitle */}
          <p style={{ margin: '10px 0 0', color: 'rgba(200,215,240,0.68)', fontSize: '14px', maxWidth: '62ch', lineHeight: 1.55 }}>
            Your financial command center — real-time portfolio insights and signals.
          </p>
          
          {/* Row 4: Navigation Tabs - Live Market Pulse, Live, Timings, 2 Days, Saved */}
          <div style={{ marginTop: '14px', overflowX: 'auto', marginLeft: '-4px', marginRight: '-4px', paddingLeft: '4px', paddingRight: '4px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'pulse', label: 'Pulse', title: 'Live Market Pulse' },
                { key: 'live', label: 'Live', title: 'Live Feed' },
                { key: 'timings', label: 'Timings', title: 'Market Timings' },
                { key: '2days', label: '2D', title: 'Last 2 Days' },
                { key: '4days', label: '4D', title: 'Last 4 Days' },
                { key: 'saved', label: 'Saved', title: 'Saved Items' },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-label={tab.title || tab.label}
                  title={tab.title || tab.label}
                  style={{
                    display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 14px',
                      background: isActive
                        ? 'linear-gradient(180deg, rgba(100, 180, 255, 0.18) 0%, rgba(100, 180, 255, 0.10) 100%)'
                        : 'rgba(100, 180, 255, 0.04)',
                      border: `1px solid ${isActive ? 'rgba(100, 180, 255, 0.36)' : 'rgba(100, 180, 255, 0.10)'}`,
                      borderRadius: '10px',
                      color: isActive ? 'rgba(235, 242, 255, 0.95)' : 'rgba(180, 200, 230, 0.62)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.35), 0 0 0 3px rgba(100,180,255,0.08)' : 'none',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(100, 180, 255, 0.08)';
                        e.currentTarget.style.color = 'rgba(235, 242, 255, 0.85)';
                        e.currentTarget.style.borderColor = 'rgba(100, 180, 255, 0.22)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(100, 180, 255, 0.04)';
                        e.currentTarget.style.color = 'rgba(180, 200, 230, 0.62)';
                        e.currentTarget.style.borderColor = 'rgba(100, 180, 255, 0.10)';
                      }
                    }}
                  >
                    <span>{tab.label}</span>
                  </button>
                );})}
              </div>
            </div>
          
          {/* Row 5: Action buttons - Share & Add Goal */}
          <div className="li-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
            {/* Primary CTA */}
            <a
              href="/live-intelligence"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                background: 'linear-gradient(135deg, rgba(100, 180, 255, 0.30) 0%, rgba(140, 220, 180, 0.20) 100%)',
                border: '1px solid rgba(140, 220, 180, 0.40)',
                borderRadius: '12px',
                color: 'rgba(245, 248, 255, 0.96)',
                fontSize: '13px',
                fontWeight: 850,
                textDecoration: 'none',
                transition: 'transform 0.18s ease, background 0.18s ease, border-color 0.18s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 14px 40px rgba(0,0,0,0.45), 0 0 0 3px rgba(100,180,255,0.10)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 180, 255, 0.38) 0%, rgba(140, 220, 180, 0.26) 100%)';
                e.currentTarget.style.borderColor = 'rgba(140, 220, 180, 0.55)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 180, 255, 0.30) 0%, rgba(140, 220, 180, 0.20) 100%)';
                e.currentTarget.style.borderColor = 'rgba(140, 220, 180, 0.40)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Open Full Intelligence</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>→</span>
            </a>

            <ShareDropdown
              open={showShareMenu}
              onOpenChange={setShowShareMenu}
              pageUrl={shareUrl}
              shareText={shareText}
              links={shareLinks}
            />

            <AddGoalButton
              style={{
                appearance: 'none',
                border: '1px solid rgba(170,198,255,0.45)',
                background: 'linear-gradient(180deg, rgba(130,160,255,0.18) 0%, rgba(10,10,12,0.65) 100%)',
                color: 'rgba(245,248,255,0.95)',
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                boxShadow: '0 0 20px rgba(140,190,255,0.12)',
                transition: 'all 0.25s ease',
              }}
            />
            
            {/* Archive Link */}
            <Link
              href="/archive"
              style={{
                appearance: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(10,10,12,0.70)',
                color: 'rgba(235,242,255,0.85)',
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(170,198,255,0.35)';
                e.currentTarget.style.background = 'rgba(130,160,255,0.10)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.background = 'rgba(10,10,12,0.70)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 4h10a2 2 0 0 1 2 2v14a1 1 0 0 0-1-1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 4v16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <span>View Archive</span>
            </Link>
          </div>
        </div>

        {/* Market Mood Indicator - Global sentiment at the top */}
        <div className="max-w-7xl mx-auto" style={{ marginTop: '16px' }}>
          <MarketMoodIndicator />
        </div>

        {/* KPI row */}
        <div className="li-kpi-grid max-w-7xl mx-auto" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
          {kpi.map((card) => (
            <div key={card.label} className="li-kpi-card">
              <div className="li-kpi-top">
                <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
                  {card.label}
                </div>
                {card.trend ? <div className="li-kpi-trend-pill">{card.trend}</div> : null}
              </div>
              <div className="li-kpi-value" style={{ marginTop: '12px', color: 'rgba(245,248,255,0.96)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                {card.kind === 'moneyL' ? (
                  <AnimatedNumber
                    value={Number(card.number) || 0}
                    currencySymbol="₹"
                    suffix="L"
                    minimumFractionDigits={1}
                    maximumFractionDigits={1}
                    ariaLabel={card.label}
                  />
                ) : card.kind === 'percent' ? (
                  <AnimatedNumber
                    value={Number(card.number) || 0}
                    suffix="%"
                    minimumFractionDigits={1}
                    maximumFractionDigits={1}
                    ariaLabel={card.label}
                  />
                ) : (
                  card.value
                )}
              </div>
              <div className="li-kpi-hint" style={{ marginTop: '8px', color: 'rgba(200,215,240,0.50)', fontSize: '12px', lineHeight: 1.4 }}>
                {card.hint}
              </div>
            </div>
          ))}
        </div>

        <div className="li-section-divider" />

        {/* Main dashboard grid */}
        <div className="li-dash-grid max-w-7xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '16px' }}>
          {/* Left column - Allocation Overview with EPIC DONUT */}
          <div className="li-dash-card li-allocation-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: 'rgba(235,242,255,0.94)', fontSize: '16px', fontWeight: 500, letterSpacing: '-0.01em' }}>
                    Allocation Overview
                  </div>
                  <div className="li-live-dot" />
                </div>
                <div style={{ marginTop: '4px', color: 'rgba(200,215,240,0.55)', fontSize: '12px' }}>
                  Real-time asset diversification
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <div className="li-stat-pill" style={{ fontSize: '11px' }}>
                  <span style={{ color: 'rgba(200,215,240,0.55)' }}>Updated</span>
                  <span style={{ color: 'rgba(140,220,180,0.85)' }}>just now</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAllocationEditing((v) => !v)}
                  className="li-stat-pill"
                  style={{
                    padding: '8px 12px',
                    gap: '8px',
                    alignItems: 'center',
                    fontSize: '11px',
                    borderColor: isAllocationEditing ? 'rgba(140,220,180,0.26)' : 'rgba(170,198,255,0.14)',
                    background: isAllocationEditing ? 'rgba(140,220,180,0.10)' : 'rgba(10,10,12,0.45)',
                    cursor: 'pointer',
                  }}
                  aria-label={isAllocationEditing ? 'Finish editing allocations' : 'Adjust allocations'}
                  title={isAllocationEditing ? 'Done' : 'Adjust allocation weights'}
                >
                  <span style={{ color: isAllocationEditing ? 'rgba(140,220,180,0.92)' : 'rgba(200,215,240,0.70)', fontWeight: 800 }}>
                    {isAllocationEditing ? 'Done' : 'Adjust'}
                  </span>
                </button>
              </div>
            </div>

            {/* Chart area with EPIC donut */}
            <div
              className="li-chart-area"
              aria-hidden="true"
              style={{
                marginTop: '16px',
                minHeight: '240px',
                padding: '18px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Epic Donut Chart */}
              <div className="li-donut-container">
                {/* Outer glow pulse */}
                <div className="li-donut-glow" />
                
                {/* Rotating orbit ring */}
                <div className="li-donut-orbit" />
                
                {/* Main donut with gradient */}
                <div
                  className="li-donut-main"
                  style={{
                    background: donutGradient,
                    '--li-donut-rot-dur': `${donutRotationSeconds}s`,
                  }}
                >
                  {/* Floating particles */}
                  <div className="li-donut-particles">
                    <div className="li-donut-particle" />
                    <div className="li-donut-particle" />
                    <div className="li-donut-particle" />
                    <div className="li-donut-particle" />
                  </div>
                </div>
                
                {/* Center cutout */}
                <div className="li-donut-center">
                  <div className="li-donut-value">₹{portfolioValue.toFixed(1)}L</div>
                  <div className="li-donut-label">Portfolio</div>
                </div>
              </div>
            </div>

            {/* Asset breakdown */}
            <div className="li-asset-grid" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
              {[
                { key: 'equity', k: 'Equity', c: 'rgba(100,160,255,0.90)' },
                { key: 'debt', k: 'Debt', c: 'rgba(140,220,180,0.85)' },
                { key: 'gold', k: 'Gold', c: 'rgba(255,200,120,0.85)' },
                { key: 'cash', k: 'Cash', c: 'rgba(180,150,255,0.80)' },
              ].map((item) => (
                <div
                  key={item.k}
                  className={`li-stat-pill li-alloc-pill ${allocationBumpKey === item.key ? 'li-percent-bump' : ''}`}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 14px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.c, boxShadow: `0 0 8px ${item.c}` }} />
                    <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px' }}>{item.k}</div>
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    {isAllocationEditing ? (
                      <>
                        <input
                          className="li-number-input"
                          inputMode="numeric"
                          type="text"
                          value={String(allocations[item.key])}
                          onChange={(e) => handleAllocationChange(item.key, e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          aria-label={`${item.k} allocation percent`}
                          style={{
                            width: '44px',
                            cursor: 'text',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            padding: 0,
                            margin: 0,
                            color: 'rgba(245,248,255,0.94)',
                            fontSize: '18px',
                            fontWeight: 700,
                            textAlign: 'left',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        />
                        <span style={{ color: 'rgba(245,248,255,0.60)', fontSize: '14px', fontWeight: 700 }}>%</span>
                      </>
                    ) : (
                      <div style={{ color: 'rgba(245,248,255,0.94)', fontSize: '18px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                        {Number(allocations[item.key]) || 0}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Ultimate Calculator - 6 Services */}
            <DonutCalculator />
          </div>

          {/* Right column - Live Signals */}
          <div className="li-dash-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'rgba(235,242,255,0.94)', fontSize: '16px', fontWeight: 500, letterSpacing: '-0.01em' }}>
                Market Intel
              </div>
              <div style={{
                padding: '3px 10px',
                borderRadius: '8px',
                background: 'rgba(100,160,255,0.12)',
                border: 'none',
                color: 'rgba(140,190,255,0.95)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                LIVE
              </div>
            </div>
            <div style={{ marginTop: '4px', color: 'rgba(200,215,240,0.55)', fontSize: '12px' }}>
              Flows, volatility & risk context
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <MarketIntelPanel />
              <OptionsIntelPanel />
              <SectorPulsePanel />
              <PortfolioTickersPanel />
              <DealsIntelPanel />
            </div>
          </div>

          {/* Full-width Holdings table */}
          <div className="li-dash-card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: 'rgba(235,242,255,0.94)', fontSize: '16px', fontWeight: 500, letterSpacing: '-0.01em' }}>
                    Holdings
                  </div>
                  <div style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                      background: 'rgba(100,160,255,0.12)',
                    border: 'none',
                    color: 'rgba(140,190,255,0.95)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    }} className="li-coming-soon-badge">
                    COMING SOON
                  </div>
                </div>
                <div style={{ marginTop: '4px', color: 'rgba(200,215,240,0.55)', fontSize: '12px' }}>
                  Real-time portfolio positions
                </div>
              </div>
            </div>

            {/* Coming Soon Placeholder */}
            <div style={{
              padding: '32px',
              borderRadius: '14px',
              background: 'rgba(100,160,255,0.04)',
              border: '1px dashed rgba(100,160,255,0.15)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
              <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Portfolio Tracking
              </div>
              <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '12px', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto' }}>
                Link your demat account or manually add your investments to see real-time holdings, P&L, and performance analytics
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="/client-portal"
                  onPointerDown={onRipplePointerDown}
                  className="li-cta-primary li-ripple"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    background: 'rgba(100,160,255,0.12)',
                    border: '1px solid rgba(100,160,255,0.22)',
                    color: 'rgba(235,242,255,0.90)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Connect Portfolio
                  <span className="li-cta-arrow" style={{ fontSize: '10px' }}>→</span>
                </a>
                <a
                  href="/contact?subject=Holdings%20%2F%20Portfolio%20Tracking%20Waitlist"
                  onPointerDown={onRipplePointerDown}
                  className="li-cta-secondary li-ripple"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    background: 'rgba(10,10,12,0.55)',
                    border: '1px solid rgba(170,198,255,0.18)',
                    color: 'rgba(200,215,240,0.85)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span className="li-bell-icon" aria-hidden="true">🔔</span>
                  Join Waitlist
                  <span className="li-cta-arrow" style={{ fontSize: '10px' }}>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              LIVE TRADING CHART - TradingView Widget (SENSEX)
              ⚠️ NOTE: DO NOT CHANGE COLORS WITHOUT ASKING USER FIRST
              ═══════════════════════════════════════════════════════════ */}
          <div 
            className="li-dash-card"
            style={{ 
              gridColumn: '1 / -1',
              background: '#000000',
              border: '1px solid rgba(100, 180, 255, 0.10)',
              borderRadius: '16px',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(100, 180, 255, 0.10)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#000000',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ 
                  margin: 0, 
                  color: 'rgba(220, 240, 255, 0.95)', 
                  fontSize: '16px', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <svg className="li-chart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(140, 190, 255, 0.90)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  Live Chart — NIFTY 50
                </h3>
                <span style={{
                  padding: '3px 8px',
                  background: 'rgba(100, 180, 255, 0.12)',
                  border: '1px solid rgba(100, 180, 255, 0.25)',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'rgba(140, 200, 255, 0.95)',
                  letterSpacing: '0.08em',
                }}>
                  TRADINGVIEW
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <div className="li-timeframe-toggle" aria-label="Chart timeframe">
                  {['D', 'W', 'M'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`li-timeframe-btn ${tvIntervalSafe === t ? 'active' : ''}`}
                      onClick={() => handleTvIntervalChange(t)}
                      disabled={tvIsSwitching}
                      aria-pressed={tvIntervalSafe === t}
                      title={t === 'D' ? 'Daily' : t === 'W' ? 'Weekly' : 'Monthly'}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="li-symbol-toggle" aria-label="Chart symbol">
                  {[ 
                    { key: 'TVC:NIFTY', label: 'NIFTY' },
                    { key: 'NSE:BANKNIFTY', label: 'BANKNIFTY' },
                    { key: 'BSE:SENSEX', label: 'SENSEX' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`li-symbol-btn ${tvSymbolSafe === s.key ? 'active' : ''}`}
                      onClick={() => handleTvSymbolChange(s.key)}
                      disabled={tvIsSwitching}
                      aria-pressed={tvSymbolSafe === s.key}
                      title={`Load ${s.label}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div style={{ color: 'rgba(180, 200, 230, 0.55)', fontSize: '11px' }}>
                  Real-time data • Powered by TradingView
                </div>
              </div>
            </div>

            <LazyTradingView minHeight={500} contentKey={tvIntervalSafe} loadingLabel="Loading TradingView…">
              <div className="li-tv-frame-switch" data-switching={tvIsSwitching ? '1' : '0'} style={{ height: '500px', width: '100%', background: '#000000' }}>
                {/* TradingView Advanced Chart - Direct iframe for reliability */}
                <iframe
                  key={`${tvSymbolSafe}:${tvIntervalSafe}`}
                  src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(tvSymbolSafe)}&interval=${tvIntervalSafe}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=131722&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FKolkata&allow_symbol_change=1&details=1&hotlist=1`}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block', backgroundColor: '#000000' }}
                  frameBorder="0"
                  allowtransparency="true"
                  scrolling="no"
                  title="TradingView Chart"
                />
              </div>
            </LazyTradingView>
            <div style={{ padding: '8px 16px', background: '#000000', borderTop: '1px solid rgba(100, 180, 255, 0.08)', fontSize: '10px', color: 'rgba(180, 200, 230, 0.50)' }}>
              💡 Click the symbol name at top-left to search & change stocks (SENSEX, BANKNIFTY, RELIANCE, TCS, etc.)
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              GLOBAL MARKETS - TradingView Market Overview Widget
              ⚠️ NOTE: FORCED BLACK BACKGROUND - DO NOT CHANGE
              ═══════════════════════════════════════════════════════════ */}
          <div 
            className="li-dash-card li-global-markets-widget"
            style={{ 
              gridColumn: '1 / -1',
              background: '#000000',
              border: '1px solid rgba(100, 180, 255, 0.10)',
              borderRadius: '16px',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(100, 180, 255, 0.08)',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ 
                  margin: 0,
                  color: 'rgba(230, 240, 255, 0.95)',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <svg className="li-globe-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(140, 190, 255, 0.90)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  Global Markets
                </h3>
                <MarketClockStatusBadge />
              </div>
              <div style={{ color: 'rgba(180, 200, 230, 0.50)', fontSize: '10px' }}>
                Real-time quotes • TradingView
              </div>
            </div>

            {/* TradingView Market Overview Widget - Pure Black with black background */}
            <LazyTradingView minHeight={420}>
              <div style={{ height: '420px', width: '100%', background: '#000000', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#000000', zIndex: 0 }} />
                <iframe
                  src={tvMarketsSrc}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 1,
                  }}
                  title="Market Overview"
                  loading="lazy"
                />
              </div>
            </LazyTradingView>
          </div>

          {/* Headline Feed - FULL WIDTH - same component/styles as the laser hero page */}
          <div style={{ gridColumn: '1 / -1' }}>
            <HeadlineFeed />
          </div>

          {/* QuickLearn - 30 second daily micro-lessons */}
          <div style={{ gridColumn: '1 / -1' }}>
            <QuickLearn />
          </div>

          {/* Saved Headlines Section */}
          {activeTab === 'saved' && (
            <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
              <SavedHeadlinesSection />
            </div>
          )}

          {/* Morning Brief (only visible in morning_brief mode) */}
          <div style={{ gridColumn: '1 / -1' }}>
            <MorningBrief />
          </div>

          {/* Night section (only visible in night_summary mode) */}
          <div style={{ gridColumn: '1 / -1' }}>
            <NightSummary />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              QUICK ACCESS (Overlay) - Pixel-perfect match with laser page
              ═══════════════════════════════════════════════════════════ */}
          <div style={{ marginTop: '32px', gridColumn: '1 / -1' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h3 style={{ 
                margin: 0, 
                color: 'rgba(230, 240, 255, 0.95)', 
                fontSize: '17px', 
                fontWeight: 600,
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(140, 190, 255, 0.90)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(140, 190, 255, 0.4))' }}>
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                </svg>
                Quick Access
              </h3>
              <span style={{ 
                color: 'rgba(180, 200, 230, 0.50)', 
                fontSize: '11px' 
              }}>
                Click to explore services
              </span>
            </div>

            <div className="li-qa-grid" style={{
              display: 'grid',
              gap: '12px',
            }}>
              {[
                { title: 'Mutual Funds', icon: 'chart-pie', desc: '5000+ schemes', link: '/mutual-funds' },
                { title: 'SIP', icon: 'refresh-cw', desc: 'Start from ₹500', link: '/sip' },
                { title: 'Portfolio Management', icon: 'briefcase', desc: 'PMS & AIF', link: '/portfolio-management' },
                { title: 'Insurance', icon: 'shield-check', desc: 'Term & Health', link: '/insurance' },
                { title: 'Trading Services', icon: 'trending-up', desc: 'Demat & Trading', link: '/trading-services' },
                { title: 'Fixed Deposits', icon: 'landmark', desc: 'Up to 9% p.a.', link: '/fixed-deposits' },
              ].map((service) => {
                // Premium SVG icons (Lucide-inspired)
                const iconMap = {
                  'chart-pie': (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                    </svg>
                  ),
                  'refresh-cw': (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                  ),
                  'briefcase': (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  ),
                  'shield-check': (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  ),
                  'trending-up': (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                  ),
                  'landmark': (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="22" x2="21" y2="22"/>
                      <line x1="6" y1="18" x2="6" y2="11"/>
                      <line x1="10" y1="18" x2="10" y2="11"/>
                      <line x1="14" y1="18" x2="14" y2="11"/>
                      <line x1="18" y1="18" x2="18" y2="11"/>
                      <polygon points="12 2 20 7 4 7"/>
                    </svg>
                  ),
                };
                return (
                <a
                  key={service.title}
                  href={service.link}
                  className="li-qa-card"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                    }
                  }}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    padding: '20px',
                    background: 'linear-gradient(180deg, rgba(18, 22, 30, 0.96) 0%, rgba(10, 10, 12, 0.98) 100%)',
                    border: '1px solid rgba(170, 198, 255, 0.10)',
                    borderRadius: '16px',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.50), 0 0 60px rgba(140, 190, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.10)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div style={{ 
                    marginBottom: '12px',
                    color: 'rgba(140, 190, 255, 0.85)',
                    filter: 'drop-shadow(0 0 8px rgba(140, 190, 255, 0.25))',
                  }}>
                    {iconMap[service.icon]}
                  </div>
                  <div style={{ 
                    color: 'rgba(235, 245, 255, 0.95)', 
                    fontSize: '15px', 
                    fontWeight: 600,
                    marginBottom: '6px',
                    letterSpacing: '-0.01em',
                  }}>
                    {service.title}
                  </div>
                  <div style={{ 
                    color: 'rgba(170, 198, 255, 0.60)', 
                    fontSize: '12px',
                  }}>
                    {service.desc}
                  </div>
                </a>
              );})}
            </div>
          </div>

          {(() => {
            const pdfPortalTarget = typeof document !== 'undefined' ? (document.body || document.documentElement) : null;
            if (!showPdfModal || !pdfUrl || !pdfPortalTarget) return null;
            return createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-label="PDF viewer"
                style={{
                  position: 'fixed',
                  inset: 0,
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 999999,
                  padding: '16px',
                  boxSizing: 'border-box',
                }}
                onClick={handlePdfClose}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 'min(90vw, 1400px)',
                    maxWidth: '1400px',
                    height: 'min(90vh, calc(100dvh - 32px))',
                    maxHeight: 'calc(100dvh - 32px)',
                    margin: 'auto',
                    backgroundColor: '#0a0a12',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(170, 198, 255, 0.15)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label="Close PDF"
                    onClick={handlePdfClose}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      zIndex: 10,
                      color: 'rgba(230, 240, 255, 0.9)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: '1px solid rgba(170, 198, 255, 0.2)',
                      borderRadius: '10px',
                      width: '44px',
                      height: '44px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(170, 198, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                      e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.2)';
                    }}
                  >
                    ✕
                  </button>

                  <iframe
                    src={pdfUrl}
                    title="PDF Viewer"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '16px',
                      display: 'block',
                    }}
                  />
                </div>
              </div>,
              pdfPortalTarget
            );
          })()}
        </div>
      </div>
    </section>
  );
}

// Export the panel for use in standalone page
export { LiveIntelligencePanel };

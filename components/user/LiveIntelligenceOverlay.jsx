'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

const LASER_ASSET_VERSION = 'seamless-xfade-fade-2026-01-11';
const VIDEO_SRC = `/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`;

// Session storage key to track if auto-open happened this session
const SESSION_KEY = 'li-overlay-auto-opened';

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
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.08em',
      background: isOpen ? 'rgba(100, 220, 180, 0.12)' : 'rgba(120, 150, 200, 0.12)',
      border: `1px solid ${isOpen ? 'rgba(100, 220, 180, 0.30)' : 'rgba(120, 150, 200, 0.25)'}`,
      color: isOpen ? 'rgba(100, 220, 180, 0.95)' : 'rgba(120, 150, 200, 0.95)',
    }}>
      NSE {isOpen ? 'OPEN' : 'CLOSED'}
    </span>
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
  const footerObserverRef = useRef(null);
  const hasAutoOpenedRef = useRef(false);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Open the overlay
  const openOverlay = useCallback(() => {
    if (isOpen || isAnimating) return;
    setIsAnimating(true);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('data-laser-active', 'true');
    
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
      document.body.style.overflow = '';
      document.body.removeAttribute('data-laser-active');
    }, 300);
  }, [isOpen, isAnimating]);

  // Expose open function globally for manual triggers
  useEffect(() => {
    window.__openLiveIntelligence = openOverlay;
    return () => {
      delete window.__openLiveIntelligence;
    };
  }, [openOverlay]);

  // Allow auto-open to work again after a full refresh.
  // SessionStorage persists across reloads, so we clear the auto-open flag on beforeunload.
  useEffect(() => {
    const clearAutoOpenFlag = () => {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeunload', clearAutoOpenFlag);
    return () => window.removeEventListener('beforeunload', clearAutoOpenFlag);
  }, []);

  // Auto-open when scrolling past LIVE MOOD (once per session)
  useEffect(() => {
    let rafId = 0;
    let cancelled = false;
    let observer;
    
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

  // Close when footer is 75% visible
  useEffect(() => {
    if (!isOpen) return;

    const checkFooterVisibility = () => {
      const footerEl = overlayRef.current?.querySelector('[data-li-footer]');
      if (!footerEl) return;

      footerObserverRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio >= 0.75) {
            closeOverlay();
          }
        },
        { threshold: 0.75 }
      );

      footerObserverRef.current.observe(footerEl);
    };

    // Small delay to let DOM render
    const timer = setTimeout(checkFooterVisibility, 100);
    
    return () => {
      clearTimeout(timer);
      footerObserverRef.current?.disconnect();
    };
  }, [isOpen, closeOverlay]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeOverlay();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOverlay]);

  if (!mounted) return null;

  const overlayContent = (
    <div
      ref={overlayRef}
      className={`li-overlay ${isOpen ? 'li-overlay-open' : ''} ${isAnimating && !isOpen ? 'li-overlay-closing' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
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
      {/* Global styles for overlay */}
      <style>{`
        /* Hide scrollbar but keep scrolling */
        .li-overlay::-webkit-scrollbar {
          display: none;
        }
        .li-overlay {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Hide number input spinners (desktop browsers) */
        .li-number-input::-webkit-outer-spin-button,
        .li-number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .li-number-input {
          -moz-appearance: textfield;
        }
        
        /* Ensure footer inside overlay has normal styling */
        .li-footer-wrapper footer {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* LASER SECTION (LOCKED - NO OVERLAYS/BUTTONS) */}
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

      {/* PANEL SECTION */}
      <LiveIntelligencePanel onClose={closeOverlay} />

      {/* FOOTER - rendered with original styling (data-laser-active handles the special colors) */}
      <div data-li-footer className="li-footer-wrapper">
        {footerContent}
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}


/**
 * Panel component with dashboard content and EPIC DONUT
 */
function LiveIntelligencePanel({ onClose }) {
  const [portfolioValue] = useState(28.3);
  const [allocations, setAllocations] = useState({
    equity: 58,
    debt: 24,
    gold: 8,
    cash: 10,
  });

  const handleAllocationChange = (key, raw) => {
    const next = String(raw ?? '').replace(/[^0-9]/g, '');
    const num = next === '' ? 0 : Math.max(0, Math.min(100, parseInt(next, 10)));
    setAllocations((prev) => ({ ...prev, [key]: num }));
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

        /* Chart area scan-box (matches original live-intelligence-hero) */
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

        /* Scanning highlight (matches original live-intelligence-hero) */
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
          animation: liDonutShimmer 4s ease-in-out infinite;
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
        }

        .li-donut-value {
          color: rgba(245, 248, 255, 0.98);
          font-size: 22px;
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
        
        @media (max-width: 900px) {
          .li-panel-shell {
            padding: 14px 16px 72px !important;
          }
          .li-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .li-dash-grid { grid-template-columns: 1fr !important; }
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
          .li-panel-shell { padding: 12px 12px 60px !important; }
          .li-dash-card { padding: 16px !important; }
          .li-asset-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }

          /* Mobile-only: header subtitle aligns left (desktop stays centered) */
          .li-header-block {
            align-items: flex-start !important;
            text-align: left !important;
          }
          .li-header-subtitle {
            text-align: left !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
      `}</style>

      <div
        className="li-panel-shell"
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '14px 20px 48px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        {/* Dashboard header (centered title, tiny Apple arrow on right) */}
        <div style={{ position: 'relative', marginBottom: '8px', paddingRight: '28px' }}>
          <div className="li-header-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <h2 style={{ margin: 0, color: 'rgba(235,242,255,0.96)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                Live Intelligence
              </h2>
              <div className="li-live-dot" />
            </div>
            <p className="li-header-subtitle" style={{ margin: '8px 0 0', color: 'rgba(200,215,240,0.65)', fontSize: '14px', maxWidth: '52ch', lineHeight: 1.5 }}>
              Your financial command center — real-time portfolio insights and signals.
            </p>
          </div>

          {/* Tiny Apple minimal back arrow - NO BORDERS/BG, on RIGHT */}
          <button
            onClick={onClose}
            aria-label="Close Live Intelligence"
            style={{
              position: 'absolute',
              right: 0,
              top: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'rgba(255, 255, 255, 0.55)',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 1)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* KPI row */}
        <div className="li-kpi-grid" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Invested', value: '₹24.8L', hint: 'Across MF + PMS + FD', trend: null },
            { label: 'Current Value', value: `₹${portfolioValue.toFixed(1)}L`, hint: '+₹ 3.5L unrealized', trend: '+14.1%' },
            { label: 'XIRR', value: '14.2%', hint: 'Last 12 months', trend: '+2.1%' },
            { label: 'Risk Score', value: 'Moderate', hint: 'Aligned to goals', trend: null },
          ].map((card) => (
            <div key={card.label} className="li-kpi-card">
              <div className="li-kpi-top">
                <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
                  {card.label}
                </div>
                {card.trend ? (
                  <div className="li-kpi-trend-pill">{card.trend}</div>
                ) : (
                  <div className="li-kpi-trend-pill is-placeholder" aria-hidden="true">
                    +00.0%
                  </div>
                )}
              </div>
              <div className="li-kpi-value" style={{ marginTop: '12px', color: 'rgba(245,248,255,0.96)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
              <div className="li-kpi-hint" style={{ marginTop: '8px', color: 'rgba(200,215,240,0.50)', fontSize: '12px', lineHeight: 1.4 }}>
                {card.hint}
              </div>
            </div>
          ))}
        </div>

        <div className="li-section-divider" />

        {/* Main dashboard grid */}
        <div className="li-dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
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
              <div className="li-stat-pill" style={{ fontSize: '11px' }}>
                <span style={{ color: 'rgba(200,215,240,0.55)' }}>Updated</span>
                <span style={{ color: 'rgba(140,220,180,0.85)' }}>just now</span>
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
                <div className="li-donut-main" style={{ background: donutGradient }}>
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
            <div className="li-asset-grid" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { key: 'equity', k: 'Equity', c: 'rgba(100,160,255,0.90)' },
                { key: 'debt', k: 'Debt', c: 'rgba(140,220,180,0.85)' },
                { key: 'gold', k: 'Gold', c: 'rgba(255,200,120,0.85)' },
                { key: 'cash', k: 'Cash', c: 'rgba(180,150,255,0.80)' },
              ].map((item) => (
                <div key={item.k} className="li-stat-pill" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.c, boxShadow: `0 0 8px ${item.c}` }} />
                    <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px' }}>{item.k}</div>
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <input
                      className="li-number-input"
                      inputMode="numeric"
                      type="text"
                      value={String(allocations[item.key])}
                      onChange={(e) => handleAllocationChange(item.key, e.target.value)}
                      aria-label={`${item.k} allocation percent`}
                      style={{
                        width: '44px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        margin: 0,
                        color: 'rgba(245,248,255,0.94)',
                        fontSize: '18px',
                        fontWeight: 600,
                        textAlign: 'left',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    />
                    <span style={{ color: 'rgba(245,248,255,0.60)', fontSize: '14px', fontWeight: 600 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Live Signals */}
          <div className="li-dash-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'rgba(235,242,255,0.94)', fontSize: '16px', fontWeight: 500, letterSpacing: '-0.01em' }}>
                Live Signals
              </div>
              <div style={{
                padding: '3px 10px',
                borderRadius: '8px',
                background: 'rgba(255,180,140,0.12)',
                border: '1px solid rgba(255,180,140,0.25)',
                color: 'rgba(255,180,140,0.90)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                4 NEW
              </div>
            </div>
            <div style={{ marginTop: '4px', color: 'rgba(200,215,240,0.55)', fontSize: '12px' }}>
              Portfolio alerts & opportunities
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { t: 'Rebalance opportunity', d: 'Equity drift +4.8% vs target', s: 'High', c: 'rgba(255,180,140,0.90)' },
                { t: 'Tax harvesting', d: 'Potential LTCG optimization', s: 'High', c: 'rgba(255,180,140,0.90)' },
                { t: 'SIP consistency', d: '3 SIPs processed successfully', s: 'Good', c: 'rgba(140,220,180,0.90)' },
                { t: 'Cash buffer', d: '3.2 months covered', s: 'Good', c: 'rgba(140,220,180,0.90)' },
              ].map((it) => (
                <div key={it.t} className="li-signal-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'rgba(245,248,255,0.94)', fontSize: '13px', fontWeight: 500 }}>{it.t}</div>
                    <div style={{ 
                      color: it.c, 
                      fontSize: '10px', 
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: `${it.c.replace('0.90', '0.12')}`,
                      letterSpacing: '0.04em',
                    }}>{it.s.toUpperCase()}</div>
                  </div>
                  <div style={{ marginTop: '6px', color: 'rgba(200,215,240,0.60)', fontSize: '12px', lineHeight: 1.4 }}>{it.d}</div>
                </div>
              ))}
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
                  <div className="li-live-dot" />
                </div>
                <div style={{ marginTop: '4px', color: 'rgba(200,215,240,0.55)', fontSize: '12px' }}>
                  Real-time portfolio positions
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="li-table-wrapper" style={{ borderRadius: '14px', border: '1px solid rgba(170,198,255,0.10)' }}>
              <div className="li-table-header" style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr' }}>
                {['Instrument', 'Value', '1D Change', 'Total P/L'].map((h) => (
                  <div key={h} style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</div>
                ))}
              </div>

              {[
                { n: 'Nifty 50 Index Fund', v: '₹ 6.4L', d: '+0.42%', p: '+₹ 1.1L', dColor: 'rgba(140,220,180,0.90)', pColor: 'rgba(140,220,180,0.90)' },
                { n: 'Flexi Cap Fund', v: '₹ 4.9L', d: '+0.18%', p: '+₹ 0.8L', dColor: 'rgba(140,220,180,0.90)', pColor: 'rgba(140,220,180,0.90)' },
                { n: 'Corporate Bond Fund', v: '₹ 3.1L', d: '+0.05%', p: '+₹ 0.2L', dColor: 'rgba(140,220,180,0.90)', pColor: 'rgba(140,220,180,0.90)' },
                { n: 'SGB / Gold', v: '₹ 2.2L', d: '-0.12%', p: '+₹ 0.3L', dColor: 'rgba(255,180,140,0.90)', pColor: 'rgba(140,220,180,0.90)' },
                { n: 'Fixed Deposits', v: '₹ 3.7L', d: '—', p: '+₹ 0.2L', dColor: 'rgba(200,215,240,0.45)', pColor: 'rgba(140,220,180,0.90)' },
                { n: 'Cash / Liquid', v: '₹ 1.8L', d: '—', p: '—', dColor: 'rgba(200,215,240,0.45)', pColor: 'rgba(200,215,240,0.45)' },
              ].map((row) => (
                <div key={row.n} className="li-table-row" style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr' }}>
                  <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: '13px', fontWeight: 450 }}>{row.n}</div>
                  <div style={{ color: 'rgba(220,230,255,0.85)', fontSize: '13px' }}>{row.v}</div>
                  <div style={{ color: row.dColor, fontSize: '13px', fontWeight: 500 }}>{row.d}</div>
                  <div style={{ color: row.pColor, fontSize: '13px', fontWeight: 500 }}>{row.p}</div>
                </div>
              ))}
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
              background: '#131722',
              border: '1px solid rgba(100, 180, 255, 0.10)',
              borderRadius: '16px',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(100, 180, 255, 0.08)',
              background: '#131722',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'rgba(235, 242, 255, 0.94)',
                  fontSize: '16px',
                  fontWeight: 500,
                  margin: 0,
                }}>
                  📈 Live Chart — SENSEX
                </h3>
                <div style={{ color: 'rgba(180, 200, 230, 0.55)', fontSize: '11px', marginTop: '4px' }}>
                  Real-time data • Powered by TradingView
                </div>
              </div>
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

            <div style={{ height: '400px', width: '100%', background: '#131722' }}>
              <iframe
                src="https://www.tradingview.com/widgetembed/?symbol=BSE%3ASENSEX&interval=15&symboledit=1&saveimage=1&toolbarbg=131722&theme=dark&style=1&timezone=Asia%2FKolkata&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&details=1&hotlist=1&calendar=0&locale=in"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                }}
                title="Live Chart"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div style={{ padding: '8px 16px', background: '#131722', borderTop: '1px solid rgba(100, 180, 255, 0.08)', fontSize: '10px', color: 'rgba(180, 200, 230, 0.50)' }}>
              💡 Click the symbol name at top-left to search & change stocks (NIFTY, BANKNIFTY, RELIANCE, TCS, etc.)
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              GLOBAL MARKETS - TradingView Market Overview Widget
              ⚠️ NOTE: DO NOT CHANGE COLORS WITHOUT ASKING USER FIRST
              ═══════════════════════════════════════════════════════════ */}
          <div 
            className="li-dash-card"
            style={{ 
              gridColumn: '1 / -1',
              background: '#131722',
              border: '1px solid rgba(100, 180, 255, 0.10)',
              borderRadius: '16px',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(100, 180, 255, 0.08)',
              background: '#131722',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <h3 style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'rgba(235, 242, 255, 0.94)',
                  fontSize: '16px',
                  fontWeight: 500,
                  margin: 0,
                }}>
                  🌍 Global Markets
                </h3>
                <MarketStatusBadge />
              </div>
              <div style={{ color: 'rgba(180, 200, 230, 0.55)', fontSize: '11px' }}>
                Real-time quotes • TradingView
              </div>
            </div>

            <div style={{ height: '400px', width: '100%', background: '#0D0D0D', position: 'relative' }}>
              <iframe
                src="https://s.tradingview.com/embed-widget/market-overview/?colorTheme=dark&dateRange=12M&showChart=true&locale=in&largeChartUrl=&isTransparent=false&showSymbolLogo=true&showFloatingTooltip=false&width=100%25&height=100%25&tabs=%5B%7B%22title%22%3A%22Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22NSE%3ANIFTY%22%2C%22d%22%3A%22NIFTY%2050%22%7D%2C%7B%22s%22%3A%22BSE%3ASENSEX%22%2C%22d%22%3A%22SENSEX%22%7D%2C%7B%22s%22%3A%22NSE%3ABANKNIFTY%22%2C%22d%22%3A%22Bank%20NIFTY%22%7D%2C%7B%22s%22%3A%22NSE%3ANIFTYIT%22%2C%22d%22%3A%22NIFTY%20IT%22%7D%5D%7D%2C%7B%22title%22%3A%22Futures%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22MCX%3AGOLD1!%22%2C%22d%22%3A%22Gold%22%7D%2C%7B%22s%22%3A%22MCX%3ASILVER1!%22%2C%22d%22%3A%22Silver%22%7D%2C%7B%22s%22%3A%22MCX%3ACRUDEOIL1!%22%2C%22d%22%3A%22Crude%20Oil%22%7D%5D%7D%2C%7B%22title%22%3A%22Bonds%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22TVC%3AIN10Y%22%2C%22d%22%3A%22India%2010Y%22%7D%2C%7B%22s%22%3A%22TVC%3AUS10Y%22%2C%22d%22%3A%22US%2010Y%22%7D%5D%7D%2C%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FX_IDC%3AUSDINR%22%2C%22d%22%3A%22USD%2FINR%22%7D%2C%7B%22s%22%3A%22FX%3AEURUSD%22%2C%22d%22%3A%22EUR%2FUSD%22%7D%5D%7D%5D"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  backgroundColor: '#0D0D0D',
                }}
                title="Market Overview"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

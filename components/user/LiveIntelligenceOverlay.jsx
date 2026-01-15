'use client';

import { useState, useEffect, useRef, useCallback, useMemo, cloneElement, isValidElement } from 'react';
import { createPortal } from 'react-dom';

import HeadlineFeed from '@/components/live-intelligence/HeadlineFeed';
import ModeIndicator from '@/components/live-intelligence/ModeIndicator';
import DonutCalculator from '@/components/live-intelligence/DonutCalculator';
import StreakBadge from '@/components/live-intelligence/StreakBadge';
import NightSummary from '@/components/live-intelligence/NightSummary';

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

  // Allow auto-open to work again after a full refresh.
  // SessionStorage persists across reloads, so we clear the auto-open flag on beforeunload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
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

        /* Category filter - allow full width scroll */
        .li-category-filter {
          overflow-x: auto !important;
          max-width: 100%;
        }
        .li-category-scroll {
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          padding-right: 20px;
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
      <LiveIntelligencePanel onClose={closeOverlay} />

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
 * Panel component with dashboard content and EPIC DONUT
 */
function LiveIntelligencePanel({ onClose }) {
  const [portfolioValue] = useState(28.3);
  const [totalInvested] = useState(24.8);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [allocations, setAllocations] = useState({
    equity: 58,
    debt: 24,
    gold: 8,
    cash: 10,
  });

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://bmwealth.co.in';
    return window.location.href || 'https://bmwealth.co.in';
  }, []);

  const shareText = useMemo(
    () => 'Check out BM Wealth Live Intelligence — real-time portfolio insights and market signals.',
    []
  );

  const shareLinks = useMemo(() => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent('BM Wealth Live Intelligence')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
  }, [shareText, shareUrl]);

  useEffect(() => {
    if (!showShareMenu) return;
    const onDocMouseDown = (e) => {
      if (!shareMenuRef.current) return;
      if (!shareMenuRef.current.contains(e.target)) setShowShareMenu(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowShareMenu(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showShareMenu]);

  useEffect(() => {
    if (!showPdfModal) return;
    const prevOverflow = document?.body?.style?.overflow;
    if (document?.body?.style) document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPdfModal(false);
        setPdfUrl(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (document?.body?.style) document.body.style.overflow = prevOverflow || '';
    };
  }, [showPdfModal]);

  const kpi = useMemo(() => {
    const currentValue = portfolioValue;
    const invested = totalInvested;
    const unrealized = currentValue - invested;
    const totalReturnPct = invested > 0 ? (unrealized / invested) * 100 : 0;

    const equityPct = Number(allocations?.equity) || 0;
    const riskScore = equityPct >= 70 ? 'High' : equityPct >= 40 ? 'Moderate' : 'Low';

    const xirr = totalReturnPct;

    return [
      {
        label: 'Total Invested',
        value: `₹${invested.toFixed(1)}L`,
        hint: 'Across MF + PMS + FD',
        trend: null,
      },
      {
        label: 'Current Value',
        value: `₹${currentValue.toFixed(1)}L`,
        hint: `${unrealized >= 0 ? '+' : '−'}₹ ${Math.abs(unrealized).toFixed(1)}L unrealized`,
        trend: `${totalReturnPct >= 0 ? '+' : ''}${totalReturnPct.toFixed(1)}%`,
      },
      {
        label: 'XIRR',
        value: `${xirr.toFixed(1)}%`,
        hint: 'Last 12 months (est.)',
        trend: null,
      },
      {
        label: 'Risk Score',
        value: riskScore,
        hint: `Equity ${equityPct}% allocation`,
        trend: null,
      },
    ];
  }, [allocations?.equity, portfolioValue, totalInvested]);

  const tvChartOptions = useMemo(
    () => ({
      autosize: true,
      symbol: 'NSE:NIFTY',
      interval: 'D',
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      style: '1',
      locale: 'in',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: true,
      details: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    }),
    []
  );

  const tvMarketsOptions = useMemo(
    () => ({
      colorTheme: 'dark',
      dateRange: '12M',
      showChart: true,
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: '100%',
      locale: 'in',
      tabs: [
        {
          title: 'Indices',
          symbols: [
            { s: 'NSE:NIFTY', d: 'NIFTY 50' },
            { s: 'NSE:BANKNIFTY', d: 'Bank NIFTY' },
            { s: 'BSE:SENSEX', d: 'SENSEX' },
            { s: 'OANDA:NAS100USD', d: 'Nasdaq 100' },
            { s: 'OANDA:SPX500USD', d: 'S&P 500' },
          ],
        },
        {
          title: 'Commodities',
          symbols: [
            { s: 'TVC:GOLD', d: 'Gold' },
            { s: 'TVC:SILVER', d: 'Silver' },
            { s: 'NYMEX:CL1!', d: 'Crude Oil' },
          ],
        },
        {
          title: 'Forex',
          symbols: [
            { s: 'OANDA:USDINR', d: 'USD/INR' },
            { s: 'OANDA:EURUSD', d: 'EUR/USD' },
          ],
        },
      ],
    }),
    []
  );

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
          /* Premium circular border */
          border: 2px solid rgba(100, 160, 255, 0.25);
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
          /* Circle ring around value */
          padding: 10px 14px;
          border: 2px solid rgba(100, 160, 255, 0.35);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100, 160, 255, 0.08) 0%, transparent 70%);
          box-shadow: 0 0 15px rgba(100, 160, 255, 0.15), inset 0 0 10px rgba(100, 160, 255, 0.05);
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
          padding: '14px 20px 48px',
          overflowX: 'hidden',
        }}
      >
        {/* Dashboard header with navigation tabs and actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: 'rgba(235,242,255,0.96)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                Live Intelligence
              </h2>
              <ModeIndicator />
              <StreakBadge showDetails={true} />
            </div>
            <p style={{ margin: '8px 0 0', color: 'rgba(200,215,240,0.65)', fontSize: '14px', maxWidth: '52ch', lineHeight: 1.5 }}>
              Your financial command center — real-time portfolio insights and signals.
            </p>
            {/* Navigation Tabs - Live Market Pulse, Live, Timings, 2 Days */}
            <div style={{ marginTop: '14px', overflowX: 'auto', marginLeft: '-4px', marginRight: '-4px', paddingLeft: '4px', paddingRight: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
                {[
                  { key: 'pulse', label: 'Live Market Pulse', icon: '📡', active: true },
                  { key: 'live', label: 'Live', icon: '🔴', active: false },
                  { key: 'timings', label: 'Timings', icon: '🕐', active: false },
                  { key: '2days', label: '2 Days', icon: '📊', active: false },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: tab.active ? 'rgba(100, 180, 255, 0.12)' : 'rgba(100, 180, 255, 0.04)',
                      border: `1px solid ${tab.active ? 'rgba(100, 180, 255, 0.30)' : 'rgba(100, 180, 255, 0.08)'}`,
                      borderRadius: '10px',
                      color: tab.active ? 'rgba(140, 210, 255, 0.95)' : 'rgba(150, 180, 220, 0.60)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseOver={(e) => {
                      if (!tab.active) {
                        e.currentTarget.style.background = 'rgba(100, 180, 255, 0.08)';
                        e.currentTarget.style.color = 'rgba(180, 210, 255, 0.80)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!tab.active) {
                        e.currentTarget.style.background = 'rgba(100, 180, 255, 0.04)';
                        e.currentTarget.style.color = 'rgba(150, 180, 220, 0.60)';
                      }
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons - Back arrow, Share, Add Goal */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Back arrow */}
            <button
              onClick={onClose}
              aria-label="Close Live Intelligence"
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                color: 'rgba(180, 200, 230, 0.55)',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '22px',
                fontWeight: 300,
                transition: 'all 0.2s ease',
                lineHeight: 1,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'rgba(140, 190, 255, 0.95)';
                e.currentTarget.style.transform = 'translateX(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'rgba(180, 200, 230, 0.55)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              ←
            </button>
            {/* Share Button with Dropdown */}
            <div ref={shareMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  // Prefer native share when available (most reliable on mobile).
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator
                      .share({ title: 'BM Wealth Live Intelligence', text: shareText, url: shareUrl })
                      .catch(() => {
                        setShowShareMenu((v) => !v);
                      });
                    return;
                  }
                  setShowShareMenu((v) => !v);
                }}
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
                <span>Share</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
              </button>

              {/* Share dropdown menu */}
              {showShareMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  minWidth: '200px',
                  background: 'rgba(15, 18, 25, 0.98)',
                  border: '1px solid rgba(100, 160, 255, 0.20)',
                  borderRadius: '14px',
                  padding: '8px',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.50), 0 0 60px rgba(100, 160, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 200,
                }}>
                  {[
                    { key: 'whatsapp', icon: '💬', label: 'WhatsApp', href: shareLinks.whatsapp },
                    { key: 'email', icon: '📧', label: 'Email', href: shareLinks.email },
                    { key: 'twitter', icon: '𝕏', label: 'Twitter / X', href: shareLinks.twitter },
                    { key: 'linkedin', icon: '💼', label: 'LinkedIn', href: shareLinks.linkedin },
                    { key: 'telegram', icon: '✈️', label: 'Telegram', href: shareLinks.telegram },
                  ].map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'rgba(220, 230, 255, 0.85)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(100, 160, 255, 0.12)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(220, 230, 255, 0.85)';
                      }}
                    >
                      <span style={{ width: '22px', textAlign: 'center', fontSize: '16px' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />
                  <button
                    type="button"
                    onClick={() => {
                      const toCopy = shareUrl;
                      const doFallback = () => {
                        prompt('Copy this link:', toCopy);
                      };
                      if (typeof navigator === 'undefined') {
                        doFallback();
                      } else if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(toCopy).then(() => alert('Link copied!')).catch(doFallback);
                      } else {
                        doFallback();
                      }
                      setShowShareMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'rgba(220, 230, 255, 0.85)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(100, 160, 255, 0.12)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(220, 230, 255, 0.85)';
                    }}
                  >
                    <span style={{ width: '22px', textAlign: 'center', fontSize: '16px' }}>📋</span>
                    <span>Copy Link</span>
                  </button>
                </div>
              )}
            </div>
            {/* Add Goal Button */}
            <button
              type="button"
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
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(170,198,255,0.65)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(140,190,255,0.20)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(170,198,255,0.45)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(140,190,255,0.12)';
              }}
            >
              + Add Goal
            </button>
          </div>
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
            <div className="li-asset-grid" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
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

            {/* Ultimate Calculator - 6 Services */}
            <DonutCalculator />
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
                background: 'rgba(100,160,255,0.12)',
                border: 'none',
                color: 'rgba(140,190,255,0.95)',
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
                { t: 'Rebalance opportunity', d: 'Equity drift +4.8% vs target', s: 'High', c: 'rgba(140,190,255,0.95)' },
                { t: 'Tax harvesting', d: 'Potential LTCG optimization', s: 'High', c: 'rgba(140,190,255,0.95)' },
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
                      background: it.c.includes('190,255') ? 'rgba(100,160,255,0.12)' : 'rgba(140,220,180,0.12)',
                      border: 'none',
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
              <div style={{ color: 'rgba(180, 200, 230, 0.55)', fontSize: '11px' }}>
                Real-time data • Powered by TradingView
              </div>
            </div>

            <div style={{ height: '500px', width: '100%', background: '#000000' }}>
              {/* TradingView Advanced Chart - Direct iframe for reliability */}
              <iframe
                src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=NSE%3ANIFTY&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=131722&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FKolkata"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', backgroundColor: '#000000' }}
                frameBorder="0"
                allowtransparency="true"
                scrolling="no"
                title="TradingView Chart"
              />
            </div>
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
                <MarketStatusBadge />
              </div>
              <div style={{ color: 'rgba(180, 200, 230, 0.50)', fontSize: '10px' }}>
                Real-time quotes • TradingView
              </div>
            </div>

            {/* TradingView Market Overview Widget - Pure Black with black background */}
            <div style={{ height: '420px', width: '100%', background: '#000000' }}>
              <iframe
                src="https://s.tradingview.com/embed-widget/market-overview/?colorTheme=dark&dateRange=12M&showChart=true&locale=in&largeChartUrl=&isTransparent=false&showSymbolLogo=true&showFloatingTooltip=false&width=100%25&height=100%25&backgroundColor=000000&tabs=%5B%7B%22title%22%3A%22Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22NSE%3ANIFTY%22%2C%22d%22%3A%22NIFTY%2050%22%7D%2C%7B%22s%22%3A%22BSE%3ASENSEX%22%2C%22d%22%3A%22SENSEX%22%7D%2C%7B%22s%22%3A%22NSE%3ABANKNIFTY%22%2C%22d%22%3A%22Bank%20NIFTY%22%7D%2C%7B%22s%22%3A%22NSE%3ANIFTYIT%22%2C%22d%22%3A%22NIFTY%20IT%22%7D%5D%7D%2C%7B%22title%22%3A%22Commodities%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22MCX%3AGOLD1!%22%2C%22d%22%3A%22Gold%22%7D%2C%7B%22s%22%3A%22MCX%3ASILVER1!%22%2C%22d%22%3A%22Silver%22%7D%2C%7B%22s%22%3A%22MCX%3ACRUDEOIL1!%22%2C%22d%22%3A%22Crude%20Oil%22%7D%5D%7D%2C%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FX_IDC%3AUSDINR%22%2C%22d%22%3A%22USD%2FINR%22%7D%2C%7B%22s%22%3A%22FX%3AEURUSD%22%2C%22d%22%3A%22EUR%2FUSD%22%7D%5D%7D%5D"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  backgroundColor: '#000000',
                  colorScheme: 'dark',
                }}
                title="Market Overview"
                loading="lazy"
              />
            </div>
          </div>

          {/* Headline Feed - FULL WIDTH - same component/styles as the laser hero page */}
          <div style={{ gridColumn: '1 / -1' }}>
            <HeadlineFeed />
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
                { title: 'Mutual Funds', icon: 'chart-pie', desc: '5000+ schemes', link: '/api/pdf/service?service=mutual-funds' },
                { title: 'SIP', icon: 'refresh-cw', desc: 'Start from ₹500', link: '/api/pdf/service?service=sip' },
                { title: 'Portfolio Management', icon: 'briefcase', desc: 'PMS & AIF', link: '/api/pdf/service?service=portfolio-management' },
                { title: 'Insurance', icon: 'shield-check', desc: 'Term & Health', link: '/api/pdf/service?service=insurance' },
                { title: 'Trading Services', icon: 'trending-up', desc: 'Demat & Trading', link: '/api/pdf/service?service=trading-services' },
                { title: 'Fixed Deposits', icon: 'landmark', desc: 'Up to 9% p.a.', link: '/api/pdf/service?service=fixed-deposits' },
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
                    e.preventDefault();
                    e.stopPropagation();
                    setPdfUrl(e.currentTarget.href);
                    setShowPdfModal(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setPdfUrl(e.currentTarget.href);
                      setShowPdfModal(true);
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
                  width: '100%',
                  height: '100dvh',
                  minHeight: '100vh',
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 99999,
                  padding:
                    'max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
                  boxSizing: 'border-box',
                }}
                onClick={() => {
                  setShowPdfModal(false);
                  setPdfUrl(null);
                }}
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
                    onClick={() => {
                      setShowPdfModal(false);
                      setPdfUrl(null);
                    }}
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

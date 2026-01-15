'use client';

/**
 * /live-intelligence - Dedicated Page Route
 * 
 * ⚠️ DESIGN LOCK: This page MUST be a 1:1 CLONE of the overlay panel.
 * - Same colors, background, typography, spacing, components
 * - NO main website theme leak
 * - NO global CSS from homepage
 * - Footer is COPIED from existing Footer component
 * 
 * This is NOT a redesign. It is the SAME panel rendered as a normal route.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

// Import shared Live Intelligence components
import HeadlineFeed from '@/components/live-intelligence/HeadlineFeed';
import ModeIndicator from '@/components/live-intelligence/ModeIndicator';
import DonutCalculator from '@/components/live-intelligence/DonutCalculator';
import StreakBadge from '@/components/live-intelligence/StreakBadge';
import NightSummary from '@/components/live-intelligence/NightSummary';

// Import shared panel component from overlay
import { LiveIntelligencePanel } from '@/components/user/LiveIntelligenceOverlay';

// Import Footer for bottom of page
import Footer from '@/components/user/Footer';

export default function LiveIntelligencePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set body attribute for consistent styling
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-laser-active', 'true');
    }
    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.removeAttribute('data-laser-active');
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090A0C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'rgba(170, 198, 255, 0.6)', fontSize: '14px' }}>
          Loading Live Intelligence...
        </div>
      </div>
    );
  }

  return (
    <div
      className="li-page"
      style={{
        minHeight: '100vh',
        background: '#090A0C',
        color: 'rgba(235, 242, 255, 0.95)',
      }}
    >
      {/* Scoped styles - EXACT match with overlay */}
      <style>{`
        /* Use normal OS scrollbar */
        .li-page {
          -ms-overflow-style: auto;
          scrollbar-width: auto;
        }

        /* Hide number input spinners */
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
        
        /* Quick Access grid - responsive */
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

        /* TradingView widgets - force black */
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

        /* KPI grid responsive */
        .li-kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        @media (min-width: 768px) {
          .li-kpi-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        /* Dashboard grid responsive */
        .li-dash-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .li-dash-grid {
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          }
        }

        /* Card styles */
        .li-dash-card {
          background: linear-gradient(180deg, rgba(18, 22, 30, 0.95) 0%, rgba(10, 10, 12, 0.98) 100%);
          border: 1px solid rgba(170, 198, 255, 0.10);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .li-kpi-card {
          background: linear-gradient(180deg, rgba(18, 22, 30, 0.92) 0%, rgba(10, 10, 12, 0.96) 100%);
          border: 1px solid rgba(170, 198, 255, 0.08);
          border-radius: 14px;
          padding: 16px 18px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.30);
        }

        .li-kpi-trend-pill {
          padding: 3px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(100, 220, 180, 0.12);
          color: rgba(100, 220, 180, 0.95);
          border: none;
        }

        .li-signal-card {
          background: linear-gradient(180deg, rgba(22, 26, 35, 0.80) 0%, rgba(14, 14, 18, 0.90) 100%);
          border: 1px solid rgba(170, 198, 255, 0.08);
          border-radius: 12px;
          padding: 14px 16px;
          transition: all 0.25s ease;
        }
        .li-signal-card:hover {
          border-color: rgba(170, 198, 255, 0.18);
          background: linear-gradient(180deg, rgba(26, 30, 40, 0.85) 0%, rgba(16, 16, 20, 0.92) 100%);
        }

        .li-stat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(100, 160, 255, 0.06);
          border: 1px solid rgba(170, 198, 255, 0.08);
          border-radius: 10px;
          padding: 6px 12px;
          font-size: 12px;
        }

        .li-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(100, 220, 180, 0.90);
          box-shadow: 0 0 8px rgba(100, 220, 180, 0.50);
          animation: li-pulse 2s ease-in-out infinite;
        }

        @keyframes li-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }

        .li-section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(170, 198, 255, 0.15), transparent);
          margin: 28px 0;
        }

        /* Table styles */
        .li-table-wrapper {
          overflow: hidden;
        }
        .li-table-header {
          display: grid;
          padding: 14px 18px;
          background: rgba(100, 160, 255, 0.04);
          border-bottom: 1px solid rgba(170, 198, 255, 0.08);
        }
        .li-table-row {
          display: grid;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.05);
          transition: background 0.2s ease;
        }
        .li-table-row:hover {
          background: rgba(100, 160, 255, 0.04);
        }
        .li-table-row:last-child {
          border-bottom: none;
        }

        /* Donut chart animations */
        .li-donut-container {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .li-donut-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100, 160, 255, 0.15) 0%, transparent 70%);
          animation: li-glow-pulse 3s ease-in-out infinite;
        }

        @keyframes li-glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .li-donut-orbit {
          position: absolute;
          inset: -10px;
          border: 1px dashed rgba(170, 198, 255, 0.15);
          border-radius: 50%;
          animation: li-orbit-rotate 30s linear infinite;
        }

        @keyframes li-orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .li-donut-main {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .li-donut-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .li-donut-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(170, 198, 255, 0.6);
          animation: li-particle-float 4s ease-in-out infinite;
        }
        .li-donut-particle:nth-child(1) { top: 10%; left: 50%; animation-delay: 0s; }
        .li-donut-particle:nth-child(2) { top: 50%; right: 10%; animation-delay: 1s; }
        .li-donut-particle:nth-child(3) { bottom: 10%; left: 50%; animation-delay: 2s; }
        .li-donut-particle:nth-child(4) { top: 50%; left: 10%; animation-delay: 3s; }

        @keyframes li-particle-float {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(-6px); }
        }

        .li-donut-center {
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: #090A0C;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 20px rgba(0, 0, 0, 0.50);
        }

        .li-donut-value {
          color: rgba(245, 248, 255, 0.96);
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .li-donut-label {
          color: rgba(170, 198, 255, 0.55);
          font-size: 11px;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Footer wrapper in page context */
        .li-footer-wrapper footer {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Panel content - EXACT same as overlay */}
      <LiveIntelligencePanel isPageMode={true} />

      {/* Footer - same as overlay */}
      <div
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
        <Footer />
      </div>
    </div>
  );
}

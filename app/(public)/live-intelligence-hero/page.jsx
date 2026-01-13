'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LaserFooter from '@/components/user/LaserFooter';
import ModeIndicator from './components/ModeIndicator';
import NightSummary from './components/NightSummary';
import HeadlineFeed from './components/HeadlineFeed';
import StreakBadge from './components/StreakBadge';
import DonutCalculator from './components/DonutCalculator';
import { getCurrentModeConfig } from '@/lib/live-intelligence/modes';
import { initEngagementTracking } from '@/lib/live-intelligence/analytics';

const LASER_ASSET_VERSION = 'seamless-xfade-fade-2026-01-11';
const VIDEO_SRC = `/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`; // LOCKED

export default function LiveIntelligenceHeroPage() {
  const router = useRouter();
  const [modeConfig, setModeConfig] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  // Hide the mobile dock on this page only (does not affect scroll)
  useEffect(() => {
    document.body.setAttribute('data-laser-active', 'true');
    
    // Initialize analytics tracking
    const cleanupAnalytics = initEngagementTracking();
    setModeConfig(getCurrentModeConfig());

    // Check for mode changes every 60 seconds
    const modeInterval = setInterval(() => {
      setModeConfig(getCurrentModeConfig());
    }, 60000);

    return () => {
      document.body.removeAttribute('data-laser-active');
      clearInterval(modeInterval);
      if (cleanupAnalytics) cleanupAnalytics();
    };
  }, []);

  // Close share menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close handler - navigate back home
  const handleClose = () => {
    router.push('/');
  };

  // Share handlers
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://bmwealth.in/live-intelligence-hero';
  const shareText = 'Check out my Live Intelligence Dashboard at BM Wealth - Real-time portfolio insights!';

  const handleShare = (platform) => {
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent('My BM Wealth Portfolio Dashboard')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      copy: null,
    };

    if (platform === 'copy') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Link copied to clipboard!');
        }).catch(() => {
          // Fallback for clipboard API failure
          prompt('Copy this link:', shareUrl);
        });
      } else {
        // Fallback for browsers without clipboard API
        prompt('Copy this link:', shareUrl);
      }
    } else if (urls[platform]) {
      // Try window.open first, fallback to location.href for VS Code browser
      const newWindow = window.open(urls[platform], '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked - use direct navigation
        window.location.href = urls[platform];
      }
    }
    setShowShareMenu(false);
  };

  // Get mode accent color (fallback to ice blue)
  const accentColor = modeConfig?.accentColor || 'rgba(170, 198, 255, 1)';
  const accentDim = modeConfig?.accentColorDim || 'rgba(170, 198, 255, 0.25)';
  const glowColor = modeConfig?.glowColor || 'rgba(170, 198, 255, 0.4)';

  return (
    <main style={{ width: '100%', margin: 0, padding: 0 }}>

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

      {/* PANEL: starts immediately after laser (no gap). Premium vertical laser beams inside. */}
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
          '--mode-accent': accentColor,
          '--mode-accent-dim': accentDim,
          '--mode-glow': glowColor,
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

        {/* Premium vertical laser beams (DataBahn-style) - flowing into panel */}
        <div aria-hidden="true" className="li-laser-beams">
          {/* Center beam (main) */}
          <div className="li-beam li-beam-center" />
          {/* Left beams */}
          <div className="li-beam li-beam-l1" />
          <div className="li-beam li-beam-l2" />
          <div className="li-beam li-beam-l3" />
          {/* Right beams */}
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
          .li-beam-l1 {
            left: calc(50% - 120px);
            opacity: 0.75;
            --beam-duration: 4.4s;
            --beam-delay: 0.8s;
          }
          .li-beam-l2 {
            left: calc(50% - 240px);
            opacity: 0.55;
            --beam-duration: 5.2s;
            --beam-delay: 1.6s;
          }
          .li-beam-l3 {
            left: calc(50% - 380px);
            opacity: 0.40;
            --beam-duration: 6.0s;
            --beam-delay: 2.4s;
          }

          /* Right beams */
          .li-beam-r1 {
            left: calc(50% + 120px);
            opacity: 0.75;
            --beam-duration: 4.2s;
            --beam-delay: 0.5s;
          }
          .li-beam-r2 {
            left: calc(50% + 240px);
            opacity: 0.55;
            --beam-duration: 5.0s;
            --beam-delay: 1.3s;
          }
          .li-beam-r3 {
            left: calc(50% + 380px);
            opacity: 0.40;
            --beam-duration: 5.8s;
            --beam-delay: 2.1s;
          }

          /* The pulse animation (travels from top to bottom) */
          @keyframes liBeamPulse {
            0% {
              top: -100px;
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            85% {
              opacity: 1;
            }
            100% {
              top: calc(100% + 100px);
              opacity: 0;
            }
          }

          /* Reduced motion: no animation, just static faint lines */
          @media (prefers-reduced-motion: reduce) {
            .li-beam::before {
              animation: none;
              opacity: 0.35;
              top: 20%;
            }
          }

          /* Dashboard shell styling */
          [data-li-panel] .li-panel-shell {
            border-color: var(--mode-accent-dim, rgba(255, 255, 255, 0.08));
            box-shadow:
              0 0 0 1px var(--mode-accent-dim, rgba(170, 198, 255, 0.08)),
              0 18px 60px rgba(0, 0, 0, 0.50),
              0 0 80px var(--mode-glow, rgba(170, 198, 255, 0.06));
            transition: border-color 0.5s ease, box-shadow 0.5s ease;
          }

          /* ═══════════════════════════════════════════════════════════
             MODE-BASED ACCENT COLORS
             ═══════════════════════════════════════════════════════════ */

          /* KPI card borders use mode accent */
          [data-li-panel] .li-kpi-card {
            border-color: var(--mode-accent-dim, rgba(170, 198, 255, 0.12));
            transition: border-color 0.5s ease, box-shadow 0.5s ease;
          }

          [data-li-panel] .li-kpi-card:hover {
            border-color: var(--mode-accent, rgba(170, 198, 255, 0.28));
            box-shadow:
              0 8px 32px rgba(0, 0, 0, 0.55),
              0 0 0 1px var(--mode-accent-dim, rgba(170, 198, 255, 0.15)),
              0 0 40px var(--mode-glow, rgba(140, 190, 255, 0.08)),
              inset 0 1px 0 rgba(255, 255, 255, 0.06);
          }

          /* Section dividers use mode accent */
          [data-li-panel] .li-section-divider::before {
            background: linear-gradient(
              90deg,
              transparent 0%,
              var(--mode-accent-dim, rgba(170, 198, 255, 0.20)) 20%,
              var(--mode-accent-dim, rgba(170, 198, 255, 0.20)) 80%,
              transparent 100%
            );
          }

          [data-li-panel] .li-section-divider::after {
            box-shadow: 0 0 12px var(--mode-glow, rgba(170, 210, 255, 0.5));
          }

          /* Live dot uses mode accent when market is closed */
          [data-li-panel] .li-live-dot {
            background: var(--mode-accent, rgba(140, 220, 180, 0.9));
            box-shadow: 0 0 8px var(--mode-glow, rgba(140, 220, 180, 0.6));
          }

          /* ═══════════════════════════════════════════════════════════
             PREMIUM DASHBOARD STYLES
             ═══════════════════════════════════════════════════════════ */

          /* KPI Cards - Premium glass with glow */
          .li-kpi-card {
            position: relative;
            border-radius: 18px;
            border: 1px solid rgba(170, 198, 255, 0.12);
            background: 
              linear-gradient(180deg, rgba(20, 24, 32, 0.95) 0%, rgba(10, 10, 12, 0.98) 100%);
            box-shadow:
              0 4px 24px rgba(0, 0, 0, 0.45),
              inset 0 1px 0 rgba(255, 255, 255, 0.04);
            padding: 20px 20px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .li-kpi-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(
              ellipse 120% 80% at 50% 0%,
              rgba(170, 210, 255, 0.08) 0%,
              rgba(170, 210, 255, 0.00) 70%
            );
            opacity: 0;
            transition: opacity 0.4s ease;
          }

          .li-kpi-card:hover {
            border-color: rgba(170, 198, 255, 0.28);
            transform: translateY(-2px);
            box-shadow:
              0 8px 32px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(170, 198, 255, 0.15),
              0 0 40px rgba(140, 190, 255, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.06);
          }

          .li-kpi-card:hover::before {
            opacity: 1;
          }

          /* Live indicator dot */
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

          /* Trading Terminal animations */
          @keyframes liTerminalGlow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; box-shadow: 0 0 40px rgba(100, 200, 255, 0.7), 0 0 80px rgba(100, 200, 255, 0.4); }
          }

          @keyframes liBarPulse {
            0%, 100% { opacity: 0.85; }
            50% { opacity: 1; }
          }

          /* Section divider with laser */
          .li-section-divider {
            position: relative;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px 0;
          }

          .li-section-divider::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            background: linear-gradient(
              90deg,
              rgba(170, 198, 255, 0.00) 0%,
              rgba(170, 198, 255, 0.20) 20%,
              rgba(170, 198, 255, 0.20) 80%,
              rgba(170, 198, 255, 0.00) 100%
            );
          }

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

          /* Dashboard card - premium style */
          .li-dash-card {
            position: relative;
            border-radius: 20px;
            border: 1px solid rgba(170, 198, 255, 0.10);
            background: 
              linear-gradient(180deg, rgba(18, 22, 30, 0.96) 0%, rgba(10, 10, 12, 0.98) 100%);
            box-shadow:
              0 8px 40px rgba(0, 0, 0, 0.50),
              inset 0 1px 0 rgba(255, 255, 255, 0.03);
            padding: 24px 24px;
            overflow: hidden;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .li-dash-card::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(
              90deg,
              rgba(170, 198, 255, 0.00) 0%,
              rgba(170, 198, 255, 0.35) 50%,
              rgba(170, 198, 255, 0.00) 100%
            );
            opacity: 0;
            transition: opacity 0.35s ease;
          }

          .li-dash-card:hover {
            border-color: rgba(170, 198, 255, 0.22);
            box-shadow:
              0 12px 48px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(170, 198, 255, 0.12),
              0 0 60px rgba(140, 190, 255, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .li-dash-card:hover::before {
            opacity: 1;
          }

          /* Signal card with status indicator */
          .li-signal-card {
            position: relative;
            border-radius: 14px;
            border: 1px solid rgba(170, 198, 255, 0.12);
            background: 
              linear-gradient(135deg, rgba(130, 160, 255, 0.06) 0%, rgba(10, 10, 12, 0.80) 100%);
            padding: 16px 18px;
            transition: all 0.3s ease;
            overflow: hidden;
          }

          .li-signal-card::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(
              180deg,
              rgba(140, 190, 255, 0.50) 0%,
              rgba(140, 220, 180, 0.50) 100%
            );
            opacity: 0.6;
            transition: opacity 0.3s ease;
          }

          .li-signal-card:hover {
            border-color: rgba(170, 198, 255, 0.25);
            background: 
              linear-gradient(135deg, rgba(130, 160, 255, 0.10) 0%, rgba(10, 10, 12, 0.85) 100%);
          }

          .li-signal-card:hover::before {
            opacity: 1;
          }

          /* Priority indicators */
          .li-priority-high { color: rgba(255, 180, 140, 0.90); }
          .li-priority-medium { color: rgba(255, 220, 140, 0.90); }
          .li-priority-good { color: rgba(140, 220, 180, 0.90); }

          /* Chart placeholder with scan effect */
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
          }

          @keyframes liChartScan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { top: 100%; opacity: 0; }
          }

          /* Stat pill */
          .li-stat-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(0, 0, 0, 0.30);
            transition: all 0.25s ease;
          }

          .li-stat-pill:hover {
            border-color: rgba(170, 198, 255, 0.18);
            background: rgba(130, 160, 255, 0.08);
          }

          /* Table styles */
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

          .li-table-wrapper {
            overflow: hidden;
          }

          /* ═══════════════════════════════════════════════════════════
             LUXURIOUS MODERN SCROLLBAR
             ═══════════════════════════════════════════════════════════ */
          
          /* Custom scrollbar for all scrollable areas */
          .li-table-wrapper::-webkit-scrollbar,
          .li-holdings-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .li-table-wrapper::-webkit-scrollbar-track,
          .li-holdings-scroll::-webkit-scrollbar-track {
            background: rgba(20, 25, 35, 0.5);
            border-radius: 10px;
          }

          .li-table-wrapper::-webkit-scrollbar-thumb,
          .li-holdings-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(100, 160, 255, 0.35) 0%, rgba(140, 190, 255, 0.25) 100%);
            border-radius: 10px;
            border: 1px solid rgba(100, 160, 255, 0.15);
          }

          .li-table-wrapper::-webkit-scrollbar-thumb:hover,
          .li-holdings-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(100, 160, 255, 0.55) 0%, rgba(140, 190, 255, 0.40) 100%);
            box-shadow: 0 0 12px rgba(100, 160, 255, 0.3);
          }

          /* Firefox scrollbar */
          .li-table-wrapper,
          .li-holdings-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(100, 160, 255, 0.35) rgba(20, 25, 35, 0.5);
          }

          /* ═══════════════════════════════════════════════════════════
             SHARE MENU DROPDOWN
             ═══════════════════════════════════════════════════════════ */
          
          .li-share-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            min-width: 200px;
            background: rgba(15, 18, 25, 0.98);
            border: 1px solid rgba(100, 160, 255, 0.20);
            border-radius: 14px;
            padding: 8px;
            box-shadow: 
              0 12px 40px rgba(0, 0, 0, 0.50),
              0 0 60px rgba(100, 160, 255, 0.08);
            backdrop-filter: blur(20px);
            z-index: 200;
            animation: shareMenuSlide 0.2s ease-out;
          }

          @keyframes shareMenuSlide {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .li-share-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 14px;
            background: transparent;
            border: none;
            border-radius: 10px;
            color: rgba(220, 230, 255, 0.85);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .li-share-item:hover {
            background: rgba(100, 160, 255, 0.12);
            color: rgba(255, 255, 255, 1);
          }

          .li-share-item-icon {
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          }

          /* ═══════════════════════════════════════════════════════════
             BACK ARROW - Pure minimal, no background
             ═══════════════════════════════════════════════════════════ */
          
          .li-back-arrow {
            appearance: none;
            border: none;
            background: transparent;
            color: rgba(180, 200, 230, 0.55);
            padding: 8px 12px;
            cursor: pointer;
            font-size: 22px;
            font-weight: 300;
            transition: all 0.2s ease;
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1;
          }

          .li-back-arrow:hover {
            color: rgba(140, 190, 255, 0.95);
            transform: translateX(-4px);
          }

          /* ═══════════════════════════════════════════════════════════
             RESPONSIVE STYLES
             ═══════════════════════════════════════════════════════════ */
          
          @media (max-width: 900px) {
            .li-panel-shell {
              padding: 14px 16px 72px !important;
            }
          }
          
          @media (max-width: 768px) {
            .li-beam-l3, .li-beam-r3 {
              display: none;
            }
          }

          @media (max-width: 600px) {
            .li-beam-l2, .li-beam-r2 {
              display: none;
            }
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

          .li-donut-particle:nth-child(1) {
            top: 15%;
            left: 70%;
            animation-delay: 0s;
          }
          .li-donut-particle:nth-child(2) {
            top: 60%;
            left: 90%;
            animation-delay: 0.5s;
          }
          .li-donut-particle:nth-child(3) {
            top: 85%;
            left: 50%;
            animation-delay: 1s;
          }
          .li-donut-particle:nth-child(4) {
            top: 40%;
            left: 8%;
            animation-delay: 1.5s;
          }

          @keyframes liParticleFloat {
            0%, 100% { 
              opacity: 0; 
              transform: translate(0, 0) scale(0.5);
            }
            20% { 
              opacity: 1;
              transform: translate(-5px, -8px) scale(1);
            }
            80% { 
              opacity: 0.8;
              transform: translate(5px, -15px) scale(0.8);
            }
          }

          /* ═══════════════════════════════════════════════════════════
             MOBILE RESPONSIVE - 85% USERS
             ═══════════════════════════════════════════════════════════ */
          
          @media (max-width: 768px) {
            /* Panel shell */
            .li-panel-shell {
              padding: 12px 14px 64px !important;
              border-radius: 20px !important;
            }

            /* Dashboard grid - single column on mobile */
            .li-dash-grid {
              grid-template-columns: 1fr !important;
            }

            /* KPI grid - 2 columns on mobile */
            .li-kpi-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }

            /* KPI cards smaller */
            .li-kpi-card {
              padding: 14px 14px;
              border-radius: 14px;
            }

            /* Smaller values on mobile */
            .li-kpi-value {
              font-size: 22px !important;
            }

            /* Dashboard cards */
            .li-dash-card {
              padding: 18px 16px;
              border-radius: 16px;
            }

            /* Allow donut effects to breathe (avoid clipping) */
            .li-allocation-card {
              overflow: visible !important;
            }

            .li-chart-area {
              overflow: visible !important;
            }

            /* Donut container responsive */
            .li-donut-container {
              width: 160px;
              height: 160px;
            }

            .li-donut-value {
              font-size: 20px;
            }

            /* Asset grid - 2x2 on mobile */
            .li-asset-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }

            /* Table scrollable */
            .li-table-wrapper {
              overflow-x: auto !important;
              overflow-y: hidden !important;
              -webkit-overflow-scrolling: touch;
            }

            .li-table-header,
            .li-table-row {
              min-width: 500px;
            }

            /* Signal cards full width */
            .li-signal-card {
              padding: 14px 14px;
            }

            /* Header adjustments */
            .li-header-title {
              font-size: 24px !important;
            }

            .li-header-actions {
              width: 100%;
              justify-content: flex-start !important;
            }
          }

          @media (max-width: 480px) {
            /* Extra small screens */
            .li-panel-shell {
              padding: 10px 12px 56px !important;
              border-radius: 16px !important;
            }

            .li-kpi-card {
              padding: 12px 12px;
            }

            .li-kpi-value {
              font-size: 20px !important;
            }

            .li-donut-container {
              width: 140px;
              height: 140px;
            }

            .li-donut-value {
              font-size: 18px;
            }

            .li-donut-orbit {
              inset: -6px;
            }

            .li-donut-glow {
              inset: -8px;
            }

            .li-header-title {
              font-size: 22px !important;
            }

            /* Buttons stack */
            .li-header-actions button {
              padding: 8px 12px;
              font-size: 12px;
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
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Dashboard header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: '8px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 className="li-header-title" style={{ margin: 0, color: 'rgba(235,242,255,0.96)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                  Live Intelligence
                </h2>
                <ModeIndicator />
                <StreakBadge showDetails={true} />
              </div>
              <p style={{ margin: '8px 0 0', color: 'rgba(200,215,240,0.65)', fontSize: '14px', maxWidth: '52ch', lineHeight: 1.5 }}>
                Your financial command center — real-time portfolio insights and signals.
              </p>
            </div>

            <div className="li-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* CLOSE BUTTON - Pure arrow, no background */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Go back to homepage"
                title="Back to home"
                className="li-back-arrow"
              >
                ←
              </button>
              {/* EXPORT/SHARE BUTTON with dropdown */}
              <div ref={shareMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowShareMenu(!showShareMenu)}
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
                  <div className="li-share-menu">
                    <button type="button" className="li-share-item" onClick={() => handleShare('whatsapp')}>
                      <span className="li-share-item-icon">💬</span>
                      <span>WhatsApp</span>
                    </button>
                    <button type="button" className="li-share-item" onClick={() => handleShare('email')}>
                      <span className="li-share-item-icon">📧</span>
                      <span>Email</span>
                    </button>
                    <button type="button" className="li-share-item" onClick={() => handleShare('twitter')}>
                      <span className="li-share-item-icon">𝕏</span>
                      <span>Twitter / X</span>
                    </button>
                    <button type="button" className="li-share-item" onClick={() => handleShare('linkedin')}>
                      <span className="li-share-item-icon">💼</span>
                      <span>LinkedIn</span>
                    </button>
                    <button type="button" className="li-share-item" onClick={() => handleShare('telegram')}>
                      <span className="li-share-item-icon">✈️</span>
                      <span>Telegram</span>
                    </button>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />
                    <button type="button" className="li-share-item" onClick={() => handleShare('copy')}>
                      <span className="li-share-item-icon">📋</span>
                      <span>Copy Link</span>
                    </button>
                  </div>
                )}
              </div>
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
          <div
            className="li-kpi-grid"
            style={{
              marginTop: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '14px',
            }}
          >
            {[{
              label: 'Total Invested',
              value: '₹ 24.8L',
              hint: 'Across MF + PMS + FD',
              trend: null,
            }, {
              label: 'Current Value',
              value: '₹ 28.3L',
              hint: '+₹ 3.5L unrealized',
              trend: '+14.1%',
            }, {
              label: 'XIRR',
              value: '14.2%',
              hint: 'Last 12 months',
              trend: '+2.1%',
            }, {
              label: 'Risk Score',
              value: 'Moderate',
              hint: 'Aligned to goals',
              trend: null,
            }].map((card) => (
              <div
                key={card.label}
                className="li-kpi-card"
                style={{ gridColumn: 'span 1' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
                    {card.label}
                  </div>
                  {card.trend && (
                    <div style={{ 
                      color: 'rgba(140,220,180,0.90)', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(140,220,180,0.10)',
                    }}>
                      {card.trend}
                    </div>
                  )}
                </div>
                <div className="li-kpi-value" style={{ marginTop: '12px', color: 'rgba(245,248,255,0.96)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                  {card.value}
                </div>
                <div style={{ marginTop: '8px', color: 'rgba(200,215,240,0.50)', fontSize: '12px', lineHeight: 1.4 }}>
                  {card.hint}
                </div>
              </div>
            ))}
          </div>

          {/* Section divider with scanning laser */}
          <div className="li-section-divider" />

          {/* Main dashboard grid - 2 column layout */}
          <div
            className="li-dash-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '16px',
            }}
          >
            {/* Left column - Allocation Overview */}
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

              {/* Chart area with EPIC donut - LOCKED ANIMATIONS */}
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
                  <div className="li-donut-main">
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
                    <div className="li-donut-value">₹28.3L</div>
                    <div className="li-donut-label">Portfolio</div>
                  </div>
                </div>
              </div>

              {/* Asset breakdown */}
              <div className="li-asset-grid" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { k: 'Equity', v: '58%', c: 'rgba(100,160,255,0.90)' },
                  { k: 'Debt', v: '24%', c: 'rgba(140,220,180,0.85)' },
                  { k: 'Gold', v: '8%', c: 'rgba(255,200,120,0.85)' },
                  { k: 'Cash', v: '10%', c: 'rgba(180,150,255,0.80)' },
                ].map((item) => (
                  <div key={item.k} className="li-stat-pill" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.c, boxShadow: `0 0 8px ${item.c}` }} />
                      <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px' }}>{item.k}</div>
                    </div>
                    <div className="li-kpi-value" style={{ marginTop: '6px', color: 'rgba(245,248,255,0.94)', fontSize: '18px', fontWeight: 600 }}>{item.v}</div>
                  </div>
                ))}
              </div>

              {/* Collapsible Calculator */}
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="li-stat-pill" style={{ cursor: 'pointer' }}>
                    <span style={{ color: 'rgba(200,215,240,0.70)', fontSize: '12px' }}>Sort by value</span>
                  </div>
                </div>
              </div>

              {/* Table - scrollable on mobile */}
              <div className="li-table-wrapper" style={{ borderRadius: '14px', border: '1px solid rgba(170,198,255,0.10)' }}>
                <div 
                  className="li-table-header"
                  style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr' }}
                >
                  {['Instrument', 'Value', '1D Change', 'Total P/L'].map((h) => (
                    <div key={h} style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500 }}>
                      {h}
                    </div>
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
                  <div
                    key={row.n}
                    className="li-table-row"
                    style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr' }}
                  >
                    <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: '13px', fontWeight: 450 }}>{row.n}</div>
                    <div style={{ color: 'rgba(220,230,255,0.85)', fontSize: '13px' }}>{row.v}</div>
                    <div style={{ color: row.dColor, fontSize: '13px', fontWeight: 500 }}>{row.d}</div>
                    <div style={{ color: row.pColor, fontSize: '13px', fontWeight: 500 }}>{row.p}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                TRADING CHARTING TERMINAL - Real TradingView Integration
                ═══════════════════════════════════════════════════════════ */}
            <div 
              className="li-dash-card li-trading-terminal" 
              style={{ 
                gridColumn: '1 / -1',
                position: 'relative',
                overflow: 'hidden',
                background: '#131722',
                border: '1px solid rgba(100, 180, 255, 0.15)',
                borderRadius: '20px',
                padding: 0,
              }}
            >
              {/* Terminal Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(100, 180, 255, 0.10)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: '#131722',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: 'rgba(220, 240, 255, 0.95)', 
                    fontSize: '16px', 
                    fontWeight: 600,
                  }}>
                    📈 Live Chart — NIFTY 50
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

              {/* TradingView Advanced Chart Widget - Full feature with symbol search */}
              <div style={{ height: '500px', width: '100%', background: '#131722' }}>
                <iframe
                  src="https://www.tradingview.com/widgetembed/?symbol=NSE%3ANIFTY&interval=15&symboledit=1&saveimage=1&toolbarbg=131722&theme=dark&style=1&timezone=Asia%2FKolkata&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&details=1&hotlist=1&calendar=0&locale=in"
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
                💡 Click the symbol name at top-left to search & change stocks (SENSEX, BANKNIFTY, RELIANCE, TCS, etc.)
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                LIVE MARKET TICKER - Real TradingView Widget
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
              {/* Header with real market status */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(100, 180, 255, 0.08)',
                background: '#131722',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, color: 'rgba(230, 240, 255, 0.95)', fontSize: '15px', fontWeight: 600 }}>
                    🌍 Global Markets
                  </h3>
                  {/* Real market status based on IST time */}
                  {(() => {
                    const now = new Date();
                    const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0);
                    const istMinute = (now.getUTCMinutes() + 30) % 60;
                    const day = now.getDay();
                    const isWeekday = day >= 1 && day <= 5;
                    const isMarketHours = isWeekday && ((istHour === 9 && istMinute >= 15) || (istHour > 9 && istHour < 15) || (istHour === 15 && istMinute <= 30));
                    
                    return (
                      <span style={{
                        padding: '3px 10px',
                        background: isMarketHours ? 'rgba(100, 220, 180, 0.12)' : 'rgba(120, 150, 200, 0.12)',
                        border: `1px solid ${isMarketHours ? 'rgba(100, 220, 180, 0.30)' : 'rgba(120, 150, 200, 0.30)'}`,
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: isMarketHours ? 'rgba(100, 220, 180, 0.95)' : 'rgba(160, 185, 220, 0.95)',
                        letterSpacing: '0.1em',
                      }}>
                        {isMarketHours ? 'NSE OPEN' : 'NSE CLOSED'}
                      </span>
                    );
                  })()}
                </div>
                <div style={{ color: 'rgba(180, 200, 230, 0.50)', fontSize: '10px' }}>
                  Real-time quotes • TradingView
                </div>
              </div>

              {/* TradingView Market Overview Widget - Pure Black */}
              <div style={{ height: '420px', width: '100%', background: '#000000' }}>
                <iframe
                  src="https://s.tradingview.com/embed-widget/market-overview/?colorTheme=dark&dateRange=12M&showChart=true&locale=in&largeChartUrl=&isTransparent=false&showSymbolLogo=true&showFloatingTooltip=false&width=100%25&height=100%25&tabs=%5B%7B%22title%22%3A%22Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22NSE%3ANIFTY%22%2C%22d%22%3A%22NIFTY%2050%22%7D%2C%7B%22s%22%3A%22BSE%3ASENSEX%22%2C%22d%22%3A%22SENSEX%22%7D%2C%7B%22s%22%3A%22NSE%3ABANKNIFTY%22%2C%22d%22%3A%22Bank%20NIFTY%22%7D%2C%7B%22s%22%3A%22NSE%3ANIFTYIT%22%2C%22d%22%3A%22NIFTY%20IT%22%7D%5D%7D%2C%7B%22title%22%3A%22Commodities%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22MCX%3AGOLD1!%22%2C%22d%22%3A%22Gold%22%7D%2C%7B%22s%22%3A%22MCX%3ASILVER1!%22%2C%22d%22%3A%22Silver%22%7D%2C%7B%22s%22%3A%22MCX%3ACRUDEOIL1!%22%2C%22d%22%3A%22Crude%20Oil%22%7D%5D%7D%2C%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FX_IDC%3AUSDINR%22%2C%22d%22%3A%22USD%2FINR%22%7D%2C%7B%22s%22%3A%22FX%3AEURUSD%22%2C%22d%22%3A%22EUR%2FUSD%22%7D%5D%7D%5D"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    backgroundColor: '#000000',
                  }}
                  title="Market Overview"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Headline Feed - Rotating financial news */}
          <HeadlineFeed />

          {/* Night Summary Dashboard - Only shows 9PM-12AM */}
          <NightSummary />
        </div>
      </section>

      {/* FOOTER: LaserFooter with panel's premium icy style */}
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
        <LaserFooter />
      </div>
    </main>
  );
}

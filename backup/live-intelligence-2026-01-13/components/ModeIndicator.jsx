'use client';

import { useState, useEffect } from 'react';
import { getCurrentModeConfig, getISTTime, isMarketOpen } from '@/lib/live-intelligence/modes';

/**
 * ModeIndicator - Shows current time-based mode with live clock
 * 
 * Displays: Mode icon + Mode label + IST time + Market status
 * Updates every 60 seconds to check for mode changes
 */
export default function ModeIndicator() {
  const [mode, setMode] = useState(null);
  const [time, setTime] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Initial load
    setMode(getCurrentModeConfig());
    setTime(getISTTime());
    setMarketOpen(isMarketOpen());

    // Update time every second for smooth clock
    const clockInterval = setInterval(() => {
      setTime(getISTTime());
    }, 1000);

    // Check for mode changes every 60 seconds
    const modeInterval = setInterval(() => {
      const newMode = getCurrentModeConfig();
      setMarketOpen(isMarketOpen());
      
      if (newMode.key !== mode?.key) {
        // Trigger transition animation
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
        {/* Mode Icon */}
        <span className="li-mode-icon">{mode.icon}</span>

        {/* Mode Info */}
        <div className="li-mode-info">
          <span className="li-mode-label">{mode.label}</span>
          <span className="li-mode-time">{time} IST</span>
        </div>

        {/* Market Status Dot */}
        <div className={`li-market-status ${marketOpen ? 'open' : 'closed'}`}>
          <span className="li-market-dot" />
          <span className="li-market-label">{marketOpen ? 'LIVE' : 'CLOSED'}</span>
        </div>
      </div>

      <style jsx>{`
        .li-mode-indicator {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 18px 10px 14px;
          background: rgba(10, 12, 18, 0.85);
          border: 1px solid var(--accent-dim);
          border-radius: 100px;
          backdrop-filter: blur(12px);
          box-shadow: 
            0 0 20px var(--glow),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: all 0.4s ease;
          opacity: 1;
          transform: translateY(0);
        }

        .li-mode-indicator.transitioning {
          opacity: 0;
          transform: translateY(-8px);
        }

        .li-mode-icon {
          font-size: 20px;
          line-height: 1;
          filter: drop-shadow(0 0 6px var(--glow));
        }

        .li-mode-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .li-mode-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.02em;
          text-shadow: 0 0 12px var(--glow);
        }

        .li-mode-time {
          font-size: 11px;
          color: rgba(220, 230, 255, 0.55);
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.04em;
        }

        .li-market-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 8px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 100px;
          margin-left: 4px;
        }

        .li-market-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(120, 130, 150, 0.6);
          transition: all 0.3s ease;
        }

        .li-market-status.open .li-market-dot {
          background: rgba(80, 220, 120, 1);
          box-shadow: 0 0 8px rgba(80, 220, 120, 0.6);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .li-market-status.closed .li-market-dot {
          background: rgba(180, 80, 80, 0.7);
        }

        .li-market-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(220, 230, 255, 0.5);
        }

        .li-market-status.open .li-market-label {
          color: rgba(80, 220, 120, 0.9);
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .li-mode-indicator {
            padding: 8px 14px 8px 12px;
            gap: 10px;
          }

          .li-mode-icon {
            font-size: 18px;
          }

          .li-mode-label {
            font-size: 12px;
          }

          .li-mode-time {
            font-size: 10px;
          }

          .li-market-status {
            padding: 3px 8px 3px 6px;
          }

          .li-market-label {
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
}

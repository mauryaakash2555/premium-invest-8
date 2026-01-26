'use client';

import { useState, useEffect } from 'react';
import { getCurrentMode, getISTNow, isMarketOpen } from '@/lib/modes';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatISTTime(date = new Date()) {
  const ist = getISTNow(date);
  return `${pad2(ist.getHours())}:${pad2(ist.getMinutes())}:${pad2(ist.getSeconds())}`;
}

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
    const initialMode = getCurrentMode();
    setMode(initialMode);
    setTime(formatISTTime());
    setMarketOpen(isMarketOpen());

    // Update locked header title without modifying the locked file
    try {
      const headerTitle = document.querySelector('.li-header-section h2');
      if (headerTitle && initialMode) {
        headerTitle.textContent = `${initialMode.icon} ${initialMode.name}`;
      }
    } catch {
      // no-op
    }

    // Update time every second for smooth clock
    const clockInterval = setInterval(() => {
      setTime(formatISTTime());
    }, 1000);

    // Check for mode changes every 60 seconds
    const modeInterval = setInterval(() => {
      const newMode = getCurrentMode();
      setMarketOpen(isMarketOpen());
      
      if (newMode.key !== mode?.key) {
        // Trigger transition animation
        setIsTransitioning(true);
        setTimeout(() => {
          setMode(newMode);
          setIsTransitioning(false);
        }, 300);

        // Keep header title in sync
        try {
          const headerTitle = document.querySelector('.li-header-section h2');
          if (headerTitle) {
            headerTitle.textContent = `${newMode.icon} ${newMode.name}`;
          }
        } catch {
          // no-op
        }
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
        style={{ '--accent': mode.accentColor || 'rgba(235,242,255,0.92)' }}
      >
        {/* Mode Icon */}
        <span className="li-mode-icon">{mode.icon}</span>

        {/* Mode Info */}
        <div className="li-mode-info">
          <span className="li-mode-label">{mode.name}</span>
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
          background: rgba(10, 12, 18, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 100px;
          backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
          transition: opacity 0.25s ease, transform 0.25s ease;
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
          background: rgba(100, 220, 150, 1);
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
          color: rgba(100, 220, 150, 0.9);
        }

        .li-market-status.closed .li-market-label {
          color: rgba(200, 120, 120, 0.8);
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

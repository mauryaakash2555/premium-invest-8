'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentModeConfig, getISTTime } from '@/lib/live-intelligence/modes';
import WhatsAppShare from './WhatsAppShare';

/**
 * NightSummary - Special dashboard layout for 9PM-12AM
 * 
 * Shows: Markets recap, Key developments, Tomorrow's watch
 * Only renders when mode is 'night_summary'
 * 
 * NOW FETCHES FROM LIVE API - NO MORE DUMMY DATA
 */

export default function NightSummary() {
  const [mode, setMode] = useState(null);
  const [time, setTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch summary from API
  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/live-intelligence/night-summary', {
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load summary');
      }
      
      setSummary(data);
      setRetryCount(0);
    } catch (err) {
      console.error('Night summary fetch failed:', err);
      setError(err.message || 'Unable to load market summary');
      
      // Auto-retry after 5 minutes (up to 3 times)
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 5 * 60 * 1000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    const checkMode = () => {
      const currentMode = getCurrentModeConfig();
      setMode(currentMode);
      setTime(getISTTime());
      setIsVisible(currentMode.key === 'night_summary');
    };

    checkMode();
    const interval = setInterval(checkMode, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch summary when visible
  useEffect(() => {
    if (isVisible) {
      fetchSummary();
    }
  }, [isVisible, fetchSummary]);

  // Only show in night_summary mode (9PM - 12AM)
  if (!isVisible || !mode) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="li-night-summary" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🌙</div>
        <div style={{ color: 'rgba(200, 215, 240, 0.7)' }}>Loading market summary...</div>
        <style jsx>{nightSummaryStyles}</style>
      </div>
    );
  }

  // Show error state - NO FALLBACK TO DUMMY DATA
  if (error || !summary) {
    return (
      <div className="li-night-summary li-ns-error">
        <div className="li-ns-error-content">
          <span style={{ fontSize: '32px', marginBottom: '16px', display: 'block' }}>⚠️</span>
          <h3 style={{ color: 'rgba(255, 180, 180, 0.9)', margin: '0 0 12px' }}>Unable to Load Summary</h3>
          <p style={{ color: 'rgba(200, 215, 240, 0.6)', margin: '0 0 20px', fontSize: '14px' }}>
            {error || 'Market data is temporarily unavailable.'}
          </p>
          <button
            onClick={fetchSummary}
            style={{
              background: 'rgba(100, 140, 220, 0.2)',
              border: '1px solid rgba(100, 140, 220, 0.4)',
              color: 'rgba(200, 220, 255, 0.9)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Retry Now
          </button>
          {retryCount > 0 && (
            <p style={{ color: 'rgba(200, 215, 240, 0.4)', margin: '12px 0 0', fontSize: '12px' }}>
              Auto-retrying in 5 minutes... (Attempt {retryCount}/3)
            </p>
          )}
        </div>
        <style jsx>{nightSummaryStyles}</style>
      </div>
    );
  }

  const formatNumber = (num) => num?.toLocaleString('en-IN') || '0';
  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatNumber(change)} (${sign}${(percent || 0).toFixed(2)}%)`;
  };

  // Use live data from API
  const markets = summary.markets || {};
  const developments = summary.developments || [];
  const tomorrow = summary.tomorrow || [];

  return (
    <>
      <div className="li-night-summary">
        {/* Live data indicator */}
        {summary.isLive && (
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px', 
            background: 'rgba(100, 200, 150, 0.15)',
            border: '1px solid rgba(100, 200, 150, 0.3)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '10px',
            color: 'rgba(100, 200, 150, 0.9)',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            ● LIVE
          </div>
        )}

        {/* Header */}
        <div className="li-ns-header">
          <span className="li-ns-icon">🌙</span>
          <div className="li-ns-title-block">
            <h3 className="li-ns-title">What You Missed Today</h3>
            <p className="li-ns-date">{summary.date}</p>
          </div>
          <span className="li-ns-time">{time} IST</span>
        </div>

        {/* Content Grid */}
        <div className="li-ns-grid">
          {/* Markets Card */}
          <div className="li-ns-card li-ns-markets">
            <h4 className="li-ns-card-title">
              <span>📊</span> Markets
            </h4>
            <div className="li-ns-market-grid">
              <div className="li-ns-market-item">
                <span className="li-ns-market-label">NIFTY 50</span>
                <span className="li-ns-market-value">{formatNumber(markets.nifty?.value)}</span>
                <span className={`li-ns-market-change ${(markets.nifty?.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(markets.nifty?.change, markets.nifty?.percent)}
                </span>
              </div>
              <div className="li-ns-market-item">
                <span className="li-ns-market-label">SENSEX</span>
                <span className="li-ns-market-value">{formatNumber(markets.sensex?.value)}</span>
                <span className={`li-ns-market-change ${(markets.sensex?.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(markets.sensex?.change, markets.sensex?.percent)}
                </span>
              </div>
              <div className="li-ns-market-item">
                <span className="li-ns-market-label">BANK NIFTY</span>
                <span className="li-ns-market-value">{formatNumber(markets.bankNifty?.value)}</span>
                <span className={`li-ns-market-change ${(markets.bankNifty?.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(markets.bankNifty?.change, markets.bankNifty?.percent)}
                </span>
              </div>
              <div className="li-ns-market-item li-ns-fii">
                <span className="li-ns-market-label">FII</span>
                <span className="li-ns-market-value">₹{formatNumber(markets.fii?.value)} Cr</span>
                <span className={`li-ns-market-change ${markets.fii?.type === 'buyers' ? 'positive' : 'negative'}`}>
                  Net {markets.fii?.type || 'neutral'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Developments Card */}
          <div className="li-ns-card li-ns-developments">
            <h4 className="li-ns-card-title">
              <span>⚡</span> Key Developments
            </h4>
            {developments.length > 0 ? (
              <ul className="li-ns-list">
                {developments.map((item, i) => (
                  <li key={i} className="li-ns-list-item">
                    <span className="li-ns-list-icon">{item.icon}</span>
                    <span className="li-ns-list-text">{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'rgba(200, 215, 240, 0.5)', fontSize: '14px', margin: '16px 0' }}>
                No major developments today
              </p>
            )}
          </div>

          {/* Tomorrow's Watch Card */}
          <div className="li-ns-card li-ns-tomorrow">
            <h4 className="li-ns-card-title">
              <span>🔮</span> Tomorrow's Watch
            </h4>
            {tomorrow.length > 0 ? (
              <ul className="li-ns-list">
                {tomorrow.map((item, i) => (
                  <li key={i} className="li-ns-list-item li-ns-tomorrow-item">
                    <span className="li-ns-time-badge">{item.time}</span>
                    <span className="li-ns-list-text">{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'rgba(200, 215, 240, 0.5)', fontSize: '14px', margin: '16px 0' }}>
                No events scheduled for tomorrow
              </p>
            )}
          </div>
        </div>

        {/* WhatsApp Share + Opt-in */}
        <WhatsAppShare 
          summary={{
            title: `What You Missed Today - ${summary.date}`,
            marketSummary: {
              nifty: {
                close: formatNumber(markets.nifty?.value),
                change: (markets.nifty?.change || 0) > 0 ? `+${markets.nifty?.change}` : String(markets.nifty?.change || 0),
                changePercent: `${(markets.nifty?.percent || 0) > 0 ? '+' : ''}${markets.nifty?.percent || 0}%`,
              },
              sensex: {
                close: formatNumber(markets.sensex?.value),
                change: (markets.sensex?.change || 0) > 0 ? `+${markets.sensex?.change}` : String(markets.sensex?.change || 0),
                changePercent: `${(markets.sensex?.percent || 0) > 0 ? '+' : ''}${markets.sensex?.percent || 0}%`,
              },
              trend: (markets.nifty?.change || 0) > 0 ? 'bullish' : 'bearish',
            },
            topHeadlines: developments.map(d => ({
              headline: d.text,
              impact: 'Notable',
            })),
            keyTakeaways: [
              `Markets ${(markets.nifty?.change || 0) > 0 ? 'rallied' : 'declined'} with FII as net ${markets.fii?.type || 'neutral'}`,
              tomorrow.length > 0 ? `Key event: ${tomorrow[0]?.text}` : 'No major events tomorrow',
            ],
            tomorrowWatch: tomorrow.map(t => ({
              event: t.text,
              time: t.time,
            })),
          }}
          type="night"
          showOptIn={true}
        />
      </div>

      <style jsx>{`
        .li-night-summary {
          background: linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 12, 20, 0.98) 100%);
          border: 1px solid rgba(100, 140, 220, 0.20);
          border-radius: 24px;
          padding: 28px;
          margin-top: 24px;
          box-shadow:
            0 4px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(100, 140, 220, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .li-ns-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(100, 140, 220, 0.15);
        }

        .li-ns-icon {
          font-size: 32px;
          filter: drop-shadow(0 0 8px rgba(100, 140, 220, 0.5));
        }

        .li-ns-title-block {
          flex: 1;
        }

        .li-ns-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.95);
          letter-spacing: -0.02em;
        }

        .li-ns-date {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(180, 195, 230, 0.6);
        }

        .li-ns-time {
          font-size: 14px;
          color: rgba(100, 140, 220, 0.9);
          font-variant-numeric: tabular-nums;
          background: rgba(100, 140, 220, 0.12);
          padding: 6px 12px;
          border-radius: 8px;
        }

        .li-ns-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .li-ns-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .li-ns-markets {
            grid-column: span 2;
          }
        }

        @media (min-width: 1024px) {
          .li-ns-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .li-ns-markets {
            grid-column: span 1;
          }
        }

        .li-ns-card {
          background: rgba(20, 25, 40, 0.6);
          border: 1px solid rgba(100, 140, 220, 0.12);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .li-ns-card:hover {
          border-color: rgba(100, 140, 220, 0.25);
          box-shadow: 0 0 30px rgba(100, 140, 220, 0.08);
        }

        .li-ns-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(100, 140, 220, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .li-ns-market-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .li-ns-market-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .li-ns-market-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(180, 195, 230, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .li-ns-market-value {
          font-size: 20px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.95);
          font-variant-numeric: tabular-nums;
        }

        .li-ns-market-change {
          font-size: 13px;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        .li-ns-market-change.positive {
          color: rgba(80, 220, 140, 0.9);
        }

        .li-ns-market-change.negative {
          color: rgba(255, 100, 100, 0.9);
        }

        .li-ns-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .li-ns-list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: rgba(220, 230, 255, 0.85);
          line-height: 1.45;
        }

        .li-ns-list-icon {
          flex-shrink: 0;
          font-size: 16px;
        }

        .li-ns-tomorrow-item {
          align-items: center;
        }

        .li-ns-time-badge {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 600;
          color: rgba(100, 140, 220, 0.9);
          background: rgba(100, 140, 220, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
          font-variant-numeric: tabular-nums;
        }

        .li-ns-actions {
          display: flex;
          justify-content: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(100, 140, 220, 0.12);
        }

        .li-ns-share-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(180deg, rgba(100, 140, 220, 0.20) 0%, rgba(100, 140, 220, 0.08) 100%);
          border: 1px solid rgba(100, 140, 220, 0.30);
          border-radius: 12px;
          color: rgba(235, 242, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .li-ns-share-btn:hover {
          background: linear-gradient(180deg, rgba(100, 140, 220, 0.30) 0%, rgba(100, 140, 220, 0.15) 100%);
          border-color: rgba(100, 140, 220, 0.50);
          box-shadow: 0 0 20px rgba(100, 140, 220, 0.15);
        }
      `}</style>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getCurrentModeConfig, getISTTime } from '@/lib/live-intelligence/modes';
import WhatsAppShare from './WhatsAppShare';

/**
 * NightSummary - Special dashboard layout for 9PM-12AM
 * 
 * Shows: Markets recap, Key developments, Tomorrow's watch
 * Only renders when mode is 'night_summary'
 */

// Dummy data for demonstration (will be replaced with real data later)
const DUMMY_SUMMARY = {
  date: new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }),
  markets: {
    nifty: { value: 24987, change: 127, percent: 0.51 },
    sensex: { value: 82450, change: 412, percent: 0.50 },
    bankNifty: { value: 52340, change: 940, percent: 1.83 },
    fii: { value: 2847, type: 'buyers' },
  },
  developments: [
    { icon: '🏦', text: 'RBI signals potential rate cut in next policy meet' },
    { icon: '📈', text: 'SIP inflows hit all-time high of ₹21,000 Cr in December' },
    { icon: '📊', text: 'Q3 results season begins tomorrow with TCS, Infy' },
    { icon: '💹', text: 'IT sector leads gains, up 2.3% on strong guidance' },
  ],
  tomorrow: [
    { time: '09:15', text: 'TCS Q3 results (after market)' },
    { time: '09:15', text: 'Infosys Q3 results (after market)' },
    { time: '19:00', text: 'US CPI inflation data release' },
    { time: 'All day', text: 'Watch FII trend continuation' },
  ],
};

export default function NightSummary() {
  const [mode, setMode] = useState(null);
  const [time, setTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);

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

  // Only show in night_summary mode (9PM - 12AM)
  if (!isVisible || !mode) return null;

  const formatNumber = (num) => num.toLocaleString('en-IN');
  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatNumber(change)} (${sign}${percent.toFixed(2)}%)`;
  };

  return (
    <>
      <div className="li-night-summary">
        {/* Header */}
        <div className="li-ns-header">
          <span className="li-ns-icon">🌙</span>
          <div className="li-ns-title-block">
            <h3 className="li-ns-title">What You Missed Today</h3>
            <p className="li-ns-date">{DUMMY_SUMMARY.date}</p>
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
                <span className="li-ns-market-value">{formatNumber(DUMMY_SUMMARY.markets.nifty.value)}</span>
                <span className={`li-ns-market-change ${DUMMY_SUMMARY.markets.nifty.change >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(DUMMY_SUMMARY.markets.nifty.change, DUMMY_SUMMARY.markets.nifty.percent)}
                </span>
              </div>
              <div className="li-ns-market-item">
                <span className="li-ns-market-label">SENSEX</span>
                <span className="li-ns-market-value">{formatNumber(DUMMY_SUMMARY.markets.sensex.value)}</span>
                <span className={`li-ns-market-change ${DUMMY_SUMMARY.markets.sensex.change >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(DUMMY_SUMMARY.markets.sensex.change, DUMMY_SUMMARY.markets.sensex.percent)}
                </span>
              </div>
              <div className="li-ns-market-item">
                <span className="li-ns-market-label">BANK NIFTY</span>
                <span className="li-ns-market-value">{formatNumber(DUMMY_SUMMARY.markets.bankNifty.value)}</span>
                <span className={`li-ns-market-change ${DUMMY_SUMMARY.markets.bankNifty.change >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(DUMMY_SUMMARY.markets.bankNifty.change, DUMMY_SUMMARY.markets.bankNifty.percent)}
                </span>
              </div>
              <div className="li-ns-market-item li-ns-fii">
                <span className="li-ns-market-label">FII</span>
                <span className="li-ns-market-value">₹{formatNumber(DUMMY_SUMMARY.markets.fii.value)} Cr</span>
                <span className={`li-ns-market-change ${DUMMY_SUMMARY.markets.fii.type === 'buyers' ? 'positive' : 'negative'}`}>
                  Net {DUMMY_SUMMARY.markets.fii.type}
                </span>
              </div>
            </div>
          </div>

          {/* Key Developments Card */}
          <div className="li-ns-card li-ns-developments">
            <h4 className="li-ns-card-title">
              <span>⚡</span> Key Developments
            </h4>
            <ul className="li-ns-list">
              {DUMMY_SUMMARY.developments.map((item, i) => (
                <li key={i} className="li-ns-list-item">
                  <span className="li-ns-list-icon">{item.icon}</span>
                  <span className="li-ns-list-text">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tomorrow's Watch Card */}
          <div className="li-ns-card li-ns-tomorrow">
            <h4 className="li-ns-card-title">
              <span>🔮</span> Tomorrow's Watch
            </h4>
            <ul className="li-ns-list">
              {DUMMY_SUMMARY.tomorrow.map((item, i) => (
                <li key={i} className="li-ns-list-item li-ns-tomorrow-item">
                  <span className="li-ns-time-badge">{item.time}</span>
                  <span className="li-ns-list-text">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WhatsApp Share + Opt-in */}
        <WhatsAppShare 
          summary={{
            title: `What You Missed Today - ${DUMMY_SUMMARY.date}`,
            marketSummary: {
              nifty: {
                close: formatNumber(DUMMY_SUMMARY.markets.nifty.value),
                change: DUMMY_SUMMARY.markets.nifty.change > 0 ? `+${DUMMY_SUMMARY.markets.nifty.change}` : DUMMY_SUMMARY.markets.nifty.change,
                changePercent: `${DUMMY_SUMMARY.markets.nifty.percent > 0 ? '+' : ''}${DUMMY_SUMMARY.markets.nifty.percent}%`,
              },
              sensex: {
                close: formatNumber(DUMMY_SUMMARY.markets.sensex.value),
                change: DUMMY_SUMMARY.markets.sensex.change > 0 ? `+${DUMMY_SUMMARY.markets.sensex.change}` : DUMMY_SUMMARY.markets.sensex.change,
                changePercent: `${DUMMY_SUMMARY.markets.sensex.percent > 0 ? '+' : ''}${DUMMY_SUMMARY.markets.sensex.percent}%`,
              },
              trend: DUMMY_SUMMARY.markets.nifty.change > 0 ? 'bullish' : 'bearish',
            },
            topHeadlines: DUMMY_SUMMARY.developments.map(d => ({
              headline: d.text,
              impact: 'Notable',
            })),
            keyTakeaways: [
              `Markets ${DUMMY_SUMMARY.markets.nifty.change > 0 ? 'rallied' : 'declined'} with FII as net ${DUMMY_SUMMARY.markets.fii.type}`,
              'Q3 earnings season begins tomorrow',
            ],
            tomorrowWatch: DUMMY_SUMMARY.tomorrow.map(t => ({
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

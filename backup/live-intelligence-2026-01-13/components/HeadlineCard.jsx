'use client';

import { CATEGORIES, URGENCY_LEVELS, formatRelativeTime } from '@/lib/live-intelligence/headlines';

/**
 * HeadlineCard - Displays a single headline with category, urgency, and CTA
 * 
 * Format: [CATEGORY] → [WHAT HAPPENED] → [WHY IT MATTERS]
 */
export default function HeadlineCard({ headline, isActive = false }) {
  const category = CATEGORIES[headline.category];
  const urgency = URGENCY_LEVELS[headline.urgency];

  return (
    <>
      <div 
        className={`li-headline-card ${isActive ? 'active' : ''}`}
        style={{
          '--urgency-color': urgency?.color || 'rgba(170, 198, 255, 1)',
          '--urgency-dim': urgency?.colorDim || 'rgba(170, 198, 255, 0.25)',
          '--urgency-glow': urgency?.glow || 'rgba(170, 198, 255, 0.3)',
        }}
      >
        {/* Header: Category + Urgency + Time */}
        <div className="li-headline-header">
          <div className="li-headline-category">
            <span className="li-headline-cat-icon">{category?.icon}</span>
            <span className="li-headline-cat-label">{category?.label}</span>
          </div>
          
          {urgency?.key !== 'REGULAR' && (
            <span className={`li-headline-urgency ${urgency?.key?.toLowerCase()}`}>
              {urgency?.label}
            </span>
          )}
          
          <span className="li-headline-time">
            {formatRelativeTime(headline.timestamp)}
          </span>
        </div>

        {/* Main Content */}
        <div className="li-headline-body">
          <h4 className="li-headline-title">{headline.headline}</h4>
          <p className="li-headline-why">{headline.whyItMatters}</p>
        </div>

        {/* Footer: Data Point + Source */}
        <div className="li-headline-footer">
          {headline.dataPoint && (
            <span className="li-headline-data">{headline.dataPoint}</span>
          )}
          <span className="li-headline-source">Source: {headline.source}</span>
        </div>
      </div>

      <style jsx>{`
        .li-headline-card {
          background: linear-gradient(180deg, rgba(20, 25, 35, 0.90) 0%, rgba(12, 14, 20, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px 20px;
          transition: all 0.35s ease;
          opacity: 0.85;
        }

        .li-headline-card:hover,
        .li-headline-card.active {
          opacity: 1;
          border-color: var(--urgency-dim);
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.4),
            0 0 40px var(--urgency-glow);
          transform: translateY(-2px);
        }

        .li-headline-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .li-headline-category {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .li-headline-cat-icon {
          font-size: 14px;
        }

        .li-headline-cat-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(180, 195, 230, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .li-headline-urgency {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: var(--urgency-dim);
          color: var(--urgency-color);
        }

        .li-headline-urgency.breaking {
          animation: urgencyPulse 1.5s ease-in-out infinite;
        }

        @keyframes urgencyPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .li-headline-time {
          margin-left: auto;
          font-size: 11px;
          color: rgba(180, 195, 230, 0.5);
          font-variant-numeric: tabular-nums;
        }

        .li-headline-body {
          margin-bottom: 14px;
        }

        .li-headline-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.95);
          line-height: 1.4;
          letter-spacing: -0.01em;
        }

        .li-headline-why {
          margin: 0;
          font-size: 14px;
          color: rgba(200, 215, 240, 0.70);
          line-height: 1.5;
        }

        .li-headline-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .li-headline-data {
          font-size: 13px;
          font-weight: 600;
          color: var(--urgency-color);
          font-variant-numeric: tabular-nums;
        }

        .li-headline-source {
          font-size: 11px;
          color: rgba(180, 195, 230, 0.45);
        }

        @media (max-width: 640px) {
          .li-headline-card {
            padding: 14px 16px;
          }

          .li-headline-title {
            font-size: 15px;
          }

          .li-headline-why {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}

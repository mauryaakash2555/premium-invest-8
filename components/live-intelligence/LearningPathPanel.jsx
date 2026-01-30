'use client';

import { useMemo, useState, useCallback } from 'react';

const TOPICS = [
  {
    key: 'mf',
    label: 'Mutual Funds (MF)',
    tag: 'Core',
    time: '8 min',
    points: [
      'Index vs active: what you actually pay for',
      'How to pick: category → goal → time horizon',
      'Risk: drawdowns, not day-to-day noise',
    ],
  },
  {
    key: 'sip',
    label: 'SIP (Systematic Investing)',
    tag: 'Core',
    time: '6 min',
    points: [
      'Rupee-cost averaging and why it helps behavior',
      'Step-up SIP: the fastest “silent wealth” lever',
      'Common mistake: stopping on red months',
    ],
  },
  {
    key: 'lic',
    label: 'LIC & Life Insurance',
    tag: 'Protection',
    time: '7 min',
    points: [
      'Term cover first: protection before products',
      'Avoid mixing insurance + investment blindly',
      'How to read claim ratio + surrender terms',
    ],
  },
  {
    key: 'fd',
    label: 'Fixed Deposit (FD)',
    tag: 'Safety',
    time: '5 min',
    points: [
      'Post-tax return vs inflation reality check',
      'Tenure laddering for better flexibility',
      'When FD beats debt funds (and vice versa)',
    ],
  },
  {
    key: 'rd',
    label: 'Recurring Deposit (RD)',
    tag: 'Safety',
    time: '4 min',
    points: [
      'Best for disciplined short-term goals',
      'Interest rate math: don’t confuse nominal vs effective',
      'Goal buckets: emergency, planned spends, sinking funds',
    ],
  },
  {
    key: 'stocks',
    label: 'Stocks (Equity)',
    tag: 'Markets',
    time: '10 min',
    points: [
      'Valuation basics: P/E, growth, cash flows',
      'Diversification: sector + position sizing',
      'Risk control: drawdown limits, not predictions',
    ],
  },
  {
    key: 'trading',
    label: 'Trading (Short-Term)',
    tag: 'Advanced',
    time: '9 min',
    points: [
      'Leverage risk: the silent account killer',
      'Setup → entry → stop → size (process over vibes)',
      'Compliance: no tips, no promises, no “sure-shot”',
    ],
  },
  {
    key: 'pms',
    label: 'PMS (Portfolio Management)',
    tag: 'Premium',
    time: '9 min',
    points: [
      'Who it’s for: ticket size + patience + volatility tolerance',
      'Fees: fixed + performance; how to compare correctly',
      'What to ask: drawdowns, concentration, turnover',
    ],
  },
  {
    key: 'aif',
    label: 'AIF (Alternative Funds)',
    tag: 'Premium',
    time: '10 min',
    points: [
      'Categories I/II/III in plain English',
      'Liquidity + lock-ins: read the term sheet carefully',
      'Return drivers: credit, special situations, long/short',
    ],
  },
  {
    key: 'sif',
    label: 'SIF (Structured / Special Investment)',
    tag: 'Premium',
    time: '8 min',
    points: [
      'Payoff shape: capped upside vs downside buffers',
      'Issuer + product risk: understand what you’re buying',
      'When it fits: defined view + defined timeline',
    ],
  },
];

function TopicIcon({ tag }) {
  const t = String(tag || '').toLowerCase();
  if (t === 'premium') return '💎';
  if (t === 'core') return '🧠';
  if (t === 'markets') return '📈';
  if (t === 'protection') return '🛡️';
  if (t === 'safety') return '🏦';
  if (t === 'advanced') return '⚡';
  return '📘';
}

export default function LearningPathPanel() {
  const [openKey, setOpenKey] = useState('mf');

  const openTopic = useMemo(() => TOPICS.find((t) => t.key === openKey) || TOPICS[0], [openKey]);

  const onSelect = useCallback((key) => {
    setOpenKey((prev) => (prev === key ? prev : key));
  }, []);

  return (
    <section className="lp-wrap" aria-label="Learning Path">
      <div className="lp-header">
        <div className="lp-titleRow">
          <div className="lp-badge">Premium Learning</div>
          <div className="lp-title">Learning Path</div>
        </div>
        <div className="lp-sub">
          Clean, SEBI-safe explainers • fast, practical, beginner-first
        </div>
      </div>

      <div className="lp-grid">
        <div className="lp-list" role="list">
          {TOPICS.map((t) => {
            const active = t.key === openKey;
            return (
              <button
                key={t.key}
                type="button"
                className="lp-item"
                data-active={active ? '1' : '0'}
                onClick={() => onSelect(t.key)}
              >
                <div className="lp-itemLeft">
                  <div className="lp-icon" aria-hidden="true">{TopicIcon({ tag: t.tag })}</div>
                  <div className="lp-itemText">
                    <div className="lp-itemLabel">{t.label}</div>
                    <div className="lp-meta">
                      <span className="lp-tag">{t.tag}</span>
                      <span className="lp-dot" aria-hidden="true">•</span>
                      <span className="lp-time">{t.time}</span>
                    </div>
                  </div>
                </div>
                <div className="lp-chevron" aria-hidden="true">›</div>
              </button>
            );
          })}
        </div>

        <div className="lp-detail" aria-live="polite">
          <div className="lp-detailTop">
            <div className="lp-detailBadge">Now Learning</div>
            <div className="lp-detailTitle">{openTopic.label}</div>
            <div className="lp-detailHint">3 crisp takeaways (no hype, no promises)</div>
          </div>

          <div className="lp-points">
            {openTopic.points.map((p, idx) => (
              <div key={idx} className="lp-point">
                <span className="lp-bullet" aria-hidden="true" />
                <span className="lp-pointText">{p}</span>
              </div>
            ))}
          </div>

          <div className="lp-actions">
            <a className="lp-cta" href="/contact">
              Talk to an Advisor
            </a>
            <a className="lp-ghost" href="/live-intelligence">
              Open Live Intelligence
            </a>
          </div>

          <div className="lp-disclaimer">
            Educational only. Not investment advice.
          </div>
        </div>
      </div>

      <style jsx>{`
        .lp-wrap {
          border-radius: 18px;
          border: 1px solid rgba(170, 198, 255, 0.16);
          background: linear-gradient(180deg, rgba(14, 18, 28, 0.88) 0%, rgba(8, 10, 14, 0.92) 100%);
          box-shadow: 0 22px 70px rgba(0, 0, 0, 0.55);
          overflow: hidden;
        }

        .lp-header {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.10);
          background: radial-gradient(900px 300px at 30% 0%, rgba(170, 198, 255, 0.10), rgba(0,0,0,0));
        }

        .lp-titleRow {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lp-badge {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(180, 120, 220, 0.28);
          background: rgba(180, 120, 220, 0.10);
          color: rgba(230, 240, 255, 0.92);
        }

        .lp-title {
          font-size: 15px;
          font-weight: 650;
          letter-spacing: -0.01em;
          color: rgba(235, 245, 255, 0.96);
        }

        .lp-sub {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(180, 200, 230, 0.62);
        }

        .lp-grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        .lp-list {
          display: grid;
          grid-template-columns: 1fr;
          padding: 10px;
          gap: 8px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.08);
          background: rgba(0, 0, 0, 0.35);
        }

        .lp-item {
          width: 100%;
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(20, 30, 50, 0.48);
          color: rgba(235, 245, 255, 0.92);
          padding: 12px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }

        .lp-item:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 198, 255, 0.26);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45);
          background: rgba(20, 30, 50, 0.62);
        }

        .lp-item[data-active='1'] {
          border-color: rgba(170, 198, 255, 0.42);
          box-shadow: 0 0 26px rgba(170, 198, 255, 0.10);
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.16), rgba(20, 30, 50, 0.55));
        }

        .lp-itemLeft {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .lp-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(170, 198, 255, 0.10);
          border: 1px solid rgba(170, 198, 255, 0.14);
          flex: 0 0 auto;
        }

        .lp-itemText {
          min-width: 0;
        }

        .lp-itemLabel {
          font-size: 13px;
          font-weight: 600;
          color: rgba(235, 245, 255, 0.94);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lp-meta {
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(180, 200, 230, 0.60);
        }

        .lp-tag {
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid rgba(170, 198, 255, 0.16);
          background: rgba(170, 198, 255, 0.08);
          color: rgba(200, 220, 255, 0.78);
        }

        .lp-dot {
          opacity: 0.55;
        }

        .lp-chevron {
          font-size: 22px;
          line-height: 1;
          color: rgba(170, 198, 255, 0.55);
          flex: 0 0 auto;
        }

        .lp-detail {
          padding: 16px 18px 18px;
          background: radial-gradient(800px 400px at 70% 0%, rgba(170, 198, 255, 0.10), rgba(0,0,0,0));
        }

        .lp-detailTop {
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.10);
        }

        .lp-detailBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(170, 198, 255, 0.22);
          background: rgba(170, 198, 255, 0.10);
          color: rgba(230, 240, 255, 0.92);
        }

        .lp-detailTitle {
          margin-top: 10px;
          font-size: 15px;
          font-weight: 650;
          letter-spacing: -0.01em;
          color: rgba(235, 245, 255, 0.96);
        }

        .lp-detailHint {
          margin-top: 5px;
          font-size: 12px;
          color: rgba(180, 200, 230, 0.60);
        }

        .lp-points {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .lp-point {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10, 14, 22, 0.55);
        }

        .lp-bullet {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(170, 198, 255, 0.65);
          box-shadow: 0 0 14px rgba(170, 198, 255, 0.22);
          margin-top: 4px;
          flex: 0 0 auto;
        }

        .lp-pointText {
          font-size: 13px;
          line-height: 1.45;
          color: rgba(230, 240, 255, 0.86);
        }

        .lp-actions {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lp-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.28);
          background: rgba(170, 198, 255, 0.16);
          color: rgba(235, 245, 255, 0.95);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }

        .lp-cta:hover {
          transform: translateY(-1px);
          background: rgba(170, 198, 255, 0.22);
          border-color: rgba(170, 198, 255, 0.40);
        }

        .lp-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.16);
          background: rgba(0, 0, 0, 0.20);
          color: rgba(200, 220, 255, 0.78);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }

        .lp-ghost:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 198, 255, 0.26);
          background: rgba(20, 30, 50, 0.35);
        }

        .lp-disclaimer {
          margin-top: 12px;
          font-size: 10.5px;
          color: rgba(180, 200, 230, 0.50);
        }

        @media (min-width: 900px) {
          .lp-grid {
            grid-template-columns: 1.05fr 1fr;
          }

          .lp-list {
            border-bottom: none;
            border-right: 1px solid rgba(170, 198, 255, 0.08);
          }
        }
      `}</style>
    </section>
  );
}

'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import QuickLearn from '@/components/live-intelligence/QuickLearn';

const STORAGE_KEY = 'li_learning_path_v1';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState('daily'); // 'daily' | 'path'
  const [openKey, setOpenKey] = useState('mf');
  const [completed, setCompleted] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') {
        if (parsed.openKey && typeof parsed.openKey === 'string') setOpenKey(parsed.openKey);
        if (parsed.completed && typeof parsed.completed === 'object') setCompleted(parsed.completed);
        if (parsed.mode && (parsed.mode === 'daily' || parsed.mode === 'path')) setMode(parsed.mode);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ openKey, completed, mode, updatedAt: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
  }, [openKey, completed, mode]);

  const openTopic = useMemo(() => TOPICS.find((t) => t.key === openKey) || TOPICS[0], [openKey]);

  const completedCount = useMemo(() => {
    const keys = Object.keys(completed || {});
    return keys.reduce((acc, k) => acc + (completed?.[k] ? 1 : 0), 0);
  }, [completed]);

  const level = useMemo(() => {
    // Simple, kid-friendly progress levels.
    const n = completedCount;
    if (n >= 9) return 'Master';
    if (n >= 6) return 'Pro';
    if (n >= 3) return 'Rising';
    if (n >= 1) return 'Starter';
    return 'Beginner';
  }, [completedCount]);

  const onSelect = useCallback((key) => {
    setOpenKey((prev) => (prev === key ? prev : key));
  }, []);

  const markDone = useCallback(() => {
    setCompleted((prev) => {
      const next = { ...(prev || {}) };
      next[openTopic.key] = true;
      return next;
    });
    setToast(`Achievement unlocked: ${openTopic.tag} • ${openTopic.time}`);
    window.clearTimeout((window).__li_lp_toast_timer);
    (window).__li_lp_toast_timer = window.setTimeout(() => setToast(''), 1400);
  }, [openTopic.key, openTopic.tag, openTopic.time]);

  return (
    <section className="lp-wrap" aria-label="Premium Learning">
      <div className="lp-header">
        <div className="lp-titleRow">
          <div className="lp-badge">Premium Learning</div>
          <div className="lp-title">Learn in 2 ways</div>
          <div className="lp-progress">Level: <span>{level}</span> • {completedCount}/{TOPICS.length} completed</div>
        </div>
        <div className="lp-sub">
          Tap one mode. Keep it simple. Education-only.
        </div>
      </div>

      {!isExpanded ? (
        <div className="lp-choose">
          <button
            type="button"
            className="lp-modeCard"
            onClick={() => {
              setMode('daily');
              setIsExpanded(true);
            }}
          >
            <div className="lp-modeTop">
              <div className="lp-modeIcon" aria-hidden="true">⚡</div>
              <div className="lp-modeName">Daily (30s)</div>
            </div>
            <div className="lp-modeDesc">3 micro-lessons. Just press “Got it!”.</div>
            <div className="lp-modeHint">Best if you’re busy</div>
          </button>

          <button
            type="button"
            className="lp-modeCard"
            onClick={() => {
              setMode('path');
              setIsExpanded(true);
            }}
          >
            <div className="lp-modeTop">
              <div className="lp-modeIcon" aria-hidden="true">🧠</div>
              <div className="lp-modeName">Continue Path</div>
            </div>
            <div className="lp-modeDesc">Pick a topic → 3 takeaways → mark complete.</div>
            <div className="lp-modeHint">Unlock levels as you finish</div>
          </button>
        </div>
      ) : (
        <>
          <div className="lp-tabs">
            <button
              type="button"
              className="lp-tab"
              data-active={mode === 'daily' ? '1' : '0'}
              onClick={() => setMode('daily')}
            >
              Daily 30s
            </button>
            <button
              type="button"
              className="lp-tab"
              data-active={mode === 'path' ? '1' : '0'}
              onClick={() => setMode('path')}
            >
              Continue Path
            </button>
            <button type="button" className="lp-close" onClick={() => setIsExpanded(false)}>Hide</button>
          </div>

          {mode === 'daily' ? (
            <div className="lp-daily">
              <QuickLearn />
              <div className="lp-disclaimer">Educational only. Not investment advice.</div>
            </div>
          ) : (
            <div className="lp-grid">
              <div className="lp-list" role="list">
                {TOPICS.map((t) => {
                  const active = t.key === openKey;
                  const done = !!completed?.[t.key];
                  return (
                    <button
                      key={t.key}
                      type="button"
                      className="lp-item"
                      data-active={active ? '1' : '0'}
                      data-done={done ? '1' : '0'}
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
                            {done ? <span className="lp-done">Done</span> : null}
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
                  {!completed?.[openTopic.key] ? (
                    <button type="button" className="lp-cta" onClick={markDone}>
                      Mark Complete
                    </button>
                  ) : (
                    <div className="lp-complete">✅ Completed</div>
                  )}
                  <a className="lp-ghost" href="/live-intelligence">Open Live Intelligence</a>
                </div>

                <div className="lp-disclaimer">Educational only. Not investment advice.</div>
              </div>
            </div>
          )}
        </>
      )}

      {toast ? <div className="lp-toast" role="status">{toast}</div> : null}

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

        .lp-progress {
          margin-left: auto;
          font-size: 11px;
          color: rgba(180, 200, 230, 0.62);
          display: inline-flex;
          gap: 6px;
          align-items: baseline;
          white-space: nowrap;
        }
        .lp-progress span {
          color: rgba(235, 245, 255, 0.92);
          font-weight: 800;
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

        .lp-choose {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 14px 16px 16px;
        }

        .lp-modeCard {
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: linear-gradient(135deg, rgba(20, 28, 44, 0.55) 0%, rgba(10, 10, 14, 0.65) 100%);
          padding: 14px 14px;
          cursor: pointer;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .lp-modeCard:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 198, 255, 0.26);
          box-shadow: 0 20px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(170,198,255,0.08) inset;
        }
        .lp-modeTop {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-modeIcon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(170, 198, 255, 0.08);
          border: 1px solid rgba(170, 198, 255, 0.16);
          font-size: 16px;
        }
        .lp-modeName {
          font-size: 14px;
          font-weight: 850;
          color: rgba(235, 245, 255, 0.96);
        }
        .lp-modeDesc {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.45;
          color: rgba(200, 215, 240, 0.62);
        }
        .lp-modeHint {
          margin-top: 10px;
          font-size: 11px;
          color: rgba(200, 215, 240, 0.45);
        }

        .lp-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px 0;
        }
        .lp-tab {
          appearance: none;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10,10,12,0.35);
          color: rgba(235,242,255,0.88);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }
        .lp-tab[data-active='1'] {
          border-color: rgba(170, 198, 255, 0.30);
          background: rgba(170, 198, 255, 0.10);
        }
        .lp-close {
          margin-left: auto;
          appearance: none;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(10,10,12,0.35);
          color: rgba(235,242,255,0.78);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
        }

        .lp-daily {
          padding: 14px 16px 16px;
        }

        .lp-done {
          margin-left: 10px;
          font-size: 11px;
          color: rgba(100, 255, 150, 0.80);
          border: 1px solid rgba(100, 255, 150, 0.22);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .lp-complete {
          font-size: 12px;
          color: rgba(100, 255, 150, 0.88);
          font-weight: 900;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(100, 255, 150, 0.18);
          background: rgba(100, 255, 150, 0.08);
        }

        .lp-toast {
          position: absolute;
          right: 14px;
          bottom: 14px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(10,10,12,0.78);
          border: 1px solid rgba(170,198,255,0.18);
          color: rgba(235,242,255,0.88);
          font-size: 12px;
          font-weight: 850;
          box-shadow: 0 18px 80px rgba(0,0,0,0.55);
        }

        .lp-wrap { position: relative; }

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

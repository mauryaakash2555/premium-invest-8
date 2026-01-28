'use client';

import { useEffect, useMemo, useState } from 'react';

import { useFIIDIIFlow, useIndiaVIX } from '@/hooks/useMarketData';
import { PortfolioSnapshotButton } from '@/components/PortfolioSnapshotModal';
import { AddGoalButton } from '@/components/GoalModal';

type AlertTone = 'high' | 'medium' | 'info';

type AlertItem = {
  tone: AlertTone;
  title: string;
  detail: string;
  action?: 'snapshot' | 'goal';
};

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readSnapshotOk(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = safeJsonParse<any>(window.localStorage.getItem('li_portfolio_snapshot_v1'), null);
  return Boolean(raw && typeof raw === 'object' && typeof raw.investedL === 'number' && typeof raw.currentL === 'number' && typeof raw.updatedAt === 'string');
}

function readWatchlistCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = safeJsonParse<any>(window.localStorage.getItem('li_portfolio_context_v1'), null);
  const list = Array.isArray(raw?.tickers) ? raw.tickers : Array.isArray(raw?.symbols) ? raw.symbols : [];
  return Array.isArray(list) ? list.filter(Boolean).length : 0;
}

function readGoalsCount(): number {
  if (typeof window === 'undefined') return 0;
  const list = safeJsonParse<any>(window.localStorage.getItem('li_goals_v1'), null);
  if (Array.isArray(list)) return list.length;
  const legacy = safeJsonParse<any>(window.localStorage.getItem('investmentGoal'), null);
  return legacy && typeof legacy === 'object' ? 1 : 0;
}

function toneStyles(tone: AlertTone) {
  if (tone === 'high') {
    return {
      badgeBg: 'rgba(255, 100, 100, 0.10)',
      badgeBorder: '1px solid rgba(255, 100, 100, 0.22)',
      badgeColor: 'rgba(255, 160, 160, 0.95)',
      dot: 'rgba(255, 100, 100, 0.85)',
    };
  }
  if (tone === 'medium') {
    return {
      badgeBg: 'rgba(255, 210, 110, 0.10)',
      badgeBorder: '1px solid rgba(255, 210, 110, 0.22)',
      badgeColor: 'rgba(255, 225, 160, 0.95)',
      dot: 'rgba(255, 210, 110, 0.85)',
    };
  }
  return {
    badgeBg: 'rgba(170,198,255,0.10)',
    badgeBorder: '1px solid rgba(170,198,255,0.14)',
    badgeColor: 'rgba(170,198,255,0.90)',
    dot: 'rgba(140,190,255,0.85)',
  };
}

export default function SmartAlertsPanel() {
  const fii = useFIIDIIFlow(60_000);
  const vix = useIndiaVIX(60_000);

  const [snapshotOk, setSnapshotOk] = useState(true);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setSnapshotOk(readSnapshotOk());
      setWatchlistCount(readWatchlistCount());
      setGoalsCount(readGoalsCount());
    };
    sync();

    window.addEventListener('li-portfolio-snapshot-updated', sync as any);
    window.addEventListener('li-portfolio-updated', sync as any);
    window.addEventListener('li-goal-updated', sync as any);

    return () => {
      window.removeEventListener('li-portfolio-snapshot-updated', sync as any);
      window.removeEventListener('li-portfolio-updated', sync as any);
      window.removeEventListener('li-goal-updated', sync as any);
    };
  }, []);

  const alerts = useMemo<AlertItem[]>(() => {
    const out: AlertItem[] = [];

    if (!snapshotOk) {
      out.push({
        tone: 'high',
        title: 'Portfolio snapshot not set',
        detail: 'Set your invested + current value to unlock portfolio KPIs and context.',
        action: 'snapshot',
      });
    }

    if (watchlistCount === 0) {
      out.push({
        tone: 'medium',
        title: 'Watchlist is empty',
        detail: 'Add tickers to highlight relevant deals and headlines across the hub.',
      });
    }

    if (goalsCount === 0) {
      out.push({
        tone: 'info',
        title: 'No goals saved yet',
        detail: 'Add a goal so the hub can stay oriented to intent over noise.',
        action: 'goal',
      });
    }

    if (fii.stale || fii.error) {
      out.push({
        tone: 'info',
        title: 'Market flow data reconnecting',
        detail: 'Showing best-effort snapshot while data refreshes.',
      });
    }

    if (typeof vix.data?.vixLast === 'number' && vix.data.vixLast >= 16) {
      out.push({
        tone: 'info',
        title: `Volatility elevated (VIX ${vix.data.vixLast.toFixed(2)})`,
        detail: 'Higher volatility typically means wider intraday swings.',
      });
    }

    return out.slice(0, 3);
  }, [snapshotOk, watchlistCount, goalsCount, fii.stale, fii.error, vix.data?.vixLast]);

  if (!alerts.length) return null;

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
      }}
      aria-label="Smart alerts"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em' }}>
            Smart Alerts
          </div>
          <div style={{ marginTop: 3, color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
            Priority items detected from your context
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {alerts.some((a) => a.action === 'snapshot') ? (
            <PortfolioSnapshotButton
              style={{
                appearance: 'none',
                border: '1px solid rgba(170,198,255,0.18)',
                background: 'rgba(10,10,12,0.55)',
                color: 'rgba(235,242,255,0.88)',
                padding: '7px 10px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 800,
              }}
            />
          ) : null}

          {alerts.some((a) => a.action === 'goal') ? (
            <AddGoalButton
              style={{
                appearance: 'none',
                border: '1px solid rgba(170,198,255,0.18)',
                background: 'rgba(10,10,12,0.55)',
                color: 'rgba(235,242,255,0.88)',
                padding: '7px 10px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 800,
              }}
            />
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.map((a, idx) => {
          const s = toneStyles(a.tone);
          return (
            <div
              key={`${a.tone}-${idx}`}
              style={{
                padding: '10px 10px',
                borderRadius: 12,
                background: 'rgba(10,10,12,0.45)',
                border: '1px solid rgba(170,198,255,0.10)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: s.dot, boxShadow: `0 0 10px ${s.dot}` }} aria-hidden="true" />
                  <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 900 }}>
                    {a.title}
                  </div>
                </div>
                <div style={{ marginTop: 3, color: 'rgba(200,215,240,0.48)', fontSize: 11, lineHeight: 1.35 }}>
                  {a.detail}
                </div>
              </div>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: s.badgeBg,
                  border: s.badgeBorder,
                  color: s.badgeColor,
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                {a.tone === 'high' ? 'HIGH' : a.tone === 'medium' ? 'MED' : 'INFO'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

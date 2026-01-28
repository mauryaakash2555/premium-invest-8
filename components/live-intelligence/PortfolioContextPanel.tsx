'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { AddGoalButton } from '@/components/GoalModal';
import { PortfolioSnapshotButton } from '@/components/PortfolioSnapshotModal';

type PortfolioSnapshot = {
  investedL: number | null;
  currentL: number | null;
  updatedAt: string | null;
};

type Allocations = {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
};

type Goal = {
  id?: string;
  name?: string;
  targetAmount?: string;
  timeline?: string;
  category?: string;
  savedAt?: string;
};

const KEY_TICKERS = 'li_portfolio_context_v1';
const KEY_SNAPSHOT = 'li_portfolio_snapshot_v1';
const KEY_ALLOC = 'li_allocations_v1';
const KEY_GOALS = 'li_goals_v1';
const KEY_GOAL_LEGACY = 'investmentGoal';

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeSymbol(sym: unknown): string {
  const s = String(sym || '').trim();
  if (!s) return '';
  return s.split(/[-\s]/)[0].toUpperCase();
}

function toTvSymbol(ticker: string): string {
  const t = normalizeSymbol(ticker);
  if (!t) return 'NSE:NIFTY';
  if (t.includes(':')) return t;
  return `NSE:${t}`;
}

function readTickers(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = safeJsonParse<any>(window.localStorage.getItem(KEY_TICKERS), null);
  const list = Array.isArray(raw?.tickers)
    ? raw.tickers
    : Array.isArray(raw?.symbols)
      ? raw.symbols
      : [];
  return (list || []).map(normalizeSymbol).filter(Boolean).slice(0, 20);
}

function readSnapshot(): PortfolioSnapshot {
  if (typeof window === 'undefined') return { investedL: null, currentL: null, updatedAt: null };
  const raw = safeJsonParse<any>(window.localStorage.getItem(KEY_SNAPSHOT), null);
  const investedL = typeof raw?.investedL === 'number' && Number.isFinite(raw.investedL) ? raw.investedL : null;
  const currentL = typeof raw?.currentL === 'number' && Number.isFinite(raw.currentL) ? raw.currentL : null;
  const updatedAt = typeof raw?.updatedAt === 'string' ? raw.updatedAt : null;
  return { investedL, currentL, updatedAt };
}

function readAllocations(): Allocations {
  const base: Allocations = { equity: 0, debt: 0, gold: 0, cash: 0 };
  if (typeof window === 'undefined') return base;
  const raw = safeJsonParse<any>(window.localStorage.getItem(KEY_ALLOC), null);
  if (!raw || typeof raw !== 'object') return base;
  return {
    equity: Number.isFinite(Number(raw.equity)) ? Math.max(0, Math.min(100, Math.round(Number(raw.equity)))) : 0,
    debt: Number.isFinite(Number(raw.debt)) ? Math.max(0, Math.min(100, Math.round(Number(raw.debt)))) : 0,
    gold: Number.isFinite(Number(raw.gold)) ? Math.max(0, Math.min(100, Math.round(Number(raw.gold)))) : 0,
    cash: Number.isFinite(Number(raw.cash)) ? Math.max(0, Math.min(100, Math.round(Number(raw.cash)))) : 0,
  };
}

function readGoals(): Goal[] {
  if (typeof window === 'undefined') return [];

  const list = safeJsonParse<any>(window.localStorage.getItem(KEY_GOALS), null);
  if (Array.isArray(list)) return list as Goal[];

  const legacy = safeJsonParse<any>(window.localStorage.getItem(KEY_GOAL_LEGACY), null);
  if (legacy && typeof legacy === 'object') return [legacy as Goal];

  return [];
}

function formatMoneyL(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `₹${value.toFixed(1)}L`;
}

function formatUpdatedAt(iso: string | null): string {
  if (!iso) return 'Not set';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Not set';
  }
}

export default function PortfolioContextPanel(props: {
  onSelectSymbol?: (symbol: string) => void;
  style?: CSSProperties;
}) {
  const [tickers, setTickers] = useState<string[]>(() => readTickers());
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(() => readSnapshot());
  const [alloc, setAlloc] = useState<Allocations>(() => readAllocations());
  const [goals, setGoals] = useState<Goal[]>(() => readGoals());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncAll = () => {
      setTickers(readTickers());
      setSnapshot(readSnapshot());
      setAlloc(readAllocations());
      setGoals(readGoals());
    };

    const onStorage = (e: StorageEvent) => {
      if (!e) return;
      if ([KEY_TICKERS, KEY_SNAPSHOT, KEY_ALLOC, KEY_GOALS, KEY_GOAL_LEGACY].includes(String(e.key))) syncAll();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('li-portfolio-updated', syncAll as any);
    window.addEventListener('li-portfolio-snapshot-updated', syncAll as any);
    window.addEventListener('li-goal-updated', syncAll as any);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('li-portfolio-updated', syncAll as any);
      window.removeEventListener('li-portfolio-snapshot-updated', syncAll as any);
      window.removeEventListener('li-goal-updated', syncAll as any);
    };
  }, []);

  const goalPrimary = useMemo(() => (goals && goals.length ? goals[0] : null), [goals]);
  const hasSnapshot = snapshot.currentL != null || snapshot.investedL != null;

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
        ...props.style,
      }}
      aria-label="Portfolio context"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ color: 'rgba(235,242,255,0.94)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Portfolio Context
            </div>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 999,
                background: 'rgba(170,198,255,0.10)',
                border: '1px solid rgba(170,198,255,0.14)',
                color: 'rgba(170,198,255,0.90)',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.08em',
              }}
              title="Uses locally-saved snapshot, allocation, and tickers"
            >
              LOCAL
            </span>
          </div>
          <div style={{ marginTop: 3, color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
            Snapshot + allocation + watchlist (saved locally)
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <PortfolioSnapshotButton
            style={{
              appearance: 'none',
              border: '1px solid rgba(170,198,255,0.18)',
              background: 'rgba(10,10,12,0.55)',
              color: 'rgba(235,242,255,0.88)',
              padding: '8px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
          />
          <AddGoalButton
            style={{
              appearance: 'none',
              border: '1px solid rgba(170,198,255,0.18)',
              background: 'rgba(10,10,12,0.55)',
              color: 'rgba(235,242,255,0.88)',
              padding: '8px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 700 }}>Snapshot</div>
          <div style={{ marginTop: 8, color: 'rgba(245,248,255,0.92)', fontSize: 13, fontWeight: 800 }}>
            {formatMoneyL(snapshot.currentL)}
            <span style={{ marginLeft: 8, color: 'rgba(200,215,240,0.45)', fontSize: 11, fontWeight: 700 }}>
              current
            </span>
          </div>
          <div style={{ marginTop: 4, color: 'rgba(200,215,240,0.55)', fontSize: 11 }}>
            Invested: <span style={{ color: 'rgba(200,215,240,0.82)', fontWeight: 800 }}>{formatMoneyL(snapshot.investedL)}</span>
          </div>
          <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.40)', fontSize: 10.5 }}>
            Updated: {formatUpdatedAt(snapshot.updatedAt)}
          </div>
          {!hasSnapshot ? (
            <div style={{ marginTop: 8, color: 'rgba(200,215,240,0.35)', fontSize: 11, lineHeight: 1.35 }}>
              Set snapshot to enable portfolio KPIs.
            </div>
          ) : null}
        </div>

        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 700 }}>Allocation</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>Equity <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>{alloc.equity}%</span></div>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>Debt <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>{alloc.debt}%</span></div>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>Gold <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>{alloc.gold}%</span></div>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>Cash <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>{alloc.cash}%</span></div>
          </div>
          <div style={{ marginTop: 8, color: 'rgba(200,215,240,0.35)', fontSize: 10.5, lineHeight: 1.35 }}>
            Adjust allocation in the panel above.
          </div>
        </div>

        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 700 }}>Goals</div>
          <div style={{ marginTop: 8, color: 'rgba(245,248,255,0.90)', fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {goalPrimary?.name ? goalPrimary.name : 'Not set'}
          </div>
          <div style={{ marginTop: 4, color: 'rgba(200,215,240,0.55)', fontSize: 11 }}>
            Target: <span style={{ color: 'rgba(200,215,240,0.82)', fontWeight: 800 }}>{goalPrimary?.targetAmount ? `₹${goalPrimary.targetAmount}` : '—'}</span>
          </div>
          <div style={{ marginTop: 4, color: 'rgba(200,215,240,0.40)', fontSize: 10.5 }}>
            {goals.length ? `${goals.length} saved` : 'Add a goal to track intent'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>
            WATCHLIST
          </div>
          <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
            {tickers.length ? `${tickers.length} ticker${tickers.length === 1 ? '' : 's'}` : 'Not set'}
          </div>
        </div>

        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tickers.length ? (
            tickers.slice(0, 12).map((t) => (
              <div
                key={t}
                style={{
                  padding: '10px 10px',
                  borderRadius: 12,
                  background: 'rgba(10,10,12,0.45)',
                  border: '1px solid rgba(170,198,255,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 900, letterSpacing: '0.02em' }}>{t}</div>
                  <div style={{ marginTop: 2, color: 'rgba(200,215,240,0.40)', fontSize: 10.5 }}>
                    Quick chart + context
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => props.onSelectSymbol?.(toTvSymbol(t))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: 'pointer',
                      background: 'rgba(170,198,255,0.10)',
                      border: '1px solid rgba(170,198,255,0.14)',
                      color: 'rgba(210,225,255,0.90)',
                    }}
                    title="Load in the chart below"
                  >
                    Load Chart
                  </button>

                  <a
                    href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(toTvSymbol(t))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 900,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: 'rgba(200,215,240,0.82)',
                      textDecoration: 'none',
                    }}
                    title="Open TradingView"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '12px 12px',
                borderRadius: 12,
                background: 'rgba(10,10,12,0.45)',
                border: '1px dashed rgba(170,198,255,0.12)',
                color: 'rgba(200,215,240,0.45)',
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              Add your tickers in “Your tickers” to highlight relevant headlines & deals.
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/client-portal"
            style={{
              color: 'rgba(170,198,255,0.78)',
              fontSize: 11,
              textDecoration: 'none',
            }}
            title="Broker sync (beta)"
          >
            Broker sync (beta) ↗
          </a>
          <a
            href="/contact?subject=Portfolio%20Sync%20Waitlist"
            style={{
              color: 'rgba(170,198,255,0.78)',
              fontSize: 11,
              textDecoration: 'none',
            }}
            title="Join waitlist"
          >
            Join waitlist ↗
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

type Snapshot = {
  investedL?: number;
  currentL?: number;
  updatedAt?: string;
};

type Goal = {
  id: string;
  name: string;
};

type Context = {
  tickers?: string[];
};

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readSnapshot(): Snapshot | null {
  if (typeof window === 'undefined') return null;
  const raw = safeJsonParse<any>(window.localStorage.getItem('li_portfolio_snapshot_v1'), null);
  if (!raw || typeof raw !== 'object') return null;
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : '';
  const investedL = typeof raw.investedL === 'number' ? raw.investedL : undefined;
  const currentL = typeof raw.currentL === 'number' ? raw.currentL : undefined;
  return { investedL, currentL, updatedAt };
}

function readGoalsCount(): number {
  if (typeof window === 'undefined') return 0;
  const list = safeJsonParse<any>(window.localStorage.getItem('li_goals_v1'), null);
  if (Array.isArray(list)) return list.filter((g) => g && g.name).length;
  const legacy = safeJsonParse<any>(window.localStorage.getItem('investmentGoal'), null);
  if (legacy && typeof legacy === 'object' && legacy.name) return 1;
  return 0;
}

function readWatchlistCount(): number {
  if (typeof window === 'undefined') return 0;
  const ctx = safeJsonParse<Context | null>(window.localStorage.getItem('li_portfolio_context_v1'), null);
  if (!ctx || !Array.isArray(ctx.tickers)) return 0;
  return ctx.tickers.filter(Boolean).length;
}

function readLastActive(): string | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem('li_last_active_v1');
  return v ? v : null;
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function ConciergeBriefPanel(props: { style?: CSSProperties }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [goalsCount, setGoalsCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [lastActive, setLastActive] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setSnapshot(readSnapshot());
      setGoalsCount(readGoalsCount());
      setWatchlistCount(readWatchlistCount());
      setLastActive(readLastActive());
    };
    sync();
    const onStorage = (e: StorageEvent) => {
      if (!e) return;
      if (
        e.key === 'li_portfolio_snapshot_v1' ||
        e.key === 'li_goals_v1' ||
        e.key === 'investmentGoal' ||
        e.key === 'li_portfolio_context_v1' ||
        e.key === 'li_last_active_v1'
      ) {
        sync();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('li-goal-updated', sync as any);
    window.addEventListener('li-portfolio-updated', sync as any);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('li-goal-updated', sync as any);
      window.removeEventListener('li-portfolio-updated', sync as any);
    };
  }, []);

  const brief = useMemo(() => {
    const items: string[] = [];

    if (!snapshot?.updatedAt) items.push('Set a portfolio snapshot');
    if (watchlistCount === 0) items.push('Add your watchlist');
    if (goalsCount === 0) items.push('Add a goal');

    if (items.length === 0) {
      return {
        title: 'Concierge Brief',
        subtitle: 'Context is set. Use alerts + today’s intelligence for tracking.',
        items: ['Snapshot, watchlist, and goal are present'],
        tone: 'good' as const,
      };
    }

    return {
      title: 'Concierge Brief',
      subtitle: 'Quick setup to unlock better relevance.',
      items,
      tone: 'neutral' as const,
    };
  }, [snapshot?.updatedAt, watchlistCount, goalsCount]);

  const snapshotAge = relativeTime(snapshot?.updatedAt || null);
  const lastActiveAge = relativeTime(lastActive);

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(120, 190, 255, 0.08) 0%, rgba(140, 220, 180, 0.04) 100%)',
        border: '1px solid rgba(140,220,180,0.14)',
        ...props.style,
      }}
      aria-label="Concierge brief"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
            {brief.title}
          </div>
          <div style={{ marginTop: 4, color: 'rgba(245,248,255,0.90)', fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>
            {brief.subtitle}
          </div>
        </div>
        <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
          Snapshot: {snapshotAge} • Active: {lastActiveAge}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {brief.items.slice(0, 3).map((t) => (
          <div
            key={t}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(10,10,12,0.42)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(235,242,255,0.85)',
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
            <span style={{ color: 'rgba(200,215,240,0.45)', fontSize: 11, fontWeight: 700 }}>
              {watchlistCount} tickers • {goalsCount} goals
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, color: 'rgba(200,215,240,0.40)', fontSize: 11, lineHeight: 1.4 }}>
        This is informational and context-building only.
      </div>
    </div>
  );
}

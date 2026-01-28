'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

type MarketIntel = {
  fii_net_cr?: number | null;
  dii_net_cr?: number | null;
  asof?: string;
};

type OptionsIntel = {
  pcr?: number | null;
  asof?: string;
};

type IndicesSnapshot = {
  vix?: number | null;
  sectorPerformance?: Record<string, number> | null;
  asof?: string;
};

type Allocations = { equity?: number; debt?: number; gold?: number; cash?: number };

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatCr(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '+';
  return `${sign}₹${abs.toLocaleString('en-IN')} Cr`;
}

function pickSectorWinners(sectorPerformance: Record<string, number> | null | undefined) {
  if (!sectorPerformance) return null;
  const entries = Object.entries(sectorPerformance).filter(([, v]) => typeof v === 'number' && Number.isFinite(v));
  if (!entries.length) return null;
  entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  const top = entries[0];
  const bottom = entries[entries.length - 1];
  return { top, bottom };
}

function readAllocations(): Allocations {
  if (typeof window === 'undefined') return { equity: 0, debt: 0, gold: 0, cash: 0 };
  const raw = safeJsonParse<any>(window.localStorage.getItem('li_allocations_v1'), null);
  const base = { equity: 0, debt: 0, gold: 0, cash: 0 };
  if (!raw || typeof raw !== 'object') return base;
  const next: Allocations = { ...base };
  for (const k of Object.keys(base) as (keyof Allocations)[]) {
    const v = raw[k];
    const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
    next[k] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
  }
  return next;
}

function SkeletonLine({ w = '70%' }: { w?: string }) {
  return (
    <div
      style={{
        width: w,
        height: 10,
        borderRadius: 999,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 100%)',
        backgroundSize: '200% 100%',
        animation: 'liShimmer 1.2s ease-in-out infinite',
      }}
    />
  );
}

export default function WhatThisMeansPanel(props: { style?: CSSProperties }) {
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState<MarketIntel | null>(null);
  const [options, setOptions] = useState<OptionsIntel | null>(null);
  const [indices, setIndices] = useState<IndicesSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      try {
        const [m, o, i] = await Promise.all([
          fetch('/api/live-intelligence/market-intel').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/live-intelligence/options-intel').then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch('/api/live-intelligence/indices-snapshot').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        if (!alive) return;
        setMarket(m);
        setOptions(o);
        setIndices(i);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    const t = window.setInterval(run, 60_000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  const allocations = useMemo(() => readAllocations(), []);
  const winners = useMemo(() => pickSectorWinners(indices?.sectorPerformance || null), [indices?.sectorPerformance]);

  const items = useMemo(() => {
    const list: { title: string; body: string }[] = [];

    if (typeof market?.fii_net_cr === 'number') {
      const direction = market.fii_net_cr < 0 ? 'net selling' : 'net buying';
      list.push({
        title: `FII flow: ${formatCr(market.fii_net_cr)} (${direction})`,
        body:
          `Context: Institutional flow can reflect short-term risk appetite. ` +
          `Your equity allocation is ${allocations.equity || 0}%. This hub provides context only (no recommendations).`,
      });
    }

    if (typeof options?.pcr === 'number') {
      const p = options.pcr;
      const band = p < 0.9 ? 'put-light' : p > 1.2 ? 'put-heavy' : 'balanced';
      list.push({
        title: `Options mood: PCR ${p.toFixed(2)} (${band})`,
        body:
          'Context: PCR is a positioning proxy. Use alongside volatility (VIX) and sector leadership for a fuller picture.',
      });
    }

    if (typeof indices?.vix === 'number') {
      const v = indices.vix;
      const label = v >= 18 ? 'elevated' : v >= 14 ? 'moderate' : 'calm';
      list.push({
        title: `Volatility: India VIX ${v.toFixed(2)} (${label})`,
        body:
          'Context: Higher VIX generally implies wider price swings. Ensure your allocation matches your risk comfort.',
      });
    }

    if (winners) {
      const [topName, topVal] = winners.top;
      const [bottomName, bottomVal] = winners.bottom;
      list.push({
        title: `Sector leadership: ${topName} ${topVal > 0 ? '+' : ''}${topVal.toFixed(2)}%`,
        body: `Lagging: ${bottomName} ${bottomVal > 0 ? '+' : ''}${bottomVal.toFixed(2)}%. Context: leadership rotates; avoid reading one print in isolation.`,
      });
    }

    return list.slice(0, 4);
  }, [allocations.equity, indices?.vix, market?.fii_net_cr, options?.pcr, winners]);

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(212,175,55,0.10)',
        ...props.style,
      }}
      aria-label="What this means"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
            What this means (context)
          </div>
          <div style={{ marginTop: 4, color: 'rgba(245,248,255,0.92)', fontSize: 13, fontWeight: 950 }}>
            Narrative summaries tied to live modules
          </div>
        </div>
        <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
          Equity: {allocations.equity || 0}%
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        {loading ? (
          <>
            <SkeletonLine w="85%" />
            <SkeletonLine w="92%" />
            <SkeletonLine w="78%" />
            <SkeletonLine w="88%" />
          </>
        ) : items.length ? (
          items.map((it) => (
            <div
              key={it.title}
              style={{
                padding: '12px 12px',
                borderRadius: 12,
                background: 'rgba(10,10,12,0.45)',
                border: '1px solid rgba(170,198,255,0.10)',
              }}
            >
              <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 950 }}>
                {it.title}
              </div>
              <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.55)', fontSize: 11, lineHeight: 1.45 }}>
                {it.body}
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
            Live context is loading or temporarily unavailable.
          </div>
        )}
      </div>

      <style>{`
        @keyframes liShimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import PanelSkeleton from './PanelSkeleton';
import { useFIIDIIFlow } from '@/hooks/useMarketData';
import { LiveBadge } from '@/components/LiveBadge';

function formatSignedCr(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const n = Number(value);
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}₹${Math.abs(n).toFixed(0)} Cr`;
}

function valueTone(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return 'neutral';
  return n > 0 ? 'pos' : 'neg';
}

export default function MarketIntelPanel() {
  const { data, loading, refreshing, stale, error } = useFIIDIIFlow(30_000);

  const view = useMemo(() => {
    const fii = data;
    return {
      lastUpdated: fii?.lastUpdated || null,
      date: fii?.date || null,
      fiiNetCr: fii?.fiiNetCr ?? null,
      diiNetCr: fii?.diiNetCr ?? null,
      ok: Boolean(fii?.ok),
      error: error || null,
    };
  }, [data, error]);

  const rows = [
    { label: 'FII Net', value: view.fiiNetCr, helper: 'Foreign' },
    { label: 'DII Net', value: view.diiNetCr, helper: 'Domestic' },
  ];

  if (loading && !data) {
    return <PanelSkeleton rows={1} columns={2} />;
  }

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
      }}
      aria-label="Market Intel"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            FII / DII Flow
          </div>
          <div style={{ marginTop: '3px', color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
            {view.date ? `Trade date: ${view.date}` : 'Trade date: Awaiting update'}
          </div>
        </div>
        {view.lastUpdated ? (
          <LiveBadge lastUpdate={view.lastUpdated} />
        ) : (
          <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>{refreshing ? 'Updating…' : '—'}</div>
        )}
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
        {rows.map((r) => {
          const tone = valueTone(r.value);
          const color =
            tone === 'pos'
              ? 'rgba(140,220,180,0.85)'
              : tone === 'neg'
                ? 'rgba(255, 100, 100, 0.7)'
                : 'rgba(200,215,240,0.70)';

          return (
            <div
              key={r.label}
              style={{
                padding: '12px 12px',
                borderRadius: '12px',
                background: 'rgba(10,10,12,0.45)',
                border: '1px solid rgba(170,198,255,0.10)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', fontWeight: 600 }}>
                  {r.label}
                </div>
                <div style={{ color: 'rgba(200,215,240,0.35)', fontSize: '10px' }}>{r.helper}</div>
              </div>
              <div style={{ marginTop: '8px', color, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {formatSignedCr(r.value)}
              </div>
            </div>
          );
        })}
      </div>

      {stale ? (
        <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '11px', lineHeight: 1.35 }}>
          Reconnecting… showing last known values.
        </div>
      ) : view.error ? (
        <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '11px', lineHeight: 1.35 }}>
          Data may be temporarily unavailable.
        </div>
      ) : null}

      <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '10.5px', lineHeight: 1.35 }}>
        Best-effort snapshot; may be delayed/incomplete.
      </div>
    </div>
  );
}

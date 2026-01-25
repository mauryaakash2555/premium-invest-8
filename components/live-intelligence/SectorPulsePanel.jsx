'use client';

import { useEffect, useMemo, useState } from 'react';

function toneFromPct(pct) {
  const n = Number(pct);
  if (!Number.isFinite(n) || n === 0) return 'neutral';
  return n > 0 ? 'pos' : 'neg';
}

export default function SectorPulsePanel() {
  const [state, setState] = useState({ loading: true, payload: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch('/api/live-intelligence/indices-snapshot', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        setState({ loading: false, payload: json });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, payload: { error: String(e?.message || e) } });
      }
    }

    run();
    const id = setInterval(run, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const view = useMemo(() => {
    const list = Array.isArray(state?.payload?.indices) ? state.payload.indices : [];
    const byName = new Map(list.map((x) => [String(x?.name || '').toUpperCase(), x]));

    const vix = byName.get('INDIA VIX');

    const sectors = [
      'NIFTY IT',
      'NIFTY BANK',
      'NIFTY FIN SERVICE',
      'NIFTY FMCG',
      'NIFTY PHARMA',
      'NIFTY AUTO',
      'NIFTY METAL',
      'NIFTY REALTY',
    ]
      .map((name) => byName.get(name))
      .filter(Boolean)
      .map((row) => ({
        name: row.name,
        pct: row.percentChange,
      }));

    return {
      vixLast: vix?.last ?? null,
      vixPct: vix?.percentChange ?? null,
      sectors,
      error: state?.payload?.error || null,
    };
  }, [state]);

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
      }}
      aria-label="Sector Pulse"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            Sector Pulse + India VIX
          </div>
          <div style={{ marginTop: '3px', color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
            NSE index snapshot
          </div>
        </div>
        <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
          {state.loading ? 'Updating…' : 'Live'}
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', fontWeight: 700 }}>INDIA VIX</div>
        <div style={{ color: 'rgba(245,248,255,0.88)', fontSize: '14px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
          {typeof view.vixLast === 'number' ? view.vixLast.toFixed(2) : '—'}
          <span
            style={{
              marginLeft: '10px',
              color:
                toneFromPct(view.vixPct) === 'pos'
                  ? 'rgba(255, 200, 120, 0.85)'
                  : toneFromPct(view.vixPct) === 'neg'
                    ? 'rgba(140,220,180,0.85)'
                    : 'rgba(200,215,240,0.55)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {typeof view.vixPct === 'number' ? `${view.vixPct >= 0 ? '+' : ''}${view.vixPct.toFixed(2)}%` : ''}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
        {view.sectors.slice(0, 8).map((s) => {
          const tone = toneFromPct(s.pct);
          const color =
            tone === 'pos'
              ? 'rgba(140,220,180,0.85)'
              : tone === 'neg'
                ? 'rgba(255, 100, 100, 0.7)'
                : 'rgba(200,215,240,0.70)';

          const short = String(s.name)
            .replace(/^NIFTY\s+/i, '')
            .replace(/\s+SERVICE$/i, ' SVS');

          return (
            <div
              key={s.name}
              style={{
                padding: '10px 10px',
                borderRadius: '12px',
                background: 'rgba(10,10,12,0.45)',
                border: '1px solid rgba(170,198,255,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', fontWeight: 700 }}>{short}</div>
              <div style={{ color, fontSize: '12px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {typeof s.pct === 'number' ? `${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(2)}%` : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {view.error ? (
        <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '11px', lineHeight: 1.35 }}>
          Index snapshot may be temporarily unavailable.
        </div>
      ) : null}

      <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '10.5px', lineHeight: 1.35 }}>
        Educational context only.
      </div>
    </div>
  );
}

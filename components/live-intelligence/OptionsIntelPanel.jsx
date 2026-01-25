'use client';

import { useEffect, useMemo, useState } from 'react';
import PanelSkeleton from './PanelSkeleton';

function formatNumberCompact(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  return n.toFixed(0);
}

function badgeTone(pcr) {
  const n = Number(pcr);
  if (!Number.isFinite(n)) return 'neutral';
  if (n >= 1.2) return 'pos';
  if (n <= 0.85) return 'neg';
  return 'neutral';
}

export default function OptionsIntelPanel() {
  const [state, setState] = useState({ loading: true, payload: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch('/api/live-intelligence/options-intel', { cache: 'no-store' });
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
    const nifty = state?.payload?.nifty;
    const bank = state?.payload?.bankNifty;
    return {
      nifty,
      bank,
      error: state?.payload?.error || null,
    };
  }, [state]);

  const cards = [
    { key: 'NIFTY', data: view.nifty },
    { key: 'BANKNIFTY', data: view.bank },
  ];

  if (state.loading) {
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
      aria-label="Options Intel"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            Options / OI Context
          </div>
          <div style={{ marginTop: '3px', color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
            PCR + Open Interest snapshot
          </div>
        </div>
        <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
          {state.loading ? 'Updating…' : 'Live'}
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
        {cards.map((c) => {
          const pcr = c.data?.pcr;
          const tone = badgeTone(pcr);
          const color =
            tone === 'pos'
              ? 'rgba(140,220,180,0.85)'
              : tone === 'neg'
                ? 'rgba(255, 100, 100, 0.7)'
                : 'rgba(200,215,240,0.70)';

          return (
            <div
              key={c.key}
              style={{
                padding: '12px 12px',
                borderRadius: '12px',
                background: 'rgba(10,10,12,0.45)',
                border: '1px solid rgba(170,198,255,0.10)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>{c.key}</div>
                <div style={{ color: 'rgba(200,215,240,0.35)', fontSize: '10px' }}>{c.data?.timestamp ? 'NSE' : '—'}</div>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ color, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  PCR {typeof pcr === 'number' ? pcr.toFixed(2) : '—'}
                </div>
                <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
                  U {typeof c.data?.underlying === 'number' ? c.data.underlying.toFixed(0) : '—'}
                </div>
              </div>

              <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '10.5px' }}>
                  Calls OI: <span style={{ color: 'rgba(200,215,240,0.70)', fontWeight: 700 }}>{formatNumberCompact(c.data?.totalCallOI)}</span>
                </div>
                <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '10.5px' }}>
                  Puts OI: <span style={{ color: 'rgba(200,215,240,0.70)', fontWeight: 700 }}>{formatNumberCompact(c.data?.totalPutOI)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {view.error ? (
        <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '11px', lineHeight: 1.35 }}>
          Options snapshot may be temporarily unavailable.
        </div>
      ) : null}

      <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '10.5px', lineHeight: 1.35 }}>
        Educational context only.
      </div>
    </div>
  );
}

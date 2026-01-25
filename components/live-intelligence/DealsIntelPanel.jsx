'use client';

import { useEffect, useMemo, useState } from 'react';

function formatCr(valueCr) {
  const n = Number(valueCr);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toFixed(n >= 10 ? 0 : 2)} Cr`;
}

function formatQty(qty) {
  const n = Number(qty);
  if (!Number.isFinite(n)) return '—';
  return n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(Math.round(n));
}

export default function DealsIntelPanel() {
  const [state, setState] = useState({ loading: true, payload: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch('/api/live-intelligence/deals-intel', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        setState({ loading: false, payload: json });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, payload: { bulk: { deals: [] }, block: { deals: [] }, error: String(e?.message || e) } });
      }
    }

    run();
    const id = setInterval(run, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const view = useMemo(() => {
    const bulk = state?.payload?.bulk?.deals || [];
    const block = state?.payload?.block?.deals || [];

    const list = [...bulk.map((d) => ({ ...d, kind: 'bulk' })), ...block.map((d) => ({ ...d, kind: 'block' }))]
      .slice(0, 12);

    return {
      list,
      hasAny: list.length > 0,
      hasError: Boolean(state?.payload?.bulk?.error || state?.payload?.block?.error || state?.payload?.error),
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
      aria-label="Deals Intel"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            Deals (Bulk / Block)
          </div>
          <div style={{ marginTop: '3px', color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
            Smart money activity snapshot
          </div>
        </div>
        <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
          {state.loading ? 'Updating…' : 'Live'}
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!view.hasAny ? (
          <div
            style={{
              padding: '12px 12px',
              borderRadius: '12px',
              background: 'rgba(10,10,12,0.45)',
              border: '1px dashed rgba(170,198,255,0.12)',
              color: 'rgba(200,215,240,0.45)',
              fontSize: '11px',
              lineHeight: 1.5,
            }}
          >
            Deals data may be temporarily unavailable.
          </div>
        ) : (
          view.list.map((d, idx) => {
            const side = String(d.side || '').toUpperCase();
            const sideColor = side === 'BUY' ? 'rgba(140,220,180,0.85)' : side === 'SELL' ? 'rgba(255, 100, 100, 0.7)' : 'rgba(200,215,240,0.55)';
            const kindLabel = d.kind === 'block' ? 'BLOCK' : 'BULK';

            return (
              <div
                key={`${d.kind}-${d.symbol}-${idx}`}
                style={{
                  padding: '10px 10px',
                  borderRadius: '12px',
                  background: 'rgba(10,10,12,0.45)',
                  border: '1px solid rgba(170,198,255,0.10)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'rgba(200,215,240,0.65)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em' }}>
                      {kindLabel}
                    </span>
                    <span style={{ color: 'rgba(245,248,255,0.90)', fontSize: '12px', fontWeight: 800 }}>
                      {d.symbol}
                    </span>
                    {side ? (
                      <span style={{ color: sideColor, fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>
                        {side}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ marginTop: '4px', color: 'rgba(200,215,240,0.45)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.client || '—'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ color: 'rgba(200,215,240,0.70)', fontSize: '11px', fontWeight: 800 }}>{formatCr(d.valueCr)}</div>
                  <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '10.5px' }}>
                    Qty {formatQty(d.quantity)} @ {typeof d.price === 'number' ? d.price.toFixed(2) : '—'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {view.hasError ? (
        <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '11px', lineHeight: 1.35 }}>
          Source may throttle requests.
        </div>
      ) : null}

      <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '10.5px', lineHeight: 1.35 }}>
        Educational context only.
      </div>
    </div>
  );
}

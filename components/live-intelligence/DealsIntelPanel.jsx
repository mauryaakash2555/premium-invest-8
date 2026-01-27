'use client';

import { useEffect, useMemo, useState } from 'react';
import PanelSkeleton from './PanelSkeleton';
import { LiveBadge } from '@/components/LiveBadge';

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeSymbol(sym) {
  const s = String(sym || '').trim();
  if (!s) return '';
  return s.split(/[-\s]/)[0].toUpperCase();
}

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
  const [state, setState] = useState({ loading: true, payload: null, lastUpdatedAt: null });
  const [portfolioTickers, setPortfolioTickers] = useState([]);
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(() => {
    function loadPortfolio() {
      if (typeof window === 'undefined') return;
      const raw = safeJsonParse(window.localStorage.getItem('li_portfolio_context_v1') || 'null', null);
      const list = Array.isArray(raw?.tickers) ? raw.tickers : Array.isArray(raw?.symbols) ? raw.symbols : [];
      const cleaned = (list || [])
        .map((t) => normalizeSymbol(t))
        .filter(Boolean)
        .slice(0, 20);
      setPortfolioTickers(cleaned);
    }

    loadPortfolio();
    const onStorage = (e) => {
      if (!e || e.key === 'li_portfolio_context_v1') loadPortfolio();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('li-portfolio-updated', loadPortfolio);
    return () => {
      window.removeEventListener('li-portfolio-updated', loadPortfolio);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch('/api/live-intelligence/deals-intel', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        setState({ loading: false, payload: json, lastUpdatedAt: Date.now() });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, payload: { bulk: { deals: [] }, block: { deals: [] }, error: String(e?.message || e) }, lastUpdatedAt: Date.now() });
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
    const tickerSet = new Set(portfolioTickers.map((t) => normalizeSymbol(t)));
    const bulk = state?.payload?.bulk?.deals || [];
    const block = state?.payload?.block?.deals || [];

    let list = [...bulk.map((d) => ({ ...d, kind: 'bulk' })), ...block.map((d) => ({ ...d, kind: 'block' }))]
      .map((d) => ({
        ...d,
        __portfolioMatch: tickerSet.size ? tickerSet.has(normalizeSymbol(d.symbol)) : false,
      }));

    // Sort: portfolio matches first, then higher value
    list.sort((a, b) => {
      const pm = (b.__portfolioMatch ? 1 : 0) - (a.__portfolioMatch ? 1 : 0);
      if (pm) return pm;
      const av = typeof a.valueCr === 'number' ? a.valueCr : -1;
      const bv = typeof b.valueCr === 'number' ? b.valueCr : -1;
      return bv - av;
    });

    if (onlyMine && tickerSet.size) {
      list = list.filter((d) => d.__portfolioMatch);
    }

    list = list.slice(0, 12);

    return {
      list,
      hasAny: list.length > 0,
      hasError: Boolean(state?.payload?.bulk?.error || state?.payload?.block?.error || state?.payload?.error),
      hasPortfolio: tickerSet.size > 0,
    };
  }, [state, portfolioTickers, onlyMine]);

  if (state.loading) {
    return <PanelSkeleton rows={3} columns={1} />;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {view.hasPortfolio ? (
            <button
              type="button"
              onClick={() => setOnlyMine((v) => !v)}
              style={{
                padding: '5px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                background: onlyMine ? 'rgba(255, 210, 110, 0.12)' : 'rgba(170,198,255,0.10)',
                border: onlyMine ? '1px solid rgba(255, 210, 110, 0.22)' : '1px solid rgba(170,198,255,0.12)',
                color: onlyMine ? 'rgba(255, 225, 160, 0.95)' : 'rgba(170,198,255,0.80)',
              }}
              title={onlyMine ? 'Showing only your tickers' : 'Show only your tickers'}
            >
              {onlyMine ? 'ONLY MINE' : 'FILTER'}
            </button>
          ) : null}

          <LiveBadge lastUpdate={state.lastUpdatedAt || new Date().toISOString()} />
        </div>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href="https://www.nseindia.com/companies-listing/corporate-filings-bulk-deals"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(170,198,255,0.70)', fontSize: '11px', textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation?.()}
          title="Open NSE bulk deals"
        >
          NSE Bulk ↗
        </a>
        <a
          href="https://www.nseindia.com/companies-listing/corporate-filings-block-deals"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(170,198,255,0.70)', fontSize: '11px', textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation?.()}
          title="Open NSE block deals"
        >
          NSE Block ↗
        </a>
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
            {view.hasError ? 'Deals are temporarily unavailable. Please try again in a minute.' : 'No bulk/block deals to show right now.'}
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
                    {d.__portfolioMatch ? (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          background: 'rgba(255, 210, 110, 0.12)',
                          border: '1px solid rgba(255, 210, 110, 0.22)',
                          color: 'rgba(255, 225, 160, 0.95)',
                        }}
                        title="Matches your portfolio context"
                      >
                        YOUR LIST
                      </span>
                    ) : null}
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
          Data source may be rate-limited; showing best-effort results.
        </div>
      ) : null}

      {!view.hasPortfolio ? (
        <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '10.5px', lineHeight: 1.35 }}>
          Add tickers in “Your tickers” to highlight deals relevant to you.
        </div>
      ) : null}

      <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '10.5px', lineHeight: 1.35 }}>
        Educational context only.
      </div>
    </div>
  );
}

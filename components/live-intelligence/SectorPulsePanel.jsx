'use client';

import { useEffect, useMemo, useState } from 'react';
import PanelSkeleton from './PanelSkeleton';
import { LiveBadge } from '@/components/LiveBadge';

/* ─── Helpers ─── */

function toneFromPct(pct) {
  const n = Number(pct);
  if (!Number.isFinite(n) || n === 0) return 'neutral';
  return n > 0 ? 'pos' : 'neg';
}

function outlookSignal(pct) {
  const n = Number(pct);
  if (!Number.isFinite(n)) return { label: '—', color: 'rgba(200,215,240,0.40)' };
  if (n >= 1.5)  return { label: 'Strong Rally',  color: 'rgba(80,220,140,0.95)' };
  if (n >= 0.5)  return { label: 'Bullish',        color: 'rgba(140,220,180,0.85)' };
  if (n > 0)     return { label: 'Mild Green',     color: 'rgba(180,230,200,0.70)' };
  if (n === 0)   return { label: 'Flat',           color: 'rgba(200,215,240,0.55)' };
  if (n > -0.5)  return { label: 'Mild Red',       color: 'rgba(255,180,140,0.70)' };
  if (n > -1.5)  return { label: 'Bearish',        color: 'rgba(255,120,100,0.80)' };
  return           { label: 'Sharp Sell-off',       color: 'rgba(255,80,80,0.95)' };
}

function vixSentiment(vix) {
  const v = Number(vix);
  if (!Number.isFinite(v)) return { label: 'Unknown', color: 'rgba(200,215,240,0.45)' };
  if (v <= 12)  return { label: 'Extreme Calm',       color: 'rgba(80,220,140,0.9)' };
  if (v <= 15)  return { label: 'Low Volatility',     color: 'rgba(140,220,180,0.85)' };
  if (v <= 20)  return { label: 'Normal',              color: 'rgba(200,215,240,0.65)' };
  if (v <= 25)  return { label: 'Elevated',            color: 'rgba(255,200,120,0.85)' };
  if (v <= 30)  return { label: 'High Fear',           color: 'rgba(255,140,100,0.85)' };
  return          { label: 'Extreme Fear',             color: 'rgba(255,80,80,0.95)' };
}

/* ─── Sector classification ─── */

const BENCHMARKS = ['NIFTY 50', 'NIFTY NEXT 50', 'NIFTY MIDCAP 50', 'NIFTY SMLCAP 50'];

const SECTOR_ORDER = [
  'NIFTY BANK', 'NIFTY FIN SERVICE', 'NIFTY PVT BANK', 'NIFTY PSU BANK',
  'NIFTY IT', 'NIFTY PHARMA', 'NIFTY HEALTHCARE', 'NIFTY AUTO',
  'NIFTY FMCG', 'NIFTY CONSUMPTION', 'NIFTY METAL', 'NIFTY ENERGY',
  'NIFTY OIL AND GAS', 'NIFTY REALTY', 'NIFTY INFRA', 'NIFTY MEDIA',
  'NIFTY PSE', 'NIFTY COMMODITIES', 'NIFTY MNC',
];

const DISPLAY_NAME = {
  'NIFTY BANK': 'Banking',
  'NIFTY FIN SERVICE': 'Fin Service',
  'NIFTY PVT BANK': 'Private Bank',
  'NIFTY PSU BANK': 'PSU Bank',
  'NIFTY IT': 'IT',
  'NIFTY PHARMA': 'Pharma',
  'NIFTY HEALTHCARE': 'Healthcare',
  'NIFTY AUTO': 'Auto',
  'NIFTY FMCG': 'FMCG',
  'NIFTY CONSUMPTION': 'Consumption',
  'NIFTY METAL': 'Metals',
  'NIFTY ENERGY': 'Energy',
  'NIFTY OIL AND GAS': 'Oil & Gas',
  'NIFTY REALTY': 'Realty',
  'NIFTY INFRA': 'Infra',
  'NIFTY MEDIA': 'Media',
  'NIFTY PSE': 'PSE',
  'NIFTY COMMODITIES': 'Commodities',
  'NIFTY MNC': 'MNC',
  'NIFTY 50': 'Nifty 50',
  'NIFTY NEXT 50': 'Next 50',
  'NIFTY MIDCAP 50': 'Midcap 50',
  'NIFTY SMLCAP 50': 'Smallcap 50',
};

/* ─── Filter tabs ─── */
const FILTER_TABS = [
  { id: 'all',     label: 'All Sectors' },
  { id: 'top',     label: 'Top Gainers' },
  { id: 'bottom',  label: 'Top Losers' },
  { id: 'bench',   label: 'Benchmarks' },
];

/* ─── Component ─── */

export default function SectorPulsePanel() {
  const [state, setState] = useState({ loading: true, payload: null, lastUpdatedAt: null });
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch('/api/live-intelligence/indices-snapshot', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        setState({ loading: false, payload: json, lastUpdatedAt: Date.now() });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, payload: { error: String(e?.message || e) }, lastUpdatedAt: Date.now() });
      }
    }

    run();
    const id = setInterval(run, 2 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const view = useMemo(() => {
    const list = Array.isArray(state?.payload?.indices) ? state.payload.indices : [];
    const byName = new Map(list.map((x) => [String(x?.name || '').toUpperCase(), x]));

    const vix = byName.get('INDIA VIX');

    const benchmarks = BENCHMARKS.map(n => byName.get(n)).filter(Boolean).map(r => ({
      name: r.name, last: r.last, pct: r.percentChange, change: r.change,
    }));

    const sectors = SECTOR_ORDER.map(n => byName.get(n)).filter(Boolean).map(r => ({
      name: r.name, last: r.last, pct: r.percentChange, change: r.change,
    }));

    const bullish = sectors.filter(s => Number(s.pct) > 0).length;
    const bearish = sectors.filter(s => Number(s.pct) < 0).length;
    const flat    = sectors.filter(s => Number(s.pct) === 0).length;

    return {
      vix: vix ? { last: vix.last, pct: vix.percentChange } : null,
      benchmarks,
      sectors,
      summary: { bullish, bearish, flat, total: sectors.length },
      error: state?.payload?.error || null,
    };
  }, [state]);

  /* Apply filter */
  const displaySectors = useMemo(() => {
    if (filter === 'bench') return view.benchmarks;
    let list = [...view.sectors];
    if (filter === 'top') {
      list.sort((a, b) => (Number(b.pct) || 0) - (Number(a.pct) || 0));
      return list.slice(0, 5);
    }
    if (filter === 'bottom') {
      list.sort((a, b) => (Number(a.pct) || 0) - (Number(b.pct) || 0));
      return list.slice(0, 5);
    }
    return list;
  }, [filter, view]);

  if (state.loading) {
    return <PanelSkeleton rows={6} columns={2} />;
  }

  const pctColor = (pct) => {
    const t = toneFromPct(pct);
    if (t === 'pos') return 'rgba(140,220,180,0.85)';
    if (t === 'neg') return 'rgba(255,100,100,0.75)';
    return 'rgba(200,215,240,0.55)';
  };

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '18px',
        borderRadius: '14px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
      }}
      aria-label="Market Sectors Intelligence"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.80)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em' }}>
            Market Sectors Intelligence
          </div>
          <div style={{ marginTop: '3px', color: 'rgba(200,215,240,0.42)', fontSize: '11px' }}>
            {view.summary.total} sectors — {view.summary.bullish} bullish · {view.summary.bearish} bearish · {view.summary.flat} flat
          </div>
        </div>
        <LiveBadge lastUpdate={state.lastUpdatedAt || new Date().toISOString()} />
      </div>

      {/* ── VIX Block ── */}
      {view.vix && (() => {
        const vs = vixSentiment(view.vix.last);
        return (
          <div style={{
            marginTop: '14px', padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(10,10,12,0.5)', border: '1px solid rgba(170,198,255,0.10)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div>
              <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>INDIA VIX — Fear Gauge</div>
              <div style={{ color: vs.color, fontSize: '11px', fontWeight: 600, marginTop: 2 }}>{vs.label}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'rgba(245,248,255,0.90)', fontSize: '18px', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                {typeof view.vix.last === 'number' ? view.vix.last.toFixed(2) : '—'}
              </div>
              <div style={{
                fontSize: '11px', fontWeight: 700,
                color: toneFromPct(view.vix.pct) === 'pos'
                  ? 'rgba(255,200,120,0.85)'   /* VIX up = market fear up → amber */
                  : toneFromPct(view.vix.pct) === 'neg'
                    ? 'rgba(140,220,180,0.85)'  /* VIX down = calm → green */
                    : 'rgba(200,215,240,0.55)',
              }}>
                {typeof view.vix.pct === 'number' ? `${view.vix.pct >= 0 ? '+' : ''}${view.vix.pct.toFixed(2)}%` : ''}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Benchmark Bar ── */}
      {view.benchmarks.length > 0 && (
        <div style={{
          marginTop: '12px', display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(view.benchmarks.length, 4)}, minmax(0, 1fr))`,
          gap: '6px',
        }}>
          {view.benchmarks.map(b => (
            <div key={b.name} style={{
              padding: '10px 10px', borderRadius: '10px',
              background: 'rgba(10,10,12,0.40)', border: '1px solid rgba(170,198,255,0.08)',
              textAlign: 'center',
            }}>
              <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}>
                {DISPLAY_NAME[b.name] || b.name}
              </div>
              <div style={{ color: pctColor(b.pct), fontSize: '13px', fontWeight: 900, fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>
                {typeof b.pct === 'number' ? `${b.pct >= 0 ? '+' : ''}${b.pct.toFixed(2)}%` : '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ marginTop: '14px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
            border: 'none', cursor: 'pointer',
            background: filter === t.id ? 'rgba(100,160,255,0.15)' : 'transparent',
            color: filter === t.id ? 'rgba(200,215,240,0.90)' : 'rgba(200,215,240,0.45)',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Sectors grid ── */}
      <div style={{
        marginTop: '10px', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
        gap: '8px',
      }}>
        {(expanded ? displaySectors : displaySectors.slice(0, 12)).map((s) => {
          const outlook = outlookSignal(s.pct);
          return (
            <div key={s.name} style={{
              padding: '12px 12px', borderRadius: '12px',
              background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)',
              display: 'flex', flexDirection: 'column', gap: 6,
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(170,198,255,0.25)';
              e.currentTarget.style.background = 'rgba(10,10,12,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(170,198,255,0.10)';
              e.currentTarget.style.background = 'rgba(10,10,12,0.45)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <div style={{ color: 'rgba(200,215,240,0.65)', fontSize: '12px', fontWeight: 800, letterSpacing: '0.02em' }}>
                  {DISPLAY_NAME[s.name] || String(s.name).replace(/^NIFTY\s+/i, '')}
                </div>
                <div style={{ color: pctColor(s.pct), fontSize: '13px', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                  {typeof s.pct === 'number' ? `${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(2)}%` : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: outlook.color }}>
                  {outlook.label}
                </div>
                {typeof s.last === 'number' && (
                  <div style={{ fontSize: '10px', color: 'rgba(200,215,240,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                    {s.last.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse */}
      {filter === 'all' && displaySectors.length > 12 && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <button onClick={() => setExpanded(!expanded)} style={{
            padding: '5px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
            border: '1px solid rgba(100,160,255,0.15)', background: 'transparent',
            color: 'rgba(200,215,240,0.60)', cursor: 'pointer',
          }}>
            {expanded ? 'Show Less ↑' : `Show All ${displaySectors.length} Sectors ↓`}
          </button>
        </div>
      )}

      {view.error && (
        <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.35)', fontSize: '11px', lineHeight: 1.35 }}>
          Index snapshot may be temporarily unavailable.
        </div>
      )}

      <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.30)', fontSize: '10px', lineHeight: 1.35 }}>
        NSE indices — educational context only. Outlook based on intraday change signals.
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';

import { useFIIDIIFlow, useIndiaVIX } from '@/hooks/useMarketData';
import PanelSkeleton from '@/components/live-intelligence/PanelSkeleton';
import { LiveBadge } from '@/components/LiveBadge';

type MoodPayload = {
  success?: boolean;
  mood?: {
    mood_text?: string;
    mood_type?: string;
    generated_at?: string;
    created_at?: string;
  };
};

type OptionsPayload = {
  nifty?: {
    pcr?: number;
    underlying?: number;
    timestamp?: string;
  };
  bankNifty?: {
    pcr?: number;
    underlying?: number;
    timestamp?: string;
  };
  error?: string;
};

type IndicesPayload = {
  indices?: Array<{ name?: string; percentChange?: number; last?: number }>;
  lastUpdated?: string;
  error?: string;
};

type DealsPayload = {
  bulk?: { deals?: Array<{ symbol?: string; valueCr?: number; side?: string; client?: string }> };
  block?: { deals?: Array<{ symbol?: string; valueCr?: number; side?: string; client?: string }> };
  error?: string;
};

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

function readWatchlist(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = safeJsonParse<any>(window.localStorage.getItem('li_portfolio_context_v1'), null);
  const list = Array.isArray(raw?.tickers) ? raw.tickers : Array.isArray(raw?.symbols) ? raw.symbols : [];
  return (list || []).map(normalizeSymbol).filter(Boolean).slice(0, 20);
}

function pcrTone(pcr: number | null): 'pos' | 'neg' | 'neutral' {
  if (pcr == null || !Number.isFinite(pcr)) return 'neutral';
  if (pcr >= 1.2) return 'pos';
  if (pcr <= 0.85) return 'neg';
  return 'neutral';
}

function toneColor(tone: 'pos' | 'neg' | 'neutral') {
  if (tone === 'pos') return 'rgba(140,220,180,0.85)';
  if (tone === 'neg') return 'rgba(255, 100, 100, 0.70)';
  return 'rgba(200,215,240,0.70)';
}

export default function TodayIntelPanel() {
  const fii = useFIIDIIFlow(60_000);
  const vix = useIndiaVIX(60_000);

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mood, setMood] = useState<{ text: string | null; updatedAt: string | null } | null>(null);
  const [options, setOptions] = useState<OptionsPayload | null>(null);
  const [indices, setIndices] = useState<IndicesPayload | null>(null);
  const [deals, setDeals] = useState<DealsPayload | null>(null);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    setWatchlist(readWatchlist());
    const sync = () => setWatchlist(readWatchlist());
    window.addEventListener('li-portfolio-updated', sync as any);
    return () => window.removeEventListener('li-portfolio-updated', sync as any);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoadingExtras(true);

        const [moodRes, optionsRes, indicesRes, dealsRes] = await Promise.all([
          fetch('/api/live-intelligence/mood', { cache: 'no-store' }),
          fetch('/api/live-intelligence/options-intel', { cache: 'no-store' }),
          fetch('/api/live-intelligence/indices-snapshot', { cache: 'no-store' }),
          fetch('/api/live-intelligence/deals-intel', { cache: 'no-store' }),
        ]);

        const moodJson: MoodPayload | null = await moodRes.json().catch(() => null);
        const optionsJson: OptionsPayload | null = await optionsRes.json().catch(() => null);
        const indicesJson: IndicesPayload | null = await indicesRes.json().catch(() => null);
        const dealsJson: DealsPayload | null = await dealsRes.json().catch(() => null);

        if (cancelled) return;

        const moodText = moodJson?.mood?.mood_text ? String(moodJson.mood.mood_text) : null;
        const moodAt = moodJson?.mood?.generated_at || moodJson?.mood?.created_at || null;

        setMood({ text: moodText, updatedAt: moodAt ? String(moodAt) : null });
        setOptions(optionsJson || null);
        setIndices(indicesJson || null);
        setDeals(dealsJson || null);
        setLastUpdatedAt(new Date().toISOString());
      } catch {
        if (cancelled) return;
        setLastUpdatedAt(new Date().toISOString());
      } finally {
        if (!cancelled) setLoadingExtras(false);
      }
    }

    run();
    const id = window.setInterval(run, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const view = useMemo(() => {
    const items = Array.isArray(indices?.indices) ? indices?.indices : [];
    const sectors = items
      .filter((x) => String(x?.name || '').toUpperCase().startsWith('NIFTY '))
      .map((x) => ({ name: String(x?.name || ''), pct: typeof x?.percentChange === 'number' ? x.percentChange : null }))
      .filter((x) => x.name && x.pct != null);

    sectors.sort((a, b) => (b.pct ?? -999) - (a.pct ?? -999));
    const leader = sectors.length ? sectors[0] : null;
    const laggard = sectors.length ? sectors[sectors.length - 1] : null;

    const list = [...(deals?.bulk?.deals || []), ...(deals?.block?.deals || [])];
    const wl = new Set(watchlist.map((t) => normalizeSymbol(t)));
    const matches = wl.size
      ? list
          .map((d) => ({
            symbol: normalizeSymbol(d.symbol),
            valueCr: typeof d.valueCr === 'number' ? d.valueCr : null,
            side: d.side ? String(d.side).toUpperCase() : null,
          }))
          .filter((d) => d.symbol && wl.has(d.symbol))
          .sort((a, b) => (b.valueCr ?? -1) - (a.valueCr ?? -1))
          .slice(0, 3)
      : [];

    const niftyPcr = typeof options?.nifty?.pcr === 'number' ? options?.nifty?.pcr : null;

    return {
      moodText: mood?.text || null,
      moodAt: mood?.updatedAt || null,
      fiiNetCr: fii.data?.fiiNetCr ?? null,
      diiNetCr: fii.data?.diiNetCr ?? null,
      fiiDate: fii.data?.date ?? null,
      vixLast: vix.data?.vixLast ?? null,
      vixPct: vix.data?.vixPct ?? null,
      leader,
      laggard,
      matches,
      niftyPcr,
    };
  }, [indices, deals, options, mood, fii.data, vix.data, watchlist]);

  const loading = (fii.loading && !fii.data) || (vix.loading && !vix.data) || loadingExtras;
  if (loading) {
    return <PanelSkeleton rows={2} columns={1} />;
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
      aria-label="Today's intelligence"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em' }}>
            Today’s Intelligence
          </div>
          <div style={{ marginTop: 3, color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
            Context summary from live modules
          </div>
        </div>
        <LiveBadge lastUpdate={lastUpdatedAt || new Date().toISOString()} />
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 800 }}>Market tone</div>
          <div style={{ marginTop: 8, color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 800, lineHeight: 1.35 }}>
            {view.moodText || '—'}
          </div>
          <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.40)', fontSize: 10.5 }}>
            {view.moodAt ? `As of ${new Date(view.moodAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </div>
        </div>

        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 800 }}>Flows + volatility</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>
              FII: <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>{view.fiiNetCr == null ? '—' : `${view.fiiNetCr >= 0 ? '+' : '−'}₹${Math.abs(view.fiiNetCr).toFixed(0)} Cr`}</span>
            </div>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>
              DII: <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>{view.diiNetCr == null ? '—' : `${view.diiNetCr >= 0 ? '+' : '−'}₹${Math.abs(view.diiNetCr).toFixed(0)} Cr`}</span>
            </div>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>
              India VIX:{' '}
              <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>
                {view.vixLast == null ? '—' : view.vixLast.toFixed(2)}
              </span>
              {typeof view.vixPct === 'number' ? (
                <span style={{ marginLeft: 8, color: toneColor(view.vixPct > 0 ? 'neg' : view.vixPct < 0 ? 'pos' : 'neutral'), fontWeight: 900, fontSize: 11 }}>
                  {view.vixPct >= 0 ? '+' : ''}{view.vixPct.toFixed(2)}%
                </span>
              ) : null}
            </div>
            {view.fiiDate ? (
              <div style={{ color: 'rgba(200,215,240,0.40)', fontSize: 10.5 }}>Trade date: {view.fiiDate}</div>
            ) : null}
          </div>
        </div>

        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 800 }}>Sector pulse</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>
              Leader:{' '}
              <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>
                {view.leader?.name ? view.leader.name.replace(/^NIFTY\s+/i, '') : '—'}
              </span>
              {typeof view.leader?.pct === 'number' ? (
                <span style={{ marginLeft: 8, color: toneColor(view.leader.pct > 0 ? 'pos' : view.leader.pct < 0 ? 'neg' : 'neutral'), fontWeight: 900, fontSize: 11 }}>
                  {view.leader.pct >= 0 ? '+' : ''}{view.leader.pct.toFixed(2)}%
                </span>
              ) : null}
            </div>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>
              Laggard:{' '}
              <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>
                {view.laggard?.name ? view.laggard.name.replace(/^NIFTY\s+/i, '') : '—'}
              </span>
              {typeof view.laggard?.pct === 'number' ? (
                <span style={{ marginLeft: 8, color: toneColor(view.laggard.pct > 0 ? 'pos' : view.laggard.pct < 0 ? 'neg' : 'neutral'), fontWeight: 900, fontSize: 11 }}>
                  {view.laggard.pct >= 0 ? '+' : ''}{view.laggard.pct.toFixed(2)}%
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: 11, fontWeight: 800 }}>Relevance (your list)</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11 }}>
              NIFTY PCR:{' '}
              <span style={{ color: toneColor(pcrTone(view.niftyPcr)), fontWeight: 900 }}>
                {typeof view.niftyPcr === 'number' ? view.niftyPcr.toFixed(2) : '—'}
              </span>
            </div>
            {view.matches.length ? (
              <div style={{ color: 'rgba(200,215,240,0.60)', fontSize: 11, lineHeight: 1.35 }}>
                Deals matching your watchlist: <span style={{ color: 'rgba(245,248,255,0.90)', fontWeight: 900 }}>{view.matches.map((m) => m.symbol).join(', ')}</span>
              </div>
            ) : (
              <div style={{ color: 'rgba(200,215,240,0.40)', fontSize: 10.5, lineHeight: 1.35 }}>
                Add tickers to highlight relevant deals & headlines.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

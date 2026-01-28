'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useMemo, useState } from 'react';

type ExplainResponse = {
  ok?: boolean;
  source?: string;
  provider?: string;
  content?: {
    whatHappened?: string;
    whyItMatters?: string;
    marketMood?: string;
    howItBenefits?: string;
    expertTip?: string;
    whyThisMattersToYou?: string;
  };
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

function readUserContext() {
  if (typeof window === 'undefined') return null;
  const tickersCtx = safeJsonParse<any>(window.localStorage.getItem('li_portfolio_context_v1'), null);
  const alloc = safeJsonParse<any>(window.localStorage.getItem('li_allocations_v1'), null);
  const tickers = Array.isArray(tickersCtx?.tickers) ? tickersCtx.tickers.slice(0, 20) : [];
  const portfolio = {
    tickers,
    allocations: {
      equity: typeof alloc?.equity === 'number' ? alloc.equity : null,
      debt: typeof alloc?.debt === 'number' ? alloc.debt : null,
      gold: typeof alloc?.gold === 'number' ? alloc.gold : null,
      cash: typeof alloc?.cash === 'number' ? alloc.cash : null,
    },
  };
  return { portfolio };
}

function renderBullets(text: string) {
  const lines = String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {lines.map((l, idx) => (
        <div key={`${idx}-${l}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: 'rgba(212,175,55,0.75)', fontWeight: 900, lineHeight: '16px' }}>•</span>
          <div style={{ flex: 1 }}>{l.replace(/^•\s*/, '')}</div>
        </div>
      ))}
    </div>
  );
}

export default function AskIntelligencePanel(props: { style?: CSSProperties }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ExplainResponse | null>(null);

  const quickPrompts = useMemo(
    () => [
      'What does elevated VIX typically imply for volatility?',
      'Explain how FII net selling can affect market sentiment.',
      'What does PCR indicate in options positioning?'
    ],
    []
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const q = prompt.trim();
    if (!q) return;

    setLoading(true);
    setResp(null);
    try {
      const body = {
        headline: q,
        category: 'market',
        whyItMatters: 'Educational context only. No recommendations or predictions.',
        userContext: readUserContext(),
      };

      const r = await fetch('/api/live-intelligence/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = (await r.json().catch(() => null)) as ExplainResponse | null;
      setResp(json || { ok: false, error: 'No response' });
    } catch (err: any) {
      setResp({ ok: false, error: err?.message || 'Failed to fetch' });
    } finally {
      setLoading(false);
    }
  };

  const content = resp?.content;

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(170,198,255,0.12)',
        ...props.style,
      }}
      aria-label="Ask Intelligence"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
            Ask Intelligence
          </div>
          <div style={{ marginTop: 4, color: 'rgba(245,248,255,0.92)', fontSize: 13, fontWeight: 950 }}>
            Fast explainers (education-first)
          </div>
        </div>
        <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
          {loading ? 'Thinking…' : resp?.source ? `Source: ${resp.source}` : '—'}
        </div>
      </div>

      <form onSubmit={submit} style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a market concept question…"
          style={{
            width: '100%',
            background: 'rgba(10,10,12,0.62)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12,
            padding: '10px 12px',
            color: 'rgba(235, 242, 255, 0.92)',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '9px 12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(100,160,255,0.10) 100%)',
              border: '1px solid rgba(212,175,55,0.22)',
              color: 'rgba(245,248,255,0.92)',
              fontSize: 12,
              fontWeight: 950,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            Ask
          </button>

          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setPrompt(q)}
              style={{
                padding: '9px 12px',
                borderRadius: 12,
                background: 'rgba(10,10,12,0.55)',
                border: '1px solid rgba(170,198,255,0.12)',
                color: 'rgba(235,242,255,0.82)',
                fontSize: 12,
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </form>

      {resp?.error ? (
        <div style={{ marginTop: 10, color: 'rgba(255,170,170,0.90)', fontSize: 11 }}>
          {resp.error}
        </div>
      ) : null}

      {content ? (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <div style={{ padding: '12px 12px', borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
            <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 950 }}>What happened</div>
            <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.60)', fontSize: 11, lineHeight: 1.45 }}>{content.whatHappened || '—'}</div>
          </div>
          <div style={{ padding: '12px 12px', borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
            <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 950 }}>Why it matters</div>
            <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.60)', fontSize: 11, lineHeight: 1.45 }}>{content.whyItMatters || '—'}</div>
          </div>
          {content.howItBenefits ? (
            <div style={{ padding: '12px 12px', borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(170,198,255,0.10)' }}>
              <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 950 }}>How it applies</div>
              <div style={{ marginTop: 8, color: 'rgba(200,215,240,0.60)', fontSize: 11, lineHeight: 1.45 }}>
                {renderBullets(content.howItBenefits)}
              </div>
            </div>
          ) : null}
          {content.expertTip ? (
            <div style={{ padding: '12px 12px', borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(212,175,55,0.10)' }}>
              <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 950 }}>Expert tip</div>
              <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.60)', fontSize: 11, lineHeight: 1.45 }}>{content.expertTip}</div>
            </div>
          ) : null}
          {content.whyThisMattersToYou ? (
            <div style={{ padding: '12px 12px', borderRadius: 12, background: 'rgba(10,10,12,0.45)', border: '1px solid rgba(140,220,180,0.12)' }}>
              <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 950 }}>Why this matters to you</div>
              <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.60)', fontSize: 11, lineHeight: 1.45 }}>{content.whyThisMattersToYou}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ marginTop: 10, color: 'rgba(200,215,240,0.35)', fontSize: 10.5, lineHeight: 1.35 }}>
        Best-effort educational explanations. No recommendations.
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'li_portfolio_context_v1';

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeSymbol(value) {
  const s = String(value || '').trim();
  if (!s) return '';
  // Keep it simple: allow letters/numbers, strip other characters.
  return s.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function parseTickers(input) {
  const raw = String(input || '')
    .split(/[\s,;|]+/)
    .map((t) => normalizeSymbol(t))
    .filter(Boolean);

  const out = [];
  const seen = new Set();
  for (const t of raw) {
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out.slice(0, 20);
}

function loadTickersFromStorage() {
  if (typeof window === 'undefined') return [];
  const raw = safeJsonParse(window.localStorage.getItem(STORAGE_KEY) || 'null', null);
  const list = Array.isArray(raw?.tickers) ? raw.tickers : Array.isArray(raw?.symbols) ? raw.symbols : [];
  return (list || []).map((t) => normalizeSymbol(t)).filter(Boolean).slice(0, 20);
}

export default function PortfolioTickersPanel() {
  const [input, setInput] = useState('');
  const [savedTickers, setSavedTickers] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const tickers = loadTickersFromStorage();
    setSavedTickers(tickers);
    setInput(tickers.join(', '));
  }, []);

  const parsed = useMemo(() => parseTickers(input), [input]);

  function publishUpdate() {
    try {
      window.dispatchEvent(new Event('li-portfolio-updated'));
    } catch {
      // ignore
    }
  }

  const handleSave = () => {
    if (typeof window === 'undefined') return;

    const next = { tickers: parsed };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedTickers(parsed);
    setStatus(parsed.length ? `Saved ${parsed.length} ticker${parsed.length === 1 ? '' : 's'}` : 'Saved (empty)');
    publishUpdate();
    setTimeout(() => setStatus(''), 2000);
  };

  const handleClear = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedTickers([]);
    setInput('');
    setStatus('Cleared');
    publishUpdate();
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
      }}
      aria-label="Your tickers"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            Your tickers
          </div>
          <div style={{ marginTop: '3px', color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
            Used to highlight relevant headlines & deals
          </div>
        </div>
        <div style={{ color: 'rgba(200,215,240,0.45)', fontSize: '11px' }}>
          {savedTickers.length ? `${savedTickers.length} saved` : 'Not set'}
        </div>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. TCS, HDFCBANK, INFY"
          style={{
            width: '100%',
            padding: '10px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(170,198,255,0.14)',
            outline: 'none',
            background: 'rgba(10,10,12,0.45)',
            color: 'rgba(245,248,255,0.90)',
            fontSize: '12px',
          }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'rgba(200,215,240,0.40)', fontSize: '11px' }}>
            Parsed: {parsed.length ? parsed.join(', ') : '—'}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '7px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(200,215,240,0.70)',
              }}
              title="Clear portfolio tickers"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '7px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                background: 'rgba(170,198,255,0.10)',
                border: '1px solid rgba(170,198,255,0.14)',
                color: 'rgba(170,198,255,0.90)',
              }}
              title="Save portfolio tickers"
            >
              Save
            </button>
          </div>
        </div>

        {status ? (
          <div style={{ color: 'rgba(200,215,240,0.55)', fontSize: '11px' }}>{status}</div>
        ) : null}
      </div>
    </div>
  );
}

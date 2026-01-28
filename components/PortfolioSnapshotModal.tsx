'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

const KEY = 'li_portfolio_snapshot_v1';

type SnapshotDraft = {
  investedL: string;
  currentL: string;
};

type Snapshot = {
  investedL: number;
  currentL: number;
  updatedAt: string;
};

function safeParse(value: string | null): unknown {
  try {
    return JSON.parse(value ?? 'null');
  } catch {
    return null;
  }
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function loadSnapshot(): Snapshot | null {
  if (typeof window === 'undefined') return null;
  const raw = safeParse(window.localStorage.getItem(KEY));
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  const investedL = toFiniteNumber(obj.investedL);
  const currentL = toFiniteNumber(obj.currentL);
  const updatedAt = typeof obj.updatedAt === 'string' ? obj.updatedAt : null;

  if (investedL == null || currentL == null || !updatedAt) return null;
  return { investedL, currentL, updatedAt };
}

function publishUpdate() {
  try {
    window.dispatchEvent(new CustomEvent('li-portfolio-snapshot-updated'));
  } catch {
    // ignore
  }
}

export function PortfolioSnapshotButton(props: { className?: string; style?: CSSProperties }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<SnapshotDraft>({ investedL: '', currentL: '' });

  const snapshot = useMemo(() => loadSnapshot(), [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const snap = loadSnapshot();
    if (!snap) {
      setDraft({ investedL: '', currentL: '' });
      return;
    }
    setDraft({ investedL: String(snap.investedL), currentL: String(snap.currentL) });
  }, [isOpen]);

  const asOfText = useMemo(() => {
    if (!snapshot?.updatedAt) return null;
    try {
      return new Date(snapshot.updatedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [snapshot?.updatedAt]);

  const handleSave = () => {
    if (typeof window === 'undefined') return;
    const investedL = toFiniteNumber(draft.investedL);
    const currentL = toFiniteNumber(draft.currentL);

    if (investedL == null || currentL == null || investedL < 0 || currentL < 0) {
      // eslint-disable-next-line no-alert
      alert('Please enter valid numbers.');
      return;
    }

    const payload: Snapshot = {
      investedL,
      currentL,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(KEY, JSON.stringify(payload));
    publishUpdate();
    setIsOpen(false);
  };

  const handleClear = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KEY);
    publishUpdate();
    setDraft({ investedL: '', currentL: '' });
    setIsOpen(false);
  };

  return (
    <>
      <button type="button" className={props.className} style={props.style} onClick={() => setIsOpen(true)}>
        Set Portfolio
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio snapshot"
          onMouseDown={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 14,
              background: 'rgba(15, 18, 25, 0.98)',
              border: '1px solid rgba(100, 160, 255, 0.22)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.55)',
              padding: 16,
              color: 'rgba(235, 242, 255, 0.92)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Portfolio Snapshot</div>
                <div style={{ marginTop: 2, fontSize: 11, color: 'rgba(200,215,240,0.55)' }}>
                  Saved locally on this device. Not investment advice.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(200,215,240,0.7)',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: 6,
                }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {snapshot && asOfText ? (
              <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(200,215,240,0.55)' }}>
                Current snapshot: Invested ₹{snapshot.investedL}L · Value ₹{snapshot.currentL}L · As of {asOfText}
              </div>
            ) : null}

            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Total invested (₹ in Lakhs, e.g., 12.5)"
                value={draft.investedL}
                onChange={(e) => setDraft((d) => ({ ...d, investedL: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(10,10,12,0.65)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  color: 'rgba(235, 242, 255, 0.92)',
                  outline: 'none',
                }}
              />

              <input
                type="number"
                inputMode="decimal"
                placeholder="Current value (₹ in Lakhs, e.g., 14.2)"
                value={draft.currentL}
                onChange={(e) => setDraft((d) => ({ ...d, currentL: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(10,10,12,0.65)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  color: 'rgba(235, 242, 255, 0.92)',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(140,220,180,0.35)',
                    background: 'linear-gradient(135deg, rgba(140,220,180,0.16) 0%, rgba(100,180,255,0.10) 100%)',
                    color: 'rgba(245,248,255,0.95)',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Save Snapshot
                </button>

                {snapshot ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      borderRadius: 12,
                      padding: '10px 12px',
                      border: '1px solid rgba(255,255,255,0.10)',
                      background: 'rgba(10,10,12,0.65)',
                      color: 'rgba(235,242,255,0.85)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      borderRadius: 12,
                      padding: '10px 12px',
                      border: '1px solid rgba(255,255,255,0.10)',
                      background: 'rgba(10,10,12,0.65)',
                      color: 'rgba(235,242,255,0.85)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div style={{ marginTop: 2, fontSize: 11, color: 'rgba(200,215,240,0.45)', lineHeight: 1.4 }}>
                This is a manual snapshot for dashboards and education. For actual holdings, use Connect Portfolio.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

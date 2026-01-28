'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

const KEY_NAME = 'li_client_name_v1';
const KEY_TIER = 'li_client_tier_v1';
const KEY_SINCE = 'li_client_since_v1';

type Tier = 'Private' | 'Gold' | 'Platinum' | 'Family Office';

function safeGet(key: string): string {
  try {
    return typeof window === 'undefined' ? '' : window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function isoToday(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

function formatSince(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function greeting(): string {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ClientIdentityPanel(props: { style?: CSSProperties }) {
  const [name, setName] = useState('');
  const [tier, setTier] = useState<Tier>('Private');
  const [since, setSince] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [snapshotReturnPct, setSnapshotReturnPct] = useState<number | null>(null);

  useEffect(() => {
    const n = safeGet(KEY_NAME);
    const t = (safeGet(KEY_TIER) as Tier) || 'Private';
    const s = safeGet(KEY_SINCE);
    setName(n);
    setTier((['Private', 'Gold', 'Platinum', 'Family Office'] as Tier[]).includes(t) ? t : 'Private');
    setSince(s || isoToday());

    if (!s) safeSet(KEY_SINCE, isoToday());

    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('li_portfolio_snapshot_v1') : null;
      const snap = raw ? (JSON.parse(raw) as any) : null;
      const invested = typeof snap?.investedL === 'number' ? snap.investedL : null;
      const current = typeof snap?.currentL === 'number' ? snap.currentL : null;
      if (invested != null && current != null && invested > 0) {
        setSnapshotReturnPct(((current - invested) / invested) * 100);
      } else {
        setSnapshotReturnPct(null);
      }
    } catch {
      setSnapshotReturnPct(null);
    }
  }, []);

  const label = useMemo(() => {
    const g = greeting();
    if (!name.trim()) return `${g}.`;
    return `${g}, ${name.trim()}`;
  }, [name]);

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(120,190,255,0.06) 100%)',
        border: '1px solid rgba(212,175,55,0.18)',
        boxShadow: '0 14px 36px rgba(0,0,0,0.28)',
        ...props.style,
      }}
      aria-label="Private client header"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'rgba(245,248,255,0.94)', fontSize: 16, fontWeight: 950, letterSpacing: '-0.01em' }}>
            {label}
          </div>
          <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.55)', fontSize: 12, lineHeight: 1.4 }}>
            Private Client Dashboard • Tier: <span style={{ color: 'rgba(235,242,255,0.86)', fontWeight: 800 }}>{tier}</span> • Since: {formatSince(since)}
          </div>
          <div style={{ marginTop: 6, color: 'rgba(200,215,240,0.55)', fontSize: 12, lineHeight: 1.4 }}>
            Portfolio snapshot: <span style={{ color: 'rgba(235,242,255,0.86)', fontWeight: 800 }}>
              {snapshotReturnPct == null ? '—' : `${snapshotReturnPct >= 0 ? '+' : ''}${snapshotReturnPct.toFixed(1)}%`}
            </span>
            <span style={{ marginLeft: 8, color: 'rgba(200,215,240,0.40)', fontSize: 11 }}>
              (vs invested; local snapshot)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              background: 'rgba(10,10,12,0.50)',
              border: '1px solid rgba(212,175,55,0.22)',
              color: 'rgba(212,175,55,0.95)',
              fontSize: 11,
              fontWeight: 950,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span aria-hidden="true">💎</span>
            Premium Client
          </div>

          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            style={{
              appearance: 'none',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(10,10,12,0.55)',
              color: 'rgba(235,242,255,0.85)',
              padding: '7px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            {isEditing ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              safeSet(KEY_NAME, v);
            }}
            placeholder="Client name (stored locally)"
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

          <select
            value={tier}
            onChange={(e) => {
              const v = e.target.value as Tier;
              setTier(v);
              safeSet(KEY_TIER, v);
            }}
            style={{
              width: '100%',
              background: 'rgba(10,10,12,0.62)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '10px 12px',
              color: 'rgba(235, 242, 255, 0.92)',
              outline: 'none',
            }}
          >
            <option value="Private">Private</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
            <option value="Family Office">Family Office</option>
          </select>

          <div style={{ fontSize: 11, color: 'rgba(200,215,240,0.45)', lineHeight: 1.4 }}>
            Name/tier are stored locally on this device (no login yet).
          </div>
        </div>
      ) : null}
    </div>
  );
}

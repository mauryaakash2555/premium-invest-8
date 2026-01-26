'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatTimeAgo } from '@/lib/utils/time';

function toMs(input: number | string | Date | null | undefined) {
  if (input == null) return null;
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (input instanceof Date) return input.getTime();
  const d = new Date(String(input));
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

export function LiveBadge(props: {
  lastUpdate: number | string | Date;
  label?: string;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const tsMs = useMemo(() => toMs(props.lastUpdate), [props.lastUpdate, tick]);
  const timeAgo = useMemo(() => (tsMs ? formatTimeAgo(tsMs) : '—'), [tsMs]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(200,215,240,0.55)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, letterSpacing: '0.04em' }}>
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'rgba(255, 80, 80, 0.95)',
            boxShadow: '0 0 10px rgba(255, 80, 80, 0.55)',
            animation: 'liPulse 1.6s ease-in-out infinite',
          }}
        />
        {props.label || 'LIVE'}
      </span>
      <span style={{ color: 'rgba(200,215,240,0.40)' }}>• Updated {timeAgo}</span>
      <style jsx>{`
        @keyframes liPulse {
          0% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

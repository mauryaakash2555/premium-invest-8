'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCurrentMode, getISTNow, getISTTimeHHMM } from '@/lib/modes';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatISTWithSeconds(date) {
  const ist = getISTNow(date);
  return `${pad2(ist.getHours())}:${pad2(ist.getMinutes())}:${pad2(ist.getSeconds())} IST`;
}

export default function ModeHeaderTitle({
  className = '',
  showClock = true,
  showDescription = true,
}) {
  const [mode, setMode] = useState(() => getCurrentMode());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setMode(getCurrentMode());
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const title = useMemo(() => {
    // Brand-first title; keep mode label separate to avoid emoji-heavy headers.
    const label = mode?.name || 'Live Intelligence';
    return label;
  }, [mode]);

  const description = mode?.description;
  const timeLabel = showClock
    ? mode?.timeRange
      ? `${mode.timeRange} · ${formatISTWithSeconds(now)}`
      : `${getISTTimeHHMM()} · ${formatISTWithSeconds(now)}`
    : null;

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <h1 className="text-white text-xl font-bold tracking-tight">BM Wealth</h1>
        <span className="text-white/70 text-sm font-semibold">Live Intelligence</span>
        <span className="text-white/70 text-xs font-semibold px-2 py-0.5 rounded-full border border-white/15 bg-white/5">
          {title}
        </span>
        {timeLabel ? (
          <span className="text-xs text-white/70">{timeLabel}</span>
        ) : null}
      </div>
      {showDescription && description ? (
        <div className="text-xs text-white/70 leading-snug">{description}</div>
      ) : null}
    </div>
  );
}

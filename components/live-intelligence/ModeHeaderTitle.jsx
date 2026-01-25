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
    const label = mode?.name || 'Live Intelligence';
    const icon = mode?.icon || '';
    return icon ? `${icon} ${label}` : label;
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
        <h1 className="text-white text-xl font-bold tracking-tight">{title}</h1>
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

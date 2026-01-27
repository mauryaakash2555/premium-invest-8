'use client';

import { useEffect, useMemo, useState } from 'react';

function getIstNow() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + (istOffset - now.getTimezoneOffset() * 60 * 1000));
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dayShort(d) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d] || '';
}

function getMarketPhase(istTime) {
  const day = istTime.getDay(); // 0 Sun
  const isWeekday = day >= 1 && day <= 5;

  const minutes = istTime.getHours() * 60 + istTime.getMinutes();

  const preOpenStart = 9 * 60; // 09:00
  const openStart = 9 * 60 + 15; // 09:15
  const openEnd = 15 * 60 + 30; // 15:30
  const afterEnd = 16 * 60; // 16:00 (simple)

  if (!isWeekday) return { phase: 'CLOSED', isOpen: false };
  if (minutes >= openStart && minutes <= openEnd) return { phase: 'OPEN', isOpen: true };
  if (minutes >= preOpenStart && minutes < openStart) return { phase: 'PRE-MKT', isOpen: false };
  if (minutes > openEnd && minutes <= afterEnd) return { phase: 'AFTER', isOpen: false };
  return { phase: 'CLOSED', isOpen: false };
}

function nextMarketBoundary(istTime) {
  // returns { label, target } where target is Date in IST
  const day = istTime.getDay();
  const minutes = istTime.getHours() * 60 + istTime.getMinutes();

  const openStartM = 9 * 60 + 15;
  const openEndM = 15 * 60 + 30;

  const mkDateAtMinutes = (base, mins) => {
    const d = new Date(base);
    d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    return d;
  };

  const isWeekday = day >= 1 && day <= 5;

  // If open → next boundary is close
  if (isWeekday && minutes >= openStartM && minutes <= openEndM) {
    return { label: 'Closes in', target: mkDateAtMinutes(istTime, openEndM) };
  }

  // Otherwise → next boundary is next open
  // If today weekday and before open
  if (isWeekday && minutes < openStartM) {
    return { label: 'Opens in', target: mkDateAtMinutes(istTime, openStartM) };
  }

  // Else find next weekday
  const target = new Date(istTime);
  target.setHours(0, 0, 0, 0);
  do {
    target.setDate(target.getDate() + 1);
  } while (target.getDay() === 0 || target.getDay() === 6);
  target.setHours(9, 15, 0, 0);
  return { label: 'Opens in', target };
}

function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) return `${hh}h ${mm}m`;
  return `${mm}m ${ss}s`;
}

export default function MarketClockStatusBadge() {
  const [ist, setIst] = useState(() => getIstNow());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let raf = 0;
    let id = 0;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const update = () => {
      setIst(getIstNow());
      setTick((t) => t + 1);
    };

    update();

    if (prefersReduced) {
      id = window.setInterval(update, 1000);
      return () => window.clearInterval(id);
    }

    // Align to next second boundary for smoother clock
    const loop = () => {
      const now = Date.now();
      const toNext = 1000 - (now % 1000);
      id = window.setTimeout(() => {
        update();
        raf = window.requestAnimationFrame(loop);
      }, toNext);
    };

    raf = window.requestAnimationFrame(loop);
    return () => {
      window.clearTimeout(id);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const ui = useMemo(() => {
    const phase = getMarketPhase(ist);
    const boundary = nextMarketBoundary(ist);
    const ms = boundary.target.getTime() - ist.getTime();

    const boundaryDay = boundary?.target ? dayShort(boundary.target.getDay()) : '';
    const boundaryTime = boundary?.target
      ? `${pad2(boundary.target.getHours())}:${pad2(boundary.target.getMinutes())}`
      : '';
    const boundaryExact = boundaryDay && boundaryTime ? `${boundaryDay} ${boundaryTime} IST` : '';

    const timeStr = `${pad2(ist.getHours())}:${pad2(ist.getMinutes())}:${pad2(ist.getSeconds())}`;

    const color = phase.isOpen ? 'rgba(100, 220, 180, 0.95)' : 'rgba(255, 100, 100, 0.85)';
    const dim = phase.isOpen ? 'rgba(100, 220, 180, 0.12)' : 'rgba(255, 100, 100, 0.10)';
    const border = phase.isOpen ? 'rgba(100, 220, 180, 0.30)' : 'rgba(255, 100, 100, 0.26)';

    return {
      phase,
      boundary,
      countdown: formatCountdown(ms),
      timeStr,
      boundaryExact,
      color,
      dim,
      border,
    };
  }, [ist]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}
      aria-label="Market status and time"
    >
      <span
        key={tick}
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: ui.color,
          textShadow: ui.phase.isOpen ? '0 0 10px rgba(100, 220, 180, 0.25)' : '0 0 10px rgba(255, 100, 100, 0.18)',
          animation: 'liClockTick 280ms ease-out',
        }}
        title="Time (IST)"
      >
        {ui.timeStr} IST
      </span>

      <span
        style={{
          position: 'relative',
          padding: '3px 10px',
          borderRadius: '999px',
          fontSize: '10px',
          fontWeight: 900,
          letterSpacing: '0.12em',
          background: ui.dim,
          border: `1px solid ${ui.border}`,
          color: ui.color,
          textTransform: 'uppercase',
          overflow: 'hidden',
        }}
        title={`NSE • ${ui.phase.phase} • ${ui.boundary.label} ${ui.countdown}`}
      >
        <span
          style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: '999px',
            border: ui.phase.isOpen ? '2px solid rgba(100, 220, 180, 0.20)' : '2px solid rgba(255, 100, 100, 0.14)',
            filter: 'blur(0px)',
            animation: ui.phase.isOpen ? 'liRingSpin 2.4s linear infinite' : 'none',
            pointerEvents: 'none',
          }}
        />
        NSE • {ui.phase.phase}
      </span>

      <span style={{ color: 'rgba(180,200,230,0.55)', fontSize: '10px' }}>
        {ui.boundary.label} {ui.countdown}
        <span style={{ color: 'rgba(180,200,230,0.40)' }}>
          {' '}
          • Hours 09:15–15:30 IST
          {ui.boundaryExact ? ` • Next ${ui.boundaryExact}` : ''}
        </span>
      </span>

      <style jsx>{`
        @keyframes liClockTick {
          0% { opacity: 0.65; transform: translateY(-1px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes liRingSpin {
          0% { transform: rotate(0deg); opacity: 0.55; }
          50% { opacity: 0.95; }
          100% { transform: rotate(360deg); opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

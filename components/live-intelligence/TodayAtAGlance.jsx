'use client';

/**
 * TodayAtAGlance — premium inline strip for Live Intelligence.
 * Shows: IST date & time · bank open/closed · holiday name · next upcoming holiday.
 * Auto-refreshes every 60 s so time stays accurate.
 *
 * Color palette: ice-blue (matches Live Intelligence laser theme).
 */

import { useState, useEffect, useMemo } from 'react';
import { getTodayBankStatus, getNextHoliday } from '@/lib/time/indianBankCalendar';

export default function TodayAtAGlance() {
  const [tick, setTick] = useState(0);

  // Refresh every 60 s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const status = useMemo(() => getTodayBankStatus(), [tick]);
  const nextHol = useMemo(() => getNextHoliday(), [tick]);

  const bankColor = status.bankOpen
    ? 'rgba(80, 220, 120, 0.95)'   // green
    : 'rgba(255, 100, 100, 0.90)'; // red

  const bankBg = status.bankOpen
    ? 'rgba(80, 220, 120, 0.08)'
    : 'rgba(255, 100, 100, 0.08)';

  const bankBorder = status.bankOpen
    ? 'rgba(80, 220, 120, 0.22)'
    : 'rgba(255, 100, 100, 0.22)';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(100,180,255,0.04) 0%, rgba(100,180,255,0.01) 100%)',
        border: '1px solid rgba(100,180,255,0.10)',
        marginTop: '10px',
      }}
    >
      {/* Date */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'rgba(200,215,240,0.85)',
          letterSpacing: '0.02em',
        }}
      >
        📅 {status.date}
      </span>

      <span style={{ color: 'rgba(200,215,240,0.25)', fontSize: '11px' }}>·</span>

      {/* Time */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'rgba(200,215,240,0.65)',
        }}
      >
        🕐 {status.time}
      </span>

      <span style={{ color: 'rgba(200,215,240,0.25)', fontSize: '11px' }}>·</span>

      {/* Bank Status */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: 800,
          color: bankColor,
          padding: '3px 10px',
          borderRadius: '999px',
          background: bankBg,
          border: `1px solid ${bankBorder}`,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '999px',
            background: bankColor,
            boxShadow: `0 0 8px ${bankColor}`,
          }}
        />
        {status.bankOpen ? 'Banks Open' : 'Banks Closed'}
      </span>

      {/* Reason / Holiday Name */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: status.holiday
            ? 'rgba(255, 200, 100, 0.88)'
            : 'rgba(200,215,240,0.50)',
          fontStyle: status.holiday ? 'italic' : 'normal',
        }}
      >
        {status.reason}
      </span>

      {/* Next upcoming holiday */}
      {nextHol && (
        <>
          <span style={{ color: 'rgba(200,215,240,0.25)', fontSize: '11px' }}>·</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(200,215,240,0.50)',
            }}
          >
            Next holiday: <span style={{ color: 'rgba(255, 200, 100, 0.80)' }}>{nextHol.name}</span>{' '}
            ({nextHol.date}, {nextHol.daysAway === 1 ? 'tomorrow' : `${nextHol.daysAway} days`})
          </span>
        </>
      )}
    </div>
  );
}

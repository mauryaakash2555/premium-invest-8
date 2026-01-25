'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { easeOutCubic } from '@/utils/easing';
import { ANIMATION_CONFIG } from '@/utils/animationConfig';

type Props = {
  value: number;
  durationMs?: number;
  locale?: string;
  currencySymbol?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  ariaLabel?: string;
};

export default function AnimatedNumber({
  value,
  durationMs = ANIMATION_CONFIG.defaults.numberDurationMs,
  locale = 'en-IN',
  currencySymbol,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2,
  prefix,
  suffix,
  className,
  ariaLabel,
}: Props) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(0);
  const toRef = useRef<number>(value);

  useEffect(() => {
    toRef.current = value;
    fromRef.current = displayValue;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const t = durationMs <= 0 ? 1 : Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      const next = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplayValue(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Snap to final value
        setDisplayValue(toRef.current);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  const formatted = useMemo(() => {
    const nf = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    const base = nf.format(displayValue);
    const full = `${prefix ?? ''}${currencySymbol ?? ''}${base}${suffix ?? ''}`;
    return full;
  }, [currencySymbol, displayValue, locale, maximumFractionDigits, minimumFractionDigits, prefix, suffix]);

  const finalFormatted = useMemo(() => {
    const nf = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    const base = nf.format(value);
    return `${prefix ?? ''}${currencySymbol ?? ''}${base}${suffix ?? ''}`;
  }, [currencySymbol, locale, maximumFractionDigits, minimumFractionDigits, prefix, suffix, value]);

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span aria-hidden="true">{formatted}</span>
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
        aria-live="polite"
      >
        {ariaLabel ? `${ariaLabel}: ${finalFormatted}` : finalFormatted}
      </span>
    </span>
  );
}

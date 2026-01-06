"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * AnimatedCounter
 * - Uses requestAnimationFrame for smooth updates.
 * - Accepts a formatter so callers can display INR/Cr/etc.
 */
export function AnimatedCounter({
  value,
  duration = 2000,
  format,
  prefix = "",
  suffix = "",
  locale = "en-IN",
  maximumFractionDigits = 0,
  className,
  style,
}) {
  const targetValue = Number(value || 0);
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const fromRef = useRef(0);
  const startedRef = useRef(false);

  const formatter = useMemo(() => {
    if (typeof format === "function") return format;
    const nf = new Intl.NumberFormat(locale, { maximumFractionDigits });
    return (n) => `${prefix}${nf.format(n)}${suffix}`;
  }, [format, prefix, suffix, locale, maximumFractionDigits]);

  useEffect(() => {
    const to = Number.isFinite(targetValue) ? targetValue : 0;
    const from = startedRef.current ? displayValue : 0;
    fromRef.current = from;
    startedRef.current = true;

    const dur = clamp(Number(duration || 0), 250, 5000);
    const t0 = performance.now();

    function step(t) {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = fromRef.current + (to - fromRef.current) * eased;
      setDisplayValue(next);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration]);

  const rendered = useMemo(() => {
    const n = Number.isFinite(displayValue) ? displayValue : 0;
    const rounded = maximumFractionDigits > 0 ? n : Math.round(n);
    return formatter(rounded);
  }, [displayValue, formatter, maximumFractionDigits]);

  return (
    <span className={className} style={style}>
      {rendered}
    </span>
  );
}

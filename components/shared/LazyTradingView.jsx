'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * LazyTradingView - Intersection Observer wrapper for TradingView widgets
 * Only loads the heavy TradingView iframe when it's about to enter the viewport.
 * Saves ~2MB+ of third-party JS until actually needed.
 */
export default function LazyTradingView({
  children,
  minHeight = 400,
  rootMargin = '200px',
  placeholder = null,
}) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  const defaultPlaceholder = (
    <div
      style={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
      }}
    >
      Loading chart...
    </div>
  );

  return (
    <div ref={ref} style={{ minHeight }}>
      {shouldLoad ? children : (placeholder || defaultPlaceholder)}
    </div>
  );
}

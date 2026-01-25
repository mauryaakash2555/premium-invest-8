'use client';

import { useEffect, useMemo, useState } from 'react';

export function useAnimation() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(!!mq.matches);

    update();

    // Safari fallback
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  return useMemo(
    () => ({
      prefersReducedMotion,
    }),
    [prefersReducedMotion]
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';

type Options = {
  minDurationMs?: number;
  delayMs?: number;
};

// Helps avoid loader flicker and provides a single place to manage loading UX timing.
export function useLoadingAnimation(isLoading: boolean, { minDurationMs = 350, delayMs = 0 }: Options = {}) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let delayTimer: any;
    let minTimer: any;

    if (isLoading) {
      delayTimer = setTimeout(() => setShowLoader(true), Math.max(0, delayMs));
      return () => {
        clearTimeout(delayTimer);
      };
    }

    // When loading ends, keep the loader for a minimum duration if it ever showed.
    if (showLoader) {
      minTimer = setTimeout(() => setShowLoader(false), Math.max(0, minDurationMs));
      return () => clearTimeout(minTimer);
    }

    setShowLoader(false);
    return () => {};
  }, [isLoading, delayMs, minDurationMs, showLoader]);

  return useMemo(() => ({ showLoader }), [showLoader]);
}

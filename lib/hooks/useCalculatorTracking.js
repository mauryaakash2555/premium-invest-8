'use client';

import { useCallback, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Template-driven analytics for calculators.
 * - Injects `calculator_type` consistently.
 * - Prevents duplicate GA events with identical payloads.
 */
export function useCalculatorTracking(calculatorType) {
  const dedupeRef = useRef(new Set());

  const track = useCallback(
    (eventName, params = {}) => {
      try {
        const key = `${eventName}|${JSON.stringify(params || {})}`;
        if (dedupeRef.current.has(key)) return;
        dedupeRef.current.add(key);
      } catch {
        // if stringify fails, proceed (best effort)
      }

      trackEvent(eventName, { ...(params || {}), calculator_type: calculatorType });
    },
    [calculatorType]
  );

  return { track };
}

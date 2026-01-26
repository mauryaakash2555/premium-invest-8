'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

// Lightweight hook to help orchestrate route-based transitions.
// Usage: use as a key on a wrapper motion/div to trigger entrance animations.
export function usePageTransition() {
  const pathname = usePathname();
  return useMemo(
    () => ({
      transitionKey: pathname || 'page',
    }),
    [pathname]
  );
}

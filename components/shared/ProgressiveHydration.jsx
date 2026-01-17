'use client';

import { useState, useEffect } from 'react';

/**
 * ProgressiveHydration - Delays hydration of heavy components
 * 
 * Uses requestIdleCallback to hydrate during browser idle time,
 * reducing main thread blocking and improving TBT/INP scores.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Components to hydrate
 * @param {'idle' | 'visible' | 'interaction'} props.when - When to hydrate
 * @param {number} props.delay - Fallback delay in ms (default: 1000)
 */
export default function ProgressiveHydration({ 
  children, 
  when = 'idle',
  delay = 1000,
  fallback = null 
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (when === 'idle') {
      // Use requestIdleCallback for low-priority hydration
      if ('requestIdleCallback' in window) {
        const idleId = requestIdleCallback(() => setHydrated(true), { timeout: 2000 });
        return () => cancelIdleCallback(idleId);
      } else {
        // Fallback for Safari and older browsers
        const timer = setTimeout(() => setHydrated(true), delay);
        return () => clearTimeout(timer);
      }
    } else if (when === 'visible') {
      // Hydrate immediately when visible
      setHydrated(true);
    } else if (when === 'interaction') {
      // Hydrate on first user interaction
      const handleInteraction = () => {
        setHydrated(true);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('scroll', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
      document.addEventListener('click', handleInteraction, { passive: true });
      document.addEventListener('scroll', handleInteraction, { passive: true });
      document.addEventListener('keydown', handleInteraction, { passive: true });
      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('scroll', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    }
  }, [when, delay]);

  if (!hydrated) {
    // Return fallback or empty placeholder to maintain layout
    return fallback || <div style={{ visibility: 'hidden' }} aria-hidden="true" />;
  }

  return children;
}

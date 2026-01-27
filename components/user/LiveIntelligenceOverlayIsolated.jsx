'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';

import ClientErrorBoundary from '@/components/shared/ClientErrorBoundary';

const LiveIntelligenceOverlayLazy = dynamic(() => import('@/components/user/LiveIntelligenceOverlay'), {
  ssr: false,
  loading: () => null,
});

export default function LiveIntelligenceOverlayIsolated(props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancel = () => undefined;

    try {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => setReady(true), { timeout: 1500 });
        cancel = () => window.cancelIdleCallback?.(id);
      } else {
        const id = window.setTimeout(() => setReady(true), 250);
        cancel = () => window.clearTimeout(id);
      }
    } catch {
      setReady(true);
    }

    return () => cancel();
  }, []);

  if (!ready) return null;

  return (
    <ClientErrorBoundary name="LiveIntelligenceOverlay" eventType="live_intelligence_overlay_error" fallback={null}>
      <Suspense fallback={null}>
        <LiveIntelligenceOverlayLazy {...props} />
      </Suspense>
    </ClientErrorBoundary>
  );
}

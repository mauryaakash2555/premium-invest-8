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

    // Render ASAP. This overlay is user-facing and should not be gated behind
    // requestIdleCallback (it makes the UI feel "missing" on load).
    setReady(true);
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

'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navigation from '@/components/user/Navigation';
import Footer from '@/components/user/Footer';

// Non-critical overlays: lazy-loaded to reduce initial JS and improve TBT/LCP.
const WhatsAppFloat = dynamic(() => import('@/components/user/WhatsAppFloat'), { ssr: false });
const LuxuryMobileDock = dynamic(() => import('@/components/user/LuxuryMobileDock').then(m => m.LuxuryMobileDock), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/shared/CookieConsent'), { ssr: false });
const AnalyticsGate = dynamic(() => import('@/components/analytics/AnalyticsGate').then(m => m.AnalyticsGate), { ssr: false });

export default function LayoutShellClient({
  children,
  isStoreHost,
  buildId,
  measurementId,
}) {
  const pathname = usePathname();
  const isLaserPage = pathname === '/live-intelligence';
  const isClientPortal = pathname === '/client-portal';
  const isLearn = typeof pathname === 'string' && pathname.startsWith('/learn');
  const isUniverse = typeof pathname === 'string' && pathname.startsWith('/universe');
  const isBlog = typeof pathname === 'string' && pathname.startsWith('/blog');
  const hasCustomFooter = isLaserPage || isClientPortal || isLearn || isUniverse;

  return (
    <>
      <div
        className="main-wrapper"
        data-ui-build={buildId}
        style={{
          overflowX: 'hidden',
          maxWidth: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        {!isStoreHost && !isLearn && !isUniverse && <Navigation />}
        <main style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%' }}>
          {children}
        </main>
        {!hasCustomFooter && !isStoreHost && <Footer />}
      </div>

      {!isStoreHost && !isLearn && !isUniverse && <LuxuryMobileDock />}
      {!isStoreHost && !isLearn && !isUniverse && <WhatsAppFloat />}

      <CookieConsent />
      <AnalyticsGate measurementId={measurementId} />
    </>
  );
}

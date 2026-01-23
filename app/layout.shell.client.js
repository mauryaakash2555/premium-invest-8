'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/user/Navigation';
import Footer from '@/components/user/Footer';
import WhatsAppFloat from '@/components/user/WhatsAppFloat';
import { LuxuryMobileDock } from '@/components/user/LuxuryMobileDock';
import CookieConsent from '@/components/shared/CookieConsent';
import { AnalyticsGate } from '@/components/analytics/AnalyticsGate';
import { Toaster } from 'react-hot-toast';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export default function LayoutShellClient({
  children,
  isStoreHost,
  buildId,
  measurementId,
}) {
  const pathname = usePathname();
  const isLaserPage = pathname === '/live-intelligence';
  const isClientPortal = pathname === '/client-portal';
  const hasCustomFooter = isLaserPage || isClientPortal;

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
        {!isStoreHost && <Navigation />}
        {!isStoreHost && <Breadcrumbs />}
        <main style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%' }}>
          {children}
        </main>
        {!hasCustomFooter && !isStoreHost && <Footer />}
      </div>

      {!isStoreHost && <LuxuryMobileDock />}
      {!isStoreHost && <WhatsAppFloat />}

      <CookieConsent />
      <AnalyticsGate measurementId={measurementId} />

      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
    </>
  );
}

'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔒 LOCKED FILE - /live-intelligence PAGE                                    ║
 * ║  Last Updated: January 15, 2026                                               ║
 * ║                                                                               ║
 * ║  IF YOU BREAK THIS FILE:                                                      ║
 * ║  Copy-Item "backup\live-intelligence-locked-2026-01-15\page.jsx" "app\live-intelligence\" -Force ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * ⚠️ DESIGN LOCK: This page renders the EXACT SAME LiveIntelligencePanel
 * that the overlay uses. Any changes to the overlay panel automatically
 * reflect here.
 * 
 * - Same colors, background, typography, spacing, components
 * - NO main website theme leak
 * - NO global CSS from homepage
 * - Uses the shared LiveIntelligencePanel component
 * - Uses LaserFooter (same as overlay) NOT the system Footer
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import the EXACT panel component from the overlay
// This ensures 1:1 parity - any overlay changes automatically apply here
import { LiveIntelligencePanel } from '@/components/user/LiveIntelligenceOverlay';

// Import LaserFooter - the SAME footer used by the overlay (NOT the system Footer)
import LaserFooter from '@/components/user/LaserFooter';

// Tiny portal hint - NOT learning UI, just a subtle gateway
import Link from 'next/link';

export default function LiveIntelligencePage() {
  const router = useRouter();

  useEffect(() => {
    // Set body attribute for consistent styling (hides mobile dock, etc.)
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-laser-active', 'true');
    }
    // Also set on <html> to reliably scope scrollbar styling (some browsers scroll the root element)
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-laser-active', 'true');
    }
    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.removeAttribute('data-laser-active');
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.removeAttribute('data-laser-active');
      }
    };
  }, []);

  // Handle the back/close button - navigate to home
  const handleClose = () => {
    router.push('/');
  };

  return (
    <div
      className="li-page-wrapper"
      style={{
        minHeight: '100vh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: '#090A0C',
        color: 'rgba(235, 242, 255, 0.95)',
        overflowX: 'hidden',
      }}
    >
      {/* Render the EXACT same panel as the overlay */}
      <LiveIntelligencePanel onClose={handleClose} />

      {/* LaserFooter - the SAME ice-blue themed footer used by the overlay */}
      <div
        className="li-footer-wrapper"
        style={{
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          position: 'relative',
          zIndex: 100,
          width: '100%',
          marginTop: 0,
          background: '#090A0C',
        }}
      >
        <LaserFooter onHomeClick={handleClose} inLiveOverlay={true} />
      </div>
    </div>
  );
}

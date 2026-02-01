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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import the EXACT panel component from the overlay
// This ensures 1:1 parity - any overlay changes automatically apply here
import { LiveIntelligencePanel } from '@/components/user/LiveIntelligenceOverlay';

// Import LaserFooter - the SAME footer used by the overlay (NOT the system Footer)
import LaserFooter from '@/components/user/LaserFooter';

// Tiny portal hint - NOT learning UI, just a subtle gateway
import Link from 'next/link';

export default function LiveIntelligencePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090A0C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'rgba(170, 198, 255, 0.6)', fontSize: '14px' }}>
          Loading Live Intelligence...
        </div>
      </div>
    );
  }

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

      {/* Tiny portal hint - NOT learning UI, just a subtle gateway at the bottom */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px' }}>
        <Link
          href="/learn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderRadius: '14px',
            border: '1px solid rgba(140, 180, 255, 0.15)',
            background: 'linear-gradient(135deg, rgba(80, 120, 200, 0.08), rgba(40, 60, 100, 0.04))',
            color: 'rgba(180, 200, 230, 0.75)',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(140, 180, 255, 0.35)';
            e.currentTarget.style.color = 'rgba(220, 230, 255, 0.95)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(80, 120, 200, 0.14), rgba(40, 60, 100, 0.08))';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(140, 180, 255, 0.15)';
            e.currentTarget.style.color = 'rgba(180, 200, 230, 0.75)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(80, 120, 200, 0.08), rgba(40, 60, 100, 0.04))';
          }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          <span>Want to understand why markets behave this way?</span>
          <span style={{ opacity: 0.6 }}>→</span>
        </Link>
      </div>

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

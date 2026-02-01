'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import LearningPathPanel from '@/components/live-intelligence/LearningPathPanel';
import LaserFooter from '@/components/user/LaserFooter';

export default function LearnPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Match the laser/live-intelligence scoping so styles remain consistent.
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-laser-active', 'true');
    }
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

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#090A0C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(170, 198, 255, 0.6)',
          fontSize: '14px',
        }}
      >
        Loading Learning...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: '#090A0C',
        color: 'rgba(235, 242, 255, 0.95)',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '18px 16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ color: 'rgba(180, 200, 230, 0.62)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Premium Learning
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
            Your dedicated learning space
          </div>
          <div style={{ marginTop: '6px', color: 'rgba(180, 200, 230, 0.70)', fontSize: '13px' }}>
            Same saved progress — no changes to storage keys.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/live-intelligence"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(170, 198, 255, 0.20)',
              background: 'rgba(170, 198, 255, 0.08)',
              color: 'rgba(235, 242, 255, 0.92)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span aria-hidden="true">←</span>
            <span>Back to Live</span>
          </Link>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(170, 198, 255, 0.16)',
              background: 'rgba(0, 0, 0, 0.20)',
              color: 'rgba(180, 200, 230, 0.85)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Home
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 16px 22px' }}>
        {/* Full learning experience: the same LearningPathPanel, now on a dedicated route */}
        <LearningPathPanel />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <LaserFooter inLiveOverlay={true} />
      </div>
    </div>
  );
}

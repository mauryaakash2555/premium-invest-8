'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LiveIntelligenceError({ error, reset }) {
  useEffect(() => {
    // Keep a breadcrumb in the browser console for staging/production debugging.
    // (This file is route-scoped; it will not affect the rest of the site.)
    console.error('[live-intelligence] route error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090A0C',
        color: 'rgba(235, 242, 255, 0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: '100%',
          borderRadius: 18,
          border: '1px solid rgba(170, 198, 255, 0.16)',
          background: 'linear-gradient(180deg, rgba(16, 20, 28, 0.92) 0%, rgba(10, 10, 12, 0.96) 100%)',
          boxShadow: '0 20px 70px rgba(0,0,0,0.55)',
          padding: 24,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(170, 198, 255, 0.70)', fontWeight: 800 }}>
          Live Intelligence
        </div>
        <h1 style={{ margin: '10px 0 8px', fontSize: 22, fontWeight: 800, color: 'rgba(245, 248, 255, 0.96)' }}>
          Temporarily unavailable
        </h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(200, 215, 240, 0.72)' }}>
          Something went wrong while loading this screen. You can retry, or go back to the homepage.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={() => reset?.()}
            style={{
              borderRadius: 12,
              padding: '10px 14px',
              border: '1px solid rgba(170, 198, 255, 0.32)',
              background: 'rgba(170, 198, 255, 0.14)',
              color: 'rgba(235, 242, 255, 0.92)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              padding: '10px 14px',
              border: '1px solid rgba(170, 198, 255, 0.18)',
              background: 'rgba(0,0,0,0.20)',
              color: 'rgba(200, 215, 240, 0.86)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(200, 215, 240, 0.45)' }}>
          If this keeps happening on staging, the most common cause is a failing Live Intelligence API (for example <code>/api/live-intelligence/mood</code>).
        </div>
      </div>
    </div>
  );
}

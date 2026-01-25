'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function IntelligencePage() {
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore
    }
  }, []);

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: 110 }}>
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px 70px' }}>
        <h1
          style={{
            margin: '0 0 12px',
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(34px, 4.8vw, 56px)',
            color: 'rgba(255,255,255,0.94)',
            letterSpacing: '0.02em',
          }}
        >
          Intelligence
        </h1>

        <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.75, color: 'rgba(229,229,229,0.72)' }}>
          Research-first insights and calculators. Use Tools for planning, and Live Intelligence for market-driven briefings.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 18 }}>
          <Link
            href="/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 18px',
              borderRadius: 0,
              border: '1px solid var(--lux-accent)',
              color: 'var(--lux-accent)',
              textDecoration: 'none',
              fontWeight: 650,
              letterSpacing: '0.02em',
            }}
          >
            Open Tools
          </Link>

          <Link
            href="/live-intelligence"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 18px',
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.88)',
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Live Intelligence
          </Link>
        </div>

        <div
          style={{
            marginTop: 22,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.03)',
            padding: 16,
            borderRadius: 0,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: 'rgba(229,229,229,0.68)' }}>
            If you were seeing a 404 here earlier, this route has now been restored.
          </p>
        </div>
      </section>
    </main>
  );
}

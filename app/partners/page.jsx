'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

const PARTNER_OPTIONS = [
  {
    href: '/execution-partners',
    title: 'Execution Partners',
    subtitle: 'Pick the right route and execute fast.',
    note: 'Internal page',
  },
  {
    href: '/curated-partners',
    title: 'Curated Partners',
    subtitle: 'Our framework and curated listings.',
    note: 'Internal page',
  },
  {
    href: '/platforms',
    title: 'Investment Platforms',
    subtitle: 'Platforms directory and comparisons.',
    note: 'Internal page',
  },
];

function OptionCard({ href, title, subtitle, note }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.03)',
        padding: '22px 18px',
        textDecoration: 'none',
        borderRadius: 0,
        transition: 'transform 180ms ease, background 180ms ease, border-color 180ms ease',
      }}
      className="partner-option-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{title}</div>
          <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.65, color: 'rgba(229,229,229,0.72)' }}>{subtitle}</div>
        </div>
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.70)',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.04)',
            padding: '7px 10px',
            whiteSpace: 'nowrap',
          }}
        >
          {note}
        </span>
      </div>
    </Link>
  );
}

export default function PartnersPage() {
  useEffect(() => {
    trackEvent('partners_view', { page: '/partners' });
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
          Partners
        </h1>

        <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.75, color: 'rgba(229,229,229,0.72)' }}>
          Choose what you want to explore.
        </p>

        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {PARTNER_OPTIONS.map((opt) => (
            <OptionCard key={opt.href} {...opt} />
          ))}
        </div>

        <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Link
            href="/contact"
            onClick={() => trackEvent('partner_request_click', { page: '/partners' })}
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
            Request Partnership
          </Link>
          <div style={{ fontSize: 12, color: 'rgba(229,229,229,0.60)' }}>
            Want to partner with BM Wealth? Open a conversation.
          </div>
        </div>
      </section>

      <style>{`
        .partner-option-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.045);
          border-color: color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.14));
        }
      `}</style>
    </main>
  );
}

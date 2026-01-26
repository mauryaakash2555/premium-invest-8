'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

const EXECUTION_PARTNERS = {
  creditCards: [
    {
      key: 'axis_cc',
      brand: 'Axis Bank',
      title: 'Axis Credit Card',
    },
    {
      key: 'hdfc_cc',
      brand: 'HDFC Bank',
      title: 'HDFC Credit Card',
    },
    {
      key: 'yes_cc',
      brand: 'YES Bank',
      title: 'Yes Bank POP Club Credit Card',
    },
  ],
  personalLoans: [
    {
      key: 'loan_hub',
      brand: 'Loan Hub',
      title: 'Loan Hub Personal Loan',
    },
  ],
};

const PLATFORMS_UNDER_REVIEW = [
  {
    key: 'zerodha',
    title: 'Zerodha',
    note: 'Integration under review.',
  },
  {
    key: 'groww',
    title: 'Groww',
    note: 'Integration under review.',
  },
  {
    key: 'smallcase',
    title: 'Smallcase',
    note: 'Integration under review.',
  },
];

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        margin: '34px 0 10px',
        fontFamily: '"Playfair Display", serif',
        color: 'var(--lux-accent)',
        fontSize: 34,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </h2>
  );
}

function ExecutionCard({ title, brand }) {
  return (
    <div className="bm-cta-gold-flat" aria-label={`${title}`}>
      <div className="bm-affiliate-meta">
        <div className="bm-affiliate-title">{title}</div>
        <div className="bm-affiliate-subtitle">{brand}</div>
      </div>
    </div>
  );
}

function PlatformCard({ title, note }) {
  return (
    <div
      style={{
        width: '100%',
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 0,
        padding: '20px 18px',
        marginTop: 12,
        opacity: 0.55,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>{title}</div>
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
          Integration under review
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(229,229,229,0.70)', lineHeight: 1.7 }}>{note}</div>
    </div>
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
          A single hub for optional execution links, platforms under review, and partnership requests.
        </p>

        <SectionTitle>Execution Partners (Live)</SectionTitle>

        <h3 style={{ margin: '10px 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Credit Cards
        </h3>
        {EXECUTION_PARTNERS.creditCards.map(({ key, ...props }) => (
          <ExecutionCard key={key} {...props} />
        ))}

        <h3 style={{ margin: '22px 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Personal Loans
        </h3>
        {EXECUTION_PARTNERS.personalLoans.map(({ key, ...props }) => (
          <ExecutionCard key={key} {...props} />
        ))}

        <SectionTitle>Platforms (Under Review)</SectionTitle>
        <p style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.75, color: 'rgba(229,229,229,0.70)' }}>
          No external links yet.
        </p>
        {PLATFORMS_UNDER_REVIEW.map(({ key, ...props }) => (
          <PlatformCard key={key} {...props} />
        ))}

        <SectionTitle>Partner With BM Wealth</SectionTitle>
        <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.75, color: 'rgba(229,229,229,0.72)' }}>
          For brands, platforms, and product teams: request a partnership conversation.
        </p>
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
      </section>
    </main>
  );
}

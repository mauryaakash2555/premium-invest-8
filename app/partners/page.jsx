'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

const EXECUTION_PARTNERS = {
  creditCards: [
    {
      key: 'axis_cc',
      brand: 'Axis Bank',
      title: 'Axis Credit Card',
      bullets: [
        'Apply online via the official partner flow',
        'Eligibility and approval depend on bank criteria',
        'BM Wealth may earn a referral fee',
      ],
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fweb.axisbank.co.in%2FDigitalChannel%2FWebForm%2F',
      event: 'affiliate_axis_cc_click',
    },
    {
      key: 'hdfc_cc',
      brand: 'HDFC Bank',
      title: 'HDFC Credit Card',
      bullets: [
        'Apply online via the official partner flow',
        'Eligibility and approval depend on bank criteria',
        'BM Wealth may earn a referral fee',
      ],
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fapplyonline.hdfcbank.com%2Fcards%2Fcredit-cards.html',
      event: 'affiliate_hdfc_cc_click',
    },
    {
      key: 'yes_cc',
      brand: 'YES Bank',
      title: 'Yes Bank POP Club Credit Card',
      bullets: [
        'Apply online via the official partner flow',
        'Eligibility and approval depend on bank criteria',
        'BM Wealth may earn a referral fee',
      ],
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fppipl.getpopcard.co%2F',
      event: 'affiliate_yes_cc_click',
    },
  ],
  personalLoans: [
    {
      key: 'loan_hub',
      brand: 'Loan Hub',
      title: 'Loan Hub Personal Loan',
      bullets: [
        'Apply online via the official partner flow',
        'Eligibility and approval depend on lender criteria',
        'BM Wealth may earn a referral fee',
      ],
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Floanhubindia.com%2Fapply-now%2F',
      event: 'affiliate_loan_hub_click',
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

function ExecutionCard({ title, brand, bullets, href, event }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="bm-cta-gold-flat"
      aria-label={`${title} (sponsored link)`}
      onClick={() =>
        trackEvent(event, {
          source: 'partners',
          page: '/partners',
          partner: brand,
        })
      }
    >
      <div className="bm-affiliate-meta">
        <div className="bm-affiliate-title">{title}</div>
        <div className="bm-affiliate-subtitle">Sponsored link • Opens in a new tab</div>
        <ul
          style={{
            margin: '10px 0 0',
            paddingLeft: 18,
            color: 'rgba(229,229,229,0.78)',
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {bullets.slice(0, 3).map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
      </div>
      <div className="bm-affiliate-btn">Apply via Official Partner</div>
    </a>
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
        {EXECUTION_PARTNERS.creditCards.map((p) => (
          <ExecutionCard key={p.key} {...p} />
        ))}

        <h3 style={{ margin: '22px 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Personal Loans
        </h3>
        {EXECUTION_PARTNERS.personalLoans.map((p) => (
          <ExecutionCard key={p.key} {...p} />
        ))}

        <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.75, color: 'rgba(229,229,229,0.62)' }}>
          Affiliate disclosure: BM Wealth may earn a referral fee if you apply via these links.
        </p>

        <SectionTitle>Platforms (Under Review)</SectionTitle>
        <p style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.75, color: 'rgba(229,229,229,0.70)' }}>
          No external links yet.
        </p>
        {PLATFORMS_UNDER_REVIEW.map((p) => (
          <PlatformCard key={p.key} {...p} />
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

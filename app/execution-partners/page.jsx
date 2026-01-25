'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

const EXECUTION_PARTNERS = {
  creditCards: [
    {
      key: 'axis_cc',
      title: 'Axis Credit Card',
      subtitle: 'Sponsored link • Opens in a new tab',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fweb.axisbank.co.in%2FDigitalChannel%2FWebForm%2F',
      cta: 'Apply via Official Partner',
      event: 'affiliate_axis_cc_click',
    },
    {
      key: 'yes_cc',
      title: 'YES Bank POP Credit Card',
      subtitle: 'Sponsored link • Opens in a new tab',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fppipl.getpopcard.co%2F',
      cta: 'Apply via Official Partner',
      event: 'affiliate_yes_cc_click',
    },
    {
      key: 'hdfc_cc',
      title: 'HDFC Credit Card',
      subtitle: 'Sponsored link • Opens in a new tab',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fapplyonline.hdfcbank.com%2Fcards%2Fcredit-cards.html',
      cta: 'Apply via Official Partner',
      event: 'affiliate_hdfc_cc_click',
    },
  ],
  loans: [
    {
      key: 'loan_hub',
      title: 'Loan Hub',
      subtitle: 'Sponsored link • Opens in a new tab',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Floanhubindia.com%2Fapply-now%2F',
      cta: 'Check Eligibility',
      event: 'affiliate_loan_hub_click',
    },
  ],
};

function PartnerCard({ title, subtitle, href, cta, event }) {
  return (
    <a
      className="bm-cta-gold-flat"
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      aria-label={`${title} (sponsored link)`}
      onClick={() =>
        trackEvent(event, {
          source: 'execution_partners',
          page: '/execution-partners',
          partner: title,
        })
      }
    >
      <div className="bm-affiliate-meta">
        <div className="bm-affiliate-title">{title}</div>
        <div className="bm-affiliate-subtitle">{subtitle}</div>
      </div>
      <div className="bm-affiliate-btn">{cta}</div>
    </a>
  );
}

export default function ExecutionPartnersPage() {
  useEffect(() => {
    trackEvent('execution_partners_view', { page: '/execution-partners' });
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
          Execution Partners
        </h1>

        <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.75, color: 'rgba(229,229,229,0.72)' }}>
          Execution links redirect to official partner platforms. BM Wealth may earn a referral fee.
        </p>

        <h2
          style={{
            margin: '34px 0 8px',
            fontFamily: '"Playfair Display", serif',
            color: 'var(--lux-accent)',
            fontSize: 34,
          }}
        >
          Credit Cards
        </h2>
        {EXECUTION_PARTNERS.creditCards.map((partner) => (
          <PartnerCard key={partner.key} {...partner} />
        ))}

        <h2
          style={{
            margin: '34px 0 8px',
            fontFamily: '"Playfair Display", serif',
            color: 'var(--lux-accent)',
            fontSize: 34,
          }}
        >
          Short-Term Personal Loans
        </h2>
        {EXECUTION_PARTNERS.loans.map((partner) => (
          <PartnerCard key={partner.key} {...partner} />
        ))}

        <p style={{ margin: '22px 0 0', fontSize: 13, lineHeight: 1.75, color: 'rgba(229,229,229,0.62)' }}>
          Looking for calculators? Visit the{' '}
          <Link href="/intelligence" style={{ color: 'var(--lux-accent)' }}>
            Intelligence
          </Link>{' '}
          section.
        </p>
      </section>
    </main>
  );
}

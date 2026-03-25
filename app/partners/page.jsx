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
        textDecoration: 'none',
      }}
      className="platform-card partner-option-card"
    >
      <div className="platform-content">
        <h2
          style={{
            fontSize: 'clamp(22px, 3.2vw, 30px)',
            fontFamily: '"Playfair Display", serif',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 600,
            margin: '0 0 10px 0',
            letterSpacing: '1px',
          }}
        >
          {title}
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'rgba(229,229,229,0.72)' }}>{subtitle}</p>
      </div>

      <div className="platform-button">
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.70)',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.04)',
            padding: '8px 12px',
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
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Hero (premium, aligned with /platforms aesthetic) */}
      <section
        style={{
          minHeight: '62vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '110px',
          paddingBottom: '50px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/6th.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.40,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.55) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(900px 520px at 50% 0%, color-mix(in oklab, var(--lux-accent) 12%, transparent), transparent 62%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '900px' }}>
          <h1
            style={{
              fontSize: 'clamp(34px, 5vw, 58px)',
              marginBottom: '16px',
              fontWeight: 300,
              letterSpacing: '3px',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
              lineHeight: 1.2,
              textShadow: '0 12px 40px rgba(0,0,0,0.65)',
            }}
          >
            Partners
          </h1>
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'rgba(229,229,229,0.72)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.8,
            }}
          >
            Choose what you want to explore.
          </p>
        </div>
      </section>

      {/* Educational Content */}
      <section style={{ padding: '0 0 40px', width: '100%' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px' }}>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              Who BM Wealth Partners With
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              BM Wealth is an AMFI-registered mutual fund distributor (ARN 90008) and IRDAI-licensed insurance corporate agent (License 277925) based in Mumbai. Our partners include RBI-regulated banks for credit cards and personal loans, SEBI-registered brokers and platforms for equity and mutual fund execution, IRDA-licensed insurers for term and health cover, and select fintech platforms that complement our advisory framework.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              Every partnership is evaluated against the same question: does this give our client a measurably better execution path than going alone? If the answer is no, we do not list them. We do not partner with unregulated entities, and we do not accept partnerships that create conflicts of interest with our advisory obligations.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              How Partners Are Selected
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              Our selection process is structured, not transactional. We verify regulatory registration (SEBI, RBI, IRDAI as applicable), review grievance redressal records, evaluate pricing transparency, and test the end-to-end onboarding and servicing experience before listing any partner. Partners that charge hidden fees, have opaque terms, or fall below service thresholds are removed.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              We periodically re-evaluate existing partnerships based on client feedback, regulatory developments, and competitive landscape changes. The goal is to maintain a lean, high-quality roster rather than an exhaustive directory.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              Regulatory Compliance
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              All execution partners listed on this site operate under relevant Indian regulatory frameworks — RBI for banking and lending, SEBI for broking and investment advisory, IRDAI for insurance distribution, and AMFI for mutual fund distribution. BM Wealth does not process transactions, hold client funds, or make approvals on behalf of any partner. When you click through to a partner, you interact directly with their platform under their regulatory obligations. We may receive a referral fee at no additional cost to you, and this is always disclosed.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              How Clients Benefit
            </h2>
            <ul style={{ paddingLeft: '20px', margin: 0, listStyle: 'disc' }}>
              {[
                'Pre-vetted partners: Instead of evaluating dozens of platforms yourself, you start from a reviewed shortlist.',
                'Transparent fee disclosure: Every partner listing discloses whether the link is sponsored or tracked.',
                'Regulatory assurance: Only regulated entities appear on our platform \u2014 no grey-market operators.',
                'Advisory alignment: Partners are selected to complement BM Wealth\u2019s planning workflow, not replace it.',
                'Single point of escalation: If you face issues with any partner, our team assists with resolution as part of our advisory relationship.',
              ].map((item, i) => (
                <li key={i} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, marginBottom: '8px' }}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '18px 20px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: 'rgba(255,255,255,0.60)' }}>Disclaimer:</strong> Partner listings are for informational and educational purposes only. BM Wealth does not guarantee the performance, availability, or suitability of any partner product. Always conduct your own due diligence before engaging with any financial service provider. AMFI ARN 90008 | PMS Cert. 2430447816 | IRDAI 277925
            </p>
          </div>
        </div>
      </section>

      {/* Options */}
      <section style={{ padding: '0 0 90px', width: '100%' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            {PARTNER_OPTIONS.map((opt) => (
              <OptionCard key={opt.href} {...opt} />
            ))}
          </div>

          <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Link
              href="/contact"
              onClick={() => trackEvent('partner_request_click', { page: '/partners' })}
              className="btn-outline"
              style={{ textDecoration: 'none' }}
            >
              Request Partnership
            </Link>
            <div style={{ fontSize: 12, color: 'rgba(229,229,229,0.60)' }}>
              Want to partner with BM Wealth? Open a conversation.
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .platform-card {
          width: 100%;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(900px 520px at 22% 10%, rgba(255,255,255,0.06), transparent 60%),
            linear-gradient(135deg, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.44) 100%);
          border: 1px solid rgba(255, 255, 255, 0.10);
          padding: 34px 28px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 28px;
          align-items: center;
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 0;
          text-align: left;
          box-shadow: 0 14px 55px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset;
        }

        .platform-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(700px 260px at 70% 0%, color-mix(in oklab, var(--lux-accent) 14%, transparent), transparent 60%);
          opacity: 0.28;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .platform-card::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, color-mix(in oklab, var(--lux-accent) 70%, transparent), transparent 72%);
          opacity: 0.25;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .platform-card:hover {
          border-color: color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.12));
          transform: translateY(-2px);
          box-shadow: 0 18px 70px rgba(0,0,0,0.55);
        }

        .platform-card:hover::before {
          opacity: 0.7;
        }

        .platform-card:hover::after {
          opacity: 0.8;
        }

        .platform-content,
        .platform-button {
          position: relative;
          z-index: 1;
        }

        .platform-button {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.85);
          padding: 12px 18px;
          border-radius: 0;
          text-decoration: none;
          font-size: 14px;
          font-weight: 650;
          border: 1px solid color-mix(in oklab, var(--lux-accent) 45%, rgba(255,255,255,0.14));
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-outline:hover {
          background: var(--lux-accent);
          color: oklch(0.06 0.005 280);
          transform: translateY(-2px);
          box-shadow: 0 22px 80px rgba(0,0,0,0.65);
          border-color: var(--lux-accent);
        }

        @media (max-width: 900px) {
          .platform-card {
            grid-template-columns: 1fr;
            padding: 28px 18px;
          }

          .platform-button {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import MobileScrollBoost from '@/components/user/MobileScrollBoost';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });

function SectionHeading({ children }) {
  return (
    <div style={{ width: 'calc(100% - 30px)', margin: '0 15px 18px' }}>
      <h2
        style={{
          fontSize: 'clamp(22px, 3.5vw, 32px)',
          fontFamily: '"Playfair Display", serif',
          color: 'rgba(255,255,255,0.92)',
          fontWeight: 500,
          margin: 0,
          letterSpacing: '1.5px',
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function ExecutionCard({ rank, name, descriptor, ctaLabel, href }) {
  return (
    <MobileScrollBoost className="platform-card" holdMs={4500}>
      <div className="platform-content">
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>
          #{rank}
        </div>
        <h2
          style={{
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontFamily: '"Playfair Display", serif',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 600,
            margin: '0 0 10px 0',
            letterSpacing: '1.5px',
          }}
        >
          {name}
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: 0, fontWeight: 500 }}>
          {descriptor}
        </p>
      </div>

      <div className="platform-button">
        <a href={href} target="_blank" rel="nofollow sponsored noopener noreferrer" className="btn-primary">
          <span>{ctaLabel}</span>
        </a>
      </div>
    </MobileScrollBoost>
  );
}

export default function ExecutionPartnersPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const CREDIT_CARDS = [
    {
      rank: 1,
      name: 'AXIS BANK',
      descriptor: 'Credit cards with wide approval and fast onboarding.',
      ctaLabel: 'APPLY NOW',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fweb.axisbank.co.in%2FDigitalChannel%2FWebForm%2F',
    },
    {
      rank: 2,
      name: 'HDFC BANK',
      descriptor: 'Popular credit cards with broad eligibility and offers.',
      ctaLabel: 'APPLY NOW',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fapplyonline.hdfcbank.com%2Fcards%2Fcredit-cards.html',
    },
    {
      rank: 3,
      name: 'YES BANK POP CLUB',
      descriptor: 'Digital-first credit card experience.',
      ctaLabel: 'APPLY NOW',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fppipl.getpopcard.co%2F',
    },
    {
      rank: 4,
      name: 'IDFC FIRST BANK',
      descriptor: 'Simple credit cards with transparent features.',
      ctaLabel: 'APPLY NOW',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fwww.idfcfirstbank.com%2Fcredit-card%2Fntb-diy%2Fapply',
    },
    {
      rank: 5,
      name: 'AU BANK',
      descriptor: 'Fast approval credit card options.',
      ctaLabel: 'APPLY NOW',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fsavingsaccount.aubank.in%2Fsaself%2Fmobile-number',
    },
    {
      rank: 6,
      name: 'INDUSIND BANK',
      descriptor: 'Premium cards for established credit profiles.',
      ctaLabel: 'APPLY NOW',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Finduseasycredit.indusind.bank.in%2Fcustomer%2Fcredit-card%2Fnew-lead',
    },
  ];

  const PERSONAL_LOANS = [
    {
      rank: 1,
      name: 'LOAN HUB',
      descriptor: 'Compare personal loan offers from multiple RBI-regulated lenders.',
      ctaLabel: 'CHECK ELIGIBILITY',
      href: 'https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Floanhubindia.com%2Fapply-now%2F',
    },
  ];

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />

      {/* Hero Section (matches /platforms) */}
      <section
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
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
            opacity: 0.42,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0.35) 100%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '900px' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              marginBottom: '20px',
              fontWeight: 300,
              letterSpacing: '3px',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
              lineHeight: 1.2,
            }}
          >
            Execution Partners
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2.2vw, 20px)',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Apply directly on official partner platforms.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="bp-body" style={{ padding: '40px 0 100px', width: '100%' }}>
        <SectionHeading>Credit Cards</SectionHeading>
        {CREDIT_CARDS.map((p) => (
          <ExecutionCard key={p.rank} {...p} />
        ))}

        <div style={{ height: 18 }} />

        <SectionHeading>Personal Loans</SectionHeading>
        {PERSONAL_LOANS.map((p) => (
          <ExecutionCard key={`pl-${p.rank}`} {...p} />
        ))}

        {/* Disclosure (one line, bottom) */}
        <div style={{ textAlign: 'center', padding: '40px 20px 0' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
            BM Wealth may receive a referral fee if you apply via these links.
          </p>
        </div>
      </section>

      {/* Styles (matches /platforms) */}
      <style>{`
        .platform-card {
          width: calc(100% - 30px);
          margin-left: 15px;
          margin-right: 15px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.10);
          padding: 60px 50px;
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: center;
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 0;
          text-align: left;
          min-height: 280px;
        }

        .platform-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.12));
          transform: translateY(-2px);
          box-shadow: 0 18px 70px rgba(0,0,0,0.55);
        }

        .platform-content {
          flex: 1;
        }

        .platform-button {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          background: oklch(0.95 0.01 85);
          color: oklch(0.06 0.005 280);
          padding: 18px 36px;
          border-radius: 0;
          text-decoration: none;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.3s ease;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.14);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--lux-accent);
          transform: translateX(-101%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }

        .btn-primary > * { position: relative; z-index: 2; }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 80px rgba(0,0,0,0.65);
        }

        .btn-primary:hover::before {
          transform: translateX(0);
        }

        @media (max-width: 900px) {
          .platform-card {
            grid-template-columns: 1fr;
            width: calc(100% - 20px);
            margin-left: 10px;
            margin-right: 10px;
            padding: 50px 30px;
            min-height: auto;
          }

          .platform-button {
            justify-content: flex-start;
            margin-top: 20px;
          }
        }

        @media (max-width: 600px) {
          .platform-card {
            width: calc(100% - 16px);
            margin-left: 8px;
            margin-right: 8px;
            padding: 24px 16px;
            margin-bottom: 16px;
            border-radius: 0;
          }

          .btn-primary {
            padding: 14px 24px;
            font-size: 14px;
            width: 100%;
            justify-content: center;
          }

          .platform-content h2 {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

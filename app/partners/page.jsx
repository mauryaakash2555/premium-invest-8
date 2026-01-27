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

      {/* Options */}
      <section style={{ padding: '40px 0 90px', width: '100%' }}>
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

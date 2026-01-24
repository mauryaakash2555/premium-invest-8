/**
 * FILE: app\platforms\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - next/link
 * - lucide-react
 * - @/components/user/MobileScrollBoost
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle, Sparkles } from 'lucide-react';
import MobileScrollBoost from '@/components/user/MobileScrollBoost';
import FAQSection from '@/components/shared/FAQSection';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });

export default function Platforms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: 'Are these platforms SEBI registered?',
      answer:
        'Platforms and brokers typically operate under SEBI/stock exchange regulations (as applicable). Always verify current registration details on official sources before opening an account.',
    },
    {
      question: 'Do you guarantee returns if I use these platforms?',
      answer:
        'No. Returns depend on market performance and your investment decisions. Platform selection does not guarantee outcomes.',
    },
    {
      question: 'Are these links affiliate links?',
      answer:
        'Some links may be affiliate links. If you sign up through them, we may earn a commission at no extra cost to you.',
    },
    {
      question: 'Which platform should I choose?',
      answer:
        'It depends on your needs (costs, interface, products offered, support). You can compare features and choose what fits your investing style.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>

      <script
        id="platforms-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />

      {/* Hero Section */}
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
            Investment Platforms
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
            Popular platforms and partners commonly used by investors
          </p>
        </div>
      </section>

      {/* Platform Cards Section */}
      <section className="bp-body" style={{ padding: '40px 0 100px', width: '100%' }}>
        
        {/* POSITION #1 - DIAMOND PARTNER (COMPETITIVE BIDDING) */}
        <MobileScrollBoost className="platform-card diamond-bidding" holdMs={5000}>
          <div className="platform-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '40px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }}>💎</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--lux-accent)', letterSpacing: '3px', marginBottom: '4px' }}>
                  ELITE POSITION #1
                </div>
                <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontFamily: '"Playfair Display", serif', color: '#FFF', fontWeight: 800, margin: 0, letterSpacing: '2px', textShadow: '0 10px 40px rgba(0,0,0,0.55)' }}>
                  DIAMOND PARTNER
                </h2>
              </div>
            </div>

            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.74)', marginBottom: '20px', fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase' }}>
              Bidding War Active: Secure the Elite Spot
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Maximum Authority & Industry Dominance',
                'Prime Real-Estate on Platform Directory',
                'Priority Traffic & Direct Investor Funnel',
                'Current Bidding: Private'
              ].map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={18} style={{ color: '#FFF', flexShrink: 0, filter: 'drop-shadow(0 0 5px #FFF)' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, fontWeight: 600 }}>{benefit}</span>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px', padding: '12px 15px', background: 'rgba(255,255,255,0.04)', border: '1px solid color-mix(in oklab, var(--lux-accent) 20%, rgba(255,255,255,0.12))', borderRadius: 0 }}>
              <p style={{ color: '#FFF', fontSize: '14px', margin: 0, fontWeight: 600 }}>
                🔥 <span style={{ color: 'var(--lux-accent)', fontWeight: 800 }}>Bidding Alert:</span> 8 Institutional Sponsors are currently vying for this exclusive slot.
              </p>
            </div>
          </div>

          <div className="platform-button">
            <Link href="/contact?subject=diamond-bidding-platforms" className="btn-diamond-shiny-sm">
              Enter Bidding
            </Link>
          </div>
        </MobileScrollBoost>

        {/* POSITION #2 - ZERODHA */}
        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#2</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              ZERODHA
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              India&apos;s largest discount broker
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['₹0 equity delivery brokerage', '₹20 per order for intraday trading', 'Advanced Kite trading platform', 'Trusted by 1 Crore+ active traders'].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="platform-button">
            <a href="/track/zerodha" target="_blank" rel="sponsored nofollow noopener noreferrer" className="btn-primary">
              Open Free Demat Account <ExternalLink size={16} />
            </a>
          </div>
        </MobileScrollBoost>

        {/* POSITION #3 - SMALLCASE */}
        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#3</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              SMALLCASE
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Thematic portfolio investing
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Professional investment strategies', 'Transparent portfolio tracking', 'Automated rebalancing tools', 'Trusted by 20 Lakh+ investors'].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="platform-button">
            <a href="/track/smallcase" target="_blank" rel="sponsored nofollow noopener noreferrer" className="btn-primary">
              Explore Smallcases <ExternalLink size={16} />
            </a>
          </div>
        </MobileScrollBoost>

        {/* POSITION #4 - GROWW */}
        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#4</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              GROWW
            </h2>
            <p style={{ fontSize: '16px', color: 'color-mix(in oklab, var(--lux-accent) 85%, rgba(255,255,255,0.72))', marginBottom: '20px', fontWeight: 500 }}>
              Simplified investing for everyone
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['₹0 account maintenance charges', 'Easy mutual fund SIP setup', 'Intuitive mobile-first interface', '2 Crore+ registered users'].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="platform-button">
            <a href="/track/groww" target="_blank" rel="sponsored nofollow noopener noreferrer" className="btn-primary">
              Start Free Account <ExternalLink size={16} />
            </a>
          </div>
        </MobileScrollBoost>

        <section style={{ padding: '10px 20px 0' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'rgba(255,255,255,0.75)', maxWidth: '900px', margin: '0 auto 0', textAlign: 'center' }}>
            Related resources: <Link href="/mutual-funds" style={{ color: 'var(--lux-accent)', textDecoration: 'underline' }}>Mutual Funds</Link> ·{' '}
            <Link href="/sip" style={{ color: 'var(--lux-accent)', textDecoration: 'underline' }}>SIP</Link> ·{' '}
            <Link href="/contact" style={{ color: 'var(--lux-accent)', textDecoration: 'underline' }}>Contact</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} />

        {/* Affiliate Disclaimer */}
        <div style={{ textAlign: 'center', padding: '40px 20px 0' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
            <strong style={{ color: 'color-mix(in oklab, var(--lux-accent) 70%, rgba(255,255,255,0.62))' }}>Affiliate Disclosure:</strong> Some outbound links may be affiliate/sponsored links. If you sign up through them, we may earn a commission at no extra cost to you. This helps us support free educational content.
          </p>
        </div>

      </section>

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
        
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.85);
          padding: 18px 36px;
          border-radius: 0;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.14);
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
        
        .btn-diamond-shiny-sm {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          background: oklch(0.95 0.01 85);
          color: oklch(0.06 0.005 280);
          padding: 16px 32px;
          border-radius: 0;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          transition: all 0.3s ease;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 16px 60px rgba(0,0,0,0.55);
          text-transform: uppercase;
        }

        .btn-diamond-shiny-sm::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--lux-accent) 35%, transparent), transparent);
          transform: translateX(-120%);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }

        .btn-diamond-shiny-sm > * { position: relative; z-index: 2; }

        .btn-diamond-shiny-sm:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 80px rgba(0,0,0,0.65);
        }

        .btn-diamond-shiny-sm:hover::before {
          transform: translateX(120%);
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
          
          .btn-primary, .btn-outline, .btn-diamond-shiny-sm {
            padding: 14px 24px;
            font-size: 14px;
            width: 100%;
            justify-content: center;
          }

          .platform-content h2 {
            font-size: 24px !important;
          }

          .platform-content svg[width="40"] {
            width: 32px !important;
            height: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}


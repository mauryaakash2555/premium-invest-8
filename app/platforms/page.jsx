'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle, Sparkles } from 'lucide-react';

export default function Platforms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>

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
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.5) 100%)',
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '900px' }}>
          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 52px)',
              marginBottom: '20px',
              fontWeight: 300,
              letterSpacing: '3px',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
              lineHeight: 1.2,
            }}
          >
            Recommended Investment Platforms
          </h1>
          <p
            style={{
              fontSize: 'clamp(17px, 2.2vw, 20px)',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Trusted investment platforms vetted by our experts
          </p>
        </div>
      </section>

      {/* Platform Tiers Section */}
      <section style={{ padding: '40px 0 100px', width: '100%', maxWidth: '100vw', boxSizing: 'border-box', maxWidth: '100vw', overflowX: 'hidden' }}>
        
        {/* POSITION #1 - DIAMOND PARTNER (RESERVED) */}
        <div
          className="platform-card"
          style={{
            background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)',
            border: '2px solid rgba(192, 160, 98, 0.4)',
            borderRadius: '0',
            padding: '40px 20px',
            marginBottom: '0',
            display: 'grid', width: '100%', maxWidth: '100vw', boxSizing: 'border-box',
            gridTemplateColumns: '60% 40%',
            gap: '40px',
            alignItems: 'center',
            minHeight: '300px',
            width: '100%', maxWidth: '100vw', boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(192, 160, 98, 0.15)',
          }}
        >
          {/* Left Side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>💎</span>
              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#C0A062',
                    letterSpacing: '2px',
                    marginBottom: '4px',
                  }}
                >
                  POSITION #1
                </div>
                <h2
                  style={{
                    fontSize: '42px',
                    fontFamily: '"Playfair Display", serif',
                    color: '#C0A062',
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: '2px',
                  }}
                >
                  DIAMOND PARTNER
                </h2>
              </div>
            </div>

            <p
              style={{
                fontSize: '20px',
                color: 'rgba(192, 160, 98, 0.9)',
                marginBottom: '32px',
                fontWeight: 500,
              }}
            >
              Reserved for Exclusive Partnership
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Featured homepage placement',
                'Dedicated content collaboration',
                'Premium brand positioning',
                'Monthly investment: ₹2-3 Lakh',
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Sparkles size={18} style={{ color: '#C0A062', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: 1.6,
                    }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link
              href="/contact?subject=diamond-partnership"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#C0A062',
                padding: '18px 36px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: 600,
                border: '2px solid #C0A062',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Apply for Diamond Partnership
            </Link>
          </div>
        </div>

        {/* POSITION #2 - ZERODHA */}
        <div
          className="platform-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
            borderRadius: '0',
            padding: '40px 20px',
            marginBottom: '0',
            display: 'grid', width: '100%', maxWidth: '100vw', boxSizing: 'border-box',
            gridTemplateColumns: '60% 40%',
            gap: '40px',
            alignItems: 'center',
            minHeight: '300px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Left Side */}
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.8)',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
            >
              #2
            </div>

            <h2
              style={{
                fontSize: '42px',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '2px',
              }}
            >
              ZERODHA
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: 'rgba(192, 160, 98, 0.85)',
                marginBottom: '28px',
                fontWeight: 500,
              }}
            >
              India&apos;s largest discount broker
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                '₹0 equity delivery brokerage',
                '₹20 per order for intraday trading',
                'Advanced Kite trading platform',
                'Trusted by 1 Crore+ active traders',
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <CheckCircle size={18} style={{ color: '#C0A062', flexShrink: 0, marginTop: '2px' }} />
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <a
              href="https://zerodha.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#C0A062',
                color: '#000',
                padding: '18px 36px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Open Free Demat Account
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* POSITION #3 - SMALLCASE */}
        <div
          className="platform-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
            borderRadius: '0',
            padding: '40px 20px',
            marginBottom: '0',
            display: 'grid', width: '100%', maxWidth: '100vw', boxSizing: 'border-box',
            gridTemplateColumns: '60% 40%',
            gap: '40px',
            alignItems: 'center',
            minHeight: '300px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Left Side */}
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.8)',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
            >
              #3
            </div>

            <h2
              style={{
                fontSize: '42px',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '2px',
              }}
            >
              SMALLCASE
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: 'rgba(192, 160, 98, 0.85)',
                marginBottom: '28px',
                fontWeight: 500,
              }}
            >
              Thematic portfolio investing
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Professional investment strategies',
                'Transparent portfolio tracking',
                'Automated rebalancing tools',
                'Trusted by 20 Lakh+ investors',
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <CheckCircle size={18} style={{ color: '#C0A062', flexShrink: 0, marginTop: '2px' }} />
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <a
              href="https://smallcase.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#C0A062',
                color: '#000',
                padding: '18px 36px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Explore Smallcases
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* POSITION #4 - GROWW */}
        <div
          className="platform-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
            borderRadius: '0',
            padding: '40px 20px',
            marginBottom: '0',
            display: 'grid', width: '100%', maxWidth: '100vw', boxSizing: 'border-box',
            gridTemplateColumns: '60% 40%',
            gap: '40px',
            alignItems: 'center',
            minHeight: '300px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Left Side */}
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.8)',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
            >
              #4
            </div>

            <h2
              style={{
                fontSize: '42px',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '2px',
              }}
            >
              GROWW
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: 'rgba(192, 160, 98, 0.85)',
                marginBottom: '28px',
                fontWeight: 500,
              }}
            >
              Simplified investing for everyone
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                '₹0 account maintenance charges',
                'Easy mutual fund SIP setup',
                'Intuitive mobile-first interface',
                '2 Crore+ registered users',
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <CheckCircle size={18} style={{ color: '#C0A062', flexShrink: 0, marginTop: '2px' }} />
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <a
              href="https://groww.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#C0A062',
                color: '#000',
                padding: '18px 36px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Start Free Account
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* Affiliate Disclaimer */}
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.4)',
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <strong style={{ color: 'rgba(192, 160, 98, 0.6)' }}>Affiliate Disclosure:</strong> We may earn commission when you sign up through our links at no extra cost to you. This helps us provide free educational content.
          </p>
        </div>

        {/* Responsive Styles */}
        <style>{`
          @media (max-width: 1024px) {
            .platform-card-grid {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
              padding: 40px 30px !important;
              min-height: auto !important;
              text-align: center !important;
            }
          }

          @media (max-width: 768px) {
            .platform-card-grid {
              padding: 30px 20px !important;
            }
            .platform-card-grid h2 {
              font-size: clamp(22px, 5vw, 28px) !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
}




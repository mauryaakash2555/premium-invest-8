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
              fontSize: 'clamp(32px, 5vw, 52px)',
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
              fontSize: 'clamp(16px, 2.2vw, 20px)',
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

      {/* Platform Cards Section */}
      <section style={{ padding: '40px 0 100px', width: '100%' }}>
        
        {/* POSITION #1 - DIAMOND PARTNER */}
        <div className="platform-card">
          <div className="platform-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '40px' }}>💎</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#C0A062', letterSpacing: '2px', marginBottom: '4px' }}>
                  POSITION #1
                </div>
                <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: '#C0A062', fontWeight: 600, margin: 0, letterSpacing: '1.5px' }}>
                  DIAMOND PARTNER
                </h2>
              </div>
            </div>

            <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'rgba(192, 160, 98, 0.9)', marginBottom: '20px', fontWeight: 500 }}>
              Reserved for Exclusive Partnership
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Featured homepage placement', 'Dedicated content collaboration', 'Premium brand positioning', 'Monthly investment: ₹2-3 Lakh'].map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={18} style={{ color: '#C0A062', flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6 }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="platform-button">
            <Link href="/contact?subject=diamond-partnership" className="btn-outline">
              Apply for Diamond Partnership
            </Link>
          </div>
        </div>

        {/* POSITION #2 - ZERODHA */}
        <div className="platform-card">
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(192, 160, 98, 0.8)', letterSpacing: '2px', marginBottom: '10px' }}>#2</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: '#C0A062', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              ZERODHA
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(192, 160, 98, 0.85)', marginBottom: '20px', fontWeight: 500 }}>
              India&apos;s largest discount broker
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['₹0 equity delivery brokerage', '₹20 per order for intraday trading', 'Advanced Kite trading platform', 'Trusted by 1 Crore+ active traders'].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={18} style={{ color: '#C0A062', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="platform-button">
            <a href="https://zerodha.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Open Free Demat Account <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* POSITION #3 - SMALLCASE */}
        <div className="platform-card">
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(192, 160, 98, 0.8)', letterSpacing: '2px', marginBottom: '10px' }}>#3</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: '#C0A062', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              SMALLCASE
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(192, 160, 98, 0.85)', marginBottom: '20px', fontWeight: 500 }}>
              Thematic portfolio investing
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Professional investment strategies', 'Transparent portfolio tracking', 'Automated rebalancing tools', 'Trusted by 20 Lakh+ investors'].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={18} style={{ color: '#C0A062', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="platform-button">
            <a href="https://smallcase.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Explore Smallcases <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* POSITION #4 - GROWW */}
        <div className="platform-card">
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(192, 160, 98, 0.8)', letterSpacing: '2px', marginBottom: '10px' }}>#4</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: '#C0A062', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              GROWW
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(192, 160, 98, 0.85)', marginBottom: '20px', fontWeight: 500 }}>
              Simplified investing for everyone
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['₹0 account maintenance charges', 'Easy mutual fund SIP setup', 'Intuitive mobile-first interface', '2 Crore+ registered users'].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={18} style={{ color: '#C0A062', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="platform-button">
            <a href="https://groww.in" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Start Free Account <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Affiliate Disclaimer */}
        <div style={{ textAlign: 'center', padding: '40px 20px 0' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
            <strong style={{ color: 'rgba(192, 160, 98, 0.6)' }}>Affiliate Disclosure:</strong> We may earn commission when you sign up through our links at no extra cost to you. This helps us provide free educational content.
          </p>
        </div>

      </section>

      <style>{`
        .platform-card {
          width: calc(100% - 30px);
          margin-left: 15px;
          margin-right: 15px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(192, 160, 98, 0.3);
          padding: 60px 50px;
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: center;
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 12px;
          text-align: left;
          min-height: 280px;
        }
        
        .platform-card:hover {
          background: rgba(192, 160, 98, 0.08);
          border-color: rgba(192, 160, 98, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(192, 160, 98, 0.15);
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
          background: #C0A062;
          color: #000;
          padding: 18px 36px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .btn-primary:hover {
          background: #DAA520;
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(192, 160, 98, 0.5);
        }
        
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          color: #C0A062;
          padding: 18px 36px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          border: 2px solid #C0A062;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .btn-outline:hover {
          background: #C0A062;
          color: #000;
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(192, 160, 98, 0.5);
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
            padding: 40px 20px;
            margin-bottom: 16px;
            border-radius: 8px;
          }
          
          .btn-primary, .btn-outline {
            padding: 14px 28px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

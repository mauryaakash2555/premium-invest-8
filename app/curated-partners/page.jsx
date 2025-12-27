'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, TrendingUp, Users, CheckCircle, Calendar, Sparkles, Award, Star } from 'lucide-react';

export default function CuratedPartners() {
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Hero Section */}
      <section
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
          paddingBottom: '60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(10,10,10,0.4) 0%, rgba(192,160,98,0.15) 50%, rgba(10,10,10,0.6) 100%)',
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '1000px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.25) 0%, rgba(218, 165, 32, 0.15) 100%)',
              border: '2px solid rgba(192, 160, 98, 0.5)',
              borderRadius: '30px',
              padding: '10px 24px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(192, 160, 98, 0.25)',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: '#C0A062',
                fontWeight: 700,
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} />
              FEATURED ADVISORY PARTNERS
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 58px)',
              marginBottom: '20px',
              fontWeight: 400,
              letterSpacing: '4px',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
              lineHeight: 1.2,
              textShadow: '0 4px 20px rgba(192, 160, 98, 0.4)',
            }}
          >
            Curated Partners
          </h1>
          <p
            style={{
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              color: 'rgba(255, 255, 255, 0.95)',
              maxWidth: '750px',
              margin: '0 auto',
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            An exclusive network of verified professionals for your complete financial wellness
          </p>
        </div>
      </section>

      {/* Partner Cards Section */}
      <section style={{ padding: '40px 0 100px', width: '100%' }}>
        
        {/* POSITION #1 - DIAMOND ADVISORY PARTNER (RESERVED) */}
        <div
          className="partner-card"
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: 'calc(100% - 30px)',
            marginLeft: '15px',
            marginRight: '15px',
            background: hoveredCard === 1 
              ? 'linear-gradient(135deg, rgba(192, 160, 98, 0.15) 0%, rgba(218, 165, 32, 0.1) 50%, rgba(0, 0, 0, 0.5) 100%)'
              : 'linear-gradient(135deg, rgba(192, 160, 98, 0.12) 0%, rgba(218, 165, 32, 0.08) 50%, rgba(0, 0, 0, 0.5) 100%)',
            border: '3px solid rgba(192, 160, 98, 0.5)',
            borderRadius: '16px',
            padding: '60px 50px',
            marginBottom: '30px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            minHeight: '320px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: hoveredCard === 1 
              ? '0 12px 50px rgba(192, 160, 98, 0.25)' 
              : '0 8px 40px rgba(192, 160, 98, 0.15)',
            transform: hoveredCard === 1 ? 'translateY(-4px)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Elite badge */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(192, 160, 98, 0.4)',
            }}
          >
            <Star size={14} fill="#000" />
            ELITE TIER
          </div>

          {/* Left Side */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <span style={{ fontSize: '48px' }}>💎</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#C0A062', letterSpacing: '3px', marginBottom: '6px' }}>
                  POSITION #1
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontFamily: '"Playfair Display", serif', color: '#C0A062', fontWeight: 700, margin: 0, letterSpacing: '2px', textShadow: '0 2px 15px rgba(192, 160, 98, 0.5)' }}>
                  DIAMOND ADVISORY PARTNER
                </h2>
              </div>
            </div>

            <p style={{ fontSize: '20px', color: 'rgba(192, 160, 98, 0.95)', marginBottom: '28px', fontWeight: 600, fontStyle: 'italic' }}>
              Reserved for Premium Financial Services Partnership
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Exclusive advisory positioning & branding',
                'Co-branded premium content strategy',
                'Featured across all digital platforms',
                'Strategic VIP partnership benefits',
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(192, 160, 98, 0.08)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(192, 160, 98, 0.2)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Sparkles size={18} style={{ color: '#C0A062', flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, fontWeight: 500 }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', background: 'rgba(192, 160, 98, 0.15)', padding: '20px 28px', borderRadius: '12px', border: '2px solid rgba(192, 160, 98, 0.3)', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', color: 'rgba(192, 160, 98, 0.8)', marginBottom: '8px', letterSpacing: '1px', fontWeight: 600 }}>INVESTMENT</div>
              <div style={{ fontSize: '32px', color: '#C0A062', fontWeight: 700, fontFamily: '"Playfair Display", serif', letterSpacing: '1px', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '28px' }}>₹</span>
                <span>2-3 Lakh</span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>per month</div>
            </div>

            <Link href="/contact?subject=diamond-advisory-partnership" className="btn-gold">
              Apply for Partnership
            </Link>
          </div>
        </div>

        {/* POSITION #2 - BM WEALTH (GOLD PARTNER) */}
        <div
          className="partner-card"
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: 'calc(100% - 30px)',
            marginLeft: '15px',
            marginRight: '15px',
            background: hoveredCard === 2
              ? 'linear-gradient(135deg, rgba(192, 160, 98, 0.10) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(192, 160, 98, 0.08) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '3px solid rgba(192, 160, 98, 0.4)',
            borderRadius: '16px',
            padding: '60px 50px',
            marginBottom: '30px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            minHeight: '320px',
            position: 'relative',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: hoveredCard === 2
              ? '0 12px 50px rgba(192, 160, 98, 0.20)'
              : '0 6px 35px rgba(192, 160, 98, 0.12)',
            transform: hoveredCard === 2 ? 'translateY(-4px)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Verified badge */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(192, 160, 98, 0.2)', border: '2px solid #C0A062', color: '#C0A062', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} />
            VERIFIED PARTNER
          </div>

          {/* Left Side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)', padding: '8px 18px', borderRadius: '8px', fontSize: '16px', fontWeight: 800, color: '#000', letterSpacing: '2px' }}>
                #2 - GOLD PARTNER
              </div>
            </div>

            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontFamily: '"Playfair Display", serif', color: '#C0A062', fontWeight: 700, margin: '0 0 14px 0', letterSpacing: '2px', textShadow: '0 2px 12px rgba(192, 160, 98, 0.4)' }}>
              BM WEALTH
            </h2>

            <p style={{ fontSize: '18px', color: 'rgba(192, 160, 98, 0.9)', marginBottom: '20px', fontWeight: 600 }}>
              Personalized Financial Planning & Wealth Management
            </p>

            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, marginBottom: '24px' }}>
              Mumbai&apos;s trusted advisors for comprehensive wealth management. We provide tailored solutions for portfolio optimization, tax planning, insurance strategies, and retirement planning.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }} className="features-grid">
              {[
                { icon: <TrendingUp size={20} />, text: 'Portfolio Management & Asset Allocation' },
                { icon: <Shield size={20} />, text: 'Insurance & Risk Planning' },
                { icon: <CheckCircle size={20} />, text: 'Tax Optimization Strategies' },
                { icon: <Users size={20} />, text: 'Retirement & Estate Planning' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(192, 160, 98, 0.08)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(192, 160, 98, 0.2)', transition: 'all 0.3s ease' }}>
                  <div style={{ color: '#C0A062', flexShrink: 0 }}>{item.icon}</div>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4, fontWeight: 500 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'inline-block', padding: '12px 20px', background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.15) 0%, rgba(218, 165, 32, 0.1) 100%)', borderRadius: '8px', border: '2px solid rgba(192, 160, 98, 0.35)' }}>
              <p style={{ fontSize: '14px', color: '#C0A062', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>
                <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                AMFI Registered | IRDAI Licensed
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link href="/contact" className="btn-gold">
              <Calendar size={20} />
              Schedule Consultation
            </Link>
          </div>
        </div>

        {/* POSITION #3 - SILVER PARTNER (RESERVED) */}
        <div
          className="partner-card"
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: 'calc(100% - 30px)',
            marginLeft: '15px',
            marginRight: '15px',
            background: hoveredCard === 3
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
            borderRadius: '16px',
            padding: '60px 50px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            minHeight: '280px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hoveredCard === 3 ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredCard === 3 ? '0 8px 30px rgba(192, 160, 98, 0.1)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Left Side */}
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(192, 160, 98, 0.75)', letterSpacing: '2px', marginBottom: '16px' }}>
              #3 - SILVER PARTNER
            </div>

            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(192, 160, 98, 0.85)', fontWeight: 600, margin: '0 0 14px 0', letterSpacing: '2px' }}>
              Partnership Position Available
            </h2>

            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px', lineHeight: 1.7 }}>
              We carefully select partners who meet our high standards for transparency, compliance, and client service excellence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Regulatory compliance & licensing',
                'Transparent pricing structure',
                'Strong investor protection measures',
                'Excellent user experience & support',
              ].map((criterion, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                  <CheckCircle size={18} style={{ color: 'rgba(192, 160, 98, 0.75)', flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6 }}>
                    {criterion}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link href="/contact?subject=partnership" className="btn-outline-gold">
              Apply for Partnership
            </Link>
          </div>
        </div>

      </section>

      <style>{`
        .partner-card {
          text-align: left;
        }
        
        .btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #C0A062 0%, #DAA520 100%);
          color: #000;
          padding: 20px 40px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 17px;
          font-weight: 800;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 0 6px 25px rgba(192, 160, 98, 0.3);
        }
        
        .btn-gold:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 40px rgba(192, 160, 98, 0.5);
          background: linear-gradient(135deg, #DAA520 0%, #C0A062 100%);
        }
        
        .btn-outline-gold {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          color: #C0A062;
          padding: 18px 36px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 17px;
          font-weight: 600;
          border: 2px solid rgba(192, 160, 98, 0.6);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        
        .btn-outline-gold:hover {
          background: #C0A062;
          color: #000;
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(192, 160, 98, 0.4);
        }
        
        @media (max-width: 900px) {
          .partner-card {
            grid-template-columns: 1fr !important;
            width: calc(100% - 20px) !important;
            margin-left: 10px !important;
            margin-right: 10px !important;
            padding: 40px 30px !important;
            text-align: center;
          }
          
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          
          .partner-card > div:first-child > div:first-child {
            justify-content: center;
          }
        }
        
        @media (max-width: 600px) {
          .partner-card {
            width: calc(100% - 16px) !important;
            margin-left: 8px !important;
            margin-right: 8px !important;
            padding: 32px 20px !important;
            margin-bottom: 20px !important;
          }
          
          .btn-gold, .btn-outline-gold {
            padding: 16px 32px !important;
            font-size: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}

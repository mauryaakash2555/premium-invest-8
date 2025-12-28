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
        
        {/* POSITION #1 - DIAMOND ADVISORY PARTNER (COMPETITIVE BIDDING) */}
        <div
          className="partner-card diamond-shiny-card bidding-active"
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: 'calc(100% - 30px)',
            marginLeft: '15px',
            marginRight: '15px',
            background: hoveredCard === 1 
              ? 'linear-gradient(135deg, rgba(192, 160, 98, 0.35) 0%, rgba(218, 165, 32, 0.25) 50%, rgba(0, 0, 0, 0.85) 100%)'
              : 'linear-gradient(135deg, rgba(192, 160, 98, 0.25) 0%, rgba(218, 165, 32, 0.2) 50%, rgba(0, 0, 0, 0.75) 100%)',
            border: '4px solid #C0A062',
            borderRadius: '24px',
            padding: '60px 50px',
            marginBottom: '30px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            minHeight: '400px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: hoveredCard === 1 
              ? '0 30px 120px rgba(192, 160, 98, 0.7), inset 0 0 80px rgba(192, 160, 98, 0.4)' 
              : '0 15px 60px rgba(192, 160, 98, 0.3), inset 0 0 40px rgba(192, 160, 98, 0.15)',
            transform: hoveredCard === 1 ? 'translateY(-12px) scale(1.02)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Super Shiny Overlays - Diamond Intensity */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[linearSweep_1.2s_infinite] opacity-100" />
            <div className="absolute top-0 left-0 w-full h-full opacity-60 gold-grain-texture" />
            <div className="absolute -inset-40 bg-gradient-to-tr from-[#C0A062]/30 via-transparent to-[#C0A062]/30 animate-pulse duration-[2s]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(192,160,98,0.3),_transparent_70%)] animate-ambientGlowPulse" />
          </div>

          {/* Elite badge */}
          <div
            className="elite-badge"
            style={{
              position: 'absolute',
              top: '25px',
              right: '25px',
              background: 'linear-gradient(135deg, #FFF 0%, #C0A062 50%, #DAA520 100%)',
              color: '#000',
              padding: '12px 28px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: 900,
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 40px rgba(192, 160, 98, 0.8), 0 0 20px rgba(255,255,255,0.4)',
              zIndex: 10,
              border: '2px solid #FFF',
              animation: 'pulse 2s infinite',
            }}
          >
            <Star size={16} fill="#000" className="animate-spin-slow" />
            BIDDING ACTIVE
          </div>

          {/* Left Side */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '25px' }} className="card-header-flex">
              <span style={{ fontSize: '72px', filter: 'drop-shadow(0 0 30px rgba(192, 160, 98, 0.9))' }}>💎</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFF', letterSpacing: '5px', marginBottom: '8px', textShadow: '0 0 15px rgba(192,160,98,1)' }}>
                  ULTIMATE SPONSORSHIP
                </div>
                <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontFamily: '"Playfair Display", serif', color: '#FFF', fontWeight: 900, margin: 0, letterSpacing: '3px', textShadow: '0 0 30px rgba(192, 160, 98, 0.8)' }}>
                  DIAMOND PARTNER
                </h2>
              </div>
            </div>

            <p style={{ fontSize: '24px', color: '#C0A062', marginBottom: '32px', fontWeight: 800, fontStyle: 'italic', letterSpacing: '1px', textTransform: 'uppercase' }}>
              The Ultimate Bidding War for the #1 Spot
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                'Maximum Dominance & Brand Visibility',
                'Prime Home Page Real-Estate (Reserved)',
                'Direct Access to Ultra-High-Net-Worth Leads',
                'Exclusive Media Synergy & Co-Branding',
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: '2px solid rgba(192, 160, 98, 0.6)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <Sparkles size={20} style={{ color: '#FFF', flexShrink: 0, filter: 'drop-shadow(0 0 8px #FFF)' }} />
                  <span style={{ fontSize: '17px', color: '#FFF', lineHeight: 1.6, fontWeight: 700 }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '30px', padding: '15px 20px', background: 'rgba(192,160,98,0.1)', border: '1px dashed #C0A062', borderRadius: '12px' }}>
              <p style={{ color: '#FFF', fontSize: '15px', margin: 0, fontWeight: 500 }}>
                ⚠️ <span style={{ color: '#C0A062', fontWeight: 700 }}>Note:</span> Multiple sponsors are currently bidding for this slot. Final selection based on authority and service excellence.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '25px', position: 'relative', zIndex: 1 }} className="card-right-side">
            <div style={{ textAlign: 'center', background: 'rgba(0, 0, 0, 0.6)', padding: '35px 45px', borderRadius: '24px', border: '3px solid #C0A062', marginBottom: '15px', boxShadow: '0 0 50px rgba(192, 160, 98, 0.5), inset 0 0 20px rgba(192,160,98,0.2)' }}>
              <div style={{ fontSize: '18px', color: '#C0A062', marginBottom: '12px', letterSpacing: '3px', fontWeight: 900 }}>CURRENT BIDDING</div>
              <div style={{ fontSize: '46px', color: '#FFF', fontWeight: 900, fontFamily: '"Playfair Display", serif', letterSpacing: '1px', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '38px' }}>₹</span>
                <span>2-3 Lakh</span>
              </div>
              <div style={{ fontSize: '15px', color: '#C0A062', marginTop: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>🔥 12 SPONSORS VYING</div>
            </div>

            <Link href="/contact?subject=diamond-bidding-competition" className="btn-diamond-shiny">
              Enter the Competition
            </Link>
            
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>SLOT RENEWS MONTHLY</p>
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
          <div 
            className="verified-badge"
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              background: 'rgba(192, 160, 98, 0.2)', 
              border: '2px solid #C0A062', 
              color: '#C0A062', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 700, 
              letterSpacing: '1px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              zIndex: 10
            }}
          >
            <CheckCircle size={14} />
            VERIFIED PARTNER
          </div>

          {/* Left Side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }} className="card-header-flex">
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-right-side">
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-right-side">
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

        .btn-diamond-shiny {
          display: inline-flex;
          align-items: center;
          gap: 15px;
          background: linear-gradient(135deg, #FFF 0%, #C0A062 50%, #DAA520 100%);
          color: #000;
          padding: 24px 48px;
          border-radius: 15px;
          text-decoration: none;
          font-size: 18px;
          font-weight: 900;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          box-shadow: 0 10px 40px rgba(192, 160, 98, 0.5);
          border: 2px solid #FFF;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-diamond-shiny:hover {
          transform: scale(1.08) rotate(-1deg);
          box-shadow: 0 20px 60px rgba(192, 160, 98, 0.8);
          background: linear-gradient(135deg, #DAA520 0%, #C0A062 50%, #FFF 100%);
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
          
          .card-header-flex {
            justify-content: center !important;
            flex-direction: column !important;
            text-align: center !important;
          }

          .elite-badge, .verified-badge {
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            margin: 0 auto 20px !important;
            width: fit-content !important;
          }
          
          .card-right-side {
            width: 100% !important;
            margin-top: 20px !important;
          }
        }
        
        @media (max-width: 600px) {
          .partner-card {
            width: calc(100% - 16px) !important;
            margin-left: 8px !important;
            margin-right: 8px !important;
            padding: 24px 16px !important;
            margin-bottom: 20px !important;
            border-radius: 16px !important;
          }
          
          .btn-gold, .btn-outline-gold, .btn-diamond-shiny {
            padding: 14px 24px !important;
            font-size: 14px !important;
            width: 100% !important;
            justify-content: center !important;
          }

          .card-right-side div[style*="fontSize: '46px'"] {
            font-size: 32px !important;
          }

          .card-right-side div[style*="padding: '35px 45px'"] {
            padding: 20px 25px !important;
          }

          .card-header-flex svg {
            width: 48px !important;
            height: 48px !important;
          }

          h2[style*="fontSize: 'clamp(32px, 5vw, 52px)'"] {
            font-size: 28px !important;
          }
        }

        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 10px 40px rgba(192, 160, 98, 0.8); }
          50% { transform: scale(1.05); box-shadow: 0 15px 60px rgba(192, 160, 98, 1); }
          100% { transform: scale(1); box-shadow: 0 10px 40px rgba(192, 160, 98, 0.8); }
        }

        @keyframes linearSweep {
          0% { transform: translateX(-100%) skewX(-25deg); }
          100% { transform: translateX(200%) skewX(-25deg); }
        }

        @keyframes ambientGlowPulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(1); }
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

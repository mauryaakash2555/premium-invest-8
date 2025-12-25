"use client";

import { useEffect } from 'react';
import { Shield, TrendingUp, Users, CheckCircle, Calendar, Sparkles, Award, Star } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
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
        className="hero-section"
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
            className="hero-badge"
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

      {/* Partner Tiers Section */}
      <section style={{ padding: '40px 20px 100px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* POSITION #1 - DIAMOND ADVISORY PARTNER (RESERVED) */}
        <div
          className="partner-card diamond-card"
          style={{
            background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.12) 0%, rgba(218, 165, 32, 0.08) 50%, rgba(0, 0, 0, 0.5) 100%)',
            border: '3px solid rgba(192, 160, 98, 0.5)',
            borderRadius: '16px',
            padding: '70px 90px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            gap: '60px',
            alignItems: 'center',
            minHeight: '400px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s ease',
            boxShadow: '0 8px 40px rgba(192, 160, 98, 0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 60px rgba(192, 160, 98, 0.35)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 40px rgba(192, 160, 98, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Animated shimmer effect */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent 30%, rgba(192, 160, 98, 0.1) 50%, transparent 70%)',
              animation: 'shimmer 8s infinite',
              pointerEvents: 'none',
            }}
            className="shimmer-effect"
          />

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
            className="tier-badge"
          >
            <Star size={14} fill="#000" />
            ELITE TIER
          </div>

          {/* Left Side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }} className="card-header">
              <span style={{ fontSize: '48px' }}>💎</span>
              <div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#C0A062',
                    letterSpacing: '3px',
                    marginBottom: '6px',
                  }}
                  className="position-label"
                >
                  POSITION #1
                </div>
                <h2
                  style={{
                    fontSize: '46px',
                    fontFamily: '"Playfair Display", serif',
                    color: '#C0A062',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '3px',
                    textShadow: '0 2px 15px rgba(192, 160, 98, 0.5)',
                  }}
                  className="partner-title"
                >
                  DIAMOND ADVISORY PARTNER
                </h2>
              </div>
            </div>

            <p
              style={{
                fontSize: '22px',
                color: 'rgba(192, 160, 98, 0.95)',
                marginBottom: '36px',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
              className="partner-tagline"
            >
              Reserved for Premium Financial Services Partnership
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="benefits-list">
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
                    gap: '14px',
                    background: 'rgba(192, 160, 98, 0.08)',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(192, 160, 98, 0.2)',
                  }}
                  className="benefit-item"
                >
                  <Sparkles size={20} style={{ color: '#C0A062', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '17px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }} className="card-actions">
            <div
              style={{
                textAlign: 'center',
                background: 'rgba(192, 160, 98, 0.15)',
                padding: '20px 28px',
                borderRadius: '12px',
                border: '2px solid rgba(192, 160, 98, 0.3)',
                marginBottom: '12px',
              }}
              className="investment-box"
            >
              <div style={{ fontSize: '14px', color: 'rgba(192, 160, 98, 0.8)', marginBottom: '8px', letterSpacing: '1px', fontWeight: 600 }}>INVESTMENT</div>
              <div style={{ 
                fontSize: '32px', 
                color: '#C0A062', 
                fontWeight: 700, 
                fontFamily: '"Playfair Display", serif', 
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '4px',
              }}>
                <span style={{ fontSize: '28px' }}>₹</span>
                <span>2-3 Lakh</span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>per month</div>
            </div>

            <Link
              to="/contact?subject=diamond-advisory-partnership"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)',
                color: '#000',
                padding: '20px 40px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 700,
                border: '2px solid transparent',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 25px rgba(192, 160, 98, 0.3)',
              }}
              className="cta-button primary"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 35px rgba(192, 160, 98, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 6px 25px rgba(192, 160, 98, 0.3)';
              }}
            >
              Apply for Partnership
            </Link>
          </div>
        </div>

        {/* POSITION #2 - BM WEALTH (GOLD PARTNER) */}
        <div
          className="partner-card"
          style={{
            background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.08) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '3px solid rgba(192, 160, 98, 0.4)',
            borderRadius: '16px',
            padding: '70px 90px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            gap: '60px',
            alignItems: 'center',
            minHeight: '400px',
            position: 'relative',
            transition: 'all 0.4s ease',
            boxShadow: '0 6px 35px rgba(192, 160, 98, 0.12)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.6)';
            e.currentTarget.style.boxShadow = '0 10px 50px rgba(192, 160, 98, 0.25)';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.4)';
            e.currentTarget.style.boxShadow = '0 6px 35px rgba(192, 160, 98, 0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Verified badge */}
          <div
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
            }}
            className="tier-badge"
          >
            <CheckCircle size={14} />
            VERIFIED PARTNER
          </div>

          {/* Left Side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#000',
                  letterSpacing: '2px',
                }}
                className="position-label"
              >
                #2 - GOLD PARTNER
              </div>
            </div>

            <h2
              style={{
                fontSize: '46px',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                fontWeight: 700,
                margin: '0 0 14px 0',
                letterSpacing: '3px',
                textShadow: '0 2px 12px rgba(192, 160, 98, 0.4)',
              }}
              className="partner-title"
            >
              BM WEALTH
            </h2>

            <p
              style={{
                fontSize: '20px',
                color: 'rgba(192, 160, 98, 0.9)',
                marginBottom: '24px',
                fontWeight: 600,
              }}
              className="partner-tagline"
            >
              Personalized Financial Planning & Wealth Management
            </p>

            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.8,
                marginBottom: '32px',
              }}
              className="partner-description"
            >
              Mumbai's trusted advisors for comprehensive wealth management. We provide tailored solutions for portfolio optimization, tax planning, insurance strategies, and retirement planning.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '18px',
                marginBottom: '28px',
              }}
              className="services-grid"
            >
              {[
                { icon: <TrendingUp size={22} />, text: 'Portfolio Management & Asset Allocation' },
                { icon: <Shield size={22} />, text: 'Insurance & Risk Planning' },
                { icon: <CheckCircle size={22} />, text: 'Tax Optimization Strategies' },
                { icon: <Users size={22} />, text: 'Retirement & Estate Planning' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(192, 160, 98, 0.08)',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(192, 160, 98, 0.2)',
                  }}
                  className="service-item"
                >
                  <div style={{ color: '#C0A062', flexShrink: 0 }}>{item.icon}</div>
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.15) 0%, rgba(218, 165, 32, 0.1) 100%)',
                borderRadius: '8px',
                border: '2px solid rgba(192, 160, 98, 0.35)',
              }}
              className="certification-badge"
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#C0A062',
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                AMFI Registered | IRDAI Licensed
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-actions">
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)',
                color: '#000',
                padding: '22px 44px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '19px',
                fontWeight: 800,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 25px rgba(192, 160, 98, 0.3)',
              }}
              className="cta-button primary"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 35px rgba(192, 160, 98, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 6px 25px rgba(192, 160, 98, 0.3)';
              }}
            >
              <Calendar size={22} />
              Schedule Consultation
            </Link>
          </div>
        </div>

        {/* POSITION #3 - SILVER PARTNER (RESERVED) */}
        <div
          className="partner-card"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
            borderRadius: '16px',
            padding: '70px 90px',
            marginBottom: '60px',
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            gap: '60px',
            alignItems: 'center',
            minHeight: '400px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.35)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(192, 160, 98, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.25)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Left Side */}
          <div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.75)',
                letterSpacing: '2px',
                marginBottom: '18px',
              }}
              className="position-label"
            >
              #3 - SILVER PARTNER
            </div>

            <h2
              style={{
                fontSize: '46px',
                fontFamily: '"Playfair Display", serif',
                color: 'rgba(192, 160, 98, 0.85)',
                fontWeight: 600,
                margin: '0 0 14px 0',
                letterSpacing: '2px',
              }}
              className="partner-title"
            >
              Partnership Position Available
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '32px',
                lineHeight: 1.8,
              }}
              className="partner-description"
            >
              We carefully select partners who meet our high standards for transparency, compliance, and client service excellence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="benefits-list">
              {[
                'Regulatory compliance & licensing',
                'Transparent pricing structure',
                'Strong investor protection measures',
                'Excellent user experience & support',
              ].map((criterion, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                  }}
                  className="benefit-item"
                >
                  <CheckCircle size={20} style={{ color: 'rgba(192, 160, 98, 0.75)', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: 1.6,
                    }}
                  >
                    {criterion}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-actions">
            <Link
              to="/contact?subject=partnership"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#C0A062',
                padding: '20px 40px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 600,
                border: '2px solid rgba(192, 160, 98, 0.6)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              className="cta-button"
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(192, 160, 98, 0.12)';
                e.target.style.borderColor = '#C0A062';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(192, 160, 98, 0.6)';
              }}
            >
              Apply for Partnership
            </Link>
          </div>
        </div>

        {/* Enhanced Mobile Responsive Styles + Animations */}
        <style>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) translateY(-100%) rotate(45deg);
            }
            100% {
              transform: translateX(100%) translateY(100%) rotate(45deg);
            }
          }

          /* Desktop: keep original layout */
          @media (min-width: 1025px) {
            .partner-card {
              /* Keep desktop styles intact */
            }
          }

          /* Tablet: 768px - 1024px */
          @media (max-width: 1024px) {
            .partner-card {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
              padding: 40px 30px !important;
              min-height: auto !important;
              text-align: center !important;
            }
            
            /* Hide shimmer on tablet/mobile */
            .shimmer-effect {
              display: none !important;
            }
            
            .card-header {
              flex-direction: column !important;
              align-items: center !important;
              gap: 12px !important;
            }
            
            .services-grid {
              grid-template-columns: 1fr !important;
            }
            
            .card-actions {
              justify-content: center !important;
            }
          }

          /* Mobile: max-width 767px */
          @media (max-width: 767px) {
            /* Hero Section */
            .hero-section {
              min-height: 50vh !important;
              padding-top: 100px !important;
              padding-bottom: 40px !important;
            }
            
            .hero-badge span {
              font-size: 11px !important;
              letter-spacing: 1px !important;
            }
            
            .hero-badge svg {
              width: 14px !important;
              height: 14px !important;
            }
            
            /* All partner cards */
            .partner-card {
              display: flex !important;
              flex-direction: column !important;
              padding: 24px 16px !important;
              gap: 20px !important;
              text-align: center !important;
              margin-bottom: 24px !important;
              border-radius: 10px !important;
            }
            
            /* Hide shimmer effect */
            .shimmer-effect {
              display: none !important;
            }
            
            /* Tier badges */
            .tier-badge {
              font-size: 9px !important;
              padding: 5px 10px !important;
              top: 12px !important;
              right: 12px !important;
            }
            
            .tier-badge svg {
              width: 12px !important;
              height: 12px !important;
            }
            
            /* Card headers */
            .card-header {
              flex-direction: column !important;
              align-items: center !important;
              gap: 8px !important;
              margin-bottom: 12px !important;
            }
            
            .card-header span {
              font-size: 32px !important;
            }
            
            /* Position labels */
            .position-label {
              font-size: 12px !important;
              letter-spacing: 1.5px !important;
              margin-bottom: 6px !important;
            }
            
            /* Partner titles */
            .partner-title {
              font-size: clamp(24px, 6vw, 32px) !important;
              letter-spacing: 1.5px !important;
              line-height: 1.2 !important;
              margin: 0 0 10px 0 !important;
            }
            
            /* Taglines */
            .partner-tagline {
              font-size: 15px !important;
              margin-bottom: 20px !important;
              line-height: 1.5 !important;
            }
            
            /* Descriptions */
            .partner-description {
              font-size: 14px !important;
              line-height: 1.6 !important;
              margin-bottom: 20px !important;
            }
            
            /* Services grid */
            .services-grid {
              display: flex !important;
              flex-direction: column !important;
              gap: 10px !important;
            }
            
            .service-item {
              padding: 10px 12px !important;
            }
            
            .service-item span {
              font-size: 13px !important;
            }
            
            .service-item svg {
              width: 18px !important;
              height: 18px !important;
            }
            
            /* Benefits list */
            .benefits-list {
              gap: 10px !important;
              text-align: left !important;
            }
            
            .benefit-item {
              padding: 10px 12px !important;
            }
            
            .benefit-item span {
              font-size: 14px !important;
              line-height: 1.5 !important;
            }
            
            .benefit-item svg {
              width: 16px !important;
              height: 16px !important;
            }
            
            /* Investment box */
            .investment-box {
              padding: 16px 20px !important;
              margin-bottom: 16px !important;
            }
            
            .investment-box > div:first-child {
              font-size: 12px !important;
            }
            
            .investment-box > div:nth-child(2) {
              font-size: 24px !important;
            }
            
            .investment-box > div:nth-child(2) span:first-child {
              font-size: 20px !important;
            }
            
            .investment-box > div:last-child {
              font-size: 11px !important;
            }
            
            /* Certification badge */
            .certification-badge {
              padding: 10px 16px !important;
            }
            
            .certification-badge p {
              font-size: 12px !important;
            }
            
            .certification-badge svg {
              width: 14px !important;
              height: 14px !important;
            }
            
            /* Action buttons */
            .card-actions {
              width: 100% !important;
              justify-content: center !important;
              margin-top: 10px !important;
            }
            
            .cta-button {
              width: 100% !important;
              max-width: 100% !important;
              padding: 14px 20px !important;
              font-size: 14px !important;
              white-space: normal !important;
              text-align: center !important;
              justify-content: center !important;
              line-height: 1.4 !important;
            }
            
            .cta-button svg {
              width: 18px !important;
              height: 18px !important;
            }
          }

          /* Extra small mobile: max-width 480px */
          @media (max-width: 480px) {
            .partner-card {
              padding: 20px 12px !important;
              margin-bottom: 20px !important;
            }
            
            .card-header span {
              font-size: 28px !important;
            }
            
            .partner-title {
              font-size: 22px !important;
              letter-spacing: 1px !important;
            }
            
            .partner-tagline {
              font-size: 14px !important;
            }
            
            .partner-description {
              font-size: 13px !important;
            }
            
            .service-item span,
            .benefit-item span {
              font-size: 12px !important;
            }
            
            .cta-button {
              padding: 12px 16px !important;
              font-size: 13px !important;
            }
            
            .position-label {
              font-size: 11px !important;
            }
            
            .tier-badge {
              font-size: 8px !important;
              padding: 4px 8px !important;
            }
            
            .investment-box > div:nth-child(2) {
              font-size: 20px !important;
            }
            
            .investment-box > div:nth-child(2) span:first-child {
              font-size: 18px !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};



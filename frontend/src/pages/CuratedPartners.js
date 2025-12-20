import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, TrendingUp, Users, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const CuratedPartners = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <Helmet>
        <title>Curated Partners | BM Wealth Mumbai</title>
        <meta name="description" content="Partner with BM Wealth for premium financial advisory services. AMFI Registered | IRDAI Licensed financial advisors in Mumbai." />
        <meta name="keywords" content="financial partners, investment advisory, BM Wealth, Mumbai financial advisors, AMFI, IRDAI" />
        <link rel="canonical" href="https://www.bmwealth.co.in/curated-partners" />
      </Helmet>

      {/* Hero Section */}
      <section
        style={{
          minHeight: '55vh',
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
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.7) 100%)',
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
            Curated Partners
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
            A network of trusted professionals for your complete financial wellness
          </p>
        </div>
      </section>

      {/* Partner Tiers Section */}
      <section style={{ padding: '40px 20px 100px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* POSITION #1 - DIAMOND ADVISORY PARTNER (RESERVED) */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)',
            border: '2px solid rgba(192, 160, 98, 0.4)',
            borderRadius: '12px',
            padding: '60px 80px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            gap: '60px',
            alignItems: 'center',
            minHeight: '300px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(192, 160, 98, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
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
                  DIAMOND ADVISORY PARTNER
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
              Reserved for Premium Financial Services Partnership
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Exclusive advisory positioning',
                'Co-branded content strategy',
                'Featured across all platforms',
                'Strategic partnership benefits',
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
              to="/contact?subject=diamond-advisory-partnership"
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
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(192, 160, 98, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Apply for Diamond Partnership
            </Link>
          </div>
        </div>

        {/* POSITION #2 - BM WEALTH (GOLD PARTNER) */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.06) 0%, rgba(0, 0, 0, 0.5) 100%)',
            border: '2px solid rgba(192, 160, 98, 0.35)',
            borderRadius: '12px',
            padding: '60px 80px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            gap: '60px',
            alignItems: 'center',
            minHeight: '300px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.5)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(192, 160, 98, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.35)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Left Side */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.9)',
                letterSpacing: '2px',
                marginBottom: '8px',
              }}
            >
              #2 - GOLD PARTNER
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
              BM WEALTH
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: 'rgba(192, 160, 98, 0.85)',
                marginBottom: '24px',
                fontWeight: 500,
              }}
            >
              Personalized Financial Planning & Wealth Management
            </p>

            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: 1.7,
                marginBottom: '28px',
              }}
            >
              Mumbai's trusted advisors for comprehensive wealth management. We provide tailored solutions for portfolio optimization, tax planning, insurance strategies, and retirement planning.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              {[
                { icon: <TrendingUp size={20} />, text: 'Portfolio Management' },
                { icon: <Shield size={20} />, text: 'Insurance & Risk Planning' },
                { icon: <CheckCircle size={20} />, text: 'Tax Optimization' },
                { icon: <Users size={20} />, text: 'Retirement Planning' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{ color: '#C0A062' }}>{item.icon}</div>
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.8)',
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
                padding: '10px 16px',
                background: 'rgba(192, 160, 98, 0.12)',
                borderRadius: '6px',
                border: '1px solid rgba(192, 160, 98, 0.25)',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: '#C0A062',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                AMFI Registered | IRDAI Licensed
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link
              to="/contact"
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
              onMouseEnter={(e) => {
                e.target.style.background = '#DAA520';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#C0A062';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <Calendar size={20} />
              Schedule Free Consultation
            </Link>
          </div>
        </div>

        {/* POSITION #3 - SILVER PARTNER (RESERVED) */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(192, 160, 98, 0.2)',
            borderRadius: '12px',
            padding: '60px 80px',
            marginBottom: '60px',
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            gap: '60px',
            alignItems: 'center',
            minHeight: '300px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.3)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(192, 160, 98, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Left Side */}
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.7)',
                letterSpacing: '2px',
                marginBottom: '16px',
              }}
            >
              #3 - SILVER PARTNER
            </div>

            <h2
              style={{
                fontSize: '42px',
                fontFamily: '"Playfair Display", serif',
                color: 'rgba(192, 160, 98, 0.8)',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '2px',
              }}
            >
              Partnership Position Available
            </h2>

            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.65)',
                marginBottom: '28px',
                lineHeight: 1.7,
              }}
            >
              We carefully select partners who meet our high standards for transparency, compliance, and client service.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Regulatory compliance & licensing',
                'Transparent pricing structure',
                'Strong investor protection',
                'Excellent user experience',
              ].map((criterion, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckCircle size={18} style={{ color: 'rgba(192, 160, 98, 0.7)', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.7)',
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link
              to="/contact?subject=partnership"
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
                border: '2px solid rgba(192, 160, 98, 0.6)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(192, 160, 98, 0.1)';
                e.target.style.borderColor = '#C0A062';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(192, 160, 98, 0.6)';
              }}
            >
              Partnership Application
            </Link>
          </div>
        </div>

        {/* Responsive Styles */}
        <style>{`
          @media (max-width: 1024px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
              padding: 50px 40px !important;
            }
          }

          @media (max-width: 768px) {
            div[style*="gridTemplateColumns"] {
              padding: 40px 30px !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};

export default CuratedPartners;

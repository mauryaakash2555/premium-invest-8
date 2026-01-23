import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, TrendingUp, Users, CheckCircle, Calendar, Sparkles, Award, Star } from 'lucide-react';
import Link from 'next/link';
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
            background: 'linear-gradient(135deg, rgba(10,10,10,0.4) 0%, color-mix(in oklab, var(--lux-accent) 15%, transparent) 50%, rgba(10,10,10,0.6) 100%)',
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '1000px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 25%, transparent) 0%, color-mix(in oklab, var(--lux-accent) 15%, transparent) 100%)',
              border: '2px solid color-mix(in oklab, var(--lux-accent) 50%, transparent)',
              borderRadius: '30px',
              padding: '10px 24px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px color-mix(in oklab, var(--lux-accent) 25%, transparent)',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'var(--lux-accent)',
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
              color: 'var(--lux-accent)',
              lineHeight: 1.2,
              textShadow: '0 4px 20px color-mix(in oklab, var(--lux-accent) 40%, transparent)',
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
          style={{
            background: 'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 12%, transparent) 0%, color-mix(in oklab, var(--lux-accent) 8%, transparent) 50%, rgba(0, 0, 0, 0.5) 100%)',
            border: '3px solid color-mix(in oklab, var(--lux-accent) 50%, transparent)',
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
            boxShadow: '0 8px 40px color-mix(in oklab, var(--lux-accent) 15%, transparent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 60px color-mix(in oklab, var(--lux-accent) 35%, transparent)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 40px color-mix(in oklab, var(--lux-accent) 15%, transparent)';
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
              background: 'linear-gradient(45deg, transparent 30%, color-mix(in oklab, var(--lux-accent) 10%, transparent) 50%, transparent 70%)',
              animation: 'shimmer 8s infinite',
              pointerEvents: 'none',
            }}
          />

          {/* Elite badge */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, var(--lux-accent) 0%, var(--lux-accent) 100%)',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px color-mix(in oklab, var(--lux-accent) 40%, transparent)',
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
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--lux-accent)',
                    letterSpacing: '3px',
                    marginBottom: '6px',
                  }}
                >
                  POSITION #1
                </div>
                <h2
                  style={{
                    fontSize: '46px',
                    fontFamily: '"Playfair Display", serif',
                    color: 'var(--lux-accent)',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '3px',
                    textShadow: '0 2px 15px color-mix(in oklab, var(--lux-accent) 50%, transparent)',
                  }}
                >
                  DIAMOND ADVISORY PARTNER
                </h2>
              </div>
            </div>

            <p
              style={{
                fontSize: '22px',
                color: 'color-mix(in oklab, var(--lux-accent) 95%, transparent)',
                marginBottom: '36px',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              Reserved for Premium Financial Services Partnership
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    background: 'color-mix(in oklab, var(--lux-accent) 8%, transparent)',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: '1px solid color-mix(in oklab, var(--lux-accent) 20%, transparent)',
                  }}
                >
                  <Sparkles size={20} style={{ color: 'var(--lux-accent)', flexShrink: 0 }} />
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
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                textAlign: 'center',
                background: 'color-mix(in oklab, var(--lux-accent) 15%, transparent)',
                padding: '20px 28px',
                borderRadius: '12px',
                border: '2px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '14px', color: 'color-mix(in oklab, var(--lux-accent) 80%, transparent)', marginBottom: '8px', letterSpacing: '1px', fontWeight: 600 }}>INVESTMENT</div>
              <div style={{ 
                fontSize: '32px', 
                color: 'var(--lux-accent)', 
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
                background: 'linear-gradient(135deg, var(--lux-accent) 0%, var(--lux-accent) 100%)',
                color: '#000',
                padding: '20px 40px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 700,
                border: '2px solid transparent',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 25px color-mix(in oklab, var(--lux-accent) 30%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 35px color-mix(in oklab, var(--lux-accent) 50%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 6px 25px color-mix(in oklab, var(--lux-accent) 30%, transparent)';
              }}
            >
              Apply for Partnership
            </Link>
          </div>
        </div>

        {/* POSITION #2 - BM WEALTH (GOLD PARTNER) */}
        <div
          style={{
            background: 'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 8%, transparent) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '3px solid color-mix(in oklab, var(--lux-accent) 40%, transparent)',
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
            boxShadow: '0 6px 35px color-mix(in oklab, var(--lux-accent) 12%, transparent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 60%, transparent)';
            e.currentTarget.style.boxShadow = '0 10px 50px color-mix(in oklab, var(--lux-accent) 25%, transparent)';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 40%, transparent)';
            e.currentTarget.style.boxShadow = '0 6px 35px color-mix(in oklab, var(--lux-accent) 12%, transparent)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Verified badge */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'color-mix(in oklab, var(--lux-accent) 20%, transparent)',
              border: '2px solid var(--lux-accent)',
              color: 'var(--lux-accent)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle size={14} />
            VERIFIED PARTNER
          </div>

          {/* Left Side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--lux-accent) 0%, var(--lux-accent) 100%)',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#000',
                  letterSpacing: '2px',
                }}
              >
                #2 - GOLD PARTNER
              </div>
            </div>

            <h2
              style={{
                fontSize: '46px',
                fontFamily: '"Playfair Display", serif',
                color: 'var(--lux-accent)',
                fontWeight: 700,
                margin: '0 0 14px 0',
                letterSpacing: '3px',
                textShadow: '0 2px 12px color-mix(in oklab, var(--lux-accent) 40%, transparent)',
              }}
            >
              BM WEALTH
            </h2>

            <p
              style={{
                fontSize: '20px',
                color: 'color-mix(in oklab, var(--lux-accent) 90%, transparent)',
                marginBottom: '24px',
                fontWeight: 600,
              }}
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
                    background: 'color-mix(in oklab, var(--lux-accent) 8%, transparent)',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid color-mix(in oklab, var(--lux-accent) 20%, transparent)',
                  }}
                >
                  <div style={{ color: 'var(--lux-accent)', flexShrink: 0 }}>{item.icon}</div>
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
                background: 'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 15%, transparent) 0%, color-mix(in oklab, var(--lux-accent) 10%, transparent) 100%)',
                borderRadius: '8px',
                border: '2px solid color-mix(in oklab, var(--lux-accent) 35%, transparent)',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--lux-accent)',
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, var(--lux-accent) 0%, var(--lux-accent) 100%)',
                color: '#000',
                padding: '22px 44px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '19px',
                fontWeight: 800,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 25px color-mix(in oklab, var(--lux-accent) 30%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 35px color-mix(in oklab, var(--lux-accent) 50%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 6px 25px color-mix(in oklab, var(--lux-accent) 30%, transparent)';
              }}
            >
              <Calendar size={22} />
              Schedule Consultation
            </Link>
          </div>
        </div>

        {/* POSITION #3 - SILVER PARTNER (RESERVED) */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '2px solid color-mix(in oklab, var(--lux-accent) 25%, transparent)',
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
            e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 35%, transparent)';
            e.currentTarget.style.boxShadow = '0 6px 30px color-mix(in oklab, var(--lux-accent) 15%, transparent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 25%, transparent)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Left Side */}
          <div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: 'color-mix(in oklab, var(--lux-accent) 75%, transparent)',
                letterSpacing: '2px',
                marginBottom: '18px',
              }}
            >
              #3 - SILVER PARTNER
            </div>

            <h2
              style={{
                fontSize: '46px',
                fontFamily: '"Playfair Display", serif',
                color: 'color-mix(in oklab, var(--lux-accent) 85%, transparent)',
                fontWeight: 600,
                margin: '0 0 14px 0',
                letterSpacing: '2px',
              }}
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
            >
              We carefully select partners who meet our high standards for transparency, compliance, and client service excellence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                >
                  <CheckCircle size={20} style={{ color: 'color-mix(in oklab, var(--lux-accent) 75%, transparent)', flexShrink: 0 }} />
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link
              to="/contact?subject=partnership"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: 'var(--lux-accent)',
                padding: '20px 40px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 600,
                border: '2px solid color-mix(in oklab, var(--lux-accent) 60%, transparent)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'color-mix(in oklab, var(--lux-accent) 12%, transparent)';
                e.target.style.borderColor = 'var(--lux-accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 60%, transparent)';
              }}
            >
              Apply for Partnership
            </Link>
          </div>
        </div>

        {/* Responsive Styles + Animations */}
        <style>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) translateY(-100%) rotate(45deg);
            }
            100% {
              transform: translateX(100%) translateY(100%) rotate(45deg);
            }
          }

          @media (max-width: 1024px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
              padding: 40px 30px !important;
              min-height: auto !important;
              text-align: center !important;
            }
            
            /* Hide shimmer on tablet/mobile */
            div[style*="shimmer"] {
              display: none !important;
            }
          }

          @media (max-width: 768px) {
            /* Hero Section */
            section {
              min-height: 45vh !important;
              padding-top: 80px !important;
              padding-bottom: 30px !important;
            }
            
            /* All grid sections to single column */
            div[style*="gridTemplateColumns"],
            div[style*="display: 'grid'"] {
              display: flex !important;
              flex-direction: column !important;
              padding: 30px 20px !important;
              gap: 20px !important;
              text-align: center !important;
            }
            
            /* Elite/Verified badges */
            div[style*="ELITE TIER"],
            div[style*="VERIFIED PARTNER"] {
              font-size: 9px !important;
              padding: 5px 12px !important;
              top: 12px !important;
              right: 12px !important;
            }
            
            /* Position headers - make compact */
            div[style*="display: 'flex'"][style*="alignItems: 'center'"] {
              flex-direction: column !important;
              text-align: center !important;
              gap: 8px !important;
            }
            
            /* Position numbers */
            div[style*="POSITION"] h2 {
              font-size: clamp(22px, 5vw, 28px) !important;
              letter-spacing: 1px !important;
            }
            
            /* Partner names */
            h2, h3 {
              font-size: clamp(22px, 5vw, 28px) !important;
              letter-spacing: 1px !important;
              line-height: 1.3 !important;
              margin: 8px 0 !important;
            }
            
            /* Taglines and descriptions */
            p {
              font-size: clamp(14px, 3.5vw, 16px) !important;
              line-height: 1.6 !important;
              margin-bottom: 16px !important;
            }
            
            /* Benefits and features */
            div[style*="CheckCircle"],
            div[style*="TrendingUp"],
            div[style*="Shield"] {
              font-size: 14px !important;
              padding: 8px 12px !important;
            }
            
            /* BM Wealth offerings grid */
            div[style*="gridTemplateColumns: '1fr 1fr'"] {
              display: flex !important;
              flex-direction: column !important;
              gap: 10px !important;
            }
            
            /* Buttons */
            a[style*="padding"] {
              padding: 14px 28px !important;
              font-size: clamp(13px, 3.5vw, 15px) !important;
              width: auto !important;
              max-width: 100% !important;
              white-space: normal !important;
              line-height: 1.4 !important;
              text-align: center !important;
              display: inline-flex !important;
              justify-content: center !important;
            }
            
            /* Icons */
            span[style*="fontSize: '46px'"],
            span[style*="fontSize: '36px'"] {
              font-size: 32px !important;
            }
            
            /* Investment info card */
            div[style*="INVESTMENT"] {
              padding: 16px 20px !important;
            }
            
            div[style*="fontSize: '32px'"] {
              font-size: clamp(20px, 5vw, 24px) !important;
            }
            
            div[style*="fontSize: '14px'"][style*="INVESTMENT"],
            div[style*="fontSize: '13px'"] {
              font-size: 12px !important;
            }
            
            /* Award badge in hero */
            div[style*="FEATURED ADVISORY PARTNERS"] span {
              font-size: 11px !important;
              padding: 8px 16px !important;
            }
          }

          @media (max-width: 480px) {
            div[style*="gridTemplateColumns"],
            div[style*="display: 'grid'"] {
              padding: 20px 16px !important;
            }
            
            h2, h3 {
              font-size: 20px !important;
            }
            
            a[style*="padding"] {
              padding: 12px 24px !important;
              font-size: 13px !important;
            }
            
            span[style*="fontSize"] {
              font-size: 28px !important;
            }
            
            div[style*="ELITE TIER"],
            div[style*="VERIFIED PARTNER"] {
              font-size: 8px !important;
              padding: 4px 10px !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};

export default CuratedPartners;


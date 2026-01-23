import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
const Platforms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <Helmet>
        <title>Recommended Investment Platforms | BM Wealth Mumbai</title>
        <meta name="description" content="Discover top investment platforms recommended by BM Wealth. Compare Zerodha, Smallcase, and Groww for your trading and investment needs." />
        <meta name="keywords" content="investment platforms, trading platforms, Zerodha, Smallcase, Groww, Mumbai investment" />
        <link rel="canonical" href="https://www.bmwealth.co.in/recommended-platforms" />
      </Helmet>

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
          opacity: 0.75,
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
              color: 'var(--lux-accent)',
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
      <section style={{ padding: '40px 20px 100px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* POSITION #1 - DIAMOND PARTNER (RESERVED) */}
        <div
          style={{
            background: 'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 8%, transparent) 0%, rgba(0, 0, 0, 0.4) 100%)',
            border: '2px solid color-mix(in oklab, var(--lux-accent) 40%, transparent)',
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
            e.currentTarget.style.boxShadow = '0 0 40px color-mix(in oklab, var(--lux-accent) 20%, transparent)';
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
                    color: 'var(--lux-accent)',
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
                    color: 'var(--lux-accent)',
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
                color: 'color-mix(in oklab, var(--lux-accent) 90%, transparent)',
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
                  <Sparkles size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0 }} />
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
              to="/contact?subject=diamond-partnership"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: 'var(--lux-accent)',
                padding: '18px 36px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: 600,
                border: '2px solid var(--lux-accent)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'color-mix(in oklab, var(--lux-accent) 15%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Apply for Diamond Partnership
            </Link>
          </div>
        </div>

        {/* POSITION #2 - ZERODHA */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid color-mix(in oklab, var(--lux-accent) 25%, transparent)',
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
            e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 40%, transparent)';
            e.currentTarget.style.boxShadow = '0 0 30px color-mix(in oklab, var(--lux-accent) 15%, transparent)';
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
                fontSize: '24px',
                fontWeight: 700,
                color: 'color-mix(in oklab, var(--lux-accent) 80%, transparent)',
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
                color: 'var(--lux-accent)',
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
                color: 'color-mix(in oklab, var(--lux-accent) 85%, transparent)',
                marginBottom: '28px',
                fontWeight: 500,
              }}
            >
              India's largest discount broker
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
                  <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0, marginTop: '2px' }} />
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
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--lux-accent)',
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
                e.target.style.background = 'var(--lux-accent)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--lux-accent)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Open Free Demat Account
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* POSITION #3 - SMALLCASE */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid color-mix(in oklab, var(--lux-accent) 25%, transparent)',
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
            e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 40%, transparent)';
            e.currentTarget.style.boxShadow = '0 0 30px color-mix(in oklab, var(--lux-accent) 15%, transparent)';
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
                fontSize: '24px',
                fontWeight: 700,
                color: 'color-mix(in oklab, var(--lux-accent) 80%, transparent)',
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
                color: 'var(--lux-accent)',
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
                color: 'color-mix(in oklab, var(--lux-accent) 85%, transparent)',
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
                  <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0, marginTop: '2px' }} />
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
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--lux-accent)',
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
                e.target.style.background = 'var(--lux-accent)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--lux-accent)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Explore Smallcases
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* POSITION #4 - GROWW */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid color-mix(in oklab, var(--lux-accent) 25%, transparent)',
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
            e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 40%, transparent)';
            e.currentTarget.style.boxShadow = '0 0 30px color-mix(in oklab, var(--lux-accent) 15%, transparent)';
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
                fontSize: '24px',
                fontWeight: 700,
                color: 'color-mix(in oklab, var(--lux-accent) 80%, transparent)',
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
                color: 'var(--lux-accent)',
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
                color: 'color-mix(in oklab, var(--lux-accent) 85%, transparent)',
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
                  <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0, marginTop: '2px' }} />
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
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--lux-accent)',
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
                e.target.style.background = 'var(--lux-accent)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--lux-accent)';
                e.target.style.transform = 'scale(1)';
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
            <strong style={{ color: 'color-mix(in oklab, var(--lux-accent) 60%, transparent)' }}>Affiliate Disclosure:</strong> We may earn commission when you sign up through our links at no extra cost to you. This helps us provide free educational content.
          </p>
        </div>

        {/* Responsive Styles */}
        <style>{`
          @media (max-width: 1024px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
              padding: 40px 30px !important;
              min-height: auto !important;
              text-align: center !important;
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
            
            /* Position headers - make compact */
            div[style*="display: 'flex'"][style*="alignItems: 'center'"] {
              flex-direction: column !important;
              text-align: center !important;
              gap: 8px !important;
            }
            
            /* Position numbers and titles */
            div[style*="fontSize: '16px'"][style*="POSITION"] {
              font-size: 13px !important;
              letter-spacing: 1px !important;
            }
            
            h2 {
              font-size: clamp(22px, 5vw, 28px) !important;
              letter-spacing: 1px !important;
              line-height: 1.3 !important;
              margin: 0 !important;
            }
            
            /* Taglines and descriptions */
            p {
              font-size: clamp(14px, 3.5vw, 16px) !important;
              line-height: 1.6 !important;
              margin-bottom: 16px !important;
            }
            
            /* Benefits and features */
            div[style*="gridTemplateColumns: 'repeat(2, 1fr)'"],
            div[style*="gridTemplateColumns: '1fr 1fr'"] {
              display: flex !important;
              flex-direction: column !important;
              gap: 10px !important;
            }
            
            div[style*="CheckCircle"] {
              font-size: 14px !important;
              padding: 8px 12px !important;
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
            span[style*="fontSize: '36px'"] {
              font-size: 32px !important;
            }
            
            /* Investment info card */
            div[style*="background: 'rgba(192, 160, 98"] {
              padding: 16px 20px !important;
            }
            
            div[style*="fontSize: '32px'"] {
              font-size: clamp(20px, 5vw, 24px) !important;
            }
            
            div[style*="fontSize: '14px'"][style*="MONTHLY INVESTMENT"],
            div[style*="fontSize: '13px'"] {
              font-size: 12px !important;
            }
          }

          @media (max-width: 480px) {
            div[style*="gridTemplateColumns"],
            div[style*="display: 'grid'"] {
              padding: 20px 16px !important;
            }
            
            h2 {
              font-size: 20px !important;
            }
            
            a[style*="padding"] {
              padding: 12px 24px !important;
              font-size: 13px !important;
            }
            
            span[style*="fontSize: '36px'"],
            span[style*="fontSize: '32px'"] {
              font-size: 28px !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};

export default Platforms;


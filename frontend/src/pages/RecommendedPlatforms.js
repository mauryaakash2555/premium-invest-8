import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendedPlatforms = () => {
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
        className="hero-section"
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
      <section style={{ padding: '40px 20px 100px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* POSITION #1 - DIAMOND PARTNER (RESERVED) */}
        <div
          className="platform-card diamond-card"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }} className="card-header">
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
                  className="position-label"
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
                  className="partner-title"
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
              className="partner-tagline"
            >
              Reserved for Exclusive Partnership
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="benefits-list">
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
                  className="benefit-item"
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-actions">
            <Link
              to="/contact?subject=diamond-partnership"
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
              className="cta-button"
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

        {/* POSITION #2 - ZERODHA */}
        <div
          className="platform-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
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
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(192, 160, 98, 0.15)';
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
                fontSize: '24px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.8)',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
              className="position-number"
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
              className="partner-title"
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
              className="partner-tagline"
            >
              India's largest discount broker
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="benefits-list">
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
                  className="benefit-item"
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-actions">
            <a
              href="#"
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
              className="cta-button primary"
              onMouseEnter={(e) => {
                e.target.style.background = '#DAA520';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#C0A062';
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
          className="platform-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
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
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(192, 160, 98, 0.15)';
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
                fontSize: '24px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.8)',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
              className="position-number"
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
              className="partner-title"
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
              className="partner-tagline"
            >
              Thematic portfolio investing
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="benefits-list">
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
                  className="benefit-item"
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-actions">
            <a
              href="#"
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
              className="cta-button primary"
              onMouseEnter={(e) => {
                e.target.style.background = '#DAA520';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#C0A062';
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
          className="platform-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid rgba(192, 160, 98, 0.25)',
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
            e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(192, 160, 98, 0.15)';
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
                fontSize: '24px',
                fontWeight: 700,
                color: 'rgba(192, 160, 98, 0.8)',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
              className="position-number"
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
              className="partner-title"
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
              className="partner-tagline"
            >
              Simplified investing for everyone
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="benefits-list">
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
                  className="benefit-item"
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-actions">
            <a
              href="#"
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
              className="cta-button primary"
              onMouseEnter={(e) => {
                e.target.style.background = '#DAA520';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#C0A062';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Start Free Account
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* Affiliate Disclaimer */}
        <div style={{ textAlign: 'center', padding: '0 20px' }} className="disclaimer">
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

        {/* Enhanced Mobile Responsive Styles */}
        <style>{`
          /* Desktop: keep original layout */
          @media (min-width: 1025px) {
            .platform-card {
              /* Keep desktop styles intact */
            }
          }

          /* Tablet: 768px - 1024px */
          @media (max-width: 1024px) {
            .platform-card {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
              padding: 40px 30px !important;
              min-height: auto !important;
              text-align: center !important;
            }
            
            .card-header {
              flex-direction: column !important;
              align-items: center !important;
              gap: 12px !important;
            }
            
            .card-actions {
              justify-content: center !important;
            }
            
            .cta-button {
              width: auto !important;
              max-width: 100% !important;
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
            
            /* All platform cards */
            .platform-card {
              display: flex !important;
              flex-direction: column !important;
              padding: 24px 16px !important;
              gap: 20px !important;
              text-align: center !important;
              margin-bottom: 24px !important;
              border-radius: 10px !important;
            }
            
            /* Card headers */
            .card-header {
              flex-direction: column !important;
              align-items: center !important;
              gap: 8px !important;
              margin-bottom: 12px !important;
            }
            
            .card-header span {
              font-size: 28px !important;
            }
            
            /* Position labels */
            .position-label {
              font-size: 12px !important;
              letter-spacing: 1.5px !important;
              margin-bottom: 6px !important;
            }
            
            .position-number {
              font-size: 18px !important;
              letter-spacing: 1.5px !important;
              margin-bottom: 8px !important;
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
            
            /* Benefits list */
            .benefits-list {
              gap: 10px !important;
              text-align: left !important;
            }
            
            .benefit-item {
              align-items: flex-start !important;
              gap: 10px !important;
            }
            
            .benefit-item span {
              font-size: 14px !important;
              line-height: 1.5 !important;
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
              display: none !important;
            }
            
            /* Disclaimer */
            .disclaimer p {
              font-size: 11px !important;
              padding: 0 10px !important;
            }
          }

          /* Extra small mobile: max-width 480px */
          @media (max-width: 480px) {
            .platform-card {
              padding: 20px 12px !important;
              margin-bottom: 20px !important;
            }
            
            .card-header span {
              font-size: 24px !important;
            }
            
            .partner-title {
              font-size: 22px !important;
              letter-spacing: 1px !important;
            }
            
            .partner-tagline {
              font-size: 14px !important;
            }
            
            .benefit-item span {
              font-size: 13px !important;
            }
            
            .cta-button {
              padding: 12px 16px !important;
              font-size: 13px !important;
            }
            
            .position-label,
            .position-number {
              font-size: 11px !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};

export default RecommendedPlatforms;

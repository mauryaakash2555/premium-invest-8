import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, TrendingUp, Users, CheckCircle, Calendar, ExternalLink } from 'lucide-react';
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
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/curated-partners" />
        <meta property="og:title" content="Curated Partners | BM Wealth" />
        <meta property="og:description" content="Premium financial advisory services in Mumbai." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
      </Helmet>

      {/* Hero Section */}
      <section
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
          paddingBottom: '60px',
        }}
      >
        {/* Background Image */}
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
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.9) 100%)',
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
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            A network of trusted professionals for your complete financial wellness
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '0 20px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Premium Advisory Services Section */}
        <div style={{ marginBottom: '100px' }}>
          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(192, 160, 98, 0.15)',
                border: '1px solid rgba(192, 160, 98, 0.3)',
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                color: '#C0A062',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              💎 PREMIUM ADVISORY SERVICES
            </span>
          </div>

          {/* BM Wealth Featured Card */}
          <div
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)',
              border: '2px solid rgba(192, 160, 98, 0.25)',
              borderRadius: '12px',
              padding: '56px 48px',
            }}
          >
            {/* Logo/Monogram */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '42px',
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  color: '#C0A062',
                  letterSpacing: '6px',
                }}
              >
                BM
              </div>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: 'clamp(30px, 4vw, 36px)',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                marginBottom: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
                textAlign: 'center',
              }}
            >
              BM Wealth
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '19px',
                color: 'rgba(192, 160, 98, 0.85)',
                marginBottom: '28px',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              Personalized Financial Planning & Wealth Management
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.8,
                maxWidth: '650px',
                margin: '0 auto 40px',
                textAlign: 'center',
              }}
            >
              Mumbai's trusted advisors for comprehensive wealth management. We provide tailored solutions for portfolio optimization, tax planning, insurance strategies, and retirement planning.
            </p>

            {/* Features Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '40px',
              }}
            >
              {[
                { icon: <TrendingUp size={22} color="#C0A062" />, text: 'Portfolio Management & Asset Allocation' },
                { icon: <Shield size={22} color="#C0A062" />, text: 'Insurance & Risk Planning' },
                { icon: <CheckCircle size={22} color="#C0A062" />, text: 'Tax Optimization Strategies' },
                { icon: <Users size={22} color="#C0A062" />, text: 'Retirement & Estate Planning' },
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '16px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(192, 160, 98, 0.15)',
                  }}
                >
                  {feature.icon}
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.5,
                    }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Credentials */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px',
                padding: '16px',
                background: 'rgba(192, 160, 98, 0.08)',
                borderRadius: '8px',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#C0A062',
                  margin: '0 0 4px 0',
                  fontWeight: 600,
                }}
              >
                AMFI Registered | IRDAI Licensed
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(192, 160, 98, 0.7)',
                  margin: 0,
                }}
              >
                Licensed financial advisors in Mumbai
              </p>
            </div>

            {/* CTA Button */}
            <div style={{ textAlign: 'center' }}>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#C0A062',
                  color: '#000',
                  padding: '16px 40px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '17px',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
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
        </div>

        {/* Platform Partners Section */}
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto 100px',
            textAlign: 'center',
            padding: '48px 40px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(192, 160, 98, 0.15)',
          }}
        >
          {/* Badge */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(192, 160, 98, 0.15)',
                border: '1px solid rgba(192, 160, 98, 0.3)',
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                color: '#C0A062',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              🥇 INVESTMENT PLATFORM PARTNERS
            </span>
          </div>

          <p
            style={{
              fontSize: '17px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.7,
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px',
            }}
          >
            For self-directed investors, we recommend these trusted platforms for trading and wealth building.
          </p>

          <Link
            to="/recommended-platforms"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              color: '#C0A062',
              padding: '14px 32px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              border: '2px solid #C0A062',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(192, 160, 98, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            View Platform Comparison
            <ExternalLink size={18} />
          </Link>
        </div>

        {/* Partnership Opportunities Section */}
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            padding: '44px 40px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(192, 160, 98, 0.15)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(192, 160, 98, 0.15)',
                border: '1px solid rgba(192, 160, 98, 0.3)',
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                color: '#C0A062',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              💼 PARTNERSHIP INQUIRIES
            </span>
          </div>

          <h3
            style={{
              fontSize: 'clamp(20px, 3vw, 24px)',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
              marginBottom: '16px',
              fontWeight: 400,
              letterSpacing: '1px',
            }}
          >
            Interested in Becoming a Curated Partner?
          </h3>

          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}
          >
            We carefully select partners who meet our high standards for transparency, compliance, and client service.
          </p>

          {/* Criteria List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '32px',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 32px',
            }}
          >
            {[
              'Regulatory compliance & licensing',
              'Transparent pricing structure',
              'Strong investor protection measures',
              'Excellent user experience & support',
            ].map((criterion, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <CheckCircle size={18} color="#C0A062" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  {criterion}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Link */}
          <Link
            to="/contact?subject=partnership"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#C0A062',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#DAA520';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#C0A062';
            }}
          >
            Partnership Application
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CuratedPartners;

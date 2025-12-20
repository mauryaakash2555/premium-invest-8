import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Handshake, Star, CheckCircle, Users, Shield, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CuratedPartners = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Helmet>
        <title>Curated Partners | BM Wealth Mumbai</title>
        <meta name="description" content="Discover BM Wealth's curated network of financial partners. Trusted professionals for insurance, loans, legal services and more." />
        <meta name="keywords" content="financial partners, insurance partners, loan partners, legal services, Mumbai financial network" />
        <link rel="canonical" href="https://www.bmwealth.co.in/curated-partners" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/curated-partners" />
        <meta property="og:title" content="Curated Partners | BM Wealth" />
        <meta property="og:description" content="Trusted financial partners curated by BM Wealth for comprehensive financial solutions." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/curated-partners" />
        <meta name="twitter:title" content="Curated Partners | BM Wealth" />
        <meta name="twitter:description" content="Trusted financial partners curated by BM Wealth." />
        <meta name="twitter:image" content="https://www.bmwealth.co.in/logo.webp" />
      </Helmet>

      {/* Hero Section */}
      <section
        className="page-hero-responsive"
        style={{
          minHeight: '65vh',
          maxHeight: '65vh',
          height: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            filter: 'brightness(1.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
            }}
          >
            Curated Partners
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#C0A062',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            A network of trusted professionals for your complete financial wellness
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '80px 20px', backgroundColor: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Premium Advisory Services Section */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(192, 160, 98, 0.15)',
                border: '1px solid rgba(192, 160, 98, 0.3)',
                borderRadius: '20px',
                padding: '6px 16px',
                marginBottom: '32px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  color: '#C0A062',
                  fontWeight: 600,
                  letterSpacing: '1px',
                }}
              >
                💎 PREMIUM ADVISORY SERVICES
              </span>
            </div>
          </div>

          {/* BM Wealth Featured Card */}
          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto 100px',
              background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.08) 0%, rgba(0, 0, 0, 0.6) 100%)',
              border: '2px solid rgba(192, 160, 98, 0.3)',
              borderRadius: '16px',
              padding: '56px 48px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(192, 160, 98, 0.15)',
            }}
          >
            {/* Logo/Monogram */}
            <div
              style={{
                display: 'inline-block',
                fontSize: '48px',
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                color: '#C0A062',
                marginBottom: '16px',
                letterSpacing: '4px',
              }}
            >
              BM
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 36px)',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                marginBottom: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
              }}
            >
              BM Wealth
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '20px',
                color: 'rgba(192, 160, 98, 0.85)',
                marginBottom: '24px',
                fontWeight: 500,
              }}
            >
              Personalized Financial Planning & Wealth Management
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.8,
                maxWidth: '700px',
                margin: '0 auto 40px',
              }}
            >
              Mumbai's trusted advisors for comprehensive wealth management. We provide tailored solutions for portfolio optimization, tax planning, insurance strategies, and retirement planning.
            </p>

            {/* Features Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '40px',
              }}
            >
              {[
                {
                  icon: <TrendingUp size={24} color="#C0A062" />,
                  text: 'Portfolio Management & Asset Allocation',
                },
                {
                  icon: <Shield size={24} color="#C0A062" />,
                  text: 'Insurance & Risk Planning',
                },
                {
                  icon: <CheckCircle size={24} color="#C0A062" />,
                  text: 'Tax Optimization Strategies',
                },
                {
                  icon: <Users size={24} color="#C0A062" />,
                  text: 'Retirement & Estate Planning',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '16px 20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(192, 160, 98, 0.2)',
                  }}
                >
                  {feature.icon}
                  <span
                    style={{
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'left',
                      lineHeight: 1.4,
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
                marginBottom: '32px',
                padding: '16px',
                background: 'rgba(192, 160, 98, 0.1)',
                borderRadius: '8px',
                display: 'inline-block',
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
                  color: 'rgba(192, 160, 98, 0.8)',
                  margin: 0,
                }}
              >
                Licensed financial advisors in Mumbai
              </p>
            </div>

            {/* CTA Button */}
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#C0A062',
                color: '#000',
                padding: '16px 40px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#DAA520';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 24px rgba(192, 160, 98, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#C0A062';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Calendar size={20} />
              Schedule Free Consultation
            </Link>
          </div>

          {/* Platform Partners Section */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '100px',
              padding: '60px 40px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(192, 160, 98, 0.1)',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(192, 160, 98, 0.15)',
                border: '1px solid rgba(192, 160, 98, 0.3)',
                borderRadius: '20px',
                padding: '6px 16px',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
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
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.8,
                maxWidth: '700px',
                margin: '0 auto 32px',
              }}
            >
              For self-directed investors, we recommend these trusted platforms for trading and wealth building:
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
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                border: '2px solid #C0A062',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(192, 160, 98, 0.1)';
                e.target.style.borderColor = '#DAA520';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#C0A062';
              }}
            >
              View Platform Comparison
              <ExternalLink size={18} />
            </Link>
          </div>

          {/* Partnership Opportunities Section */}
          <div
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              padding: '48px 40px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(192, 160, 98, 0.15)',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(192, 160, 98, 0.15)',
                border: '1px solid rgba(192, 160, 98, 0.3)',
                borderRadius: '20px',
                padding: '6px 16px',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
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
                fontSize: 'clamp(22px, 3vw, 24px)',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                marginBottom: '16px',
                fontWeight: 400,
              }}
            >
              Interested in Becoming a Curated Partner?
            </h3>

            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.8,
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
                      color: 'rgba(255, 255, 255, 0.85)',
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
                e.target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#C0A062';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              Partnership Application
              <span>→</span>
            </Link>
          </div>

          {/* Trust Indicators Section */}
          <div
            style={{
              marginTop: '100px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(24px, 3vw, 28px)',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                marginBottom: '48px',
                fontWeight: 400,
                letterSpacing: '2px',
              }}
            >
              Why Partner With Us?
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '32px',
              }}
            >
              {[
                {
                  icon: <Handshake size={40} color="#C0A062" />,
                  title: 'Trusted Network',
                  description: 'Partners with proven track records and stellar reputations',
                },
                {
                  icon: <Star size={40} color="#C0A062" />,
                  title: 'Premium Service',
                  description: 'Only partners who match our standards of excellence',
                },
                {
                  icon: <CheckCircle size={40} color="#C0A062" />,
                  title: 'Fully Vetted',
                  description: 'Thoroughly screened for credentials and reliability',
                },
                {
                  icon: <Users size={40} color="#C0A062" />,
                  title: 'Client Focused',
                  description: 'Partners committed to putting your interests first',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '32px 24px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(192, 160, 98, 0.1)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(192, 160, 98, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.1)';
                  }}
                >
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <h4
                    style={{
                      color: '#C0A062',
                      fontSize: '18px',
                      marginBottom: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CuratedPartners;

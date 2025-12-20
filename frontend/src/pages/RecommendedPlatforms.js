import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Shield, TrendingUp, Award, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendedPlatforms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const platforms = [
    {
      name: 'Zerodha',
      badge: '🥈 #2',
      tagline: "India's largest discount broker",
      features: [
        '₹0 equity delivery brokerage',
        '₹20 per order for intraday trading',
        'Advanced Kite trading platform',
        'Trusted by 1 Crore+ active traders',
      ],
      ctaText: 'Open Free Demat Account',
      ctaLink: '#',
    },
    {
      name: 'Smallcase',
      badge: '🥉 #3',
      tagline: 'Thematic portfolio investing',
      features: [
        'Professional investment strategies',
        'Transparent portfolio tracking',
        'Automated rebalancing tools',
        'Trusted by 20 Lakh+ investors',
      ],
      ctaText: 'Explore Smallcases',
      ctaLink: '#',
    },
    {
      name: 'Groww',
      badge: '4️⃣ #4',
      tagline: 'Simplified investing for everyone',
      features: [
        '₹0 account maintenance charges',
        'Easy mutual fund SIP setup',
        'Intuitive mobile-first interface',
        '2 Crore+ registered users',
      ],
      ctaText: 'Start Free Account',
      ctaLink: '#',
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Recommended Investment Platforms | BM Wealth Mumbai</title>
        <meta name="description" content="Explore BM Wealth's recommended investment platforms for mutual funds, trading, and wealth management. Trusted partners for your financial journey." />
        <meta name="keywords" content="investment platforms, mutual fund platforms, trading platforms, wealth management, Mumbai investment" />
        <link rel="canonical" href="https://www.bmwealth.co.in/recommended-platforms" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/recommended-platforms" />
        <meta property="og:title" content="Recommended Investment Platforms | BM Wealth" />
        <meta property="og:description" content="Trusted investment platforms recommended by BM Wealth for your financial success." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/recommended-platforms" />
        <meta name="twitter:title" content="Recommended Investment Platforms | BM Wealth" />
        <meta name="twitter:description" content="Trusted investment platforms recommended by BM Wealth." />
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
              'url(https://images.unsplash.com/photo-1560472355-536de3962603?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
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
            Recommended Platforms
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#C0A062',
              maxWidth: '800px',
              margin: '0 auto 20px',
              lineHeight: 1.6,
            }}
          >
            Trusted investment platforms vetted by our experts
          </p>
          
          {/* Premium Partnership Banner */}
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(192, 160, 98, 0.15)',
              border: '1px solid rgba(192, 160, 98, 0.3)',
              borderRadius: '24px',
              padding: '8px 20px',
              marginTop: '12px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#C0A062',
                margin: 0,
                fontWeight: 500,
              }}
            >
              💎 #1 position available for exclusive partnership
            </p>
          </div>
        </div>
      </section>

      {/* Platform Cards Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Platform Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px',
              marginBottom: '80px',
            }}
          >
            {platforms.map((platform, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(192, 160, 98, 0.15)',
                  padding: '40px 32px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(192, 160, 98, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(192, 160, 98, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#C0A062',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '16px',
                  }}
                >
                  {platform.badge}
                </div>

                {/* Logo/Name */}
                <div style={{ marginTop: '16px' }}>
                  <h3
                    style={{
                      fontSize: '32px',
                      fontFamily: '"Playfair Display", serif',
                      color: '#C0A062',
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}
                  >
                    {platform.name}
                  </h3>
                </div>

                {/* Tagline */}
                <p
                  style={{
                    fontSize: '18px',
                    color: '#C0A062',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {platform.tagline}
                </p>

                {/* Decorative Divider */}
                <div
                  style={{
                    width: '60px',
                    height: '1px',
                    background: '#C0A062',
                    margin: '0 auto',
                  }}
                />

                {/* Features */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    textAlign: 'left',
                    flex: 1,
                  }}
                >
                  {platform.features.map((feature, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <CheckCircle
                        size={18}
                        style={{ color: '#C0A062', flexShrink: 0, marginTop: '2px' }}
                      />
                      <span
                        style={{
                          fontSize: '15px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          lineHeight: 1.6,
                        }}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <a
                  href={platform.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#C0A062',
                    color: '#000',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
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
                  {platform.ctaText}
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>

          {/* Need Guidance Section */}
          <div
            style={{
              maxWidth: '800px',
              margin: '80px auto 0',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(192, 160, 98, 0.2)',
              borderRadius: '16px',
              padding: '48px 40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <Calendar size={48} color="#C0A062" />
            </div>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 28px)',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
                marginBottom: '16px',
                fontWeight: 400,
                letterSpacing: '1px',
              }}
            >
              Need Personalized Investment Guidance?
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.8,
                marginBottom: '32px',
                maxWidth: '600px',
                margin: '0 auto 32px',
              }}
            >
              Our advisors can help with portfolio selection, tax planning, and comprehensive wealth management tailored to your goals.
            </p>
            <Link
              to="/contact"
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
                e.target.style.background = '#C0A062';
                e.target.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#C0A062';
              }}
            >
              Book Free Consultation
            </Link>
          </div>

          {/* Disclaimer */}
          <div
            style={{
              maxWidth: '900px',
              margin: '80px auto 0',
              paddingBottom: '60px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              <strong style={{ color: 'rgba(192, 160, 98, 0.7)' }}>Affiliate Disclosure:</strong> We may earn commission when you sign up through our links at no extra cost to you. This helps us provide free educational content.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecommendedPlatforms;

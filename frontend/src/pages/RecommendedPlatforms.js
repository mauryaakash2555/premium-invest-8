import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendedPlatforms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const platforms = [
    {
      name: 'Zerodha',
      rank: '🥈 #2',
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
      rank: '🥉 #3',
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
      rank: '4️⃣ #4',
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
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <Helmet>
        <title>Recommended Investment Platforms | BM Wealth Mumbai</title>
        <meta name="description" content="Discover top investment platforms recommended by BM Wealth. Compare Zerodha, Smallcase, and Groww for your trading and investment needs." />
        <meta name="keywords" content="investment platforms, trading platforms, Zerodha, Smallcase, Groww, Mumbai investment" />
        <link rel="canonical" href="https://www.bmwealth.co.in/recommended-platforms" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/recommended-platforms" />
        <meta property="og:title" content="Recommended Investment Platforms | BM Wealth" />
        <meta property="og:description" content="Compare top investment platforms recommended by BM Wealth." />
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80)',
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
            Recommended Investment Platforms
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
            Trusted investment platforms vetted by our experts
          </p>
        </div>
      </section>

      {/* Platform Cards Section */}
      <section style={{ padding: '60px 20px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 36px)',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
              marginBottom: '16px',
              fontWeight: 400,
              letterSpacing: '2px',
            }}
          >
            Our Recommended Platforms
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Carefully selected platforms for your investment journey
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            marginBottom: '80px',
          }}
        >
          {platforms.map((platform, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(192, 160, 98, 0.2)',
                padding: '40px 32px 32px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.4)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(192, 160, 98, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Rank Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(192, 160, 98, 0.9)',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '20px',
                }}
              >
                {platform.rank}
              </div>

              {/* Platform Name */}
              <h3
                style={{
                  fontSize: '28px',
                  fontFamily: '"Playfair Display", serif',
                  color: '#C0A062',
                  fontWeight: 600,
                  marginBottom: '8px',
                  marginTop: '12px',
                }}
              >
                {platform.name}
              </h3>

              {/* Tagline */}
              <p
                style={{
                  fontSize: '16px',
                  color: 'rgba(192, 160, 98, 0.85)',
                  marginBottom: '28px',
                  fontWeight: 500,
                }}
              >
                {platform.tagline}
              </p>

              {/* Divider */}
              <div
                style={{
                  width: '50px',
                  height: '1px',
                  background: 'rgba(192, 160, 98, 0.4)',
                  marginBottom: '28px',
                }}
              />

              {/* Features List */}
              <div style={{ flex: 1, marginBottom: '28px' }}>
                {platform.features.map((feature, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '14px',
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
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#DAA520';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#C0A062';
                }}
              >
                {platform.ctaText}
                <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Consultation CTA Section */}
        <div
          style={{
            maxWidth: '750px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(192, 160, 98, 0.2)',
            borderRadius: '12px',
            padding: '48px 40px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <Calendar size={40} color="#C0A062" style={{ margin: '0 auto' }} />
          </div>
          
          <h3
            style={{
              fontSize: 'clamp(22px, 3vw, 26px)',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
              marginBottom: '16px',
              fontWeight: 400,
              letterSpacing: '1px',
            }}
          >
            Need Personalized Investment Guidance?
          </h3>
          
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.7,
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
            Book Free Consultation
          </Link>
        </div>

        {/* Affiliate Disclaimer */}
        <div
          style={{
            maxWidth: '850px',
            margin: '60px auto 0',
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.4)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'rgba(192, 160, 98, 0.6)' }}>Affiliate Disclosure:</strong> We may earn commission when you sign up through our links at no extra cost to you. This helps us provide free educational content.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RecommendedPlatforms;

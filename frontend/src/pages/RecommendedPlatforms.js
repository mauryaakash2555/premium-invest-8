import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Shield, TrendingUp, Award } from 'lucide-react';

const RecommendedPlatforms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
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
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Trusted investment platforms vetted by our experts
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                marginBottom: '20px',
                fontWeight: 300,
                letterSpacing: '2px',
                fontFamily: '"Playfair Display", serif',
                color: '#C0A062',
              }}
            >
              Coming Soon
            </h2>
            <p style={{ color: '#aaa', fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8 }}>
              We're carefully curating a list of the best investment platforms for our clients. 
              This section will feature trusted partners for mutual funds, trading, and wealth management.
            </p>
          </div>

          {/* Feature Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
              marginTop: '60px',
            }}
          >
            {[
              {
                icon: <Shield size={40} color="#C0A062" />,
                title: 'Verified & Secure',
                description: 'Only SEBI-regulated platforms that meet our stringent security standards',
              },
              {
                icon: <TrendingUp size={40} color="#C0A062" />,
                title: 'Performance Tested',
                description: 'Platforms proven to deliver excellent user experience and returns',
              },
              {
                icon: <Award size={40} color="#C0A062" />,
                title: 'Expert Approved',
                description: 'Personally vetted by our financial advisory team',
              },
              {
                icon: <ExternalLink size={40} color="#C0A062" />,
                title: 'Easy Access',
                description: 'Seamless integration with your investment portfolio',
              },
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '40px 30px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(192, 160, 98, 0.1)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(192, 160, 98, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.1)';
                }}
              >
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  {feature.icon}
                </div>
                <h3
                  style={{
                    color: '#C0A062',
                    fontSize: '20px',
                    marginBottom: '12px',
                    fontWeight: 600,
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecommendedPlatforms;


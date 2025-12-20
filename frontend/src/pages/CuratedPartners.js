import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Handshake, Star, CheckCircle, Users } from 'lucide-react';

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
              'url(https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
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
              We're building a comprehensive network of trusted financial partners. 
              This section will feature vetted professionals for insurance, loans, legal services, 
              tax planning, and more to support your complete financial journey.
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

export default CuratedPartners;


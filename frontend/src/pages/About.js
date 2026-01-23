import { Users, Award, Target, Heart } from 'lucide-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Helmet>
        <title>About BM Wealth - Led by Brahmdeo Maurya | Mumbai Investment Advisory ARN 90008</title>
        <meta name="description" content="Learn about BM Wealth and founder Brahmdeo Maurya. IRDAI Licensed and AMFI Registered ARN 90008 providing expert financial planning and wealth management in Mumbai." />
        <meta name="keywords" content="Brahmdeo Maurya, BM Wealth about, investment advisor Mumbai, ARN 90008, IRDAI licensed, AMFI registered, financial planner Mumbai" />
        <link rel="canonical" href="https://www.bmwealth.co.in/about" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/about" />
        <meta property="og:title" content="About BM Wealth - Led by Brahmdeo Maurya" />
        <meta property="og:description" content="IRDAI Licensed and AMFI Registered ARN 90008 providing expert financial planning in Mumbai." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/about" />
        <meta name="twitter:title" content="About BM Wealth - Led by Brahmdeo Maurya" />
        <meta name="twitter:description" content="IRDAI Licensed and AMFI Registered ARN 90008 providing expert financial planning in Mumbai." />
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
              'url(https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
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
            data-testid="about-heading"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
            }}
          >
            About Us
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--lux-accent)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Empowering Mumbai investors with exceptional financial solutions since inception
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '24px',
                color: 'var(--lux-accent)',
              }}
            >
              Our Story
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              Under the distinguished leadership of <strong style={{ color: 'var(--lux-accent)' }}>Brahmdeo Maurya</strong>, BM Wealth 
              orchestrates comprehensive wealth strategies for discerning Mumbai investors.
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              With decades of combined expertise in financial markets, mutual funds, portfolio
              management, and investment advisory, we have established a distinguished reputation for delivering
              personalized wealth management strategies that align with our clients' unique
              financial goals.
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
              }}
            >
              Our mission is to make sophisticated financial planning accessible to every
              investor, whether you're commencing your investment journey or looking to
              enhance your existing portfolio.
            </p>
          </div>

          <div
            className="glass-effect"
            style={{
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--lux-accent) 0%, var(--lux-accent) 100%)',
                margin: '0 auto 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                color: '#000000',
                fontWeight: 700,
              }}
            >
              BM
            </div>
            <h3 style={{ fontSize: '24px', color: 'var(--lux-accent)', marginBottom: '12px' }}>
              Brahmdeo Maurya
            </h3>
            <p style={{ fontSize: '16px', color: 'var(--lux-accent)', marginBottom: '8px' }}>
              Founder
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '16px',
              }}
              className="golden-gradient"
            >
              Our Values
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--lux-accent)' }}>
              The principles that guide everything we do
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '40px',
            }}
          >
            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'var(--lux-accent)',
                }}
              >
                <Users size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: 'var(--lux-accent)', marginBottom: '12px' }}>
                Client-Centric
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Your financial goals are our top priority. We establish enduring relationships based
                on confidence and transparency.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'var(--lux-accent)',
                }}
              >
                <Award size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: 'var(--lux-accent)', marginBottom: '12px' }}>
                Exceptional Standards
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                We maintain the premier standards in financial advisory, continuously enhancing
                our expertise and methodologies.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'var(--lux-accent)',
                }}
              >
                <Target size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: 'var(--lux-accent)', marginBottom: '12px' }}>
                Results-Driven
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                We focus on delivering measurable outcomes and empowering you to achieve your wealth
                creation objectives.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'var(--lux-accent)',
                }}
              >
                <Heart size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: 'var(--lux-accent)', marginBottom: '12px' }}>
                Integrity
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Honesty and ethical conduct are at the core of every recommendation and
                interaction with our clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Info */}
      <section className="section-container">
        <div
          className="glass-effect"
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            background: 'color-mix(in oklab, var(--lux-accent) 5%, transparent)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 40px)',
              marginBottom: '20px',
              color: 'var(--lux-accent)',
            }}
          >
            IRDAI Licensed | AMFI Registered Financial Advisory
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#CCCCCC',
              marginBottom: '20px',
              maxWidth: '700px',
              margin: '0 auto 20px',
              lineHeight: 1.6,
            }}
          >
            Fully compliant with IRDAI (Insurance) and AMFI (Mutual Funds) regulations, 
            ensuring the highest standards of financial advisory and investor protection.
          </p>
          <div className="sebi-disclaimer" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <strong>Regulatory Compliance:</strong> All our services are provided in strict
            accordance with IRDAI and AMFI guidelines. We are committed to transparency, ethical
            practices, and protecting investor interests. Investments are subject to market
            risks.
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
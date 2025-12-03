import { Users, Award, Target, Heart } from 'lucide-react';
import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          position: 'relative',
          paddingTop: '100px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1,
          }}
        />
        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            data-testid="about-heading"
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              marginBottom: '24px',
            }}
            className="golden-gradient"
          >
            About BM Wealth
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#ffd700',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Empowering Mumbai investors with tailored financial solutions since inception
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
                color: '#ffd700',
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
              Led by <strong style={{ color: '#ffd700' }}>Brahmdeo Maurya</strong>, BM Wealth (ARN
              90008) is dedicated to empowering Mumbai investors with comprehensive financial
              solutions.
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
              management, and investment advisory, we have built a reputation for delivering
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
              investor, whether you're just starting your investment journey or looking to
              optimize your existing portfolio.
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
                background: 'linear-gradient(135deg, #ffd700 0%, #ffd700 100%)',
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
            <h3 style={{ fontSize: '24px', color: '#ffd700', marginBottom: '12px' }}>
              Brahmdeo Maurya
            </h3>
            <p style={{ fontSize: '16px', color: '#ffd700', marginBottom: '8px' }}>
              Founders 
            </p>
            <p style={{ fontSize: '14px', color: '#888' }}>ARN 90008</p>
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
            <p style={{ fontSize: '18px', color: '#ffd700' }}>
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
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffd700',
                }}
              >
                <Users size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#ffd700', marginBottom: '12px' }}>
                Client-Centric
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Your financial goals are our top priority. We build lasting relationships based
                on trust and transparency.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffd700',
                }}
              >
                <Award size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#ffd700', marginBottom: '12px' }}>
                Excellence
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                We maintain the highest standards in financial advisory, continuously updating
                our expertise and methodologies.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffd700',
                }}
              >
                <Target size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#ffd700', marginBottom: '12px' }}>
                Results-Driven
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                We focus on delivering measurable outcomes and helping you achieve your wealth
                creation objectives.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffd700',
                }}
              >
                <Heart size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#ffd700', marginBottom: '12px' }}>
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
            background: 'rgba(218, 165, 32, 0.05)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 40px)',
              marginBottom: '20px',
              color: '#ffd700',
            }}
          >
            SEBI Registered Financial Advisors
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
            ARN 90008 - Fully compliant with SEBI regulations, ensuring the highest standards
            of financial advisory and investor protection.
          </p>
          <div className="sebi-disclaimer" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <strong>Regulatory Compliance:</strong> All our services are provided in strict
            accordance with SEBI guidelines. We are committed to transparency, ethical
            practices, and protecting investor interests. Investments are subject to market
            risks.
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

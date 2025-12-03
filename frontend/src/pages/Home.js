import { Link } from 'react-router-dom';
import { TrendingUp, Shield, PieChart } from 'lucide-react';
import { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      title: 'Mutual Funds',
      description: 'Best SIP plans & fund selection for Mumbai investors',
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=srgb&fm=jpg&q=60',
    },
    {
      title: 'Portfolio Management',
      description: 'Personalized PMS strategies for optimal returns',
      image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?crop=entropy&cs=srgb&fm=jpg&q=60',
    },
    {
      title: 'Trading',
      description: 'Real-time market insights and advanced tools',
      image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?crop=entropy&cs=srgb&fm=jpg&q=60',
    },
    {
      title: 'Insurance',
      description: 'Life & health protection plans tailored for you',
      image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?q=60',
    },
    {
      title: 'Fixed Deposits',
      description: 'Secure returns with flexible tenure and rates',
      image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?q=60',
    },
    {
      title: 'LIC',
      description: 'Trusted LIC policies for savings and insurance',
      image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?q=60',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-gradient"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
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
            backgroundImage:
              'url(https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?crop=entropy&cs=srgb&fm=jpg&q=60)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 0,
          }}
        />

        <div
          className="section-container fade-in"
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h1
            data-testid="hero-heading"
            style={{
              fontSize: 'clamp(32px, 5vw, 72px)',
              marginBottom: '24px',
              lineHeight: 1.2,
              color: '#ffd700',
              textShadow: '2px 2px 10px #000',
            }}
          >
            BM Wealth
          </h1>
          <h2
            style={{
              fontSize: 'clamp(20px, 3vw, 36px)',
              color: '#ffd700',
              marginBottom: '16px',
              fontWeight: 500,
            }}
          >
            Mumbai's Premier Financial Partner
          </h2>
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: '#ffd700',
              marginBottom: '40px',
              maxWidth: '800px',
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            Mutual Funds • LIC • PMS • Insurance • Trading • Wealth Management • FD
          </p>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '60px',
            }}
          >
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="free-financial-guide-btn"
            >
              Get Free SIP Guide
            </a>
            <Link to="/services" className="btn-secondary" data-testid="explore-services-btn">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              marginBottom: '16px',
              color: '#ffd700',
            }}
          >
            Our Services
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#fff',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Comprehensive financial solutions designed to help you achieve your
            investment goals
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
          }}
        >
          {services.map((service, index) => (
            <div key={index} className="service-card slide-up" data-testid={`service-card-${index}`}>
              <div
                className="image-overlay"
                style={{
                  width: '100%',
                  height: '200px',
                  marginBottom: '20px',
                  background: `url(${service.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <h3
                style={{
                  fontSize: '24px',
                  color: '#ffd700',
                  marginBottom: '12px',
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  color: '#CCCCCC',
                  lineHeight: 1.6,
                }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link to="/services" className="btn-primary" data-testid="view-all-services-btn">
            View All Services
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
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
                color: '#ffd700',
              }}
            >
              Why Choose BM Wealth?
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffd700',
                }}
              >
                <Shield size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#ffd700', marginBottom: '12px' }}>
                AMFI Registered
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                ARN 90008 - Fully compliant and registered financial advisory
                services
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffd700',
                }}
              >
                <TrendingUp size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#ffd700', marginBottom: '12px' }}>
                Expert Guidance
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Decades of experience in financial markets and wealth management
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffd700',
                }}
              >
                <PieChart size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#ffd700', marginBottom: '12px' }}>
                Personalized Plans
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Personalized investment strategies aligned with your financial goals
              </p>
            </div>
          </div>
          
          {/* Led by text */}
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <p style={{ fontSize: '1.3em', color: '#ffd700', fontWeight: 500 }}>
              Led by Brahmdeo Maurya
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            Ready to Build Your Wealth?
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#CCCCCC',
              marginBottom: '30px',
              maxWidth: '600px',
              margin: '0 auto 30px',
            }}
          >
            Free consultation • Zero charges
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="cta-whatsapp-btn"
            >
              Chat on WhatsApp
            </a>
            <Link to="/contact" className="btn-secondary" data-testid="cta-contact-btn">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
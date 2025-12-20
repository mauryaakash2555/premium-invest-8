import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, PieChart, CreditCard, DollarSign, Repeat, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import LazyImage from '@/components/LazyImage';
import { staticBlogPost } from '../data/staticBlogData';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      icon: <PieChart size={40} />,
      title: 'Mutual Funds',
      description: 'Diversified investment options with expert fund selection and performance insights.',
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/mutual-funds',
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Portfolio Management',
      description: 'Personalized wealth management strategies tailored to your financial goals.',
      image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/portfolio-management',
    },
    {
      icon: <CreditCard size={40} />,
      title: 'Trading Services',
      description: 'Real-time market access with advanced tools and expert guidance.',
      image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/trading-services',
    },
    {
      icon: <Shield size={40} />,
      title: 'Insurance',
      description: 'Comprehensive life and health insurance plans for financial security.',
      image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
      link: '/insurance',
    },
    {
      icon: <DollarSign size={40} />,
      title: 'Fixed Deposits',
      description: 'Secure returns with flexible tenure options and competitive rates.',
      image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?w=600&h=400&fit=crop&auto=compress&fm=webp&q=75',
      link: '/fixed-deposits',
    },
    {
      icon: <Repeat size={40} />,
      title: 'SIP',
      description: 'Systematic Investment Plans for disciplined and goal-oriented investing.',
      image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=600&h=400&fit=crop&auto=compress&fm=webp&q=75',
      link: '/sip',
    },
  ];

  return (
    <div>
      <Helmet>
        <title>BM Wealth - Mumbai's Distinguished Financial Advisory | Mutual Funds, SIP, PMS | ARN 90008</title>
        <meta name="description" content="Exceptional wealth management solutions in Mumbai. Mutual Funds, SIP, PMS, Insurance & Trading Services. AMFI Registered ARN 90008. Led by Brahmdeo Maurya. Initiate your wealth journey today." />
        <meta name="keywords" content="BM Wealth, Mumbai investment advisor, mutual funds Mumbai, SIP investment, portfolio management, ARN 90008, Brahmdeo Maurya, financial planning Mumbai" />
        <link rel="canonical" href="https://www.bmwealth.co.in/" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/" />
        <meta property="og:title" content="BM Wealth - Mumbai's Distinguished Financial Advisory | ARN 90008" />
        <meta property="og:description" content="Exceptional wealth management solutions in Mumbai. Mutual Funds, SIP, PMS, Insurance & Trading Services. AMFI Registered ARN 90008." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/" />
        <meta name="twitter:title" content="BM Wealth - Mumbai's Distinguished Financial Advisory" />
        <meta name="twitter:description" content="Exceptional wealth management solutions in Mumbai. Mutual Funds, SIP, PMS, Insurance & Trading Services." />
        <meta name="twitter:image" content="https://www.bmwealth.co.in/logo.png" />
      </Helmet>
      {/* Hero Section */}
      <section
        className="hero-gradient hero-section-responsive"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '85vh',
          maxHeight: '85vh',
          height: '85vh',
        }}
      >
        {/* Background Image */}
        <div
          className="hero-background-image"
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
            zIndex: 0,
          }}
        />

        {/* Premium Gradient Overlay - Desktop & Mobile */}
        <div
          className="hero-gradient-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
            zIndex: 0,
          }}
        />

        <div
          className="section-container fade-in hero-content-responsive"
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            paddingTop: '60px',
          }}
        >
          <h1
            className="hero-subtitle-responsive"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              color: '#C0A062',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Mumbai's Premier Financial Advisory
          </h1>
          <p
            className="hero-description-responsive"
            style={{
              fontSize: 'clamp(16px, 2.2vw, 22px)',
              color: '#C0A062',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px',
              lineHeight: 1.6,
              fontWeight: 300,
              letterSpacing: '1px',
              opacity: 0.88,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            Exceptional wealth management solutions tailored to your prosperity
          </p>

          <div
            className="hero-cta-buttons-responsive hide-cta-on-mobile"
            style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '30px',
            }}
          >
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="free-financial-guide-btn"
              style={{
                background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(192, 160, 98, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                e.target.style.boxShadow = '0 8px 30px rgba(192, 160, 98, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 20px rgba(192, 160, 98, 0.3)';
              }}
            >
              Access Your Complimentary Wealth Blueprint
            </a>
            <Link 
              to="/services" 
              className="btn-secondary" 
              data-testid="explore-services-btn"
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
              }}
            >
              Explore Services <ArrowRight size={20} style={{ marginLeft: '8px', display: 'inline' }} />
            </Link>
          </div>

          {/* Heritage Badge - Below CTAs */}
          <div
            style={{
              display: 'inline-block',
              padding: '8px 24px',
              background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.15) 0%, rgba(218, 165, 32, 0.1) 100%)',
              border: '1px solid rgba(192, 160, 98, 0.3)',
              borderRadius: '30px',
              backdropFilter: 'blur(10px)',
              marginBottom: '40px',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                color: '#C0A062',
                fontWeight: 500,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Established 1989 • 37 Years of Excellence
            </span>
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
            }}
            className="golden-gradient"
          >
            Our Services
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#C0A062',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Bespoke financial architectures meticulously crafted to elevate your
            wealth trajectory
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
            <Link
              key={index}
              to={service.link}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div 
                className="service-card slide-up" 
                data-testid={`service-card-${index}`}
                style={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
                  border: '1px solid rgba(192, 160, 98, 0.2)',
                  borderRadius: '12px',
                  padding: '0',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.5)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(192, 160, 98, 0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Premium Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'linear-gradient(135deg, rgba(192, 160, 98, 0.9) 0%, rgba(218, 165, 32, 0.9) 100%)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#000',
                    letterSpacing: '1px',
                    zIndex: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Premium
                </div>

                <LazyImage
                  src={service.image}
                  alt={service.title}
                  style={{
                    width: '100%',
                    height: '220px',
                    marginBottom: '0',
                    borderRadius: '12px 12px 0 0',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '28px 24px' }}>
                  <div style={{ 
                    color: '#DAA520', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{
                      background: 'rgba(218, 165, 32, 0.1)',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {service.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: '26px',
                        color: '#DAA520',
                        marginBottom: '0',
                        fontWeight: 600,
                      }}
                    >
                      {service.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: '16px',
                      color: '#CCCCCC',
                      lineHeight: 1.7,
                      marginBottom: '20px',
                    }}
                  >
                    {service.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#C0A062',
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}>
                    <span>Learn More</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Link 
            to="/services" 
            className="btn-primary" 
            data-testid="view-all-services-btn"
            style={{
              background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)',
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(192, 160, 98, 0.3)',
              display: 'inline-block',
            }}
          >
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
              }}
              className="golden-gradient"
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
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <Shield size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                AMFI Registered
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Fully compliant and registered financial advisory
                services
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <TrendingUp size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Elite Guidance
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Decades of expertise in financial markets and wealth management
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <PieChart size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Tailored Solutions
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Personalized investment strategies aligned with your financial goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          📝 LATEST BLOG SECTION - EASY TO REMOVE
          ═══════════════════════════════════════════════════════════════════════════════
          To remove this section, simply delete everything between these comment markers
          (from "Latest Insights Section" to "End Latest Blog Section")
          ═══════════════════════════════════════════════════════════════════════════════ */}
      
      {/* Latest Insights Section */}
      <section className="section-container" style={{ padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px',
            color: '#DAA520'
          }}>
            <BookOpen size={32} />
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                margin: 0,
              }}
              className="golden-gradient"
            >
              Latest Insights
            </h2>
          </div>
          <p
            style={{
              fontSize: '18px',
              color: '#C0A062',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Expert financial wisdom and real-world investment stories
          </p>
        </div>

        <div className="blog-card-premium" style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: 0,
        }}
        >
          <Link 
            to="/blog"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'block'
            }}
          >
            <div>
              {/* Blog Image - Seamless, no border */}
              <LazyImage
                src={staticBlogPost.image_url || staticBlogPost.image}
                alt={staticBlogPost.image_alt || staticBlogPost.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  borderRadius: 0,
                  display: 'block',
                  marginBottom: 0,
                }}
              />
              
              {/* Blog Content */}
              <div style={{
                padding: 'clamp(30px, 5vw, 50px)',
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#DAA520',
                  marginBottom: '20px',
                  fontWeight: 500,
                }}>
                  {staticBlogPost.category}
                </div>
                
                <h3
                  style={{
                    fontSize: 'clamp(24px, 4vw, 32px)',
                    color: '#DAA520',
                    marginBottom: '16px',
                    lineHeight: 1.3,
                  }}
                >
                  {staticBlogPost.title}
                </h3>
                
                <p
                  style={{
                    fontSize: 'clamp(16px, 2.5vw, 18px)',
                    color: '#CCCCCC',
                    lineHeight: 1.7,
                    marginBottom: '24px',
                  }}
                >
                  {staticBlogPost.excerpt}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#C0A062',
                  fontSize: '16px',
                  fontWeight: 500,
                }}>
                  <span>Read Full Article</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/blog" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All Insights
          </Link>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════════════════════════════
          END LATEST BLOG SECTION - Delete everything above this line to remove
          ═══════════════════════════════════════════════════════════════════════════════ */}

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
              color: '#DAA520',
            }}
          >
            Ready to Commence Your Wealth Journey?
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
            Connect with our experts today for a complimentary financial consultation
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="cta-whatsapp-btn"
              style={{
                background: 'linear-gradient(135deg, #C0A062 0%, #DAA520 100%)',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(192, 160, 98, 0.3)',
              }}
            >
              Chat on WhatsApp
            </a>
            <Link 
              to="/contact" 
              className="btn-secondary" 
              data-testid="cta-contact-btn"
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
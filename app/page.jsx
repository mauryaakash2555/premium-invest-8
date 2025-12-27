'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, TrendingUp, Shield, PieChart, CreditCard, DollarSign, Repeat, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import { staticBlogPost } from '@/data/staticBlogData';

export default function HomePage() {
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
      image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
      link: '/fixed-deposits',
    },
    {
      icon: <Repeat size={40} />,
      title: 'SIP',
      description: 'Systematic Investment Plans for disciplined and goal-oriented investing.',
      image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
      link: '/sip',
    },
  ];

  return (
    <div>
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
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)',
            zIndex: 0,
          }}
        />

        <div
          className="section-container fade-in hero-content-responsive"
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            paddingTop: '180px',
          }}
        >
          <h1
            className="hero-subtitle-responsive"
            style={{
              fontSize: 'clamp(20px, 2.5vw, 32px)',
              color: '#C0A062',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Mumbai&apos;s Premier Financial Advisory
          </h1>
          <p
            className="hero-description-responsive"
            style={{
              fontSize: 'clamp(13px, 1.5vw, 16px)',
              color: '#C0A062',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px',
              lineHeight: 1.5,
              fontWeight: 300,
              letterSpacing: '0.5px',
              opacity: 0.85,
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
              marginBottom: '60px',
            }}
          >
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Access Your Complimentary Wealth Blueprint
            </a>
            <Link href="/services" className="btn-secondary">
              Explore Services <ArrowRight size={20} style={{ marginLeft: '8px', display: 'inline' }} />
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
              href={service.link}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div 
                className="service-card slide-up" 
                style={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '200px', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  </div>
                <div style={{ color: '#DAA520', marginBottom: '16px' }}>
                  {service.icon}
                </div>
                <h3
                  style={{
                    fontSize: '24px',
                    color: '#DAA520',
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
                    marginBottom: '16px',
                  }}
                >
                  {service.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#C0A062',
                  fontSize: '14px',
                  fontWeight: 500,
                }}>
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link href="/services" className="btn-primary">
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
            href="/blog"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'block'
            }}
          >
            <div>
              {/* Blog Image - Seamless, no border */}
              <img
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
          <Link href="/blog" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All Insights
          </Link>
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
            >
              Chat on WhatsApp
            </a>
            <Link href="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


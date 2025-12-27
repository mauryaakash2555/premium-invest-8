'use client';

import { PieChart, TrendingUp, CreditCard, Shield, DollarSign, Repeat, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import LazyImage from '@/components/LazyImage';

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      icon: <PieChart size={50} />,
      title: 'Mutual Funds',
      description:
        'Access a wide range of mutual fund schemes tailored to your risk appetite and financial goals. Our team of specialists empowers you to select optimal funds with comprehensive performance insights and regular portfolio reviews.',
      features: [
        'Diversified fund selection',
        'Performance tracking and analysis',
        'Risk-adjusted returns',
        'Regular portfolio rebalancing',
        'Tax-efficient investing',
      ],
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
      link: '/mutual-funds',
    },
    {
      icon: <TrendingUp size={50} />,
      title: 'Portfolio Management Services (PMS)',
      description:
        'Personalized wealth management strategies designed exclusively for you. Our PMS offerings combine in-depth market research, active portfolio management, and customized investment strategies to maximize your returns.',
      features: [
        'Customized investment strategies',
        'Dedicated portfolio manager',
        'Active fund management',
        'Regular performance reviews',
        'Direct equity investments',
      ],
      image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
      link: '/portfolio-management',
    },
    {
      icon: <CreditCard size={50} />,
      title: 'Trading Services',
      description:
        'Gain access to real-time market data, advanced trading tools, and elite guidance for equity, derivatives, and commodity trading. Our platform provides seamless execution and comprehensive market analysis.',
      features: [
        'Real-time market access',
        'Advanced charting tools',
        'Research and recommendations',
        'Low brokerage rates',
        'Expert trading support',
      ],
      image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
      link: '/trading-services',
    },
    {
      icon: <Shield size={50} />,
      title: 'Insurance',
      description:
        'Comprehensive insurance solutions to protect you and your loved ones. From life insurance to health coverage, we empower you to choose optimal policies that provide financial security and peace of mind.',
      features: [
        'Life insurance policies',
        'Health insurance plans',
        'Term insurance coverage',
        'Policy comparison and analysis',
        'Claims assistance',
      ],
      image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?w=800&h=500&fit=crop&auto=compress&fm=webp&q=75',
      link: '/insurance',
    },
    {
      icon: <DollarSign size={50} />,
      title: 'Fixed Deposits (FD)',
      description:
        'Secure and guaranteed returns with our fixed deposit options. Choose from a variety of tenure periods and interest rates from premier banks and financial institutions to meet your capital preservation goals.',
      features: [
        'Competitive interest rates',
        'Flexible tenure options',
        'Guaranteed returns',
        'Bank and NBFC FDs',
        'Premature withdrawal options',
      ],
      image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?w=800&h=500&fit=crop&auto=compress&fm=webp&q=75',
      link: '/fixed-deposits',
    },
    {
      icon: <Repeat size={50} />,
      title: 'Systematic Investment Plans (SIP)',
      description:
        'Accumulate wealth systematically through disciplined monthly investments. SIPs empower you to benefit from rupee cost averaging and the power of compounding to achieve your long-term financial goals.',
      features: [
        'Disciplined investing approach',
        'Rupee cost averaging benefits',
        'Flexible investment amounts',
        'Auto-debit facility',
        'Goal-based planning',
      ],
      image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=800&h=500&fit=crop&auto=compress&fm=webp&q=75',
      link: '/sip',
    },
  ];

  return (
    <div style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <style>{`
        /* Mobile-first responsive styles */
        .service-detail-grid {
          grid-template-columns: 1fr !important;
        }
        
        @media (min-width: 768px) {
          .service-detail-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        
        /* Prevent overflow */
        .service-detail-grid * {
          box-sizing: border-box;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .service-detail-grid img {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
      
      {/* Hero Section */}
      <section
        style={{
          minHeight: '70vh',
          maxHeight: '70vh',
          height: '70vh',
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
              'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
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
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            data-testid="services-heading"
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
            Our Services
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
            Bespoke financial architectures meticulously crafted to elevate your wealth trajectory
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="section-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(40px, 8vw, 80px)' }}>
          {services.map((service, index) => (
            <div
              key={index}
              className="glass-effect service-detail-grid"
              style={{
                padding: 'clamp(20px, 5vw, 40px)',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 'clamp(24px, 5vw, 40px)',
                alignItems: 'center',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
                width: '100%',
              }}
              data-testid={`service-detail-${index}`}
            >
              {/* Image - Always first on mobile, responsive */}
              <LazyImage
                src={service.image}
                alt={service.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 'clamp(200px, 40vw, 400px)',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  display: 'block',
                  boxSizing: 'border-box',
                }}
              />
              
              {/* Content */}
              <div style={{ 
                width: '100%',
                boxSizing: 'border-box',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <div style={{ color: '#DAA520', marginBottom: '20px', fontSize: 'clamp(40px, 8vw, 50px)' }}>
                  {service.icon}
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(22px, 5vw, 36px)',
                    color: '#DAA520',
                    marginBottom: '16px',
                    lineHeight: 1.3,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {service.title}
                </h2>
                <p
                  style={{
                    fontSize: 'clamp(16px, 3.5vw, 18px)',
                    color: '#CCCCCC',
                    lineHeight: 1.8,
                    marginBottom: '24px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {service.description}
                </p>
                <h3
                  style={{
                    fontSize: 'clamp(18px, 4vw, 20px)',
                    color: '#C0A062',
                    marginBottom: '12px',
                  }}
                >
                  Key Features:
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {service.features.map((feature, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: 'clamp(14px, 3vw, 16px)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      <ArrowRight size={16} style={{ color: '#DAA520', flexShrink: 0 }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {service.link && (
                  <Link href={service.link}
                    style={{
                      display: 'inline-block',
                      marginTop: '20px',
                      padding: '12px 32px',
                      background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                      color: '#000000',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#DAA520';
                      e.currentTarget.style.color = '#DAA520';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.color = '#000000';
                    }}
                  >
                    Learn More <ArrowRight size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="section-container">
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
              Let's Establish Your Financial Future Together
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
              Schedule a consultation with our financial specialists to discuss your investment
              objectives
            </p>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                data-testid="services-whatsapp-cta"
              >
                Secure Complimentary Consultation
              </a>
              <Link href="/contact" className="btn-secondary" data-testid="services-contact-cta">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEBI Disclaimer */}
      <section className="section-container">
        <div className="sebi-disclaimer">
          <strong>SEBI Disclaimer:</strong> Investments in securities market are subject to
          market risks. Read all the related documents carefully before investing. Past
          performance is not indicative of future returns. Please consider your specific
          investment requirements, risk tolerance, investment goal, time frame, risk and reward
          balance and cost associated with the investment before choosing a fund or designing a
          portfolio that suits your needs.
        </div>
      </section>
    </div>
  );
};

export default Services;
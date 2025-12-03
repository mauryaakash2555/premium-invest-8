import { PieChart, TrendingUp, CreditCard, Shield, DollarSign, Repeat, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      icon: <PieChart size={50} />,
      title: 'Mutual Funds',
      description:
        'Access a wide range of mutual fund schemes tailored to your risk appetite and financial goals. Our expert team helps you select the right funds with comprehensive performance insights and regular portfolio reviews.',
      features: [
        'Diversified fund selection',
        'Performance tracking and analysis',
        'Risk-adjusted returns',
        'Regular portfolio rebalancing',
        'Tax-efficient investing',
      ],
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=srgb&fm=jpg&q=60',
    },
    {
      icon: <TrendingUp size={50} />,
      title: 'Portfolio Management Services (PMS)',
      description:
        'Personalized wealth management strategies designed exclusively for you. Our PMS offerings combine in-depth market research, active portfolio management, and customized investment strategies to optimize your returns.',
      features: [
        'Customized investment strategies',
        'Dedicated portfolio manager',
        'Active fund management',
        'Regular performance reviews',
        'Direct equity investments',
      ],
      image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?crop=entropy&cs=srgb&fm=jpg&q=60',
    },
    {
      icon: <CreditCard size={50} />,
      title: 'Trading Services',
      description:
        'Gain access to real-time market data, advanced trading tools, and expert guidance for equity, derivatives, and commodity trading. Our platform provides seamless execution and comprehensive market analysis.',
      features: [
        'Real-time market access',
        'Advanced charting tools',
        'Research and recommendations',
        'Low brokerage rates',
        'Expert trading support',
      ],
      image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?crop=entropy&cs=srgb&fm=jpg&q=60',
    },
    {
      icon: <Shield size={50} />,
      title: 'Insurance',
      description:
        'Comprehensive insurance solutions to protect you and your loved ones. From life insurance to health coverage, we help you choose the right policies that provide financial security and peace of mind.',
      features: [
        'Life insurance policies',
        'Health insurance plans',
        'Term insurance coverage',
        'Policy comparison and analysis',
        'Claims assistance',
      ],
      image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?auto=compress&cs=tinysrgb&q=60',
    },
    {
      icon: <DollarSign size={50} />,
      title: 'Fixed Deposits (FD)',
      description:
        'Secure and guaranteed returns with our fixed deposit options. Choose from a variety of tenure periods and interest rates from top banks and financial institutions to meet your capital preservation goals.',
      features: [
        'Competitive interest rates',
        'Flexible tenure options',
        'Guaranteed returns',
        'Bank and NBFC FDs',
        'Premature withdrawal options',
      ],
      image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&q=60',
    },
    {
      icon: <Repeat size={50} />,
      title: 'Systematic Investment Plans (SIP)',
      description:
        'Build wealth systematically through disciplined monthly investments. SIPs help you benefit from rupee cost averaging and the power of compounding to achieve your long-term financial goals.',
      features: [
        'Disciplined investing approach',
        'Rupee cost averaging benefits',
        'Flexible investment amounts',
        'Auto-debit facility',
        'Goal-based planning',
      ],
      image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?auto=compress&cs=tinysrgb&q=60',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          paddingTop: '100px',
        }}
      >
        <div className="section-container" style={{ textAlign: 'center' }}>
          <h1
            data-testid="services-heading"
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              marginBottom: '24px',
            }}
            className="golden-gradient"
          >
            Our Services
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
            Comprehensive financial solutions designed to help you build, grow, and protect
            your wealth
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="section-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {services.map((service, index) => (
            <div
              key={index}
              className="glass-effect"
              style={{
                padding: '40px',
                display: 'grid',
                gridTemplateColumns: index % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                gap: '40px',
                alignItems: 'center',
              }}
              data-testid={`service-detail-${index}`}
            >
              {index % 2 === 0 ? (
                <>
                  <div>
                    <div style={{ color: '#ffd700', marginBottom: '20px' }}>{service.icon}</div>
                    <h2
                      style={{
                        fontSize: 'clamp(24px, 3vw, 36px)',
                        color: '#ffd700',
                        marginBottom: '16px',
                      }}
                    >
                      {service.title}
                    </h2>
                    <p
                      style={{
                        fontSize: '18px',
                        color: '#CCCCCC',
                        lineHeight: 1.8,
                        marginBottom: '24px',
                      }}
                    >
                      {service.description}
                    </p>
                    <h3
                      style={{
                        fontSize: '20px',
                        color: '#ffd700',
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
                            fontSize: '16px',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <ArrowRight size={16} style={{ color: '#ffd700' }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className="image-overlay"
                    style={{
                      width: '100%',
                      height: '400px',
                      background: `url(${service.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </>
              ) : (
                <>
                  <div
                    className="image-overlay"
                    style={{
                      width: '100%',
                      height: '400px',
                      background: `url(${service.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      order: 1,
                    }}
                  />
                  <div style={{ order: 2 }}>
                    <div style={{ color: '#ffd700', marginBottom: '20px' }}>{service.icon}</div>
                    <h2
                      style={{
                        fontSize: 'clamp(24px, 3vw, 36px)',
                        color: '#ffd700',
                        marginBottom: '16px',
                      }}
                    >
                      {service.title}
                    </h2>
                    <p
                      style={{
                        fontSize: '18px',
                        color: '#CCCCCC',
                        lineHeight: 1.8,
                        marginBottom: '24px',
                      }}
                    >
                      {service.description}
                    </p>
                    <h3
                      style={{
                        fontSize: '20px',
                        color: '#ffd700',
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
                            fontSize: '16px',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <ArrowRight size={16} style={{ color: '#ffd700' }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
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
                color: '#ffd700',
              }}
            >
              Let's Build Your Financial Future Together
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
              Schedule a consultation with our financial experts to discuss your investment
              goals
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
                Get Free Consultation
              </a>
              <Link to="/contact" className="btn-secondary" data-testid="services-contact-cta">
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
import { PieChart, TrendingUp, CreditCard, Shield, DollarSign, Building, FileText, Repeat, ArrowRight, Calculator, Users } from 'lucide-react';
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
        'Diversified fund selection across equity, debt, and hybrid',
        'Performance tracking and analysis with detailed reports',
        'Risk-adjusted returns optimization',
        'Regular portfolio rebalancing for optimal performance',
        'Tax-efficient investing strategies',
      ],
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      icon: <TrendingUp size={50} />,
      title: 'Capital Markets',
      description:
        'Comprehensive equity and derivatives trading services with real-time market data, research reports, and expert guidance. Trade with confidence using our advanced platforms and professional support.',
      features: [
        'Real-time stock market access',
        'Advanced charting and technical analysis',
        'Research reports and stock recommendations',
        'Derivatives trading (Futures & Options)',
        'Low brokerage rates with transparent pricing',
      ],
      image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      icon: <DollarSign size={50} />,
      title: 'Fixed Income',
      description:
        'Secure and guaranteed returns with our fixed income solutions. Choose from a variety of fixed deposits, bonds, and debt instruments from top-rated banks and NBFCs to meet your capital preservation goals.',
      features: [
        'Competitive interest rates on fixed deposits',
        'Flexible tenure options from 7 days to 10 years',
        'Corporate and government bonds',
        'Guaranteed returns with capital protection',
        'Senior citizen special rates',
      ],
      image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg',
    },
    {
      icon: <Users size={50} />,
      title: 'Portfolio Management Services (PMS)',
      description:
        'Personalized wealth management strategies designed exclusively for you. Our PMS offerings combine in-depth market research, active portfolio management, and customized investment strategies to optimize your returns.',
      features: [
        'Customized investment strategies aligned with goals',
        'Dedicated portfolio manager for personalized service',
        'Active fund management with quarterly reviews',
        'Direct equity investments in blue-chip stocks',
        'Tax-efficient portfolio structuring',
      ],
      image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      icon: <Building size={50} />,
      title: 'Real Estate',
      description:
        'Professional real estate investment advisory services for residential and commercial properties. We help you identify lucrative opportunities, conduct due diligence, and execute property transactions with complete transparency.',
      features: [
        'Property investment consultation',
        'Market research and location analysis',
        'Legal documentation assistance',
        'REITs and real estate fund investments',
        'Property valuation services',
      ],
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      icon: <Shield size={50} />,
      title: 'Insurance Solutions',
      description:
        'Comprehensive insurance solutions to protect you and your loved ones. From life insurance to health coverage, vehicle insurance to property protection, we help you choose the right policies that provide complete financial security.',
      features: [
        'Life insurance policies (Term, Endowment, ULIP)',
        'Health insurance plans for individuals and families',
        'Vehicle insurance (Car, Two-wheeler)',
        'Property and home insurance',
        'Policy comparison, claims assistance, and support',
      ],
      image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
    },
    {
      icon: <FileText size={50} />,
      title: 'Tax Services',
      description:
        'Expert tax planning and filing assistance to help you maximize savings and ensure compliance. Our tax advisors provide strategic guidance on income tax, GST, and corporate taxation with personalized solutions.',
      features: [
        'Income tax planning and return filing',
        'Tax-saving investment recommendations',
        'GST registration and compliance',
        'Corporate tax advisory services',
        'TDS returns and advance tax calculation',
      ],
      image: 'https://images.unsplash.com/photo-1554224311-beee460c201f?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      icon: <Repeat size={50} />,
      title: 'Loan Services',
      description:
        'Easy access to various loan products with competitive interest rates and flexible repayment options. Whether you need a home loan, personal loan, or business loan, we help you secure the best deals from leading financial institutions.',
      features: [
        'Home loans with attractive interest rates',
        'Personal loans for various needs',
        'Business loans and working capital',
        'Loan balance transfer and top-up',
        'Doorstep documentation and processing',
      ],
      image: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?crop=entropy&cs=srgb&fm=jpg&q=85',
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
            Our Offerings
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
            Comprehensive Financial Solutions for All Your Investment Needs
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
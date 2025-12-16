import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      {/* SEBI Disclaimer Bar Above Footer */}
      <div style={{
        background: '#000000',
        borderTop: '1px solid rgba(218, 165, 32, 0.15)',
        padding: '30px 20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 24px',
          background: 'transparent',
          borderLeft: '3px solid #DAA520'
        }}>
          <p style={{
            fontSize: '13px',
            lineHeight: '1.7',
            color: '#DAA520',
            margin: '0',
            fontStyle: 'italic'
          }}>
            <strong style={{ fontWeight: '600' }}>SEBI Disclaimer:</strong> Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. Please consider your specific investment requirements, risk tolerance, investment goal, time frame, risk and reward balance and cost associated with the investment before choosing a fund or designing a portfolio that suits your needs.
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <footer style={{
        background: '#000000',
        padding: '0 20px 30px 20px'
      }}>
        
        {/* 4 Column Grid */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '50px',
          paddingBottom: '30px'
        }}>
          
          {/* Column 1: BM Wealth */}
          <div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              fontWeight: '700',
              color: '#DAA520',
              marginBottom: '16px',
              marginTop: '0'
            }}>
              BM Wealth
            </h3>
            
            <p style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: '#DAA520',
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              Premium Financial Advisory
            </p>
            
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#B8B8B8',
              margin: '0'
            }}>
              Empowering investors with tailored financial solutions in Mumbai.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '16px',
              marginTop: '0'
            }}>
              Quick Links
            </h3>
            
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <Link to="/" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Home
              </Link>
              
              <Link to="/about" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                About Us
              </Link>
              
              <Link to="/services" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Services
              </Link>
              
              <Link to="/blog" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Blog
              </Link>
              
              <Link to="/contact" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Contact
              </Link>
            </nav>
          </div>
          
          {/* Column 3: Legal */}
          <div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '16px',
              marginTop: '0'
            }}>
              Legal
            </h3>
            
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <Link to="/terms-and-conditions" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Terms & Conditions
              </Link>
              
              <Link to="/privacy-policy" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Privacy Policy
              </Link>
              
              <Link to="/disclaimer" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Disclaimer
              </Link>
              
              <Link to="/refund-policy" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Refund Policy
              </Link>
              
              <Link to="/compliance" style={{
                fontSize: '14px',
                color: '#E5E5E5',
                textDecoration: 'none'
              }}>
                Compliance
              </Link>
            </nav>
          </div>
          
          {/* Column 4: Contact Us */}
          <div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '16px',
              marginTop: '0'
            }}>
              Contact Us
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#E5E5E5',
                margin: '0',
                lineHeight: '1.5'
              }}>
                <strong style={{ fontWeight: '600' }}>Phone:</strong> +91 8850977259
              </p>
              
              <p style={{
                fontSize: '14px',
                color: '#E5E5E5',
                margin: '0',
                lineHeight: '1.5'
              }}>
                <strong style={{ fontWeight: '600' }}>Email:</strong> support@bmwealth.co.in
              </p>
              
              <p style={{
                fontSize: '14px',
                color: '#E5E5E5',
                margin: '0 0 10px 0',
                lineHeight: '1.5'
              }}>
                Mumbai, Maharashtra
              </p>
              
              <a 
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#25D366',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                📱 WhatsApp Us
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Investment Disclaimer Bar */}
        <div style={{
          borderTop: '1px solid rgba(218, 165, 32, 0.15)',
          paddingTop: '20px',
          marginTop: '10px'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '16px 24px',
            background: 'transparent',
            borderLeft: '3px solid #DAA520'
          }}>
            <p style={{
              fontSize: '13px',
              lineHeight: '1.7',
              color: '#DAA520',
              margin: '0',
              fontWeight: '500'
            }}>
              <strong style={{ fontWeight: '600' }}>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid rgba(218, 165, 32, 0.1)'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#666',
            margin: '0'
          }}>
            © 2025 BM Wealth. All rights reserved.
          </p>
        </div>
        
      </footer>

      {/* Mobile Responsive */}
      <style>{`
        @media (max-width: 768px) {
          footer > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 25px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Footer;
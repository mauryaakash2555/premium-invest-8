import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <>
      <style>{`
        .whatsapp-button-container {
          display: flex;
          justify-content: flex-start;
          margin-top: -8px;
        }
        
        @media (max-width: 768px) {
          .whatsapp-button-container {
            justify-content: center;
          }
        }
      `}</style>
    <footer style={{ backgroundColor: '#000000', color: '#FFFFFF', marginTop: '80px' }}>
      {/* SEBI Disclaimer */}
      <div style={{ 
        backgroundColor: 'rgba(218, 165, 32, 0.05)', 
        padding: '30px 20px',
        borderTop: '2px solid rgba(218, 165, 32, 0.2)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#CCCCCC'
        }}>
          <strong style={{ color: '#DAA520' }}>SEBI Disclaimer:</strong> Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. Please consider your specific investment requirements, risk tolerance, investment goal, time frame, risk and reward balance and cost associated with the investment before choosing a fund or designing a portfolio that suits your needs.
        </div>
      </div>

      {/* Investment Disclaimer */}
      <div style={{ 
        backgroundColor: 'rgba(192, 160, 98, 0.05)', 
        padding: '30px 20px',
        borderTop: '1px solid rgba(192, 160, 98, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#CCCCCC'
        }}>
          <strong style={{ color: '#C0A062' }}>Investment Disclaimer:</strong> BM Wealth provides investment advisory and distribution services. We are not a bank or deposit-taking institution. All investments are subject to market risks and investors should read all scheme-related documents carefully before investing. BM Wealth does not guarantee returns or capital protection. Please consult with our advisors before making any investment decisions.
        </div>
      </div>

      {/* Main Footer Content */}
      <div style={{ 
        padding: '60px 20px 40px',
        backgroundColor: '#000000'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* BM Wealth Column */}
          <div>
            <h3 style={{ 
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '20px',
              fontFamily: '"Playfair Display", serif',
              background: 'linear-gradient(135deg, #DAA520 0%, #C0A062 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              BM Wealth
            </h3>
            <p style={{ 
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#CCCCCC',
              marginBottom: '20px'
            }}>
              Your trusted partner in wealth management and financial planning. Building secure financial futures for families across Mumbai.
            </p>
            <div style={{ 
              fontSize: '13px',
              color: '#DAA520',
              fontWeight: '600',
              marginTop: '15px'
            }}>
              IRDAI Licensed | AMFI Registered
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{ 
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#DAA520'
            }}>
              Quick Links
            </h4>
            <ul style={{ 
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Home
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/about" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  About Us
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/services" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Services
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/blog" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Blog
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/contact" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 style={{ 
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#DAA520'
            }}>
              Legal
            </h4>
            <ul style={{ 
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/terms" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Terms &amp; Conditions
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/privacy" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Privacy Policy
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/disclaimer" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Disclaimer
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/refund" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Refund Policy
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/compliance" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Compliance
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/sitemap" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <h4 style={{ 
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#DAA520'
            }}>
              Contact Us
            </h4>
            <div style={{ 
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#CCCCCC'
            }}>
              <p style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#C0A062' }}>Phone:</strong><br />
                <a href="tel:+918850977259" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  +91 8850977259
                </a>
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#C0A062' }}>Email:</strong><br />
                <a href="mailto:support@bmwealth.co.in" style={{ 
                  color: '#CCCCCC',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#DAA520'} onMouseOut={(e) => e.target.style.color = '#CCCCCC'}>
                  support@bmwealth.co.in
                </a>
              </p>
              <div className="whatsapp-button-container">
                <a 
                  href="https://wa.me/918850977259"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease',
                    marginTop: '15px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#128C7E'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                >
                  <MessageCircle size={20} />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid rgba(218, 165, 32, 0.2)',
          paddingTop: '30px',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '14px',
            color: '#CCCCCC',
            margin: 0
          }}>
            © 2025 BM Wealth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;

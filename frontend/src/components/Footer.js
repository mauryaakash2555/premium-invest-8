import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0a0a0a',
      color: '#fff',
      padding: '0',
      fontFamily: '"Inter", sans-serif',
      width: '100%',
      marginTop: 'auto'
    }}>
      {/* SEBI Disclaimer */}
      <div style={{
        backgroundColor: '#0a0a0a',
        padding: '16px 0',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <p style={{
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#999',
            margin: 0,
            textAlign: 'center'
          }}>
            <strong style={{ color: '#B8860B' }}>SEBI Disclaimer:</strong> Investments in securities market are subject to market risks. Read all related documents carefully before investing.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main-grid" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px'
      }}>
        {/* BM Wealth Section - NO GAPS */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '20px',
            marginBottom: '8px',
            fontWeight: '600',
            fontFamily: '"Playfair Display", serif'
          }}>
            BM Wealth
          </h3>
          <p style={{
            color: '#B8860B',
            fontSize: '14px',
            lineHeight: '1.4',
            marginBottom: '16px',
            fontWeight: '600',
            margin: '0 0 16px 0'
          }}>
            Premium Financial Advisory
          </p>
          <p style={{
            color: '#888',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Empowering investors with tailored financial solutions in Mumbai.
          </p>
        </div>

        {/* Quick Links - NO GAPS */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '16px',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Quick Links
          </h3>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {[
              { text: 'Home', path: '/' },
              { text: 'About Us', path: '/about-us' },
              { text: 'Services', path: '/services' },
              { text: 'Blog', path: '/blog' },
              { text: 'Contact', path: '/contact' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  color: '#aaa',
                  textDecoration: 'none',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                {item.text}
              </Link>
            ))}
          </nav>
        </div>

        {/* Legal - NO GAPS */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '16px',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Legal
          </h3>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {[
              { text: 'Terms & Conditions', path: '/terms' },
              { text: 'Privacy Policy', path: '/privacy' },
              { text: 'Disclaimer', path: '/disclaimer' },
              { text: 'Refund Policy', path: '/refund' },
              { text: 'Compliance', path: '/compliance' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  color: '#aaa',
                  textDecoration: 'none',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                {item.text}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact Us - FIXED ADDRESS */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '16px',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Contact Us
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <p style={{
              color: '#aaa',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Phone: +91 8850977259
            </p>
            <p style={{
              color: '#aaa',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Email: support@bmwealth.co.in
            </p>
            <p style={{
              color: '#aaa',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Mumbai, Maharashtra
            </p>
            
            {/* WhatsApp - NO GREEN BACKGROUND */}
            <a 
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#25D366',
                textDecoration: 'none',
                fontWeight: '500',
                marginTop: '8px',
                fontSize: '14px'
              }}
            >
              <MessageCircle size={16} color="#25D366" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Investment Disclaimer */}
      <div style={{
        backgroundColor: '#0a0a0a',
        padding: '16px 0',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <p style={{
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#999',
            margin: 0,
            textAlign: 'center'
          }}>
            <strong style={{ color: '#B8860B' }}>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        backgroundColor: '#0a0a0a',
        padding: '20px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '8px', margin: '0 0 8px 0' }}>
            © 2025 BM Wealth. All rights reserved.
          </p>
          <p style={{ color: '#B8860B', fontSize: '13px', margin: 0 }}>
            IRDAI Licensed | AMFI Registered
          </p>
        </div>
      </div>
      
      {/* Mobile-specific footer styles */}
      <style>{`
        /* Desktop Footer (> 768px) - Keep as is */
        @media (min-width: 769px) {
          .footer-main-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        
        /* Tablet Footer (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .footer-main-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
            padding: 40px 24px !important;
          }
        }
        
        /* Mobile Footer (≤ 480px) */
        @media (max-width: 480px) {
          .footer-main-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            padding: 32px 20px !important;
          }
          
          .footer-main-grid > div {
            text-align: center;
          }
          
          .footer-main-grid nav {
            align-items: center;
          }
          
          .footer-main-grid h3 {
            font-size: 18px !important;
            margin-bottom: 12px !important;
          }
          
          .footer-main-grid p,
          .footer-main-grid a {
            font-size: 15px !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;

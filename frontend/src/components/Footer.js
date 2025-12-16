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
      {/* SEBI Disclaimer Bar */}
      <div style={{
        backgroundColor: '#1a1a1a',
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
            <strong style={{ color: '#DAA520' }}>SEBI Disclaimer:</strong> Investments in securities market are subject to market risks. Read all related documents carefully before investing.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px'
      }}>
        {/* Column 1: About */}
        <div>
          <h3 style={{
            color: '#DAA520',
            fontSize: '20px',
            marginBottom: '20px',
            fontWeight: '600',
            fontFamily: '"Playfair Display", serif'
          }}>
            BM Wealth
          </h3>
          <p style={{
            color: '#aaa',
            fontSize: '14px',
            lineHeight: '1.7',
            marginBottom: '20px'
          }}>
            Premium Financial Advisory
          </p>
          <p style={{
            color: '#888',
            fontSize: '14px',
            lineHeight: '1.7',
            margin: 0
          }}>
            Empowering investors with tailored financial solutions in Mumbai.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 style={{
            color: '#fff',
            fontSize: '16px',
            marginBottom: '20px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Quick Links
          </h3>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {['Home', 'About Us', 'Services', 'Blog', 'Contact'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(' ', '-')}`}
                style={{
                  color: '#aaa',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: '#DAA520'
                  }
                }}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 3: Legal */}
        <div>
          <h3 style={{
            color: '#fff',
            fontSize: '16px',
            marginBottom: '20px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Legal
          </h3>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
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
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: '#DAA520'
                  }
                }}
              >
                {item.text}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h3 style={{
            color: '#fff',
            fontSize: '16px',
            marginBottom: '20px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Contact Us
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <p style={{
              color: '#aaa',
              fontSize: '14px',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              +91 8850977259
            </p>
            <p style={{
              color: '#aaa',
              fontSize: '14px',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              support@bmwealth.co.in
            </p>
            <p style={{
              color: '#aaa',
              fontSize: '14px',
              margin: '12px 0 0 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              66, Vinod Villa Bldg., 1st floor office no. 108,<br />
              Cavel Cross Lane 3, Kalbadevi,<br />
              Mumbai - 400002, Maharashtra, India
            </p>
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
                marginTop: '12px',
                fontSize: '14px',
                backgroundColor: 'rgba(37, 211, 102, 0.1)',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(37, 211, 102, 0.2)'
                }
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
        backgroundColor: '#1a1a1a',
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
            <strong style={{ color: '#DAA520' }}>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '8px' }}>
              © {new Date().getFullYear()} BM Wealth. All rights reserved.
            </p>
            <p style={{ color: '#C0A062', fontSize: '13px' }}>
              IRDAI Licensed | AMFI Registered
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

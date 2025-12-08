import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
        borderTop: '1px solid rgba(218, 165, 32, 0.2)',
        padding: '60px 20px 30px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Main Footer Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          {/* Company Info */}
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '24px',
                color: '#DAA520',
                marginBottom: '16px',
              }}
            >
              BM Wealth
            </h3>
            <p
              style={{
                color: '#C0A062',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '12px',
              }}
            >
              Premium Financial Advisory
            </p>
            <p
              style={{
                color: '#CCCCCC',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              Empowering investors with tailored financial solutions in Mumbai.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '18px',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Home
              </Link>
              <Link
                to="/about"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                About Us
              </Link>
              <Link
                to="/services"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Services
              </Link>
              <Link
                to="/blog"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '18px',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/terms-and-conditions"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy-policy"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Privacy Policy
              </Link>
              <Link
                to="/disclaimer"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Disclaimer
              </Link>
              <Link
                to="/refund-policy"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Refund Policy
              </Link>
              <Link
                to="/compliance"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Compliance
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '18px',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ color: '#FFFFFF', fontSize: '14px' }}>
                Phone: +91 8850977259
              </p>
              <p style={{ color: '#FFFFFF', fontSize: '14px' }}>
                Email: support@bmwealth.co.in
              </p>
              <p style={{ color: '#CCCCCC', fontSize: '13px', marginTop: '4px' }}>
                Mumbai, Maharashtra
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            marginBottom: '30px',
            padding: '16px',
            backgroundColor: 'rgba(218, 165, 32, 0.1)',
            borderRadius: '8px',
            borderLeft: '4px solid #DAA520',
          }}
        >
          <p style={{ color: '#CCCCCC', fontSize: '13px', lineHeight: '1.6' }}>
            <strong style={{ color: '#DAA520' }}>Investment Disclaimer:</strong> Mutual fund investments are subject to market
            risks. Past performance is not indicative of future results. Please read
            all scheme-related documents carefully before investing.
          </p>
        </div>

        {/* Copyright */}
        <div
          style={{
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
  );
};

export default Footer;
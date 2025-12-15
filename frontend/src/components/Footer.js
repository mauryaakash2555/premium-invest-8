import { Link } from 'react-router-dom';

// GOOD FOOTER - 4 Column Layout (Screenshot 274 style)

export default function Footer() {
  return (
    <footer
      style={{
        background: '#000000',
        width: '100%',
        paddingTop: '60px',
        paddingBottom: '20px',
        borderTop: '1px solid rgba(218, 165, 32, 0.2)'
      }}
    >
      {/* Main Footer Content - 4 Columns */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px',
          marginBottom: '40px'
        }}
      >
        {/* Column 1: BM Wealth */}
        <div>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: '700',
              color: '#DAA520',
              marginBottom: '20px'
            }}
          >
            BM Wealth
          </h3>
          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}
          >
            Premium Financial Advisory
          </p>
          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              margin: '0'
            }}
          >
            Empowering investors with tailored financial solutions in Mumbai.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '20px'
            }}
          >
            Quick Links
          </h3>
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <Link
              to="/"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Home
            </Link>
            <Link
              to="/about"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              About Us
            </Link>
            <Link
              to="/services"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Services
            </Link>
            <Link
              to="/blog"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Blog
            </Link>
            <Link
              to="/contact"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Column 3: Legal */}
        <div>
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '20px'
            }}
          >
            Legal
          </h3>
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <Link
              to="/terms-and-conditions"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Privacy Policy
            </Link>
            <Link
              to="/disclaimer"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Disclaimer
            </Link>
            <Link
              to="/refund-policy"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Refund Policy
            </Link>
            <Link
              to="/compliance"
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#DAA520'}
              onMouseOut={(e) => e.target.style.color = '#B8B8B8'}
            >
              Compliance
            </Link>
          </nav>
        </div>

        {/* Column 4: Contact Us */}
        <div>
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '20px'
            }}
          >
            Contact Us
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <p
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                margin: '0',
                lineHeight: '1.6'
              }}
            >
              <strong style={{ color: '#E5E5E5' }}>Phone:</strong> +91 8850977259
            </p>
            <p
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                margin: '0',
                lineHeight: '1.6'
              }}
            >
              <strong style={{ color: '#E5E5E5' }}>Email:</strong> support@bmwealth.co.in
            </p>
            <p
              style={{
                fontSize: '16px',
                color: '#B8B8B8',
                margin: '0',
                lineHeight: '1.6'
              }}
            >
              Mumbai, Maharashtra
            </p>
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                color: '#25D366',
                textDecoration: 'none',
                marginTop: '4px',
                fontWeight: '500',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#20BA5A'}
              onMouseOut={(e) => e.target.style.color = '#25D366'}
            >
              📱 WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Investment Disclaimer Bar */}
      <div
        style={{
          borderTop: '1px solid rgba(218, 165, 32, 0.2)',
          paddingTop: '20px',
          marginTop: '20px'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            background: 'rgba(218, 165, 32, 0.05)',
            borderLeft: '4px solid #DAA520',
            borderRadius: '4px'
          }}
        >
          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#DAA520',
              margin: '0',
              fontWeight: '500'
            }}
          >
            <strong>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(218, 165, 32, 0.1)'
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            margin: '0'
          }}
        >
          © 2025 BM Wealth. All rights reserved.
        </p>
      </div>

      {/* Mobile Responsive */}
      <style>{`
        @media (max-width: 768px) {
          footer > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>
    </footer>
  );
}

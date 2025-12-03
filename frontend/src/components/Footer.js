import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Youtube, MessageCircle } from 'lucide-react';

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
                color: '#ffd700',
                marginBottom: '16px',
              }}
            >
              BM Wealth
            </h3>
            <p
              style={{
                color: '#ffd700',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '12px',
              }}
            >
              Mumbai's Premier Financial Partner
            </p>
            <p
              style={{
                color: '#888',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              Empowering investors with tailored financial solutions and decades
              of expertise.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h4
              style={{
                color: '#ffd700',
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
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
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
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
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
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
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
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
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
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                Contact
              </Link>
            </div>
          </div>
          {/* Contact Info */}
          <div>
            <h4
              style={{
                color: '#ffd700',
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
                Email: mauryaakash2555@gmail.com
              </p>
              <a
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-whatsapp-link"
                style={{
                  color: '#25D366',
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#1DA851')}
                onMouseLeave={(e) => (e.target.style.color = '#25D366')}
              >
                <MessageCircle size={16} />
                WhatsApp Us
              </a>
            </div>
          </div>
          {/* Social Media */}
          <div>
            <h4
              style={{
                color: '#ffd700',
                fontSize: '18px',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              Follow Us
            </h4>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="https://www.youtube.com/@BMWealthMumbai"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="social-youtube"
                style={{
                  color: '#FFFFFF',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                <Youtube size={24} />
              </a>
              <a
                href="https://www.instagram.com/BMWealthOfficial"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="social-instagram"
                style={{
                  color: '#FFFFFF',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.linkedin.com/company/bm-wealth"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="social-linkedin"
                style={{
                  color: '#FFFFFF',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                <Linkedin size={24} />
              </a>
              <a
                href="https://www.facebook.com/BMWealthMumbai"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="social-facebook"
                style={{
                  color: '#FFFFFF',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>
        {/* SEBI Disclaimer */}
        <div className="sebi-disclaimer" style={{ marginBottom: '30px' }}>
          <strong>SEBI Disclaimer:</strong> Investments are subject to market
          risks. Past performance is not indicative of future results. Please read
          all scheme-related documents carefully before investing.
        </div>
        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '20px',
            textAlign: 'center',
            color: '#888',
            fontSize: '14px',
          }}
        >
          <p>
            © {new Date().getFullYear()} BM Wealth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

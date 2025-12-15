import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

// Shared styles
const styles = {
  footer: {
    background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
    borderTop: '1px solid rgba(218, 165, 32, 0.2)',
    padding: '40px 20px 20px',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  brandTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '22px',
    color: '#DAA520',
    fontWeight: 600,
    margin: 0,
  },
  sectionTitle: {
    color: '#DAA520',
    fontSize: '17px',
    fontWeight: 600,
    margin: 0,
  },
  text: {
    color: '#FFFFFF',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  textSecondary: {
    color: '#CCCCCC',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  linkBase: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '14px',
    lineHeight: '1.5',
    transition: 'all 0.3s ease',
    margin: 0,
  },
  linkWhatsApp: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#25D366',
    textDecoration: 'none',
    fontSize: '14px',
    lineHeight: '1.5',
    transition: 'all 0.3s ease',
    fontWeight: 500,
    margin: 0,
  },
  disclaimer: {
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: '8px',
    borderLeft: '4px solid #DAA520',
  },
  disclaimerText: {
    color: '#C0A062',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
  },
  bottomBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '16px',
    textAlign: 'center',
  },
  copyrightText: {
    color: '#FFFFFF',
    fontSize: '14px',
    margin: '0 0 4px 0',
  },
  licenseText: {
    color: '#C0A062',
    fontSize: '13px',
    margin: 0,
  },
};

// Reusable hover handlers
const handleNavLinkHover = (e, isHovering) => {
  e.target.style.color = isHovering ? '#DAA520' : '#FFFFFF';
  e.target.style.transform = isHovering ? 'translateX(4px)' : 'translateX(0)';
};

const handleContactLinkHover = (e, isHovering) => {
  e.target.style.color = isHovering ? '#DAA520' : '#FFFFFF';
};

const handleWhatsAppHover = (e, isHovering) => {
  e.currentTarget.style.color = isHovering ? '#20B858' : '#25D366';
  e.currentTarget.style.transform = isHovering ? 'translateX(2px)' : 'translateX(0)';
};

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Main Footer Content */}
        <div style={styles.grid}>
          {/* Company Info */}
          <div style={styles.column}>
            <h3 style={styles.brandTitle}>BM Wealth</h3>
            <p style={{ ...styles.text, fontWeight: 500 }}>Premium Financial Advisory</p>
            <p style={styles.textSecondary}>
              Empowering investors with tailored financial solutions in Mumbai.
            </p>
          </div>

          {/* Quick Links */}
          <div style={styles.column}>
            <h4 style={styles.sectionTitle}>Quick Links</h4>
            <Link
              to="/"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              About Us
            </Link>
            <Link
              to="/services"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Services
            </Link>
            <Link
              to="/blog"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Blog
            </Link>
            <Link
              to="/contact"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Contact
            </Link>
          </div>

          {/* Legal Links */}
          <div style={styles.column}>
            <h4 style={styles.sectionTitle}>Legal</h4>
            <Link
              to="/terms-and-conditions"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Privacy Policy
            </Link>
            <Link
              to="/disclaimer"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Disclaimer
            </Link>
            <Link
              to="/refund-policy"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Refund Policy
            </Link>
            <Link
              to="/compliance"
              style={styles.linkBase}
              onMouseEnter={(e) => handleNavLinkHover(e, true)}
              onMouseLeave={(e) => handleNavLinkHover(e, false)}
            >
              Compliance
            </Link>
          </div>

          {/* Contact Info */}
          <div style={styles.column}>
            <h4 style={styles.sectionTitle}>Contact Us</h4>
            <a
              href="tel:+918850977259"
              style={styles.linkBase}
              onMouseEnter={(e) => handleContactLinkHover(e, true)}
              onMouseLeave={(e) => handleContactLinkHover(e, false)}
            >
              Phone: +91 8850977259
            </a>
            <a
              href="mailto:support@bmwealth.co.in"
              style={styles.linkBase}
              onMouseEnter={(e) => handleContactLinkHover(e, true)}
              onMouseLeave={(e) => handleContactLinkHover(e, false)}
            >
              Email: support@bmwealth.co.in
            </a>
            <p style={styles.text}>Mumbai, Maharashtra</p>
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkWhatsApp}
              onMouseEnter={(e) => handleWhatsAppHover(e, true)}
              onMouseLeave={(e) => handleWhatsAppHover(e, false)}
            >
              <MessageCircle size={16} />
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={styles.disclaimer}>
          <p style={styles.disclaimerText}>
            <strong>Investment Disclaimer:</strong> Mutual fund investments are subject to market
            risks. Past performance is not indicative of future results. Please read all
            scheme-related documents carefully before investing.
          </p>
        </div>

        {/* Copyright */}
        <div style={styles.bottomBar}>
          <p style={styles.copyrightText}>
            © {new Date().getFullYear()} BM Wealth. All rights reserved.
          </p>
          <p style={styles.licenseText}>IRDAI Licensed | AMFI Registered</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

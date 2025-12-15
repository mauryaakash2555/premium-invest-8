import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

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
        <div className="footer-grid">
          {/* Company Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '24px',
                color: '#DAA520',
                marginBottom: '4px',
                fontWeight: 600,
              }}
            >
              BM Wealth
            </h3>
            <p
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                lineHeight: '1.8',
                marginBottom: '0',
                fontWeight: 500,
              }}
            >
              Premium Financial Advisory
            </p>
            <p
              style={{
                color: '#CCCCCC',
                fontSize: '14px',
                lineHeight: '1.8',
                margin: 0,
              }}
            >
              Empowering investors with tailored financial solutions in Mumbai.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '18px',
                marginBottom: '4px',
                fontWeight: 600,
              }}
            >
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Home
              </Link>
              <Link
                to="/about"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                About Us
              </Link>
              <Link
                to="/services"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Services
              </Link>
              <Link
                to="/blog"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '18px',
                marginBottom: '4px',
                fontWeight: 600,
              }}
            >
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/terms-and-conditions"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy-policy"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Privacy Policy
              </Link>
              <Link
                to="/disclaimer"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Disclaimer
              </Link>
              <Link
                to="/refund-policy"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Refund Policy
              </Link>
              <Link
                to="/compliance"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  lineHeight: '1.6',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Compliance
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '18px',
                marginBottom: '4px',
                fontWeight: 600,
              }}
            >
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#FFFFFF', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                Phone: +91 8850977259
              </p>
              <p style={{ color: '#FFFFFF', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                Email: support@bmwealth.co.in
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0' }}>
                <p style={{ color: '#FFFFFF', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
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
                    textDecoration: 'none',
                    color: '#25D366',
                    fontSize: '14px',
                    marginTop: '0',
                    marginBottom: '0',
                    transition: 'all 0.3s ease',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#20B858';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#25D366';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <MessageCircle size={16} />
                  WhatsApp Us
                </a>
              </div>
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
          <p style={{ color: '#C0A062', fontSize: '13px', lineHeight: '1.6' }}>
            <strong>Investment Disclaimer:</strong> Mutual fund investments are subject to market
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
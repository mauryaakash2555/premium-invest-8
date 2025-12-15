import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
        borderTop: '1px solid rgba(218, 165, 32, 0.2)',
        padding: '50px 20px 25px',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            marginBottom: '30px',
          }}
        >
          {/* Company Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                color: '#DAA520',
                marginBottom: '10px',
                fontWeight: 600,
                marginTop: 0,
              }}
            >
              BM Wealth
            </h3>
            <p
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                lineHeight: '1.5',
                marginBottom: '6px',
                fontWeight: 500,
                marginTop: 0,
              }}
            >
              Premium Financial Advisory
            </p>
            <p
              style={{
                color: '#CCCCCC',
                fontSize: '14px',
                lineHeight: '1.5',
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              Empowering investors with tailored financial solutions in Mumbai.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '17px',
                marginBottom: '12px',
                fontWeight: 600,
                marginTop: 0,
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
                  transition: 'all 0.3s ease',
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '17px',
                marginBottom: '12px',
                fontWeight: 600,
                marginTop: 0,
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
                  transition: 'all 0.3s ease',
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
                  lineHeight: '1.5',
                  margin: 0,
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4
              style={{
                color: '#DAA520',
                fontSize: '17px',
                marginBottom: '12px',
                fontWeight: 600,
                marginTop: 0,
              }}
            >
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="tel:+918850977259"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: '1.5',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                }}
              >
                Phone: +91 8850977259
              </a>
              <a
                href="mailto:support@bmwealth.co.in"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: '1.5',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#DAA520';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#FFFFFF';
                }}
              >
                Email: support@bmwealth.co.in
              </a>
              <p style={{ color: '#FFFFFF', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
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
                  margin: 0,
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

        {/* Disclaimer */}
        <div
          style={{
            marginBottom: '25px',
            padding: '14px',
            backgroundColor: 'rgba(218, 165, 32, 0.1)',
            borderRadius: '8px',
            borderLeft: '4px solid #DAA520',
          }}
        >
          <p style={{ color: '#C0A062', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            <strong>Investment Disclaimer:</strong> Mutual fund investments are subject to market
            risks. Past performance is not indicative of future results. Please read
            all scheme-related documents carefully before investing.
          </p>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '18px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#FFFFFF', fontSize: '14px', margin: '0 0 6px 0' }}>
            © {new Date().getFullYear()} BM Wealth. All rights reserved.
          </p>
          <p style={{ color: '#C0A062', fontSize: '13px', margin: 0 }}>
            IRDAI Licensed | AMFI Registered
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

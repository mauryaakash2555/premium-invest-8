import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      {/* SEBI Disclaimer Bar */}
      <div className="sebi-disclaimer-bar">
        <div className="sebi-disclaimer-content">
          <p>
            <strong>SEBI Disclaimer:</strong> Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. Please consider your specific investment requirements, risk tolerance, investment goal, time frame, risk and reward balance and cost associated with the investment before choosing a fund or designing a portfolio that suits your needs.
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="main-footer">
        
        {/* 4 Column Grid */}
        <div className="footer-grid">
          
          {/* Column 1: BM Wealth */}
          <div className="footer-column">
            <h3 className="footer-heading-main">BM Wealth</h3>
            <p className="footer-tagline">Premium Financial Advisory</p>
            <p className="footer-description">
              Empowering investors with tailored financial solutions in Mumbai.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <nav className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/services">Services</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
          
          {/* Column 3: Legal */}
          <div className="footer-column">
            <h3 className="footer-heading">Legal</h3>
            <nav className="footer-links">
              <Link to="/terms">Terms & Conditions</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/disclaimer">Disclaimer</Link>
              <Link to="/refund">Refund Policy</Link>
              <Link to="/compliance">Compliance</Link>
            </nav>
          </div>
          
          {/* Column 4: Contact Us */}
          <div className="footer-column">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="footer-contact">
              <p><strong>Phone:</strong> +91 8850977259</p>
              <p><strong>Email:</strong> support@bmwealth.co.in</p>
              <p>Mumbai, Maharashtra</p>
              <a 
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-link"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Investment Disclaimer Bar */}
        <div className="investment-disclaimer-bar">
          <div className="investment-disclaimer-content">
            <p>
              <strong>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="footer-copyright">
          <p> 2025 BM Wealth. All rights reserved.</p>
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '20px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '8px' }}>
            ┬⌐ {new Date().getFullYear()} BM Wealth. All rights reserved.
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

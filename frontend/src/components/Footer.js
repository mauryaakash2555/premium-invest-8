import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <>
      <style>{`
        .footer-custom-link {
          color: #aaaaaa !important;
          text-decoration: none !important;
          font-size: 14px !important;
          line-height: 1.2 !important;
          padding: 0 !important;
          margin: 0 !important;
          display: block !important;
          box-sizing: border-box !important;
        }
        .footer-custom-link:hover {
          color: #DAA520 !important;
        }
        .whatsapp-container-desktop {
          display: flex;
          justify-content: flex-start;
          margin-top: -8px;
        }
        @media (max-width: 768px) {
          .whatsapp-container-desktop {
            justify-content: center !important;
          }
        }
      `}</style>
      <footer style={{ backgroundColor: '#0a0a0a', color: '#fff', padding: '0', fontFamily: '"Inter", sans-serif', width: '100%' }}>
      
      {/* SEBI Disclaimer - FIXED CONTAINER */}
      <div style={{
        backgroundColor: '#0a0a0a',
        padding: '20px 0',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative'
        }}>
          <div style={{
            borderLeft: '4px solid #B8860B',
            paddingLeft: '16px',
            backgroundColor: 'rgba(24, 24, 24, 0.8)',
            padding: '16px 20px',
            borderRadius: '4px'
          }}>
            <p style={{
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#999',
              margin: 0,
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <strong style={{ color: '#B8860B' }}>SEBI Disclaimer:</strong> Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. Please consider your specific investment requirements, risk tolerance, investment goal, time frame, risk and reward balance and cost associated with the investment before choosing a fund or designing a portfolio that suits your needs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content - 5 COLUMN LAYOUT */}
      <div className="footer-grid-container" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '50px 20px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr',
        gap: '40px'
      }}>
        
        {/* BM Wealth Column */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '22px',
            marginBottom: '8px',
            fontWeight: '600',
            fontFamily: '"Playfair Display", serif'
          }}>
            BM Wealth
          </h3>
          <p style={{
            color: '#B8860B',
            fontSize: '14px',
            margin: '0 0 20px 0',
            fontWeight: '600'
          }}>
            Premium Financial Advisory
          </p>
          <p style={{
            color: '#aaa',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Empowering investors with tailored financial solutions in Mumbai.
          </p>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '18px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Quick Links
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <a href="/" className="footer-custom-link">Home</a>
            <a href="/about" className="footer-custom-link">About Us</a>
            <a href="/services" className="footer-custom-link">Services</a>
            <a href="/blog" className="footer-custom-link">Blog</a>
            <a href="/contact" className="footer-custom-link">Contact</a>
          </div>
        </div>

        {/* Resources Column */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '18px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Resources
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <a href="/platforms" className="footer-custom-link">Platforms</a>
            <a href="/curated-partners" className="footer-custom-link">Curated Partners</a>
            <a href="/careers" className="footer-custom-link">Careers</a>
            <a href="/sitemap" className="footer-custom-link">Sitemap</a>
          </div>
        </div>

        {/* Legal Column */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '18px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Legal
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <a href="/terms" className="footer-custom-link">Terms & Conditions</a>
            <a href="/privacy" className="footer-custom-link">Privacy Policy</a>
            <a href="/disclaimer" className="footer-custom-link">Disclaimer</a>
            <a href="/refund" className="footer-custom-link">Refund Policy</a>
            <a href="/compliance" className="footer-custom-link">Compliance</a>
          </div>
        </div>

        {/* Contact Us Column */}
        <div>
          <h3 style={{
            color: '#B8860B',
            fontSize: '18px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Contact Us
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
              <strong>Phone:</strong> +91 8850977259
            </p>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
              <strong>Email:</strong> support@bmwealth.co.in
            </p>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
              Mumbai, Maharashtra
            </p>
            
            {/* WhatsApp Button */}
            <div className="whatsapp-container-desktop" style={{ marginTop: '8px' }}>
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
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                <MessageCircle size={18} color="#25D366" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Disclaimer - FIXED CONTAINER */}
      <div style={{
        backgroundColor: '#0a0a0a',
        padding: '20px 0',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            borderLeft: '4px solid #B8860B',
            paddingLeft: '16px',
            backgroundColor: 'rgba(24, 24, 24, 0.8)',
            padding: '16px 20px',
            borderRadius: '4px'
          }}>
            <p style={{
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#999',
              margin: 0,
              wordWrap: 'break-word',
              whiteSpace: 'normal'
            }}>
              <strong style={{ color: '#B8860B' }}>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '25px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <p style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '8px', margin: '0 0 8px 0' }}>
            © 2025 BM Wealth. All rights reserved.
          </p>
          <p style={{ color: '#B8860B', fontSize: '13px', margin: 0 }}>
            IRDAI Licensed | AMFI Registered
          </p>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;

/**
 * FILE: app\terms\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import React from 'react';
import { useEffect } from 'react';
const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      
      
      <div style={{ minHeight: '100vh', background: '#000000', paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: '700',
            color: '#DAA520',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>Terms and Conditions</h1>
          <p style={{ fontSize: '16px', color: '#999', marginBottom: '40px' }}>Last Updated: December 8, 2025</p>
          
          <div>
            {/* Acceptance of Terms */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>1. Acceptance of Terms</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                By accessing and using the services provided by BM Wealth, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and Conditions. If you do not agree with any 
                part of these terms, please refrain from using our services.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                These terms constitute a legally binding agreement between you and BM Wealth, owned and operated 
                by Brahmdeo Maurya.
              </p>
            </section>

            {/* Services Provided */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>2. Services Provided</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                BM Wealth provides financial services including but not limited to:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Mutual fund distribution services as an AMFI Registered Distributor (ARN 90008)</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Insurance advisory services as an IRDAI Licensed Advisor (License Number: 277925)</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Portfolio planning and asset allocation guidance</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Investment planning support</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Financial planning consultations</li>
              </ul>
              <p style={{ fontSize: '16px', color: '#DAA520', lineHeight: '1.8', fontWeight: '600', margin: 0 }}>
                We are IRDAI Licensed and AMFI Registered. We do not provide SEBI-registered investment advisory services.
              </p>
            </section>

            {/* No Investment Advice / No Returns Guarantee */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>3. No Investment Advice / No Returns Guarantee</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                While we strive to provide accurate and helpful financial guidance, the information and educational 
                content provided by BM Wealth are for informational purposes only and should not be construed as a 
                guarantee of investment returns or financial outcomes.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                All investment decisions made by you are at your own risk and discretion. Mutual fund investments 
                are subject to market risks. Past performance is not indicative of future returns. Please read all 
                scheme-related documents carefully before investing.
              </p>
            </section>

            {/* User Responsibilities */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>4. User Responsibilities</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                As a user of BM Wealth services, you agree to:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: 0, color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Provide accurate and complete information when requested</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Maintain the confidentiality of your account credentials</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Notify us immediately of any unauthorized use of your account</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Conduct your own due diligence before making investment decisions</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Comply with all applicable laws and regulations</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Not use our services for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>5. Limitation of Liability</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                To the fullest extent permitted by law, BM Wealth, its proprietor, and its representatives 
                shall not be liable for any direct, indirect, incidental, consequential, or punitive damages 
                arising from:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Your use or inability to use our services</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Investment losses or financial damages</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Errors or omissions in the information provided</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Unauthorized access to or alteration of your data</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Market fluctuations or economic conditions</li>
              </ul>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                Our total liability to you for any claim arising out of or relating to these terms or our 
                services shall not exceed the amount of fees paid by you to us in the six months preceding 
                the claim.
              </p>
            </section>

            {/* Intellectual Property */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>6. Intellectual Property</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                All content on the BM Wealth website and in our communications, including but not limited to 
                text, graphics, logos, images, and software, is the property of BM Wealth and is protected 
                by copyright and other intellectual property laws.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                You may not reproduce, distribute, modify, or create derivative works from any content without 
                our express written permission.
              </p>
            </section>

            {/* Privacy and Data Protection */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>7. Privacy and Data Protection</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Your privacy is important to us. Our collection, use, and protection of your personal 
                information are governed by our Privacy Policy, which is incorporated into these Terms and 
                Conditions by reference.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                By using our services, you consent to the collection and use of your information as described 
                in our Privacy Policy. We do NOT sell your personal data to third parties.
              </p>
            </section>

            {/* Cookies and Analytics */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>8. Cookies and Analytics</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                We use essential cookies to operate the website. Where enabled, we may also use optional analytics 
                technologies (such as Google Analytics) to understand site performance and improve user experience.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                Optional analytics is loaded only after you provide consent via our cookie consent banner. 
                You can also control cookies through your browser settings; disabling certain cookies may affect 
                website functionality.
              </p>
            </section>

            {/* Third-Party Links and Affiliate Disclosure */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>9. Third-Party Links and Affiliate Disclosure</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Our website may contain links to third-party platforms including but not limited to Groww, 
                Zerodha, Smallcase, and other financial service providers. We may earn referral commissions 
                when you sign up through these links.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                These affiliate partnerships do not influence our educational content or recommendations. 
                All opinions and guidance provided are independent and based on our professional assessment.
              </p>
              <p style={{ fontSize: '16px', color: '#DAA520', lineHeight: '1.8', fontWeight: '600', margin: 0 }}>
                Disclosure: We are compensated for referrals to partner platforms. You are not charged 
                any extra fees for using our referral links.
              </p>
            </section>

            {/* Future Advertising */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>10. Advertising and Monetization</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                BM Wealth may display third-party advertisements through Google AdSense or similar advertising 
                networks. These advertisements are clearly marked and distinguished from our editorial content.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                We do not endorse or take responsibility for the products or services advertised by third 
                parties. Please conduct your own research before engaging with any advertised content.
              </p>
            </section>

            {/* Governing Law */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>11. Governing Law and Jurisdiction</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                These Terms and Conditions shall be governed by and construed in accordance with the laws 
                of India. Any disputes arising from or relating to these terms shall be subject to the 
                exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
              </p>
            </section>

            {/* Contact Information */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>12. Contact Information</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                If you have any questions or concerns about these Terms and Conditions, please contact us:
              </p>
              <div style={{
                background: 'rgba(218, 165, 32, 0.05)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(218, 165, 32, 0.2)'
              }}>
                <p style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '12px' }}><strong>BM Wealth</strong></p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Proprietor: Brahmdeo Maurya</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108, Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Phone: +91 8850977259</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', margin: 0 }}>Email: support@bmwealth.co.in</p>
              </div>
            </section>

            {/* License Information */}
            <section style={{
              background: 'rgba(218, 165, 32, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.3)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '16px'
              }}>Regulatory Information</h3>
              <p style={{ fontSize: '14px', color: '#B8B8B8', marginBottom: '8px' }}>
                <strong style={{ color: '#E5E5E5' }}>IRDAI License Number:</strong> 277925
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8', marginBottom: '8px' }}>
                <strong style={{ color: '#E5E5E5' }}>AMFI Registration:</strong> ARN 90008
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8', margin: 0 }}>
                We are AMFI Registered and IRDAI Licensed. We operate in compliance with applicable regulations.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;

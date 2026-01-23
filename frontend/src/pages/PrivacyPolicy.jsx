import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Privacy Policy - BM Wealth</title>
        <meta name="description" content="Privacy Policy for BM Wealth - How we protect and manage your data" />
        <link rel="canonical" href="https://www.bmwealth.co.in/privacy" />
      </Helmet>
      
      <div style={{ minHeight: '100vh', background: '#000000', paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: '700',
            color: 'var(--lux-accent)',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>Privacy Policy</h1>
          <p style={{ fontSize: '16px', color: '#999', marginBottom: '40px' }}>Last Updated: December 8, 2025</p>
          
          <div>
            {/* Introduction */}
            <section style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                At BM Wealth, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our financial advisory services.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                By using our services, you consent to the data practices described in this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>1. Information We Collect</h2>
              
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Personal Information</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                We may collect personal information that you voluntarily provide to us, including:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Name, email address, phone number</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Date of birth, PAN card details, Aadhaar information</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Address and contact details</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Bank account information</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Investment preferences and financial goals</li>
              </ul>

              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Financial Information</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                To provide our services effectively, we collect:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Income and employment details</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Investment portfolio information</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Transaction history</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Risk profile and investment objectives</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Tax-related information</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>2. How We Use Your Information</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                We use the collected information for the following purposes:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: 0, color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>To provide and maintain our financial advisory services</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>To process transactions and manage your investments</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>To comply with KYC (Know Your Customer) regulations</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>To communicate with you about your account and services</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>To send periodic emails regarding updates, promotions, and educational content</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>To improve our website and service offerings</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>To prevent fraud and enhance security</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>To comply with legal and regulatory requirements</li>
              </ul>
            </section>

            {/* Data Security Measures */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>3. Data Security Measures</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                We implement robust security measures to protect your personal and financial information:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>SSL/TLS encryption for data transmission</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Secure cloud storage with MongoDB Atlas</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Regular security audits and vulnerability assessments</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Access controls and authentication mechanisms</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Employee training on data protection practices</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Encrypted backup systems</li>
              </ul>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                While we strive to protect your information, no method of transmission over the internet 
                or electronic storage is 100% secure. We cannot guarantee absolute security but are 
                committed to maintaining the highest standards of data protection.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>4. Data Sharing and Disclosure</h2>
              <p style={{ fontSize: '16px', color: 'var(--lux-accent)', lineHeight: '1.8', fontWeight: '600', marginBottom: '20px' }}>
                We DO NOT sell your personal data to third parties.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                We may share your information only in the following circumstances:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: 0, color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Service Providers:</strong> With trusted third-party service providers who assist 
                  in operating our business (e.g., payment processors, mutual fund companies, insurance providers)
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Regulatory Compliance:</strong> With AMFI, IRDAI, SEBI, or other regulatory bodies 
                  when required by law
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Legal Requirements:</strong> When required to comply with legal obligations, court 
                  orders, or government requests
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>
                  <strong style={{ color: '#E5E5E5' }}>With Your Consent:</strong> Any other disclosure with your explicit consent
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>5. Your Rights</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                You have the following rights regarding your personal information:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}><strong style={{ color: '#E5E5E5' }}>Right to Access:</strong> Request copies of your personal data</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}><strong style={{ color: '#E5E5E5' }}>Right to Rectification:</strong> Request correction of inaccurate information</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}><strong style={{ color: '#E5E5E5' }}>Right to Erasure:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}><strong style={{ color: '#E5E5E5' }}>Right to Restrict Processing:</strong> Request limitation on how we use your data</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}><strong style={{ color: '#E5E5E5' }}>Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}><strong style={{ color: '#E5E5E5' }}>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                To exercise any of these rights, please contact us at privacy@bmwealth.co.in
              </p>
            </section>

            {/* Contact Information */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>6. Contact Information</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                data practices, please contact us:
              </p>
              <div style={{
                background: 'color-mix(in oklab, var(--lux-accent) 5%, transparent)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid color-mix(in oklab, var(--lux-accent) 20%, transparent)'
              }}>
                <p style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '12px' }}><strong>BM Wealth</strong></p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Proprietor: Brahmdeo Maurya</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108, Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Phone: +91 8850977259</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Email: privacy@bmwealth.co.in</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', margin: 0 }}>General Support: support@bmwealth.co.in</p>
              </div>
            </section>

            {/* License Information */}
            <section style={{
              background: 'color-mix(in oklab, var(--lux-accent) 5%, transparent)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '16px'
              }}>Regulatory Information</h3>
              <p style={{ fontSize: '14px', color: '#B8B8B8', marginBottom: '8px' }}>
                <strong style={{ color: '#E5E5E5' }}>IRDAI License Number:</strong> 277925
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8', margin: 0 }}>
                <strong style={{ color: '#E5E5E5' }}>AMFI Registration:</strong> ARN 90008
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

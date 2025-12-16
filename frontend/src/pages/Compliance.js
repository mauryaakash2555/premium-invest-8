import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const Compliance = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#ffffff' }}>
      <Helmet>
        <title>Regulatory Compliance & Investor Protection | BM Wealth Mumbai ARN 90008</title>
        <meta name="description" content="BM Wealth regulatory compliance, investor charter, grievance redressal mechanism. IRDAI Licensed and AMFI Registered ARN 90008." />
      </Helmet>
      
      {/* Header Section with Background */}
      <div style={{
        backgroundColor: '#0a0a0a',
        backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '120px 0 80px 0',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '600',
            color: '#B8860B',
            fontFamily: '"Playfair Display", serif',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            Regulatory Compliance & Investor Protection
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#aaa',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Ensuring transparency and regulatory adherence in all our financial services
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        {/* AMFI Registration */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '28px',
            color: '#B8860B',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            AMFI Registration
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#e5e5e5',
            textAlign: 'justify',
            marginBottom: '15px'
          }}>
            BM Wealth is registered with the Association of Mutual Funds in India (AMFI) under registration number ARN 90008. This registration authorizes us to distribute mutual fund products in accordance with SEBI regulations and AMFI guidelines.
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#e5e5e5',
            textAlign: 'justify'
          }}>
            Our AMFI registration ensures that we maintain the highest standards of professionalism and ethical conduct in mutual fund distribution services.
          </p>
        </section>

        {/* IRDAI License */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '28px',
            color: '#B8860B',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            IRDAI License
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#e5e5e5',
            textAlign: 'justify',
            marginBottom: '15px'
          }}>
            We hold a valid license from the Insurance Regulatory and Development Authority of India (IRDAI) under license number 277925. This composite license enables us to provide comprehensive insurance advisory and distribution services.
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#e5e5e5',
            textAlign: 'justify'
          }}>
            Our IRDAI license covers both life and general insurance products, ensuring compliance with all regulatory requirements for insurance distribution.
          </p>
        </section>

        {/* SEBI Compliance */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '28px',
            color: '#B8860B',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            SEBI Compliance Statement
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#e5e5e5',
            textAlign: 'justify',
            marginBottom: '15px'
          }}>
            BM Wealth operates in strict accordance with Securities and Exchange Board of India (SEBI) regulations. We are not registered as a SEBI Investment Advisor (RIA) and therefore do not provide personalized investment advice.
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#e5e5e5',
            textAlign: 'justify'
          }}>
            All our communications are educational in nature and should not be construed as investment advice. We encourage all investors to conduct their own research and consult qualified professionals before making investment decisions.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 style={{
            fontSize: '28px',
            color: '#B8860B',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Contact Information
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#e5e5e5',
            textAlign: 'justify',
            marginBottom: '15px'
          }}>
            For any compliance-related queries or concerns, please contact us at support@bmwealth.co.in or call +91 8850977259. We are committed to maintaining transparency and addressing all regulatory matters promptly.
          </p>
        </section>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .compliance-header h1 {
            font-size: 32px !important;
          }
          
          .nav-item {
            margin-right: 16px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .compliance-header {
            padding: 60px 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Compliance;

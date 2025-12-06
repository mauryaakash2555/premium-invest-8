import { useEffect } from 'react';
import { Shield, FileText, AlertCircle, Phone, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Compliance = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Helmet>
        <title>SEBI Compliance & Investor Charter | BM Wealth Mumbai ARN 90008</title>
        <meta name="description" content="BM Wealth SEBI compliance, investor charter, grievance redressal mechanism. AMFI registered ARN 90008. Transparent and regulated investment advisory in Mumbai." />
        <meta name="keywords" content="SEBI compliance, investor charter, ARN 90008, AMFI registered, investment advisor compliance, grievance redressal, investor protection" />
        <link rel="canonical" href="https://bmwealth.in/compliance" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bmwealth.in/compliance" />
        <meta property="og:title" content="SEBI Compliance & Investor Charter | BM Wealth ARN 90008" />
        <meta property="og:description" content="SEBI compliance, investor charter, and grievance redressal. AMFI registered ARN 90008." />
        <meta property="og:image" content="https://bmwealth.in/logo.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://bmwealth.in/compliance" />
        <meta name="twitter:title" content="SEBI Compliance & Investor Charter | BM Wealth" />
        <meta name="twitter:description" content="SEBI compliance, investor charter, and grievance redressal. AMFI registered ARN 90008." />
        <meta name="twitter:image" content="https://bmwealth.in/logo.png" />
      </Helmet>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              marginBottom: '24px',
            }}
            className="golden-gradient"
          >
            SEBI Compliance & Investor Charter
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#C0A062',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Committed to transparency, investor protection, and regulatory compliance
          </p>
        </div>
      </section>

      {/* Investor Charter Section */}
      <section className="section-container">
        <div className="glass-effect" style={{ padding: '60px 40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'rgba(218, 165, 32, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DAA520',
              }}
            >
              <Shield size={32} />
            </div>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 40px)',
                color: '#DAA520',
                margin: 0,
              }}
            >
              Investor Charter
            </h2>
          </div>

          <div style={{ color: '#CCCCCC', lineHeight: 1.8, fontSize: '16px' }}>
            <h3 style={{ color: '#DAA520', fontSize: '24px', marginTop: '30px', marginBottom: '20px' }}>
              Vision Statement
            </h3>
            <p style={{ marginBottom: '20px' }}>
              BM Wealth is committed to providing professional investment advisory services with the highest
              standards of integrity, transparency, and investor protection in accordance with SEBI regulations.
            </p>

            <h3 style={{ color: '#DAA520', fontSize: '24px', marginTop: '30px', marginBottom: '20px' }}>
              Your Rights as an Investor
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>Right to Fair Treatment:</strong> Equal and fair treatment without discrimination
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Right to Information:</strong> Complete and accurate disclosure of all material information
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Right to Suitability:</strong> Investment advice suitable to your risk profile and financial goals
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Right to Privacy:</strong> Protection of your personal and financial information
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Right to Grievance Redressal:</strong> Access to fair and timely resolution of complaints
              </li>
            </ul>

            <h3 style={{ color: '#DAA520', fontSize: '24px', marginTop: '30px', marginBottom: '20px' }}>
              Your Responsibilities as an Investor
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                Conduct thorough research and due diligence before making investment decisions
              </li>
              <li style={{ marginBottom: '12px' }}>
                Provide complete and accurate information about your financial situation and risk appetite
              </li>
              <li style={{ marginBottom: '12px' }}>
                Read all documents carefully, including terms and conditions, before signing
              </li>
              <li style={{ marginBottom: '12px' }}>
                Keep records of all transactions and communications with your advisor
              </li>
              <li style={{ marginBottom: '12px' }}>
                Report any suspicious activity or concerns promptly
              </li>
              <li style={{ marginBottom: '12px' }}>
                Stay informed about market conditions and review your portfolio regularly
              </li>
            </ul>

            <h3 style={{ color: '#DAA520', fontSize: '24px', marginTop: '30px', marginBottom: '20px' }}>
              Our Commitments to You
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                Provide investment advice based on thorough analysis and your best interests
              </li>
              <li style={{ marginBottom: '12px' }}>
                Maintain transparency in all dealings and disclose any conflicts of interest
              </li>
              <li style={{ marginBottom: '12px' }}>
                Protect your confidential information and ensure data security
              </li>
              <li style={{ marginBottom: '12px' }}>
                Comply with all SEBI regulations and industry best practices
              </li>
              <li style={{ marginBottom: '12px' }}>
                Provide timely and accurate information about your investments
              </li>
              <li style={{ marginBottom: '12px' }}>
                Address your concerns and grievances promptly and fairly
              </li>
            </ul>

            <div
              className="sebi-disclaimer"
              style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(218, 165, 32, 0.1)',
                borderLeft: '4px solid #DAA520',
              }}
            >
              <strong>SEBI Registration:</strong> ARN 90008
              <br />
              <strong>Validity:</strong> Perpetual (subject to SEBI regulations)
              <br />
              <strong>Principal Officer:</strong> Available on request
            </div>
          </div>
        </div>

        {/* Grievance Redressal Section */}
        <div className="glass-effect" style={{ padding: '60px 40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'rgba(218, 165, 32, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DAA520',
              }}
            >
              <FileText size={32} />
            </div>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 40px)',
                color: '#DAA520',
                margin: 0,
              }}
            >
              Grievance Redressal Mechanism
            </h2>
          </div>

          <div style={{ color: '#CCCCCC', lineHeight: 1.8, fontSize: '16px' }}>
            <h3 style={{ color: '#DAA520', fontSize: '24px', marginTop: '30px', marginBottom: '20px' }}>
              How to File a Complaint
            </h3>
            <p style={{ marginBottom: '20px' }}>
              We are committed to addressing your concerns promptly and fairly. If you have any grievances
              regarding our services, please follow the process outlined below:
            </p>

            <h4 style={{ color: '#C0A062', fontSize: '20px', marginTop: '25px', marginBottom: '15px' }}>
              Step 1: Contact Us Directly
            </h4>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                <Phone size={20} style={{ color: '#DAA520' }} />
                <span>Phone: +91 8850977259</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                <Mail size={20} style={{ color: '#DAA520' }} />
                <span>Email: mauryaakash2555@gmail.com</span>
              </div>
            </div>

            <h4 style={{ color: '#C0A062', fontSize: '20px', marginTop: '25px', marginBottom: '15px' }}>
              Step 2: Written Complaint
            </h4>
            <p style={{ marginBottom: '20px' }}>
              If your concern is not resolved through initial contact, please submit a written complaint including:
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '10px' }}>Your name and contact details</li>
              <li style={{ marginBottom: '10px' }}>Client ID or account reference number</li>
              <li style={{ marginBottom: '10px' }}>Detailed description of the grievance</li>
              <li style={{ marginBottom: '10px' }}>Supporting documents (if any)</li>
              <li style={{ marginBottom: '10px' }}>Expected resolution</li>
            </ul>

            <h4 style={{ color: '#C0A062', fontSize: '20px', marginTop: '25px', marginBottom: '15px' }}>
              Step 3: Escalation to SEBI
            </h4>
            <p style={{ marginBottom: '20px' }}>
              If you are not satisfied with our resolution, you may escalate your complaint to:
            </p>
            <div
              style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <strong style={{ color: '#DAA520' }}>SEBI Complaints Redress System (SCORES)</strong>
              <br />
              Website:{' '}
              <a
                href="https://scores.sebi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#DAA520', textDecoration: 'underline' }}
              >
                https://scores.sebi.gov.in
              </a>
              <br />
              SEBI Toll Free Helpline: 1800 22 7575
            </div>

            <h3 style={{ color: '#DAA520', fontSize: '24px', marginTop: '30px', marginBottom: '20px' }}>
              Resolution Timeline
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>Acknowledgment:</strong> Within 3 working days of receiving the complaint
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Initial Response:</strong> Within 7 working days with status update
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Resolution:</strong> Within 30 days from the date of receipt
              </li>
            </ul>

            <div
              style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(218, 165, 32, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px',
              }}
            >
              <AlertCircle size={24} style={{ color: '#DAA520', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#DAA520' }}>Important Note:</strong>
                <p style={{ margin: '8px 0 0 0' }}>
                  Please keep a copy of your complaint and all correspondence for your records. We are committed
                  to resolving all grievances in a fair, transparent, and timely manner in accordance with SEBI
                  guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Information */}
        <div className="glass-effect" style={{ padding: '40px', marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 36px)',
              color: '#DAA520',
              marginBottom: '20px',
            }}
          >
            Regulatory Disclosures
          </h2>

          <div style={{ color: '#CCCCCC', lineHeight: 1.8, fontSize: '16px' }}>
            <p style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#C0A062' }}>Registration Number:</strong> ARN 90008
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#C0A062' }}>Registered with:</strong> Securities and Exchange Board of
              India (SEBI)
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#C0A062' }}>Type of Registration:</strong> Investment Adviser
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#C0A062' }}>Principal Place of Business:</strong> Mumbai, Maharashtra
            </p>

            <div className="sebi-disclaimer" style={{ marginTop: '30px' }}>
              <strong>Disclaimer:</strong> Investment in securities market is subject to market risks. Please
              read all the related documents carefully before investing. Past performance is not indicative of
              future returns. BM Wealth does not guarantee any returns on investments. All investment decisions
              should be made based on thorough research and understanding of risks involved.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compliance;

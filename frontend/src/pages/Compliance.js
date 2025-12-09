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
        <title>Regulatory Compliance & Investor Charter | BM Wealth Mumbai ARN 90008</title>
        <meta name="description" content="BM Wealth regulatory compliance, investor charter, grievance redressal mechanism. IRDAI Licensed and AMFI Registered ARN 90008. Transparent and regulated financial advisory in Mumbai." />
        <meta name="keywords" content="regulatory compliance, investor charter, ARN 90008, IRDAI licensed, AMFI registered, investment advisor compliance, grievance redressal, investor protection" />
        <link rel="canonical" href="https://bmwealth.in/compliance" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bmwealth.in/compliance" />
        <meta property="og:title" content="Regulatory Compliance & Investor Charter | BM Wealth ARN 90008" />
        <meta property="og:description" content="Regulatory compliance, investor charter, and grievance redressal. IRDAI Licensed and AMFI Registered ARN 90008." />
        <meta property="og:image" content="https://bmwealth.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://bmwealth.in/compliance" />
        <meta name="twitter:title" content="Regulatory Compliance & Investor Charter | BM Wealth" />
        <meta name="twitter:description" content="Regulatory compliance, investor charter, and grievance redressal. IRDAI Licensed and AMFI Registered ARN 90008." />
        <meta name="twitter:image" content="https://bmwealth.in/logo.webp" />
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
              'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            filter: 'brightness(1.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
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
            Regulatory Compliance & Investor Charter
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
            Committed to transparency, investor protection, and regulatory compliance with IRDAI and AMFI
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
              standards of integrity, transparency, and investor protection in accordance with IRDAI and AMFI regulations.
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
                Comply with all IRDAI and AMFI regulations and industry best practices
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
              <strong>IRDAI License Number:</strong> 277925
              <br />
              <strong>AMFI Registration:</strong> ARN 90008
              <br />
              <strong>Validity:</strong> Perpetual (subject to regulatory compliance)
              <br />
              <strong>Regulatory Bodies:</strong> IRDAI (Insurance) | AMFI (Mutual Funds)
              <br />
              <strong>Principal Officer:</strong> Brahmdeo Maurya
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                <Mail size={20} style={{ color: '#DAA520' }} />
                <span>Grievance Email: grievance@bmwealth.co.in</span>
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
              Step 3: Escalation to Regulatory Authorities
            </h4>
            <p style={{ marginBottom: '20px' }}>
              If you are not satisfied with our resolution, you may escalate your complaint to the respective regulatory authorities:
            </p>
            <div
              style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <strong style={{ color: '#DAA520' }}>AMFI Complaints</strong>
              <br />
              Website:{' '}
              <a
                href="https://www.amfiindia.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#DAA520', textDecoration: 'underline' }}
              >
                https://www.amfiindia.com
              </a>
              <br />
              <br />
              <strong style={{ color: '#DAA520' }}>IRDAI Grievance Redressal</strong>
              <br />
              Website:{' '}
              <a
                href="https://www.irdai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#DAA520', textDecoration: 'underline' }}
              >
                https://www.irdai.gov.in
              </a>
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
                  to resolving all grievances in a fair, transparent, and timely manner in accordance with regulatory
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
              marginBottom: '30px',
            }}
          >
            REGULATORY DISCLOSURES &amp; LICENSES
          </h2>

          <div style={{ color: '#CCCCCC', lineHeight: 1.8, fontSize: '16px' }}>
            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Insurance Advisory Services
            </h3>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#C0A062' }}>IRDAI License Number:</strong> 277925
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#C0A062' }}>Service Type:</strong> Insurance Advisory
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#C0A062' }}>Principal Officer:</strong> Brahmdeo Maurya
            </p>

            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Mutual Fund Distribution Services
            </h3>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#C0A062' }}>AMFI Registration:</strong> ARN 90008
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#C0A062' }}>Validity:</strong> Perpetual (subject to regulatory compliance)
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#C0A062' }}>Principal Officer:</strong> Brahmdeo Maurya
            </p>

            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Additional Advisory Services
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '10px' }}>Portfolio Management Services (PMS) - Advisory &amp; Referral Services</li>
              <li style={{ marginBottom: '10px' }}>Fixed Deposit (FD) Advisory Services</li>
              <li style={{ marginBottom: '10px' }}>Investment Planning &amp; Financial Consulting</li>
            </ul>

            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Registered Office
            </h3>
            <p style={{ marginBottom: '20px' }}>
              66, Vinod Villa Bldg., 1st floor office no. 108<br />
              Cavel Cross Lane 3, Kalbadevi<br />
              Mumbai - 400002, Maharashtra, India
            </p>

            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Regulatory Authorities
            </h3>
            <div
              style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginBottom: '15px',
              }}
            >
              <strong style={{ color: '#DAA520' }}>IRDAI (Insurance Regulatory and Development Authority of India)</strong>
              <br />
              Website:{' '}
              <a
                href="https://www.irdai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#DAA520', textDecoration: 'underline' }}
              >
                www.irdai.gov.in
              </a>
            </div>
            <div
              style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <strong style={{ color: '#DAA520' }}>AMFI (Association of Mutual Funds in India)</strong>
              <br />
              Website:{' '}
              <a
                href="https://www.amfiindia.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#DAA520', textDecoration: 'underline' }}
              >
                www.amfiindia.com
              </a>
            </div>

            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Grievance Redressal Mechanism
            </h3>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#C0A062' }}>Email:</strong> grievance@bmwealth.co.in
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#C0A062' }}>Phone:</strong> +91 8850977259
            </p>
            <p style={{ marginBottom: '20px' }}>
              <strong style={{ color: '#C0A062' }}>Response Time:</strong> Within 7 working days
            </p>

            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Compliance Statement
            </h3>
            <div
              style={{
                padding: '20px',
                background: 'rgba(218, 165, 32, 0.1)',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: '4px solid #DAA520',
              }}
            >
              <p style={{ marginBottom: '0' }}>
                BM Wealth is an IRDAI Licensed Insurance Advisor (License No. 277925) and AMFI Registered Mutual Fund Distributor (ARN 90008). We follow SEBI guidelines for mutual fund distribution but are NOT SEBI-registered Investment Advisors. Our PMS and FD services are advisory in nature and provided through partnerships with SEBI-registered institutions.
              </p>
            </div>

            <h3 style={{ color: '#C0A062', fontSize: '22px', marginTop: '25px', marginBottom: '15px' }}>
              Investment Disclaimer
            </h3>
            <div className="sebi-disclaimer" style={{ marginTop: '0' }}>
              <strong>Disclaimer:</strong> Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compliance;

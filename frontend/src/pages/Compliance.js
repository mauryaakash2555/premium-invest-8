import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function Compliance() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Regulatory Compliance & Investor Protection | BM Wealth Mumbai ARN 90008</title>
        <meta name="description" content="BM Wealth regulatory compliance, investor charter, grievance redressal mechanism. IRDAI Licensed and AMFI Registered ARN 90008. Transparent and regulated financial advisory in Mumbai." />
        <meta name="keywords" content="regulatory compliance, investor charter, ARN 90008, IRDAI licensed, AMFI registered, investment advisor compliance, grievance redressal, investor protection" />
        <link rel="canonical" href="https://www.bmwealth.co.in/compliance" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/compliance" />
        <meta property="og:title" content="Regulatory Compliance & Investor Protection | BM Wealth ARN 90008" />
        <meta property="og:description" content="Regulatory compliance, investor charter, and grievance redressal. IRDAI Licensed and AMFI Registered ARN 90008." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/compliance" />
        <meta name="twitter:title" content="Regulatory Compliance & Investor Protection | BM Wealth" />
        <meta name="twitter:description" content="Regulatory compliance, investor charter, and grievance redressal. IRDAI Licensed and AMFI Registered ARN 90008." />
        <meta name="twitter:image" content="https://www.bmwealth.co.in/logo.webp" />
      </Helmet>

      {/* Hero Section with Image */}
      <section
        style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
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
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '1200px', padding: '0 20px' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '48px',
              fontWeight: '700',
              color: '#B8860B',
              marginBottom: '0',
              textAlign: 'center',
              lineHeight: '1.2',
            }}
          >
            Regulatory Compliance & Investor Protection
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ background: '#000000', padding: '60px 0', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Investor Charter */}
          <section style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '24px',
              }}
            >
              Investor Charter
            </h2>

            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
              Vision Statement
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '24px', textAlign: 'justify' }}>
              BM Wealth is committed to providing professional investment advisory services with the highest standards of integrity, transparency, and investor protection in accordance with IRDAI and AMFI regulations.
            </p>

            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
              Your Rights as an Investor
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Right to Fair Treatment:</strong> Equal and fair treatment without discrimination
              </li>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Right to Information:</strong> Complete and accurate disclosure of all material information
              </li>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Right to Suitability:</strong> Investment advice suitable to your risk profile and financial goals
              </li>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Right to Privacy:</strong> Protection of your personal and financial information
              </li>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Right to Grievance Redressal:</strong> Access to fair and timely resolution of complaints
              </li>
            </ul>

            <div
              style={{
                background: 'rgba(184, 134, 11, 0.1)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                marginTop: '24px',
              }}
            >
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '8px', textAlign: 'justify' }}>
                <strong style={{ color: '#B8860B' }}>IRDAI License Number:</strong> 277925
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '8px', textAlign: 'justify' }}>
                <strong style={{ color: '#B8860B' }}>AMFI Registration:</strong> ARN 90008
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '8px', textAlign: 'justify' }}>
                <strong style={{ color: '#B8860B' }}>Validity:</strong> Perpetual (subject to regulatory compliance)
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', margin: '0', textAlign: 'justify' }}>
                <strong style={{ color: '#B8860B' }}>Principal Officer:</strong> Brahmdeo Maurya
              </p>
            </div>
          </section>

          {/* Grievance Redressal */}
          <section style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '24px',
              }}
            >
              Grievance Redressal Mechanism
            </h2>

            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
              How to File a Complaint
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '24px', textAlign: 'justify' }}>
              We are committed to addressing your concerns promptly and fairly. If you have any grievances regarding our services, please follow the process outlined below:
            </p>

            <div
              style={{
                background: 'rgba(184, 134, 11, 0.05)',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
                Step 1: Contact Us Directly
              </h4>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '8px', textAlign: 'justify' }}>
                <strong>Phone:</strong> +91 8850977259
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '8px', textAlign: 'justify' }}>
                <strong>Email:</strong> mauryaakash2555@gmail.com
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', margin: '0', textAlign: 'justify' }}>
                <strong>Grievance Email:</strong> grievance@bmwealth.co.in
              </p>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
              Resolution Timeline
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Acknowledgment:</strong> Within 3 working days of receiving the complaint
              </li>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Initial Response:</strong> Within 7 working days with status update
              </li>
              <li style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
                <strong>Resolution:</strong> Within 30 days from the date of receipt
              </li>
            </ul>
          </section>

          {/* Regulatory Disclosures */}
          <section style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '24px',
              }}
            >
              Regulatory Disclosures & Licenses
            </h2>

            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
              Insurance Advisory Services
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
              <strong>IRDAI License Number:</strong> 277925
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '24px', textAlign: 'justify' }}>
              <strong>Service Type:</strong> Insurance Advisory
            </p>

            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
              Mutual Fund Distribution Services
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px', textAlign: 'justify' }}>
              <strong>AMFI Registration:</strong> ARN 90008
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '24px', textAlign: 'justify' }}>
              <strong>Validity:</strong> Perpetual (subject to regulatory compliance)
            </p>

            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#B8860B', marginBottom: '16px' }}>
              Registered Office
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '8px', textAlign: 'justify' }}>
              66, Vinod Villa Bldg., 1st floor office no. 108
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '8px', textAlign: 'justify' }}>
              Cavel Cross Lane 3, Kalbadevi
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '24px', textAlign: 'justify' }}>
              Mumbai - 400002, Maharashtra, India
            </p>
          </section>

          {/* Compliance Statement */}
          <section style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '24px',
              }}
            >
              Compliance Statement
            </h2>
            <div
              style={{
                background: 'rgba(184, 134, 11, 0.1)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(184, 134, 11, 0.3)',
              }}
            >
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#e5e5e5', margin: '0', textAlign: 'justify' }}>
                BM Wealth is an <strong>IRDAI Licensed Insurance Advisor (License No. 277925)</strong> and <strong>AMFI Registered Mutual Fund Distributor (ARN 90008)</strong>. We follow SEBI guidelines for mutual fund distribution but are <strong>NOT SEBI-registered Investment Advisors</strong>. Our PMS and FD services are advisory in nature and provided through partnerships with SEBI-registered institutions.
              </p>
            </div>
          </section>

          {/* Investment Disclaimer */}
          <section>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '24px',
              }}
            >
              Investment Disclaimer
            </h2>
            <div
              style={{
                background: 'rgba(184, 134, 11, 0.1)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(184, 134, 11, 0.3)',
              }}
            >
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#B8860B', fontWeight: '600', margin: '0', textAlign: 'justify' }}>
                Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 32px !important;
          }
          h2 {
            font-size: 24px !important;
          }
          h3 {
            font-size: 20px !important;
          }
          h4 {
            font-size: 18px !important;
          }
        }
      `}</style>
    </>
  );
}

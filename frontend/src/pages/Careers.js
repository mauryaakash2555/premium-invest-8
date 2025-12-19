import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      <Helmet>
        <title>Careers at BM Wealth Mumbai | Financial Advisor Jobs | AMFI Certification</title>
        <meta name="description" content="Join BM Wealth's growing team in Mumbai. Career opportunities in financial advisory, insurance, wealth management. AMFI certified advisors welcome." />
        <meta name="keywords" content="financial advisor jobs mumbai, career in finance mumbai, AMFI certification jobs, financial planning careers" />
        <link rel="canonical" href="https://www.bmwealth.co.in/careers" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/careers" />
        <meta property="og:title" content="Careers at BM Wealth Mumbai | Financial Advisor Jobs" />
        <meta property="og:description" content="Join BM Wealth's growing team in Mumbai. Career opportunities in financial advisory and wealth management." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/careers" />
        <meta name="twitter:title" content="Careers at BM Wealth Mumbai" />
        <meta name="twitter:description" content="Join our team of financial professionals. AMFI certified advisors welcome." />
        <meta name="twitter:image" content="https://www.bmwealth.co.in/logo.webp" />
      </Helmet>

      {/* Hero Section with Background */}
      <section 
        className="page-hero-responsive"
        style={{
          position: 'relative',
          minHeight: '65vh',
          maxHeight: '65vh',
          height: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          paddingTop: '100px',
          paddingBottom: '60px',
          overflow: 'hidden'
        }}>
        {/* Background Image - Mumbai Professional Skyline */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2,
          zIndex: 0
        }} />
        
        {/* Content */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 
            className="page-hero-heading-responsive"
            style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(28px, 4.5vw, 56px)',
            fontWeight: '300',
            color: '#C0A062',
            marginBottom: '24px',
            lineHeight: '1.2',
            letterSpacing: '3px',
            opacity: 0.95,
            textShadow: '0 3px 12px rgba(0,0,0,0.4)',
          }}>
            Join Our Team
          </h1>
          <p 
            className="page-hero-subtitle-responsive"
            style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: '#C0A062',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Build your career with Mumbai's premier financial advisory firm
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Why Choose a Career with BM Wealth?
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            At BM Wealth, we're building more than a business – we're creating a mission-driven organization transforming financial advisory in Mumbai. Our vision is becoming the most trusted financial partner for Mumbai's middle-class and upper-middle-class families, helping them achieve financial security and build lasting wealth.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Financial advisory offers unique career benefits – intellectual challenge (finance, psychology, strategy), relationship depth (becoming trusted advisor to families across generations), meaningful impact (transforming clients' financial futures), unlimited earning potential, and professional growth in constantly evolving field.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Current Job Openings
          </h2>
          
          <div style={{ marginBottom: '40px', padding: '30px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '8px', border: '1px solid rgba(192, 160, 98, 0.5)' }}>
            <h3 style={{ fontSize: '26px', color: '#C0A062', marginBottom: '16px', fontWeight: '600' }}>
              Financial Advisor / Wealth Advisor
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Experience:</strong> 1-5 years in financial services, mutual fund distribution, insurance advisory, or wealth management
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Qualifications:</strong> Bachelor's degree (finance, commerce, economics preferred). AMFI/NISM certifications required or willingness to obtain. CFP certification preferred.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Responsibilities:</strong> Client relationship management, financial planning and goal assessment, mutual fund and insurance recommendations, portfolio monitoring and reviews, business development and client acquisition.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Compensation:</strong> Fixed salary (xx lakhs annually depending on experience) plus performance-based incentives (can exceed fixed salary for top performers). Total compensation range: xx lakhs annually.
            </p>
          </div>

          <div style={{ marginBottom: '40px', padding: '30px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '8px', border: '1px solid rgba(192, 160, 98, 0.5)' }}>
            <h3 style={{ fontSize: '26px', color: '#C0A062', marginBottom: '16px', fontWeight: '600' }}>
              Client Relationship Manager
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Experience:</strong> 2-4 years in client servicing, financial services, banking, or customer relationship management
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Responsibilities:</strong> Managing existing client relationships, addressing client queries and concerns, coordinating portfolio reviews and reporting, facilitating transactions and documentation, identifying cross-selling opportunities, maintaining high client satisfaction and retention.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Compensation:</strong> xx lakhs annually plus performance bonuses. Total compensation: xx lakhs annually.
            </p>
          </div>

          <div style={{ marginBottom: '40px', padding: '30px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '8px', border: '1px solid rgba(192, 160, 98, 0.5)' }}>
            <h3 style={{ fontSize: '26px', color: '#C0A062', marginBottom: '16px', fontWeight: '600' }}>
              Insurance Consultant
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Experience:</strong> 1-3 years in insurance sales or advisory. IRDAI certification mandatory.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Responsibilities:</strong> Conducting insurance needs analysis, recommending appropriate life and health insurance products, facilitating policy issuance and documentation, providing claim settlement assistance, maintaining client relationships for policy renewals and additions.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Compensation:</strong> xx lakhs fixed plus significant commission potential. Total compensation: xx lakhs annually based on business generated.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Career Growth and Development
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            BM Wealth is committed to employee growth and development. We provide clear career progression paths from Associate Financial Advisor to Senior Financial Advisor to Team Lead to Branch Manager and beyond. Our training and development program includes initial comprehensive onboarding, ongoing product and market knowledge training, sales and client communication skills development, mentorship and shadowing programs, and financial support for industry certifications.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Employee Benefits and Culture
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            We offer competitive benefits package including health insurance coverage for employees and dependents, performance-based annual bonuses, paid time off (casual leave, sick leave, annual leave), and professional certification support. Our company culture values client-first approach, integrity in all dealings, continuous learning and improvement, collaboration and knowledge sharing, respect for work-life balance, transparency and open communication, and celebration of achievements.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Application Process
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Our hiring process is thorough but straightforward: Submit your resume and cover letter to careers@bmwealth.co.in explaining your interest in financial advisory and fit with BM Wealth values. Selected candidates invited for initial phone screening to discuss background, experience, and career goals. Qualified candidates invited for in-person interview with our leadership team to assess technical knowledge, client-facing skills, and cultural fit. Final candidates may complete brief case study or assessment. Reference checks conducted for final candidates. Selected candidates receive offer letter with compensation, benefits, and joining details.
          </p>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <a href="mailto:mauryaakash2555@gmail.com" style={{
              backgroundColor: '#DAA520',
              color: '#000',
              padding: '16px 36px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '17px',
              display: 'inline-block'
            }}>
              Apply Now - Email Your Resume
            </a>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Internship Opportunities
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            We offer internship programs for students pursuing finance, commerce, economics, or MBA degrees. Our 2-3 month internships provide real-world exposure to financial advisory, mutual fund distribution, and client relationship management. Interns work closely with experienced advisors, attend client meetings, assist with research and analysis, and participate in training sessions. Outstanding interns may receive full-time employment offers upon graduation. Interested students should email their resume and college details to careers@bmwealth.co.in.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Careers;
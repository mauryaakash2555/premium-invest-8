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
      </Helmet>

      <section style={{
        position: 'relative',
        backgroundColor: '#000000',
        padding: '120px 0 80px 0',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '52px',
            fontWeight: '700',
            color: '#DAA520',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Career Opportunities at BM Wealth Mumbai
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Join our team of financial professionals making real impact on Mumbai families' financial futures
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Why Choose a Career with BM Wealth?
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            At BM Wealth, we're building more than a business – we're creating a mission-driven organization transforming financial advisory in Mumbai. Our vision is becoming the most trusted financial advisory firm in Mumbai, known for integrity, expertise, and genuine client-centric service. We believe financial advisory should be about improving clients' lives, not selling products. This philosophy attracts passionate professionals who want meaningful careers helping families achieve financial security and prosperity. Our team culture emphasizes collaboration, continuous learning, ethical conduct, client-first mindset, and work-life balance. We're small enough that every team member makes visible impact yet growing fast enough to provide abundant career advancement opportunities.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Financial advisory offers unique career benefits – intellectual challenge (finance, psychology, strategy), relationship depth (becoming trusted advisor to families across generations), income potential (performance-based compensation rewarding excellence), flexibility (substantial autonomy after proving competence), and social impact (genuinely improving people's financial well-being). Mumbai, as India's financial capital, provides unparalleled opportunity for finance professionals. The city hosts millions of affluent families, thriving business community, sophisticated investor base, and concentration of financial institutions. Building financial advisory career in Mumbai means access to large, growing market with increasing financial sophistication. Our Kalbadevi location puts us heart of Mumbai's business district with easy access to clients across South Mumbai, Central Mumbai, and Western suburbs.
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
              <strong>Responsibilities:</strong> Client relationship management, financial planning and goal assessment, mutual fund and insurance recommendations, portfolio monitoring and reviews, business development and client acquisition, staying updated on financial markets and products.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Compensation:</strong> Fixed salary (₹3-6 lakhs annually depending on experience) plus performance-based incentives (can exceed fixed salary for top performers). Total compensation range: ₹4-12+ lakhs annually.
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
              <strong>Compensation:</strong> ₹3.5-5 lakhs annually plus performance bonuses. Total compensation: ₹4-7 lakhs annually.
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
              <strong>Compensation:</strong> ₹2.5-4 lakhs fixed plus significant commission potential. Total compensation: ₹3.5-8 lakhs annually based on business generated.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Career Growth and Development
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            BM Wealth is committed to employee growth and development. We provide clear career progression paths from Associate Financial Advisor to Senior Financial Advisor to Team Lead to Branch Manager to Regional Head. Promotion decisions are merit-based, considering performance metrics, client satisfaction, professional certifications, leadership potential, and cultural alignment. We invest heavily in employee development through regular training programs on products, markets, financial planning, sales skills, and compliance. We sponsor professional certifications (CFP, CFA, NISM, IRDAI examinations) covering examination fees and providing study support. Team members attend industry conferences, workshops, and networking events staying current with market developments. Senior team members mentor junior advisors, providing guidance, answering questions, and sharing experience-based insights accelerating learning curves. Our monthly review sessions provide constructive feedback helping team members improve consistently.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Employee Benefits and Culture
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            We offer competitive benefits package including health insurance coverage for employees and dependents, performance-based annual bonuses, paid time off (casual leave, sick leave, annual leave), flexible working arrangements (work from home options post-probation), professional development budget for certifications and training, recognition and rewards for outstanding performance, and team outings and celebrations fostering camaraderie. Our culture emphasizes integrity above all – we never compromise ethics for short-term gains. Client-centricity guides every decision; we succeed when clients succeed. Collaboration over competition – team members support each other rather than competing internally. We maintain work-life balance recognizing that burned-out advisors can't serve clients well. We celebrate diversity welcoming team members from different backgrounds, experiences, and perspectives. We operate transparently with open communication between leadership and team members. Mumbai's vibrant culture enhances our work experience – team lunches at local restaurants, occasional evening gatherings at cafes or lounges, celebration of festivals reflecting Mumbai's diversity, and participation in city's financial community events.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Application Process
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Our hiring process is thorough but straightforward: Submit your resume and cover letter to careers@bmwealth.co.in explaining your interest in financial advisory and fit with BM Wealth. Initial phone screening (15-20 minutes) discussing your background, career goals, and basic qualification alignment. First round interview (45-60 minutes) with senior team members covering technical knowledge, communication skills, and cultural fit. Second round interview with founders assessing strategic thinking, client relationship skills, and long-term potential. Reference checks with previous employers or professional references. Offer and negotiation for successful candidates, followed by onboarding including regulatory training, product training, systems and processes, client management protocols, and shadowing experienced advisors. Typical hiring timeline is 2-3 weeks from application to offer for strong candidates.
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
            We offer internship programs for students pursuing finance, commerce, economics, or MBA degrees. Our 2-3 month internships provide real-world exposure to financial advisory, mutual fund distribution, insurance planning, client interaction, and financial markets. Interns work alongside experienced advisors on actual client assignments (under supervision), conduct research on financial products and market trends, assist with portfolio analysis and reporting, participate in client meetings and presentations, and complete structured learning modules covering financial planning fundamentals. Internships are paid (stipend basis) and provide completion certificates. Outstanding interns receive pre-placement offers for full-time positions upon graduation. For Mumbai students interested in finance careers, our internships provide invaluable practical experience bridging classroom theory and real-world application. Apply by sending resume and cover letter to careers@bmwealth.co.in with subject "Internship Application - [Your Name]".
          </p>
        </section>

      </div>
    </div>
  );
};

export default Careers;




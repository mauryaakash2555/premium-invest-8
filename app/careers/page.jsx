/**
 * FILE: app\careers\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - next/link
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

import React, { useEffect } from 'react';
import Link from 'next/link';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });
const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>

      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      

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
            color: 'var(--lux-accent)',
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
            color: 'var(--lux-accent)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Build your career in wealth distribution and insurance support
          </p>
        </div>
      </section>

      <div className="bp-body" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--lux-accent)', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Why Choose a Career with BM Wealth?
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            At BM Wealth, we focus on disclosure-led, compliance-first processes for wealth distribution and insurance support. We value integrity, learning, and clear communication. Our team culture emphasizes collaboration, ethical conduct, and long-term trust.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Client-facing distribution roles offer intellectual challenge (finance, behavior, and decision-making), relationship depth (long-term client support), structured learning (regulations, products, disclosures), and meaningful impact through clear communication. Mumbai, as India's financial capital, offers strong exposure to a wide range of client needs and financial institutions. Our Kalbadevi location is well-connected across South Mumbai, Central Mumbai, and the Western suburbs.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--lux-accent)', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Current Job Openings
          </h2>
          
          <div style={{ marginBottom: '40px', padding: '30px', background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)', borderRadius: '8px', border: '1px solid color-mix(in oklab, var(--lux-accent) 50%, transparent)' }}>
            <h3 style={{ fontSize: '26px', color: 'var(--lux-accent)', marginBottom: '16px', fontWeight: '600' }}>
              Client Relationship Associate (Wealth Distribution)
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Experience:</strong> 1-5 years in financial services, mutual fund distribution, insurance distribution, or client servicing
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Qualifications:</strong> Bachelor's degree (finance, commerce, economics preferred). AMFI/NISM certifications required or willingness to obtain. CFP certification preferred.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Responsibilities:</strong> Client relationship management, needs understanding, product information and disclosures, documentation support, portfolio review coordination, and staying updated on regulations and products.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Compensation:</strong> Fixed salary (₹XX lakhs annually depending on experience) plus performance-based incentives (can exceed fixed salary for top performers). Total compensation range: ₹XX lakhs annually.
            </p>
          </div>

          <div style={{ marginBottom: '40px', padding: '30px', background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)', borderRadius: '8px', border: '1px solid color-mix(in oklab, var(--lux-accent) 50%, transparent)' }}>
            <h3 style={{ fontSize: '26px', color: 'var(--lux-accent)', marginBottom: '16px', fontWeight: '600' }}>
              Client Relationship Manager
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Experience:</strong> 2-4 years in client servicing, financial services, banking, or customer relationship management
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Responsibilities:</strong> Managing existing client relationships, addressing client queries and concerns, coordinating portfolio reviews and reporting, facilitating transactions and documentation, identifying cross-selling opportunities, maintaining high client satisfaction and retention.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Compensation:</strong> ₹XX lakhs annually plus performance bonuses. Total compensation: ₹XX lakhs annually.
            </p>
          </div>

          <div style={{ marginBottom: '40px', padding: '30px', background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)', borderRadius: '8px', border: '1px solid color-mix(in oklab, var(--lux-accent) 50%, transparent)' }}>
            <h3 style={{ fontSize: '26px', color: 'var(--lux-accent)', marginBottom: '16px', fontWeight: '600' }}>
              Insurance Consultant
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Experience:</strong> 1-3 years in insurance sales or advisory. IRDAI certification mandatory.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Responsibilities:</strong> Conducting insurance needs analysis, recommending appropriate life and health insurance products, facilitating policy issuance and documentation, providing claim settlement assistance, maintaining client relationships for policy renewals and additions.
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '16px' }}>
              <strong>Compensation:</strong> ₹XX lakhs fixed plus significant commission potential. Total compensation: ₹XX lakhs annually based on business generated.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--lux-accent)', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Career Growth and Development
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            BM Wealth is committed to employee growth and development. We provide clear career progression paths from Associate Financial Advisor to Senior Financial Advisor to Team Lead to Branch Manager to Regional Head. Promotion decisions are merit-based, considering performance metrics, client satisfaction, professional certifications, leadership potential, and cultural alignment. We invest heavily in employee development through regular training programs on products, markets, financial planning, sales skills, and compliance. We sponsor professional certifications (CFP, CFA, NISM, IRDAI examinations) covering examination fees and providing study support. Team members attend industry conferences, workshops, and networking events staying current with market developments. Senior team members mentor junior advisors, providing guidance, answering questions, and sharing experience-based insights accelerating learning curves. Our monthly review sessions provide constructive feedback helping team members improve consistently.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--lux-accent)', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Employee Benefits and Culture
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            We offer competitive benefits package including health insurance coverage for employees and dependents, performance-based annual bonuses, paid time off (casual leave, sick leave, annual leave), flexible working arrangements (work from home options post-probation), professional development budget for certifications and training, recognition and rewards for outstanding performance, and team outings and celebrations fostering camaraderie. Our culture emphasizes integrity above all – we never compromise ethics for short-term gains. Client-centricity guides every decision; we succeed when clients succeed. Collaboration over competition – team members support each other rather than competing internally. We maintain work-life balance recognizing that burned-out advisors can't serve clients well. We celebrate diversity welcoming team members from different backgrounds, experiences, and perspectives. We operate transparently with open communication between leadership and team members. Mumbai's vibrant culture enhances our work experience – team lunches at local restaurants, occasional evening gatherings at cafes or lounges, celebration of festivals reflecting Mumbai's diversity, and participation in city's financial community events.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--lux-accent)', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Application Process
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Our hiring process is thorough but straightforward: Submit your resume and cover letter to careers@bmwealth.co.in explaining your interest in financial advisory and fit with BM Wealth. Initial phone screening (15-20 minutes) discussing your background, career goals, and basic qualification alignment. First round interview (45-60 minutes) with senior team members covering technical knowledge, communication skills, and cultural fit. Second round interview with founders assessing strategic thinking, client relationship skills, and long-term potential. Reference checks with previous employers or professional references. Offer and negotiation for successful candidates, followed by onboarding including regulatory training, product training, systems and processes, client management protocols, and shadowing experienced advisors. Typical hiring timeline is 2-3 weeks from application to offer for strong candidates.
          </p>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <a href="mailto:mauryaakash2555@gmail.com" style={{
              backgroundColor: 'var(--lux-accent)',
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
          <h2 style={{ fontSize: '36px', color: 'var(--lux-accent)', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
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




/**
 * FILE: app\about-us\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - lucide-react
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

import { Users, Award, Target, Heart } from 'lucide-react';
import { useEffect } from 'react';
const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      
      {/* Hero Section */}
      <section
        className="page-hero-responsive"
        style={{
          minHeight: '65vh',
          maxHeight: '65vh',
          height: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
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
            data-testid="about-heading"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
            }}
          >
            About Us
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
            Mumbai-based wealth distribution and insurance support since 1989
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '24px',
                color: '#DAA520',
              }}
            >
              Our Story
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              Under the distinguished leadership of <strong style={{ color: '#DAA520' }}>Brahmdeo Maurya</strong>, BM Wealth 
              has emerged as a trusted name in Mumbai's financial advisory landscape. Founded with a vision to democratize 
              sophisticated wealth management, we serve over 500 Mumbai investors ranging from young professionals taking 
              their first steps in SIP investing to established entrepreneurs managing multi-crore portfolios.
            </p>

            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              BM Wealth began in 1989, with a long-term commitment to client-first financial education, disciplined processes,
              and transparent service.
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              What began as a mission to help Mumbai's ambitious professionals navigate the complex world of mutual funds 
              has evolved into a wealth distribution and insurance support firm. We hold AMFI Registration (ARN 90008) for mutual 
              fund distribution and IRDAI License (277925) for insurance distribution, with a focus on disclosure-led processes.
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              Our practice is built on clear communication, documented disclosures, and a process-first approach. We aim to help you 
              understand options, costs, and risks before you decide on the next step.
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
              }}
            >
              Whether you're a 25-year-old starting your career in Mumbai's corporate sector, a mid-career professional 
              balancing EMIs with investments, or a business owner planning succession and legacy wealth transfer, we bring 
              practical tools and premium support to help you navigate decisions more confidently. Our mission is making 
              financial concepts accessible, understandable, and actionable.
            </p>
          </div>

          <div
            className="glass-effect"
            style={{
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #DAA520 0%, #C0A062 100%)',
                margin: '0 auto 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                color: '#000000',
                fontWeight: 700,
              }}
            >
              BM
            </div>
            <h3 style={{ fontSize: '24px', color: '#DAA520', marginBottom: '12px' }}>
              Brahmdeo Maurya
            </h3>
            <p style={{ fontSize: '16px', color: '#C0A062', marginBottom: '16px' }}>
              Founder & Principal Advisor
            </p>
            <div style={{ 
              fontSize: '15px', 
              color: '#B8B8B8', 
              lineHeight: '1.7',
              textAlign: 'left',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <p style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#DAA520' }}>AMFI Registered Mutual Fund Distributor</strong><br/>
                ARN 90008
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#DAA520' }}>IRDAI Licensed Insurance Advisor</strong><br/>
                License No. 277925
              </p>
              <p style={{ marginBottom: '0' }}>
                With extensive experience in Mumbai's financial markets, Brahmdeo specializes in helping 
                professionals and families build sustainable wealth. His approach combines deep market knowledge 
                with practical financial planning, focusing on goal-based investing, tax optimization, and risk 
                management. Known for transparency and client education, he has guided 500+ Mumbai investors 
                through market cycles, achieving consistent portfolio growth while maintaining strict regulatory 
                compliance.
              </p>
              
              <div style={{ 
                marginTop: '20px', 
                paddingTop: '16px', 
                borderTop: '1px solid rgba(218, 165, 32, 0.2)' 
              }}>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
                  <strong style={{ color: '#C0A062' }}>Specializations:</strong>
                </p>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  fontSize: '14px',
                  color: '#B8B8B8'
                }}>
                  <li style={{ marginBottom: '4px' }}>• Retirement Planning & SIP Strategies</li>
                  <li style={{ marginBottom: '4px' }}>• Portfolio Diversification & Risk Management</li>
                  <li style={{ marginBottom: '4px' }}>• Tax-Efficient Investment Structuring</li>
                  <li>• Goal-Based Planning Framework</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '16px',
              }}
              className="golden-gradient"
            >
              Our Values
            </h2>
            <p style={{ fontSize: '18px', color: '#C0A062' }}>
              The principles that guide everything we do
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '40px',
            }}
          >
            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <Users size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Client-Centric
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Your financial goals are our top priority. We establish enduring relationships based
                on confidence and transparency.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <Award size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Exceptional Standards
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                We maintain high standards in compliance, disclosure, and documentation.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <Target size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Education-Focused
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                We focus on clarity: helping you understand choices, risks, and trade-offs before acting.
              </p>
            </div>

            <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <Heart size={35} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Integrity
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Honesty and ethical conduct are at the core of every recommendation and
                interaction with our clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Info */}
      <section className="section-container">
        <div
          className="glass-effect"
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            background: 'rgba(218, 165, 32, 0.05)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 40px)',
              marginBottom: '20px',
              color: '#DAA520',
            }}
          >
            IRDAI Licensed | AMFI Registered Wealth Distribution
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#CCCCCC',
              marginBottom: '20px',
              maxWidth: '700px',
              margin: '0 auto 20px',
              lineHeight: 1.6,
            }}
          >
            Fully compliant with IRDAI (Insurance) and AMFI (Mutual Funds) regulations, 
            ensuring the highest standards of wealth distribution and investor protection.
          </p>
          <div className="sebi-disclaimer" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <strong>Regulatory Compliance:</strong> All our services are provided in strict
            accordance with IRDAI and AMFI guidelines. We are committed to transparency, ethical
            practices, and protecting investor interests. Investments are subject to market
            risks.
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

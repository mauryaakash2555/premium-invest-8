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
            Empowering Mumbai investors with exceptional wealth architecture since inception
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
              orchestrates comprehensive wealth strategies for discerning Mumbai investors.
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              With decades of combined expertise in financial markets, mutual funds, portfolio
              management, and portfolio curation, we have established a distinguished reputation for delivering
              personalized wealth management strategies that align with our clients' unique
              financial goals.
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                lineHeight: 1.8,
              }}
            >
              Our mission is to make sophisticated wealth strategies accessible to every
              investor, whether you're commencing your investment journey or looking to
              enhance your existing portfolio.
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
            <p style={{ fontSize: '16px', color: '#C0A062', marginBottom: '8px' }}>
              Principal
            </p>
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
                We maintain the premier standards in wealth architecture, continuously enhancing
                our expertise and methodologies.
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
                Results-Driven
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                We focus on delivering measurable outcomes and empowering you to achieve your wealth
                creation objectives.
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

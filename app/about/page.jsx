"use client";

import { Users, Award, Target, Heart } from 'lucide-react';
import { useEffect } from 'react';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
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
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
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
            Empowering Mumbai investors with exceptional financial solutions since inception
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: '24px', color: '#DAA520' }}>
              Our Story
            </h2>
            <p style={{ fontSize: '18px', color: '#CCCCCC', lineHeight: 1.8, marginBottom: '20px' }}>
              Under the distinguished leadership of <strong style={{ color: '#DAA520' }}>Brahmdeo Maurya</strong>, BM Wealth 
              orchestrates comprehensive wealth strategies for discerning Mumbai investors.
            </p>
            <p style={{ fontSize: '18px', color: '#CCCCCC', lineHeight: 1.8, marginBottom: '20px' }}>
              With decades of combined expertise in financial markets, mutual funds, portfolio
              management, and investment advisory, we have established a distinguished reputation.
            </p>
          </div>

          <div className="glass-effect" style={{ padding: '40px', textAlign: 'center' }}>
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #DAA520 0%, #C0A062 100%)',
                margin: '0 auto 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                color: '#000000',
                fontWeight: 700,
              }}
            >
              BM
            </div>
            <h3 style={{ fontSize: '24px', color: '#DAA520', marginBottom: '12px' }}>
              Brahmdeo Maurya
            </h3>
            <p style={{ fontSize: '16px', color: '#C0A062' }}>Founder</p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section style={{ background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)', padding: '80px 20px' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="golden-gradient" style={{ fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: '16px' }}>
              Our Values
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            {[
              { icon: Users, title: 'Client-Centric', desc: 'Your financial goals are our top priority.' },
              { icon: Award, title: 'Exceptional Standards', desc: 'We maintain the premier standards in financial advisory.' },
              { icon: Target, title: 'Results-Driven', desc: 'We focus on delivering measurable outcomes.' },
              { icon: Heart, title: 'Integrity', desc: 'Honesty and ethical conduct at every step.' },
            ].map((value, i) => (
              <div key={i} className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{
                  width: '70px', height: '70px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: '#DAA520',
                }}>
                  <value.icon size={35} />
                </div>
                <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>{value.title}</h3>
                <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Info */}
      <section className="section-container">
        <div className="glass-effect" style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(218, 165, 32, 0.05)' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', marginBottom: '20px', color: '#DAA520' }}>
            IRDAI Licensed | AMFI Registered
          </h2>
          <p style={{ fontSize: '18px', color: '#CCCCCC', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            Fully compliant with IRDAI and AMFI regulations, ensuring the highest standards of financial advisory.
          </p>
        </div>
      </section>
    </div>
  );
}




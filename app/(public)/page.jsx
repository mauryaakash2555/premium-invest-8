/**
 * FILE: app\(public)\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - next/link
 * - next/image
 * - lucide-react
 * - react
 * - framer-motion
 * - @/data/staticBlogData
 * - @/components/user/PremiumMarketTicker
 * - @/components/user/MarketMoodStrip
 * - @/components/user/AnimatedClouds
 * - @/components/user/ServiceCard
 * - @/components/user/BlogCard
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

import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Shield, PieChart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { staticBlogPost } from '@/data/staticBlogData';
import { getServicesForHome } from '@/data/servicesCatalog';
// 🔒 CORE: Using isolated market ticker (never breaks)
import PremiumMarketTicker from '@/core/marketTicker';
import MarketMoodStrip from '@/components/user/MarketMoodStrip';

import AnimatedClouds from '@/components/user/AnimatedClouds';
import ServiceCard from '@/components/user/ServiceCard';
import BlogCard from '@/components/user/BlogCard';

// --- LUXURY COMPONENTS KEPT ---

const GoldenHorizonSweep = () => (
  <motion.div
    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
  >
    <div className="h-full w-[40%] bg-gradient-to-r from-transparent via-[#C0A062]/10 to-transparent blur-[120px]" />
  </motion.div>
);

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rainEnabled, setRainEnabled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleMouseMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const services = getServicesForHome();

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-gradient hero-section-responsive"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '85vh',
          maxHeight: '85vh',
          height: '85vh',
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
            // restore darker, premium mood
            opacity: 0.55,
            filter: 'brightness(0.80) saturate(1.05)',
            zIndex: 2,
          }}
        />

        {/* Animated Clouds + occasional lightning (rain off by default) */}
        <AnimatedClouds enableRain={rainEnabled} />

        {/* 1. Golden Horizon Sweep Kept */}
        <GoldenHorizonSweep />

        {/* Premium Gradient Overlay - Desktop & Mobile */}
        <div
          className="hero-gradient-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.58) 100%)',
            zIndex: 2,
          }}
        />

        <div
          className="section-container fade-in hero-content-responsive"
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 3,
            paddingTop: 'clamp(20px, 7vh, 180px)',
          }}
        >
          {/* 7. Gold-Leaf Typography Kept */}
          <motion.h1
            className="hero-subtitle-responsive"
            style={{
              fontSize: 'clamp(18px, 2.1vw, 28px)',
              color: '#C0A062',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '2.2px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              backgroundImage: `linear-gradient(135deg, #C0A062 ${mousePos.x - 20}%, #FFF ${mousePos.x}%, #C0A062 ${mousePos.x + 20}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
            }}
          >
            BM WEALTH - DISTINGUISHED WEALTH ARCHITECTURE
          </motion.h1>
          <p
            className="hero-description-responsive"
            style={{
              fontSize: 'clamp(13px, 1.5vw, 16px)',
              color: '#C0A062',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px',
              lineHeight: 1.5,
              fontWeight: 300,
              letterSpacing: '0.5px',
              opacity: 0.85,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            Empowering Mumbai's elite investors with bespoke wealth strategies
          </p>

          {/* Mobile-only minimal CTA (keeps background fully visible) */}
          <div
            className="md:hidden flex justify-center"
            style={{
              margin: '0 auto 48px',
              padding: '0 16px',
            }}
          >
            <Link
              href="/tools"
              className="mobile-cta-lux"
              style={{
                fontSize: '11px',
                lineHeight: 1.2,
                textDecoration: 'none',
                letterSpacing: '0.9px',
                textTransform: 'uppercase',
              }}
            >
              Access Your Complimentary Wealth Blueprint
            </Link>
          </div>

          <div
            className="hero-cta-buttons-responsive hide-cta-on-mobile"
            style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '60px',
            }}
          >
            <Link href="/tools" className="btn-primary">
              Access Your Complimentary Wealth Blueprint
            </Link>
            <Link href="/services" className="btn-secondary">
              Explore Services {"\u2192"}
            </Link>
          </div>
        </div>

        {/* LIVE MOOD (restored) - sits just above ticker */}
        <div className="absolute bottom-[46px] left-0 w-full z-50">
          <MarketMoodStrip onToggleRain={() => setRainEnabled(v => !v)} />
        </div>

        {/* PREMIUM LIVE MARKET TICKER (inside hero, same position as your reference) */}
        <div className="absolute bottom-0 left-0 w-full z-50">
          <PremiumMarketTicker />
        </div>
      </section>

      {/* THREE PREMIUM LIVE CARDS SECTION - NEW */}

      {/* Services Overview Section */}
      <section className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              marginBottom: '16px',
              color: '#FFFFFF',
            }}
          >
            Our Services
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.78)',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Premium services designed for clarity and confidence
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
          }}
        >
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}

        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link href="/services" className="btn-primary">
            View All Services
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '16px',
                color: '#FFFFFF',
              }}
            >
              Why Choose BM Wealth?
            </h2>
            <div
              className="glass-effect"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(214, 179, 106, 0.22)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                PMS Certification No.
              </span>
              <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em' }}>
                2430447816
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '22px',
            }}
          >
            <div
              className="glass-effect gold-grain-texture premium-hover-glow bm-why-card"
              style={{
                textAlign: 'left',
                padding: '26px',
                border: '1px solid rgba(214, 179, 106, 0.16)',
                background:
                  'radial-gradient(900px 260px at 10% 0%, rgba(214, 179, 106, 0.10), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                PMS-First
              </div>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '10px' }}>
                Credential-led portfolio stewardship
              </h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: '14px' }}>
                We lead with Portfolio Management Services (PMS) discipline — structured decisions, documented reviews, and clear accountability.
              </p>
            </div>

            <div
              className="glass-effect gold-grain-texture premium-hover-glow bm-why-card"
              style={{
                textAlign: 'left',
                padding: '26px',
                border: '1px solid rgba(255,255,255,0.10)',
                background:
                  'radial-gradient(760px 220px at 90% 10%, rgba(255,255,255,0.07), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Execution
              </div>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '10px' }}>
                Implementation over opinions
              </h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
                Decisions are only valuable when executed cleanly — we focus on follow-through, monitoring, and a real review cadence.
              </p>
            </div>

            <div
              className="glass-effect gold-grain-texture premium-hover-glow bm-why-card"
              style={{
                textAlign: 'left',
                padding: '26px',
                border: '1px solid rgba(255,255,255,0.10)',
                background:
                  'radial-gradient(760px 220px at 10% 100%, rgba(214, 179, 106, 0.08), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Planning
              </div>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '10px' }}>
                Tailored Solutions
              </h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
                Personalized investment strategies aligned with your financial goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Insights Section */}
      <section className="section-container" style={{ padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              marginBottom: '16px',
              color: '#FFFFFF',
            }}
          >
            Latest Insights
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.78)',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Expert financial wisdom and real-world investment stories
          </p>
        </div>

        <BlogCard post={staticBlogPost} variant="homeMutualStyle" />


        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/blog" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All Insights
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container">
        <div
          className="ultra-luxury-glass gold-grain-texture premium-hover-glow bm-consult"
          style={{
            padding: '70px 40px',
            textAlign: 'center',
            borderRadius: '18px',
            border: '1px solid rgba(214, 179, 106, 0.16)',
            boxShadow: '0 22px 70px rgba(0,0,0,0.45), 0 0 42px rgba(214,179,106,0.08)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 40px)',
              marginBottom: '18px',
              color: '#FFFFFF',
            }}
          >
            Private Consultation
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: 'rgba(255,255,255,0.78)',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 30px',
            }}
          >
            Speak with BM Wealth. We’ll review your goals and next steps.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              WhatsApp Concierge
            </a>
            <Link href="/contact" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Contact Form
            </Link>
          </div>
        </div>
      </section>

      {/* INSIGHTS PREVIEW - NEW */}

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee 30s linear infinite;
        }

        @keyframes bm-sheen {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        .bm-why-card {
          position: relative;
          overflow: hidden;
        }
        .bm-why-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: translateX(-120%);
        }
        .bm-why-card:hover::after {
          opacity: 1;
          animation: bm-sheen 1.15s ease;
        }
        .bm-consult {
          position: relative;
          overflow: hidden;
        }
        .bm-consult::before {
          content: "";
          position: absolute;
          inset: -2px;
          pointer-events: none;
          background:
            radial-gradient(900px 240px at 10% 0%, rgba(214,179,106,0.12), transparent 60%),
            radial-gradient(760px 240px at 90% 100%, rgba(255,255,255,0.06), transparent 60%);
          opacity: .95;
        }
      `}</style>
    </div>
  );
}









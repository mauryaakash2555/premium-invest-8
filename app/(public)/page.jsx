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
import { TrendingUp, Shield, PieChart, CreditCard, DollarSign, Repeat, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { staticBlogPost } from '@/data/staticBlogData';
import PremiumMarketTicker from '@/components/user/PremiumMarketTicker';
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

  const services = [
    {
      icon: <PieChart size={40} />,
      title: 'Mutual Funds',
      description: 'Mutual fund selection support, execution, and disciplined review cadence.',
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/mutual-funds',
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Portfolio Management',
      description: 'Portfolio planning, allocation frameworks, and periodic review.',
      image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/portfolio-management',
    },
    {
      icon: <CreditCard size={40} />,
      title: 'Trading Services',
      description: 'Demat onboarding, platform selection support, and execution framework.',
      image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/trading-services',
    },
    {
      icon: <Shield size={40} />,
      title: 'Insurance',
      description: 'Insurance comparisons, documentation support, and claims-ready guidance.',
      image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
      link: '/insurance',
    },
    {
      icon: <DollarSign size={40} />,
      title: 'Fixed Deposits',
      description: 'Fixed deposit comparisons across tenure, payout options, and liquidity.',
      image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
      link: '/fixed-deposits',
    },
    {
      icon: <Repeat size={40} />,
      title: 'SIP',
      description: 'Systematic Investment Plans for disciplined and goal-oriented investing.',
      image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
      link: '/sip',
    },
  ];

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
            background: 'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.70) 100%)',
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
              fontSize: 'clamp(20px, 2.5vw, 32px)',
              color: '#C0A062',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
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
            }}
            className="golden-gradient"
          >
            Our Services
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#C0A062',
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
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '16px',
              }}
              className="golden-gradient"
            >
              Why Choose BM Wealth?
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <Shield size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Regulatory & Process
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                AMFI registered. Clear, disclosure-led process.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <TrendingUp size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Execution Discipline
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Not slide decks — we focus on implementation and review cadence.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#DAA520',
                }}
              >
                <PieChart size={40} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px' }}>
                Mumbai-Fit Planning
              </h3>
              <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6 }}>
                Strategies tuned to Mumbai incomes, costs, and risk realities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Insights Section */}
      <section className="section-container" style={{ padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px',
            color: '#DAA520'
          }}>
            <BookOpen size={32} />
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                margin: 0,
              }}
              className="golden-gradient"
            >
              Latest Insights
            </h2>
          </div>
          <p
            style={{
              fontSize: '18px',
              color: '#C0A062',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Expert financial wisdom and real-world investment stories
          </p>
        </div>

        <BlogCard post={staticBlogPost} />


        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/blog" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All Insights
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container">
        <div
          className="glass-effect"
          style={{
            padding: '70px 40px',
            textAlign: 'center',
            background: 'rgba(218, 165, 32, 0.05)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 40px)',
              marginBottom: '18px',
              color: '#DAA520',
            }}
          >
            Private Consultation
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: '#CCCCCC',
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
      `}</style>
    </div>
  );
}









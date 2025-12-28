'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, TrendingUp, Shield, PieChart, CreditCard, DollarSign, Repeat, BookOpen, Crown, Zap } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { staticBlogPost } from '@/data/staticBlogData';

// --- LUXURY COMPONENTS ---

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

const WealthPulse = () => (
  <motion.div
    className="absolute inset-0 z-0 pointer-events-none"
    animate={{
      opacity: [0.05, 0.15, 0.05],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    style={{
      background: 'radial-gradient(circle at center, #C0A062 0%, transparent 70%)',
    }}
  />
);

const LaserTracing = ({ children }) => {
  return (
    <div className="relative group p-[1px] rounded-2xl overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C0A062] to-transparent z-10 opacity-0 group-hover:opacity-100"
        initial={{ left: '-100%' }}
        whileHover={{ left: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ width: '50%', height: '2px', top: 0 }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C0A062] to-transparent z-10 opacity-0 group-hover:opacity-100"
        initial={{ top: '-100%' }}
        whileHover={{ top: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
        style={{ width: '2px', height: '50%', right: 0 }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-l from-transparent via-[#C0A062] to-transparent z-10 opacity-0 group-hover:opacity-100"
        initial={{ right: '-100%' }}
        whileHover={{ right: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
        style={{ width: '50%', height: '2px', bottom: 0 }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-transparent via-[#C0A062] to-transparent z-10 opacity-0 group-hover:opacity-100"
        initial={{ bottom: '-100%' }}
        whileHover={{ bottom: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.6 }}
        style={{ width: '2px', height: '50%', left: 0 }}
      />
      {children}
    </div>
  );
};

export default function HomePage() {
  const [tickerData, setTickerData] = useState([
    { l: 'NIFTY 50', v: '24,321.05', c: '+1.2%', pos: true },
    { l: 'SENSEX', v: '80,142.12', c: '+0.9%', pos: true },
    { l: 'GOLD (24K)', v: '₹72,450', c: '+0.4%', pos: true },
    { l: 'INR/USD', v: '83.42', c: '-0.1%', pos: false },
    { l: 'BM ELITE INDEX', v: '142.80', c: '+2.4%', pos: true },
  ]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleMouseMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/market-data');
        const result = await res.json();
        if (result.success) {
          const formatted = result.data.map(item => ({
            l: item.label,
            v: item.value,
            c: item.change,
            pos: item.isPositive
          }));
          setTickerData(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch real-time market data:', err);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const services = [
    {
      icon: <PieChart size={40} />,
      title: 'Mutual Funds',
      description: 'Diversified investment options with expert fund selection and performance insights.',
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/mutual-funds',
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Portfolio Management',
      description: 'Personalized wealth management strategies tailored to your financial goals.',
      image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/portfolio-management',
    },
    {
      icon: <CreditCard size={40} />,
      title: 'Trading Services',
      description: 'Real-time market access with advanced tools and expert guidance.',
      image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
      link: '/trading-services',
    },
    {
      icon: <Shield size={40} />,
      title: 'Insurance',
      description: 'Comprehensive life and health insurance plans for financial security.',
      image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?w=600&h=400&fit=crop&auto-compress&fm=webp&q=75',
      link: '/insurance',
    },
    {
      icon: <DollarSign size={40} />,
      title: 'Fixed Deposits',
      description: 'Secure returns with flexible tenure options and competitive rates.',
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
    <div className="bg-black min-h-screen">
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
          className="hero-background-image"
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
            zIndex: 0,
          }}
        />

        {/* 1. Golden Horizon Sweep & 5. Wealth Pulse */}
        <GoldenHorizonSweep />
        <WealthPulse />

        {/* Premium Gradient Overlay - Desktop & Mobile */}
        <div
          className="hero-gradient-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)',
            zIndex: 0,
          }}
        />

        <div
          className="section-container fade-in hero-content-responsive"
          style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            paddingTop: '180px',
          }}
        >
          {/* 7. Gold-Leaf Typography Headline */}
          <motion.h1
            className="hero-subtitle-responsive luxury-text-shimmer"
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
            Mumbai&apos;s Premier Financial Advisory
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
            Exceptional wealth management solutions tailored to your prosperity
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
            {/* 2. Molten Gold Button Effect */}
            <motion.a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Access Your Complimentary Wealth Blueprint</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
              />
            </motion.a>
            <Link href="/services" className="btn-secondary group">
              Explore Services <ArrowRight size={20} className="ml-2 inline group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* HOLOGRAPHIC LIVE MARKET TICKER - Real-time data connected */}
        <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-xl border-t border-[#C0A062]/20 py-4 z-40">
          <div className="flex gap-12 whitespace-nowrap animate-marquee-slow px-10">
            {[...tickerData, ...tickerData].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-xs font-mono tracking-tighter">
                <span className="text-[#C0A062]/60 uppercase">{item.l}</span>
                <span className="text-white font-bold">{item.v}</span>
                <span className={item.pos ? 'text-green-500' : 'text-red-500'}>{item.c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="section-container relative py-32 overflow-hidden">
        <WealthPulse />
        <div className="relative z-10">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '16px',
              }}
              className="golden-gradient font-serif"
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
              Bespoke financial architectures meticulously crafted to elevate your
              wealth trajectory
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
            }}
          >
            {services.map((service, index) => (
              <Link
                key={index}
                href={service.link}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {/* 3. Laser Tracing Outline Effect */}
                <LaserTracing>
                  <div 
                    className="service-card group bg-black/40 backdrop-blur-xl border border-white/5" 
                    style={{
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: '30px',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '220px', marginBottom: '25px', borderRadius: '12px', overflow: 'hidden' }}>
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 3}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      </div>
                    <div style={{ color: '#C0A062', marginBottom: '16px' }} className="group-hover:scale-110 transition-transform duration-500">
                      {service.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: '24px',
                        color: '#C0A062',
                        marginBottom: '12px',
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      {service.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#999',
                        lineHeight: 1.6,
                        marginBottom: '16px',
                      }}
                    >
                      {service.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#C0A062',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }} className="group-hover:gap-4 transition-all duration-500">
                      <span>Initiate Protocol</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </LaserTracing>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link href="/services" className="btn-primary">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #050505 100%)',
          padding: '120px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <GoldenHorizonSweep />
        <div className="section-container relative z-10">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                marginBottom: '16px',
              }}
              className="golden-gradient font-serif"
            >
              Why Choose BM Wealth?
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '60px',
            }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'rgba(192, 160, 98, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  color: '#C0A062',
                  border: '1px solid rgba(192, 160, 98, 0.2)',
                }}
              >
                <Shield size={45} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#C0A062', marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>
                AMFI Registered
              </h3>
              <p style={{ fontSize: '16px', color: '#777', lineHeight: 1.6 }}>
                Fully compliant and registered financial advisory
                services with absolute transparency.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'rgba(192, 160, 98, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  color: '#C0A062',
                  border: '1px solid rgba(192, 160, 98, 0.2)',
                }}
              >
                <TrendingUp size={45} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#C0A062', marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>
                Elite Guidance
              </h3>
              <p style={{ fontSize: '16px', color: '#777', lineHeight: 1.6 }}>
                Decades of expert-level market intelligence and quantitative wealth management.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'rgba(192, 160, 98, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  color: '#C0A062',
                  border: '1px solid rgba(192, 160, 98, 0.2)',
                }}
              >
                <PieChart size={45} />
              </div>
              <h3 style={{ fontSize: '22px', color: '#C0A062', marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>
                Tailored Solutions
              </h3>
              <p style={{ fontSize: '16px', color: '#777', lineHeight: 1.6 }}>
                Bespoke investment strategies meticulously aligned with your private legacy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Insights Section */}
      <section className="section-container relative py-32 overflow-hidden">
        <WealthPulse />
        <div className="relative z-10">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '20px',
              color: '#C0A062'
            }}>
              <BookOpen size={32} />
              <h2
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  margin: 0,
                  fontFamily: '"Playfair Display", serif',
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

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="blog-card-premium group relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden"
            style={{
              maxWidth: '1000px',
              margin: '0 auto',
              padding: 0,
            }}
          >
            <Link 
              href="/blog"
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                display: 'block'
              }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Blog Image */}
                <div style={{ flex: '1.2', position: 'relative', height: '400px', overflow: 'hidden' }}>
                  <img
                    src={staticBlogPost.image_url || staticBlogPost.image}
                    alt={staticBlogPost.image_alt || staticBlogPost.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    className="grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden lg:block" />
                </div>
                
                {/* Blog Content */}
                <div style={{
                  flex: '1',
                  padding: 'clamp(40px, 6vw, 60px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'rgba(192, 160, 98, 0.1)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#C0A062',
                    marginBottom: '25px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}>
                    {staticBlogPost.category}
                  </div>
                  
                  <h3
                    style={{
                      fontSize: 'clamp(24px, 4vw, 36px)',
                      color: '#C0A062',
                      marginBottom: '20px',
                      lineHeight: 1.2,
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    {staticBlogPost.title}
                  </h3>
                  
                  <p
                    style={{
                      fontSize: 'clamp(16px, 2vw, 18px)',
                      color: '#777',
                      lineHeight: 1.7,
                      marginBottom: '30px',
                      fontStyle: 'italic'
                    }}
                  >
                    &quot;{staticBlogPost.excerpt}&quot;
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#C0A062',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                  }} className="group-hover:gap-6 transition-all duration-500">
                    <span>Read Investigation</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link href="/blog" className="btn-secondary group">
              View All Insights <ArrowRight size={18} className="ml-2 inline group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container relative py-32 overflow-hidden">
        <GoldenHorizonSweep />
        <div
          className="glass-effect relative z-10"
          style={{
            padding: '100px 40px',
            textAlign: 'center',
            background: 'rgba(192, 160, 98, 0.03)',
            border: '1px solid rgba(192, 160, 98, 0.1)',
            borderRadius: '50px',
          }}
        >
          <Crown size={60} className="text-[#C0A062] mx-auto mb-10 opacity-30" />
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              marginBottom: '25px',
              color: '#C0A062',
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Ascend to <span className="italic">Sovereignty</span>
          </h2>
          <p
            style={{
              fontSize: '20px',
              color: '#888',
              marginBottom: '40px',
              maxWidth: '700px',
              margin: '0 auto 50px',
              fontWeight: 300,
              letterSpacing: '1px',
            }}
          >
            Your journey toward absolute financial dominance begins with a private consultation.
          </p>
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.a
              href="https://wa.me/918850977259"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Direct Secure Link
            </motion.a>
            <Link href="/contact" className="btn-secondary group">
              Begin Mandate <ArrowRight size={18} className="ml-2 inline group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee 30s linear infinite;
        }
        .luxury-text-shimmer {
          transition: background-position 0.5s ease;
        }
      `}</style>
    </div>
  );
}

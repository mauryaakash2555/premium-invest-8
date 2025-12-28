'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  PieChart, 
  CreditCard, 
  DollarSign, 
  Repeat, 
  BookOpen, 
  Sparkles,
  Zap,
  Globe,
  Award,
  Crown
} from 'lucide-react';
import { staticBlogPost } from '@/data/staticBlogData';

// --- ULTRA-LUXURY COMPONENTS ---

const GoldDust = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-[#C0A062] rounded-full opacity-20 blur-[1px]"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

const Shard = ({ index }) => {
  const rotation = Math.random() * 360;
  return (
    <motion.div
      className="absolute bg-gradient-to-br from-[#C0A062]/20 via-[#DAA520]/10 to-transparent backdrop-blur-[2px] border border-[#C0A062]/10"
      style={{
        width: 100 + Math.random() * 200 + 'px',
        height: 100 + Math.random() * 200 + 'px',
        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        rotate: rotation,
      }}
      animate={{
        y: [0, -40, 0],
        rotate: [rotation, rotation + 20, rotation],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.5
      }}
    />
  );
};

export default function HomePage() {
  const [mousePosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isHoveringConcierge, setIsHoveringConcierge] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleMouseMove = (e) => {
      setHoverPosition({ x: e.clientX, y: e.y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const services = [
    { icon: <PieChart className="w-8 h-8" />, title: 'Mutual Funds', description: 'Bespoke portfolio architectures optimized for sustained intergenerational wealth growth.', link: '/mutual-funds', image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=800&q=80' },
    { icon: <TrendingUp className="w-8 h-8" />, title: 'Portfolio Management', description: 'Elite institutional-grade management for the most discerning private capital requirements.', link: '/portfolio-management', image: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=800&q=80' },
    { icon: <CreditCard className="w-8 h-8" />, title: 'Trading Services', description: 'Direct-access execution with advanced quantitative analytics and real-time market intelligence.', link: '/trading-services', image: 'https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800&q=80' },
    { icon: <Shield className="w-8 h-8" />, title: 'Insurance', description: 'Sovereign-level protection strategies designed to safeguard your legacy against volatility.', link: '/insurance', image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg?w=800&q=80' },
    { icon: <DollarSign className="w-8 h-8" />, title: 'Fixed Deposits', description: 'Capital preservation mandates with premium yield structures and total liquidity control.', link: '/fixed-deposits', image: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?w=800&q=80' },
    { icon: <Repeat className="w-8 h-8" />, title: 'SIP', description: 'Automated wealth accumulation protocols for systematic capital deployment and dominance.', link: '/sip', image: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=800&q=80' },
  ];

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden" ref={containerRef}>
      
      {/* 1. LIQUID GOLD HERO EXPERIENCE */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?w=1920&q=100)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            y: useTransform(smoothProgress, [0, 0.3], [0, 200]),
            opacity: 0.35,
          }}
        />
        
        {/* Liquid Void Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10" />
        
        {/* Floating Shards */}
        <div className="absolute inset-0 z-20">
          {[...Array(5)].map((_, i) => <Shard key={i} index={i} />)}
        </div>

        <div className="relative z-30 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <span className="inline-block text-[#C0A062] font-bold tracking-[8px] uppercase text-sm mb-6 border-b border-[#C0A062]/30 pb-2">
              The Sanctuary of Private Wealth
            </span>
            
            {/* HOLOGRAPHIC TYPOGRAPHY */}
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight luxury-text-shimmer">
              Bespoke <br />
              <span className="gold-gradient-text italic">Architecture</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 font-light tracking-widest mb-12 max-w-2xl mx-auto leading-relaxed">
              Empowering Mumbai&apos;s most distinguished investors with quantitative precision and unwavering integrity.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <motion.a
                href="https://wa.me/918850977259"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(192, 160, 98, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-[#C0A062] text-black font-bold uppercase tracking-[2px] rounded-full text-sm transition-all duration-500"
              >
                Access Your Blueprint
              </motion.a>
              <Link href="/services" className="group flex items-center gap-4 text-[#C0A062] font-bold uppercase tracking-[2px] text-sm hover:brightness-125 transition-all">
                The Portfolio <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 5. HOLOGRAPHIC LIVE MARKET TICKER */}
        <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-xl border-t border-[#C0A062]/20 py-4 z-40">
          <div className="flex gap-12 whitespace-nowrap animate-[marquee_30s_linear_infinite] px-10">
            {[
              { l: 'NIFTY 50', v: '24,321.05', c: '+1.2%' },
              { l: 'SENSEX', v: '80,142.12', c: '+0.9%' },
              { l: 'GOLD (24K)', v: '₹72,450', c: '+0.4%' },
              { l: 'INR/USD', v: '83.42', c: '-0.1%' },
              { l: 'BM ELITE INDEX', v: '142.80', c: '+2.4%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-xs font-mono tracking-tighter">
                <span className="text-[#C0A062]/60 uppercase">{item.l}</span>
                <span className="text-white font-bold">{item.v}</span>
                <span className={item.c.startsWith('+') ? 'text-green-500' : 'text-red-500'}>{item.c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. GLASSMORPHISM 2.0 - SERVICES */}
      <section className="relative py-32 px-6 overflow-hidden">
        <GoldDust />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-serif font-bold gold-gradient-text mb-6">
              Our Curated Strategies
            </h2>
            <div className="h-[1px] w-32 bg-[#C0A062] mx-auto opacity-40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -15 }}
                className="relative group cursor-pointer"
              >
                {/* FROSTED OBSIDIAN CARD */}
                <div className="relative h-full bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/5 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {/* Laser Traced Border Simulation */}
                  <div className="absolute inset-0 border border-[#C0A062]/0 group-hover:border-[#C0A062]/40 transition-all duration-700 rounded-3xl" />
                  
                  <div className="relative h-48 mb-8 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                    <Image src={service.image} alt={service.title} fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="text-[#C0A062] mb-6 p-3 bg-white/5 rounded-xl w-fit group-hover:bg-[#C0A062] group-hover:text-black transition-all duration-500">
                    {service.icon}
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-[#C0A062] transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    {service.description}
                  </p>

                  <Link href={service.link} className="flex items-center gap-3 text-[10px] uppercase tracking-[3px] font-bold text-[#C0A062] group-hover:gap-5 transition-all">
                    Initiate Protocol <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE WEALTH GROWTH MODEL (SCROLL ANIMATION) */}
      <section className="relative py-48 bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-7xl font-serif font-bold mb-12 leading-tight"
            >
              The <span className="gold-gradient-text italic">Wealth</span> <br /> 
              Sovereignty
            </motion.h2>
            
            <div className="space-y-12">
              {[
                { title: 'Protection', icon: <Shield className="w-6 h-6" />, desc: 'Absolute capital security through sovereign-grade protocols.' },
                { title: 'Expansion', icon: <TrendingUp className="w-6 h-6" />, desc: 'Exponential capital deployment in global high-yield sectors.' },
                { title: 'Legacy', icon: <Crown className="w-6 h-6" />, desc: 'Structural architecture for intergenerational preservation.' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex gap-8 group"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-white/5 rounded-full flex items-center justify-center text-[#C0A062] group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold mb-2 tracking-wide">{item.title}</h4>
                    <p className="text-gray-500 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            {/* THE GOLDEN PULSE ORB */}
            <motion.div 
              style={{
                scale: useTransform(smoothProgress, [0.4, 0.7], [0.8, 1.2]),
                rotate: useTransform(smoothProgress, [0.4, 0.7], [0, 180]),
              }}
              className="relative w-80 h-80 md:w-[500px] md:h-[500px]"
            >
              <div className="absolute inset-0 rounded-full border border-[#C0A062]/20 animate-pulse" />
              <div className="absolute inset-10 rounded-full border border-[#C0A062]/10 animate-spin-slow" />
              <div className="absolute inset-20 rounded-full bg-gradient-to-tr from-[#C0A062]/20 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Crown size={80} className="text-[#C0A062] animate-bounce-slow opacity-80" />
              </div>
              
              {/* Particle Swarm */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-[#C0A062] rounded-full blur-[1px]"
                  animate={{
                    x: [Math.cos(i) * 200, Math.cos(i) * 250, Math.cos(i) * 200],
                    y: [Math.sin(i) * 200, Math.sin(i) * 250, Math.sin(i) * 200],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. THE EXECUTIVE CONCIERGE ORB (REPLACED FLOATING BTN) */}
      <motion.div
        className="fixed bottom-10 right-10 z-[100] cursor-none lg:block hidden"
        animate={{
          x: isHoveringConcierge ? (mousePosition.x - window.innerWidth + 40) * 0.3 : 0,
          y: isHoveringConcierge ? (mousePosition.y - window.innerHeight + 40) * 0.3 : 0,
        }}
      >
        <div 
          className="relative"
          onMouseEnter={() => setIsHoveringConcierge(true)}
          onMouseLeave={() => setIsHoveringConcierge(false)}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-tr from-[#C0A062] to-[#DAA520] rounded-full blur-xl opacity-40 absolute inset-0"
          />
          <motion.div
            className="w-20 h-20 rounded-full border-2 border-[#C0A062] bg-black flex items-center justify-center relative z-10"
            whileHover={{ scale: 1.2, rotate: 90 }}
          >
            <Zap className="text-[#C0A062] w-8 h-8" />
          </motion.div>
          
          <AnimatePresence>
            {isHoveringConcierge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -100 }}
                animate={{ opacity: 1, scale: 1, x: -250 }}
                exit={{ opacity: 0, scale: 0.8, x: -100 }}
                className="absolute top-0 w-56 p-6 bg-black/80 backdrop-blur-2xl border border-[#C0A062]/30 rounded-2xl"
              >
                <p className="text-xs uppercase tracking-[3px] text-[#C0A062] mb-2">Concierge</p>
                <p className="text-sm font-light text-white mb-4">Awaiting your mandate for private advisory.</p>
                <a href="https://wa.me/918850977259" className="text-[10px] font-bold uppercase tracking-widest text-[#C0A062] hover:underline">
                  Initiate Link
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* LATEST INSIGHTS - LUXURY REFINEMENT */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="text-[#C0A062] text-xs uppercase tracking-[5px] mb-4 block">Knowledge dominance</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold">The <span className="gold-gradient-text italic">Wealth</span> Journal</h2>
            </div>
            <Link href="/blog" className="px-8 py-4 border border-[#C0A062]/30 rounded-full text-xs font-bold uppercase tracking-[2px] hover:bg-[#C0A062] hover:text-black transition-all">
              View Entire Archive
            </Link>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group relative bg-black border border-white/10 rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-80 lg:h-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                <Image src={staticBlogPost.image_url || staticBlogPost.image} alt="Blog" fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[2s]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
              </div>
              <div className="p-12 md:p-20 flex flex-col justify-center">
                <span className="text-[#C0A062] text-[10px] font-bold uppercase tracking-[4px] mb-6">{staticBlogPost.category}</span>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-8 leading-tight group-hover:text-[#C0A062] transition-colors">{staticBlogPost.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed mb-10 text-lg italic">&quot;{staticBlogPost.excerpt}&quot;</p>
                <Link href="/blog" className="flex items-center gap-4 font-bold text-xs uppercase tracking-[3px] text-[#C0A062] group-hover:gap-6 transition-all">
                  Read Investigation <ArrowRight />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA - THE VAULT GATEWAY */}
      <section className="py-48 px-6 text-center relative overflow-hidden">
        <motion.div
          whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <Crown size={60} className="text-[#C0A062] mx-auto mb-12 opacity-40" />
          <h2 className="text-5xl md:text-8xl font-serif font-bold mb-12 leading-tight">
            Ascend to <br /> <span className="gold-gradient-text italic">Sovereignty</span>
          </h2>
          <p className="text-xl text-gray-500 font-light tracking-widest mb-16 max-w-2xl mx-auto">
            Your journey toward absolute financial dominance begins with a private consultation.
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <Link href="/contact" className="px-12 py-6 bg-white text-black font-black uppercase tracking-[4px] rounded-full hover:bg-[#C0A062] transition-all duration-500">
              Begin Mandate
            </Link>
            <a href="https://wa.me/918850977259" className="px-12 py-6 border border-[#C0A062] text-[#C0A062] font-black uppercase tracking-[4px] rounded-full hover:bg-[#C0A062]/10 transition-all">
              Direct Secure Link
            </a>
          </div>
        </motion.div>
        
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(192,160,98,0.05)_0%,_transparent_70%)] pointer-events-none" />
      </section>

      <style jsx global>{`
        .luxury-text-shimmer {
          background: linear-gradient(135deg, 
            rgba(255,255,255,1) 0%, 
            rgba(255,255,255,1) 40%, 
            rgba(192,160,98,1) 50%, 
            rgba(255,255,255,1) 60%, 
            rgba(255,255,255,1) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShine 8s linear infinite;
        }

        @keyframes textShine {
          to { background-position: 200% center; }
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce 4s ease-in-out infinite;
        }

        @keyframes spin {
          from { rotate: 0deg; }
          to { rotate: 360deg; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

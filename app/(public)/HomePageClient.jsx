/**
 * FILE: app\(public)\HomePageClient.jsx
 * PURPOSE: Home page UI (client component)
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Shield, PieChart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getServicesForHome } from '@/data/servicesCatalog';
import dynamic from 'next/dynamic';
// 🔒 CORE: Using isolated market ticker (never breaks)
// Lazy-loaded below the fold — not needed for LCP.
const PremiumMarketTicker = dynamic(() => import('@/core/marketTicker'), { ssr: false });
// HeroContent uses framer-motion (559 KiB). Dynamic-import code-splits it out of the
// critical chunk, cutting ~2.2 s of main-thread blocking time.
const HeroContent = dynamic(() => import('@/components/home/HeroContent'), {
  ssr: false,
  loading: () => <div style={{ minHeight: 320 }} />,
});
import ServiceCard from '@/components/user/ServiceCard';

// Below-the-fold components: lazy-loaded to cut initial JS for faster LCP / lower TBT.
const MarketMoodStrip = dynamic(() => import('@/components/user/MarketMoodStrip'), { ssr: false });
const AnimatedClouds = dynamic(() => import('@/components/user/AnimatedClouds'), { ssr: false });

// --- LUXURY COMPONENTS KEPT ---
// Pure CSS animation — no framer-motion needed.
const GoldenHorizonSweep = () => (
  <div
    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <div
      className="h-full w-[40%] golden-horizon-sweep"
      style={{
        background: 'linear-gradient(to right, transparent, rgba(192,160,98,0.06), transparent)',
        filter: 'blur(120px)',
      }}
    />
  </div>
);

export default function HomePageClient() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rainEnabled, setRainEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [latestCommunityByPillar, setLatestCommunityByPillar] = useState({
    IMPACT: null,
    GUEST: null,
    DEV: null,
  });
  const liveMoodRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);

    const mq = window.matchMedia('(min-width: 768px)');
    const updateDesktop = () => setIsDesktop(Boolean(mq.matches));
    updateDesktop();
    try {
      mq.addEventListener('change', updateDesktop);
    } catch {
      mq.addListener(updateDesktop);
    }

    const handleMouseMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      try {
        mq.removeEventListener('change', updateDesktop);
      } catch {
        mq.removeListener(updateDesktop);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const pickLatestFrom = (items) => {
      const list = Array.isArray(items) ? [...items] : [];
      list.sort((a, b) => {
        const da = new Date(a?.approved_at || a?.created_at || 0).getTime();
        const db = new Date(b?.approved_at || b?.created_at || 0).getTime();
        return db - da;
      });
      return list.find((p) => p && p._id && p.title) || null;
    };

    const load = async () => {
      try {
        const pillars = ['IMPACT', 'GUEST', 'DEV'];
        const results = await Promise.all(
          pillars.map(async (pillar) => {
            const res = await fetch(`/api/posts?pillar=${encodeURIComponent(pillar)}&status=APPROVED`, {
              signal: controller.signal,
              cache: 'no-store',
            });
            if (!res.ok) return [pillar, null];
            const data = await res.json();
            return [pillar, pickLatestFrom(data)];
          })
        );

        if (cancelled) return;
        const next = { IMPACT: null, GUEST: null, DEV: null };
        for (const [pillar, post] of results) next[pillar] = post;
        setLatestCommunityByPillar(next);
      } catch {
        // Best-effort; keep placeholders.
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
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
          justifyContent: 'flex-start',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '85vh',
          maxHeight: '85vh',
          height: '85vh',
        }}
      >
        {/* Background Image - PREMIUM DARK */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            zIndex: 1,
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={75}
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.6,
              filter: 'brightness(1.0) saturate(1.1) contrast(1.2)',
            }}
          />
        </div>

        {/* Animated Clouds with lightning effect (client-only to avoid hydration mismatch) */}
        {mounted ? <AnimatedClouds enableRain={rainEnabled} enableLightning={true} /> : null}

        {/* 1. Golden Horizon Sweep Kept */}
        <GoldenHorizonSweep />

        {/* Premium Gradient Overlay - Desktop & Mobile - ULTRA DARK */}
        <div
          className="hero-gradient-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 100%)',
            // IMPORTANT: this overlay must never block hero interactions/CTAs.
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        <div
          className="section-container fade-in hero-content-responsive"
          style={{
            textAlign: 'left',
            position: 'relative',
            zIndex: 3,
            paddingTop: 'clamp(20px, 7vh, 180px)',
            width: '100%',
            paddingLeft: 'clamp(32px, 4vw, 100px)',
          }}
        >
          <HeroContent />
        </div>

        {/* LIVE MOOD (restored) - original position; must remain clickable */}
        <div ref={liveMoodRef} className="absolute bottom-[46px] left-0 w-full z-[70]" style={{ pointerEvents: 'auto' }}>
          <MarketMoodStrip onToggleRain={() => setRainEnabled((v) => !v)} />
        </div>

        {/* PREMIUM LIVE MARKET TICKER (inside hero, same position as your reference) */}
        <div className="absolute bottom-0 left-0 w-full z-40">
          <PremiumMarketTicker />
        </div>
      </section>

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
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              }}
            >
              <span
                style={{
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: '13px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                PMS Certification No.
              </span>
              <span
                style={{
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}
              >
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
              <div
                style={{
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: '12px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                PMS-First
              </div>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '10px' }}>
                Credential-led portfolio stewardship
              </h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: '14px' }}>
                We lead with Portfolio Management Services (PMS) discipline — structured decisions, documented reviews, and clear
                accountability.
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
              <div
                style={{
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: '12px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                Execution
              </div>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '10px' }}>Implementation over opinions</h3>
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
              <div
                style={{
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: '12px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                Planning
              </div>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '10px' }}>Tailored Solutions</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
                Personalized investment strategies aligned with your financial goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Insights Section — 6 premium cards */}
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
            Expert financial wisdom, real-world stories &amp; powerful tools
          </p>
          <p style={{ marginTop: '14px', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
            Prefer self-paced learning?{' '}
            <a
              href="https://store.bmwealth.co.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(214, 179, 106, 0.9)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              Explore our Digital Store →
            </a>
          </p>
        </div>

        {/* 6-card premium grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
          }}
        >
          {(() => {
            const editorial = {
              title: 'Editorial',
              kicker: 'BM Editorial',
              postTitle: 'He Lost ₹47 Lakh Following "Expert" Advice - Here\'s What He Wishes He Knew 7 Years Ago',
              desc:
                'True story: How a Mumbai CA lost ₹47 lakh opportunity cost following wrong advice. Learn the 5 critical mistakes and what you should check in your portfolio today.',
              href: '/blog/47-lakh-investment-mistake-mumbai',
              img: '/blog-images/blog-hero-47lakh.jpg',
              kind: 'post',
            };

            const impactPost = latestCommunityByPillar.IMPACT;
            const guestPost = latestCommunityByPillar.GUEST;
            const devPost = latestCommunityByPillar.DEV;

            const communityCard = (pillar, label, post) => {
              const id = String(post?._id || '').trim();
              const img = String(post?.image_url || post?.image || '').trim();
              return {
                title: label,
                kicker: label,
                postTitle: String(post?.title || '').trim() || label,
                desc: 'Read the latest approved story in this series.',
                href: id ? `/blog/community/${id}` : '/blog',
                img,
                kind: 'post',
              };
            };

            const cards = [
              editorial,
              communityCard('IMPACT', 'Community Impact', impactPost),
              communityCard('GUEST', 'Guest Columns', guestPost),
              communityCard('DEV', 'Developer Insight', devPost),
              {
                title: 'ITR Filing Help',
                kicker: 'Tool',
                postTitle: 'ITR Filing Help',
                desc: 'Guided income-tax return filing — step by step, stress-free.',
                href: '/tools/itr-filing-help',
                img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=640&h=360&fit=crop&auto=format&q=75',
                kind: 'tool',
              },
              {
                title: 'Live Intelligence',
                kicker: 'Live',
                postTitle: 'Live Intelligence',
                desc: 'Real-time market context, mood indicators & trading timings.',
                href: '/live-intelligence',
                kind: 'live-intel',
              },
            ];

            return cards;
          })().map((card) => (
            <Link
              key={card.href}
              href={card.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                minHeight: isDesktop ? '420px' : 'clamp(360px, 54vh, 450px)',
                borderRadius: '16px',
                background: 'linear-gradient(170deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                textDecoration: 'none',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(214, 179, 106, 0.45)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(214, 179, 106, 0.20)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card thumbnail */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
                {card.kind === 'live-intel' ? (
                  mounted && isDesktop ? (
                    <video
                      className="absolute inset-0 h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%230a0a0a' width='1' height='1'/%3E%3C/svg%3E"
                    >
                      <source src="/videos/about-us-animated.mp4" type="video/mp4" />
                    </video>
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'radial-gradient(740px 220px at 10% 100%, rgba(214, 179, 106, 0.12), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                      }}
                    />
                  )
                ) : (
                  card.img ? (
                    <Image
                      src={card.img}
                      alt={card.postTitle || card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 340px"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'radial-gradient(740px 220px at 10% 100%, rgba(214, 179, 106, 0.12), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                      }}
                    />
                  )
                )}
                {/* Gradient fade at bottom of image */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 50%)' }} />
              </div>
              {/* Card body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px 20px 22px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)' }}>
                  {card.kicker || card.title}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.35 }}>
                  {card.postTitle || card.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
                  {card.desc}
                </p>
                <span
                  style={{
                    marginTop: 'auto',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(214, 179, 106, 0.9)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Read →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
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
            <a href="https://wa.me/918850977259" target="_blank" rel="noopener noreferrer" className="btn-primary">
              WhatsApp Concierge
            </a>
            <Link href="/contact" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Contact Form
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes golden-horizon-sweep {
          from { transform: translateX(-100%); }
          to   { transform: translateX(250%); }
        }
        .golden-horizon-sweep {
          animation: golden-horizon-sweep 15s linear infinite;
          will-change: transform;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-slow {
          animation: marquee 30s linear infinite;
        }

        @keyframes bm-sheen {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        .bm-why-card {
          position: relative;
          overflow: hidden;
        }
        .bm-why-card::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
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
          content: '';
          position: absolute;
          inset: -2px;
          pointer-events: none;
          background: radial-gradient(900px 240px at 10% 0%, rgba(214, 179, 106, 0.12), transparent 60%),
            radial-gradient(760px 240px at 90% 100%, rgba(255, 255, 255, 0.06), transparent 60%);
          opacity: 0.95;
        }
      `}</style>
    </div>
  );
}

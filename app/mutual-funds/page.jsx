'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import BackToLiveIntelligence from '@/components/shared/BackToLiveIntelligence';
import RelatedServices from '@/components/seo/RelatedServices';
import { FundCostComparator } from '@/components/calculators/FundCostComparator';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';

// Page-local palette (aligned to other service pages)
const ACCENT = '#D6B36A';
const ACCENT_RGB = '214, 179, 106';
const TITLE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.78)';
const MUTED = 'rgba(255,255,255,0.62)';
const BORDER = 'rgba(255,255,255,0.12)';

// Page-scoped luxury CSS (kept minimal, premium motion)
const LUX_STYLES = `
  @keyframes mf-ambient {
    0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .75; }
    50% { transform: translate3d(0,-10px,0) scale(1.03); opacity: 1; }
  }
  @keyframes mf-sheen {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }
  @keyframes mf-glowbreath {
    0%, 100% { box-shadow: 0 22px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06); }
    50% { box-shadow: 0 28px 80px rgba(0,0,0,0.55), 0 0 54px rgba(${ACCENT_RGB}, .14), inset 0 1px 0 rgba(255,255,255,0.08); }
  }
  @keyframes mf-sweep {
    0% { transform: translateX(-140%); opacity: 0; }
    12% { opacity: 1; }
    55% { opacity: 1; }
    100% { transform: translateX(140%); opacity: 0; }
  }
  .mf-shell { background: #05070D; color: ${TITLE}; min-height: 100vh; }
  .mf-card { position: relative; overflow: hidden; border-radius: 18px; border: 1px solid ${BORDER}; background: rgba(255,255,255,0.035); backdrop-filter: blur(14px);
    box-shadow: 0 22px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
    transition: transform .35s ease, border-color .35s ease, box-shadow .35s ease; }
  .mf-card:hover { transform: translateY(-4px); border-color: rgba(${ACCENT_RGB}, .35);
    box-shadow: 0 28px 80px rgba(0,0,0,0.55), 0 0 48px rgba(${ACCENT_RGB}, .14), inset 0 1px 0 rgba(255,255,255,0.08); }
  .mf-card::before { content: ''; position: absolute; inset: -2px; pointer-events: none;
    background: radial-gradient(900px 240px at 10% 0%, rgba(${ACCENT_RGB}, .10), transparent 60%),
                radial-gradient(760px 240px at 90% 100%, rgba(255,255,255,.06), transparent 60%);
    opacity: .9; }
  .mf-pill { display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 999px;
    border: 1px solid rgba(${ACCENT_RGB}, .22); background: rgba(${ACCENT_RGB}, .06); color: rgba(255,255,255,.78);
    box-shadow: 0 10px 40px rgba(${ACCENT_RGB}, .08); }
  .mf-dot { width: 7px; height: 7px; border-radius: 999px; background: rgba(${ACCENT_RGB}, .95); box-shadow: 0 0 18px rgba(${ACCENT_RGB}, .55); }
  .mf-cta { position: relative; overflow: hidden; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
  .mf-cta::after { content: ''; position: absolute; inset: 0; pointer-events:none; opacity: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); transform: translateX(-120%); }
  .mf-cta:hover { transform: translateY(-2px); border-color: rgba(${ACCENT_RGB}, .35) !important; box-shadow: 0 14px 40px rgba(${ACCENT_RGB}, .18); }
  .mf-cta:hover::after { opacity: 1; animation: mf-sheen 1.1s ease; }
  .mf-kpi { display:flex; flex-direction: column; gap: 6px; padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.10);
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); }

  /* Mobile-first: simulate hover + add gentle motion so the page feels alive */
  @media (hover: none), (pointer: coarse) {
    .mf-hero { padding: 96px 0 56px 0 !important; margin-top: 64px !important; }
    .mf-hero-inner { padding: 0 16px !important; }

    .mf-card:active,
    .mf-cta:active {
      transform: translateY(-2px);
      border-color: rgba(${ACCENT_RGB}, .40) !important;
      box-shadow: 0 18px 55px rgba(${ACCENT_RGB}, .16);
    }

    .mf-card.mf-mobile-pulse {
      transform: translateY(-3px);
      border-color: rgba(${ACCENT_RGB}, .42);
      animation: mf-glowbreath 2.6s ease-in-out 1;
    }
    .mf-card.mf-mobile-pulse::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
      transform: translateX(-140%);
      animation: mf-sweep 1.15s ease 1;
      opacity: 0;
    }

    .mf-cta.mf-mobile-pulse::after {
      opacity: 1;
      animation: mf-sheen 1.1s ease;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mf-card, .mf-cta { transition: none !important; }
    .mf-card.mf-mobile-pulse { animation: none !important; transform: none !important; }
    .mf-card.mf-mobile-pulse::after, .mf-cta.mf-mobile-pulse::after { animation: none !important; opacity: 0 !important; }
  }
`;

const MutualFunds = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // Mobile-only: add a light “hover-like” premium pulse as sections enter view.
    // Keeps desktop behavior unchanged (desktop already has true hover).
    const isMobileLike =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(hover: none)').matches || window.matchMedia?.('(pointer: coarse)').matches);

    if (!isMobileLike) return;

    const nodes = Array.from(document.querySelectorAll('.mf-card, .mf-cta'));
    if (!nodes.length) return;

    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target;
          if (seen.has(el)) continue;
          seen.add(el);

          el.classList.add('mf-mobile-pulse');
          window.setTimeout(() => {
            el.classList.remove('mf-mobile-pulse');
          }, 1800);
        }
      },
      { threshold: 0.55, rootMargin: '0px 0px -10% 0px' }
    );

    for (const n of nodes) io.observe(n);
    return () => io.disconnect();
  }, []);

  const PAGE_PATH = '/mutual-funds';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Mutual Funds';
  const description =
    'A structured way to participate in long-term growth — with clarity, comparisons, and execution support.';

  const faqs = [
    {
      question: 'Do you provide assured returns?',
      answer:
        'No. Mutual fund investments are market-linked and do not offer guaranteed returns.',
    },
    {
      question: 'Is SIP the same as a mutual fund?',
      answer:
        'No. SIP is a method of investing. Mutual funds are the investment vehicles.',
    },
    {
      question: 'How often should investments be reviewed?',
      answer:
        'Many investors choose periodic reviews based on personal goals, cashflow, and circumstances.',
    },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: 'Mutual Funds', item: pageUrl },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Mutual Fund Investment Services',
    name: 'Mutual Fund Investment Services',
    url: pageUrl,
    provider: {
      '@type': 'FinancialService',
      name: SITE_NAME,
      url: baseUrl,
    },
    areaServed: 'IN',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Wealth Management Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mutual Fund Investment',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'SIP Planning',
          },
        },
      ],
    },
  };

  const divider = {
    height: 1,
    background: `linear-gradient(90deg, rgba(${ACCENT_RGB},0), rgba(${ACCENT_RGB},0.35), rgba(255,255,255,0.10), rgba(${ACCENT_RGB},0.35), rgba(${ACCENT_RGB},0))`,
    margin: '0 0 56px 0',
  };

  // Legacy sections still reference `card` / `{...card}`.
  // Keep a single source of truth for consistent padding.
  const card = {
    padding: 22,
  };

  return (
    <div className="mf-shell">
      <style dangerouslySetInnerHTML={{ __html: LUX_STYLES }} />
      <script
        id="mutual-funds-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="mutual-funds-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        id="mutual-funds-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero (luxury, high-end spacing, no brown) */}
      <section className="mf-hero" style={{ position: 'relative', padding: '120px 0 64px 0', marginTop: '80px', overflow: 'hidden' }}>
        {/* Back to Live Intelligence */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <BackToLiveIntelligence />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              `radial-gradient(900px 420px at 18% 20%, rgba(${ACCENT_RGB}, 0.18), transparent 60%),` +
              `radial-gradient(900px 420px at 85% 0%, rgba(255,255,255,0.08), transparent 55%),` +
              `linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.92) 70%, rgba(0,0,0,0.98) 100%)`,
            animation: 'mf-ambient 10s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '90px 90px',
            opacity: 0.10,
            maskImage: 'radial-gradient(circle at 50% 30%, black 0%, transparent 70%)',
          }}
        />
        <div className="mf-hero-inner" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="mf-pill" style={{ margin: '0 auto 18px', width: 'fit-content' }}>
            <span className="mf-dot" aria-hidden="true" />
            Clarity-first investing • execution support
          </div>
          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(44px, 5.2vw, 70px)',
              fontWeight: 700,
              color: TITLE,
              margin: '0 0 12px 0',
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              textAlign: 'center',
            }}
          >
            Mutual Funds
          </h1>
          <p style={{ fontSize: '20px', color: BODY, maxWidth: '880px', margin: '0 auto 14px', lineHeight: 1.6, textAlign: 'center' }}>
            A structured way to participate in long-term growth — with calm process, clear choices, and clean execution.
          </p>
          <p style={{ fontSize: '15px', color: MUTED, maxWidth: '920px', margin: '0 auto 26px', lineHeight: 1.85, textAlign: 'center' }}>
            This page is intentionally simple: what mutual funds are, how they work, and how to choose a structure that fits your goal, timeline, and risk comfort.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <Link
              href="/tools"
              className="mf-cta"
              data-ga-event="tool_internal_link"
              data-ga-label="mutual_funds_to_tools"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '13px 22px',
                borderRadius: '999px',
                border: `1px solid rgba(${ACCENT_RGB}, 0.28)`,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)',
                color: TITLE,
                fontWeight: 600,
                letterSpacing: '0.01em',
                textDecoration: 'none',
                boxShadow: `0 14px 45px rgba(${ACCENT_RGB}, 0.14)`,
                backdropFilter: 'blur(12px)',
              }}
            >
              Explore Tools <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/contact"
              className="mf-cta"
              data-ga-event="contact_click"
              data-ga-label="mutual_funds_to_contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '13px 20px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.80)',
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              Talk to BM Wealth <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div
            className="mf-card"
            style={{
              padding: 18,
              maxWidth: 920,
              margin: '0 auto 18px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>
              Market drawdowns are where discipline breaks.
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/intelligence/sip-vs-panic/guide"
                data-ga-event="tool_internal_link"
                data-ga-label="mutual_funds_to_sip_vs_panic_guide"
                style={{
                  color: `rgba(${ACCENT_RGB}, 0.95)`,
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                  fontWeight: 600,
                }}
              >
                Should you stop SIP during a crash? →
              </Link>
              <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.25)' }}>
                •
              </span>
              <Link
                href="/intelligence/sip-vs-panic"
                data-ga-event="tool_open"
                data-ga-label="mutual_funds_open_sip_vs_panic"
                style={{
                  color: `rgba(${ACCENT_RGB}, 0.95)`,
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                  fontWeight: 600,
                }}
              >
                Run the SIP vs Panic simulator →
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { k: 'Distribution', v: 'AMFI-registered', d: 'Access + servicing support.' },
              { k: 'Process', v: 'Goal-led', d: 'Structured selection and review.' },
              { k: 'Clarity', v: 'Neutral tools', d: 'Cost and return context.' },
              { k: 'Discipline', v: 'SIP-friendly', d: 'Repeatable long-term approach.' },
            ].map((x) => (
              <div key={x.k} className="mf-kpi">
                <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{x.k}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: TITLE }}>{x.v}</div>
                <div style={{ fontSize: '13px', lineHeight: 1.7, color: MUTED }}>{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 20px 74px' }}>
        {/* How Mutual Funds Work */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', color: TITLE, marginBottom: '12px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            How Mutual Funds Work (Simple Flow)
          </h2>
          <p style={{ margin: '0 0 18px 0', color: MUTED, lineHeight: 1.9, maxWidth: '900px' }}>
            A clean structure reduces noise. The goal is consistency — not constant activity.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Investors pool money', d: 'Multiple investors contribute capital into a common pool.' },
              { n: '2', t: 'Funds are professionally managed', d: 'A fund manager allocates money across selected assets.' },
              { n: '3', t: 'Portfolio value changes daily', d: 'NAV reflects market movements of underlying assets.' },
              { n: '4', t: 'Long-term participation', d: 'Investors stay invested based on goals and time horizon.' },
            ].map((x) => (
              <div key={x.t} className="mf-card" style={{ padding: 22 }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid rgba(${ACCENT_RGB}, 0.30)`,
                      color: `rgba(${ACCENT_RGB}, 0.95)`,
                      fontWeight: 800,
                      flex: '0 0 auto',
                      boxShadow: `0 0 22px rgba(${ACCENT_RGB}, 0.16)`,
                    }}
                  >
                    {x.n}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: TITLE, fontWeight: 650 }}>{x.t}</h3>
                    <p style={{ margin: 0, fontSize: '15px', color: BODY, lineHeight: 1.8 }}>{x.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Types of Mutual Funds */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', color: TITLE, marginBottom: '12px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Types of Mutual Funds (At a Glance)
          </h2>
          <p style={{ margin: '0 0 18px 0', color: MUTED, lineHeight: 1.9, maxWidth: '900px' }}>
            Choose by role in your portfolio — not by hype.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Equity Funds', d: 'Focused on company shares. Commonly used for long-term growth-oriented objectives.' },
              { t: 'Debt Funds', d: 'Invest in fixed-income instruments. Often used to manage stability and income expectations.' },
              { t: 'Hybrid Funds', d: 'Combine equity and debt to balance growth potential and risk.' },
            ].map((x) => (
              <div key={x.t} className="mf-card" style={{ padding: 22 }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 650 }}>{x.t}</h3>
                  <p style={{ margin: 0, fontSize: '15px', color: BODY, lineHeight: 1.8 }}>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '15px', color: MUTED, lineHeight: 1.9 }}>
            Each category serves a different role in a portfolio.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* SIP */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', color: TITLE, marginBottom: '12px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            SIP — A Method, Not a Product
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.9, color: BODY, margin: '0 0 16px 0', maxWidth: '920px' }}>
            A Systematic Investment Plan (SIP) is a way of investing in mutual funds at regular intervals.
          </p>
          <div className="mf-card" style={{ padding: 22 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {["Consistent investing over time", "Participation across market cycles", "Disciplined, structured approach"].map((t) => (
                  <div key={t} style={{ border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 14, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 14, color: BODY, lineHeight: 1.7 }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '15px', color: MUTED, lineHeight: 1.9 }}>
            SIP is popular because it reduces the pressure of “perfect timing” and builds a repeatable habit.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* SIP vs Lump Sum */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            SIP vs Lump Sum — Neutral Comparison
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="mf-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Systematic Investment (SIP)</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Periodic investing</li>
                <li>Reduces dependency on market timing</li>
                <li>Used for disciplined, long-term participation</li>
              </ul>
            </div>
            <div className="mf-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Lump Sum Investment</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>One-time allocation</li>
                <li>Suitable when surplus funds are available</li>
                <li>Requires comfort with market timing</li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            Both approaches are used based on individual circumstances.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Direct vs Regular */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Direct Plans & Regular Plans — Clear Difference
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="mf-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Direct Plans</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Lower expense ratio</li>
                <li>Managed independently by the investor</li>
                <li>Requires self-monitoring and decision-making</li>
              </ul>
            </div>
            <div className="mf-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Regular Plans</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Includes distributor commission</li>
                <li>Preferred by investors who value service, support, and execution assistance</li>
                <li>Enables ongoing portfolio servicing</li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            As an AMFI-registered Mutual Fund Distributor, BM Wealth facilitates regular plans for investors seeking
            structured support.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Cost Comparator */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', color: TITLE, marginBottom: '12px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Cost & Return Snapshot
          </h2>
          <p style={{ margin: '0 0 16px 0', color: MUTED, lineHeight: 1.9, maxWidth: '920px' }}>
            Use neutral comparisons to understand costs and how different choices can affect outcomes over time.
          </p>
          <div className="mf-card" style={{ padding: 18 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <FundCostComparator accentColor={ACCENT} variant="neutral" />
            </div>
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* One Minute Summary */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Mutual Funds in One Minute
          </h2>
          <div className="mf-card" style={{ ...card, padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.9', fontSize: '16px' }}>
              <li>Pool of investor money</li>
              <li>Managed by fund houses</li>
              <li>Invested across assets</li>
              <li>NAV reflects value</li>
              <li>Long-term participation tool</li>
            </ul>
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Who Uses */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Who Typically Uses Mutual Funds
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[
              'Working professionals',
              'Business owners',
              'Families planning long-term goals',
              'Retired individuals',
              'High-net-worth investors',
            ].map((t) => (
              <div key={t} className="mf-card" style={{ ...card, padding: '18px' }}>
                <p style={{ margin: 0, fontSize: '15px', color: BODY, lineHeight: '1.6' }}>{t}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            Usage depends on objectives, horizon, and comfort with market movements.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Our Role */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div className="mf-card" style={card}>
            <p style={{ margin: '0 0 12px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              We help structure a portfolio approach and implement it through clean product access and servicing support.
            </p>
            <ul style={{ margin: '0 0 18px 0', paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
              <li>PMS Certification No. 2430447816</li>
              <li>AMFI-registered Mutual Fund Distributor</li>
              <li>IRDAI-licensed Insurance Intermediary</li>
            </ul>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>Our role is to:</p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
              <li>Facilitate access to products</li>
              <li>Explain structures and processes</li>
              <li>Support execution and servicing</li>
            </ul>
            <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
              Investment decisions remain with the investor.
            </p>
          </div>
        </section>

        {/* Quick Start */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', color: TITLE, marginBottom: '12px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Quick Start
          </h2>
          <div className="mf-card" style={{ padding: 22 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ margin: '0 0 14px 0', fontSize: '16px', color: BODY, lineHeight: 1.9, maxWidth: '900px' }}>
                If you want clarity before you act, start with tools and then speak to us for execution support.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/tools"
                className="mf-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  border: `1px solid rgba(${ACCENT_RGB}, 0.28)`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                }}
              >
                Explore Tools <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/contact"
                className="mf-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#e5e5e5',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Talk to BM Wealth <span aria-hidden="true">→</span>
              </Link>
              </div>
            </div>
          </div>
        </section>

        <FAQSection faqs={faqs} pageUrl={pageUrl} title="Questions People Quietly Ask" />

        <RelatedServices currentService="mutual-funds" />

        <ClosingPerspective>
          Mutual funds are tools. Their effectiveness depends on clarity of purpose, discipline, and long-term
          perspective. A structured approach helps investors navigate markets with greater confidence and
          understanding.
        </ClosingPerspective>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: MUTED, marginBottom: 0, textAlign: 'justify' }}>
            Related resources: <Link href="/sip" style={{ color: `rgba(${ACCENT_RGB}, 0.95)`, textDecoration: 'underline' }}>SIP</Link> ·{' '}
            <Link href="/portfolio-management" style={{ color: `rgba(${ACCENT_RGB}, 0.95)`, textDecoration: 'underline' }}>Portfolio Planning</Link> ·{' '}
            <Link href="/tools" style={{ color: `rgba(${ACCENT_RGB}, 0.95)`, textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <section style={{ marginTop: '60px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#9a9a9a', marginBottom: 0 }}>
            Mutual fund investments are subject to market risks. Past performance does not guarantee future results.
            Investors are advised to read scheme-related documents carefully before investing.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MutualFunds;

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import { BrokerageEstimator } from '@/components/calculators/BrokerageEstimator';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
import { getServiceLuxuryStyles } from '@/lib/ui/serviceLuxuryStyles';
import { setupServiceMobilePulse } from '@/lib/ui/serviceMobilePulse';

const ACCENT = '#D6B36A';
const ACCENT_RGB = '214, 179, 106';

const TITLE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.78)';
const MUTED = 'rgba(255,255,255,0.62)';
const BORDER = 'rgba(255,255,255,0.12)';

const LUX_STYLES = getServiceLuxuryStyles({ accentRgb: ACCENT_RGB, title: TITLE, border: BORDER });

const TradingServices = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const cleanup = setupServiceMobilePulse();
    return cleanup;
  }, []);

  const PAGE_PATH = '/trading-services';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Trading & Demat';
  const description =
    'Trading and demat support with disciplined process, clear documentation, and risk management basics.';

  const faqs = [
    {
      question: 'What does disciplined execution mean in trading?',
      answer:
        'It means planning entries and exits, sizing positions appropriately, and following a repeatable approach instead of reacting impulsively to short-term moves.',
    },
    {
      question: 'What is required to open a demat account?',
      answer:
        'Typically PAN, Aadhaar, bank account details, and a photo. Some segments (like derivatives) may require income proof depending on the broker.',
    },
    {
      question: 'How do you think about risk management?',
      answer:
        'Risk management is a set of controls—position sizing, exit levels, and exposure limits—designed to keep downsides manageable during adverse moves.',
    },
    {
      question: 'Are the platform links affiliate links?',
      answer:
        'Some platform links may be affiliate links. If you sign up through them, we may earn a commission at no extra cost to you.',
    },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: 'Trading & Demat', item: pageUrl },
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

  const step = {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid rgba(${ACCENT_RGB}, 0.30)`,
    color: `rgba(${ACCENT_RGB}, 0.95)`,
    fontWeight: 700,
    flex: '0 0 auto',
    boxShadow: `0 0 22px rgba(${ACCENT_RGB}, 0.16)`,
  };

  const card = {
    padding: 22,
  };

  const divider = {
    height: 1,
    background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(${ACCENT_RGB}, 0.35), rgba(255,255,255,0))`,
    margin: '0 0 56px 0',
  };

  return (
    <div className="svc-shell">
      <style dangerouslySetInnerHTML={{ __html: LUX_STYLES }} />
      <script
        id="trading-services-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="trading-services-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <section className="svc-hero" style={{ position: 'relative', padding: '120px 0 80px 0', textAlign: 'center', marginTop: '80px', overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              `radial-gradient(900px 420px at 18% 20%, rgba(${ACCENT_RGB}, 0.18), transparent 60%),` +
              `radial-gradient(900px 420px at 85% 0%, rgba(255,255,255,0.08), transparent 55%),` +
              `linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.92) 70%, rgba(0,0,0,0.98) 100%)`,
            animation: 'svc-ambient 10s ease-in-out infinite',
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
        <div className="svc-hero-inner" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: '700',
              color: TITLE,
              marginBottom: '24px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            Trading & Demat
          </h1>
          <p style={{ fontSize: '20px', color: BODY, maxWidth: '840px', margin: '0 auto 18px', lineHeight: '1.6' }}>
            Execution with process. Onboarding with clarity.
          </p>
          <p style={{ fontSize: '16px', color: MUTED, maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            We support demat onboarding, platform selection, and a disciplined framework for execution. The objective is a clear setup and a repeatable process—so decisions are deliberate, not reactive.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            How Trading & Demat Works (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Open & verify', d: 'KYC, segment activation, and a clean demat setup with the right disclosures.' },
              { n: '2', t: 'Choose the setup', d: 'Platform selection based on your needs—costs, stability, support, and features.' },
              { n: '3', t: 'Define the process', d: 'Position sizing, exit rules, exposure limits, and a repeatable execution checklist.' },
              { n: '4', t: 'Review & refine', d: 'Track outcomes, reduce impulsive decisions, and refine the process over time.' },
            ].map((x) => (
              <div key={x.t} className="svc-card" style={card}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={step}>{x.n}</div>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>{x.t}</h3>
                    <p style={{ margin: 0, fontSize: '15px', color: BODY, lineHeight: '1.75' }}>{x.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Trading Styles (At a Glance)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Delivery investing', d: 'Typically used for longer horizons, with fewer decisions and lower churn.' },
              { t: 'Intraday trading', d: 'Higher frequency with tighter risk controls; execution discipline matters.' },
              { t: 'Derivatives (F&O)', d: 'Advanced segment; margin and risk can change quickly with volatility.' },
            ].map((x) => (
              <div key={x.t} className="svc-card" style={card}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: BODY, lineHeight: '1.75' }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Delivery vs Intraday vs F&O — Neutral Comparison
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              {
                t: 'Delivery',
                a: 'Often chosen for simplicity and longer horizons.',
                b: 'Requires patience and alignment with the plan.',
              },
              {
                t: 'Intraday',
                a: 'Often chosen for short-term opportunities and tighter cycles.',
                b: 'Demands discipline, limits, and emotional control.',
              },
              {
                t: 'F&O',
                a: 'Often chosen for hedging or advanced strategies.',
                b: 'Leverage can amplify losses quickly; only for those who understand it.',
              },
            ].map((x) => (
              <div key={x.t} className="svc-card" style={card}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>{x.t}</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: BODY, lineHeight: '1.75' }}>{x.a}</p>
                <p style={{ margin: 0, fontSize: '14px', color: MUTED, lineHeight: '1.75' }}>{x.b}</p>
              </div>
            ))}
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Brokerage & Charges Snapshot
          </h2>
          <BrokerageEstimator />
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div className="svc-card" style={card}>
            <p style={{ margin: '0 0 12px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              We help you set up the right plumbing and process—platform selection, onboarding checklist, and risk-first structure.
            </p>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>Our role is to:</p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
              <li>Support demat onboarding and documentation flow</li>
              <li>Help compare platforms based on your requirements</li>
              <li>Share a disciplined execution framework and risk controls</li>
            </ul>
            <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
              Trading decisions remain with the client.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Quick Start
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              If you want a clean setup, start with your segment choice and costs, then move to onboarding support.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/platforms"
                className="svc-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  border: `1px solid rgba(${ACCENT_RGB}, 0.28)`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow: `0 14px 45px rgba(${ACCENT_RGB}, 0.14)`,
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                }}
              >
                Compare Platforms <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/contact"
                className="svc-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.04)',
                  color: BODY,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Talk to BM Wealth <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <FAQSection faqs={faqs} pageUrl={pageUrl} title="Questions People Quietly Ask" />

        <ClosingPerspective>
          In trading, process is the product. A clean setup and clear rules help reduce noise, improve decision quality, and keep risk controlled over time.
        </ClosingPerspective>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: 0, textAlign: 'justify' }}>
            Related resources: <Link href="/platforms" style={{ color: ACCENT, textDecoration: 'underline' }}>Platforms</Link> ·{' '}
            <Link href="/tools" style={{ color: ACCENT, textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <section style={{ marginTop: '60px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#9a9a9a', marginBottom: 0 }}>
            Trading involves market risk and the possibility of loss. Please read all relevant documents and consider your risk comfort.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TradingServices;




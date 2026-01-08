'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
import { RebalanceDriftSnapshot } from '@/components/calculators/RebalanceDriftSnapshot';
import { getServiceLuxuryStyles } from '@/lib/ui/serviceLuxuryStyles';
import { setupServiceMobilePulse } from '@/lib/ui/serviceMobilePulse';

const ACCENT = '#D6B36A';
const ACCENT_RGB = '214, 179, 106';

const TITLE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.78)';
const MUTED = 'rgba(255,255,255,0.62)';
const BORDER = 'rgba(255,255,255,0.12)';

const LUX_STYLES = getServiceLuxuryStyles({ accentRgb: ACCENT_RGB, title: TITLE, border: BORDER });

const PortfolioManagement = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const cleanup = setupServiceMobilePulse();
    return cleanup;
  }, []);

  const PAGE_PATH = '/portfolio-management';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Portfolio Planning';
  const description =
    'Portfolio planning and review cadence delivered with a premium, process-led approach and clear documentation.';

  const faqs = [
    {
      question: 'What is asset allocation?',
      answer:
        'Asset allocation is deciding how much to hold across equity, debt, and other assets, based on your goal timeline and risk comfort.',
    },
    {
      question: 'What is rebalancing?',
      answer:
        'Rebalancing is periodically bringing your portfolio back to a target allocation (e.g., equity vs debt). It helps maintain risk levels instead of letting the portfolio drift.',
    },
    {
      question: 'How often should a portfolio be reviewed?',
      answer:
        'Many investors prefer a periodic review (e.g., yearly) and an event-driven review when goals, income, or major life circumstances change.',
    },
    {
      question: 'Why do portfolios drift over time?',
      answer:
        'Different assets grow at different rates. Over time, a portfolio can become more aggressive or conservative than intended unless it’s reviewed and rebalanced.',
    },
  ];

  

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: 'Portfolio Planning', item: pageUrl },
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
        id="portfolio-management-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="portfolio-management-article-schema"
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
            Portfolio Planning
          </h1>
          <p style={{ fontSize: '20px', color: BODY, maxWidth: '840px', margin: '0 auto 18px', lineHeight: '1.6' }}>
            A Structured Way to Allocate, Review, and Rebalance
          </p>
          <p style={{ fontSize: '16px', color: MUTED, maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            Portfolio planning is about designing a structure you can hold through cycles—then reviewing it with calm, periodic discipline. The goal is clarity, consistency, and controlled risk.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            How Portfolio Planning Works (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Define goals', d: 'Timeline, cashflows, and what matters most (growth, stability, liquidity).' },
              { n: '2', t: 'Set allocation', d: 'Choose equity/debt mix aligned to risk comfort and time horizon.' },
              { n: '3', t: 'Implement simply', d: 'Use diversified building blocks, avoid unnecessary complexity, and document the plan.' },
              { n: '4', t: 'Review & rebalance', d: 'Periodic and event-driven reviews to keep risk and direction consistent.' },
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
            Portfolio Planning in One Minute
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Asset allocation', d: 'Decide how much to hold across equity, debt, and other assets—based on timeline and comfort.' },
              { t: 'Diversification', d: 'Spread exposure so one theme or position doesn’t dominate outcomes.' },
              { t: 'Rebalancing', d: 'Bring the portfolio back to target weights as markets move.' },
              { t: 'Review cadence', d: 'Periodic reviews plus event-driven reviews after major life changes.' },
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
            Periodic vs Event-Driven Reviews — Neutral Comparison
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              {
                t: 'Periodic review',
                a: 'A scheduled review cadence (often yearly/half-yearly) to check drift and alignment.',
                b: 'Helps you stay consistent without reacting to every market move.',
              },
              {
                t: 'Event-driven review',
                a: 'Triggered by life changes: new goal, income change, major expense, loan, business shift.',
                b: 'Keeps the plan aligned to reality when circumstances change materially.',
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

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Drift Snapshot — Rebalance Check
          </h2>
          <RebalanceDriftSnapshot />
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div className="svc-card" style={card}>
            <p style={{ margin: '0 0 12px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              We help structure a portfolio approach and implement it through clean product access and servicing support.
            </p>
            <ul style={{ margin: '0 0 18px 0', paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
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

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Quick Start
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              If you want structure: define goals and timeline first, then set an allocation and a calm review cadence.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/tools"
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
                Explore Tools <span aria-hidden="true">→</span>
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
          Portfolios perform best when the structure is clear and the review process is calm. A disciplined approach helps you stay aligned to goals while navigating market cycles.
        </ClosingPerspective>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: 0, textAlign: 'justify' }}>
            Related resources: <Link href="/mutual-funds" style={{ color: ACCENT, textDecoration: 'underline' }}>Mutual Funds</Link> ·{' '}
            <Link href="/sip" style={{ color: ACCENT, textDecoration: 'underline' }}>SIP</Link> ·{' '}
            <Link href="/tools" style={{ color: ACCENT, textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <section style={{ marginTop: '60px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#9a9a9a', marginBottom: 0 }}>
            Investments are subject to market risks. Read all scheme-related documents carefully before investing.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PortfolioManagement;

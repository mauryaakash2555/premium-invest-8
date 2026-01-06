'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';

const PortfolioManagement = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
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
    background: 'rgba(218, 165, 32, 0.12)',
    border: '1px solid rgba(218, 165, 32, 0.22)',
    color: '#DAA520',
    fontWeight: 700,
    flex: '0 0 auto',
  };

  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(218, 165, 32, 0.18)',
    borderRadius: '12px',
    padding: '22px',
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>
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
      <section
        style={{
          position: 'relative',
          backgroundColor: '#000000',
          padding: '120px 0 80px 0',
          textAlign: 'center',
          marginTop: '80px',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            opacity: 0.12,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.96) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '52px',
              fontWeight: '700',
              color: '#DAA520',
              marginBottom: '24px',
              lineHeight: '1.2',
            }}
          >
            Portfolio Planning
          </h1>
          <p style={{ fontSize: '20px', color: '#e5e5e5', maxWidth: '840px', margin: '0 auto 18px', lineHeight: '1.6' }}>
            A Structured Way to Allocate, Review, and Rebalance
          </p>
          <p style={{ fontSize: '16px', color: '#d0d0d0', maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            Portfolio planning is about designing a structure you can hold through cycles—then reviewing it with calm, periodic discipline. The goal is clarity, consistency, and controlled risk.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            How Portfolio Planning Works (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Define goals', d: 'Timeline, cashflows, and what matters most (growth, stability, liquidity).' },
              { n: '2', t: 'Set allocation', d: 'Choose equity/debt mix aligned to risk comfort and time horizon.' },
              { n: '3', t: 'Implement simply', d: 'Use diversified building blocks, avoid unnecessary complexity, and document the plan.' },
              { n: '4', t: 'Review & rebalance', d: 'Periodic and event-driven reviews to keep risk and direction consistent.' },
            ].map((x) => (
              <div key={x.t} style={card}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={step}>{x.n}</div>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>{x.t}</h3>
                    <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.75' }}>{x.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Portfolio Planning in One Minute
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Asset allocation', d: 'Decide how much to hold across equity, debt, and other assets—based on timeline and comfort.' },
              { t: 'Diversification', d: 'Spread exposure so one theme or position doesn’t dominate outcomes.' },
              { t: 'Rebalancing', d: 'Bring the portfolio back to target weights as markets move.' },
              { t: 'Review cadence', d: 'Periodic reviews plus event-driven reviews after major life changes.' },
            ].map((x) => (
              <div key={x.t} style={card}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.75' }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
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
              <div key={x.t} style={card}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>{x.t}</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#e5e5e5', lineHeight: '1.75' }}>{x.a}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#d0d0d0', lineHeight: '1.75' }}>{x.b}</p>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div style={card}>
            <p style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#e5e5e5', lineHeight: '1.85' }}>
              We help structure a portfolio approach and implement it through clean product access and servicing support.
            </p>
            <ul style={{ margin: '0 0 18px 0', paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>AMFI-registered Mutual Fund Distributor</li>
              <li>IRDAI-licensed Insurance Intermediary</li>
            </ul>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#e5e5e5', lineHeight: '1.85' }}>Our role is to:</p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>Facilitate access to products</li>
              <li>Explain structures and processes</li>
              <li>Support execution and servicing</li>
            </ul>
            <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: '#d0d0d0', lineHeight: '1.8' }}>
              Investment decisions remain with the investor.
            </p>
          </div>
        </section>

        <FAQSection faqs={faqs} pageUrl={pageUrl} title="FAQs" />

        <ClosingPerspective>
          Portfolios perform best when the structure is clear and the review process is calm. A disciplined approach helps you stay aligned to goals while navigating market cycles.
        </ClosingPerspective>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: 0, textAlign: 'justify' }}>
            Related resources: <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds</Link> ·{' '}
            <Link href="/sip" style={{ color: '#C0A062', textDecoration: 'underline' }}>SIP</Link> ·{' '}
            <Link href="/tools" style={{ color: '#C0A062', textDecoration: 'underline' }}>Tools</Link>
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

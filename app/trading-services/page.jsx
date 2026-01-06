/**
 * FILE: app\trading-services\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - next/link
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

import React, { useEffect } from 'react';
import Link from 'next/link';
import RiskWarning from '@/components/shared/RiskWarning';
import FAQSection from '@/components/shared/FAQSection';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
const TradingServices = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PAGE_PATH = '/trading-services';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Trading & Demat — Educational Guide';
  const description =
    'Educational overview of trading basics, demat accounts, and risk management concepts. No tips, no guarantees.';

  const faqs = [
    {
      question: 'Do you provide stock tips or assured trading returns?',
      answer:
        'No. Trading involves significant risk and returns are not assured. We focus on education, platform selection support, and risk-awareness guidance rather than promises or assurances.',
    },
    {
      question: 'What is required to open a demat account?',
      answer:
        'Typically PAN, Aadhaar, bank account details, and a photo. Some segments (like derivatives) may require income proof depending on the broker.',
    },
    {
      question: 'Is intraday trading suitable for beginners?',
      answer:
        'Intraday trading can be high risk. Many beginners start with learning, paper trading, and small position sizes before risking meaningful capital.',
    },
    {
      question: 'Are the platform links affiliate links?',
      answer:
        'Some platform links may be affiliate links. If you sign up through them, we may earn a commission at no extra cost to you.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: 'Trading Guide', item: pageUrl },
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

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>

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

      <script
        id="trading-services-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      

      <section style={{
        position: 'relative',
        backgroundColor: '#000000',
        padding: '120px 0 80px 0',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '52px',
            fontWeight: '700',
            color: '#DAA520',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Trading & Demat — Educational Guide
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Trading is high-risk. This page focuses on basics, risks, and what to check before opening a demat account.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <RiskWarning type="trading" />

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            If you’re new: a safer learning sequence
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(218, 165, 32, 0.18)', borderRadius: '12px', padding: '24px' }}>
            <ol style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.9', fontSize: '16px' }}>
              <li>Learn basics: order types, settlement, margin, and brokerage charges.</li>
              <li>Practice via paper trading/simulation before using real capital.</li>
              <li>Start with small position sizes; avoid leverage until you understand risk fully.</li>
              <li>Track trades and review mistakes (journal).</li>
            </ol>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Demat account checklist
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(218, 165, 32, 0.18)', borderRadius: '12px', padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>Basic KYC: PAN, Aadhaar, bank details, and a photo (varies by broker).</li>
              <li>Understand charges: brokerage, account maintenance, and DP charges.</li>
              <li>Consider segment activation: equity delivery vs intraday vs derivatives.</li>
              <li>Prefer reliable support and clear disclosure over “tips”.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Risk basics (non-negotiables)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Position sizing', d: 'Keep trades small enough that a mistake doesn’t wipe you out.' },
              { t: 'Exit plan', d: 'Know your invalidation point before entering a trade.' },
              { t: 'Leverage caution', d: 'Leverage can amplify losses quickly; use only if you understand it.' },
            ].map((x) => (
              <div key={x.t} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(218, 165, 32, 0.18)', borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: '600' }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.7' }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/platforms" style={{ color: '#C0A062', textDecoration: 'underline' }}>Platforms</Link> ·{' '}
            <Link href="/tools" style={{ color: '#C0A062', textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} />

        <section style={{
          marginTop: '60px',
          padding: '24px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '0' }}>
            <strong>Educational disclaimer:</strong> {SITE_NAME} is not SEBI-registered. This page is for general educational information only and does not constitute trading advice, a recommendation, or a promise of returns. Trading (especially derivatives) is high-risk. Consider seeking advice from a SEBI-registered professional if you need personalized guidance.
          </p>
        </section>

      </div>
    </div>
  );
};

export default TradingServices;




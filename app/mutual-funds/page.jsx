/**
 * FILE: app\mutual-funds\page.jsx
 * PURPOSE: Educational-only mutual funds guide page with FAQ + Article + Breadcrumb schema.
 * CATEGORY: app
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import RiskWarning from '@/components/shared/RiskWarning';
import FAQSection from '@/components/shared/FAQSection';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';

const MutualFunds = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PAGE_PATH = '/mutual-funds';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Mutual Funds — Educational Guide';
  const description =
    'Educational guide to mutual funds: categories, direct vs regular, SIP vs lump sum, and practical checklists. No advice, no guarantees.';

  const faqs = [
    {
      question: 'What is a mutual fund?',
      answer:
        'A mutual fund pools money from many investors and invests it based on a stated mandate (equity, debt, hybrid, etc.). The value changes with the underlying holdings, so outcomes can vary.',
    },
    {
      question: 'What is the difference between direct and regular plans?',
      answer:
        'Direct plans typically have lower ongoing costs because they do not include distributor commissions. Regular plans include distributor commissions. Compare costs and services transparently before choosing.',
    },
    {
      question: 'Is SIP a product?',
      answer:
        'No. SIP is a method (a schedule) of investing into a mutual fund. The product is the mutual fund scheme; SIP just spreads purchases across time.',
    },
    {
      question: 'Can I redeem mutual funds anytime?',
      answer:
        'Most open-ended funds allow redemptions on business days, but exit loads and taxes may apply. Some categories (e.g., ELSS) have lock-ins. Always check scheme details.',
    },
    {
      question: 'Are mutual funds “safe”?',
      answer:
        'Mutual funds are regulated products, but they still carry market risks. Risk depends heavily on category (equity tends to fluctuate more than debt). There is no guarantee of returns.',
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
      { '@type': 'ListItem', position: 3, name: 'Mutual Funds Guide', item: pageUrl },
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
        id="mutual-funds-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
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
            Mutual Funds — Educational Guide
          </h1>
          <p style={{ fontSize: '20px', color: '#e5e5e5', maxWidth: '820px', margin: '0 auto', lineHeight: '1.6' }}>
            Categories, key terms, and practical checklists—focused on learning, not recommendations.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <RiskWarning type="mutualFunds" />

        <section style={{ marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: '36px',
              color: '#DAA520',
              marginBottom: '18px',
              fontWeight: '600',
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Mutual funds in one minute
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'What you buy', d: 'Units of a fund scheme. NAV moves up/down with markets.' },
              { t: 'What drives outcomes', d: 'Category fit, costs, and holding period—more than short-term timing.' },
              { t: 'What is not guaranteed', d: 'Returns. Even strong periods can be followed by drawdowns.' },
            ].map((x) => (
              <div
                key={x.t}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(218, 165, 32, 0.18)',
                  borderRadius: '10px',
                  padding: '20px',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: '600' }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.7' }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: '36px',
              color: '#DAA520',
              marginBottom: '18px',
              fontWeight: '600',
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Direct vs regular (simple view)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              {
                t: 'Direct plan',
                d: 'Lower ongoing cost in many cases. You handle selection, monitoring, and changes yourself.',
              },
              {
                t: 'Regular plan',
                d: 'Includes distributor commissions. Useful if you value service/support and transparent disclosures.',
              },
            ].map((x) => (
              <div
                key={x.t}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(218, 165, 32, 0.18)',
                  borderRadius: '12px',
                  padding: '22px',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: '600' }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.75' }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: '36px',
              color: '#DAA520',
              marginBottom: '18px',
              fontWeight: '600',
              fontFamily: '"Playfair Display", serif',
            }}
          >
            SIP vs lump sum: a neutral checklist
          </h2>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(218, 165, 32, 0.18)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>SIP supports discipline and reduces the urge to time entries.</li>
              <li>Lump sum is simpler if you have surplus and a long horizon.</li>
              <li>Category fit + holding period matter more than the “mode”.</li>
              <li>Avoid using volatile categories for short-term needs.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/sip" style={{ color: '#C0A062', textDecoration: 'underline' }}>SIP Guide</Link> ·{' '}
            <Link href="/tools" style={{ color: '#C0A062', textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} />

        <section
          style={{
            marginTop: '60px',
            padding: '24px',
            background: 'rgba(251, 191, 36, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '0' }}>
            <strong>Educational disclaimer:</strong> {SITE_NAME} is not SEBI-registered. This page is for general educational information only and does not constitute investment advice, a recommendation, or a promise of returns. Mutual fund investments are subject to market risks—read all scheme-related documents carefully.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MutualFunds;

/**
 * FILE: app\sip\page.jsx
 * PURPOSE: Educational-only SIP guide page with FAQ + Article + Breadcrumb schema.
 * CATEGORY: app
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';

const SIPServices = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PAGE_PATH = '/sip';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'SIP (Systematic Investment Plan) — Educational Guide';
  const description =
    'Educational guide to SIPs: how they work, key terms, checklists, and common myths. No advice, no promises.';

  const faqs = [
    {
      question: 'What is SIP and how does it work?',
      answer:
        'A SIP (Systematic Investment Plan) is a recurring instruction (often monthly) to invest into a mutual fund. It spreads purchases across time and can help build discipline.',
    },
    {
      question: 'Is SIP assured or guaranteed?',
      answer:
        'No. SIP is a method of investing, not a guarantee. Outcomes depend on the fund chosen, market conditions, and how long you stay invested.',
    },
    {
      question: 'Should I stop SIP when markets fall?',
      answer:
        'Many investors prefer focusing on the goal and timeline instead of short-term market moves. Review your plan if your goal, time horizon, or ability to take risk changes.',
    },
    {
      question: 'What SIP amount should I start with?',
      answer:
        'A practical approach is to start with an amount you can continue consistently and increase it gradually if your cashflow allows. Consistency often matters more than choosing a “perfect” starting number.',
    },
    {
      question: 'Is SIP the same as a mutual fund?',
      answer:
        'Not exactly. A mutual fund is the product; SIP is one way to invest into it (a recurring schedule). You can also invest via lump sum.',
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
      { '@type': 'ListItem', position: 3, name: 'SIP Guide', item: pageUrl },
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
        id="sip-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="sip-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        id="sip-faq-schema"
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            SIP (Systematic Investment Plan) — Educational Guide
          </h1>
          <p style={{ fontSize: '20px', color: '#e5e5e5', maxWidth: '820px', margin: '0 auto', lineHeight: '1.6' }}>
            How SIPs work, what to check before starting, and common myths—no advice, no promises.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
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
            SIP in one minute
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'What it is', d: 'A recurring instruction (often monthly) to invest into a mutual fund.' },
              { t: 'Why people use it', d: 'Discipline and reduced need to time the market.' },
              { t: 'What it does not do', d: 'It does not guarantee returns or remove market risk.' },
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
            Before you start: a practical checklist
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
              <li>Goal + time horizon (short-term vs long-term makes a big difference).</li>
              <li>Emergency fund first (reduces forced stopping).</li>
              <li>Costs (expense ratio) and basic tax rules for the fund category.</li>
              <li>Avoid overlapping too many similar funds.</li>
              <li>Review occasionally (e.g., yearly) and after major life events.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds Guide</Link> ·{' '}
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
            <strong>Educational disclaimer:</strong> {SITE_NAME} is not SEBI-registered. This page is for general educational information only and does not constitute investment advice, a recommendation, or a promise of returns. For personalized advice, consult a SEBI-registered investment adviser.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SIPServices;

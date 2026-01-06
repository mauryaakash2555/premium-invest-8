/**
 * FILE: app\portfolio-management\page.jsx
 * PURPOSE: Educational-only portfolio planning guide page with FAQ + Article + Breadcrumb schema.
 * CATEGORY: app
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
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
      { '@type': 'ListItem', position: 3, name: 'Portfolio Planning Guide', item: pageUrl },
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
        id="portfolio-management-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="portfolio-management-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        id="portfolio-management-faq-schema"
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
            Portfolio Planning
          </h1>
          <p style={{ fontSize: '20px', color: '#e5e5e5', maxWidth: '820px', margin: '0 auto', lineHeight: '1.6' }}>
            A disciplined framework for allocation, diversification, and periodic review.
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
            Portfolio planning in one minute
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              {
                t: 'Asset allocation',
                d: 'Decide how much to hold in equity vs debt vs other assets based on goals and timeline.',
              },
              {
                t: 'Diversification',
                d: 'Avoid concentrating too much in one stock, one sector, or one single theme.',
              },
              {
                t: 'Rebalancing',
                d: 'Periodically bring the portfolio back to target weights to keep risk consistent.',
              },
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
            A practical checklist
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
              <li>Define the goal (what/when) and how flexible the date is.</li>
              <li>Keep an emergency fund separate from long-term investments.</li>
              <li>Decide a target equity/debt split based on timeline and risk comfort.</li>
              <li>Implement with simple, diversified building blocks (avoid over-complexity).</li>
              <li>Review periodically and after major life events; avoid frequent tinkering.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds Guide</Link> ·{' '}
            <Link href="/tools" style={{ color: '#C0A062', textDecoration: 'underline' }}>Tools</Link> ·{' '}
            <Link href="/services" style={{ color: '#C0A062', textDecoration: 'underline' }}>All Services</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} />

        <section style={{ marginTop: '60px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#9a9a9a', marginBottom: 0 }}>
            Investments are subject to market risks. Read all scheme-related documents carefully.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PortfolioManagement;

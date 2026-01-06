/**
 * FILE: app\insurance\page.jsx
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
import FAQSection from '@/components/shared/FAQSection';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
const Insurance = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PAGE_PATH = '/insurance';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Insurance — Educational Guide';
  const description =
    'Educational guide to insurance basics: term insurance, health insurance, key terms, and claim process checklists. No advice, no guarantees.';

  const faqs = [
    {
      question: 'How much term insurance cover should I take?',
      answer:
        'Coverage depends on income, liabilities, and family goals. Many people start by considering income replacement plus outstanding loans and key goals (education, family support). A needs-based review is the safest way to size cover.',
    },
    {
      question: 'Is term insurance better than endowment/ULIP for protection?',
      answer:
        'Term insurance is designed for pure protection at lower cost. Endowment plans and ULIPs combine insurance and savings/investment features; suitability depends on goals, time horizon, and risk comfort. Many investors compare a “separate insurance + separate investing” approach for clarity and flexibility.',
    },
    {
      question: 'Should I rely only on employer health insurance?',
      answer:
        'Employer cover is helpful, but it can change or stop when you switch jobs. Many families keep a separate personal health policy for continuity and to build long-term coverage over time.',
    },
    {
      question: 'How do claims work?',
      answer:
        'Claims are processed by the insurer based on policy terms, conditions, and exclusions. We can help you understand documentation requirements and the steps for cashless/reimbursement claims, but final approval always rests with the insurer.',
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
      { '@type': 'ListItem', position: 3, name: 'Insurance Guide', item: pageUrl },
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
        id="insurance-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="insurance-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <script
        id="insurance-faq-schema"
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
            Insurance — Educational Guide
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            A practical overview of term and health insurance concepts, key terms, and claim process basics.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            How to think about insurance
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(218, 165, 32, 0.18)', borderRadius: '12px', padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>Protection first: cover high-impact risks before chasing “returns”.</li>
              <li>Keep policy documents and nominee details up to date.</li>
              <li>Understand exclusions, waiting periods, and claim documentation.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Term insurance checklist
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Cover amount logic', d: 'Consider income replacement, liabilities, and key family goals (education).', },
              { t: 'Policy term', d: 'Often aligned to working years and major liabilities.', },
              { t: 'Disclosure', d: 'Disclose health and lifestyle accurately to avoid claim issues.', },
            ].map((x) => (
              <div key={x.t} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(218, 165, 32, 0.18)', borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: '600' }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.7' }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Health insurance checklist
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(218, 165, 32, 0.18)', borderRadius: '12px', padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>Network hospitals and cashless process basics.</li>
              <li>Room rent limits, co-pay, and sub-limits (if any).</li>
              <li>Waiting periods and pre-existing condition rules.</li>
              <li>Keep an updated medical history record for claims.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/sip" style={{ color: '#C0A062', textDecoration: 'underline' }}>SIP Guide</Link> ·{' '}
            <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds Guide</Link> ·{' '}
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
            <strong>Educational + distribution disclaimer:</strong> {SITE_NAME} is not SEBI-registered. This page is general educational information and not financial advice. BM Wealth holds IRDAI License 277925 for insurance distribution. Policy issuance and claims are subject to the insurer’s terms and approval. Always read policy documents carefully.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Insurance;

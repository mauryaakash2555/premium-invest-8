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
  const title = 'SIP';
  const description =
    'A structured method to participate in mutual funds with discipline over time.';

  const faqs = [
    {
      question: 'Do SIPs provide assured returns?',
      answer:
        'No. SIP outcomes depend on the mutual fund scheme and market movements. Returns are not guaranteed.',
    },
    {
      question: 'Is SIP the same as a mutual fund?',
      answer:
        'No. SIP is a method of investing. Mutual funds are the investment vehicles.',
    },
    {
      question: 'How often should SIPs be reviewed?',
      answer:
        'Many investors choose periodic reviews based on goals and circumstances, and do an event-driven review after major life changes.',
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
      { '@type': 'ListItem', position: 3, name: 'SIP', item: pageUrl },
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
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '52px', fontWeight: '700', color: '#DAA520', marginBottom: '16px', lineHeight: '1.2' }}>
            SIP
          </h1>
          <p style={{ fontSize: '20px', color: '#e5e5e5', maxWidth: '820px', margin: '0 auto 18px', lineHeight: '1.6' }}>
            A Method, Not a Product
          </p>
          <p style={{ fontSize: '16px', color: '#d0d0d0', maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            A Systematic Investment Plan (SIP) is a way of investing in mutual funds at regular intervals. It is commonly
            used for long-term participation with a disciplined, structured approach.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        {/* How SIP Works (Simple Flow) */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            How SIP Works (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Choose the fund', d: 'Pick a mutual fund category and scheme aligned to goal and time horizon.' },
              { n: '2', t: 'Set amount & date', d: 'Decide a sustainable amount and a date aligned to cashflow.' },
              { n: '3', t: 'Invest consistently', d: 'Invest at regular intervals across market cycles.' },
              { n: '4', t: 'Review periodically', d: 'Many investors review based on goals and life changes—not daily market moves.' },
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

        {/* SIP vs Lump Sum — Neutral Comparison */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            SIP vs Lump Sum — Neutral Comparison
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>Systematic Investment (SIP)</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
                <li>Periodic investing</li>
                <li>Reduces dependency on market timing</li>
                <li>Used for disciplined, long-term participation</li>
              </ul>
            </div>
            <div style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>Lump Sum Investment</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
                <li>One-time allocation</li>
                <li>Suitable when surplus funds are available</li>
                <li>Requires comfort with market timing</li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: '#d0d0d0', lineHeight: '1.8' }}>
            Both approaches are used based on individual circumstances.
          </p>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        {/* Direct Plans & Regular Plans — Clear Difference */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Direct Plans & Regular Plans — Clear Difference
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>Direct Plans</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
                <li>Lower expense ratio</li>
                <li>Managed independently by the investor</li>
                <li>Requires self-monitoring and decision-making</li>
              </ul>
            </div>
            <div style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>Regular Plans</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
                <li>Includes distributor commission</li>
                <li>Preferred by investors who value service, support, and execution assistance</li>
                <li>Enables ongoing portfolio servicing</li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: '#d0d0d0', lineHeight: '1.8' }}>
            As an AMFI-registered Mutual Fund Distributor, BM Wealth facilitates regular plans for investors seeking
            structured support.
          </p>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        {/* SIP in One Minute */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            SIP in One Minute
          </h2>
          <div style={{ ...card, padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.9', fontSize: '16px' }}>
              <li>Recurring instruction into a mutual fund</li>
              <li>Disciplined participation over time</li>
              <li>Invests across market cycles</li>
              <li>Can be stepped up, paused, or changed</li>
              <li>Most useful with a clear goal and horizon</li>
            </ul>
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        {/* Who Typically Uses SIP */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Who Typically Uses SIP
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[
              'Working professionals',
              'Business owners',
              'Families planning long-term goals',
              'First-time investors',
              'High-net-worth investors',
            ].map((t) => (
              <div key={t} style={{ ...card, padding: '18px' }}>
                <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.6' }}>{t}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: '#d0d0d0', lineHeight: '1.8' }}>
            Usage depends on objectives, horizon, and comfort with market movements.
          </p>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        {/* Our Role */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#e5e5e5', lineHeight: '1.8' }}>BM Wealth operates as:</p>
            <ul style={{ margin: '0 0 18px 0', paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>AMFI-registered Mutual Fund Distributor</li>
              <li>IRDAI-licensed Insurance Intermediary</li>
            </ul>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#e5e5e5', lineHeight: '1.8' }}>Our role is to:</p>
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

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds Guide</Link> ·{' '}
            <Link href="/tools" style={{ color: '#C0A062', textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} />

        <section style={{ marginTop: '56px', marginBottom: '34px' }}>
          <h2 style={{ fontSize: '34px', color: '#DAA520', marginBottom: '14px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Closing Perspective
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#e5e5e5', margin: 0 }}>
            SIP is a method. Its effectiveness depends on clarity of purpose, consistency, and long-term perspective.
            A structured approach helps investors navigate markets with greater confidence and discipline.
          </p>
        </section>

        <section style={{ marginTop: '60px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#9a9a9a', marginBottom: '0' }}>
            Mutual fund investments are subject to market risks. Past performance does not guarantee future results.
            Investors are advised to read scheme-related documents carefully before investing.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SIPServices;

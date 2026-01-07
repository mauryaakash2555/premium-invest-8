'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
import { InsuranceCoverSnapshot } from '@/components/calculators/InsuranceCoverSnapshot';
import { getServiceLuxuryStyles } from '@/lib/ui/serviceLuxuryStyles';

const ACCENT = '#D6B36A';
const ACCENT_RGB = '214, 179, 106';

const TITLE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.78)';
const MUTED = 'rgba(255,255,255,0.62)';
const BORDER = 'rgba(255,255,255,0.12)';

const LUX_STYLES = getServiceLuxuryStyles({ accentRgb: ACCENT_RGB, title: TITLE, border: BORDER });

const Insurance = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PAGE_PATH = '/insurance';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Insurance';
  const description =
    'A structured way to protect what matters — with clear comparisons and servicing support.';

  const faqs = [
    {
      question: 'Do insurance policies guarantee claim approval?',
      answer:
        'Claims are assessed by the insurer based on policy terms, conditions, disclosures, and documentation. Final approval always rests with the insurer.',
    },
    {
      question: 'Is term insurance the same as investment?',
      answer:
        'No. Term insurance is designed for protection. Other policies may combine benefits, but suitability depends on goals and preferences.',
    },
    {
      question: 'How often should coverage be reviewed?',
      answer:
        'Many families review coverage after major life events (marriage, children, home loan, business change) and periodically as income and liabilities evolve.',
    },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: 'Insurance', item: pageUrl },
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
        id="insurance-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="insurance-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <section style={{ position: 'relative', padding: '120px 0 80px 0', textAlign: 'center', marginTop: '80px', overflow: 'hidden' }}>
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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(40px, 5vw, 60px)',
            fontWeight: '700',
            color: TITLE,
            marginBottom: '24px',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
          }}>
            Insurance
          </h1>
          <p style={{
            fontSize: '20px',
            color: BODY,
            maxWidth: '820px',
            margin: '0 auto 18px',
            lineHeight: '1.6'
          }}>
            A Structured Way to Protect What Matters
          </p>
          <p style={{ fontSize: '16px', color: MUTED, maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            Insurance is designed to transfer risk. The right structure depends on your responsibilities, liabilities,
            and the kind of protection you want in place.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            How Insurance Works (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Define protection need', d: 'Clarify responsibilities, liabilities, and the risks you want covered.' },
              { n: '2', t: 'Choose policy structure', d: 'Select type (term/health/general) and key features based on preference.' },
              { n: '3', t: 'Complete documentation', d: 'KYC, disclosures, and forms are aligned to insurer requirements.' },
              { n: '4', t: 'Ongoing servicing', d: 'Policy servicing and claims process support, where applicable.' },
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
            Types of Insurance (At a Glance)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Term Insurance', d: 'Focused on protection. Commonly used to secure family obligations and liabilities.' },
              { t: 'Health Insurance', d: 'Designed to help manage medical expenses based on policy structure and terms.' },
              { t: 'General Insurance', d: 'Covers categories like motor, home, travel, and other defined risks.' },
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
            Term vs Combined Policies — Neutral View
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Term Insurance</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Protection-first</li>
                <li>Focused on risk cover</li>
                <li>Chosen for clarity and simplicity</li>
              </ul>
            </div>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Combined Policies</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>May combine protection with other benefits</li>
                <li>Suitability depends on objective and preference</li>
                <li>Requires careful reading of terms and structure</li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            Both approaches are used based on individual circumstances.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Insurance in One Minute
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.9', fontSize: '16px' }}>
              <li>Defined protection for defined risks</li>
              <li>Structured through policy terms and disclosures</li>
              <li>Claims depend on documentation and conditions</li>
              <li>Best used with clarity on responsibilities</li>
              <li>Servicing matters over long horizons</li>
            </ul>
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Who Typically Uses Insurance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[
              'Working professionals',
              'Business owners',
              'Families planning long-term goals',
              'Retired individuals',
              'High-net-worth investors',
            ].map((t) => (
              <div key={t} className="svc-card" style={{ ...card, padding: '18px' }}>
                <p style={{ margin: 0, fontSize: '15px', color: BODY, lineHeight: '1.6' }}>{t}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            Usage depends on needs, liabilities, and preferences.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: BODY, lineHeight: '1.8' }}>BM Wealth operates as:</p>
            <ul style={{ margin: '0 0 18px 0', paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
              <li>IRDAI-licensed Insurance Intermediary</li>
              <li>AMFI-registered Mutual Fund Distributor</li>
            </ul>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: BODY, lineHeight: '1.8' }}>Our role is to:</p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
              <li>Facilitate access to products</li>
              <li>Explain structures and processes</li>
              <li>Support execution and servicing</li>
            </ul>
            <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
              Insurance decisions remain with the customer.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Cover Snapshot — Protection Band
          </h2>
          <InsuranceCoverSnapshot />
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Quick Start
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              If you want to act with clarity: start with your cover needs and then proceed with documentation support.
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

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: MUTED, marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/sip" style={{ color: ACCENT, textDecoration: 'underline' }}>SIP</Link> ·{' '}
            <Link href="/mutual-funds" style={{ color: ACCENT, textDecoration: 'underline' }}>Mutual Funds</Link> ·{' '}
            <Link href="/tools" style={{ color: ACCENT, textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} pageUrl={pageUrl} title="Questions People Quietly Ask" />

        <ClosingPerspective>
          Insurance works best when the structure is clear and the servicing is consistent. The goal is simple: protect what matters, with documentation and expectations aligned from day one.
        </ClosingPerspective>

        <section style={{ marginTop: '60px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#9a9a9a', marginBottom: 0 }}>
            Policy issuance and claims are subject to the insurer’s terms, conditions, and approval. Please read policy
            documents carefully.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Insurance;

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import BackToLiveIntelligence from '@/components/shared/BackToLiveIntelligence';
import RelatedServices from '@/components/seo/RelatedServices';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
import { SipGoalSnapshot } from '@/components/calculators/SipGoalSnapshot';
import { getServiceLuxuryStyles } from '@/lib/ui/serviceLuxuryStyles';
import { setupServiceMobilePulse } from '@/lib/ui/serviceMobilePulse';
import { trackEvent } from '@/lib/analytics/gtag';

const ACCENT = '#D6B36A';
const ACCENT_RGB = '214, 179, 106';

const TITLE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.78)';
const MUTED = 'rgba(255,255,255,0.62)';
const BORDER = 'rgba(255,255,255,0.12)';

const LUX_STYLES = getServiceLuxuryStyles({ accentRgb: ACCENT_RGB, title: TITLE, border: BORDER });

const SIPServices = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const cleanup = setupServiceMobilePulse();
    return cleanup;
  }, []);

  useEffect(() => {
    trackEvent?.('related_tool_impression', { tool: 'sip_vs_panic', page: '/sip' });
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

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'SIP Planning',
    name: 'SIP Investment',
    url: pageUrl,
    provider: {
      '@type': 'FinancialService',
      name: SITE_NAME,
      url: baseUrl,
    },
    areaServed: 'IN',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Wealth Management Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'SIP Planning',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mutual Fund Investment',
          },
        },
      ],
    },
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
        id="sip-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <section className="svc-hero" style={{ position: 'relative', padding: '120px 0 80px 0', textAlign: 'center', marginTop: '80px', overflow: 'hidden' }}>
        {/* Back to Live Intelligence */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <BackToLiveIntelligence />
        </div>
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
            SIP
          </h1>
          <p style={{ fontSize: '20px', color: BODY, maxWidth: '820px', margin: '0 auto 18px', lineHeight: '1.6' }}>
            A Method, Not a Product
          </p>
          <p style={{ fontSize: '16px', color: MUTED, maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            A Systematic Investment Plan (SIP) is a way of investing in mutual funds at regular intervals. It is commonly
            used for long-term participation with a disciplined, structured approach.
          </p>

        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '34px' }}>
          <div className="svc-card" style={{ padding: 22 }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: TITLE, fontWeight: 600 }}>
              Try the “SIP vs Panic Selling” simulator
            </h2>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: BODY, lineHeight: '1.7' }}>
              See, in rupees, what stopping a SIP during drawdowns can cost (education-only, post-tax approximation).
            </p>
            <div style={{ marginTop: 12 }}>
              <Link
                href="/intelligence/sip-vs-panic"
                data-ga-event="related_tool_click"
                data-ga-label="sip_to_sip_vs_panic"
                onClick={() => trackEvent?.('related_tool_click', { tool: 'sip_vs_panic', page: '/sip' })}
                style={{ color: `rgba(${ACCENT_RGB}, 0.95)`, textDecoration: 'underline', textUnderlineOffset: 4 }}
              >
                Open simulator →
              </Link>
            </div>
          </div>
        </section>
        {/* How SIP Works (Simple Flow) */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            How SIP Works (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Choose the fund', d: 'Pick a mutual fund category and scheme aligned to goal and time horizon.' },
              { n: '2', t: 'Set amount & date', d: 'Decide a sustainable amount and a date aligned to cashflow.' },
              { n: '3', t: 'Invest consistently', d: 'Invest at regular intervals across market cycles.' },
              { n: '4', t: 'Review periodically', d: 'Many investors review based on goals and life changes—not daily market moves.' },
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

        {/* SIP vs Lump Sum — Neutral Comparison */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            SIP vs Lump Sum — Neutral Comparison
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Systematic Investment (SIP)</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Periodic investing</li>
                <li>Reduces dependency on market timing</li>
                <li>Used for disciplined, long-term participation</li>
              </ul>
            </div>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Lump Sum Investment</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>One-time allocation</li>
                <li>Suitable when surplus funds are available</li>
                <li>Requires comfort with market timing</li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            Both approaches are used based on individual circumstances.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Direct Plans & Regular Plans — Clear Difference */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Direct Plans & Regular Plans — Clear Difference
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Direct Plans</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Lower expense ratio</li>
                <li>Managed independently by the investor</li>
                <li>Requires self-monitoring and decision-making</li>
              </ul>
            </div>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Regular Plans</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Includes distributor commission</li>
                <li>Preferred by investors who value service, support, and execution assistance</li>
                <li>Enables ongoing portfolio servicing</li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            As an AMFI-registered Mutual Fund Distributor, BM Wealth facilitates regular plans for investors seeking
            structured support.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* SIP in One Minute */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            SIP in One Minute
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.9', fontSize: '16px' }}>
              <li>Recurring instruction into a mutual fund</li>
              <li>Disciplined participation over time</li>
              <li>Invests across market cycles</li>
              <li>Can be stepped up, paused, or changed</li>
              <li>Most useful with a clear goal and horizon</li>
            </ul>
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Who Typically Uses SIP */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
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
              <div key={t} className="svc-card" style={{ ...card, padding: '18px' }}>
                <p style={{ margin: 0, fontSize: '15px', color: BODY, lineHeight: '1.6' }}>{t}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: '16px', color: MUTED, lineHeight: '1.8' }}>
            Usage depends on objectives, horizon, and comfort with market movements.
          </p>
        </section>

        <div aria-hidden="true" style={divider} />

        {/* Our Role */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: BODY, lineHeight: '1.8' }}>BM Wealth operates as:</p>
            <ul style={{ margin: '0 0 18px 0', paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
              <li>AMFI-registered Mutual Fund Distributor</li>
              <li>IRDAI-licensed Insurance Intermediary</li>
            </ul>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: BODY, lineHeight: '1.8' }}>Our role is to:</p>
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
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Goal Snapshot — SIP Projection
          </h2>
          <SipGoalSnapshot />
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Quick Start
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              If you want to start cleanly, use tools for scenarios first—then move to execution and servicing support.
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
            Related resources: <Link href="/mutual-funds" style={{ color: ACCENT, textDecoration: 'underline' }}>Mutual Funds</Link> ·{' '}
            <Link href="/tools" style={{ color: ACCENT, textDecoration: 'underline' }}>Tools</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} pageUrl={pageUrl} title="Questions People Quietly Ask" />

        <RelatedServices currentService="sip" />

        <ClosingPerspective>
          SIP is a method. Its effectiveness depends on clarity of purpose, consistency, and long-term perspective.
          A structured approach helps investors navigate markets with greater confidence and discipline.
        </ClosingPerspective>

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

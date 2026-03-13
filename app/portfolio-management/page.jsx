'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import BackToLiveIntelligence from '@/components/shared/BackToLiveIntelligence';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
import RelatedServices from '@/components/seo/RelatedServices';
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
    {
      question: 'What are the tax implications of PMS in India?',
      answer:
        'In PMS, you typically own the underlying securities directly, so taxation usually follows the tax rules applicable to those securities (for example, equity capital gains rules for equity shares). The exact impact depends on churn, holding periods, and the strategy; consult a tax professional.',
    },
    {
      question: 'Can NRIs invest in PMS?',
      answer:
        'Many PMS providers allow NRI participation, but eligibility, documentation, and repatriation rules can vary by provider and account type (NRE/NRO). It’s best to confirm onboarding requirements and compliance steps with the PMS provider before proceeding.',
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

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Portfolio Management Services (PMS)',
    name: 'Portfolio Management Services (PMS)',
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
            name: 'Portfolio Management Service',
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
        id="portfolio-management-service-schema"
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
            Portfolio Planning
          </h1>
          <p style={{ fontSize: '20px', color: BODY, maxWidth: '840px', margin: '0 auto 18px', lineHeight: '1.6' }}>
            A Structured Way to Allocate, Review, and Rebalance
          </p>
          <p style={{ fontSize: '16px', color: MUTED, maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            Portfolio planning is about designing a structure you can hold through cycles—then reviewing it with calm, periodic discipline.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '34px' }}>
          <div className="svc-card" style={{ padding: 22, textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: TITLE, fontWeight: 600 }}>
              Stress-test behavior during drawdowns
            </h2>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: BODY, lineHeight: '1.7' }}>
              Portfolio planning is mostly behavior. Use this education-only tool to see what stopping SIPs during crashes can cost.
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/intelligence/sip-vs-panic/guide"
                data-ga-event="tool_internal_link"
                data-ga-label="portfolio_mgmt_to_sip_vs_panic_guide"
                style={{ color: `rgba(${ACCENT_RGB}, 0.95)`, textDecoration: 'underline', textUnderlineOffset: 4, fontWeight: 600 }}
              >
                Read the crash guide →
              </Link>
              <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.25)' }}>
                •
              </span>
              <Link
                href="/intelligence/sip-vs-panic"
                data-ga-event="tool_open"
                data-ga-label="portfolio_mgmt_open_sip_vs_panic"
                style={{ color: `rgba(${ACCENT_RGB}, 0.95)`, textDecoration: 'underline', textUnderlineOffset: 4, fontWeight: 600 }}
              >
                Open simulator →
              </Link>
            </div>
          </div>
        </section>

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

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            What is Portfolio Management Services (PMS)?
          </h2>
          <div className="svc-card" style={card}>
            <p style={{ margin: 0, fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              Portfolio Management Services (PMS) is a SEBI-regulated investment service where a professional portfolio manager manages a portfolio of stocks,
              bonds, or other securities on behalf of a client. Unlike mutual funds, PMS typically gives you direct ownership of the underlying securities and
              visibility into every transaction and holding. The strategy is personalised based on your goals, risk profile, and constraints, and can differ meaningfully
              across providers (for example, concentrated vs diversified approaches, or value vs growth styles). In India, the regulatory minimum investment for PMS is
              ₹50 lakh.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            How BM Wealth Approaches PMS Distribution
          </h2>
          <div className="svc-card" style={card}>
            <p style={{ margin: 0, fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              BM Wealth is empanelled with multiple SEBI-registered PMS providers. We evaluate each provider on track record, strategy clarity, drawdown history,
              portfolio construction, and fee structure — not just headline returns. We also review concentration risk and turnover. Clients receive a written comparison
              before any recommendation so the trade-offs are clear and the decision remains deliberate.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            PMS vs Mutual Funds — Key Differences
          </h2>
          <div className="svc-card" style={{ ...card, padding: 0 }}>
            <div style={{ padding: '18px 20px 0 20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: MUTED, lineHeight: '1.75' }}>
                A neutral comparison. Exact details can vary by provider and scheme.
              </p>
            </div>
            <div style={{ overflowX: 'auto', padding: '14px 20px 20px 20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr>
                    {['Factor', 'PMS', 'Mutual Funds'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '12px 12px',
                          fontSize: '13px',
                          letterSpacing: '0.02em',
                          color: TITLE,
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      k: 'Direct ownership',
                      pms: 'Typically direct ownership of underlying securities in your name.',
                      mf: 'You own fund units; the scheme holds the underlying securities.',
                    },
                    {
                      k: 'Minimum investment',
                      pms: 'Regulatory minimum ₹50 lakh (India).',
                      mf: 'Often accessible with small amounts (e.g., SIPs).',
                    },
                    {
                      k: 'Customisation',
                      pms: 'Higher customisation potential based on mandate and provider policy.',
                      mf: 'Limited; investors follow a common scheme portfolio.',
                    },
                    {
                      k: 'Transparency',
                      pms: 'Detailed portfolio statements; transaction-level visibility is common.',
                      mf: 'Periodic portfolio disclosures; you typically don’t see each transaction.',
                    },
                    {
                      k: 'Tax treatment',
                      pms: 'Usually follows tax rules of underlying securities you own; depends on holding period and churn.',
                      mf: 'Tax depends on mutual fund category and holding period (per applicable rules).',
                    },
                  ].map((row) => (
                    <tr key={row.k}>
                      {[row.k, row.pms, row.mf].map((cell, i) => (
                        <td
                          key={`${row.k}-${i}`}
                          style={{
                            padding: '14px 12px',
                            fontSize: '14px',
                            lineHeight: '1.75',
                            color: i === 0 ? TITLE : BODY,
                            borderBottom: `1px solid ${BORDER}`,
                            verticalAlign: 'top',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <FAQSection faqs={faqs} pageUrl={pageUrl} title="Questions People Quietly Ask" />

        <RelatedServices currentService="portfolio-management" />

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

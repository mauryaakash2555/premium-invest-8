'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
import ClosingPerspective from '@/components/shared/ClosingPerspective';
import FAQSection from '@/components/shared/FAQSection';
import { FdMaturitySnapshot } from '@/components/calculators/FdMaturitySnapshot';
import { getServiceLuxuryStyles } from '@/lib/ui/serviceLuxuryStyles';

const ACCENT = '#D6B36A';
const ACCENT_RGB = '214, 179, 106';

const TITLE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.78)';
const MUTED = 'rgba(255,255,255,0.62)';
const BORDER = 'rgba(255,255,255,0.12)';

const LUX_STYLES = getServiceLuxuryStyles({ accentRgb: ACCENT_RGB, title: TITLE, border: BORDER });

const FixedDeposits = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PAGE_PATH = '/fixed-deposits';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Fixed Deposits (FD)';
  const description =
    'A structured way to park capital with predictability — with clarity on tenure, payout, and liquidity.';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: 'Fixed Deposits', item: pageUrl },
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

  const faqs = [
    {
      question: 'Are fixed deposits risk-free?',
      answer:
        'Fixed deposits are generally considered lower-risk compared to market-linked products, but the risk profile depends on the issuer and the terms. Always review the issuer, payout terms, and applicable protections before deciding.',
    },
    {
      question: 'Cumulative vs payout FD — what is the difference?',
      answer:
        'Cumulative FDs reinvest interest and pay at maturity. Payout FDs pay interest periodically (monthly/quarterly/annual) based on the chosen option.',
    },
    {
      question: 'What is FD laddering?',
      answer:
        'FD laddering means splitting the total amount into multiple deposits with different maturities so part of the money becomes available at regular intervals.',
    },
    {
      question: 'Can I break an FD early?',
      answer:
        'Many FDs allow premature withdrawal, but it may involve penalties or a different interest rate. Terms vary by institution—confirm before you invest.',
    },
    {
      question: 'How is FD interest taxed?',
      answer:
        'FD interest is typically taxable as per your income tax slab, and may attract TDS above certain thresholds. Please verify with official sources or your tax advisor for your situation.',
    },
    {
      question: 'How can BM Wealth help with fixed deposits?',
      answer:
        'We can help explain issuer options, tenure/payout choices, documentation flow, and maturity tracking. This is informational support; final terms depend on the issuing institution.',
    },
  ];

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
        id="fixed-deposits-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="fixed-deposits-article-schema"
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
            Fixed Deposits (FD)
          </h1>
          <p style={{
            fontSize: '20px',
            color: BODY,
            maxWidth: '820px',
            margin: '0 auto 18px',
            lineHeight: '1.6'
          }}>
            A Structured Way to Park Capital With Predictability
          </p>
          <p style={{ fontSize: '16px', color: MUTED, maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            Fixed deposits are commonly used for stability and known timelines. The right structure depends on tenure,
            payout preference, liquidity needs, and how you want maturities managed.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            How Fixed Deposits Work (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Choose the issuer', d: 'Select the institution based on your preference and terms offered.' },
              { n: '2', t: 'Set tenure & payout', d: 'Decide duration and whether interest is cumulative or periodic payout.' },
              { n: '3', t: 'Place the deposit', d: 'Complete documentation and place the deposit as per process.' },
              { n: '4', t: 'Manage maturity', d: 'Track maturity, renewal decisions, and any needed liquidity.' },
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
            Types of Fixed Deposits (At a Glance)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Cumulative FD', d: 'Interest is reinvested and paid at maturity. Often chosen for compounding.' },
              { t: 'Payout FD', d: 'Interest is paid out periodically (monthly/quarterly). Often chosen for income preference.' },
              { t: 'Tax-Saver FD', d: 'A fixed-tenure structure used by some investors for tax planning based on eligibility.' },
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
            Cumulative vs Payout — Neutral Comparison
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Cumulative</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Interest reinvested</li>
                <li>Paid at maturity</li>
                <li>Chosen for compounding preference</li>
              </ul>
            </div>
            <div className="svc-card" style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: TITLE, fontWeight: 600 }}>Payout</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
                <li>Periodic interest payout</li>
                <li>Useful for cashflow preference</li>
                <li>Chosen for income expectation management</li>
              </ul>
            </div>
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Laddering — A Simple Structure
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.85', color: BODY, margin: '0 0 18px 0' }}>
            Laddering means splitting money across multiple FDs with different maturities (instead of one long FD). This can improve flexibility because part of your money matures regularly.
          </p>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.9', fontSize: '16px' }}>
              <li>Helps avoid locking everything for one long tenure</li>
              <li>Creates periodic liquidity as deposits mature</li>
              <li>Reduces renewal timing dependency</li>
            </ul>
          </div>
        </section>

        <div aria-hidden="true" style={divider} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: BODY, lineHeight: '1.8' }}>Our role is to:</p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: BODY, lineHeight: '1.85', fontSize: '16px' }}>
              <li>Facilitate access and documentation</li>
              <li>Explain tenure, payout, and renewal choices</li>
              <li>Support tracking and maturity management</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Maturity Snapshot — FD Projection
          </h2>
          <FdMaturitySnapshot />
        </section>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: TITLE, marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Quick Start
          </h2>
          <div className="svc-card" style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '16px', color: BODY, lineHeight: '1.85' }}>
              If you want predictable timelines, decide the tenure and payout preference first—then proceed with issuer selection and documentation.
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
            Related resources: <Link href="/tools" style={{ color: ACCENT, textDecoration: 'underline' }}>Tools</Link> ·{' '}
            <Link href="/mutual-funds" style={{ color: ACCENT, textDecoration: 'underline' }}>Mutual Funds</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} pageUrl={pageUrl} title="Questions People Quietly Ask" />

        <ClosingPerspective>
          Fixed deposits are about predictability and timelines. When the structure is chosen thoughtfully—tenure, payout, and maturity management—they can play a calm, stabilizing role alongside growth assets.
        </ClosingPerspective>

        <section style={{ marginTop: '60px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#9a9a9a', marginBottom: 0 }}>
            Rates, terms, and conditions vary by institution. Please verify the latest details and read all documents
            carefully.
          </p>
        </section>

      </div>
    </div>
  );
};

export default FixedDeposits;




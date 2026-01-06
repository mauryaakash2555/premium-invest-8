'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
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
        id="fixed-deposits-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="fixed-deposits-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

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
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.96) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '52px',
            fontWeight: '700',
            color: '#DAA520',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Fixed Deposits (FD)
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            A Structured Way to Park Capital With Predictability
          </p>
          <p style={{ fontSize: '16px', color: '#d0d0d0', maxWidth: '920px', margin: '0 auto', lineHeight: '1.8' }}>
            Fixed deposits are commonly used for stability and known timelines. The right structure depends on tenure,
            payout preference, liquidity needs, and how you want maturities managed.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            How Fixed Deposits Work (Simple Flow)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { n: '1', t: 'Choose the issuer', d: 'Select the institution based on your preference and terms offered.' },
              { n: '2', t: 'Set tenure & payout', d: 'Decide duration and whether interest is cumulative or periodic payout.' },
              { n: '3', t: 'Place the deposit', d: 'Complete documentation and place the deposit as per process.' },
              { n: '4', t: 'Manage maturity', d: 'Track maturity, renewal decisions, and any needed liquidity.' },
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

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Types of Fixed Deposits (At a Glance)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Cumulative FD', d: 'Interest is reinvested and paid at maturity. Often chosen for compounding.' },
              { t: 'Payout FD', d: 'Interest is paid out periodically (monthly/quarterly). Often chosen for income preference.' },
              { t: 'Tax-Saver FD', d: 'A fixed-tenure structure used by some investors for tax planning based on eligibility.' },
            ].map((x) => (
              <div key={x.t} style={card}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: '15px', color: '#e5e5e5', lineHeight: '1.75' }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Cumulative vs Payout — Neutral Comparison
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>Cumulative</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
                <li>Interest reinvested</li>
                <li>Paid at maturity</li>
                <li>Chosen for compounding preference</li>
              </ul>
            </div>
            <div style={card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#DAA520', fontWeight: 600 }}>Payout</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
                <li>Periodic interest payout</li>
                <li>Useful for cashflow preference</li>
                <li>Chosen for income expectation management</li>
              </ul>
            </div>
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Laddering — A Simple Structure
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.85', color: '#e5e5e5', margin: '0 0 18px 0' }}>
            Laddering means splitting money across multiple FDs with different maturities (instead of one long FD). This can improve flexibility because part of your money matures regularly.
          </p>
          <div style={{ ...card, padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.9', fontSize: '16px' }}>
              <li>Helps avoid locking everything for one long tenure</li>
              <li>Creates periodic liquidity as deposits mature</li>
              <li>Reduces renewal timing dependency</li>
            </ul>
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 56px 0' }} />

        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Our Role
          </h2>
          <div style={{ ...card, padding: '24px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#e5e5e5', lineHeight: '1.8' }}>Our role is to:</p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.85', fontSize: '16px' }}>
              <li>Facilitate access and documentation</li>
              <li>Explain tenure, payout, and renewal choices</li>
              <li>Support tracking and maturity management</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/tools" style={{ color: '#C0A062', textDecoration: 'underline' }}>Tools</Link> ·{' '}
            <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds</Link>
          </p>
        </section>

        <section style={{ marginTop: '56px', marginBottom: '34px' }}>
          <h2 style={{ fontSize: '34px', color: '#DAA520', marginBottom: '14px', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
            Closing Perspective
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#e5e5e5', margin: 0 }}>
            Fixed deposits are about predictability and timelines. When the structure is chosen thoughtfully—tenure, payout, and maturity management—they can play a calm, stabilizing role alongside growth assets.
          </p>
        </section>

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




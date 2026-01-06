/**
 * FILE: app\fixed-deposits\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
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
import { getMetadataBase, SITE_NAME } from '@/lib/seo/metadata';
const FixedDeposits = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PAGE_PATH = '/fixed-deposits';
  const baseUrl = getMetadataBase().origin;
  const pageUrl = `${baseUrl}${PAGE_PATH}`;
  const title = 'Fixed Deposits (FD) — Educational Guide';
  const description =
    'Educational overview of fixed deposits: where they fit, laddering, liquidity, taxation basics, and common risks. No advice, no guarantees.';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: 'Fixed Deposits Guide', item: pageUrl },
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
        id="fixed-deposits-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="fixed-deposits-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
            Fixed Deposits (FD) — Educational Guide
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            A practical overview of where FDs fit, what to watch, and common mistakes.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '18px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Where fixed deposits usually fit
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {[
              { t: 'Emergency buffer', d: 'Some people keep part of their emergency funds in short-tenure deposits for stability.' },
              { t: 'Near-term goals', d: 'For goals with a known timeline, an FD tenure can match the date you need money.' },
              { t: 'Stability layer', d: 'FDs can act as the lower-volatility portion of a broader plan.' },
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
            Laddering (simple concept)
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Laddering means splitting money across multiple FDs with different maturities (instead of one long FD). This can improve flexibility because part of your money matures regularly.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(218, 165, 32, 0.18)', borderRadius: '12px', padding: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#e5e5e5', lineHeight: '1.8', fontSize: '16px' }}>
              <li>Helps avoid locking everything for one long tenure.</li>
              <li>Creates periodic liquidity (some money matures each year/quarter).</li>
              <li>Reduces reinvestment “timing” risk because you renew gradually.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/tools" style={{ color: '#C0A062', textDecoration: 'underline' }}>Tools</Link> ·{' '}
            <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds Guide</Link>
          </p>
        </section>

        <section style={{
          marginTop: '60px',
          padding: '24px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '0' }}>
            <strong>Educational disclaimer:</strong> {SITE_NAME} is not SEBI-registered. This page is for general educational information only and does not constitute investment advice. FD terms, rates, and taxation rules can change. Always read product terms and confirm current rules with official sources or a qualified professional.
          </p>
        </section>

      </div>
    </div>
  );
};

export default FixedDeposits;




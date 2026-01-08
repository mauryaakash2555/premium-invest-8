/**
 * FILE: app\sitemap-page\page.jsx
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
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';
const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });
const Sitemap = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sitemapData = {
    mainServices: [
      { name: 'Mutual Funds', path: '/mutual-funds' },
      { name: 'Portfolio Management', path: '/portfolio-management' },
      { name: 'Trading Services', path: '/trading-services' },
      { name: 'Insurance', path: '/insurance' },
      { name: 'Fixed Deposits', path: '/fixed-deposits' },
      { name: 'SIP Services', path: '/sip' }
    ],
    company: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about-us' },
      { name: 'Services', path: '/services' },
      { name: 'Contact', path: '/contact' },
      { name: 'Careers', path: '/careers' }
    ],
    legal: [
      { name: 'Compliance', path: '/compliance' },
      { name: 'Terms & Conditions', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Disclaimer', path: '/disclaimer' },
      { name: 'Refund Policy', path: '/refund' }
    ],
    resources: [
      { name: 'Blog', path: '/blog' },
      { name: 'Sitemap', path: '/sitemap' }
    ]
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>

      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      

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
            BM Wealth Sitemap
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Complete Website Navigation - Find Everything in One Place
          </p>
        </div>
      </section>

      <div className="bp-body" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          
          {/* Main Services */}
          <div>
            <h2 style={{ fontSize: '28px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
              Main Services
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sitemapData.mainServices.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '16px' }}>
                  <Link href={item.path} style={{
                    color: '#e5e5e5',
                    textDecoration: 'none',
                    fontSize: '17px',
                    lineHeight: '1.6',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#C0A062'}
                  onMouseLeave={(e) => e.target.style.color = '#e5e5e5'}>
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h2 style={{ fontSize: '28px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
              Company Information
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sitemapData.company.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '16px' }}>
                  <Link href={item.path} style={{
                    color: '#e5e5e5',
                    textDecoration: 'none',
                    fontSize: '17px',
                    lineHeight: '1.6',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#C0A062'}
                  onMouseLeave={(e) => e.target.style.color = '#e5e5e5'}>
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h2 style={{ fontSize: '28px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
              Legal & Compliance
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sitemapData.legal.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '16px' }}>
                  <Link href={item.path} style={{
                    color: '#e5e5e5',
                    textDecoration: 'none',
                    fontSize: '17px',
                    lineHeight: '1.6',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#C0A062'}
                  onMouseLeave={(e) => e.target.style.color = '#e5e5e5'}>
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h2 style={{ fontSize: '28px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
              Resources & Tools
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sitemapData.resources.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '16px' }}>
                  <Link href={item.path} style={{
                    color: '#e5e5e5',
                    textDecoration: 'none',
                    fontSize: '17px',
                    lineHeight: '1.6',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#C0A062'}
                  onMouseLeave={(e) => e.target.style.color = '#e5e5e5'}>
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Contact Section */}
        <section style={{ marginTop: '80px', padding: '40px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '12px', border: '1px solid rgba(192, 160, 98, 0.5)' }}>
          <h2 style={{ fontSize: '32px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', textAlign: 'center', fontFamily: '"Playfair Display", serif' }}>
            Contact Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', textAlign: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', color: '#C0A062', marginBottom: '12px', fontWeight: '600' }}>Phone</h3>
              <p style={{ fontSize: '17px', color: '#e5e5e5', lineHeight: '1.6' }}>+91 8850977259</p>
            </div>
            <div>
              <h3 style={{ fontSize: '20px', color: '#C0A062', marginBottom: '12px', fontWeight: '600' }}>Email</h3>
              <p style={{ fontSize: '17px', color: '#e5e5e5', lineHeight: '1.6' }}>support@bmwealth.co.in</p>
            </div>
            <div>
              <h3 style={{ fontSize: '20px', color: '#C0A062', marginBottom: '12px', fontWeight: '600' }}>Location</h3>
              <p style={{ fontSize: '17px', color: '#e5e5e5', lineHeight: '1.6' }}>Mumbai, Maharashtra</p>
            </div>
            <div>
              <h3 style={{ fontSize: '20px', color: '#C0A062', marginBottom: '12px', fontWeight: '600' }}>Registrations</h3>
              <p style={{ fontSize: '17px', color: '#e5e5e5', lineHeight: '1.6' }}>AMFI ARN 90008<br />IRDAI License 277925</p>
            </div>
          </div>
        </section>

        {/* Quick Links CTA */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', color: '#C0A062', marginBottom: '24px', fontWeight: '600' }}>
            Looking for a specific page?
          </h3>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{
              backgroundColor: '#DAA520',
              color: '#000',
              padding: '14px 32px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Contact
            </Link>
            <Link href="/services" style={{
              backgroundColor: 'transparent',
              color: '#DAA520',
              padding: '14px 32px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              border: '2px solid #DAA520'
            }}>
              Browse Services
            </Link>
          </div>
        </div>

        {/* SEO Content */}
        <section style={{ marginTop: '80px' }}>
          <h2 style={{ fontSize: '32px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            About BM Wealth Mumbai
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            BM Wealth is a Mumbai-based wealth distribution and insurance support firm. We are an AMFI registered mutual fund distributor (ARN 90008) and an IRDAI licensed insurance distributor (License 277925), operating with disclosure-led processes and regulatory compliance.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Our services and resources span mutual funds (including SIP setup), insurance, trading & demat onboarding, fixed deposits, and portfolio planning. Where applicable, we may assist with execution support or introductions to regulated third-party providers.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Investments are subject to market risks. Read all related documents carefully and consider your own situation before acting.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Sitemap;




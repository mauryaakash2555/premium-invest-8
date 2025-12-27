'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0a0a0a',
      color: '#fff',
      padding: '40px 20px',
      fontFamily: '"Inter", sans-serif',
      width: '100%',
      marginTop: 'auto',
      paddingBottom: '100px',
    }}>
      {/* SEBI Disclaimer */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '30px' }}>
        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#999' }}>
          <strong style={{ color: '#DAA520' }}>SEBI Disclaimer:</strong> Investments in securities market are subject to market risks. Read all related documents carefully before investing.
        </p>
      </div>

      {/* Footer Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
        {/* Company Info */}
        <div>
          <h3 style={{ fontSize: '24px', fontFamily: "'Playfair Display', serif", color: '#DAA520', marginBottom: '16px' }}>BM Wealth</h3>
          <p style={{ color: '#999', fontSize: '14px' }}>Premium Financial Advisory</p>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>Empowering investors with tailored financial solutions in Mumbai.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ fontSize: '16px', color: '#DAA520', marginBottom: '16px' }}>Quick Links</h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
            <Link href="/about-us" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>About Us</Link>
            <Link href="/services" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Services</Link>
            <Link href="/blog" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
            <Link href="/contact" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Contact</Link>
          </nav>
        </div>

        {/* Legal */}
        <div>
          <h3 style={{ fontSize: '16px', color: '#DAA520', marginBottom: '16px' }}>Legal</h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/terms" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Terms & Conditions</Link>
            <Link href="/privacy" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link>
            <Link href="/disclaimer" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Disclaimer</Link>
            <Link href="/refund" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Refund Policy</Link>
            <Link href="/compliance" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Compliance</Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ fontSize: '16px', color: '#DAA520', marginBottom: '16px' }}>Contact Us</h3>
          <p style={{ color: '#aaa', fontSize: '14px' }}>Phone: +91 8850977259</p>
          <p style={{ color: '#aaa', fontSize: '14px' }}>Email: support@bmwealth.co.in</p>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '10px' }}>Mumbai, Maharashtra</p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ maxWidth: '1200px', margin: '30px auto 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
        <p style={{ color: '#666', fontSize: '13px' }}>© 2025 BM Wealth. All rights reserved.</p>
        <p style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>IRDAI Licensed | AMFI Registered</p>
      </div>
    </footer>
  );
};

export default Footer;

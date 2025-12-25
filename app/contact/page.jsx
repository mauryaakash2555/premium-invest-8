"use client";

import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div>
      <section style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)' }}>
        <div className="section-container" style={{ textAlign: 'center' }}>
          <h1 className="golden-gradient" style={{ fontSize: 'clamp(28px, 4vw, 56px)', marginBottom: '24px' }}>Contact Us</h1>
          <p style={{ fontSize: '18px', color: '#C0A062', maxWidth: '700px', margin: '0 auto' }}>
            Get in touch with our expert financial advisors
          </p>
        </div>
      </section>

      <section className="section-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
            <Phone size={40} style={{ color: '#DAA520', marginBottom: '16px' }} />
            <h3 style={{ color: '#DAA520', marginBottom: '12px' }}>Phone</h3>
            <a href="tel:+918850977259" style={{ color: '#CCCCCC', fontSize: '18px' }}>+91 8850977259</a>
          </div>
          <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
            <Mail size={40} style={{ color: '#DAA520', marginBottom: '16px' }} />
            <h3 style={{ color: '#DAA520', marginBottom: '12px' }}>Email</h3>
            <a href="mailto:support@bmwealth.co.in" style={{ color: '#CCCCCC', fontSize: '18px' }}>support@bmwealth.co.in</a>
          </div>
          <div className="glass-effect" style={{ padding: '30px', textAlign: 'center' }}>
            <MapPin size={40} style={{ color: '#DAA520', marginBottom: '16px' }} />
            <h3 style={{ color: '#DAA520', marginBottom: '12px' }}>Location</h3>
            <p style={{ color: '#CCCCCC', fontSize: '18px' }}>Mumbai, Maharashtra</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <a href="https://wa.me/918850977259" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <MessageCircle size={20} /> Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}




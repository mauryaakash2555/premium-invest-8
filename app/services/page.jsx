"use client";

import Link from 'next/link';
import { PieChart, TrendingUp, CreditCard, Shield, DollarSign, Repeat, ArrowRight } from 'lucide-react';

const services = [
  { icon: PieChart, title: 'Mutual Funds', desc: 'Diversified investment options with expert fund selection.', link: '/mutual-funds' },
  { icon: TrendingUp, title: 'Portfolio Management', desc: 'Personalized wealth management strategies.', link: '/portfolio-management' },
  { icon: CreditCard, title: 'Trading Services', desc: 'Real-time market access with advanced tools.', link: '/trading-services' },
  { icon: Shield, title: 'Insurance', desc: 'Comprehensive life and health insurance plans.', link: '/insurance' },
  { icon: DollarSign, title: 'Fixed Deposits', desc: 'Secure returns with competitive rates.', link: '/fixed-deposits' },
  { icon: Repeat, title: 'SIP', desc: 'Systematic Investment Plans for disciplined investing.', link: '/sip' },
];

export default function Services() {
  return (
    <div>
      <section style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)' }}>
        <div className="section-container" style={{ textAlign: 'center' }}>
          <h1 className="golden-gradient" style={{ fontSize: 'clamp(28px, 4vw, 56px)', marginBottom: '24px' }}>Our Services</h1>
          <p style={{ fontSize: '18px', color: '#C0A062', maxWidth: '700px', margin: '0 auto' }}>
            Comprehensive financial solutions tailored to your wealth creation goals
          </p>
        </div>
      </section>

      <section className="section-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {services.map((service, i) => (
            <Link key={i} href={service.link} style={{ textDecoration: 'none' }}>
              <div className="service-card">
                <div style={{ color: '#DAA520', marginBottom: '16px' }}><service.icon size={40} /></div>
                <h3 style={{ fontSize: '24px', color: '#DAA520', marginBottom: '12px' }}>{service.title}</h3>
                <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6, marginBottom: '16px' }}>{service.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C0A062' }}>
                  <span>Learn More</span><ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}




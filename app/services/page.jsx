/**
 * FILE: app\services\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - lucide-react
 * - next/link
 * - react
 * - @/components/user/LazyImage
 * - @/components/user/MobileScrollBoost
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

import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';
import FAQSection from '@/components/shared/FAQSection';
import { getServicesForServicesPage } from '@/data/servicesCatalog';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';
import { getServiceLuxuryStyles } from '@/lib/ui/serviceLuxuryStyles';
import ServicesShowcase from './ServicesShowcase';

const LUX = {
  background: 'oklch(0.06 0.005 280)',
  foreground: 'oklch(0.95 0.01 85)',
  foreground80: 'oklch(0.95 0.01 85 / 0.80)',
  foreground60: 'oklch(0.95 0.01 85 / 0.60)',
  foreground40: 'oklch(0.95 0.01 85 / 0.40)',
  foreground10: 'oklch(0.95 0.01 85 / 0.10)',
  foreground05: 'oklch(0.95 0.01 85 / 0.05)',
  card: 'oklch(0.10 0.005 280)',
  accent: 'oklch(0.78 0.08 65)',
};

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({
  scopeSelector: '.bp-body',
  title: LUX.foreground,
  body: LUX.foreground60,
  muted: LUX.foreground40,
});

const SERVICE_LUXURY_STYLES = getServiceLuxuryStyles({
  accentColor: LUX.accent,
  title: LUX.foreground,
  border: LUX.foreground10,
  shellBg: LUX.background,
});

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = getServicesForServicesPage();

  const faqs = [
    {
      question: 'How does the process work?',
      answer:
        'We start with your goals and constraints, then help you compare suitable options, assist with execution and documentation, and support periodic reviews over time.',
    },
    {
      question: 'Which service should I start with?',
      answer:
        'If you want your core strategy set first, start with Portfolio Management (PMS). From there, Mutual Funds and SIP can be used for disciplined execution. You can also explore our free tools to understand scenarios before taking action.',
    },
    {
      question: 'Can I speak to someone before starting?',
      answer:
        'Yes. Use the Contact page to reach us, and we will guide you to the right next step based on your requirements and eligibility.',
    },
    {
      question: 'Are affiliate links used on the website?',
      answer:
        'Some platform links may be affiliate links. If you sign up through them, we may earn a commission at no extra cost to you.',
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div
      className="svc-shell"
      style={{
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        background: LUX.background,
        color: LUX.foreground,
        ['--lux-background']: LUX.background,
        ['--lux-foreground']: LUX.foreground,
        ['--lux-foreground-80']: LUX.foreground80,
        ['--lux-foreground-60']: LUX.foreground60,
        ['--lux-foreground-40']: LUX.foreground40,
        ['--lux-foreground-10']: LUX.foreground10,
        ['--lux-foreground-05']: LUX.foreground05,
        ['--lux-card']: LUX.card,
        ['--lux-accent']: LUX.accent,
      }}
    >
      <script
        id="services-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <style>{`
        /* Prevent accidental horizontal overflow in Services page */
        .svc-shell * {
          box-sizing: border-box;
        }

        @media (max-width: 640px) {
          .services-section-pad {
            padding: 56px 16px !important;
          }
          .services-cta-card {
            padding: 28px 18px !important;
          }
        }

        /* Technical-luxury page treatment (body only, no animation) */
        .svc-tech {
          position: relative;
          isolation: isolate;
        }
        .svc-tech > * {
          position: relative;
          z-index: 1;
        }
        .svc-tech::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.55;
          background:
            /* subtle blueprint grid */
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.035) 0px,
              rgba(255,255,255,0.035) 1px,
              transparent 1px,
              transparent 22px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.03) 0px,
              rgba(255,255,255,0.03) 1px,
              transparent 1px,
              transparent 22px
            );
          mask-image: radial-gradient(1200px 520px at 50% 10%, rgba(0,0,0,0.75), transparent 70%);
        }
        .svc-tech::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.9;
          background:
            radial-gradient(820px 420px at 85% 10%, oklch(0.95 0.01 85 / 0.06), transparent 65%),
            radial-gradient(900px 520px at 50% 100%, rgba(0,0,0,0.55), transparent 60%);
        }

        @supports not (mask-image: radial-gradient(white, transparent)) {
          .svc-tech::before { opacity: 0.35; }
        }

        /* Grain texture overlay */
        .svc-grain {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          opacity: 0.025;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* Luxury glassmorphism cards */
        .lux-glass {
          background: linear-gradient(135deg, oklch(0.95 0.01 85 / 0.03), oklch(0.95 0.01 85 / 0.01));
          border: 1px solid oklch(0.95 0.01 85 / 0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 0;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 oklch(0.95 0.01 85 / 0.05);
        }

        /* Luxury CTA - Primary (solid with hover fill) */
        .lux-cta-primary {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 32px;
          background: oklch(0.95 0.01 85);
          color: oklch(0.06 0.005 280);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          border-radius: 0;
          cursor: pointer;
          transition: color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Ensure CTA content is always visible (prevents accidental inherited white-on-white) */
        .lux-cta-primary > span,
        .lux-cta-primary > svg {
          color: oklch(0.06 0.005 280);
        }

        .lux-cta-ghost > span,
        .lux-cta-ghost > svg {
          color: oklch(0.95 0.01 85 / 0.88);
        }
        .lux-cta-primary > span,
        .lux-cta-primary > svg {
          position: relative;
          z-index: 2;
        }
        .lux-cta-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: oklch(0.78 0.08 65);
          transform: translateX(-101%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }
        .lux-cta-primary:hover {
          color: oklch(0.06 0.005 280);
        }
        .lux-cta-primary:hover::before {
          transform: translateX(0);
        }
        .lux-cta-primary:hover svg {
          transform: translateX(4px);
        }
        .lux-cta-primary svg {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Luxury CTA - Ghost (border only) */
        .lux-cta-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 32px;
          background: oklch(0.95 0.01 85 / 0.04);
          color: oklch(0.95 0.01 85 / 0.85);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid oklch(0.95 0.01 85 / 0.12);
          border-radius: 0;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lux-cta-ghost:hover {
          background: oklch(0.78 0.08 65);
          border-color: oklch(0.78 0.08 65);
          color: oklch(0.06 0.005 280);
        }
        .lux-cta-ghost svg {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lux-cta-ghost:hover svg {
          transform: translateX(4px);
        }

        /* Luxury labels */
        .lux-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: oklch(0.78 0.08 65);
        }

        /* Luxury headline */
        .lux-headline {
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: oklch(0.95 0.01 85);
        }

        /* Luxury body text */
        .lux-body {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
          line-height: 1.9;
          letter-spacing: 0.01em;
          color: oklch(0.95 0.01 85 / 0.55);
        }

        /* Horizontal animated line */
        .lux-line {
          height: 1px;
          background: linear-gradient(90deg, oklch(0.78 0.08 65), oklch(0.78 0.08 65 / 0));
        }

        /* Section divider */
        .lux-divider {
          height: 1px;
          background: oklch(0.95 0.01 85 / 0.06);
        }
      `}</style>

      {/* Grain texture overlay */}
      <div className="svc-grain" aria-hidden="true" />

      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      <style dangerouslySetInnerHTML={{ __html: SERVICE_LUXURY_STYLES }} />
      
      {/* Hero Section */}
      <section
        style={{
          minHeight: '70vh',
          maxHeight: '70vh',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            filter: 'brightness(1.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            data-testid="services-heading"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: LUX.accent,
            }}
          >
            Our Services
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: LUX.foreground60,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Premium wealth services with a process-led approach and clear documentation
          </p>
        </div>
      </section>

      <div className="bp-body svc-tech">
      {/* Start Here */}
      <section className="section-container" style={{ marginTop: 'clamp(40px, 6vw, 64px)' }}>
        <div className="lux-glass" style={{ padding: 'clamp(32px, 5vw, 48px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span className="lux-label">Quick Start</span>
            <div className="lux-line" style={{ width: '64px' }} />
          </div>
          <h2 className="lux-headline" style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '16px' }}>
            Begin in 60 seconds
          </h2>
          <p className="lux-body" style={{ fontSize: 'clamp(15px, 2vw, 17px)', maxWidth: '700px', marginBottom: '32px' }}>
            Explore our tools for clarity before you act. For execution and documentation support, reach us directly.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <Link href="/tools" className="lux-cta-primary">
              <span>Explore Tools</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="lux-cta-ghost">
              <span>Contact Us</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <ServicesShowcase services={services} />

      {/* Why Choose BM Wealth - NEW CONTENT SECTION */}
      <section style={{ 
        background: 'linear-gradient(180deg, var(--lux-background) 0%, color-mix(in oklab, var(--lux-background) 70%, black 30%) 100%)', 
        padding: 'clamp(56px, 8vw, 80px) 20px' 
      }}>
        <div className="section-container">
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontFamily: '"Playfair Display", serif',
            color: 'var(--lux-foreground-80)',
            textAlign: 'center',
            marginBottom: '24px',
            fontWeight: '600'
          }}>
            Why Choose BM Wealth for Your Financial Journey?
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 18px)',
            color: 'var(--lux-foreground-60)',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto 60px',
            lineHeight: '1.8'
          }}>
            Mumbai's financial landscape is complex and competitive. At BM Wealth, we bring together regulatory 
            expertise, market intelligence, and personalized service to help you navigate your wealth creation 
            journey with confidence. Here's what sets us apart in Mumbai's crowded wealth services space.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '64px'
          }}>
            <div className="lux-glass" style={{ padding: 'clamp(28px, 4vw, 40px)' }}>
              <div className="lux-label" style={{ marginBottom: '16px' }}>Certification</div>
              <h3 className="lux-headline" style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: '16px' }}>
                PMS Certified
              </h3>
              <p className="lux-body" style={{ fontSize: '15px', marginBottom: '12px' }}>
                PMS Certification No. 2430447816. Portfolio-first operating rhythm with documented decisions, review cadence, and clear accountability.
              </p>
              <p style={{ fontSize: '14px', color: 'oklch(0.95 0.01 85 / 0.40)', lineHeight: '1.7' }}>
                Credential-led service keeps the process disciplined across market cycles.
              </p>
            </div>

            <div className="lux-glass" style={{ padding: 'clamp(28px, 4vw, 40px)' }}>
              <div className="lux-label" style={{ marginBottom: '16px' }}>Local Expertise</div>
              <h3 className="lux-headline" style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: '16px' }}>
                Mumbai-Focused
              </h3>
              <p className="lux-body" style={{ fontSize: '15px', marginBottom: '12px' }}>
                Based in Mumbai's financial district. We understand property vs. SIP decisions, tax optimization, and strategies tailored to Mumbai's economic reality.
              </p>
              <p style={{ fontSize: '14px', color: 'oklch(0.95 0.01 85 / 0.40)', lineHeight: '1.7' }}>
                Navigate Mumbai's high cost of living and real estate dynamics with confidence.
              </p>
            </div>

            <div className="lux-glass" style={{ padding: 'clamp(28px, 4vw, 40px)' }}>
              <div className="lux-label" style={{ marginBottom: '16px' }}>Regulatory</div>
              <h3 className="lux-headline" style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: '16px' }}>
                AMFI & IRDAI Licensed
              </h3>
              <p className="lux-body" style={{ fontSize: '15px', marginBottom: '12px' }}>
                AMFI Registration (ARN 90008) for mutual funds. IRDAI license (277925) for insurance. Disclosure-led and regulation-aligned.
              </p>
              <p style={{ fontSize: '14px', color: 'oklch(0.95 0.01 85 / 0.40)', lineHeight: '1.7' }}>
                Documentation, communication, and suitability standards kept clear and consistent.
              </p>
            </div>

            <div className="lux-glass" style={{ padding: 'clamp(28px, 4vw, 40px)' }}>
              <div className="lux-label" style={{ marginBottom: '16px' }}>Philosophy</div>
              <h3 className="lux-headline" style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: '16px' }}>
                Holistic Planning
              </h3>
              <p className="lux-body" style={{ fontSize: '15px', marginBottom: '12px' }}>
                We architect comprehensive wealth solutions—mutual funds, insurance, SIPs, portfolio management, and tax planning unified with your life goals.
              </p>
              <p style={{ fontSize: '14px', color: 'oklch(0.95 0.01 85 / 0.40)', lineHeight: '1.7' }}>
                From your first SIP to legacy wealth transfer—partners at every stage.
              </p>
            </div>

            <div className="lux-glass" style={{ padding: 'clamp(28px, 4vw, 40px)' }}>
              <div className="lux-label" style={{ marginBottom: '16px' }}>Transparency</div>
              <h3 className="lux-headline" style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: '16px' }}>
                Fee-Based Model
              </h3>
              <p className="lux-body" style={{ fontSize: '15px', marginBottom: '12px' }}>
                No hidden charges. Transparent distributor commissions from fund houses (AMFI-permitted) and clearly disclosed advisory fees.
              </p>
              <p style={{ fontSize: '14px', color: 'oklch(0.95 0.01 85 / 0.40)', lineHeight: '1.7' }}>
                Recommendations based on your interests, not commission maximization.
              </p>
            </div>

            <div className="lux-glass" style={{ padding: 'clamp(28px, 4vw, 40px)' }}>
              <div className="lux-label" style={{ marginBottom: '16px' }}>Track Record</div>
              <h3 className="lux-headline" style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: '16px' }}>
                Client Trust
              </h3>
              <p className="lux-body" style={{ fontSize: '15px', marginBottom: '12px' }}>
                Trusted by 500+ Mumbai investors. Professionals, entrepreneurs, executives, and HNW families. 85%+ retention rate.
              </p>
              <p style={{ fontSize: '14px', color: 'oklch(0.95 0.01 85 / 0.40)', lineHeight: '1.7' }}>
                Many clients 5+ years with us through market cycles and life events.
              </p>
            </div>
          </div>

          <div className="lux-glass" style={{ padding: 'clamp(40px, 6vw, 64px)', textAlign: 'center' }}>
            <div className="lux-label" style={{ marginBottom: '20px' }}>Our Approach</div>
            <h3 className="lux-headline" style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '24px' }}>
              Investment Philosophy
            </h3>
            <div className="lux-line" style={{ width: '80px', margin: '0 auto 32px' }} />
            <p className="lux-body" style={{ fontSize: 'clamp(15px, 2vw, 17px)', maxWidth: '800px', margin: '0 auto 24px' }}>
              Wealth creation is a marathon. Disciplined SIP investing, life-stage asset allocation, tax-efficient structuring, and regular rebalancing. We focus on sustainable, long-term building—not market fads or unrealistic promises.
            </p>
            <p className="lux-body" style={{ fontSize: 'clamp(15px, 2vw, 17px)', maxWidth: '800px', margin: '0 auto' }}>
              Every situation is unique. A ₹25,000/month SIP for a 28-year-old IT professional looks different from a ₹2 lakh/month portfolio for a 45-year-old business owner. We customize based on income, expenses, risk tolerance, time horizon, and life goals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="services-section-pad"
        style={{
          background: LUX.background,
          padding: 'clamp(64px, 10vw, 100px) 20px',
        }}
      >
        <div className="section-container">
          <div className="lux-glass" style={{ padding: 'clamp(48px, 7vw, 80px)', textAlign: 'center' }}>
            <div className="lux-label" style={{ marginBottom: '20px' }}>Ready to Start</div>
            <h2 className="lux-headline" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginBottom: '20px' }}>
              Begin Your Journey
            </h2>
            <div className="lux-line" style={{ width: '80px', margin: '0 auto 28px' }} />
            <p className="lux-body" style={{ fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: '600px', margin: '0 auto 40px' }}>
              For execution and documentation support, reach us via WhatsApp or the contact page.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="services-whatsapp-cta"
                className="lux-cta-primary"
              >
                <span>Message on WhatsApp</span>
                <ArrowRight size={16} />
              </a>
              <Link href="/contact" data-testid="services-contact-cta" className="lux-cta-ghost">
                <span>Contact Us</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FAQSection title="Questions People Quietly Ask" faqs={faqs} pageUrl="https://bmwealth.co.in/services" />

      {/* Risk & Disclosure */}
      <section className="section-container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="lux-divider" style={{ marginBottom: '24px' }} />
        <p style={{ fontSize: '11px', lineHeight: '1.7', color: 'oklch(0.95 0.01 85 / 0.35)', letterSpacing: '0.04em', margin: 0 }}>
          Investments are subject to market risks. Read all related documents carefully and consider your own situation before acting.
        </p>
      </section>
      </div>
    </div>
  );
};

export default Services;





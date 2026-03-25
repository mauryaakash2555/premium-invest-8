'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import MobileScrollBoost from '@/components/user/MobileScrollBoost';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });

export default function BestCreditCardsIndiaPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />

      {/* Hero Section */}
      <section
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
          paddingBottom: '50px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/6th.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.42,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0.35) 100%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '900px' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              marginBottom: '20px',
              fontWeight: 300,
              letterSpacing: '3px',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
              lineHeight: 1.2,
            }}
          >
            Best Credit Cards in India
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2.2vw, 20px)',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Shortlist the right card in 2 minutes. We help you pick and execute.
          </p>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="bp-body" style={{ padding: '40px 0 0', width: '100%' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              How to Choose the Best Credit Card
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              Choosing a credit card is not about picking the one with the flashiest branding — it is about aligning the card&apos;s fee structure, reward mechanics, and credit limit with your actual spending patterns. A card that rewards dining and travel is pointless if 80% of your spend is on fuel and groceries. Start by listing your top three spending categories and find cards that reward those categories disproportionately.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              Beyond rewards, evaluate the annual fee relative to the value you will extract. A ₹5,000 annual fee card that returns ₹12,000 in lounge access, fuel surcharge waivers, and accelerated points is a net positive. A ₹500 fee card with negligible benefits may cost you more in missed opportunities. Always calculate the effective return rate on spend before committing.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              Understanding Reward Points
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              Reward points are earned on eligible transactions and can be redeemed for cashback, air miles, merchandise, or statement credits. The value per point varies widely — some banks offer 0.25 paise per point while premium cards offer 1.00+ paise per point. The key metric is <strong style={{ color: 'rgba(255,255,255,0.92)' }}>reward rate</strong>: (point value × points earned per ₹100 spent) ÷ 100.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              Watch out for reward point expiry, capped monthly earning limits, and category exclusions (fuel, utility, government payments are commonly excluded). Always check the card&apos;s Most Important Terms and Conditions (MITC) document for the precise earning and redemption rules.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              Annual Fee vs Cashback — What Really Matters
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              Lifetime free credit cards (LTF) have no annual fee and work well for low-to-moderate spenders (under ₹5 lakh/year). Annual fee cards start making sense when the combined reward value, complimentary lounge visits, golf access, insurance covers, and milestone benefits exceed the fee by a comfortable margin.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              Cashback cards give a flat percentage back (1%–5% on select categories). Reward-point cards offer potentially higher returns but require active redemption. Frequent travellers may prefer air miles cards, while everyday spenders often do better with simple cashback.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              Eligibility for Credit Cards in India
            </h2>
            <ul style={{ paddingLeft: '20px', margin: 0, listStyle: 'disc' }}>
              {[
                'Age: 21–60 years (primary cardholder). Some banks allow 18+ for add-on cards.',
                'Income: Minimum ₹2.5–₹4 lakh annual income for entry-level cards; ₹12 lakh+ for premium cards.',
                'Credit score: 750+ on CIBIL for best approval odds. Some banks approve at 700+ with income proof.',
                'Employment: Salaried or self-employed with verifiable income. NRIs are eligible through select banks.',
                'Existing relationship: Having a savings or salary account with the issuing bank often improves approval chances and credit limits.',
              ].map((item, i) => (
                <li key={i} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, marginBottom: '8px' }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="bp-body" style={{ padding: '20px 0 40px', width: '100%' }}>
        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#1</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              AXIS BANK
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Credit cards with wide approval and fast onboarding.
            </p>
          </div>
          <div className="platform-button">
            <Link href="/execution-partners" className="btn-primary">
              <span>GET CARD SHORTLIST</span>
            </Link>
          </div>
        </MobileScrollBoost>

        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#2</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              HDFC BANK
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Popular credit cards with broad eligibility.
            </p>
          </div>
          <div className="platform-button">
            <Link href="/execution-partners" className="btn-primary">
              <span>GET CARD SHORTLIST</span>
            </Link>
          </div>
        </MobileScrollBoost>

        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#3</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              YES BANK POP CLUB
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Digital-first credit card experience.
            </p>
          </div>
          <div className="platform-button">
            <Link href="/execution-partners" className="btn-primary">
              <span>GET CARD SHORTLIST</span>
            </Link>
          </div>
        </MobileScrollBoost>

        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#4</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              IDFC FIRST BANK
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Simple credit cards with transparent features.
            </p>
          </div>
          <div className="platform-button">
            <Link href="/execution-partners" className="btn-primary">
              <span>GET CARD SHORTLIST</span>
            </Link>
          </div>
        </MobileScrollBoost>

        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#5</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              AU BANK
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Fast approval credit card options.
            </p>
          </div>
          <div className="platform-button">
            <Link href="/execution-partners" className="btn-primary">
              <span>GET CARD SHORTLIST</span>
            </Link>
          </div>
        </MobileScrollBoost>

        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#6</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              INDUSIND BANK
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Premium cards for established credit profiles.
            </p>
          </div>
          <div className="platform-button">
            <Link href="/execution-partners" className="btn-primary">
              <span>GET CARD SHORTLIST</span>
            </Link>
          </div>
        </MobileScrollBoost>

        <div style={{ textAlign: 'center', padding: '40px 20px 0' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
            Educational shortlist. Final application happens on official bank channels.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '0 20px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 20px', letterSpacing: '1px' }}>
            Frequently Asked Questions
          </h2>
          {[
            { q: 'What is the ideal number of credit cards to hold?', a: 'Most financial advisors recommend 2\u20133 cards that cover your main spending categories without overlapping benefits. Too many cards increase the risk of missed payments and make tracking expenses harder.' },
            { q: 'How does credit utilization ratio affect my score?', a: 'Credit utilization is the percentage of your total available credit that you are using at any time. Keeping it below 30% is good; below 10% is excellent. High utilization signals risk to credit bureaus and can lower your score.' },
            { q: 'Should I convert large purchases to EMI?', a: 'EMI conversions make sense when the interest rate offered is lower than what you would earn by keeping cash invested. Many banks offer 0% or low-interest EMI on partner merchants. Always confirm the processing fee and total cost before converting.' },
            { q: 'What happens if I miss a credit card payment?', a: 'Missing a payment results in late fees (up to ₹1,300 on some cards), interest charges on the outstanding balance (typically 3.5% per month or 42% per annum), and a negative mark on your credit report. Set up auto-pay for at least the minimum due to avoid this.' },
            { q: 'Are co-branded credit cards worth it?', a: 'Co-branded cards offer higher rewards on purchases with the partner brand (airline, hotel, retailer). They are worth it if you are already a loyal customer of that brand. Otherwise, a general-purpose rewards card with flexible redemption typically delivers better value.' },
          ].map((faq, i) => (
            <details key={i} style={{ marginBottom: '12px', border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.02)', padding: '14px 18px' }}>
              <summary style={{ fontSize: '15px', color: 'rgba(255,255,255,0.90)', fontWeight: 600, cursor: 'pointer', lineHeight: 1.5 }}>{faq.q}</summary>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.85, margin: '10px 0 0' }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ padding: '0 20px 60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '18px 20px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: 'rgba(255,255,255,0.60)' }}>Disclaimer:</strong> This page is for educational purposes only and does not constitute financial advice. Credit card features, fees, and eligibility criteria are indicative and subject to change by the issuing bank. BM Wealth does not process credit card applications or make approval decisions. Always review the official MITC document on the bank&apos;s website before applying. AMFI ARN 90008 | IRDAI 277925
          </p>
        </div>
      </section>

      <style>{`
        .platform-card {
          width: calc(100% - 30px);
          margin-left: 15px;
          margin-right: 15px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.10);
          padding: 60px 50px;
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: center;
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 0;
          text-align: left;
          min-height: 280px;
        }

        .platform-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.12));
          transform: translateY(-2px);
          box-shadow: 0 18px 70px rgba(0,0,0,0.55);
        }

        .platform-content {
          flex: 1;
        }

        .platform-button {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          background: oklch(0.95 0.01 85);
          color: oklch(0.06 0.005 280);
          padding: 18px 36px;
          border-radius: 0;
          text-decoration: none;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.3s ease;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.14);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--lux-accent);
          transform: translateX(-101%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }

        .btn-primary > * { position: relative; z-index: 2; }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 80px rgba(0,0,0,0.65);
        }

        .btn-primary:hover::before {
          transform: translateX(0);
        }

        @media (max-width: 900px) {
          .platform-card {
            grid-template-columns: 1fr;
            width: calc(100% - 20px);
            margin-left: 10px;
            margin-right: 10px;
            padding: 50px 30px;
            min-height: auto;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .platform-card {
            padding: 45px 25px;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import MobileScrollBoost from '@/components/user/MobileScrollBoost';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });

export default function PersonalLoansIndiaPage() {
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
            Personal Loans in India
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
            Check eligibility with RBI-regulated lenders.
          </p>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="bp-body" style={{ padding: '40px 0 0', width: '100%' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              What Is a Personal Loan?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              A personal loan is an unsecured credit facility offered by RBI-regulated banks and NBFCs. Unlike home or car loans, personal loans do not require collateral — the lender disburses funds based on your creditworthiness, income stability, and repayment capacity. Loan amounts in India typically range from ₹50,000 to ₹40,00,000, with tenures from 12 to 60 months. Because the loan is unsecured, interest rates tend to be higher than secured alternatives.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              Personal loans are commonly used for medical emergencies, home renovation, debt consolidation, travel, education expenses, or bridging short-term cash-flow gaps. The key distinction is flexibility — the borrower decides how to deploy the funds, unlike purpose-specific loans.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              Eligibility Criteria
            </h2>
            <ul style={{ paddingLeft: '20px', margin: 0, listStyle: 'disc' }}>
              {[
                'Age: Most lenders require borrowers to be between 21 and 58 years for salaried individuals, and up to 65 for self-employed applicants.',
                'Income: A minimum gross monthly income of ₹15,000–₹25,000 is typical; higher income improves approval probability and rate offered.',
                'Credit score: A CIBIL score of 750 or above generally qualifies for the best interest rates. Scores between 650 and 750 are accepted at a premium.',
                'Employment stability: At least 1 year of total work experience and 6 months with the current employer for salaried applicants.',
                'Existing obligations: Lenders evaluate FOIR (Fixed Obligations to Income Ratio). A ratio below 50% is preferred.',
              ].map((item, i) => (
                <li key={i} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, marginBottom: '8px' }}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              Interest Rates in India — 2026 Overview
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              Personal loan interest rates in India range from approximately 10.49% to 24% per annum as of early 2026, depending on the lender, credit profile, and loan amount. Major banks such as SBI, HDFC Bank, and ICICI Bank offer rates starting around 10.50%–11.00% for salaried professionals with excellent credit scores. NBFCs typically charge 14%–22% but may have faster processing and more flexible eligibility norms.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              Processing fees generally range from 1% to 3% of the loan amount. Some lenders also charge foreclosure penalties if you repay early — always confirm this before signing. The effective cost of borrowing (APR) includes processing fees, insurance premiums (if bundled), and any other charges beyond the headline interest rate.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))', padding: '28px 24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 14px', letterSpacing: '1px' }}>
              When to Use a Personal Loan vs Alternatives
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 14px' }}>
              Personal loans make sense when you need a lump sum quickly and do not have a specific asset to pledge. They work well for genuine emergencies, one-time large expenses, or consolidating multiple high-interest debts into a single EMI at a lower rate.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: 0 }}>
              However, if you own assets, a loan against property (LAP) or gold loan will almost always give you a lower rate. Credit card EMI conversions can work for smaller amounts under ₹2–3 lakhs if your card issuer offers a competitive rate. For planned expenses, building an emergency fund (6–12 months of expenses) will always be cheaper than borrowing at 12%+ interest.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Card */}
      <section className="bp-body" style={{ padding: '20px 0 40px', width: '100%' }}>
        <MobileScrollBoost className="platform-card" holdMs={4500}>
          <div className="platform-content">
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '2px', marginBottom: '10px' }}>#1</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 10px 0', letterSpacing: '1.5px' }}>
              LOAN HUB
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.70)', marginBottom: '20px', fontWeight: 500 }}>
              Compare personal loan offers from RBI-regulated lenders.
            </p>
          </div>
          <div className="platform-button">
            <a
              href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Floanhubindia.com%2Fapply-now%2F"
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="btn-primary"
            >
              <span>CHECK ELIGIBILITY</span>
            </a>
          </div>
        </MobileScrollBoost>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '0 20px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', color: 'var(--lux-accent)', fontWeight: 600, margin: '0 0 20px', letterSpacing: '1px' }}>
            Frequently Asked Questions
          </h2>
          {[
            { q: 'What documents are needed to apply for a personal loan?', a: 'Typically you need PAN card, Aadhaar card, last 3 months\u2019 salary slips, 6 months\u2019 bank statements, and a passport-size photograph. Self-employed applicants may also need ITR filings for the last 2 years and a business proof.' },
            { q: 'How long does personal loan approval take?', a: 'Most digital lenders and major banks offer in-principle approval within minutes and full disbursal within 24\u201372 hours for salaried applicants with clean credit histories. Complex cases involving manual underwriting may take 5\u20137 business days.' },
            { q: 'Can I prepay or foreclose a personal loan?', a: 'Yes, most lenders allow prepayment after a lock-in period (usually 6\u201312 months). RBI guidelines prohibit foreclosure charges on floating-rate loans to individual borrowers. For fixed-rate loans, a penalty of 2\u20135% of the outstanding balance is common.' },
            { q: 'Does applying for a personal loan affect my credit score?', a: 'Each loan application triggers a hard inquiry on your credit report, which can reduce your score by 5\u201315 points temporarily. Multiple applications in a short period signal desperation to lenders. We recommend comparing offers through aggregators that use soft inquiries first.' },
            { q: 'What happens if I default on a personal loan?', a: 'Defaulting leads to penalties, a damaged credit score (which can drop 100+ points), collection calls, and potential legal action by the lender. If you anticipate difficulty, contact the lender proactively to restructure the loan before missing an EMI.' },
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
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', lineHeight: 1.7, margin: '0 0 8px' }}>
            <strong style={{ color: 'rgba(255,255,255,0.60)' }}>Disclaimer:</strong> The information on this page is for educational purposes only and does not constitute financial advice. Interest rates, eligibility criteria, and terms are indicative and subject to change based on lender policies and RBI regulations. BM Wealth does not process loan applications, hold funds, or make credit decisions. Always verify terms on the lender&apos;s official website before applying.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.40)', lineHeight: 1.6, margin: 0 }}>
            BM Wealth may receive a referral fee if you apply via partner links. AMFI ARN 90008 | IRDAI 277925
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

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import MobileScrollBoost from '@/components/user/MobileScrollBoost';
import { trackEvent } from '@/lib/analytics';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });

function StatusBadge({ children }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.70)',
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(255,255,255,0.04)',
        padding: '8px 12px',
      }}
    >
      {children}
    </span>
  );
}

function AffiliateCard({
  title,
  subtitle,
  features,
  href,
  eventName,
  ctaLabel,
}) {
  return (
    <MobileScrollBoost
      holdMs={4500}
      className="platform-card"
    >
      <div className="platform-content" style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 3.2vw, 34px)',
              fontFamily: '"Playfair Display", serif',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 650,
              margin: 0,
              letterSpacing: '1px',
            }}
          >
            {title}
          </h2>
          <StatusBadge>Optional partner reference</StatusBadge>
        </div>

        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', marginTop: 10, marginBottom: 20 }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="platform-button" style={{ marginTop: 18 }}>
        <a
          href={href}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="btn-primary"
          onClick={() => trackEvent(eventName, { source: 'execution_partners', page: '/execution-partners', partner: title })}
          style={{ textAlign: 'center', display: 'inline-flex', paddingLeft: 18, paddingRight: 18 }}
        >
          {ctaLabel}
        </a>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.5, marginTop: 10 }}>
          External link. Terms, fees, and eligibility are defined by the provider.
        </div>
      </div>
    </MobileScrollBoost>
  );
}

function ComingSoonCard({ title, subtitle }) {
  return (
    <MobileScrollBoost
      holdMs={4200}
      className="platform-card"
    >
      <div className="platform-content" style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 3.2vw, 34px)',
              fontFamily: '"Playfair Display", serif',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 650,
              margin: 0,
              letterSpacing: '1px',
            }}
          >
            {title}
          </h2>
          <StatusBadge>Coming soon</StatusBadge>
        </div>

        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', marginTop: 10, marginBottom: 0 }}>
          {subtitle}
        </p>
      </div>

      <div className="platform-button" style={{ marginTop: 18 }}>
        <div className="btn-primary" aria-disabled="true" style={{ opacity: 0.55, cursor: 'not-allowed', pointerEvents: 'none', display: 'inline-flex' }}>
          Not available
        </div>
      </div>
    </MobileScrollBoost>
  );
}

export default function ExecutionPartnersPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('execution_partners_view', { page: '/execution-partners' });
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />

      {/* Hero */}
      <section
        style={{
          minHeight: '55vh',
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
            backgroundImage: 'url(/services/Trading%20Service.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.34,
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

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '980px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 0,
              padding: '10px 24px',
              marginBottom: '24px',
              boxShadow: '0 16px 60px rgba(0,0,0,0.55)',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'var(--lux-accent)',
                fontWeight: 700,
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={18} />
              OPTIONAL ROUTING
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              marginBottom: '18px',
              fontWeight: 300,
              letterSpacing: '3px',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
              lineHeight: 1.2,
            }}
          >
            Execution Partners
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
            This page is a neutral routing bridge for users who want to explore optional execution or banking products after using BM Wealth tools and educational content.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bp-body" style={{ padding: '40px 0 100px', width: '100%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ width: 'calc(100% - 30px)', marginLeft: '15px', marginRight: '15px', marginBottom: '18px' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 3.6vw, 40px)',
                fontFamily: '"Playfair Display", serif',
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '1.5px',
                margin: 0,
              }}
            >
              Credit Cards <span style={{ color: 'rgba(255,255,255,0.60)' }}>(Optional)</span>
            </h2>
            <p style={{ marginTop: 12, marginBottom: 0, color: 'rgba(255,255,255,0.70)', lineHeight: 1.75 }}>
              Optional partner references for users who prefer a structured, disciplined approach to short-term expense timing.
              External links may be sponsored and are marked accordingly.
            </p>
          </div>

          <AffiliateCard
            title="Axis Bank Credit Card"
            subtitle="Often chosen for broad acceptance and straightforward onboarding."
            features={[
              'Check current variants, fees, and eligibility on the provider site',
              'Best used when billing and repayment are fully automated',
              'Treat rewards as secondary to discipline',
            ]}
            href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fweb.axisbank.co.in%2FDigitalChannel%2FWebForm%2F"
            eventName="execution_options_click"
            ctaLabel="Open provider page"
          />

          <AffiliateCard
            title="HDFC Credit Card"
            subtitle="A mainstream option; verify eligibility, fees, and benefits before applying."
            features={[
              'Compare fees vs your expected usage',
              'Prefer one primary card for clean tracking',
              'Always repay in full on time',
            ]}
            href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fapplyonline.hdfcbank.com%2Fcards%2Fcredit-cards.html"
            eventName="execution_options_click"
            ctaLabel="Open provider page"
          />

          <AffiliateCard
            title="YES Bank POP Credit Card"
            subtitle="A digital-first application flow; validate terms and suitability on the provider site."
            features={[
              'Confirm fees, limits, and reward structure',
              'Avoid over-optimizing for rewards',
              'Works best with strict monthly repayment discipline',
            ]}
            href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fppipl.getpopcard.co%2F"
            eventName="execution_options_click"
            ctaLabel="Open provider page"
          />

          <AffiliateCard
            title="IDFC First Bank Credit Card"
            subtitle="Simple, transparent structure for professionals who prefer clarity over complexity."
            features={[
              'Often positioned as lifetime-free variants (check current terms)',
              'Straightforward application and onboarding',
              'Works best when repayment discipline is automated',
            ]}
            href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fwww.idfcfirstbank.com%2Fcredit-card%2Fntb-diy%2Fapply"
            eventName="affiliate_idfc_click"
            ctaLabel="Open provider page"
          />

          <AffiliateCard
            title="AU Bank Credit Options"
            subtitle="Digital-first onboarding for users who value speed and accessibility."
            features={[
              'Broad national reach (verify eligibility for your location)',
              'Online-first application experience',
              'Better when needs are straightforward and documented',
            ]}
            href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fsavingsaccount.aubank.in%2Fsaself%2Fmobile-number"
            eventName="affiliate_au_click"
            ctaLabel="Open provider page"
          />

          <AffiliateCard
            title="IndusInd Bank Credit Card"
            subtitle="Premium-oriented positioning; generally better suited for established credit profiles."
            features={[
              'Premium/lifestyle variants (verify suitability)',
              'Useful as a secondary card for controlled usage',
              'Strong fit only when billing and limits are actively managed',
            ]}
            href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Finduseasycredit.indusind.bank.in%2Fcustomer%2Fcredit-card%2Fnew-lead"
            eventName="affiliate_indusind_click"
            ctaLabel="Open provider page"
          />

          <div style={{ width: 'calc(100% - 30px)', marginLeft: '15px', marginRight: '15px', marginTop: '12px', marginBottom: '18px' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 3.6vw, 40px)',
                fontFamily: '"Playfair Display", serif',
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '1.5px',
                margin: 0,
              }}
            >
              Personal Loans <span style={{ color: 'rgba(255,255,255,0.60)' }}>(Optional)</span>
            </h2>
            <p style={{ marginTop: 12, marginBottom: 0, color: 'rgba(255,255,255,0.70)', lineHeight: 1.75 }}>
              Optional references for users comparing short-term borrowing. External links may be sponsored and are marked accordingly.
            </p>
          </div>

          <AffiliateCard
            title="Loan Hub"
            subtitle="A reference option for users checking short-term personal loan eligibility."
            features={[
              'Compare offers across providers where applicable',
              'Review APR/fees carefully before proceeding',
              'Only borrow when repayment is predictable',
            ]}
            href="https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Floanhubindia.com%2Fapply-now%2F"
            eventName="execution_options_click"
            ctaLabel="Check eligibility"
          />

          <div style={{ width: 'calc(100% - 30px)', marginLeft: '15px', marginRight: '15px', marginTop: '12px', marginBottom: '18px' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 3.6vw, 40px)',
                fontFamily: '"Playfair Display", serif',
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '1.5px',
                margin: 0,
              }}
            >
              Insurance <span style={{ color: 'rgba(255,255,255,0.60)' }}>(Coming soon)</span>
            </h2>
            <p style={{ marginTop: 12, marginBottom: 0, color: 'rgba(255,255,255,0.70)', lineHeight: 1.75 }}>
              Insurance references will be added only with clear disclosures and a compliance-first tone.
            </p>
          </div>

          <ComingSoonCard
            title="Insurance Partners"
            subtitle="Optional references will appear here once review and disclosures are complete."
          />

          <div
            style={{
              width: 'calc(100% - 30px)',
              marginLeft: '15px',
              marginRight: '15px',
              marginTop: '28px',
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '26px',
              borderRadius: 0,
              boxShadow: '0 12px 55px rgba(0,0,0,0.6)',
            }}
          >
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.80)', lineHeight: 1.85, fontSize: 14 }}>
              <strong style={{ color: 'var(--lux-accent)' }}>Disclosure:</strong> BM Wealth does not provide execution services on this page.
              We do not take custody of funds, do not place trades, and do not approve/issue banking products.
              Provider eligibility, terms, fees, and outcomes are defined by the respective provider.
            </p>
            <p style={{ marginTop: 14, marginBottom: 0, color: 'rgba(255,255,255,0.72)', lineHeight: 1.85, fontSize: 14 }}>
              Prefer to stay in research mode? See{' '}
              <Link className="text-white underline underline-offset-4" href="/platforms">
                Platforms
              </Link>
              . If you want help reviewing options based on your situation, use{' '}
              <Link className="text-white underline underline-offset-4" href="/contact">
                Contact
              </Link>
              .
            </p>
          </div>
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
          flex-direction: column;
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
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          background: color-mix(in oklab, var(--lux-accent) 60%, oklch(0.95 0.01 85));
        }

        @media (max-width: 768px) {
          .platform-card {
            padding: 40px 30px;
            grid-template-columns: 1fr;
            gap: 30px;
            text-align: center;
          }

          .platform-button {
            justify-content: center;
          }

          .btn-primary {
            padding: 16px 28px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

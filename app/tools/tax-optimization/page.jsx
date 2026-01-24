import Script from "next/script";
import Link from "next/link";
import BackRow from "@/components/shared/BackRow";
import { buildMetadata, getMetadataBase } from "@/lib/seo/metadata";
import TrackedLink from "@/components/shared/TrackedLink";

import { TaxCalculator } from "@/components/calculators/TaxCalculator";

const PATH = "/tools/tax-optimization";

export const metadata = {
  ...buildMetadata({
    title: "Tax Optimization Intelligence 2026 | Old vs New Regime Calculator Mumbai | BM Wealth",
    description:
      "Accurate FY 2025-26 tax calculator for Mumbai professionals. Compare old vs new regime, find savings, and unlock your personal execution blueprint. AMFI ARN-90008.",
    path: PATH,
  }),
  keywords:
    "tax calculator FY 2025-26, old vs new regime, Mumbai tax planning, HRA exemption, 80C 80D NPS, marginal relief, BM Wealth tools",
};

export default function TaxOptimizationToolPage() {
  const base = getMetadataBase().toString().replace(/\/$/, "");

  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Tax Optimization Intelligence — FY 2025–26",
    description:
      "Mumbai-first FY 2025–26 income tax calculator comparing Old vs New regime with standard deduction, 87A rebate, marginal relief, and 4% cess.",
    url: `${base}${PATH}`,
    provider: {
      "@type": "Organization",
      name: "BM Wealth",
      telephone: "+91-8850977259",
    },
    areaServed: { "@type": "City", name: "Mumbai" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is the Old or New Regime better for FY 2025–26?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "It depends on salary structure and deductions (80C, 80D, NPS, HRA, home-loan interest). Our tool compares both regimes with current slabs and shows an illustrative outcome.",
        },
      },
      {
        "@type": "Question",
        name: "What is this tool meant to show?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "A clear estimate and comparison of Old vs New regime outcomes based on your inputs and published rules, along with a breakdown you can verify.",
        },
      },
      {
        "@type": "Question",
        name: "How is HRA exemption calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "HRA exemption is the minimum of: actual HRA received, rent paid minus 10% of basic salary, and 50% of basic for specified metro cities (assumed Mumbai here).",
        },
      },
      {
        "@type": "Question",
        name: "How accurate are the results?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "They are estimates based on your inputs and current rules. Please verify with official sources or your tax professional for final outcomes.",
        },
      },
      {
        "@type": "Question",
        name: "Will I receive sales calls?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Communication is limited to sharing your calculation and related updates.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${base}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: `${base}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Tax Optimization Intelligence",
        item: `${base}/tools/tax-optimization`,
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to time your FY 2025–26 tax execution",
    description:
      "A simple timing framework to plan FY 2025–26 tax execution across the financial year.",
    totalTime: "P12M",
    step: [
      {
        "@type": "HowToStep",
        name: "April–June: Set the structure",
        text:
          "Validate salary components, rent documentation, and insurance schedules. Note planned NPS contributions under 80CCD(1B).",
      },
      {
        "@type": "HowToStep",
        name: "July–December: Stay on track",
        text:
          "Reconcile proofs with employer cycles, ensure rent/basic alignment for HRA, and keep medical covers updated.",
      },
      {
        "@type": "HowToStep",
        name: "January–March: Close the loop",
        text:
          "Top up deductible contributions if appropriate, review regime decision with current numbers, and maintain records for filing.",
      },
    ],
  };

  return (
    <>
      {/* Minimal back row: subtle, visible immediately */}
      <BackRow href="/tools" label="← Back to Tools" />
      {/* Hero Section — background image, headline, subtext, ONE CTA */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: '#000' }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/6th.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.92) 100%)',
          }}
        />
        <div className="relative px-6 lg:px-10 py-16 lg:py-24 max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[color:var(--color-matte-gold)]">
            Tax Optimization Intelligence — <span className="whitespace-nowrap">FY 2025–26</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/80">
            Compare Old vs New regime, then unlock a simple execution blueprint.
          </p>
        </div>
      </section>
      <Script
        id="tax-optimization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Script
        id="tax-optimization-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="tax-optimization-breadcrumbs"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="tax-optimization-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {/* Calculator Section (separate from hero) */}
      <section id="tools-tax-optimization" className="scroll-mt-24 px-6 lg:px-10 py-14 lg:py-20">
        <div className="w-full max-w-6xl mx-auto">
          <TaxCalculator />

          {/* Soft execution router (internal only, no affiliates) */}
          <div className="mt-10 border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/70">
              Execution is optional
            </div>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              Some users prefer optimising liquidity and execution after seeing their results.
            </p>
            <TrackedLink
              href="/execution-partners"
              className="mt-3 inline-flex items-center justify-center border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              eventName="execution_options_click"
              eventParams={{ tool: "tax-optimization", href: "/execution-partners" }}
            >
              View Execution Options
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-6">
        <p className="text-sm text-white/75">
          Related resources: <Link href="/tools" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">All Tools</Link> ·{' '}
          <Link href="/tools/property-vs-sip" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Property vs SIP</Link> ·{' '}
          <Link href="/blog" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Blogs</Link> ·{' '}
          <Link href="/contact" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Contact</Link>
        </p>
      </section>

      {/* Long SEO Section: Educational, calm, compliance-first (collapsed by default) */}
      <details className="px-6 lg:px-10 group learn-more">
        <summary className="list-none cursor-pointer select-none learn-more-summary">
          <div className="flex items-center gap-3 text-[11px] text-slate-300/70">
            <div className="h-px w-full bg-white/10" />
            <span className="tracking-[0.18em] uppercase">Learn more</span>
            <div className="h-px w-full bg-white/10" />
          </div>
        </summary>
        <section className="px-0 py-10 lg:py-16 learn-more-body">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 ultra-luxury-glass">
            <div className="absolute inset-0 opacity-60 gold-grain-texture" />
            <div className="relative px-6 py-8 lg:px-10 lg:py-12">
              <div
                className="prose prose-invert max-w-5xl mx-auto
                  prose-headings:font-serif prose-headings:tracking-tight
                  prose-h2:text-2xl lg:prose-h2:text-3xl
                  prose-h3:text-xl lg:prose-h3:text-2xl
                  prose-headings:text-[color:var(--color-matte-gold)]
                  prose-p:text-white/75 prose-p:leading-relaxed
                  prose-strong:text-white prose-li:text-white/75
                  prose-a:text-[color:var(--color-matte-gold)] prose-a:no-underline hover:prose-a:underline
                  prose-hr:border-white/10"
              >
                <h2>How Mumbai Professionals Can Reduce Tax in FY 2025–26</h2>
                <p>
                  A practical, Mumbai-first approach to tax planning for FY 2025–26 focuses on two things: getting the
                  calculation right (regime choice, deductions, exemptions, reliefs) and executing cleanly (documents,
                  timing, employer proof cycles).
                </p>

                <h2>Old vs New Regime — What Actually Matters</h2>
                <p>
                  The decision is input-driven. Under the old regime, deductions and exemptions usually matter more—80C,
                  80D, HRA exemption, and eligible home-loan interest. Under the new regime, slabs are simpler and certain
                  deductions are restricted, with rebate and marginal relief influencing outcomes near key thresholds.
                </p>
                <p>
                  The best regime is the one that yields a lower total tax for your inputs. This tool computes both sides
                  and shows a clear breakdown (slab tax, surcharge where applicable, and cess) so you can verify the
                  result.
                </p>

                <h2>Why Most Salaried Professionals Overpay</h2>
                <p>
                  Overpayment is usually operational: missing documents during proof submission, late decisions on
                  eligible deductions, or mismatches between rent documentation and salary structure for HRA. Another
                  common issue is assuming one regime is always better—recompute whenever components change.
                </p>

                <h2>Execution Timing vs Calculation</h2>
                <p>
                  The calendar matters. Rent agreements, insurance premiums, and NPS contributions often need to align
                  with employer cycles and filing timelines. A simple checklist across the year reduces last-minute
                  corrections and improves confidence.
                </p>

                <h2>Common Mistakes at Higher Income</h2>
                <p>
                  Small errors compound at higher incomes: inconsistent rent proofs, ignoring caps where they apply,
                  failing to update salary structure when roles change, or not revisiting the regime decision before
                  filing.
                </p>

                <h3>Further Reading and Policies</h3>
                <p>
                  For policy and disclosures, please review our{" "}
                  <Link href="/compliance" className="underline text-[color:var(--color-matte-gold)]">
                    Privacy & Compliance
                  </Link>
                  {" "}and{" "}
                  <Link href="/regulatory-compliance" className="underline text-[color:var(--color-matte-gold)]">
                    Disclaimers
                  </Link>
                  .
                </p>

                <h3>What’s Next</h3>
                <p>
                  We’ll continue to add tools (coming soon) across salary structuring, HRA planning, and timing
                  checklists—designed for clarity and execution.
                </p>
              </div>
            </div>
          </div>
        </section>
      </details>
    </>
  );
}

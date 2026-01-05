import Script from "next/script";
import Link from "next/link";
import BackRow from "@/components/shared/BackRow";
import { getMetadataBase } from "@/lib/seo/metadata";

import { TaxCalculator } from "@/components/calculators/TaxCalculator";

export const metadata = {
  title: "Tax Optimization Intelligence 2026 | Old vs New Regime Calculator Mumbai | BM Wealth",
  description:
    "Accurate FY 2025-26 tax calculator for Mumbai professionals. Compare old vs new regime, find savings, and unlock your personal execution blueprint. AMFI ARN-90008.",
  keywords:
    "tax optimization intelligence, tax calculator 2026, old vs new tax regime, FY 2025-26 tax, Mumbai tax calculator, income tax calculator India, tax planning",
};

export default function TaxOptimizationToolPage() {
  const base = getMetadataBase().toString().replace(/\/$/, "");

  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Tax Optimization Intelligence — FY 2025–26",
    description:
      "Mumbai-first FY 2025–26 income tax calculator comparing Old vs New regime with standard deduction, 87A rebate, marginal relief, and 4% cess.",
    url: `${base}/tools/tax-optimization`,
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
        name: "Does this tool provide investment advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No. This tool provides educational, general information based on your inputs and published rules. It does not constitute personalised investment advice. Consult a qualified professional for personalised guidance.",
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
        name: "Do you guarantee tax outcomes or refunds?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No guarantees are made. The calculations are illustrative based on your inputs and current rules and may change with future updates.",
        },
      },
      {
        "@type": "Question",
        name: "Will I receive sales calls?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The experience is designed to be educational-first. Communication is limited to sharing your calculation and related updates.",
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
      "Educational steps to plan tax execution across the financial year. General information, not investment advice.",
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
        <div className="w-full">
          <TaxCalculator />
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
            This educational section explains, in plain language, how a typical salaried professional in Mumbai can
            approach tax planning for FY 2025–26. It focuses on structure and execution rather than products or
            promises. The goal is to help you understand the moving parts: income heads, deductions, exemptions, and
            timing. All illustrations are general information, not personalized advice.
          </p>
          <p>
            At a high level, tax outcomes depend on your salary composition (basic, HRA, allowances), eligible
            deductions (80C, 80D, NPS under 80CCD(1B)), and housing-related provisions (home-loan interest under
            Section 24). The statutory slabs and rebates differ across the old and new regimes; the correct choice is
            the one that yields a lower total tax for your inputs. This tool computes both sides using current rules and
            shows an illustrative difference so you can plan prudently.
          </p>

          <h2>Old vs New Regime — What Actually Matters</h2>
          <p>
            Under the old regime, deductions and exemptions matter more—especially 80C, 80D, HRA exemption, and home-
            loan interest. Under the new regime, the slabs are broader and simpler; certain deductions are limited, and
            a rebate applies up to the threshold. For incomes around the rebate limit, new-regime marginal relief can
            impact the effective rate. What matters is not speculation but a disciplined, input-true comparison with a
            clear breakdown of slabs, cess, and applicable relief. That is exactly what the calculator above performs.
          </p>
          <p>
            Importantly, this is not about “beating the system.” It is about using published rules correctly. The tool’s
            methodology follows publicly available formulae—for instance, HRA exemption is the minimum of actual HRA
            received, rent paid minus 10% of basic, and 50% of basic for Mumbai—as a transparent, auditable approach.
          </p>

          <h2>Why Most Salaried Professionals Overpay Tax</h2>
          <p>
            Overpayment typically happens for practical reasons: incomplete documentation at the time of proof
            submission, late decisions on eligible investments, or not aligning rent agreements and basic salary levels
            to the HRA framework. A second pattern involves assuming that one regime is always better; in practice, the
            answer depends on current year data and must be recomputed when components change. A third pattern is mixing
            investment selection with tax calculation—these are separate decisions and should be kept independent.
          </p>
          <p>
            A clean process includes: estimating annual salary components, validating rent/basic numbers for HRA, using
            health insurance and retirement contributions prudently, and re-checking the regime decision before filing.
            The calculator’s breakdown (slab-by-slab and deduction-wise) is intended to support such a process in a calm
            and methodical way.
          </p>

          <h2>Execution Timing vs Calculation</h2>
          <p>
            The execution calendar often matters more than the calculation itself. For example, if rent agreements or
            health insurance premiums are finalized late, deductions may not reflect in the employer cycle and may need
            to be reconciled while filing. Similarly, NPS contributions under 80CCD(1B) have a separate cap and timing
            window. Setting calendar reminders for proof collection, premium payments, and any planned contributions can
            improve outcomes without changing risk profiles. Calculation is a lens; execution delivers the impact.
          </p>

          <h2>Common Mistakes Even at ₹20L+ Income</h2>
          <p>
            At higher incomes, the cost of small errors compounds. Common issues include: not updating basic salary
            proportions when roles change, inconsistent rent documentation, ignoring home-loan interest capping under
            Section 24, and overlooking the new-regime marginal relief near the rebate threshold. Another mistake is to
            frame the choice as permanent. In reality, you can re-evaluate annually based on your inputs—sometimes old
            regime wins decisively due to deductions; other times the new regime’s simplicity provides the edge.
          </p>
          <p>
            Keep records tidy, reconcile employer and personal computations, and use the slab breakdown to cross-check
            reasonableness. Consider maintaining a simple year-on-year worksheet that tracks which variables changed and
            why the regime decision shifted, if at all. This builds internal confidence and reduces filing stress.
          </p>

          <h3>Further Reading and Policies</h3>
          <p>
            For policy and disclosures, please review our
            {" "}
            <Link href="/compliance" className="underline text-[color:var(--color-matte-gold)]">Privacy & Compliance</Link>
            {" "}and{" "}
            <Link href="/regulatory-compliance" className="underline text-[color:var(--color-matte-gold)]">Disclaimers</Link>.
            These materials clarify scope, assumptions, and responsibilities. All content here is illustrative and for
            general information purposes only.
          </p>

          <h3>What’s Next</h3>
          <p>
            We will continue to add educational tools (coming soon) on salary structuring, HRA planners, and timing
            checklists. These are designed to help you build your own audit trail of decisions across the financial year
            without relying on subjective narratives. The goal is not to promise outcomes but to improve clarity.
          </p>
              </div>
            </div>
          </div>
        </section>
      </details>
    </>
  );
}

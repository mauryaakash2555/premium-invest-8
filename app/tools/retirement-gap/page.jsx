import Script from "next/script";
import Link from "next/link";

import BackRow from "@/components/shared/BackRow";
import FAQSection from "@/components/shared/FAQSection";
import { RetirementGapCalculator } from "@/components/calculators/RetirementGapCalculator";
import { buildMetadata, getMetadataBase, SITE_NAME } from "@/lib/seo/metadata";
import { CalculatorToBlogCTA } from "@/components/blog/RelatedContent";

const PATH = "/tools/retirement-gap";

export const metadata = {
  ...buildMetadata({
    title: "Retirement Gap Calculator | BM Wealth",
    description:
      "Calculate your retirement corpus gap with inflation-adjusted projections. See how much SIP you need to retire comfortably.",
    path: PATH,
    type: "website",
  }),
  keywords:
    "retirement gap calculator, retirement corpus, retirement planning India, SIP for retirement, inflation adjusted retirement, BM Wealth tools",
};

export default function RetirementGapToolPage() {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  const pageUrl = `${base}${PATH}`;

  const faqs = [
    {
      question: "How is the retirement corpus calculated?",
      answer:
        "The calculator uses the 25× rule (based on a 4% safe withdrawal rate). It inflates your current monthly expenses to retirement age, calculates annual expenses, and multiplies by 25 to determine the corpus needed.",
    },
    {
      question: "How does inflation impact retirement planning?",
      answer:
        "Inflation erodes purchasing power over time. At 6% inflation, ₹1L today becomes ₹5.7L in 30 years. This calculator accounts for inflation to show you what your expenses will actually be at retirement.",
    },
    {
      question: "When should I start planning for retirement?",
      answer:
        "The earlier the better. Starting at 25 vs 35 can reduce the required monthly SIP by 60–70% due to the power of compounding over a longer horizon.",
    },
    {
      question: "Should I invest in NPS or mutual funds for retirement?",
      answer:
        "Both have merits. NPS offers additional ₹50K tax deduction under 80CCD(1B) but has lock-in until 60. Mutual funds offer more flexibility and liquidity. A combination often works best.",
    },
    {
      question: "What is the safe withdrawal rate?",
      answer:
        "The 4% rule suggests withdrawing 4% of your corpus annually in retirement. This is why we use the 25× multiplier (100 ÷ 4 = 25). The idea is that a well-invested corpus can sustain 4% withdrawals for 25–30 years.",
    },
  ];

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Retirement Gap Calculator",
    description:
      "Calculate the gap between your retirement corpus needed and your current savings trajectory. Find out how much SIP is required to close the gap.",
    url: pageUrl,
    provider: {
      "@type": "Organization",
      "@id": `${base}#organization`,
      name: SITE_NAME,
      url: base,
      telephone: "+91 88509 77259",
    },
    areaServed: { "@type": "Country", name: "India" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${base}/tools` },
      { "@type": "ListItem", position: 3, name: "Retirement Gap", item: pageUrl },
    ],
  };

  return (
    <>
      <BackRow href="/tools" label="← Back to Tools" />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <RetirementGapCalculator />

          <div className="mt-8 border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/70">How to use this tool</div>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              Enter your current age, retirement age, monthly expenses today, and current savings. The tool inflates your
              expenses to retirement and estimates the corpus needed using the 25× rule.
            </p>
            <ul className="mt-3 text-sm text-white/75 leading-relaxed list-disc pl-5 space-y-1">
              <li>If the tool shows a gap, treat the suggested SIP as a target to review with your asset allocation.</li>
              <li>Keep inflation and return assumptions realistic for your situation (even small changes materially shift the gap).</li>
              <li>Use the results to decide timing (start now vs later), not to predict markets.</li>
            </ul>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              <span className="text-white/85 font-semibold">Example:</span> Age <span className="text-white">30</span> retire at <span className="text-white">60</span>,
              expenses <span className="text-white">₹1,00,000/mo</span>,
              savings <span className="text-white">₹50,00,000</span>. Click Calculate to see corpus needed and monthly SIP to close the gap.
            </p>
          </div>

          <div className="mt-10">
            <FAQSection faqs={faqs} pageUrl={`https://bmwealth.co.in${PATH}`} />
          </div>

          <CalculatorToBlogCTA
            toolId="retirement-gap"
            title="Related Deep Dives"
            className="mt-10"
          />
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-6">
        <p className="text-sm text-white/75">
          Related resources: <Link href="/tools" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">All Tools</Link> ·{' '}
          <Link href="/tools/tax-optimization" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Tax Intelligence</Link> ·{' '}
          <Link href="/tools/property-vs-sip" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Property vs SIP</Link> ·{' '}
          <Link href="/blog" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Blogs</Link>
        </p>
      </section>

      <Script
        id="retirement-gap-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <Script
        id="retirement-gap-breadcrumbs"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

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
            <div
              className="relative px-6 py-8 lg:px-10 lg:py-12 prose prose-invert max-w-5xl mx-auto
                prose-headings:font-serif prose-headings:tracking-tight
                prose-headings:text-[color:var(--color-matte-gold)]
                prose-p:text-white/75 prose-p:leading-relaxed
                prose-strong:text-white prose-li:text-white/75
                prose-a:text-[color:var(--color-matte-gold)] prose-a:no-underline hover:prose-a:underline
                prose-hr:border-white/10"
            >
              <h2>Retirement Gap — Understanding Your Financial Readiness</h2>
              <p>
                The retirement gap is the difference between the <strong>corpus you need</strong> to maintain your
                lifestyle after retirement and the <strong>corpus your current savings will generate</strong>. This
                calculator uses the widely-accepted 25× rule, which assumes a 4% safe withdrawal rate — meaning
                your retirement corpus should be 25 times your annual expenses at retirement.
              </p>
              <p>
                Inflation is the silent eroder. Monthly expenses of ₹1 lakh today could become ₹5.7 lakh in 30 years
                at 6% inflation. Without accounting for this, most retirement plans fall dramatically short. This
                calculator adjusts all projections for inflation, giving you a realistic picture of what retirement
                actually costs.
              </p>

              <h3>How to Use the Output</h3>
              <p>
                If you see a gap, the calculator shows exactly how much monthly SIP is needed to close it. The
                earlier you start, the smaller the monthly commitment. Use this as a <strong>conversation
                starter</strong> with your financial advisor and build a plan around the numbers.
              </p>
              <hr />
              <p className="text-[11px] text-white/60">
                Educational content only — not investment advice. Market-linked outcomes can fluctuate • AMFI ARN 90008
              </p>
            </div>
          </div>
        </section>
      </details>
    </>
  );
}

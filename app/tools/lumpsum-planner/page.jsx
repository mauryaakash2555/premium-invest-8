import Script from "next/script";
import Link from "next/link";

import BackRow from "@/components/shared/BackRow";
import FAQSection from "@/components/shared/FAQSection";
import { LumpsumPlannerCalculator } from "@/components/calculators/LumpsumPlannerCalculator";
import { buildMetadata, getMetadataBase, SITE_NAME } from "@/lib/seo/metadata";
import { CalculatorToBlogCTA } from "@/components/blog/RelatedContent";

const PATH = "/tools/lumpsum-planner";

export const metadata = {
  ...buildMetadata({
    title: "Lumpsum Investment Planner | BM Wealth",
    description:
      "Calculate lumpsum investment growth and compare with equivalent SIP. See maturity value, wealth multiplier, and CAGR projections.",
    path: PATH,
    type: "website",
  }),
  keywords:
    "lumpsum investment calculator, lumpsum vs SIP, one-time investment, mutual fund lumpsum, CAGR calculator, BM Wealth tools",
};

export default function LumpsumPlannerToolPage() {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  const pageUrl = `${base}${PATH}`;

  const faqs = [
    {
      question: "When does lumpsum investing make sense?",
      answer:
        "Lumpsum works well when you receive a bonus, inheritance, or maturity proceeds and markets are reasonably valued. Historically, lumpsum investing has outperformed SIP about 65% of the time over 10+ year horizons.",
    },
    {
      question: "What is the market timing risk with lumpsum?",
      answer:
        "Investing a large amount at a market peak can lead to short-term losses. To mitigate this, consider systematic transfer plans (STPs) that deploy your lumpsum over 3–6 months into equity from a liquid fund.",
    },
    {
      question: "How is LTCG tax applied on lumpsum investments?",
      answer:
        "For equity mutual funds held over 1 year, gains above ₹1.25L per year are taxed at 12.5% (FY 2025–26). For debt funds, gains are taxed at your slab rate regardless of holding period.",
    },
    {
      question: "Is a step-up SIP better than lumpsum?",
      answer:
        "A step-up SIP increases your investment by a fixed percentage each year, combining discipline with automatic scaling. It's better for salaried individuals with predictable income growth. Lumpsum is better when you have idle capital available now.",
    },
    {
      question: "What are the best funds for lumpsum investment in India?",
      answer:
        "For lumpsum, consider large-cap or flexi-cap funds for lower volatility, or index funds (Nifty 50, Nifty Next 50) for passive exposure. Avoid small-cap or sectoral funds for full lumpsum deployment — use STPs instead.",
    },
  ];

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Lumpsum Investment Planner",
    description:
      "Calculate how much your one-time investment will grow over time. Compare lumpsum maturity with equivalent monthly SIP.",
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
      { "@type": "ListItem", position: 3, name: "Lumpsum Planner", item: pageUrl },
    ],
  };

  return (
    <>
      <BackRow href="/tools" label="← Back to Tools" />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <LumpsumPlannerCalculator />

          <div className="mt-8 border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/70">How to use this tool</div>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              Enter the lumpsum amount, expected annual return, and time horizon. Click Calculate to see projected maturity,
              total gain, and the equivalent monthly SIP that would reach the same maturity.
            </p>
            <ul className="mt-3 text-sm text-white/75 leading-relaxed list-disc pl-5 space-y-1">
              <li>Use the equivalent SIP as a planning lens for affordability (monthly cashflow).</li>
              <li>If you worry about timing risk, treat the result as a target and deploy via an STP approach.</li>
              <li>Interpret returns as illustrative assumptions, not guarantees.</li>
            </ul>
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              <span className="text-white/85 font-semibold">Example:</span> Lumpsum <span className="text-white">₹10,00,000</span>
              at <span className="text-white">12%</span> for <span className="text-white">10 years</span> to estimate maturity and SIP equivalence.
            </p>
          </div>

          <div className="mt-10">
            <FAQSection faqs={faqs} pageUrl={`https://bmwealth.co.in${PATH}`} />
          </div>

          <CalculatorToBlogCTA
            toolId="lumpsum-planner"
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
        id="lumpsum-planner-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <Script
        id="lumpsum-planner-breadcrumbs"
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
              <h2>Lumpsum vs SIP — When One-Time Beats Monthly</h2>
              <p>
                Lumpsum investing means deploying a <strong>single amount at once</strong> into the market, as
                opposed to spreading it across months via SIP. Historical data shows that lumpsum investing
                outperforms SIP roughly 65% of the time over 10+ year periods, because markets tend to rise over
                long horizons and early deployment captures more compounding.
              </p>
              <p>
                However, lumpsum carries <strong>timing risk</strong>. Investing at a market peak can mean years of
                underwater returns. This calculator helps you quantify your expected maturity and compare it
                against the equivalent SIP — so you can decide which approach suits your situation and risk
                tolerance.
              </p>

              <h3>Key Considerations</h3>
              <ul>
                <li>Use STPs (Systematic Transfer Plans) to deploy lumpsum gradually if markets look overvalued.</li>
                <li>Large-cap and index funds are typically safer vehicles for full lumpsum deployment.</li>
                <li>Factor in LTCG tax: gains above ₹1.25L taxed at 12.5% for equity held over 1 year.</li>
              </ul>

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

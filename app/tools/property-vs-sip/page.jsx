import Script from "next/script";
import Link from "next/link";

import BackRow from "@/components/shared/BackRow";
import TrackedLink from "@/components/shared/TrackedLink";
import FAQSection from "@/components/shared/FAQSection";
import { PropertyVsSipCalculator } from "@/components/calculators/PropertyVsSipCalculator";
import { buildMetadata, getMetadataBase, SITE_NAME } from "@/lib/seo/metadata";

const PATH = "/tools/property-vs-sip";

export const metadata = {
  ...buildMetadata({
    title: "Property vs SIP Calculator | BM Wealth",
    description:
      "Compare Mumbai property growth vs SIP compounding with locked assumptions. Unlock a 15-page wealth gap report.",
    path: PATH,
    type: "website",
  }),
  keywords:
    "Mumbai property vs SIP, property vs SIP calculator, opportunity cost calculator, Mumbai real estate vs mutual funds, SIP compounding, BM Wealth tools",
};

export default function PropertyVsSipToolPage() {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  const pageUrl = `${base}${PATH}`;

  const faqs = [
    {
      question: "Does this tool include stamp duty, taxes, and transaction costs?",
      answer:
        "No. This comparison uses locked assumptions and does not include stamp duty, transaction costs, taxes, EMI/loan schedules, or liquidity/exit constraints.",
    },
    {
      question: "What assumptions are used in the Property vs SIP comparison?",
      answer:
        "The calculator uses locked assumptions (e.g., property CAGR, equity CAGR, rental yield, maintenance drag) to show an illustrative wealth gap based on your inputs.",
    },
    {
      question: "What does this tool help you decide?",
      answer:
        "It helps quantify opportunity cost under fixed assumptions so you can compare scenarios more clearly. For a personalised plan, connect with our team.",
    },
  ];

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Property vs SIP Calculator",
    description:
      "Compare an equivalent capital deployment into Mumbai property vs disciplined equity SIP compounding using locked assumptions.",
    url: pageUrl,
    provider: {
      "@type": "Organization",
      "@id": `${base}#organization`,
      name: SITE_NAME,
      url: base,
      telephone: "+91 88509 77259",
    },
    areaServed: { "@type": "City", name: "Mumbai" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${base}/tools` },
      { "@type": "ListItem", position: 3, name: "Property vs SIP", item: pageUrl },
    ],
  };

  return (
    <>
      <BackRow href="/tools" label="← Back to Tools" />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <PropertyVsSipCalculator />

          <div className="mt-10">
            <FAQSection faqs={faqs} pageUrl={`https://bmwealth.co.in${PATH}`} />
          </div>

          {/* Soft execution router (internal only, no affiliates) */}
          <div className="mt-10 border border-white/10 bg-white/5 p-5">
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/70">
              Execution is optional
            </div>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              After comparing scenarios, you can review execution options without any external links.
            </p>
            <TrackedLink
                href="/execution-partners"
              className="mt-3 inline-flex items-center justify-center border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              eventName="execution_options_click"
                eventParams={{ tool: "property-vs-sip", href: "/execution-partners" }}
            >
              Explore partner execution options →
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-6">
        <p className="text-sm text-white/75">
          Related resources: <Link href="/tools" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">All Tools</Link> ·{' '}
          <Link href="/tools/tax-optimization" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Tax Intelligence</Link> ·{' '}
          <Link href="/sip" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">SIP</Link> ·{' '}
          <Link href="/blog" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Blogs</Link>
        </p>
      </section>

      <Script
        id="property-vs-sip-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <Script
        id="property-vs-sip-breadcrumbs"
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
              <h2>Property vs SIP — What This Tool Is Actually Measuring</h2>
              <p>
                This Mumbai-first calculator is designed to highlight <strong>opportunity cost</strong>: what happens if
                the same upfront capital used for a property purchase is deployed into equity markets, alongside a
                disciplined monthly investment.
              </p>
              <p>
                The model intentionally uses <strong>locked assumptions</strong> so the comparison is consistent and
                audit-able. Outputs are illustrative and will vary with market and property cycles.
              </p>

              <h3>Important Limitations</h3>
              <ul>
                <li>No stamp duty, brokerage, capital gains tax, or transaction costs included.</li>
                <li>No EMI/loan schedules are modeled.</li>
                <li>Liquidity, vacancy risk, and exit constraints are not modeled.</li>
              </ul>

              <h3>How to Use the Output</h3>
              <p>
                Use the wealth gap as a <strong>conversation starter</strong> and decision framework input. If you want a
                step-by-step execution plan (timelines, risk controls, and transition structure), unlock the premium
                blueprint.
              </p>
              <hr />
              <p className="text-[11px] text-white/60">
                Market-linked outcomes can fluctuate • ARN 90008
              </p>
            </div>
          </div>
        </section>
      </details>
    </>
  );
}

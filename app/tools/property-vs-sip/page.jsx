import Script from "next/script";

import BackRow from "@/components/shared/BackRow";
import { PropertyVsSipCalculator } from "@/components/calculators/PropertyVsSipCalculator";
import { buildMetadata, getMetadataBase, SITE_NAME } from "@/lib/seo/metadata";

const PATH = "/tools/property-vs-sip";

export const metadata = {
  ...buildMetadata({
    title: "Mumbai Property vs SIP Calculator | Real Estate vs Mutual Fund Returns",
    description:
      "Compare Mumbai real estate vs SIP mutual fund returns. Free calculator shows 15-year wealth gap. Locked assumptions: 8% property, 12% SIP CAGR. Download detailed PDF report.",
    path: PATH,
    type: "website",
  }),
  keywords:
    "Mumbai property vs SIP, property vs SIP calculator, opportunity cost calculator, Mumbai real estate vs mutual funds, SIP compounding, BM Wealth tools",
};

export default function PropertyVsSipToolPage() {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  const pageUrl = `${base}${PATH}`;

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Mumbai Property vs SIP Analyzer",
    description:
      "Compare an equivalent capital deployment into Mumbai property vs disciplined equity SIP compounding using locked assumptions. Educational illustration only.",
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
      { "@type": "ListItem", position: 3, name: "Mumbai Property vs SIP Analyzer", item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does this tool include stamp duty, taxes, and transaction costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No. This is an educational illustration using locked assumptions. It does not include stamp duty, transaction costs, taxes, EMI/loan schedules, or liquidity/exit constraints.",
        },
      },
      {
        "@type": "Question",
        name: "What assumptions are used in the Property vs SIP comparison?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "The calculator uses locked assumptions (e.g., property CAGR, equity CAGR, rental yield, maintenance drag) to show an illustrative wealth gap based on your inputs.",
        },
      },
      {
        "@type": "Question",
        name: "Is this investment advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No. This tool provides educational information only and is not personalised investment advice. Consult a qualified professional for advice specific to your situation.",
        },
      },
    ],
  };

  return (
    <>
      <BackRow />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <PropertyVsSipCalculator />
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
      <Script
        id="property-vs-sip-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
                audit-able. It is an educational illustration — not a promise of returns.
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
                Educational tool only • Not investment advice • ARN 90008
              </p>
            </div>
          </div>
        </section>
      </details>
    </>
  );
}

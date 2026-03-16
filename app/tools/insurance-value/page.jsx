import Script from "next/script";
import Link from "next/link";

import BackRow from "@/components/shared/BackRow";
import FAQSection from "@/components/shared/FAQSection";
import { InsuranceValueCalculator } from "@/components/calculators/InsuranceValueCalculator";
import { buildMetadata, getMetadataBase, SITE_NAME } from "@/lib/seo/metadata";
import { CalculatorToBlogCTA } from "@/components/blog/RelatedContent";

const PATH = "/tools/insurance-value";

export const metadata = {
  ...buildMetadata({
    title: "Human Life Value Shield — Insurance Calculator | BM Wealth",
    description:
      "Calculate how much life insurance cover your family really needs. Income replacement method with loan coverage and dependent buffer.",
    path: PATH,
    type: "website",
  }),
  keywords:
    "insurance calculator, life insurance cover, human life value, term insurance calculator, insurance needs India, BM Wealth tools",
};

export default function InsuranceValueToolPage() {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  const pageUrl = `${base}${PATH}`;

  const faqs = [
    {
      question: "What is the difference between term and endowment insurance?",
      answer:
        "Term insurance provides pure life cover at low premiums — you pay only for protection, with no maturity benefit. Endowment plans combine insurance with savings but have much higher premiums and lower returns (4–6% typically). For pure protection, term insurance is almost always more cost-effective.",
    },
    {
      question: "How much life insurance cover is enough?",
      answer:
        "A common rule of thumb is 10–15× annual income. This calculator uses the income replacement method: (annual income × years to retirement × 70%) + outstanding loans + dependent buffer. The result is a more personalized estimate.",
    },
    {
      question: "How does age impact insurance premiums?",
      answer:
        "Premiums increase significantly with age. A 25-year-old might pay ₹8,000/year for ₹1Cr cover, while a 40-year-old pays ₹18,000–25,000 for the same. Buying early locks in lower premiums for the entire policy term.",
    },
    {
      question: "What are IRDAI regulations for life insurance?",
      answer:
        "IRDAI (Insurance Regulatory and Development Authority of India) mandates minimum sum assured multiples, cooling-off periods, grievance redressal, and claim settlement timelines. All insurers must maintain minimum solvency ratios of 150%.",
    },
    {
      question: "Why does claim settlement ratio matter?",
      answer:
        "Claim settlement ratio (CSR) shows what percentage of claims an insurer pays. Look for insurers with 97%+ CSR. Also check the claims amount settlement ratio and average claim settlement time. LIC, HDFC Life, and ICICI Prudential consistently rank high.",
    },
  ];

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Human Life Value Shield — Insurance Calculator",
    description:
      "Calculate the life insurance cover your family needs using the income replacement method. Factors in income, loans, dependents, and existing cover.",
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
      { "@type": "ListItem", position: 3, name: "Insurance Value", item: pageUrl },
    ],
  };

  return (
    <>
      <BackRow href="/tools" label="← Back to Tools" />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <InsuranceValueCalculator />

          <div className="mt-10">
            <FAQSection faqs={faqs} pageUrl={`https://bmwealth.co.in${PATH}`} />
          </div>

          <CalculatorToBlogCTA
            toolId="insurance-value"
            title="Related Deep Dives"
            className="mt-10"
          />
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-6">
        <p className="text-sm text-white/75">
          Related resources: <Link href="/tools" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">All Tools</Link> ·{' '}
          <Link href="/tools/tax-optimization" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Tax Intelligence</Link> ·{' '}
          <Link href="/tools/retirement-gap" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Retirement Gap</Link> ·{' '}
          <Link href="/blog" className="text-[color:var(--color-matte-gold)] underline underline-offset-4">Blogs</Link>
        </p>
      </section>

      <Script
        id="insurance-value-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <Script
        id="insurance-value-breadcrumbs"
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
              <h2>How Much Insurance Does Your Family Actually Need?</h2>
              <p>
                Most Indians are significantly <strong>under-insured</strong>. The average life insurance cover in
                India is just 10–15% of what families actually need. This calculator uses the <strong>income
                replacement method</strong> — the most accepted approach to determining adequate life cover — factoring
                in your income-earning years remaining, outstanding debts, and number of dependents.
              </p>
              <p>
                The formula is straightforward: replace 70% of your annual income for the years remaining until
                retirement (age 60), add full loan coverage so your family isn't burdened with debt, and include
                a ₹25 lakh buffer per dependent for education and lifestyle needs. The result is your total
                recommended cover. Subtract what you already have — the difference is your <strong>coverage
                gap</strong>.
              </p>

              <h3>Why Pure Term Insurance?</h3>
              <p>
                Term insurance offers the highest cover at the lowest premium. A 30-year-old can get ₹1 Crore
                cover for ₹8,000–12,000/year. The suggestion is always rounded to the nearest ₹25 lakh with a
                minimum of ₹50 lakh, because insurance is about protecting your family's lifestyle — not just
                covering the bare minimum.
              </p>
              <hr />
              <p className="text-[11px] text-white/60">
                IRDAI 277925 | Educational estimate — not insurance advice • ARN 90008
              </p>
            </div>
          </div>
        </section>
      </details>
    </>
  );
}

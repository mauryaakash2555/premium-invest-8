import AllInOneCalculator from '@/components/tools/AllInOneCalculator';
import BackRow from "@/components/shared/BackRow";
import FAQSection from "@/components/shared/FAQSection";
import { buildMetadata } from "@/lib/seo/metadata";
import { getBodyTextPaletteStyles } from "@/lib/ui/bodyTextPaletteStyles";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "All in One Financial Calculator | BM Wealth Tools",
  description:
    "Free all-in-one financial calculator: SIP, Lumpsum, EMI, Tax, PPF, NPS, Goal Planning, Retirement, and 19 more calculators in one place.",
  path: "/tools/all-calculators",
});

export default function AllCalculatorsPage() {
  const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: ".bp-body" });

  const faqs = [
    {
      question: "Is this calculator free to use?",
      answer:
        "Yes, completely free. All calculators are available without any cost or registration.",
    },
    {
      question: "Which calculators are included?",
      answer:
        "SIP, Lumpsum, Goal Planning, Retirement, FD, Insurance, PPF, EPF, NPS, ELSS, EMI, SWP, Step-Up SIP, CAGR, Inflation, Gratuity, HRA, Tax, RD, SSY, Wealth Growth, MF Returns, Child Education, Marriage Fund, Car Loan, Home Loan, and Gold Investment.",
    },
    {
      question: "Are the calculations accurate?",
      answer:
        "Yes. All formulas use standard financial mathematics and current rates (PPF: 7.1%, EPF: 8.25%, SSY: 8.2%). Tax calculations are based on FY 2024-25 slabs.",
    },
    {
      question: "Can I save my calculations?",
      answer:
        "Currently, results are shown on screen. For detailed reports or personalized planning, contact us through the Contact page.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <BackRow />
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      <script
        id="all-calc-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold gold-gradient-text">
              All in One Financial Calculator
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl mx-auto">
              Free comprehensive financial calculators. SIP, EMI, Tax, PPF, NPS, Goal Planning, Retirement, and 20 more — all in one place.
            </p>
          </div>

          <div className="bp-body">
            <AllInOneCalculator />

            <div className="mt-10 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <h3 className="text-sm font-semibold text-white/90 mb-2">All Calculators Included</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                SIP • Lumpsum • Goal Planning • Retirement • FD • Insurance • PPF • EPF • NPS • ELSS • EMI • SWP • Step-Up SIP • CAGR • Inflation • Gratuity • HRA • Income Tax • RD • SSY • Wealth Growth • MF Returns • Child Education • Marriage Fund • Car Loan • Home Loan • Gold Investment
              </p>
              <p className="mt-4 text-[11px] text-white/55">
                PMS Certification 2430447816 | ARN 90008 | IRDAI 277925
              </p>
              <p className="mt-3 text-[11px] text-white/55">
                Explore: <Link href="/tools" className="underline underline-offset-4">All Tools</Link> ·{' '}
                <Link href="/blog" className="underline underline-offset-4">Blogs</Link> ·{' '}
                <Link href="/contact" className="underline underline-offset-4">Contact</Link>
              </p>
            </div>

            <FAQSection faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}

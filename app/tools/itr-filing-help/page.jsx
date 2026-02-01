import BackRow from "@/components/shared/BackRow";
import FAQSection from "@/components/shared/FAQSection";
import { buildMetadata } from "@/lib/seo/metadata";
import { getBodyTextPaletteStyles } from "@/lib/ui/bodyTextPaletteStyles";
import Link from "next/link";

import ITRFilingHelpClient from "./ITRFilingHelpClient";

export const metadata = buildMetadata({
  title: "Free ITR Filing Help – Estimate Income Tax Online | BM Wealth",
  description:
    "Upload Form 16, AIS or bank statement to estimate your income tax. Free, educational tool. No filing. Review before use.",
  path: "/tools/itr-filing-help",
  keywords: "free itr filing help, itr calculation online free, income tax calculation india, estimate income tax online, form 16 tax calculation, ais income tax explanation, bank interest tax calculation, how income tax is calculated india, itr tax estimate tool",
});

export default function ITRFilingHelpPage() {
  const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: ".bp-body" });

  const faqs = [
    {
      question: "Does this tool file my ITR?",
      answer:
        "No. This is an educational estimation tool only. It does NOT file, submit, or connect to the income tax portal. You must file your return separately through official channels.",
    },
    {
      question: "Is my data stored or shared?",
      answer:
        "Your files are not shared. To support review, source-highlights, audit history, and exports, uploaded documents may be stored for your session (up to 30 days) unless you delete them sooner. Selectable-text PDFs can be extracted server-side via pdfplumber; scanned documents may require OCR. No automatic numeric guessing is performed — you must review and confirm every value.",
    },
    {
      question: "How accurate is the OCR extraction?",
      answer:
        "Extraction accuracy depends on document quality. All extracted values are editable — you must review and correct them before calculating your estimate.",
    },
    {
      question: "Which documents are supported?",
      answer:
        "Form 16 (PDF), Annual Information Statement / AIS (PDF), and Bank Interest Statements (PDF). Other document types are not supported.",
    },
    {
      question: "Is this tool free?",
      answer:
        "Yes, completely free. No registration, no payment, no hidden charges. Uses open-source OCR (Tesseract) with zero paid API costs.",
    },
    {
      question: "Can I use this for official tax filing?",
      answer:
        "No. This tool provides educational estimates only. For actual filing, consult a CA or use the official income tax portal.",
    },
    {
      question: "How is income tax calculated in India?",
      answer:
        "Income tax in India is calculated based on tax slabs. Your total income minus eligible deductions gives taxable income. Tax is computed on this amount using applicable slab rates, plus surcharge (if applicable) and 4% health & education cess.",
    },
    {
      question: "What is the difference between Old and New tax regime?",
      answer:
        "The Old regime allows deductions under 80C, 80D, HRA exemption, etc. The New regime (default from FY 2023-24) has lower tax rates but fewer deductions. This tool estimates tax under both regimes.",
    },
  ];

  // SoftwareApplication Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BM Wealth ITR Estimation Tool",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description:
      "Free educational tool to estimate income tax using Form 16, AIS, or bank interest statements. Selectable-text PDFs are extracted via server-side text parsing; scanned PDFs use OCR. All values require user review.",
    provider: {
      "@type": "Organization",
      name: "BM Wealth",
      url: "https://bmwealth.co.in",
    },
  };

  return (
    <>
      <BackRow href="/tools" label="← Back to Tools" />
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      <script
        id="itr-help-software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section - Clean, no disclaimers */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold gold-gradient-text">
              Free ITR Filing Help
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl mx-auto">
              Upload Form 16, AIS, or Bank Interest Statement. Get an educational tax estimate.
            </p>
          </div>

          <div className="bp-body">
            {/* The Calculator Tool */}
            <ITRFilingHelpClient />

            {/* Static Content Sections for SEO */}
            <div className="mt-16 space-y-12">
              
              {/* Section 1: How this works */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">How this ITR estimation tool works</h2>
                <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6">
                  <ol className="space-y-3 text-sm text-white/70 list-decimal list-inside">
                    <li><strong className="text-white/90">Upload a supported PDF</strong> — Form 16, AIS, or Bank Interest Statement</li>
                    <li><strong className="text-white/90">OCR extracts text</strong> — Using free, open-source Tesseract.js (runs locally in your browser)</li>
                    <li><strong className="text-white/90">Review extracted values</strong> — All fields are editable. You must verify accuracy</li>
                    <li><strong className="text-white/90">Select tax regime</strong> — Choose between Old or New regime for FY 2025-26</li>
                    <li><strong className="text-white/90">View estimated tax</strong> — Indicative calculation with slab-wise breakdown</li>
                    <li><strong className="text-white/90">Download PDF summary</strong> — Educational summary for your records</li>
                  </ol>
                </div>
              </section>

              {/* Section 2: Supported Documents */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">What documents are supported</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 ultra-luxury-glass p-5">
                    <h3 className="font-medium text-white mb-2">Form 16</h3>
                    <p className="text-xs text-white/60">
                      Salary certificate issued by employer. Contains gross salary, TDS deducted, and deductions claimed.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 ultra-luxury-glass p-5">
                    <h3 className="font-medium text-white mb-2">AIS (Annual Information Statement)</h3>
                    <p className="text-xs text-white/60">
                      Consolidated view of financial transactions from income tax department. Shows interest, dividends, TDS entries.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 ultra-luxury-glass p-5">
                    <h3 className="font-medium text-white mb-2">Bank Interest Statement</h3>
                    <p className="text-xs text-white/60">
                      Interest certificate from banks showing total interest earned and TDS deducted on interest income.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: Who should use this */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Who can use this tool</h2>
                <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6">
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--lux-accent)]">✓</span>
                      <span>Salaried individuals who want a quick estimate before filing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--lux-accent)]">✓</span>
                      <span>Taxpayers comparing Old vs New regime impact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--lux-accent)]">✓</span>
                      <span>Anyone wanting to understand their approximate tax liability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--lux-accent)]">✓</span>
                      <span>Users who want to extract data from PDFs without manual entry</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Limitations */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Limitations of OCR-based estimation</h2>
                <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6">
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-white/40">•</span>
                      <span><strong className="text-white/90">Document quality affects accuracy</strong> — Scanned or low-resolution PDFs may have extraction errors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white/40">•</span>
                      <span><strong className="text-white/90">Format variations</strong> — Different employers/banks use different formats; not all fields may be detected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white/40">•</span>
                      <span><strong className="text-white/90">User review is mandatory</strong> — You must verify and correct all extracted values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white/40">•</span>
                      <span><strong className="text-white/90">Indicative only</strong> — This is an estimate, not an official computation</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 6: FAQs */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Frequently asked questions</h2>
                <FAQSection faqs={faqs} pageUrl="https://bmwealth.co.in/tools/itr-filing-help" />
              </section>

            </div>

            {/* Footer Info + Disclaimer */}
            <div className="mt-12 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6">
              <p className="text-xs text-white/50 leading-relaxed">
                This tool provides an educational estimate generated using OCR and user-reviewed inputs. 
                It does not constitute tax advice, filing, or official computation. 
                BM Wealth is not a Chartered Accountant firm and does not file returns. 
                Please consult a qualified professional before submission.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[11px] text-white/40">
                  PMS Certification 2430447816 | ARN 90008 | IRDAI 277925
                </p>
                <p className="mt-2 text-[11px] text-white/40">
                  Explore: <Link href="/tools" className="underline underline-offset-4 hover:text-white/60">All Tools</Link> ·{' '}
                  <Link href="/tools/all-calculators" className="underline underline-offset-4 hover:text-white/60">Calculators</Link> ·{' '}
                  <Link href="/live-intelligence" className="underline underline-offset-4 hover:text-white/60">Live Intelligence</Link> ·{' '}
                  <Link href="/contact" className="underline underline-offset-4 hover:text-white/60">Contact</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

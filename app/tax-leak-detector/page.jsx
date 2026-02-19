import Link from "next/link";

export default function TaxLeakDetectorLanding() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 font-inter">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-white/55">Tool</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-tight">
          Tax Leak Detector
        </h1>
        <p className="mt-5 text-white/75 leading-relaxed">
          In high-income portfolios, the biggest leaks are often not market-related — they’re execution-related.
          A small mismatch between salary structure, deductions, proof timing and regime choice can create a
          meaningful gap between what you expected and what you actually pay.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Start the calculation</h2>
          <p className="mt-2 text-white/70">
            Use our tax optimization tool to compare Old vs New regime and see an estimate with a breakdown.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/tax-optimization"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Open Tax Tool <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm hover:bg-white/5"
            >
              Talk to BM Wealth <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="mt-10 space-y-6 text-white/75 leading-relaxed">
          <h2 className="text-2xl font-serif text-[color:var(--lux-accent)]">What this helps you spot</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Old vs New regime mismatch when deductions are under-used or over-assumed</li>
            <li>Missed standard deduction impact in salary planning</li>
            <li>HRA documentation timing issues and rent/basic alignment</li>
            <li>Overlooking 80C / 80D / NPS planning windows</li>
            <li>Last-minute proof rush that leads to avoidable errors</li>
          </ul>
          <p>
            This is informational and estimate-based. Always verify with official sources or your tax
            professional before filing.
          </p>
        </div>

        {/* Deep dive: Digital Store products */}
        <div className="mt-10 border border-white/10 bg-white/5 p-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/70 mb-3">Go deeper</p>
          <p className="text-sm text-white/75 leading-relaxed mb-3">
            Want a structured, printable resource? These educational guides go deeper.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://store.bmwealth.co.in/products/form-16-tax-leak-checklist"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[color:var(--lux-accent)] underline underline-offset-4 hover:opacity-80"
            >
              Form 16 Review & Tax Leak Checklist (PDF + printable) \u2192
            </a>
            <a
              href="https://store.bmwealth.co.in/products/mumbai-tax-leak-playbook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[color:var(--lux-accent)] underline underline-offset-4 hover:opacity-80"
            >
              Mumbai High-Income Playbook: 7 Tax Leak Traps \u2192
            </a>
          </div>
          <p className="mt-3 text-[11px] text-white/50">
            Educational content only \u2014 not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'BM Digital Store – Educational PDFs & Tools',
  description: 'Premium educational PDFs, checklists, and templates by BM Wealth. Self-paced learning for tax planning, personal finance, and wealth building.',
};

export default function StoreHomePage() {
  return (
    <div className="space-y-16">
      {/* BM Wealth brand attribution */}
      <div className="flex items-center gap-4">
        <Image src="/logo.webp" alt="BM Wealth" width={44} height={44} className="rounded-none" />
        <div>
          <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">
            An initiative by BM Wealth
          </p>
          <p className="text-xs text-[color:var(--lux-foreground-40)]">
            Distinguished Wealth Architecture
          </p>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="h-8 w-px bg-[color:var(--lux-foreground-10)]" aria-hidden="true" />
          <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">
            BM Wealth • Digital Store
          </p>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight tracking-tight">
          <span className="gold-gradient-text-static">Self-paced learning</span>
          <br />
          <span className="text-[color:var(--lux-foreground-80)]">for deliberate wealth building</span>
        </h1>

        <p className="max-w-2xl text-base md:text-lg leading-relaxed font-light text-[color:var(--lux-foreground-60)]">
          Premium educational PDFs, checklists, and templates — designed with the same rigour we bring to our advisory practice. Build financial clarity at your own pace.
        </p>

        {/* Product bullets */}
        <div className="max-w-xl space-y-4">
          {[
            { icon: '📋', title: 'Form 16 Review & Tax Leak Checklist', desc: 'Cross-check TDS, deductions, and commonly missed items — printable.' },
            { icon: '🔍', title: 'Mumbai High-Income Playbook: 7 Tax Leak Traps', desc: 'Lifestyle-based leaks explained with real numbers — no stock tips.' },
            { icon: '📊', title: 'SIP vs Panic Selling Workbook', desc: 'Plug your own SIP, simulate a crash, see the cost of panic — in Excel.' },
            { icon: '📐', title: 'Wealth Blueprint Starter Kit', desc: 'Goal templates, cashflow tracker, and priority frameworks for Mumbai families.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[color:var(--lux-foreground)]">{item.title}</p>
                <p className="text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — matches "Complimentary Wealth Blueprint" style */}
        <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
          <Link
            href="/products"
            className="group relative overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-10 md:px-12 py-5 md:py-6 no-underline"
          >
            <span className="relative z-10 flex items-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
              Browse Products
              <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-2" />
            </span>
            <span
              className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/delivery"
            className="group relative overflow-hidden border border-[color:var(--lux-foreground-10)] bg-transparent text-[color:var(--lux-foreground-80)] px-10 md:px-12 py-5 md:py-6 no-underline hover:border-[color:var(--lux-foreground-40)] transition-colors"
          >
            <span className="relative z-10 flex items-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
              Delivery Policy
              <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-2" />
            </span>
          </Link>
        </div>
      </section>

      {/* VALUE PROPOSITIONS — card grid matching "Our Services" style */}
      <section className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Digital delivery', desc: 'Instant access after payment. No physical shipping — download links arrive immediately.' },
          { title: 'Clear policies', desc: 'Transparent terms, privacy, refund, and delivery policies. No surprises.' },
          { title: 'Educational only', desc: 'All content is for learning purposes only — never investment advice or guaranteed returns.' },
        ].map((c) => (
          <div
            key={c.title}
            className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9"
          >
            <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)]">{c.title}</p>
            <p className="mt-4 text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </section>

      {/* DISCLAIMER */}
      <section className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9">
        <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Important Disclaimer</p>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--lux-foreground-60)]">
          All products on this store are for educational purposes only. They do not constitute investment advice, tax advice, or personalised recommendations. No guaranteed returns are implied. Please consult a qualified professional before making any financial decisions.
        </p>
      </section>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Complimentary Wealth Blueprint | BM Wealth",
  description:
    "Access BM Wealth’s complimentary blueprint gateway, then explore tools and insights designed to bring clarity and execution to your financial decisions.",
};

export default function BlueprintPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 lg:px-10 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/60">
            BM Wealth • Complimentary Entry
          </p>
          <h1 className="mt-4 text-3xl lg:text-5xl font-semibold text-[color:var(--color-matte-gold)]">
            Access Your Complimentary Wealth Blueprint
          </h1>
          <p className="mt-4 text-base lg:text-lg text-white/75 leading-relaxed">
            This is the gateway to our proof-led tools and educational insights. Start with a clear diagnostic,
            understand the variables, then make decisions with confidence.
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 ultra-luxury-glass overflow-hidden">
            <div className="px-6 py-6 lg:px-10 lg:py-8">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">1) Context</div>
                  <div className="text-xs text-white/65 mt-1">
                    Understand what matters for your situation (inputs, assumptions, timelines).
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">2) Proof</div>
                  <div className="text-xs text-white/65 mt-1">
                    Run a tool that shows the numbers clearly, with an auditable breakdown.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">3) Decision</div>
                  <div className="text-xs text-white/65 mt-1">
                    Choose the next step only after you've seen the evidence.
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/tools/tax-optimization" className="btn-primary text-center">
                  Start With Tax Optimization Proof
                </Link>
                <Link href="/services" className="btn-secondary text-center">
                  Explore Services {"\u2192"}
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-white/55">
                Educational tools only. No urgency language. No forced decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

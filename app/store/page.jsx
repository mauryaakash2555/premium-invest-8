import Link from 'next/link';

export const metadata = {
  title: 'Home',
  description: 'Digital educational PDFs and tools.',
};

export default function StoreHomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">BM Wealth • Digital Store</p>
        <h1 className="text-3xl sm:text-4xl font-semibold leading-tight gold-gradient-text-static">Learn with digital PDFs and tools</h1>
        <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">
          Digital educational content (PDFs/tools). Digital delivery only. Education-only — not advice.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="min-h-11 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/20 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-black/25 hover:border-white/20"
          >
            View products
          </Link>
          <Link
            href="/delivery"
            className="min-h-11 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/10 px-6 py-3 text-sm text-white/80 hover:text-white hover:border-white/15"
          >
            Delivery policy
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { t: 'Digital delivery', d: 'No physical shipping. Access is digital.' },
          { t: 'Clear policies', d: 'Terms, privacy, refund, and delivery pages are available.' },
          { t: 'Educational only', d: 'For learning purposes only — not advice.' },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
            <p className="text-sm font-semibold gold-gradient-text-static">{c.t}</p>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6">
        <p className="text-sm font-semibold gold-gradient-text-static">Disclaimer</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">This content is for educational purposes only. It is not advice.</p>
      </section>
    </div>
  );
}

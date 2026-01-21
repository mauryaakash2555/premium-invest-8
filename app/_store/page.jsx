import Link from 'next/link';

export default function StoreHomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Digital educational store</p>
        <h1 className="text-4xl font-semibold leading-tight">Learn with digital PDFs and tools</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-white/70">
          This store sells only digital educational content (PDFs/tools). No 1:1 guidance, no execution, and no promises.
        </p>
        <div className="flex gap-3">
          <Link href="/products" className="inline-flex items-center rounded-none border border-white/15 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10">
            View products
          </Link>
          <Link href="/delivery" className="inline-flex items-center rounded-none border border-white/15 px-5 py-3 text-sm text-white/80 hover:text-white">
            Delivery policy
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { t: 'Digital delivery', d: 'No physical shipping. Access is digital.' },
          { t: 'Clear policies', d: 'Privacy, refund, and delivery pages are available in the footer.' },
          { t: 'Educational only', d: 'Content is for learning purposes — not financial advice.' },
        ].map((c) => (
          <div key={c.t} className="rounded-none border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">{c.t}</p>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="rounded-none border border-white/10 bg-white/5 p-6">
        <p className="text-sm font-semibold text-white">Disclaimer</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          This content is for educational purposes only. It is not financial advice.
        </p>
      </section>
    </div>
  );
}

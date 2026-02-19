import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import products from '@/data/store-products.json';

export const metadata = {
  title: 'Products',
  description: 'Premium educational PDFs, checklists, and templates by BM Wealth Digital Store.',
};

export default function StoreProductsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-6 mb-6">
          <div className="h-8 w-px bg-[color:var(--lux-foreground-10)]" aria-hidden="true" />
          <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">
            Catalogue
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[color:var(--lux-foreground)]">
          Products
        </h1>
        <p className="mt-3 text-base text-[color:var(--lux-foreground-60)] max-w-2xl leading-relaxed">
          All items are digital educational content. Instant delivery after payment — no physical goods shipped.
        </p>
      </div>

      {/* Product Grid — matching "Our Services" card layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
        }}
      >
        {products.map((p) => (
          <article
            key={p.slug}
            className="group border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9 flex flex-col transition-transform duration-500 hover:-translate-y-1"
          >
            <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)]">
              {p.type}
            </p>
            <h2 className="mt-4 text-xl font-semibold text-[color:var(--lux-foreground)]">
              {p.name}
            </h2>
            <p className="mt-3 text-sm text-[color:var(--lux-foreground-60)] leading-relaxed flex-1">
              {p.description}
            </p>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[color:var(--lux-foreground-40)]">Price</span>
                <p className="text-lg font-semibold text-[color:var(--lux-foreground)]">
                  {p.priceInr === 0 ? 'Free' : `₹${p.priceInr}`}
                </p>
              </div>
              <Link
                href={`/products/${p.slug}`}
                className="group/btn relative overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-8 py-4 no-underline"
              >
                <span className="relative z-10 flex items-center gap-3 text-[9px] tracking-[0.22em] uppercase font-semibold">
                  View details
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/btn:translate-x-1.5" />
                </span>
                <span
                  className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover/btn:translate-x-0 transition-transform duration-500"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9 text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">
        <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)] mb-4">Disclaimer</p>
        These products are for educational purposes only. They do not constitute investment advice, tax advice, or personalised recommendations. No guaranteed returns are implied.
      </div>
    </div>
  );
}

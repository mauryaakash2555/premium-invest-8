import Link from 'next/link';
import products from '@/data/store-products.json';

export const metadata = {
  title: 'Products',
  description: 'Digital educational PDFs and tools.',
};

export default function StoreProductsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Catalogue</p>
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="mt-2 text-sm text-white/70">All items are digital educational content. Digital delivery only.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((p) => (
          <article key={p.slug} className="rounded-none border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">{p.type}</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{p.name}</h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{p.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-white">
                <span className="text-white/60">Price: </span>
                <span className="font-semibold">₹{p.priceInr}</span>
              </div>
              <Link
                href={`/products/${p.slug}`}
                className="rounded-none border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-5 text-sm text-white/70">
        Disclaimer: These products are for educational purposes only. They do not provide advice or recommendations.
      </div>
    </div>
  );
}

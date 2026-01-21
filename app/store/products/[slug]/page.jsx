import { notFound } from 'next/navigation';
import products from '@/data/store-products.json';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return { title: 'Product' };
  return {
    title: product.name,
    description: product.description,
  };
}

export default function StoreProductDetailPage({ params }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return notFound();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">{product.type}</p>
        <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">{product.description}</p>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-white/60">Price: </span>
            <span className="text-lg font-semibold text-white">₹{product.priceInr}</span>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-none border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/60"
            title="Payments not enabled yet"
          >
            Buy Now (Coming soon)
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-white">What you receive</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/70">
              {product.whatYouGet.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Delivery</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{product.delivery}</p>
          </div>
        </div>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6">
        <p className="text-sm font-semibold text-white">Educational disclaimer</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          This is for educational purposes only. This is not financial advice.
        </p>
      </div>
    </div>
  );
}

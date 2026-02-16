import { notFound, redirect } from 'next/navigation';
import products from '@/data/store-products.json';
import { RazorpayCheckoutButton } from '@/components/store/RazorpayCheckoutButton';

const LEGACY_SLUG_REDIRECTS = {
  'basics-of-personal-finance': 'basics-of-personal-finance-pdf',
  'tax-planning-checklist': 'tax-planning-checklist-pdf',
  'monthly-savings-toolkit': 'monthly-savings-toolkit-pdf',
  'tax-optimization-blueprint': 'tax-optimization-pdf',
  'property-vs-sip-premium-report': 'property-vs-sip-pdf',
};

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const requestedSlug = params?.slug;
  const slug = LEGACY_SLUG_REDIRECTS[requestedSlug] || requestedSlug;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: 'Product' };
  return {
    title: product.name,
    description: product.description,
  };
}

export default function StoreProductDetailPage({ params, searchParams }) {
  const requestedSlug = params?.slug;
  const slug = LEGACY_SLUG_REDIRECTS[requestedSlug] || requestedSlug;
  if (requestedSlug && slug && requestedSlug !== slug) {
    const qs = searchParams ? new URLSearchParams(searchParams).toString() : '';
    redirect(`/products/${slug}${qs ? `?${qs}` : ''}`);
  }

  const product = products.find((p) => p.slug === slug);
  if (!product) return notFound();

  const returnTo = typeof searchParams?.returnTo === 'string' ? searchParams.returnTo : '';

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
          <RazorpayCheckoutButton productSlug={product.slug} productName={product.name} successRedirectUrl={returnTo} />
        </div>

        {/* CCAvenue-required delivery notice - must be visible */}
        <div className="mt-4 rounded-none border border-[--lux-accent]/30 bg-[--lux-accent]/10 p-4">
          <p className="text-sm font-semibold text-[--lux-accent]">📥 Digital Delivery</p>
          <p className="mt-1 text-sm leading-relaxed text-white/80">
            This is a digital product. Access/download link will be provided immediately after successful payment. No physical goods are shipped.
          </p>
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
            <p className="text-sm font-semibold text-white">Delivery method</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{product.delivery}</p>
          </div>
        </div>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6">
        <p className="text-sm font-semibold text-white">Disclaimer</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          This product is for educational purposes only. It is not advice and does not provide recommendations.
        </p>
      </div>
    </div>
  );
}

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import products from '@/data/store-products.json';
import { RazorpayCheckoutButton } from '@/components/store/RazorpayCheckoutButton';

const LEGACY_SLUG_REDIRECTS = {
  'basics-of-personal-finance': 'basics-of-personal-finance-pdf',
  'tax-planning-checklist': 'tax-planning-checklist-pdf',
  'monthly-savings-toolkit': 'monthly-savings-toolkit-pdf',
  'tax-optimization-blueprint': 'tax-optimization-pdf',
  'property-vs-sip-premium-report': 'property-vs-sip-pdf',
};

/* ── Product-specific "Who this is for" and "How it helps" copy ── */
const PRODUCT_EXTRAS = {
  'basics-of-personal-finance-pdf': {
    whoFor: 'Young professionals and early career individuals looking to build a solid foundation in personal finance fundamentals.',
    howHelps: 'Gives you a structured starting point — budgeting basics, savings concepts, and a glossary of key financial terms — so you can make more informed decisions.',
  },
  'tax-planning-checklist-pdf': {
    whoFor: 'Salaried professionals in India who want to organise their tax-related documents and understand common deductions before the financial year ends.',
    howHelps: 'Provides a year-round checklist so you never miss a deadline, with a structured list of documentation needed for the most common tax-saving instruments.',
  },
  'monthly-savings-toolkit-pdf': {
    whoFor: 'Anyone building a systematic savings habit — especially those who want clear worksheets and goal-setting frameworks rather than generic advice.',
    howHelps: 'Walks you through goal-setting exercises, provides a simple glossary of financial terms, and includes fill-in worksheets to track your progress month by month.',
  },
  'tax-optimization-pdf': {
    whoFor: 'Salaried individuals filing ITR-1 who have already uploaded their Form 16 using our free ITR Filing Help tool.',
    howHelps: 'Extracts and organises all values you need for the ITR portal, compares Old vs New regime, and gives you a step-by-step filing guide — so you can file with confidence.',
  },
  'property-vs-sip-pdf': {
    whoFor: 'Mumbai-based professionals evaluating the real opportunity cost of property ownership versus disciplined investing.',
    howHelps: 'Explains the key assumptions, trade-offs, and financial concepts behind a property vs SIP comparison — without advocating either option. Includes a glossary and FAQs.',
  },
  'form-16-tax-leak-checklist': {
    whoFor: 'Salaried professionals who want to systematically verify their Form 16 and catch missed deductions before filing ITR.',
    howHelps: 'Gives you a structured, printable checklist covering TDS, HRA, 80C, 80D, NPS, and standard deduction — so you can cross-check every line item with confidence.',
  },
  'mumbai-tax-leak-playbook': {
    whoFor: 'Mumbai high-income professionals (₹15L+) who suspect they\u2019re leaving money on the table through lifestyle-based financial leaks.',
    howHelps: 'Walks you through 7 common traps — idle cash, wrong FD allocation, insufficient term cover, and more — with simplified numbers and an action-step summary for each.',
  },
  'sip-vs-panic-workbook': {
    whoFor: 'SIP investors who want to understand (with their own numbers) the real cost of stopping investments during a market crash.',
    howHelps: 'Lets you plug in your actual SIP, choose a crash scenario, and see the post-tax gap between discipline and panic — in a hands-on spreadsheet you can keep and revisit.',
  },
  'wealth-blueprint-starter-kit': {
    whoFor: 'Mumbai families who want a clear, structured starting point for goal-setting, cashflow tracking, and priority planning.',
    howHelps: 'Provides ready-to-use templates and a concise guide that helps you organise goals, timelines, and monthly cashflow — without needing prior financial planning experience.',
  },
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
  const extras = PRODUCT_EXTRAS[slug] || {
    whoFor: 'Anyone interested in self-paced financial education and structured learning materials.',
    howHelps: 'Provides clear, organised content to help you build financial literacy at your own pace.',
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)] transition-colors no-underline mb-6"
        >
          <span aria-hidden="true">←</span> Back to Products
        </Link>

        <div className="flex items-center gap-6 mb-4">
          <div className="h-8 w-px bg-[color:var(--lux-foreground-10)]" aria-hidden="true" />
          <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)]">
            {product.type}
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[color:var(--lux-foreground)]">
          {product.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--lux-foreground-60)]">
          {product.description}
        </p>
      </div>

      {/* Price + Buy */}
      <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[color:var(--lux-foreground-40)]">Price</span>
            <p className="text-2xl font-semibold text-[color:var(--lux-foreground)]">
              {product.priceInr === 0 ? 'Free' : `₹${product.priceInr}`}
            </p>
          </div>
          <RazorpayCheckoutButton productSlug={product.slug} productName={product.name} successRedirectUrl={returnTo} />
        </div>

        {/* CCAvenue-required delivery notice */}
        <div className="mt-8 border border-[color:var(--lux-accent)]/30 bg-[color:var(--lux-accent)]/5 p-6">
          <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[color:var(--lux-accent)]">📥 Digital Delivery</p>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--lux-foreground-60)]">
            This is a digital product. Access/download link will be provided immediately after successful payment. No physical goods are shipped.
          </p>
        </div>
      </div>

      {/* STRUCTURED SECTIONS */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* What you get */}
        <section className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9">
          <h2 className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)] mb-6">
            What you get
          </h2>
          <ul className="space-y-3">
            {product.whatYouGet.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[color:var(--lux-accent)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Who this is for */}
        <section className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9">
          <h2 className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)] mb-6">
            Who this is for
          </h2>
          <p className="text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">
            {extras.whoFor}
          </p>
        </section>

        {/* How it helps */}
        <section className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9">
          <h2 className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)] mb-6">
            How it helps
          </h2>
          <p className="text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">
            {extras.howHelps}
          </p>
        </section>

        {/* Delivery method */}
        <section className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9">
          <h2 className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)] mb-6">
            Delivery method
          </h2>
          <p className="text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">
            {product.delivery}
          </p>
        </section>
      </div>

      {/* IMPORTANT DISCLAIMER */}
      <section className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9">
        <h2 className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)] mb-4">
          Important Disclaimer
        </h2>
        <p className="text-sm leading-relaxed text-[color:var(--lux-foreground-60)]">
          This product is for educational purposes only. It does not constitute investment advice, tax advice, or personalised recommendations. No guaranteed returns are implied or promised. The content is designed to help you learn and understand financial concepts — it is not a substitute for professional advice. Please consult a qualified financial advisor or tax professional before making any financial decisions.
        </p>
        <p className="mt-4 text-xs text-[color:var(--lux-foreground-40)]">
          Educational content only — not advice.
        </p>
      </section>
    </div>
  );
}

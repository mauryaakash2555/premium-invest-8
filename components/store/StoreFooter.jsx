import Link from 'next/link';

const LEGAL_LINKS = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund & Cancellation', href: '/refund' },
  { label: 'Delivery / Shipping', href: '/delivery' },
];

export default function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-background)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="text-[10px] tracking-[0.5em] uppercase font-semibold gold-gradient-text-static">BM Digital Store</p>
            <p className="mt-3 text-sm text-[color:var(--lux-foreground-60)] leading-relaxed">
              Digital educational PDFs, guides, and tools. For learning purposes only — not investment advice.
            </p>
            <a
              href="https://bmwealth.co.in"
              className="mt-3 inline-flex text-sm text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)] transition-colors no-underline"
              rel="noopener noreferrer"
            >
              Visit bmwealth.co.in →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)] transition-colors no-underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Compliance line */}
        <div className="mt-8 border-t border-[color:var(--lux-foreground-10)] pt-6">
          <p className="text-[11px] text-[color:var(--lux-foreground-40)] leading-relaxed">
            Operated by BM Wealth (PMS 2430447816 · AMFI ARN 90008 · IRDAI 277925). Educational content only — not investment advice.
          </p>
        </div>

        <div className="mt-6 border-t border-[color:var(--lux-foreground-10)] pt-6 text-xs text-[color:var(--lux-foreground-40)]">
          © {new Date().getFullYear()} BM Digital Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

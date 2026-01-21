import Link from 'next/link';

const LEGAL_LINKS = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund & Cancellation', href: '/refund' },
  { label: 'Delivery / Shipping', href: '/delivery' },
];

export default function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-white">BM Digital Store</p>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              Digital educational PDFs, guides, and tools. For learning purposes only — not financial advice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-white/80 hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} BM Digital Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

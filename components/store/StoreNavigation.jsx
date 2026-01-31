'use client';

import Link from 'next/link';

export default function StoreNavigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[color:var(--lux-background)]/75 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-4">
        <div className="min-w-0">
          <Link href="/" className="block text-sm sm:text-base font-semibold gold-gradient-text-static tracking-[0.22em] uppercase">
            BM Digital Store
          </Link>
          <a
            href="https://www.bmwealth.co.in"
            className="mt-1 block text-xs text-white/60 hover:text-white/80"
            rel="noopener noreferrer"
          >
            ← Back to BM Wealth
          </a>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm text-white/80">
          {[{ href: '/', label: 'Home' }, { href: '/products', label: 'Products' }, { href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="min-h-11 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/85 hover:border-white/15 hover:bg-black/25"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

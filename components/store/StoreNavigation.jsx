'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function StoreNavigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-background)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/logo.webp" alt="BM Wealth" width={32} height={32} className="shrink-0" />
          <div className="min-w-0">
            <Link href="/" className="block text-sm font-semibold gold-gradient-text-static tracking-[0.22em] uppercase no-underline">
              BM Digital Store
            </Link>
            <a
              href="https://bmwealth.co.in"
              className="mt-0.5 block text-[10px] tracking-[0.15em] text-[color:var(--lux-foreground-40)] hover:text-[color:var(--lux-foreground-60)] transition-colors no-underline"
              rel="noopener noreferrer"
            >
              by BM Wealth
            </a>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm">
          {[
            { href: '/', label: 'Home' },
            { href: '/products', label: 'Products' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex items-center justify-center border border-[color:var(--lux-foreground-10)] bg-transparent px-4 py-2 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-medium text-[color:var(--lux-foreground-60)] hover:border-[color:var(--lux-foreground-40)] hover:text-[color:var(--lux-foreground)] transition-colors no-underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

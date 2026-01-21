'use client';

import Link from 'next/link';

export default function StoreNavigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-[0.25em] uppercase text-white">
          BM Digital Store
        </Link>

        <nav className="flex items-center gap-6 text-sm text-white/80">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/products" className="hover:text-white">Products</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
      </div>
    </header>
  );
}

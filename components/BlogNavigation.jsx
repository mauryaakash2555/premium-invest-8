'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pillars = [
  { name: 'BM Editorial', slug: 'editorial' },
  { name: 'Community Impact', slug: 'impact' },
  { name: 'Guest Columns', slug: 'guest' },
  { name: 'Dev Writes', slug: 'dev' },
];

export default function BlogNavigation() {
  const pathname = usePathname() || '';
  const active = pathname.split('/')[2] || 'editorial';

  return (
    <nav
      className="flex justify-center mb-8 border-b"
      style={{ borderColor: 'rgba(255,255,255,0.10)' }}
    >
      {pillars.map((p) => {
        const isActive = active === p.slug;
        return (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="relative">
            <button
              className="px-6 py-3 transition-colors"
              style={{
                color: isActive ? 'var(--lux-accent)' : '#9ca3af',
                borderBottom: isActive ? '2px solid var(--lux-accent)' : '2px solid transparent',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
              }}
            >
              {p.name}
            </button>
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bmwealth.co.in';

const LABELS = {
  'about-us': 'About Us',
  services: 'Services',
  'portfolio-management': 'Portfolio Management',
  'mutual-funds': 'Mutual Funds',
  insurance: 'Insurance',
  'fixed-deposits': 'Fixed Deposits',
  'live-intelligence': 'Live Intelligence',
  contact: 'Contact',
  blog: 'Blog',
  tools: 'Tools',
  platforms: 'Platforms',
  sip: 'SIP',
  'sip-calculator': 'SIP Calculator',
  intelligence: 'Intelligence',
};

function titleCaseFromSlug(slug) {
  const s = decodeURIComponent(String(slug || '')).replace(/[-_]+/g, ' ').trim();
  if (!s) return '';
  return s
    .split(' ')
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(' ');
}

function shouldHideForPath(pathname) {
  if (!pathname) return true;
  if (pathname === '/') return true;
  if (pathname === '/archive') return true;
  if (pathname === '/client-portal') return true;
  if (pathname.startsWith('/admin-secret-')) return true;
  if (pathname.startsWith('/live-intelligence')) return true;
  if (pathname.startsWith('/embed/')) return true;
  return false;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  if (shouldHideForPath(pathname)) return null;

  const segments = String(pathname)
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean);

  if (!segments.length) return null;

  const crumbs = [{ href: '/', label: 'Home' }];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({
      href: acc,
      label: LABELS[seg] || titleCaseFromSlug(seg),
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: c.label,
      item: `${SITE_URL}${c.href === '/' ? '' : c.href}`,
    })),
  };

  return (
    <div className="w-full mt-[70px] lg:mt-[85px] bg-black/60 backdrop-blur-sm border-b border-white/5">
      <div className="mx-auto max-w-[1600px] px-5 lg:px-10 py-3">
        <nav aria-label="Breadcrumb" className="text-xs text-white/70">
          <ol className="flex flex-wrap items-center gap-2">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li key={c.href} className="flex items-center gap-2">
                  {isLast ? (
                    <span className="text-white/85 font-semibold">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-white/90 underline decoration-white/20 underline-offset-4">
                      {c.label}
                    </Link>
                  )}
                  {!isLast ? <span aria-hidden className="text-white/25">/</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </div>
    </div>
  );
}

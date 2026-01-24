'use client';

import Link from 'next/link';

/**
 * Related Services Component for Internal Linking
 * 
 * Creates internal linking clusters between related service pages
 * to improve SEO crawlability and user navigation.
 */

const serviceLinks = {
  'mutual-funds': [
    { href: '/sip', label: 'SIP Investment' },
    { href: '/portfolio-management', label: 'Portfolio Management' },
    { href: '/sip-calculator', label: 'SIP Calculator' },
  ],
  'sip': [
    { href: '/mutual-funds', label: 'Mutual Funds' },
    { href: '/sip-calculator', label: 'SIP Calculator' },
    { href: '/portfolio-management', label: 'Portfolio Management' },
  ],
  'portfolio-management': [
    { href: '/mutual-funds', label: 'Mutual Funds' },
    { href: '/sip', label: 'SIP Investment' },
    { href: '/insurance', label: 'Insurance Solutions' },
  ],
  'insurance': [
    { href: '/fixed-deposits', label: 'Fixed Deposits' },
    { href: '/portfolio-management', label: 'Portfolio Management' },
    { href: '/mutual-funds', label: 'Mutual Funds' },
  ],
  'fixed-deposits': [
    { href: '/insurance', label: 'Insurance Solutions' },
    { href: '/mutual-funds', label: 'Mutual Funds' },
    { href: '/sip', label: 'SIP Investment' },
  ],
};

export default function RelatedServices({ currentService }) {
  const links = serviceLinks[currentService] || [];
  
  if (links.length === 0) return null;
  
  return (
    <section className="mt-16 pt-8 border-t border-white/10">
      <h3 className="text-lg font-medium text-white/80 mb-4">
        Related Services
      </h3>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

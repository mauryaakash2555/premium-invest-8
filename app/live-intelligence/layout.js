import { buildMetadata, getMetadataBase } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Live Intelligence | BM Wealth',
  description:
    'Live Intelligence helps you explore market updates, insights, and financial context in a clean, fast interface. Review everything carefully before acting.',
  path: '/live-intelligence',
  robots: { index: false, follow: false },
});

import Link from 'next/link';

export default function LiveIntelligenceLayout({ children }) {
  const baseUrl = getMetadataBase().origin;
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Live Intelligence', item: `${baseUrl}/live-intelligence` },
    ],
  };

  return (
    <>
      {children}

      {/* Schema-only breadcrumbs (no UI change) */}
      <script
        id="live-intelligence-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visually hidden, indexable HTML (no UI change) */}
      <div
        style={{
          position: 'absolute',
          left: '-10000px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <h1>Live Intelligence</h1>
        <p>
          Live Intelligence provides market context and insights. This is informational content—verify sources and
          numbers before making decisions.
        </p>
        <p>
          Useful links: <Link href="/tools">Tools</Link>, <Link href="/tools/itr-filing-help">ITR Filing Help</Link>,{' '}
          <Link href="/blog">Blog</Link>.
        </p>
      </div>

      {/*
        Crawlable HTML (without changing the visible UI):
        - Keeps the page visually identical to the overlay for JS users.
        - Provides indexable text when JS is disabled.
      */}
      <noscript>
        <section
          style={{
            background: '#090A0C',
            color: 'rgba(235, 242, 255, 0.9)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '28px 16px',
          }}
        >
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <h1 style={{ fontSize: 20, margin: '0 0 10px 0' }}>Live Intelligence</h1>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(235, 242, 255, 0.75)' }}>
              Live Intelligence is a focused dashboard for market context and insights. Always verify numbers and
              sources before making financial decisions.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/tools" style={{ color: 'rgba(170, 198, 255, 0.9)', textDecoration: 'underline' }}>
                Explore Tools
              </Link>
              <Link
                href="/tools/itr-filing-help"
                style={{ color: 'rgba(170, 198, 255, 0.9)', textDecoration: 'underline' }}
              >
                Free ITR Filing Help
              </Link>
              <Link href="/blog" style={{ color: 'rgba(170, 198, 255, 0.9)', textDecoration: 'underline' }}>
                Read the Blog
              </Link>
            </div>
          </div>
        </section>
      </noscript>
    </>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | BM Wealth',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-[var(--lux-background)] text-[color:var(--lux-foreground)] px-6 lg:px-10 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden border border-[color:var(--lux-foreground-10)] bg-[var(--lux-card)]/60 p-8 lg:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-60 gold-grain-texture" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 bg-[var(--lux-background)]/35" aria-hidden="true" />

          <div className="relative">
            <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--lux-foreground-60)]">
              BM Wealth
            </div>
            <h1 className="mt-3 text-3xl lg:text-5xl font-serif tracking-tight text-[var(--lux-accent)]">
              Page Not Found
            </h1>
            <p className="mt-4 text-base lg:text-lg text-[color:var(--lux-foreground-80)] leading-relaxed max-w-2xl">
              The page you’re looking for doesn’t exist, or the link may be outdated.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="btn-primary">
                Back to Home
              </Link>
              <Link href="/blog" className="btn-secondary">
                Browse Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

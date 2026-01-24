'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

function StatusBadge({ children }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.70)',
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(255,255,255,0.04)',
        padding: '8px 12px',
      }}
    >
      {children}
    </span>
  );
}

export default function ExecutionPartnersPage() {
  return (
    <main className="px-6 lg:px-10 py-14 lg:py-20" style={{ background: '#000' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          Execution Partners <span className="text-white/60">(Optional)</span>
        </h1>
        <p className="mt-4 text-white/75 leading-relaxed">
          This page is a neutral routing bridge. It’s for users who want to execute after learning from BM Wealth tools
          and content. Execution integrations may be unavailable while reviewed.
        </p>

        <div className="mt-10 grid gap-4">
          <section className="border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-medium text-white">Zerodha</h2>
                <p className="mt-1 text-white/70 text-sm">Brokerage platform (listed for reference).</p>
              </div>
              <StatusBadge>Execution integration under review</StatusBadge>
            </div>
            <p className="mt-3 text-white/60 text-sm">
              Execution links will be enabled once platform integrations are live.
            </p>
          </section>

          <section className="border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-medium text-white">Smallcase</h2>
                <p className="mt-1 text-white/70 text-sm">Thematic portfolios (listed for reference).</p>
              </div>
              <StatusBadge>Execution integration under review</StatusBadge>
            </div>
            <p className="mt-3 text-white/60 text-sm">
              Execution links will be enabled once platform integrations are live.
            </p>
          </section>

          <section className="border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-medium text-white">Groww</h2>
                <p className="mt-1 text-white/70 text-sm">Investing app (listed for reference).</p>
              </div>
              <StatusBadge>Execution integration under review</StatusBadge>
            </div>
            <p className="mt-3 text-white/60 text-sm">
              Execution links will be enabled once platform integrations are live.
            </p>
          </section>
        </div>

        <div className="mt-10 border border-white/10 bg-black/40 p-5">
          <p className="text-white/70 text-sm leading-relaxed">
            Prefer to stay in research mode? See <Link className="text-white underline underline-offset-4" href="/platforms">Platforms</Link>.
            If you want help reviewing options based on your situation, use <Link className="text-white underline underline-offset-4" href="/contact">Contact</Link>.
          </p>

          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            onClick={() => trackEvent('execution_partners_view', { page: '/execution-partners' })}
          >
            Acknowledge (no action)
          </button>
        </div>
      </div>
    </main>
  );
}

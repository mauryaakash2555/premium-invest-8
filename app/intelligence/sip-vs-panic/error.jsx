"use client";

import Link from "next/link";

export default function SipVsPanicError({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
        <h2 className="text-lg font-semibold">SIP vs Panic is temporarily unavailable</h2>
        <p className="mt-2 text-sm text-white/70">
          Something went wrong while loading the simulator. Please try again.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-11 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
          >
            Retry
          </button>
          <Link
            href="/"
            className="min-h-11 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/5 flex items-center justify-center"
          >
            Go home
          </Link>
        </div>
        {process.env.NODE_ENV !== "production" ? (
          <pre className="mt-4 text-xs text-white/60 whitespace-pre-wrap">{String(error?.message || error)}</pre>
        ) : null}
      </div>
    </div>
  );
}

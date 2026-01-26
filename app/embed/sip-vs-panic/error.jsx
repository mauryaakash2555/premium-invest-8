"use client";

export default function SipVsPanicEmbedError({ reset }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/30 p-5 text-white">
        <div className="text-sm font-semibold">Embed failed to load</div>
        <div className="mt-1 text-xs text-white/70">Please retry. If the issue persists, reload the host page.</div>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 min-h-10 w-full rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-2 text-xs font-semibold text-black hover:opacity-95"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

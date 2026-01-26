"use client";

import { useState } from "react";

import { X } from "lucide-react";

export function ComplianceBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="w-full rounded-2xl border px-4 py-3 text-white"
      style={{
        borderColor: 'color-mix(in oklab, var(--lux-accent) 35%, rgba(255,255,255,0.12))',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.22) 100%)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold leading-snug text-white/95">
          ⚠️ Educational tool for learning only — not investment advice. Past performance ≠ future results. Consult your financial advisor before investing.
        </div>
        <button
          type="button"
          aria-label="Dismiss disclaimer"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg border border-white/15 bg-white/5 p-1.5 text-white/90 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

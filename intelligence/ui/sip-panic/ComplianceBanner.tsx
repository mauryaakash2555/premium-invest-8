"use client";

import { useState } from "react";

import { X } from "lucide-react";

export function ComplianceBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full rounded-2xl border border-white/10 ultra-luxury-glass px-4 py-3 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold leading-snug text-white/95">
          ⚠️ Educational tool for learning only — not investment advice. Past performance ≠ future results. Consult your financial advisor before investing.
        </div>
        <button
          type="button"
          aria-label="Dismiss disclaimer"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg border border-white/15 bg-black/20 p-1.5 text-white/90 hover:bg-black/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import { X } from "lucide-react";

export function ComplianceBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full rounded-2xl border border-amber-400/35 bg-amber-400/15 px-4 py-3 text-amber-100">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold leading-snug">
          ⚠️ Educational tool for learning only — not investment advice. Past performance ≠ future results. Consult your financial advisor before investing.
        </div>
        <button
          type="button"
          aria-label="Dismiss disclaimer"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg border border-amber-300/20 bg-black/10 p-1.5 text-amber-100/90 hover:bg-black/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

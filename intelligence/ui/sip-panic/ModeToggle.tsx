"use client";

import { cn } from "@/lib/utils";

export type SIPUiMode = "beginner" | "advanced";

export function ModeToggle(props: {
  currentMode: SIPUiMode;
  onChange: (mode: SIPUiMode) => void;
}) {
  const { currentMode, onChange } = props;

  return (
    <div className="mb-6 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/90">Choose your experience</p>
          <p className="mt-0.5 text-xs text-white/65">Switch anytime if you want more or fewer details.</p>
        </div>

        <div
          role="tablist"
          aria-label="Beginner or Advanced mode"
          className="sm:ml-auto rounded-xl border border-white/10 bg-black/20 p-1 inline-flex gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentMode === "beginner"}
            onClick={() => onChange("beginner")}
            className={cn(
              "min-h-10 rounded-lg px-3 py-2 text-xs transition-colors",
              currentMode === "beginner" ? "bg-emerald-500 text-black" : "text-white/85 hover:bg-white/5"
            )}
          >
            Beginner
            <span className="ml-2 text-[11px] opacity-70">(2 min)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={currentMode === "advanced"}
            onClick={() => onChange("advanced")}
            className={cn(
              "min-h-10 rounded-lg px-3 py-2 text-xs transition-colors",
              currentMode === "advanced"
                ? "bg-[color:var(--lux-accent)] text-black"
                : "text-white/85 hover:bg-white/5"
            )}
          >
            Advanced
            <span className="ml-2 text-[11px] opacity-70">(Pro)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

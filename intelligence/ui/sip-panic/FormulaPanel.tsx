"use client";

import { useMemo, useState } from "react";

export function FormulaPanel() {
  const [open, setOpen] = useState(false);

  const text = useMemo(() => {
    return (
      "XIRR (education-only):\n" +
      "Find r such that NPV = Σ (CF_t / (1 + r)^{t}) = 0\n\n" +
      "Simplified tax (education-only):\n" +
      "LTCG approx = max(0, Gain - Exemption) × Rate\n" +
      "Total tax ≈ BaseTax + Surcharge + Cess\n"
    );
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white/90">Show the math (optional)</div>
          <div className="mt-1 text-xs text-white/70">Formulas are for understanding, not forecasts.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="min-h-10 rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/5"
          >
            {open ? "Hide formulas" : "Show formulas"}
          </button>
          <button
            type="button"
            onClick={copy}
            className="min-h-10 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-2 text-xs font-semibold text-black hover:opacity-95"
          >
            Copy
          </button>
        </div>
      </div>

      {open ? (
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-[12px] text-white/85">
          {text}
        </pre>
      ) : null}
    </div>
  );
}

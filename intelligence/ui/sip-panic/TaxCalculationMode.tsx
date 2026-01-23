"use client";

import { Label } from "@/components/ui/label";

export type TaxCalculationModeKey = "conservative_stcg_30" | "optimized_ltcg_indexation_20";

export function TaxCalculationMode(props: {
  value: TaxCalculationModeKey;
  onChange: (next: TaxCalculationModeKey) => void;
}) {
  const { value, onChange } = props;

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <div>
        <h2 className="text-base font-semibold gold-gradient-text">Tax calculation mode</h2>
        <p className="mt-1 text-xs text-white/75">
          Choose a simplified tax method for learning. LTCG applies if held &gt; 1 year. Consult your CA for actual tax liability.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 cursor-pointer hover:border-white/15">
          <input
            type="radio"
            name="taxCalcMode"
            value="conservative_stcg_30"
            checked={value === "conservative_stcg_30"}
            onChange={() => onChange("conservative_stcg_30")}
            className="mt-1 accent-[oklch(0.78_0.08_65)]"
          />
          <span className="min-w-0">
            <span className="text-white/90 font-medium">Conservative (STCG - 30% flat)</span>
            <span className="block text-xs text-white/65">Assumes a higher tax rate (worst-case style).</span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 cursor-pointer hover:border-white/15">
          <input
            type="radio"
            name="taxCalcMode"
            value="optimized_ltcg_indexation_20"
            checked={value === "optimized_ltcg_indexation_20"}
            onChange={() => onChange("optimized_ltcg_indexation_20")}
            className="mt-1 accent-[oklch(0.78_0.08_65)]"
          />
          <span className="min-w-0">
            <span className="text-white/90 font-medium">Optimized (LTCG - 20% with indexation)</span>
            <span className="block text-xs text-white/65">Applies a simple indexation approximation before taxing gains.</span>
          </span>
        </label>
      </div>

      <div className="mt-3 text-[11px] text-white/65">
        <Label className="text-[11px] text-white/75">Disclaimer</Label>
        <div className="mt-1">
          Rules vary by instrument type, holding period, and changes in law. This simulator is education-only.
        </div>
      </div>
    </div>
  );
}

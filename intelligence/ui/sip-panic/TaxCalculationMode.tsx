"use client";

import { Label } from "@/components/ui/label";
import { useLang } from "./LangContext";

export type TaxCalculationModeKey = "conservative_stcg_30" | "optimized_ltcg_indexation_20";

export function TaxCalculationMode(props: {
  value: TaxCalculationModeKey;
  onChange: (next: TaxCalculationModeKey) => void;
}) {
  const { value, onChange } = props;
  const { t } = useLang();

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <div>
        <h2 className="text-base font-semibold gold-gradient-text">{t("taxMode.title")}</h2>
        <p className="mt-1 text-xs text-white/75">{t("taxMode.subtitle")}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
        <label className="min-h-11 flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 cursor-pointer hover:border-white/15">
          <input
            type="radio"
            name="taxCalcMode"
            value="conservative_stcg_30"
            checked={value === "conservative_stcg_30"}
            onChange={() => onChange("conservative_stcg_30")}
            className="mt-1 accent-[oklch(0.78_0.08_65)]"
          />
          <span className="min-w-0">
            <span className="text-white/90 font-medium">{t("taxMode.conservativeTitle")}</span>
            <span className="block text-xs text-white/65">{t("taxMode.conservativeDesc")}</span>
          </span>
        </label>

        <label className="min-h-11 flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 cursor-pointer hover:border-white/15">
          <input
            type="radio"
            name="taxCalcMode"
            value="optimized_ltcg_indexation_20"
            checked={value === "optimized_ltcg_indexation_20"}
            onChange={() => onChange("optimized_ltcg_indexation_20")}
            className="mt-1 accent-[oklch(0.78_0.08_65)]"
          />
          <span className="min-w-0">
            <span className="text-white/90 font-medium">{t("taxMode.optimizedTitle")}</span>
            <span className="block text-xs text-white/65">{t("taxMode.optimizedDesc")}</span>
          </span>
        </label>
      </div>

      <div className="mt-3 text-[11px] text-white/65">
        <Label className="text-[11px] text-white/75">{t("taxMode.disclaimerTitle")}</Label>
        <div className="mt-1">
          {t("taxMode.disclaimerBody")}
        </div>
      </div>
    </div>
  );
}

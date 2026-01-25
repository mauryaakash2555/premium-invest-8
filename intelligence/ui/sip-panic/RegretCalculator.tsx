"use client";

import { useMemo } from "react";

import { LakhTooltip } from "./LakhTooltip";

function futureValueSip(params: { monthlyAmount: number; years: number; assumedAnnualReturn: number }): number {
  const monthlyAmount = Math.max(0, params.monthlyAmount);
  const years = Math.max(0, Math.floor(params.years));
  const months = years * 12;
  if (months <= 0 || monthlyAmount <= 0) return 0;

  const r = Math.pow(1 + Math.max(0, params.assumedAnnualReturn), 1 / 12) - 1;
  if (r <= 0) return monthlyAmount * months;

  // End-of-month SIP contributions.
  return monthlyAmount * ((Math.pow(1 + r, months) - 1) / r);
}

export function RegretCalculator(props: { monthlyAmount: number }) {
  const { monthlyAmount } = props;

  const rows = useMemo(() => {
    const assumedAnnualReturn = 0.12;
    const yearsList = [5, 10, 15];
    return yearsList.map((y) => {
      const hypothetical = futureValueSip({ monthlyAmount, years: y, assumedAnnualReturn });
      return { years: y, hypothetical, regret: hypothetical };
    });
  }, [monthlyAmount]);

  return (
    <div className="mt-10 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <h2 className="text-base font-semibold gold-gradient-text">If You Had Started Earlier…</h2>
      <p className="mt-2 text-xs text-white/70">
        Education-only urgency lens. Assumes a steady 12% annual market return and ignores taxes.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.years} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/70">If you started</div>
            <div className="mt-1 text-sm font-semibold text-white">{r.years} years ago</div>
            <div className="mt-3 text-2xl font-semibold gold-gradient-text tabular-nums">
              <LakhTooltip amount={r.hypothetical} decimals={1} className="tabular-nums cursor-help" />
            </div>
            <div className="mt-1 text-[11px] text-white/60">
              Delay cost:{" "}
              <LakhTooltip amount={r.regret} decimals={1} className="tabular-nums cursor-help" />
            </div>
            <div className="mt-1 text-[11px] text-white/55">Based on a 12% annual assumed return (education-only). Not a forecast.</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-white/75">Don’t wait another year. Start today.</div>
    </div>
  );
}

"use client";

import { useMemo } from "react";

import type { SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";

function formatInr(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function formatInrLakhs(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  const short = `₹${(v / 100_000).toFixed(2)}L`;
  return `${short} (${formatInr(v)})`;
}

function formatPct(p: number): string {
  if (!Number.isFinite(p)) return "0%";
  return `${p.toFixed(1)}%`;
}

export function CalculationDetails(props: { results: SIPSimulationResult[] }) {
  const { results } = props;

  const discipline = useMemo(() => results.find((r) => r.scenario.behaviorType === "discipline") ?? null, [results]);

  const worst = useMemo(() => {
    const candidates = results.filter((r) => r.scenario.behaviorType !== "discipline");
    if (!candidates.length) return null;
    return candidates.reduce((best, cur) => (cur.behavioralCost > best.behavioralCost ? cur : best), candidates[0]);
  }, [results]);

  if (!discipline || !worst) return null;

  const d = discipline;
  const w = worst;

  return (
    <details className="mt-8 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <summary className="cursor-pointer select-none text-sm font-semibold text-white/90">
        Show calculation details
      </summary>
      <div className="mt-4 text-sm text-white/80">
        This section is for verification-minded users. The main UI focuses on the final after-tax outcomes.
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-semibold text-white">{d.scenario.name}</div>
          <div className="mt-2 font-mono text-[12px] leading-6 text-white/85">
            Monthly SIP: {formatInr(d.calculation.monthlySip)}
            <br />
            Duration: {d.calculation.months} months
            <br />
            Total invested: {formatInrLakhs(d.totalInvested)}
            <br />
            Final amount (after tax): {formatInrLakhs(d.postTaxCorpus)}
            <br />
            Annual return: {formatPct(d.xirr)} per year
            <br />
            Equity units (approx): {d.calculation.equityUnits.toFixed(4)}
            <br />
            Avg purchase NAV (approx): {d.calculation.avgPurchaseIndex.toFixed(2)}
            <br />
            Ending NAV: {d.calculation.endingMarketIndex.toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-semibold text-white">{w.scenario.name}</div>
          <div className="mt-2 font-mono text-[12px] leading-6 text-white/85">
            Panic triggered: {w.calculation.panickedAtMonth !== null ? `Month ${w.calculation.panickedAtMonth + 1}` : "—"}
            <br />
            You invested (total): {formatInrLakhs(w.totalInvested)}
            <br />
            Final amount (after tax): {formatInrLakhs(w.postTaxCorpus)}
            <br />
            Annual return: {formatPct(w.xirr)} per year
            <br />
            Equity contributed: {formatInrLakhs(w.calculation.equityContributed)}
            <br />
            Cash contributed: {formatInrLakhs(w.calculation.cashContributed)}
            <br />
            End equity value: {formatInrLakhs(w.calculation.finalEquityValue)}
            <br />
            End cash value: {formatInrLakhs(w.calculation.finalCashValue)}
            <br />
            Equity units (approx): {w.calculation.equityUnits.toFixed(4)}
            <br />
            Equity units at panic: {w.calculation.equityUnitsAtPanic !== null ? w.calculation.equityUnitsAtPanic.toFixed(4) : "—"}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs font-semibold text-white">Behavioral cost (after tax)</div>
        <div className="mt-2 font-mono text-[12px] leading-6 text-white/85">
          {formatInrLakhs(d.postTaxCorpus)} (stay calm) − {formatInrLakhs(w.postTaxCorpus)} (panic behavior) = {formatInrLakhs(w.behavioralCost)}
        </div>
        <div className="mt-2 text-[11px] text-white/65">
          When the cash bucket is enabled, we assume you still keep saving monthly, but into safe options (~6%/yr) instead of equity.
        </div>
      </div>

      <div className="mt-4 text-[11px] text-white/65">
        Notes: "Annual return" is the internal IRR (XIRR-style) computed from monthly cashflows plus the final after-tax value.
      </div>
    </details>
  );
}

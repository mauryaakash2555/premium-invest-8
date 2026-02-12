"use client";

import { useMemo, useState } from "react";

import type { SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { LakhTooltip } from "./LakhTooltip";
import { TaxBreakdownDialog } from "./TaxBreakdownDialog";

const TooltipContentAny = TooltipContent as any;

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatInr0(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return inr0.format(Math.max(0, v));
}

function TaxExemptionInfo(props: {
  gain: number;
  simulatorTaxPaid: number;
  breakdown?: SIPSimulationResult["taxBreakdown"];
  row: SIPSimulationResult;
}) {
  const { gain, simulatorTaxPaid, breakdown, row } = props;

  const [open, setOpen] = useState(false);

  const method = breakdown?.method ?? "engine_default";
  const category = breakdown?.category ?? "ltcg";
  const capitalGain = breakdown?.capitalGain ?? gain;
  const proceeds = breakdown?.proceeds;
  const costBasis = breakdown?.costBasis;

  const isEngineDefault = method === "engine_default";
  const isIndexation = method === "ltcg_20_indexation";

  const exemptionApplied =
    isEngineDefault && category === "ltcg"
      ? (breakdown?.ltcgExemptionApplied ?? Math.min(125_000, Math.max(0, capitalGain)))
      : (breakdown?.ltcgExemptionApplied ?? 0);

  const taxableGains = breakdown?.taxableGains ?? Math.max(0, Math.max(0, capitalGain) - exemptionApplied);

  const baseRate =
    typeof breakdown?.baseRate === "number"
      ? Math.max(0, breakdown.baseRate)
      : category === "stcg"
        ? 0.20
        : 0.125;

  const baseTax = breakdown?.baseTax ?? taxableGains * baseRate;
  const surchargeRate = breakdown?.surchargeRate ?? 0;
  const surcharge = breakdown?.surcharge ?? baseTax * surchargeRate;
  const cessRate = breakdown?.cessRate ?? 0;
  const cess = breakdown?.cess ?? (baseTax + surcharge) * cessRate;
  const totalTax = breakdown?.totalTax ?? simulatorTaxPaid;

  const exemptionTaxSavedBase = isEngineDefault && category === "ltcg" ? exemptionApplied * baseRate : 0;
  // Cess applies on (base + surcharge). This multiplicative approximation matches how the add-ons are modeled.
  const exemptionTaxSaved = exemptionTaxSavedBase * (1 + surchargeRate) * (1 + cessRate);

  const headline =
    method === "stcg_30_flat"
      ? "STCG (30% flat)"
      : method === "ltcg_20_indexation"
        ? "LTCG (20% with indexation)"
        : category === "stcg"
          ? "STCG"
          : category === "slab"
            ? "Slab"
            : "LTCG";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Tax info"
            onClick={() => setOpen(true)}
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full text-white/55 hover:text-white/85 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContentAny
          side="top"
          className="max-w-[260px] border border-white/15 bg-black/90 text-white/90"
        >
          <div className="text-xs font-semibold text-white/90">
            {headline} calculation (education-only)
          </div>
          {isEngineDefault && category === "ltcg" ? (
            <div className="mt-1 text-[11px] text-white/70">
              <span className="font-semibold text-white/85">LTCG Tax Breakdown</span>
              <div>
                You don&apos;t pay tax on the first <span className="font-semibold text-white/85">₹1.25L (₹1,25,000)</span> of LTCG gains (annual exemption concept).
              </div>
            </div>
          ) : null}
          {isIndexation && breakdown?.indexation ? (
            <div className="mt-1 text-[11px] text-white/70">
              <span className="font-semibold text-white/85">Indexation (education-only)</span>
              <div>
                Cost basis is inflation-adjusted at ~{(breakdown.indexation.inflationRateAnnual * 100).toFixed(0)}%/yr.
              </div>
            </div>
          ) : null}
          <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-2 text-[11px] text-white/85">
            {typeof proceeds === "number" ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Proceeds</span>
                <span className="font-semibold tabular-nums">{formatInr0(proceeds)}</span>
              </div>
            ) : null}
            {typeof costBasis === "number" ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Cost basis</span>
                <span className="font-semibold tabular-nums">{formatInr0(costBasis)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Capital gain</span>
              <span className="font-semibold tabular-nums">{formatInr0(capitalGain)}</span>
            </div>
            {isEngineDefault && category === "ltcg" ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/65">Less exemption</span>
                  <span className="font-semibold tabular-nums">{formatInr0(exemptionApplied)}</span>
                </div>
                <div className="mt-1 text-[11px] text-white/70">
                  (You don&apos;t pay tax on first ₹1.25L (₹1,25,000) of LTCG gains)
                </div>
              </>
            ) : null}
            {isIndexation && breakdown?.indexation ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Indexed cost basis</span>
                <span className="font-semibold tabular-nums">{formatInr0(breakdown.indexation.indexedCostBasis)}</span>
              </div>
            ) : null}
            <div className="my-1 h-px bg-white/10" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Taxable gains</span>
              <span className="font-semibold tabular-nums">{formatInr0(taxableGains)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Tax @ {(baseRate * 100).toFixed(1)}%</span>
              <span className="font-semibold tabular-nums">{formatInr0(baseTax)}</span>
            </div>
            {surchargeRate > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Surcharge ({(surchargeRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold tabular-nums">{formatInr0(surcharge)}</span>
              </div>
            ) : null}
            {cessRate > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/65">Cess ({(cessRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold tabular-nums">{formatInr0(cess)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/65">Total tax (simulated)</span>
              <span className="font-semibold tabular-nums">{formatInr0(totalTax)}</span>
            </div>
          </div>

          {isEngineDefault && category === "ltcg" && exemptionApplied > 0 ? (
            <div className="mt-2 text-[11px] text-white/75">
              <div>
                <span className="font-semibold text-white/85">Exemption savings:</span> ~{formatInr0(exemptionTaxSaved)} in this run.
              </div>
              <div className="mt-0.5 text-white/65">
                (Base-tax savings ≈ {formatInr0(exemptionTaxSavedBase)})
              </div>
            </div>
          ) : null}

          <div className="mt-2 text-[11px] text-white/70">
            Simulator tax paid shown on the card: <span className="font-semibold text-white/85">{formatInr0(simulatorTaxPaid)}</span>.
            This is an education-only model and may differ from your actual tax situation.
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[11px] font-semibold text-[oklch(0.78_0.08_65)] hover:opacity-90"
            >
              View full breakdown →
            </button>
          </div>
        </TooltipContentAny>
      </Tooltip>

      <TaxBreakdownDialog open={open} onClose={() => setOpen(false)} row={row} />
    </TooltipProvider>
  );
}

function XirrInfo() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="What is XIRR?"
            className="inline-flex items-center justify-center rounded-full text-white/55 hover:text-white/85 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <span className="text-[13px] leading-none">i</span>
          </button>
        </TooltipTrigger>
        <TooltipContentAny
          side="top"
          align="center"
          className="max-w-[320px] border border-white/10 bg-black/90 text-white shadow-xl"
        >
          <div className="text-xs text-white/85">
            <div className="font-semibold text-white">Annual return (XIRR)</div>
            <div className="mt-2 text-white/75">
              XIRR is an annualised return computed from monthly cashflows (your SIPs) and the final value after tax.
              It’s a compact way to compare scenarios, not a guarantee of future returns.
            </div>
          </div>
        </TooltipContentAny>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatPct(p: number): string {
  if (!Number.isFinite(p)) return "0.0%";
  return `${p.toFixed(1)}%`;
}

function csvEscape(value: string): string {
  // RFC4180-ish: wrap in quotes, double any internal quotes.
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n") + "\r\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ResultsDashboard(props: { results: SIPSimulationResult[] }) {
  const { results } = props;

  const discipline = useMemo(() => results.find((r) => r.scenario.behaviorType === "discipline") ?? null, [results]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<"cards" | "table">("cards");

  const resultsContent =
    view === "table" ? (
      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-black/20">
        <table className="min-w-[860px] w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-white/60">
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3">Scenario</th>
              <th className="text-right px-4 py-3">Invested</th>
              <th className="text-right px-4 py-3">After tax</th>
              <th className="text-right px-4 py-3">
                <span className="inline-flex items-center justify-end gap-1 w-full">
                  Annual return
                  <XirrInfo />
                </span>
              </th>
              <th className="text-right px-4 py-3">Tax</th>
              <th className="text-right px-4 py-3">
                <span className="inline-flex items-center justify-end gap-1 w-full">
                  Behavioral cost
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label="What is behavioral cost?"
                          className="inline-flex items-center justify-center h-11 w-11 rounded-full text-white/55 hover:text-white/85 focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContentAny side="top" className="max-w-[260px] border border-white/10 bg-black/90 text-white/90">
                        <div className="text-[11px] text-white/80">
                          This is wealth lost to panic-selling behavior: <span className="font-semibold text-white/90">discipline − panic</span> (after tax).
                        </div>
                      </TooltipContentAny>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const isDiscipline = r.scenario.behaviorType === "discipline";
              return (
                <tr key={r.scenario.name} className="border-b border-white/5 last:border-b-0">
                  <td className={`px-4 py-3 ${isDiscipline ? "text-white font-semibold" : "text-white/90"}`}>{r.scenario.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-white/85">
                    <LakhTooltip amount={r.totalInvested} />
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${isDiscipline ? "gold-gradient-text font-semibold" : "text-white/90"}`}
                  >
                    <LakhTooltip
                      amount={r.postTaxCorpus}
                      className={isDiscipline ? "font-semibold gold-gradient-text tabular-nums" : "tabular-nums"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-white/85">{formatPct(r.xirr)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-white/85">
                    <span className="inline-flex items-center gap-1">
                      <LakhTooltip amount={r.taxPaid} className="tabular-nums" />
                      <TaxExemptionInfo
                        gain={Math.max(0, (r.calculation?.finalEquityValue ?? 0) - (r.calculation?.equityContributed ?? 0))}
                        simulatorTaxPaid={r.taxPaid}
                        breakdown={r.taxBreakdown}
                        row={r}
                      />
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${
                      isDiscipline ? "" : "text-[color:var(--lux-accent)]"
                    }`}
                  >
                    {isDiscipline ? "—" : (
                      <LakhTooltip
                        amount={r.behavioralCost}
                        prefix="-"
                        className="tabular-nums text-[color:var(--lux-accent)]"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {results.map((r) => {
          const key = r.scenario.name;
          const isDiscipline = r.scenario.behaviorType === "discipline";
          const showAll = expanded[key] ?? false;

          return (
            <Card
              key={key}
              className="border border-white/10 ultra-luxury-glass premium-hover-glow rounded-2xl overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{r.scenario.name}</div>
                    <div className="mt-1 text-xs text-white/75">{r.scenario.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/55 inline-flex items-center gap-1">
                      Final amount (after tax)
                      <TaxExemptionInfo
                        gain={Math.max(0, (r.calculation?.finalEquityValue ?? 0) - (r.calculation?.equityContributed ?? 0))}
                        simulatorTaxPaid={r.taxPaid}
                        breakdown={r.taxBreakdown}
                        row={r}
                      />
                    </div>
                    <div className={`text-base font-semibold ${isDiscipline ? "gold-gradient-text" : "text-white/90"}`}>
                      <LakhTooltip
                        amount={r.postTaxCorpus}
                        className={
                          (isDiscipline ? "gold-gradient-text font-semibold " : "text-white/90 font-semibold ") +
                          "tabular-nums cursor-help underline decoration-white/15 underline-offset-4 hover:decoration-white/30"
                        }
                      />
                    </div>
                  </div>
                </div>

                {!isDiscipline ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-[11px] tracking-wide text-white/70 uppercase">Your behavioral cost</div>
                    <div className="mt-2 text-3xl sm:text-4xl font-semibold text-[color:var(--lux-accent)]">
                      <LakhTooltip
                        amount={r.behavioralCost}
                        prefix="-"
                        className="tabular-nums text-[color:var(--lux-accent)] cursor-help underline decoration-white/15 underline-offset-4 hover:decoration-white/30"
                      />
                    </div>
                    <div className="mt-2 text-xs text-white/80">Gap vs disciplined outcome (post-tax). This is the “cost of panic”.</div>
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-white/55">Invested</div>
                    <div className="mt-1 text-white/90 font-semibold">
                      <LakhTooltip amount={r.totalInvested} className="tabular-nums cursor-help" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-white/55 inline-flex items-center gap-1">
                      Final amount (after tax)
                      <TaxExemptionInfo
                        gain={Math.max(0, (r.calculation?.finalEquityValue ?? 0) - (r.calculation?.equityContributed ?? 0))}
                        simulatorTaxPaid={r.taxPaid}
                        breakdown={r.taxBreakdown}
                        row={r}
                      />
                    </div>
                    <div className="mt-1 text-white/90 font-semibold">
                      <LakhTooltip amount={r.postTaxCorpus} className="tabular-nums cursor-help" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-white/55 inline-flex items-center gap-1">
                      Annual return
                      <XirrInfo />
                    </div>
                    <div className="mt-1 text-white/90 font-semibold">{formatPct(r.xirr)}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-white/55">Cash bucket (end)</div>
                    <div className="mt-1 text-white/90 font-semibold">
                      <LakhTooltip amount={r.calculation.finalCashValue} className="tabular-nums cursor-help" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white/55 inline-flex items-center gap-1">
                      Tax paid
                      <TaxExemptionInfo
                        gain={Math.max(0, (r.calculation?.finalEquityValue ?? 0) - (r.calculation?.equityContributed ?? 0))}
                        simulatorTaxPaid={r.taxPaid}
                        breakdown={r.taxBreakdown}
                        row={r}
                      />
                    </div>
                    <div className="text-white/90 font-semibold">{formatInr0(r.taxPaid)}</div>
                  </div>
                </div>

                <details
                  open={showAll}
                  onToggle={(e) => {
                    const isOpen = Boolean((e.currentTarget as HTMLDetailsElement).open);
                    setExpanded((prev) => ({ ...prev, [key]: isOpen }));
                  }}
                  className="mt-4 rounded-xl border border-white/10 bg-black/15 p-4"
                >
                  <summary className="cursor-pointer select-none text-xs font-semibold text-white/85">Show math / calculation details</summary>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/80">
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-white/55">Mode</div>
                      <div className="mt-1 font-semibold text-white/90">{r.calculation.mode === "cash" ? "Cash bucket" : "Pure stop"}</div>
                      <div className="mt-2 text-white/65">
                        Annual SIP: <LakhTooltip amount={r.calculation.monthlySip * 12} className="tabular-nums cursor-help" />
                        <span className="text-white/55">/yr</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-white/55">Trigger & pauses</div>
                      <div className="mt-1 font-semibold text-white/90">
                        {r.calculation.panickedAtMonth !== null
                          ? `Panic month: ${r.calculation.panickedAtMonth + 1}`
                          : r.calculation.firstPausedMonth !== null
                            ? `First pause: ${r.calculation.firstPausedMonth + 1}`
                            : "No trigger"}
                      </div>
                      <div className="mt-2 text-white/65">Paused months: {r.calculation.pausedMonths}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-white/55">Contributions</div>
                      <div className="mt-1 text-white/90">
                        Equity contributed: <LakhTooltip amount={r.calculation.equityContributed} className="tabular-nums cursor-help" />
                      </div>
                      <div className="mt-1 text-white/90">
                        Cash contributed: <LakhTooltip amount={r.calculation.cashContributed} className="tabular-nums cursor-help" />
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-white/55">End values</div>
                      <div className="mt-1 text-white/90">
                        Equity value: <LakhTooltip amount={r.calculation.finalEquityValue} className="tabular-nums cursor-help" />
                      </div>
                      <div className="mt-1 text-white/90">
                        Cash value: <LakhTooltip amount={r.calculation.finalCashValue} className="tabular-nums cursor-help" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-white/65">
                    Avg purchase index: {r.calculation.avgPurchaseIndex.toFixed(1)} · Ending market index: {r.calculation.endingMarketIndex.toFixed(1)}
                  </div>
                </details>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-white/75">Insights</div>
                    {r.insights.length > 4 ? (
                      <Button
                        variant="outline"
                        className="h-8 px-3 text-xs border-white/15 bg-black/20 text-white/90 hover:bg-white/5 hover:text-white"
                        onClick={() => setExpanded((s) => ({ ...s, [key]: !showAll }))}
                      >
                        {showAll ? (
                          <>
                            Show less <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show all <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>

                  <ul className="mt-2 space-y-1.5 text-xs text-white/85">
                    {(showAll ? r.insights : r.insights.slice(0, 4)).map((line, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/30 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );

  if (!results.length) {
    return (
      <div className="rounded-2xl border border-white/10 ultra-luxury-glass p-5 text-sm text-white/70">
        Run a simulation to see results.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold gold-gradient-text-static">Results</h2>
          <p className="mt-1 text-sm text-white/85">Final after-tax amount, annual return, and the cost of panic.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={view === "cards" ? "default" : "secondary"}
            onClick={() => setView("cards")}
            className={view === "cards" ? "bg-white/10 hover:bg-white/15" : "bg-black/20 hover:bg-white/10"}
          >
            Cards
          </Button>
          <Button
            type="button"
            variant={view === "table" ? "default" : "secondary"}
            onClick={() => setView("table")}
            className={view === "table" ? "bg-white/10 hover:bg-white/15" : "bg-black/20 hover:bg-white/10"}
          >
            Table
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const now = new Date();
              const stamp = now.toISOString().slice(0, 10);
              downloadCsv(`sip-vs-panic-results_${stamp}.csv`, [
                ["scenario", "behavior_type", "invested_inr", "final_inr", "post_tax_inr", "xirr_pct", "tax_paid_inr", "behavioral_cost_inr"],
                ...results.map((r) => [
                  r.scenario.name,
                  r.scenario.behaviorType,
                  String(Math.round(r.totalInvested ?? 0)),
                  String(Math.round(r.finalCorpus ?? 0)),
                  String(Math.round(r.postTaxCorpus ?? 0)),
                  String(Number.isFinite(r.xirr) ? r.xirr.toFixed(2) : "0.00"),
                  String(Math.round(r.taxPaid ?? 0)),
                  String(Math.round(r.behavioralCost ?? 0)),
                ]),
              ]);
            }}
            className="bg-black/20 hover:bg-white/10"
          >
            Download CSV
          </Button>
        </div>

        {discipline ? (
          <div className="sm:text-right">
            <div className="text-xs text-white/55">Baseline (Stay calm)</div>
            <div className="text-sm font-semibold text-white/90">
              <LakhTooltip amount={discipline.postTaxCorpus} className="tabular-nums cursor-help" />
            </div>
          </div>
        ) : null}
      </div>

      {resultsContent}

      <p className="mt-4 text-[11px] text-white/70">
        Note: This is an educational simulator (deterministic market path + simplified tax realization). Please verify with official sources.
      </p>
    </div>
  );
}

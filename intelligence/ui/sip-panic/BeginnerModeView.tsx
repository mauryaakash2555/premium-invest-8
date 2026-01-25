"use client";

import { useMemo } from "react";

import type { MarketConditions, SIPScenario } from "@/intelligence/simulations/sip-vs-panic";
import { simulateSIPVsPanic } from "@/intelligence/simulations/sip-vs-panic";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { LakhTooltip } from "./LakhTooltip";

function buildDefaultMarketConditions(): MarketConditions {
  return {
    crashDepthPct: -35,
    crashStartMonth: 30,
    crashDurationMonths: 6,
    recoveryGainPct: 45,
    recoveryDurationMonths: 12,
    secondaryCorrectionDepthPct: -20,
    secondaryCorrectionDurationMonths: 3,
    secondaryCorrectionStartMonth: 78,
  };
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function BeginnerModeView(props: {
  monthlyAmount: number;
  durationYears: number;
  onChangeMonthlyAmount: (monthly: number) => void;
  onChangeDurationYears: (years: number) => void;
  onRequestAdvanced: () => void;
}) {
  const monthly = clampInt(props.monthlyAmount, 1_000, 5_00_000);
  const years = clampInt(props.durationYears, 1, 30);

  const result = useMemo(() => {
    const scenarios: SIPScenario[] = [
      {
        name: "Perfect Discipline",
        description: "Never stops SIP, regardless of market conditions",
        behaviorType: "discipline",
      },
      {
        name: "Panic: Stop SIP at 30% Drawdown",
        description: "Stops SIP contributions once market is down 30% from peak",
        behaviorType: "panic",
        panicThreshold: -30,
      },
    ];

    const taxConfig = {
      applyCess: true,
      cessRate: 0.04,
      applySurcharge: false,
      surchargeRate: 0,
    };

    const out = simulateSIPVsPanic(monthly, years, scenarios, buildDefaultMarketConditions(), {
      afterStopMode: "cash",
      riskComfort: "moderate",
      tax: taxConfig,
      taxCalculationMode: "conservative_stcg_30",
      investmentType: "equity_mf",
    });

    const disciplineRow = out.find((r) => r.scenario.behaviorType === "discipline") ?? null;
    const panicRow = out.find((r) => r.scenario.behaviorType !== "discipline") ?? null;

    const disciplineAmt = disciplineRow?.postTaxCorpus ?? 0;
    const panicAmt = panicRow?.postTaxCorpus ?? 0;
    const behavioralCost = panicRow?.behavioralCost ?? Math.max(0, disciplineAmt - panicAmt);

    const costPct = disciplineAmt > 0 ? Math.round((behavioralCost / disciplineAmt) * 100) : 0;

    return {
      out,
      disciplineRow,
      panicRow,
      disciplineAmt,
      panicAmt,
      behavioralCost,
      costPct,
    };
  }, [monthly, years]);

  const totalInvested = monthly * 12 * years;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">What if you panic during a crash?</h2>
        <p className="mt-2 text-sm sm:text-base text-white/75">See how much fear could cost you (education-only).</p>
      </section>

      <section className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-white/90">Monthly SIP (₹)</label>
          <div className="mt-2 flex items-center gap-3">
            <Input
              type="number"
              inputMode="numeric"
              min={1000}
              max={500000}
              step={500}
              value={monthly}
              onChange={(e) => props.onChangeMonthlyAmount(Number(e.target.value))}
              className="no-spinner bg-black/25 border-white/12 text-white placeholder:text-white/45"
            />
            <span className="text-xs text-white/60">/month</span>
          </div>
          <p className="mt-2 text-[11px] text-white/60">Total invested: ₹{totalInvested.toLocaleString("en-IN")}</p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-semibold text-white/90">Duration (years)</label>
            <div className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/80 tabular-nums">{years}y</div>
          </div>
          <div className="mt-2">
            <Slider
              min={1}
              max={30}
              step={1}
              value={[years]}
              onValueChange={(arr) => props.onChangeDurationYears(Number(arr?.[0] ?? years))}
              trackClassName="bg-white/10"
              rangeClassName="bg-[oklch(0.78_0.08_65)]"
              thumbClassName="border-[oklch(0.78_0.08_65)] bg-black"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/55">
              <span>1y</span>
              <span>30y</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold text-white/90">Your results (after tax)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center">
            <p className="text-xs text-emerald-100/90 font-semibold">If you stay calm & keep investing</p>
            <div className="mt-3 text-3xl sm:text-4xl font-semibold text-emerald-200 tabular-nums">
              <LakhTooltip amount={result.disciplineAmt} />
            </div>
            <p className="mt-2 text-[11px] text-emerald-100/70">Final wealth estimate</p>
          </div>

          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-6 text-center">
            <p className="text-xs text-red-100/90 font-semibold">If you panic & stop investing</p>
            <div className="mt-3 text-3xl sm:text-4xl font-semibold text-red-200 tabular-nums">
              <LakhTooltip amount={result.panicAmt} />
            </div>
            <p className="mt-2 text-[11px] text-red-100/70">Final wealth estimate</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-400/35 bg-amber-400/10 p-6 sm:p-8 text-center">
        <p className="text-xs text-amber-100/90 font-semibold">Cost of panic</p>
        <div className="mt-2 text-4xl sm:text-5xl font-semibold text-amber-200 tabular-nums">
          <LakhTooltip amount={result.behavioralCost} />
        </div>
        <p className="mt-3 text-sm text-amber-100/90 font-semibold">That’s ~{result.costPct}% of your potential wealth.</p>
        <p className="mt-3 text-[11px] text-amber-100/75">Education-only. Uses simplified tax + a designed crash/recovery path.</p>
      </section>

      <section className="rounded-2xl border border-white/10 ultra-luxury-glass p-6">
        <h4 className="text-sm font-semibold text-white/90">Why does panic cost so much?</h4>
        <ul className="mt-3 space-y-2 text-sm text-white/75">
          <li>During crashes, prices are low — continuing SIP buys more units.</li>
          <li>When markets recover, those extra units compound your recovery gains.</li>
          <li>Stopping SIP cuts off the cheapest buying period and the rebound.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <button
          type="button"
          onClick={props.onRequestAdvanced}
          className="min-h-11 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-3 text-sm font-semibold text-black hover:opacity-95"
        >
          Switch to Advanced Mode
        </button>
      </section>

      <section className="text-[11px] text-white/60 rounded-xl border border-white/10 bg-black/20 p-4">
        This is for educational purposes only. It does not constitute investment, tax, or legal advice.
      </section>
    </div>
  );
}

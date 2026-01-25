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
  const panicStopPct = 30;
  // Do not clamp the input value on every keystroke (it makes typing e.g. 15000 nearly impossible).
  // Clamp only for calculations + onBlur.
  const monthlyForCalc = clampInt(props.monthlyAmount, 1_000, 5_00_000);
  const yearsForCalc = clampInt(props.durationYears, 1, 30);
  const market = useMemo(() => buildDefaultMarketConditions(), []);
  const crashStartMonth = market.crashStartMonth ?? 30;
  const crashStartYearApprox = Math.max(0, Math.round((crashStartMonth / 12) * 10) / 10);

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
        panicThreshold: -panicStopPct,
      },
    ];

    const taxConfig = {
      applyCess: true,
      cessRate: 0.04,
      applySurcharge: false,
      surchargeRate: 0,
    };

    const cashAnnualRatePct = 6;

    const out = simulateSIPVsPanic(monthlyForCalc, yearsForCalc, scenarios, market, {
      afterStopMode: "cash",
      cashAnnualRatePct,
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
      cashAnnualRatePct,
    };
  }, [market, monthlyForCalc, panicStopPct, yearsForCalc]);

  const totalInvested = monthlyForCalc * 12 * yearsForCalc;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="rounded-2xl border border-amber-400/35 bg-amber-400/10 p-6 sm:p-8 text-center">
        <p className="text-xs text-amber-100/90 font-semibold">Your simulation shows</p>
        <div className="mt-2 text-4xl sm:text-5xl font-semibold text-amber-200 tabular-nums">
          <LakhTooltip amount={result.behavioralCost} />
        </div>
        <p className="mt-3 text-sm text-amber-100/90 font-semibold">That’s {result.costPct}% of your potential wealth — lost by panic selling.</p>
        <p className="mt-2 text-[11px] text-amber-100/80">Lost by stopping SIP when markets fall ~{panicStopPct}%.</p>
        <p className="mt-3 text-[11px] text-amber-100/75">Education-only. Uses a designed crash/recovery path + simplified tax.</p>
      </section>

      {yearsForCalc * 12 < crashStartMonth ? (
        <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
          <div className="font-semibold">Why might the cost look like ₹0 for short durations?</div>
          <div className="mt-1 text-xs text-amber-100/90">
            This education model places the “big crash” around Year ~{crashStartYearApprox}. If your duration ends before that,
            the panic trigger may never occur, so the cost can be near zero.
          </div>
        </section>
      ) : null}

      <details className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-white/90">
          Assumptions used in Beginner mode (education-only)
        </summary>
        <div className="mt-3 space-y-3 text-[12px] text-white/75">
          <div>
            <div className="font-semibold text-white/85">Crash / recovery path</div>
            <div>
              Crash: {Math.abs(market.crashDepthPct ?? 35)}% over ~{market.crashDurationMonths ?? 6} months starting ~Month {crashStartMonth} (≈ Year {crashStartYearApprox}).
              Recovery: +{market.recoveryGainPct ?? 45}% over ~{market.recoveryDurationMonths ?? 12} months.
              Secondary correction: {Math.abs(market.secondaryCorrectionDepthPct ?? 20)}% over ~{market.secondaryCorrectionDurationMonths ?? 3} months around Month {market.secondaryCorrectionStartMonth ?? 78}.
            </div>
          </div>

          <div>
            <div className="font-semibold text-white/85">Panic rule</div>
            <div>
              Stops SIP contributions once the market is ~{panicStopPct}% down from the last peak (a drawdown trigger).
              After stopping, contributions are modeled as going to cash at ~{result.cashAnnualRatePct}% annual.
            </div>
          </div>

          <div>
            <div className="font-semibold text-white/85">Tax (simplified)</div>
            <div>
              Equity MF style, conservative gains tax approximation (30% on gains) + 4% cess; no surcharge in Beginner mode.
              This is a teaching model and may differ from your actual taxes.
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-[11px] text-white/65">
            Want to change crash presets, tax profile, or see month-by-month charts? Use Advanced Mode.
          </div>
        </div>
      </details>

      <section className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5 sm:p-6">
        <div className="text-sm font-semibold text-white/90">How much & how long?</div>
        <div className="mt-1 text-[11px] text-white/60">Optional — adjust to match your situation.</div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-semibold text-white/70">Monthly SIP (₹)</div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={1000}
                max={500000}
                step={500}
                value={Number.isFinite(props.monthlyAmount) ? props.monthlyAmount : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  props.onChangeMonthlyAmount(raw === "" ? Number.NaN : Number(raw));
                }}
                onBlur={() => {
                  props.onChangeMonthlyAmount(clampInt(props.monthlyAmount, 1_000, 5_00_000));
                }}
                className="no-spinner h-10 bg-black/25 border-white/12 text-white placeholder:text-white/45"
              />
              <span className="text-[11px] text-white/55">/mo</span>
            </div>
            <div className="mt-2 text-[11px] text-white/60">Total invested: ₹{totalInvested.toLocaleString("en-IN")}</div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold text-white/70">Duration</div>
                <div className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/80 tabular-nums">{yearsForCalc}y</div>
            </div>
            <div className="mt-2">
              <Slider
                min={1}
                max={30}
                step={1}
                value={[yearsForCalc]}
                onValueChange={(arr) => props.onChangeDurationYears(Number(arr?.[0] ?? yearsForCalc))}
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
        </div>

        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="text-[11px] text-white/60">Quick scenarios</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                props.onChangeMonthlyAmount(5_000);
                props.onChangeDurationYears(5);
              }}
              className="min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:bg-white/5"
            >
              Conservative
            </button>
            <button
              type="button"
              onClick={() => {
                props.onChangeMonthlyAmount(10_000);
                props.onChangeDurationYears(10);
              }}
              className="min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:bg-white/5"
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => {
                props.onChangeMonthlyAmount(20_000);
                props.onChangeDurationYears(20);
              }}
              className="min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:bg-white/5"
            >
              Aggressive
            </button>
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

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { Slider } from "@/components/ui/slider";

import { BaseCalculatorLayout } from "@/components/calculators/BaseCalculatorLayout";
import { CalculatorHeader } from "@/components/calculators/CalculatorHeader";
import { Breakdown as BreakdownPanel } from "@/components/calculators/Breakdown";
import { PremiumCalculatorCTA } from "@/components/calculators/PremiumCalculatorCTA";
import { ExecutionOptionsCTA } from "@/components/calculators/ExecutionOptionsCTA";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

import { useCalculatorTracking } from "@/lib/hooks/useCalculatorTracking";
import { formatINR } from "@/lib/tax-formulas";

import {
  computeRetirementGap,
  formatRetirementGapResults,
  RETIREMENT_GAP_ASSUMPTIONS,
} from "@/lib/retirement-gap";

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function parseNumericInput(raw) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatCroreNumber(valueInINR) {
  const n = Number(valueInINR);
  if (!Number.isFinite(n)) return "0";
  const cr = Math.abs(n) / 10_000_000;
  const s = cr.toFixed(cr >= 10 ? 1 : 2);
  return s.replace(/\.0+$/, "").replace(/(\.[1-9])0$/, "$1");
}

function formatLakhs(valueInINR) {
  const n = Number(valueInINR);
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 10_000_000) {
    const cr = n / 10_000_000;
    const s = cr.toFixed(cr >= 10 ? 1 : 2);
    return `₹${s.replace(/\.0+$/, "").replace(/(\.[1-9])0$/, "$1")}Cr`;
  }
  const l = n / 100_000;
  const s = l.toFixed(l >= 10 ? 0 : 1);
  return `₹${s.replace(/\.0$/, "")}L`;
}

export function RetirementGapCalculator() {
  const { track } = useCalculatorTracking("retirement_gap");

  const a = RETIREMENT_GAP_ASSUMPTIONS;

  const COMPLIANCE_FOOTER = "BM Wealth | ARN 90008 | Educational mathematical projection.\n   Not investment advice.";

  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpensesRaw, setMonthlyExpensesRaw] = useState("100000");
  const [inflationRate, setInflationRate] = useState(6);
  const [currentSavingsRaw, setCurrentSavingsRaw] = useState("5000000");
  const [expectedReturn, setExpectedReturn] = useState(10);

  const [showResults, setShowResults] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [busy, setBusy] = useState(false);

  const resultsRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    track("calculator_view");
  }, []);

  const draftInputs = useMemo(
    () => ({
      currentAge: clamp(currentAge, a.minAge, a.maxAge),
      retirementAge: clamp(retirementAge, currentAge + 1, a.maxAge),
      monthlyExpenses: clamp(parseNumericInput(monthlyExpensesRaw), 0, 100_000_000),
      inflationRate: clamp(inflationRate / 100, 0, 0.20),
      currentSavings: clamp(parseNumericInput(currentSavingsRaw), 0, 10_000_000_000),
      expectedReturn: clamp(expectedReturn / 100, 0, 0.30),
    }),
    [currentAge, retirementAge, monthlyExpensesRaw, inflationRate, currentSavingsRaw, expectedReturn, a.minAge, a.maxAge]
  );

  const [model, setModel] = useState(null);
  const formatted = useMemo(() => (model ? formatRetirementGapResults(model) : null), [model]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track("calculator_start");
  }

  async function handleCalculate() {
    markStarted();
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 40));
      const computed = computeRetirementGap(draftInputs);
      setModel(computed);
      setShowResults(true);
      track("calculator_calculate");

      setTimeout(() => {
        try {
          const el = resultsRef.current;
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 96;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          }
        } catch {}
      }, 80);
    } finally {
      setBusy(false);
    }
  }

  const corpusNeededNum = model ? Number(model.corpusNeeded || 0) : 0;
  const futureValueNum = model ? Number(model.futureValueOfSavings || 0) : 0;
  const gapNum = model ? Number(model.retirementGap || 0) : 0;
  const sipRequiredNum = model ? Number(model.monthlySipRequired || 0) : 0;
  const corpusCrValue = corpusNeededNum / 10_000_000;
  const hasGap = gapNum > 0;

  const breakdownModel = useMemo(() => {
    if (!model || !formatted) return null;
    const y = model.yearsToRetirement;
    return {
      label: `Retirement gap analysis for ${y}-year horizon`,
      fiscalYear: null,
      context: "Based on 25x rule (4% safe withdrawal rate). Assumes constant inflation and return rates.",
      sections: [
        {
          title: "Inputs",
          rows: [
            { label: "Current age", value: `${model.inputs.currentAge} years` },
            { label: "Retirement age", value: `${model.inputs.retirementAge} years` },
            { label: "Years to retirement", value: `${y} years`, accent: true },
            { label: "Monthly expenses today", value: formatINR(model.inputs.monthlyExpenses) },
            { label: "Expected inflation", value: `${(model.inputs.inflationRate * 100).toFixed(1)}%` },
            { label: "Current savings", value: formatINR(model.inputs.currentSavings) },
            { label: "Expected return", value: `${(model.inputs.expectedReturn * 100).toFixed(1)}%` },
          ],
        },
        {
          title: "Projections",
          rows: [
            { label: "Monthly expenses at retirement", value: formatted.values.monthlyExpensesAtRetirement, accent: true },
            { label: "Annual expenses at retirement", value: formatted.values.annualExpensesAtRetirement },
            { label: "Corpus needed (25× annual expenses)", value: formatted.values.corpusNeeded, emphasis: true, accent: true },
            { label: "Future value of current savings", value: formatted.values.futureValueOfSavings, emphasis: true, accent: true },
          ],
        },
        {
          title: "Gap Analysis",
          rows: [
            { label: "Retirement gap", value: formatted.values.retirementGap, emphasis: true, accent: true },
            { label: "Monthly SIP to close gap", value: formatted.values.monthlySipRequired, emphasis: true, accent: true },
            { label: "Status", value: hasGap ? "Action needed" : "On track", accent: true },
          ],
        },
      ],
    };
  }, [model, formatted, hasGap]);

  return (
    <BaseCalculatorLayout
      header={
        <CalculatorHeader
          meta={
            <>
              <Image src="/logo.webp" alt="BM Wealth" width={20} height={20} className="h-5 w-auto" priority />
              <span>BM Wealth</span>
              <span className="text-white/25">•</span>
              <span>BM Wealth Calculator</span>
              <span className="text-white/25">•</span>
              <span className="text-white/45">ARN 90008 | IRDAI 277925</span>
            </>
          }
          title="Retirement Gap Stress Test"
          subtitle="Do you have enough to retire? See the math."
        />
      }
      disclaimer={<span className="whitespace-pre-line">{COMPLIANCE_FOOTER}</span>}
    >
      <div className="px-6 pb-6 lg:px-10 lg:pb-10">
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-10">
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Inputs</div>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-200/70">Current Age</div>
                    <div className="text-xs text-slate-200/60">{clamp(currentAge, a.minAge, a.maxAge)}</div>
                  </div>
                  <Slider
                    value={[clamp(currentAge, a.minAge, a.maxAge)]}
                    min={a.minAge}
                    max={a.maxAge - 1}
                    step={1}
                    onValueChange={(v) => {
                      markStarted();
                      setCurrentAge(v?.[0] ?? 30);
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-200/70">Retirement Age</div>
                    <div className="text-xs text-slate-200/60">{clamp(retirementAge, currentAge + 1, a.maxAge)}</div>
                  </div>
                  <Slider
                    value={[clamp(retirementAge, currentAge + 1, a.maxAge)]}
                    min={currentAge + 1}
                    max={a.maxAge}
                    step={1}
                    onValueChange={(v) => {
                      markStarted();
                      setRetirementAge(v?.[0] ?? 60);
                    }}
                  />
                </div>

                <div className="grid gap-1">
                  <div className="text-xs text-slate-200/70">Monthly Expenses Today (₹)</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={monthlyExpensesRaw}
                    onChange={(e) => {
                      markStarted();
                      const raw = String(e.target.value || "").replace(/[^\d]/g, "");
                      setMonthlyExpensesRaw(raw);
                    }}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[color:var(--color-matte-gold)] placeholder:text-slate-200/40 transition-colors hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-200/70">Expected Inflation Rate</div>
                    <div className="text-xs text-[color:var(--color-matte-gold)]">{inflationRate}%</div>
                  </div>
                  <Slider
                    value={[inflationRate]}
                    min={2}
                    max={15}
                    step={0.5}
                    onValueChange={(v) => {
                      markStarted();
                      setInflationRate(v?.[0] ?? 6);
                    }}
                  />
                </div>

                <div className="grid gap-1">
                  <div className="text-xs text-slate-200/70">Current Savings (₹)</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={currentSavingsRaw}
                    onChange={(e) => {
                      markStarted();
                      const raw = String(e.target.value || "").replace(/[^\d]/g, "");
                      setCurrentSavingsRaw(raw);
                    }}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[color:var(--color-matte-gold)] placeholder:text-slate-200/40 transition-colors hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-200/70">Expected Return on Investments</div>
                    <div className="text-xs text-[color:var(--color-matte-gold)]">{expectedReturn}%</div>
                  </div>
                  <Slider
                    value={[expectedReturn]}
                    min={4}
                    max={20}
                    step={0.5}
                    onValueChange={(v) => {
                      markStarted();
                      setExpectedReturn(v?.[0] ?? 10);
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={busy}
                  className="bm-btn bm-btn-primary w-full px-5 py-4 text-base font-semibold tracking-wide rounded-xl bm-calc-button"
                >
                  {busy ? "Calculating…" : "Calculate"}
                </button>
              </div>
            </div>
          </div>

          <div ref={resultsRef} className="space-y-4" style={{ scrollMarginTop: "96px" }}>
            {showResults && model && formatted ? (
              <>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">Result</div>
                  <div className="mt-2 text-white font-semibold">
                    {hasGap ? (
                      <>
                        You need a corpus of <span className="text-[color:var(--color-matte-gold)]">{formatted.values.corpusNeeded}</span> to retire at age {model.inputs.retirementAge}.
                        Your current savings will grow to {formatted.values.futureValueOfSavings}, leaving a gap of{" "}
                        <span className="text-[color:var(--color-matte-gold)]">{formatted.values.retirementGap}</span>.
                      </>
                    ) : (
                      <>Your current savings trajectory is on track to meet your retirement corpus of {formatted.values.corpusNeeded}.</>
                    )}
                  </div>
                  <div className="mt-3 text-[11px] text-slate-200/70">
                    Based on 25× rule (4% safe withdrawal rate). Inflation: {(model.inputs.inflationRate * 100).toFixed(1)}%, Return: {(model.inputs.expectedReturn * 100).toFixed(1)}%.
                  </div>
                </div>

                <div className="bm-wealth-gap-hero-container">
                  <div className="bm-wealth-gap-hero">
                    <div className="bm-wealth-gap-label">CORPUS NEEDED</div>
                    <div className="bm-wealth-gap-value-wrapper">
                      <AnimatedCounter
                        value={corpusCrValue}
                        duration={2500}
                        format={(n) => {
                          const v = Number(n);
                          if (!Number.isFinite(v)) return "₹0Cr";
                          const s = v >= 10 ? v.toFixed(1) : v.toFixed(2);
                          return `₹${s.replace(/\.0+$/, "").replace(/(\.[1-9])0$/, "$1")}Cr`;
                        }}
                        className="bm-wealth-gap-value"
                      />
                    </div>
                    <div className="bm-wealth-gap-message">
                      {hasGap
                        ? `You need ₹${formatCroreNumber(sipRequiredNum)}/mo SIP to close the gap`
                        : "Your savings are on track for retirement"}
                    </div>

                    {hasGap ? (
                      <div className="bm-wealth-gap-breakdown">
                        <div className="bm-wealth-breakdown-item">
                          <span className="bm-wealth-breakdown-label">Monthly SIP Needed</span>
                          <span className="bm-wealth-breakdown-value">{formatLakhs(sipRequiredNum)}</span>
                        </div>
                        <div className="bm-wealth-breakdown-item">
                          <span className="bm-wealth-breakdown-label">Gap</span>
                          <span className="bm-wealth-breakdown-value">{formatLakhs(gapNum)}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="bm-results-comparison">
                  <div className={hasGap ? "bm-result-card bm-result-card--winner" : "bm-result-card"}>
                    {hasGap ? <div className="bm-winner-badge">TARGET</div> : null}
                    <div className="text-sm text-slate-200/70">Corpus Needed</div>
                    <div className="mt-2 text-2xl font-semibold text-white break-words">
                      ₹{formatCroreNumber(corpusNeededNum)}Cr
                    </div>
                    <div className="mt-2 text-[11px] text-slate-200/60">
                      Monthly expenses at retirement: {formatted.values.monthlyExpensesAtRetirement}
                    </div>
                  </div>

                  <div className="bm-vs-separator" aria-hidden>VS</div>

                  <div className={!hasGap ? "bm-result-card bm-result-card--winner" : "bm-result-card bm-result-card--loser"}>
                    {!hasGap ? <div className="bm-winner-badge">ON TRACK</div> : null}
                    <div className="text-sm text-slate-200/70">Current Trajectory</div>
                    <div className="mt-2 text-xl font-semibold text-white break-words">
                      ₹{formatCroreNumber(futureValueNum)}Cr
                    </div>
                    <div className="mt-2 text-[11px] text-slate-200/60">
                      Current savings: {formatINR(model.inputs.currentSavings)}
                    </div>
                    {hasGap ? (
                      <div className="mt-2 text-sm font-semibold text-red-400 break-words whitespace-normal">
                        Gap: ₹{formatCroreNumber(gapNum)}Cr
                      </div>
                    ) : null}
                  </div>
                </div>

                {hasGap ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold text-white">Monthly SIP Required</div>
                    <div className="mt-2 text-2xl font-semibold text-[color:var(--color-matte-gold)]">
                      {formatted.values.monthlySipRequired}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-200/70">
                      Invest this monthly at {(model.inputs.expectedReturn * 100).toFixed(1)}% return to close your retirement gap in {model.yearsToRetirement} years.
                    </div>
                  </div>
                ) : null}

                <PremiumCalculatorCTA
                  labelBefore="Get your personalized retirement roadmap"
                  storeUrl="https://store.bmwealth.co.in"
                />

                <ExecutionOptionsCTA
                  title="Want help building your retirement plan?"
                  subtitle="We'll help you translate this gap into a simple action plan — SIP amount, asset allocation, and timeline."
                  whatsappPrefill={`Hi BM Wealth, I used the Retirement Gap calculator. I'm ${model.inputs.currentAge} and want to retire at ${model.inputs.retirementAge}. My gap is ₹${formatCroreNumber(gapNum)}Cr. I need help closing it.`}
                />

                <div className="trust-badges text-[11px] text-slate-200/70 space-y-1">
                  <p>1,200+ calculations done</p>
                  <p>ARN 90008 registered</p>
                  <p>Used by Mumbai professionals</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Audit Breakdown</div>
                    <button
                      type="button"
                      onClick={() => setShowBreakdown((v) => !v)}
                      className="text-xs text-[color:var(--color-matte-gold)]"
                    >
                      {showBreakdown ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showBreakdown && breakdownModel ? (
                    <div className="mt-3">
                      <BreakdownPanel {...breakdownModel} />
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .bm-calc-button {
          position: relative;
          overflow: hidden;
        }

        .bm-calc-button::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 999px;
          background: color-mix(in oklab, white 18%, transparent);
          transform: translate(-50%, -50%);
          transition: width 600ms ease, height 600ms ease;
          pointer-events: none;
        }

        .bm-calc-button:hover::before {
          width: 320px;
          height: 320px;
        }

        .bm-wealth-gap-hero-container {
          margin: 26px 0;
          position: relative;
        }

        .bm-wealth-gap-hero {
          background: radial-gradient(
            circle at 50% 0%,
            color-mix(in oklab, var(--color-matte-gold) 18%, transparent) 0%,
            color-mix(in oklab, var(--color-matte-gold) 6%, transparent) 52%,
            transparent 100%
          );
          border: 2px solid color-mix(in oklab, var(--color-matte-gold) 45%, transparent);
          border-radius: 20px;
          padding: 40px 22px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 0 44px color-mix(in oklab, var(--color-matte-gold) 22%, transparent),
            inset 0 0 22px color-mix(in oklab, var(--color-matte-gold) 10%, transparent);
        }

        .bm-wealth-gap-hero::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, color-mix(in oklab, var(--color-matte-gold) 12%, transparent) 0%, transparent 70%);
          pointer-events: none;
        }

        .bm-wealth-gap-label {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-matte-gold);
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }

        .bm-wealth-gap-value-wrapper {
          position: relative;
          z-index: 1;
          margin: 18px 0;
          line-height: 1;
        }

        .bm-wealth-gap-value {
          font-weight: 950;
          font-size: 86px;
          color: var(--color-matte-gold);
          text-shadow: 0 0 26px color-mix(in oklab, var(--color-matte-gold) 35%, transparent);
          display: inline-block;
        }

        .bm-wealth-gap-message {
          position: relative;
          z-index: 1;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.78);
          font-weight: 600;
          margin-top: 6px;
        }

        .bm-wealth-gap-breakdown {
          position: relative;
          z-index: 1;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid color-mix(in oklab, var(--color-matte-gold) 24%, transparent);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .bm-wealth-breakdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .bm-wealth-breakdown-label {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }

        .bm-wealth-breakdown-value {
          font-size: 20px;
          font-weight: 950;
          color: var(--color-matte-gold);
        }

        .bm-results-comparison {
          display: grid;
          grid-template-columns: 1.5fr auto 1fr;
          gap: 14px;
          align-items: center;
        }

        .bm-result-card {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 14px;
          padding: 16px;
          min-width: 0;
        }

        .bm-result-card--loser {
          opacity: 0.78;
          transform: scale(0.94);
        }

        .bm-result-card--winner {
          border: 2px solid color-mix(in oklab, var(--color-matte-gold) 65%, transparent);
          box-shadow: 0 0 28px color-mix(in oklab, var(--color-matte-gold) 22%, transparent);
        }

        .bm-winner-badge {
          position: absolute;
          top: -10px;
          right: 14px;
          background: var(--color-matte-gold);
          color: black;
          padding: 5px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.06em;
        }

        .bm-vs-separator {
          font-weight: 900;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.08em;
        }

        @media (max-width: 768px) {
          .bm-wealth-gap-hero {
            padding: 32px 18px;
          }

          .bm-wealth-gap-value {
            font-size: 64px;
          }

          .bm-wealth-gap-breakdown {
            grid-template-columns: 1fr;
          }

          .bm-results-comparison {
            grid-template-columns: 1fr;
          }

          .bm-vs-separator {
            display: none;
          }

          .bm-result-card--loser {
            transform: none;
          }
        }
      `}</style>
    </BaseCalculatorLayout>
  );
}

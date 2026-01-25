import type { TimelinePoint } from "../engine/time";
import { createTimeline } from "../engine/time";
import { simulateMarketRegime } from "../engine/market";
import { applySurchargeAndCess, calculateCapitalGainsTax } from "../engine/tax";
import { calculateOpportunityCost } from "../engine/costs";
import { applySipDiscontinuation } from "../engine/behavior";

export interface SIPScenario {
  name: string;
  description: string;
  behaviorType: "discipline" | "panic" | "custom";
  /** Negative percentage (e.g. -20 means trigger at 20% drawdown). */
  panicThreshold?: number;
  /** Months to pause SIP (custom only). */
  stopDuration?: number;
}

export interface MarketConditions {
  /** Optional start date for timeline. Defaults to Jan 1, 2026. */
  startDate?: Date;
  /** If true, uses the full crash+recovery path even for shorter horizons (education-only). */
  forceScenario?: boolean;
  /** Crash depth as negative percentage, e.g. -35. */
  crashDepthPct?: number;
  /** Crash duration in months. Defaults 6. */
  crashDurationMonths?: number;
  /** Crash start month index (0-based). Defaults 30 (Year ~3). */
  crashStartMonth?: number;
  /** Recovery duration in months. Defaults 12. */
  recoveryDurationMonths?: number;
  /** Total recovery gain over recovery window (e.g. +45 means 45%). */
  recoveryGainPct?: number;
  /** Secondary correction depth (e.g. -20). Optional. */
  secondaryCorrectionDepthPct?: number;
  /** Secondary correction duration months. Optional. */
  secondaryCorrectionDurationMonths?: number;
  /** Secondary correction start month. Optional. */
  secondaryCorrectionStartMonth?: number;
}

export interface ChartDataPoint {
  date: Date;
  monthNumber: number;
  marketIndex: number;
  perfectDisciplineValue: number;
  panic20Value: number;
  panic40Value: number;
  /** Optional: custom behavior line (e.g. panic at 30% drawdown + auto-resume). */
  customValue?: number;
  investedAmount: number;
  marketDrawdown: number;
  sipStatus: {
    discipline: "active" | "paused";
    panic20: "active" | "paused";
    panic40: "active" | "paused";
    custom?: "active" | "paused";
  };
}

export interface SIPSimulationResult {
  scenario: SIPScenario;
  timeline: TimelinePoint[];
  finalCorpus: number;
  totalInvested: number;
  absoluteGains: number;
  xirr: number;
  postTaxCorpus: number;
  taxPaid: number;
  taxBreakdown?: {
    category: "ltcg" | "stcg" | "slab";
    /** Education-only label for the method used to compute baseTax. */
    method?: "engine_default" | "stcg_30_flat" | "ltcg_20_indexation";
    capitalGain: number;
    proceeds?: number;
    costBasis?: number;
    ltcgExemptionApplied: number;
    taxableGains: number;
    /** Base-tax rate applied on taxable gains (0..1). */
    baseRate?: number;
    indexation?: {
      inflationRateAnnual: number;
      factor: number;
      indexedCostBasis: number;
    };
    baseTax: number;
    surchargeRate: number;
    surcharge: number;
    cessRate: number;
    cess: number;
    totalTax: number;
  };
  behavioralCost: number;
  lostOpportunity: number;
  calculation: {
    mode: "stop" | "cash";
    monthlySip: number;
    months: number;
    panickedAtMonth: number | null;
    firstPausedMonth: number | null;
    pausedMonths: number;
    equityContributed: number;
    cashContributed: number;
    finalEquityValue: number;
    finalCashValue: number;
    equityUnits: number;
    equityUnitsAtPanic: number | null;
    avgPurchaseIndex: number;
    endingMarketIndex: number;
  };
  insights: string[];
  chartData: ChartDataPoint[];
}

export interface SIPSimulationOptions {
  /**
   * What happens to SIP contributions after a drawdown-triggered panic stop.
   * - "stop" (default): SIP stops completely (pure behavioral cost of stopping).
   * - "cash": SIP continues into a low-risk cash/debt bucket at cashAnnualRatePct.
   */
  afterStopMode?: "stop" | "cash";
  /** Used only when afterStopMode === "cash". Defaults to 6% annual. */
  cashAnnualRatePct?: number;

  /** Used only for insights personalization. Does not change math. */
  riskComfort?: "conservative" | "moderate" | "aggressive";

  /**
   * Education-only toggle for how equity capital gains tax is approximated.
   * - conservative_stcg_30: treats gains as short-term and taxes at 30% flat.
   * - optimized_ltcg_indexation_20: treats gains as long-term and taxes at 20% after an indexation-style cost adjustment.
   */
  taxCalculationMode?: "conservative_stcg_30" | "optimized_ltcg_indexation_20";

  /** Optional add-ons over base capital gains tax (education-only). */
  tax?: {
    /** Defaults to 4% when applyCess is true. */
    cessRate?: number;
    /** Defaults to 0 (no surcharge). */
    surchargeRate?: number;
    /** If true, applies cessRate on (tax + surcharge). */
    applyCess?: boolean;
    /** If false, surcharge is forced to 0 even if provided. */
    applySurcharge?: boolean;
  };
}

type TaxMethod = "engine_default" | "stcg_30_flat" | "ltcg_20_indexation";

function computeEducationalEquityBaseTax(params: {
  gains: number;
  finalCorpus: number;
  totalInvested: number;
  holdingPeriodMonths: number;
  mode?: SIPSimulationOptions["taxCalculationMode"];
}): {
  category: "ltcg" | "stcg" | "slab";
  method: TaxMethod;
  taxableGains: number;
  ltcgExemptionApplied: number;
  baseRate: number;
  baseTax: number;
  indexation?: {
    inflationRateAnnual: number;
    factor: number;
    indexedCostBasis: number;
  };
} {
  const gains = Math.max(0, params.gains);
  if (gains <= 0) {
    return {
      category: "stcg",
      method: "engine_default",
      taxableGains: 0,
      ltcgExemptionApplied: 0,
      baseRate: 0,
      baseTax: 0,
    };
  }

  if (params.mode === "conservative_stcg_30") {
    const baseRate = 0.3;
    const taxableGains = gains;
    return {
      category: "stcg",
      method: "stcg_30_flat",
      taxableGains,
      ltcgExemptionApplied: 0,
      baseRate,
      baseTax: taxableGains * baseRate,
    };
  }

  if (params.mode === "optimized_ltcg_indexation_20") {
    // Education-only indexation approximation. We model an inflation-adjusted cost basis.
    // This is not tax advice and may not match actual indexation rules.
    const inflationRateAnnual = 0.06;
    const years = Math.max(0, params.holdingPeriodMonths) / 12;
    const factor = Math.pow(1 + inflationRateAnnual, years);
    const indexedCostBasis = Math.max(0, params.totalInvested) * factor;
    const taxableGains = Math.max(0, Math.max(0, params.finalCorpus) - indexedCostBasis);
    const baseRate = 0.2;

    return {
      category: "ltcg",
      method: "ltcg_20_indexation",
      taxableGains,
      ltcgExemptionApplied: 0,
      baseRate,
      baseTax: taxableGains * baseRate,
      indexation: {
        inflationRateAnnual,
        factor,
        indexedCostBasis,
      },
    };
  }

  const baseTax = calculateCapitalGainsTax({
    gains,
    holdingPeriodMonths: params.holdingPeriodMonths,
    assetType: "equity_mf",
  });

  const taxableGains = Math.max(0, baseTax.taxableGains);
  const baseRate = taxableGains > 0 ? Math.max(0, baseTax.taxPaid) / taxableGains : 0;
  const ltcgExemptionApplied = baseTax.category === "ltcg" ? Math.max(0, gains - taxableGains) : 0;

  return {
    category: baseTax.category,
    method: "engine_default",
    taxableGains,
    ltcgExemptionApplied,
    baseRate,
    baseTax: Math.max(0, baseTax.taxPaid),
  };
}

interface ScenarioState {
  equityValue: number;
  cashValue: number;
  totalInvested: number;
  sipStatus: "active" | "paused";
  pausedUntilMonth: number;
  panickedAtMonth: number | null;
  firstPausedMonth: number | null;
  pausedMonths: number;
  equityContributed: number;
  cashContributed: number;
  equityUnits: number;
  equityUnitsAtPanic: number | null;
  purchaseIndexWeightedSum: number;
  purchaseAmountSum: number;
  cashflows: number[];
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function pctToFraction(pct: number): number {
  return pct / 100;
}

function compoundMonthlyTotal(totalPct: number, months: number): number {
  if (months <= 0) return 0;
  const factor = 1 + pctToFraction(totalPct);
  return Math.pow(Math.max(0.000001, factor), 1 / months) - 1;
}

function formatInrLakhs(amount: number): string {
  const v = clampNonNegative(amount);
  return `₹${(v / 100_000).toFixed(1)}L`;
}

function formatPercent(x: number): string {
  if (!Number.isFinite(x)) return "0.0%";
  return `${x.toFixed(1)}%`;
}

function buildDefaultTimeline(durationYears: number, startDate?: Date): TimelinePoint[] {
  const y = Math.max(0, Math.floor(durationYears));
  const start = startDate ?? new Date("2026-01-01");
  const end = new Date(start);
  end.setFullYear(start.getFullYear() + y);
  end.setDate(end.getDate() - 1);

  return createTimeline({
    startDate: start,
    endDate: end,
    frequency: "monthly",
    holidaysIso: [],
  });
}

/**
 * Educational market design: deterministic regime schedule with a manual crash + recovery.
 * Uses Step 1 market engine for regime means (volatility=0) and injects crash/recovery windows.
 */
export function buildEducationalMarketReturns(timeline: TimelinePoint[], market?: MarketConditions): number[] {
  const months = timeline.length;
  const durationYears = Math.max(0, Math.floor(months / 12));
  const forceScenario = market?.forceScenario === true;

  const stableGrowth = (annualReturn: number): number[] => {
    const m = Math.pow(1 + Math.max(0, annualReturn), 1 / 12) - 1;
    return timeline.map((_, i) => {
      // Deterministic "noise" (not random) so tests/outputs are stable.
      const wave = Math.sin(i / 2.9) * 0.0016 + Math.sin(i / 7.7) * 0.0009;
      const raw = m + wave;
      // Keep it mostly positive for short horizons.
      return Math.max(-0.002, Math.min(0.012, raw));
    });
  };

  const applyCorrection = (
    returns: number[],
    params: { startMonth: number; depthPct: number; downMonths: number; recoveryMonths: number; recoveryGainPct?: number }
  ) => {
    const { startMonth, depthPct, downMonths, recoveryMonths, recoveryGainPct } = params;
    const s0 = Math.max(0, Math.min(months - 1, Math.floor(startMonth)));
    const dN = Math.max(1, Math.min(12, Math.floor(downMonths)));
    const rN = Math.max(1, Math.min(36, Math.floor(recoveryMonths)));

    const downMonthly = compoundMonthlyTotal(depthPct, dN);
    for (let i = s0; i < Math.min(months, s0 + dN); i += 1) {
      returns[i] = downMonthly;
    }

    const upStart = Math.min(months, s0 + dN);
    const upMonthly = compoundMonthlyTotal(
      typeof recoveryGainPct === "number" ? recoveryGainPct : Math.abs(depthPct),
      rN
    );
    for (let i = upStart; i < Math.min(months, upStart + rN); i += 1) {
      returns[i] = upMonthly;
    }
  };

  // Short horizon (<= 2 years): stable growth only.
  if (!forceScenario && durationYears <= 2) {
    return stableGrowth(0.12);
  }

  // Exactly 3 years: keep the "Year-3 crash" timing (month 30) so the lesson matches expectations,
  // while still allowing the crash to fall near the end of the window.
  if (!forceScenario && durationYears === 3) {
    const out = stableGrowth(0.12);

    const startMonth = market?.crashStartMonth ?? 30;
    const remaining = Math.max(0, months - Math.max(0, Math.floor(startMonth)));

    // If the crash begins near the end of a 3-year run, compress crash+recovery into
    // the remaining months so the educational output stays sane (positive compounding).
    if (remaining >= 2) {
      const desiredDown = market?.crashDurationMonths ?? 6;
      const downMonths = Math.max(1, Math.min(desiredDown, Math.floor(remaining / 2)));
      const recoveryMonths = Math.max(1, remaining - downMonths);

      applyCorrection(out, {
        startMonth,
        depthPct: market?.crashDepthPct ?? -35,
        downMonths,
        recoveryMonths,
        recoveryGainPct: market?.recoveryGainPct ?? 45,
      });
    }
    return out;
  }

  // Medium horizon (3-5 years): small correction (~15%), then recovery.
  if (!forceScenario && durationYears <= 5) {
    const out = stableGrowth(0.12);
    applyCorrection(out, {
      startMonth: Math.floor(months * 0.45),
      depthPct: -(market?.secondaryCorrectionDepthPct ?? 15),
      downMonths: 3,
      recoveryMonths: 6,
    });
    return out;
  }

  // Long-ish horizon (6-9 years): medium crash (~25%), then recovery.
  if (!forceScenario && durationYears <= 9) {
    const out = stableGrowth(0.12);
    applyCorrection(out, {
      startMonth: Math.floor(months * 0.35),
      depthPct: -(market?.crashDepthPct ? Math.abs(market.crashDepthPct) : 25),
      downMonths: 6,
      recoveryMonths: 12,
    });
    return out;
  }

  // Very long horizon (10+ years): keep the original full scenario (crash + recovery + optional secondary correction).
  const crashStartMonth = Math.min(months - 1, Math.max(0, Math.floor(market?.crashStartMonth ?? 30)));
  const crashDurationMonths = Math.min(18, Math.max(1, Math.floor(market?.crashDurationMonths ?? 6)));
  const crashDepthPct = market?.crashDepthPct ?? -35;

  const recoveryDurationMonths = Math.min(36, Math.max(1, Math.floor(market?.recoveryDurationMonths ?? 12)));
  const recoveryGainPct = market?.recoveryGainPct ?? 45;

  const secondaryStart = market?.secondaryCorrectionStartMonth;
  const secondaryDepthPct = market?.secondaryCorrectionDepthPct;
  const secondaryDuration = market?.secondaryCorrectionDurationMonths;

  const base = simulateMarketRegime({
    timeline,
    regimeType: "sideways",
    volatility: 0,
    seed: 1,
  });

  const out = [...base];

  // Year 1-2: moderate bull (+12-15% annual-ish)
  for (let i = 0; i < out.length; i += 1) {
    if (i < crashStartMonth) {
      out[i] = Math.min(out[i], 0.0064);
      out[i] = Math.max(out[i], 0.00125);
    }
  }

  // Pre-crash wobble: small dip before the main crash so peak-to-trough drawdown can exceed 40%.
  // This allows Panic 40 to trigger while keeping the main crash at -35% (as per spec).
  if (crashStartMonth >= 2) {
    out[crashStartMonth - 2] = -0.04;
    out[crashStartMonth - 1] = -0.04;
  }

  // Crash window: total -35% over 6 months by default.
  const crashMonthly = compoundMonthlyTotal(crashDepthPct, crashDurationMonths);
  for (let i = crashStartMonth; i < Math.min(months, crashStartMonth + crashDurationMonths); i += 1) {
    out[i] = crashMonthly;
  }

  // Recovery window: total +45% over 12 months by default.
  const recoveryStart = Math.min(months, crashStartMonth + crashDurationMonths);
  const recoveryMonthly = compoundMonthlyTotal(recoveryGainPct, recoveryDurationMonths);
  for (let i = recoveryStart; i < Math.min(months, recoveryStart + recoveryDurationMonths); i += 1) {
    out[i] = recoveryMonthly;
  }

  // Sideways / volatility-ish after recovery until secondary correction.
  const sidewaysStart = Math.min(months, recoveryStart + recoveryDurationMonths);
  const sidewaysEnd = secondaryStart !== undefined ? Math.min(months, Math.max(sidewaysStart, Math.floor(secondaryStart))) : months;
  for (let i = sidewaysStart; i < sidewaysEnd; i += 1) {
    const wave = Math.sin(i / 3);
    out[i] = 0.00038 + 0.0034 * wave;
  }

  // Secondary correction (optional).
  if (
    secondaryStart !== undefined &&
    secondaryDepthPct !== undefined &&
    secondaryDuration !== undefined &&
    secondaryDuration > 0
  ) {
    const s0 = Math.min(months - 1, Math.max(0, Math.floor(secondaryStart)));
    const sN = Math.min(12, Math.max(1, Math.floor(secondaryDuration)));
    const sMonthly = compoundMonthlyTotal(secondaryDepthPct, sN);
    for (let i = s0; i < Math.min(months, s0 + sN); i += 1) {
      out[i] = sMonthly;
    }

    // Stronger recovery after secondary correction.
    const after = Math.min(months, s0 + sN);
    for (let i = after; i < months; i += 1) {
      out[i] = Math.max(out[i], 0.00225);
    }
  }

  return out;
}

function riskComfortHint(riskComfort: SIPSimulationOptions["riskComfort"], drawdownPct: number): string | null {
  if (!riskComfort) return null;
  const dd = Math.abs(drawdownPct);
  if (dd <= 0) return null;

  if (riskComfort === "conservative") {
    if (dd >= 25) return "If big drawdowns keep you awake, build a plan in advance (cash buffer, asset allocation) so you don't sell at the bottom.";
    return "If you prefer stability, pre-commit to a SIP rule (and consider an adequate cash buffer) so small dips don't derail you.";
  }

  if (riskComfort === "aggressive") {
    if (dd >= 25) return "If you can tolerate volatility, drawdowns are often the 'sale period' where SIP discipline matters most.";
    return "If you're comfortable with volatility, your edge is consistency — avoid reacting to monthly noise.";
  }

  // moderate
  if (dd >= 25) return "Most investors feel the strongest fear near big drawdowns — pre-decide your actions (rebalance, keep SIP) before the crash hits.";
  return "Most investors do best with simple rules: keep SIP running, and review only periodically.";
}

function riskProfileBehaviorNote(params: {
  riskComfort: SIPSimulationOptions["riskComfort"];
  scenario: SIPScenario;
  behavioralCost: number;
}): string | null {
  const { riskComfort, scenario, behavioralCost } = params;
  if (!riskComfort) return null;

  const isPanic20 = scenario.behaviorType === "panic" && scenario.panicThreshold === -20;
  if (!isPanic20) return null;

  if (riskComfort === "conservative") {
    return (
      "⚠️ Profile note (Conservative): Panicking at 20% is understandable — but it was expensive. " +
      `This caution cost you ${formatInrLakhs(behavioralCost)} post-tax vs discipline in this run. ` +
      "Consider: instead of quitting SIP, align your equity allocation (e.g., a balanced 70/30 approach) so you can stay consistent through drawdowns." 
    );
  }

  if (riskComfort === "aggressive") {
    return (
      "⚠️ Profile mismatch (Aggressive): You selected aggressive risk comfort but panicked at a 20% drawdown. " +
      `This gap is common — and expensive (${formatInrLakhs(behavioralCost)} post-tax in this run). ` +
      "True aggressive investors typically tolerate much deeper drawdowns (40%+) — pre-decide your rules now so you don’t exit early next time." 
    );
  }

  return null;
}

function computeXirr(params: { cashflows: number[]; dates: Date[]; guessAnnual?: number }): number {
  const { cashflows, dates, guessAnnual = 0.12 } = params;
  if (cashflows.length !== dates.length || cashflows.length < 2) return 0;

  const t0 = dates[0].getTime();
  const years = dates.map((d) => (d.getTime() - t0) / (365.25 * 24 * 3600 * 1000));

  const npv = (rate: number) => {
    let s = 0;
    for (let i = 0; i < cashflows.length; i += 1) {
      s += cashflows[i] / Math.pow(1 + rate, years[i]);
    }
    return s;
  };

  const dNpv = (rate: number) => {
    let s = 0;
    for (let i = 0; i < cashflows.length; i += 1) {
      const t = years[i];
      s += (-t * cashflows[i]) / Math.pow(1 + rate, t + 1);
    }
    return s;
  };

  let r = Math.max(-0.95, Math.min(2, guessAnnual));
  for (let iter = 0; iter < 50; iter += 1) {
    const f = npv(r);
    const df = dNpv(r);
    if (!Number.isFinite(f) || !Number.isFinite(df) || Math.abs(df) < 1e-12) break;
    const next = r - f / df;
    if (!Number.isFinite(next)) break;
    if (Math.abs(next - r) < 1e-8) {
      r = next;
      break;
    }
    r = Math.max(-0.95, Math.min(5, next));
  }
  return r * 100;
}

function initScenarioState(): ScenarioState {
  return {
    equityValue: 0,
    cashValue: 0,
    totalInvested: 0,
    sipStatus: "active",
    pausedUntilMonth: 0,
    panickedAtMonth: null,
    firstPausedMonth: null,
    pausedMonths: 0,
    equityContributed: 0,
    cashContributed: 0,
    equityUnits: 0,
    equityUnitsAtPanic: null,
    purchaseIndexWeightedSum: 0,
    purchaseAmountSum: 0,
    cashflows: [],
  };
}

function scenarioKeyForChart(s: SIPScenario): "discipline" | "panic20" | "panic40" | null {
  if (s.behaviorType === "discipline") return "discipline";
  const th = s.panicThreshold;
  if (s.behaviorType !== "panic" || typeof th !== "number") return null;
  if (th === -20) return "panic20";
  if (th === -40) return "panic40";
  return null;
}

export function simulateSIPVsPanic(
  monthlyAmount: number,
  durationYears: number,
  scenarios: SIPScenario[],
  marketConditions?: MarketConditions,
  options?: SIPSimulationOptions
): SIPSimulationResult[] {
  const sip = clampNonNegative(monthlyAmount);
  const years = Math.max(0, Math.floor(durationYears));
  const timeline = buildDefaultTimeline(years, marketConditions?.startDate);

  // Backward-compatible default: keep saving into cash unless explicitly set to pure-stop.
  const afterStopMode: "stop" | "cash" = options?.afterStopMode ?? "cash";
  const cashAnnualRatePct = options?.cashAnnualRatePct ?? 6;

  // If enabled, model continued saving into a low-risk cash/debt bucket.
  const cashMonthlyRate = afterStopMode === "cash" ? compoundMonthlyTotal(cashAnnualRatePct, 12) : 0;

  const riskComfort = options?.riskComfort;
  const taxCalculationMode = options?.taxCalculationMode;
  const taxCessRate = options?.tax?.applyCess ? (options?.tax?.cessRate ?? 0.04) : 0;
  const taxSurchargeRate = options?.tax?.applySurcharge ? (options?.tax?.surchargeRate ?? 0) : 0;

  const marketReturns = buildEducationalMarketReturns(timeline, {
    forceScenario: marketConditions?.forceScenario,
    crashDepthPct: marketConditions?.crashDepthPct ?? -35,
    crashDurationMonths: marketConditions?.crashDurationMonths ?? 6,
    crashStartMonth: marketConditions?.crashStartMonth ?? 30,
    recoveryDurationMonths: marketConditions?.recoveryDurationMonths ?? 12,
    recoveryGainPct: marketConditions?.recoveryGainPct ?? 45,
    secondaryCorrectionDepthPct: marketConditions?.secondaryCorrectionDepthPct ?? -20,
    secondaryCorrectionDurationMonths: marketConditions?.secondaryCorrectionDurationMonths ?? 3,
    secondaryCorrectionStartMonth: marketConditions?.secondaryCorrectionStartMonth ?? 78,
  });

  let marketIndex = 100;
  let marketPeak = 100;

  // Behaviour engine integration (Step 1): stop SIP contributions during negative months.
  const stopDuringAnyFallSipFlow = applySipDiscontinuation({
    sipFlow: timeline.map(() => sip),
    marketReturns,
    triggerEvent: "any-negative",
  });

  const scenarioStates = new Map<string, ScenarioState>();
  for (const s of scenarios) scenarioStates.set(s.name, initScenarioState());

  // Track discipline invested amount for the chart "investedAmount".
  let disciplineInvestedCumulative = 0;

  const chartData: ChartDataPoint[] = [];

  for (let i = 0; i < timeline.length; i += 1) {
    const r = marketReturns[i] ?? 0;
    const marketIndexAtStart = marketIndex;
    marketIndex *= 1 + r;
    if (marketIndex > marketPeak) marketPeak = marketIndex;
    const drawdownFrac = marketPeak > 0 ? (marketPeak - marketIndex) / marketPeak : 0;

    // Update each scenario state.
    for (const scenario of scenarios) {
      const state = scenarioStates.get(scenario.name)!;

      // Per-month SIP flow (used for the "Pause SIP in Any Red Month" behavior).
      const isAnyFallScenario = scenario.behaviorType === "panic" && scenario.panicThreshold === -1;
      const sipThisMonth = isAnyFallScenario ? (stopDuringAnyFallSipFlow[i] ?? 0) : sip;

      // Determine if SIP is currently paused.
      const isPausedWindow = i < state.pausedUntilMonth;
      state.sipStatus = isPausedWindow ? "paused" : "active";

      // "Stop During Any Fall": pause SIP this month if negative return, otherwise resume.
      if (isAnyFallScenario) state.sipStatus = sipThisMonth > 0 ? "active" : "paused";

      // Panic threshold trigger (drawdown-based).
      const thresholdPct = scenario.panicThreshold;
      const hasThreshold = typeof thresholdPct === "number" && thresholdPct < 0;
      const triggerDrawdown = hasThreshold && scenario.panicThreshold !== -1
        ? drawdownFrac >= Math.abs(thresholdPct) / 100
        : false;

      if (triggerDrawdown && state.panickedAtMonth === null && scenario.behaviorType !== "discipline") {
        state.panickedAtMonth = i;
        state.equityUnitsAtPanic = state.equityUnits;

        // Panic = stop equity SIP forever (keeps saving monthly, but in cash).
        if (scenario.behaviorType === "panic") {
          state.sipStatus = "paused";
          state.pausedUntilMonth = Number.POSITIVE_INFINITY;
        }

        // Custom = pause equity SIP, then auto-resume.
        if (scenario.behaviorType === "custom") {
          const stopDuration = Math.max(1, Math.floor(scenario.stopDuration ?? 6));
          state.sipStatus = "paused";
          state.pausedUntilMonth = i + stopDuration;
        }
      }

      // Auto-resume for custom scenarios.
      if (scenario.behaviorType === "custom" && i >= state.pausedUntilMonth) {
        state.sipStatus = "active";
      }

      if (state.sipStatus === "paused") {
        state.pausedMonths += 1;
        if (state.firstPausedMonth === null) state.firstPausedMonth = i;
      }

      // Contribution routing:
      // - discipline/custom active months: contribute to equity
      // - panic threshold scenarios after trigger: optionally contribute to cash (still saving monthly)
      // - stop-during-any-fall paused months: contribute nothing
      const isPanicThresholdScenario = scenario.behaviorType === "panic" && (scenario.panicThreshold ?? 0) < 0 && scenario.panicThreshold !== -1;

      const contributeToEquity = state.sipStatus === "active" && sipThisMonth > 0;
      const contributeToCash =
        afterStopMode === "cash" &&
        state.sipStatus === "paused" &&
        isPanicThresholdScenario &&
        sipThisMonth > 0;

      if (contributeToEquity) {
        state.equityValue += sipThisMonth;
        state.equityContributed += sipThisMonth;
        state.totalInvested += sipThisMonth;
        state.equityUnits += marketIndexAtStart > 0 ? sipThisMonth / marketIndexAtStart : 0;
        state.purchaseIndexWeightedSum += sipThisMonth * marketIndexAtStart;
        state.purchaseAmountSum += sipThisMonth;
        state.cashflows.push(-sipThisMonth);

        if (scenario.behaviorType === "discipline") {
          disciplineInvestedCumulative += sipThisMonth;
        }
      } else if (contributeToCash) {
        state.cashValue += sipThisMonth;
        state.cashContributed += sipThisMonth;
        state.totalInvested += sipThisMonth;
        state.cashflows.push(-sipThisMonth);
      } else {
        state.cashflows.push(0);
      }

      // Growth applies only to equity bucket.
      state.equityValue *= 1 + r;

      // Cash bucket grows at low-risk rate.
      state.cashValue *= 1 + cashMonthlyRate;
    }

    // Build chart values (only the required 3 scenario lines).
    const getValue = (key: "discipline" | "panic20" | "panic40"): number => {
      for (const s of scenarios) {
        const k = scenarioKeyForChart(s);
        if (k === key) {
          const st = scenarioStates.get(s.name)!;
          return st.equityValue + st.cashValue;
        }
      }
      return 0;
    };

    const getCustomValue = (): number | undefined => {
      for (const s of scenarios) {
        if (s.behaviorType !== "custom") continue;
        const st = scenarioStates.get(s.name)!;
        return st.equityValue + st.cashValue;
      }
      return undefined;
    };

    const getStatus = (key: "discipline" | "panic20" | "panic40"): "active" | "paused" => {
      for (const s of scenarios) {
        const k = scenarioKeyForChart(s);
        if (k === key) return scenarioStates.get(s.name)!.sipStatus;
      }
      return "active";
    };

    const getCustomStatus = (): "active" | "paused" | undefined => {
      for (const s of scenarios) {
        if (s.behaviorType !== "custom") continue;
        return scenarioStates.get(s.name)!.sipStatus;
      }
      return undefined;
    };

    chartData.push({
      date: timeline[i].date,
      monthNumber: i + 1,
      marketIndex,
      perfectDisciplineValue: getValue("discipline"),
      panic20Value: getValue("panic20"),
      panic40Value: getValue("panic40"),
      customValue: getCustomValue(),
      investedAmount: disciplineInvestedCumulative,
      marketDrawdown: -drawdownFrac * 100,
      sipStatus: {
        discipline: getStatus("discipline"),
        panic20: getStatus("panic20"),
        panic40: getStatus("panic40"),
        custom: getCustomStatus(),
      },
    });
  }

  const worstDrawdownPct = chartData.length
    ? chartData.reduce((min, p) => Math.min(min, p.marketDrawdown), 0)
    : 0;

  // Baseline: perfect discipline for cost comparison.
  const disciplineScenario = scenarios.find((s) => s.behaviorType === "discipline") ?? null;
  const disciplineState = disciplineScenario ? scenarioStates.get(disciplineScenario.name)! : null;

  const disciplineFinal = disciplineState ? disciplineState.equityValue + disciplineState.cashValue : 0;
  const disciplineInvested = disciplineState?.totalInvested ?? 0;
  const disciplineGains = Math.max(0, disciplineFinal - disciplineInvested);
  const disciplineBaseTax = computeEducationalEquityBaseTax({
    gains: disciplineGains,
    finalCorpus: disciplineFinal,
    totalInvested: disciplineInvested,
    holdingPeriodMonths: timeline.length,
    mode: taxCalculationMode,
  });
  const disciplineAddOns = applySurchargeAndCess({
    baseTax: disciplineBaseTax.baseTax,
    surchargeRate: taxSurchargeRate,
    cessRate: taxCessRate,
  });
  const disciplinePostTax = Math.max(0, disciplineFinal - disciplineAddOns.totalTax);

  const results: SIPSimulationResult[] = [];

  for (const scenario of scenarios) {
    const state = scenarioStates.get(scenario.name)!;

    const finalCorpus = state.equityValue + state.cashValue;
    const totalInvested = state.totalInvested;
    const absoluteGains = finalCorpus - totalInvested;

    const gains = Math.max(0, absoluteGains);
    const baseTax = computeEducationalEquityBaseTax({
      gains,
      finalCorpus,
      totalInvested,
      holdingPeriodMonths: timeline.length,
      mode: taxCalculationMode,
    });
    const addOns = applySurchargeAndCess({
      baseTax: baseTax.baseTax,
      surchargeRate: taxSurchargeRate,
      cessRate: taxCessRate,
    });

    const postTaxCorpus = Math.max(0, finalCorpus - addOns.totalTax);

    // XIRR: per-month cashflows (negative contributions, 0 for pauses) + terminal value (positive).
    const cashflows = [...state.cashflows];
    const dates = timeline.map((p) => p.date);

    const terminalDate = new Date(dates[dates.length - 1] ?? new Date());
    terminalDate.setDate(terminalDate.getDate() + 1);
    cashflows.push(postTaxCorpus);
    dates.push(terminalDate);

    const xirr = computeXirr({ cashflows, dates, guessAnnual: 0.12 });

    const lostOpportunity = disciplineFinal > 0 ? Math.max(0, disciplineFinal - finalCorpus) : 0;
    const behavioralCost = disciplinePostTax > 0 ? Math.max(0, disciplinePostTax - postTaxCorpus) : 0;

    const lostOpportunityPct = disciplineFinal > 0 ? (lostOpportunity / disciplineFinal) * 100 : 0;

    // Opportunity cost (delay/stop) quantified as the gap vs discipline using cost engine.
    const opportunityCost = disciplineFinal > 0
      ? calculateOpportunityCost({
          delayedAmount: lostOpportunity,
          marketReturns: [],
          delayPeriod: 0,
        })
      : 0;

    const avgPurchaseIndex = state.purchaseAmountSum > 0 ? state.purchaseIndexWeightedSum / state.purchaseAmountSum : marketIndex;

    const insights: string[] = [];

    if (scenario.behaviorType === "discipline") {
      insights.push("Invested consistently through market crash in Year 3");
      insights.push("Lower average purchase price due to rupee-cost averaging");
      insights.push("Compounding accelerated post-recovery");
      insights.push(`Final corpus: ${formatInrLakhs(finalCorpus)} (XIRR: ${formatPercent(xirr)})`);
      insights.push(`Average purchase index: ${avgPurchaseIndex.toFixed(1)} vs ending index: ${marketIndex.toFixed(1)}`);

      const hint = riskComfortHint(riskComfort, worstDrawdownPct);
      if (hint) insights.push(hint);
    } else {
      const panicAt = state.panickedAtMonth;
      if (scenario.behaviorType === "panic" && scenario.panicThreshold === -1) {
        const firstPause = state.firstPausedMonth;
        if (firstPause !== null) {
          const year = Math.floor(firstPause / 12) + 1;
          insights.push(`Paused SIP in ${state.pausedMonths} months (first pause around Year ${year})`);
        } else {
          insights.push("Did not pause SIP in this run");
        }
      } else if (panicAt !== null) {
        const year = Math.floor(panicAt / 12) + 1;
        insights.push(`Panic trigger: Month ${panicAt + 1} (Year ${year})`);
        insights.push("SIP contributions stopped from that point");
      } else {
        insights.push("Did not trigger the drawdown threshold in this run");
      }

      insights.push(`Lost ${formatInrLakhs(lostOpportunity)} vs discipline (${lostOpportunityPct.toFixed(1)}% of potential wealth)`);
      insights.push(`Behavioral cost of panic: ${formatInrLakhs(behavioralCost)}`);
      insights.push(`Post-tax corpus: ${formatInrLakhs(postTaxCorpus)} (XIRR: ${formatPercent(xirr)})`);

      const profileNote = riskProfileBehaviorNote({ riskComfort, scenario, behavioralCost });
      if (profileNote) insights.push(profileNote);

      const hint = riskComfortHint(riskComfort, worstDrawdownPct);
      if (hint) insights.push(hint);

      if (afterStopMode === "cash" && (state.cashContributed > 0 || state.cashValue > 0)) {
        insights.push(`Cash bucket enabled: ${formatInrLakhs(state.cashValue)} in cash at the end`);
      }

      if (scenario.behaviorType === "custom") {
        insights.push(`Auto-resume configured: ${Math.max(1, Math.floor(scenario.stopDuration ?? 6))} months`);
      }

      if (opportunityCost !== 0) {
        insights.push("Opportunity cost quantified via gap vs discipline");
      }
    }

    results.push({
      scenario,
      timeline,
      finalCorpus,
      totalInvested,
      absoluteGains,
      xirr,
      postTaxCorpus,
      taxPaid: addOns.totalTax,
      taxBreakdown: {
        category: baseTax.category,
        method: baseTax.method,
        capitalGain: gains,
        proceeds: finalCorpus,
        costBasis: totalInvested,
        ltcgExemptionApplied: baseTax.ltcgExemptionApplied,
        taxableGains: baseTax.taxableGains,
        baseRate: baseTax.baseRate,
        indexation: baseTax.indexation,
        baseTax: baseTax.baseTax,
        surchargeRate: addOns.surchargeRate,
        surcharge: addOns.surcharge,
        cessRate: addOns.cessRate,
        cess: addOns.cess,
        totalTax: addOns.totalTax,
      },
      behavioralCost,
      lostOpportunity,
      calculation: {
        mode: afterStopMode,
        monthlySip: sip,
        months: timeline.length,
        panickedAtMonth: state.panickedAtMonth,
        firstPausedMonth: state.firstPausedMonth,
        pausedMonths: state.pausedMonths,
        equityContributed: state.equityContributed,
        cashContributed: state.cashContributed,
        finalEquityValue: state.equityValue,
        finalCashValue: state.cashValue,
        equityUnits: state.equityUnits,
        equityUnitsAtPanic: state.equityUnitsAtPanic,
        avgPurchaseIndex,
        endingMarketIndex: marketIndex,
      },
      insights,
      chartData,
    });
  }

  return results;
}

export const REQUIRED_SCENARIOS: SIPScenario[] = [
  {
    name: "Perfect Discipline",
    description: "Never stops SIP, regardless of market conditions",
    behaviorType: "discipline",
  },
  {
    name: "Stop SIP at 20% Drawdown",
    description: "Stops SIP contributions once market is down 20% from peak",
    behaviorType: "panic",
    panicThreshold: -20,
  },
  {
    name: "Stop SIP at 40% Drawdown",
    description: "Stops SIP contributions once market is down 40% from peak",
    behaviorType: "panic",
    panicThreshold: -40,
  },
  {
    name: "Pause SIP in Any Red Month",
    description: "Pauses SIP in any negative month and resumes in positive months",
    behaviorType: "panic",
    panicThreshold: -1,
  },
  {
    name: "Custom Behavior",
    description: "User defines panic threshold and resume logic",
    behaviorType: "custom",
    panicThreshold: -30,
    stopDuration: 6,
  },
];

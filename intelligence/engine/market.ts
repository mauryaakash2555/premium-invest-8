import type { MarketCycle, MarketModelConfig, MarketCycleScheduleItem } from "./types";
import { createRng } from "./rng";

export type MarketRegimeType = MarketCycle;

function annualToMonthlyRate(annual: number): number {
  return Math.pow(1 + annual, 1 / 12) - 1;
}

function pickCycle(schedule: MarketCycleScheduleItem[], yearIndex: number): MarketCycle {
  for (const item of schedule) {
    if (yearIndex >= item.fromYear && yearIndex <= item.toYear) return item.cycle;
  }
  // Default if schedule doesn't cover: sideways
  return "sideways";
}

export interface MarketStep {
  cycle: MarketCycle;
  equityMonthly: number;
  debtMonthly: number;
}

export interface DrawdownPoint {
  index: number;
  peak: number;
  trough: number;
  drawdown: number; // 0..1
}

/**
 * Calculates drawdown series from a returns array.
 * Returns points with current drawdown from last peak.
 */
export function calculateDrawdowns(returnsArray: number[]): DrawdownPoint[] {
  let wealth = 1;
  let peak = 1;
  let trough = 1;
  const out: DrawdownPoint[] = [];

  for (let i = 0; i < returnsArray.length; i += 1) {
    wealth *= 1 + returnsArray[i];
    if (wealth > peak) {
      peak = wealth;
      trough = wealth;
    }
    if (wealth < trough) trough = wealth;
    const dd = peak > 0 ? (peak - wealth) / peak : 0;
    out.push({ index: i, peak, trough, drawdown: dd });
  }
  return out;
}

/**
 * Generates a monthly returns array for a given market regime.
 * Deterministic when `seed` and inputs are the same.
 */
export function simulateMarketRegime(params: {
  timeline: unknown[];
  regimeType: MarketRegimeType;
  volatility: number;
  seed: number;
}): number[] {
  const { timeline, regimeType, volatility, seed } = params;
  const rng = createRng(seed);

  const annualExpected: Record<MarketRegimeType, number> = {
    bull: 0.14,
    sideways: 0.09,
    bear: -0.04,
    crash: -0.35,
  };

  const mean = annualToMonthlyRate(annualExpected[regimeType]);

  // Simple volatility clustering (GARCH-ish) using previous shock magnitude.
  let vol = Math.max(0, volatility);
  const omega = 0.0001;
  const alpha = 0.15;
  const beta = 0.8;
  let lastShock = 0;

  const out: number[] = [];
  for (let i = 0; i < timeline.length; i += 1) {
    if (i > 0) {
      vol = omega + alpha * (lastShock ** 2) + beta * vol;
      vol = Math.max(0.00001, Math.min(0.25, vol));
    }
    const shock = rng.normal(0, Math.sqrt(vol));
    lastShock = shock;
    // Crash regime adds fat-tail negative events.
    const crashKick = regimeType === "crash" && rng.next() < 0.18 ? -Math.abs(rng.normal(0.08, 0.05)) : 0;
    out.push(mean + shock + crashKick);
  }
  return out;
}

/**
 * Convenience wrapper used by asset calculators.
 */
export function generateReturns(params: {
  timeline: unknown[];
  assetClass: "equity" | "debt";
  marketRegime: MarketRegimeType;
  seed: number;
  volatility: number;
}): number[] {
  const { timeline, assetClass, marketRegime, seed, volatility } = params;
  // Debt returns are smoother: scale down volatility.
  const v = assetClass === "debt" ? volatility * 0.2 : volatility;
  return simulateMarketRegime({ timeline, regimeType: marketRegime, volatility: v, seed });
}

export function createMarketGenerator(config: MarketModelConfig) {
  const rng = createRng(config.seed);

  const equityAnnualDefaults: Record<MarketCycle, number> = {
    bull: 0.14,
    sideways: 0.09,
    bear: -0.04,
    crash: -0.35,
  };

  const debtAnnualDefaults: Record<MarketCycle, number> = {
    bull: 0.075,
    sideways: 0.07,
    bear: 0.065,
    crash: 0.06,
  };

  const volMonthlyDefaults: Record<MarketCycle, number> = {
    bull: 0.045,
    sideways: 0.035,
    bear: 0.06,
    crash: 0.09,
  };

  const equityAnnual = { ...equityAnnualDefaults, ...(config.equityReturnAnnual ?? {}) };
  const debtAnnual = { ...debtAnnualDefaults, ...(config.debtReturnAnnual ?? {}) };
  const volMonthly = { ...volMonthlyDefaults, ...(config.volMonthly ?? {}) };

  let volState = volMonthlyDefaults.sideways;
  let lastEquityShock = 0;

  return {
    step: (yearIndex: number): MarketStep => {
      const cycle = pickCycle(config.schedule, yearIndex);

      const equityMean = annualToMonthlyRate(equityAnnual[cycle]);
      const debtMean = annualToMonthlyRate(debtAnnual[cycle]);

      // Equity is stochastic; optional volatility clustering.
      if (config.volatilityClustering) {
        const omega = 0.0001;
        const alpha = 0.15;
        const beta = 0.8;
        volState = omega + alpha * (lastEquityShock ** 2) + beta * volState;
        volState = Math.max(0.00001, Math.min(0.25, volState));
      } else {
        volState = volMonthly[cycle];
      }

      const equityShock = rng.normal(0, Math.sqrt(volState));
      lastEquityShock = equityShock;

      const crashKick = cycle === "crash" && rng.next() < 0.18 ? -Math.abs(rng.normal(0.08, 0.05)) : 0;
      const equityMonthly = equityMean + equityShock + crashKick;

      // Debt mildly stochastic.
      const debtMonthly = rng.normal(debtMean, (volMonthly[cycle] * 0.15));

      return { cycle, equityMonthly, debtMonthly };
    },
  };
}

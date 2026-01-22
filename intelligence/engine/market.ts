import type { MarketCycle, MarketModelConfig, MarketCycleScheduleItem } from "./types";
import { createRng } from "./rng";

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

export function createMarketGenerator(config: MarketModelConfig) {
  const rng = createRng(config.seed);

  const equityAnnualDefaults: Record<MarketCycle, number> = {
    bull: 0.14,
    sideways: 0.09,
    bear: -0.04,
  };

  const debtAnnualDefaults: Record<MarketCycle, number> = {
    bull: 0.075,
    sideways: 0.07,
    bear: 0.065,
  };

  const volMonthlyDefaults: Record<MarketCycle, number> = {
    bull: 0.045,
    sideways: 0.035,
    bear: 0.06,
  };

  const equityAnnual = { ...equityAnnualDefaults, ...(config.equityReturnAnnual ?? {}) };
  const debtAnnual = { ...debtAnnualDefaults, ...(config.debtReturnAnnual ?? {}) };
  const volMonthly = { ...volMonthlyDefaults, ...(config.volMonthly ?? {}) };

  return {
    step: (yearIndex: number): MarketStep => {
      const cycle = pickCycle(config.schedule, yearIndex);

      const equityMean = annualToMonthlyRate(equityAnnual[cycle]);
      const debtMean = annualToMonthlyRate(debtAnnual[cycle]);

      // Equity is stochastic; debt mildly stochastic.
      const equityMonthly = rng.normal(equityMean, volMonthly[cycle]);
      const debtMonthly = rng.normal(debtMean, volMonthly[cycle] * 0.15);

      return { cycle, equityMonthly, debtMonthly };
    },
  };
}

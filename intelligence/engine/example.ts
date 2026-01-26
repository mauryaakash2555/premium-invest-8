import { runSimulation, runParallelScenarios } from "./index";
import type { SimulationConfig } from "./types";

// Example usage (logic-only). This file is safe to delete later.

const baseConfig: SimulationConfig = {
  startYear: 2026,
  years: 10,
  initialCapital: 500_000,
  allocation: { equityWeight: 0.7, debtWeight: 0.3 },
  inflation: { inflationAnnual: 0.06 },
  market: {
    seed: 42,
    schedule: [
      { cycle: "bull", fromYear: 0, toYear: 2 },
      { cycle: "sideways", fromYear: 3, toYear: 5 },
      { cycle: "bear", fromYear: 6, toYear: 7 },
      { cycle: "bull", fromYear: 8, toYear: 9 },
    ],
  },
  behaviour: { toggles: ["discipline"], intensity: 0.7 },
  taxes: {},
  contributions: { monthlyContribution: 25_000, stepUpAnnual: 0.1 },
};

export function runExample() {
  const single = runSimulation(baseConfig);

  const parallel = runParallelScenarios([
    { id: "disciplined", config: baseConfig },
    {
      id: "panic",
      config: {
        ...baseConfig,
        market: { ...baseConfig.market, seed: 42 },
        behaviour: { toggles: ["panic"], intensity: 0.8 },
      },
    },
  ]);

  return { single, parallel };
}

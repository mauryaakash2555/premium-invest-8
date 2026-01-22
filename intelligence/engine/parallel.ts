import type { SimulationConfig, SimulationResult } from "./types";
import { runSimulation } from "./simulator";

export interface ParallelScenario {
  id: string;
  config: SimulationConfig;
}

export interface ParallelRunResult {
  scenarios: Record<string, SimulationResult>;
  /** Convenience: returns the best final nominal wealth scenario id. */
  bestNominalScenarioId: string | null;
}

export function runParallelScenarios(scenarios: ParallelScenario[]): ParallelRunResult {
  const results: Record<string, SimulationResult> = {};
  let bestId: string | null = null;
  let bestNominal = -Infinity;

  for (const s of scenarios) {
    const res = runSimulation(s.config);
    results[s.id] = res;
    if (res.final.nominalWealth > bestNominal) {
      bestNominal = res.final.nominalWealth;
      bestId = s.id;
    }
  }

  return {
    scenarios: results,
    bestNominalScenarioId: bestId,
  };
}

export function opportunityCost(params: {
  base: SimulationResult;
  alternative: SimulationResult;
}): {
  nominalDifference: number;
  realDifference: number;
} {
  const nominalDifference = params.alternative.final.nominalWealth - params.base.final.nominalWealth;
  const realDifference = params.alternative.final.realWealth - params.base.final.realWealth;
  return { nominalDifference, realDifference };
}

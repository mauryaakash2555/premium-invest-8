import type { InflationModelConfig } from "./types";
import { inflationMonthlyFromAnnual } from "./time";

export function createInflationModel(config: InflationModelConfig) {
  const inflationMonthly = inflationMonthlyFromAnnual(config.inflationAnnual);

  return {
    monthlyRate: () => inflationMonthly,
    /** Converts nominal amount at monthIndex to real value at start (month 0). */
    toRealAtStart: (nominal: number, monthIndex: number) => {
      const factor = Math.pow(1 + inflationMonthly, monthIndex);
      return nominal / factor;
    },
  };
}

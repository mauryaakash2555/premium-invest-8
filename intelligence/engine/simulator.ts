import type { SimulationConfig, SimulationResult, YearSnapshot } from "./types";
import { createMarketGenerator } from "./market";
import { createInflationModel } from "./inflation";
import { normalizeTaxConfig } from "./tax";
import { monthsForYears, monthToYearIndex, contributionForMonth } from "./time";
import { computeBehaviourEffects } from "./behaviour";
import { createCoreBuckets } from "./assets";

function safeCagr(start: number, end: number, years: number): number {
  if (years <= 0) return 0;
  if (start <= 0) return 0;
  if (end <= 0) return -1;
  return Math.pow(end / start, 1 / years) - 1;
}

export function runSimulation(config: SimulationConfig): SimulationResult {
  const market = createMarketGenerator(config.market);
  const inflation = createInflationModel(config.inflation);
  const taxes = normalizeTaxConfig(config.taxes);

  const buckets = createCoreBuckets({
    allocation: config.allocation,
    bucketConfigs: config.buckets,
    initialCapital: config.initialCapital,
  });

  const totalMonths = monthsForYears(config.years);

  let contributedTotal = 0;
  let taxesPaidTotal = 0;

  const snapshots: YearSnapshot[] = [];

  for (let monthIndex = 0; monthIndex < totalMonths; monthIndex += 1) {
    const yearIndex = monthToYearIndex(monthIndex);
    const calendarYear = config.startYear + yearIndex;

    const marketStep = market.step(yearIndex);
    const inflationMonthly = inflation.monthlyRate();

    const behaviourEffects = computeBehaviourEffects({
      behaviour: config.behaviour,
      yearIndex,
      monthIndex,
      marketCycle: marketStep.cycle,
    });

    const basePlan = config.contributions;
    const baseMonthly = basePlan?.monthlyContribution ?? 0;
    const stepUpAnnual = basePlan?.stepUpAnnual;
    const startDelayMonths = (basePlan?.startDelayMonths ?? 0) + behaviourEffects.extraDelayMonths;

    const plannedContribution = monthIndex >= startDelayMonths
      ? contributionForMonth({ monthIndex, baseMonthly, stepUpAnnual })
      : 0;

    const actualContribution = plannedContribution * behaviourEffects.contributionMultiplier;

    // For now, contributions are split by allocation (via bucket initial setup); later bucket-level plans.
    const contributionPerBucket = actualContribution / Math.max(1, buckets.length);

    for (const bucket of buckets) {
      bucket.step(
        {
          monthIndex,
          yearIndex,
          calendarYear,
          marketCycle: marketStep.cycle,
          inflationMonthly,
          marketReturns: { equityMonthly: marketStep.equityMonthly, debtMonthly: marketStep.debtMonthly },
          behaviour: config.behaviour,
          taxes,
        },
        contributionPerBucket
      );
      bucket.maybeYearEndReset({
        monthIndex,
        yearIndex,
        calendarYear,
        marketCycle: marketStep.cycle,
        inflationMonthly,
        marketReturns: { equityMonthly: marketStep.equityMonthly, debtMonthly: marketStep.debtMonthly },
        behaviour: config.behaviour,
        taxes,
      });
    }

    contributedTotal += actualContribution;

    // Snapshot at year-end.
    if (monthIndex % 12 === 11) {
      const bucketMap: Record<string, number> = {};
      let nominalWealth = 0;
      let taxesPaid = 0;

      for (const bucket of buckets) {
        const v = bucket.snapshotValue();
        bucketMap[bucket.id] = v;
        nominalWealth += v;
        taxesPaid += bucket.snapshotTaxesPaid();
      }

      taxesPaidTotal = taxesPaid;

      const realWealth = inflation.toRealAtStart(nominalWealth, monthIndex + 1);

      snapshots.push({
        yearIndex,
        calendarYear,
        marketCycle: marketStep.cycle,
        contributedTotal,
        taxesPaidTotal,
        nominalWealth,
        realWealth,
        buckets: bucketMap,
      });
    }
  }

  const final = snapshots[snapshots.length - 1] ?? {
    yearIndex: 0,
    calendarYear: config.startYear,
    marketCycle: "sideways",
    contributedTotal: 0,
    taxesPaidTotal: 0,
    nominalWealth: config.initialCapital,
    realWealth: config.initialCapital,
    buckets: {},
  };

  const startNominal = config.initialCapital + (config.contributions?.monthlyContribution ?? 0);

  const nominalCagr = safeCagr(startNominal, final.nominalWealth, config.years);
  const realCagr = safeCagr(startNominal, final.realWealth, config.years);

  return {
    config,
    snapshots,
    final,
    nominalCagr,
    realCagr,
  };
}

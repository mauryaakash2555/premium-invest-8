import type { AssetBucketConfig, PortfolioAllocation, SimulationStepContext } from "./types";
import { computeInterestIncomeTax, normalizeTaxConfig, computeEquityCapitalGainsTax } from "./tax";

export interface AssetBucketState {
  /** Total nominal value of this bucket. */
  value: number;
  /** Cost basis for capital gains calculations (simplified). */
  costBasis: number;
  /** Months since initial purchase for holding period approximation. */
  ageMonths: number;
  /** Total taxes paid by this bucket. */
  taxesPaid: number;
  /** Total contributions into this bucket. */
  contributed: number;
  /** LTCG realized this year for exemption tracking (equity). */
  ltcgRealizedThisYear: number;
}

export interface AssetBucket {
  id: string;
  kind: AssetBucketConfig["kind"];
  step(ctx: SimulationStepContext, contribution: number): void;
  maybeYearEndReset(ctx: SimulationStepContext): void;
  snapshotValue(): number;
  snapshotTaxesPaid(): number;
  snapshotContributed(): number;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export function createCoreBuckets(params: {
  allocation: PortfolioAllocation;
  bucketConfigs?: AssetBucketConfig[];
  initialCapital: number;
}): AssetBucket[] {
  const { allocation, bucketConfigs, initialCapital } = params;

  const equityWeight = clamp01(allocation.equityWeight);
  const debtWeight = clamp01(allocation.debtWeight);
  const weightSum = equityWeight + debtWeight || 1;

  const equityInitial = (initialCapital * equityWeight) / weightSum;
  const debtInitial = (initialCapital * debtWeight) / weightSum;

  // Default minimal buckets if none provided.
  const effectiveConfigs: AssetBucketConfig[] = bucketConfigs?.length
    ? bucketConfigs
    : [
        { kind: "Stocks", name: "Equity", initialValue: equityInitial },
        { kind: "FD", name: "Debt", initialValue: debtInitial, fdAnnualRate: 0.07 },
      ];

  return effectiveConfigs.map((cfg, idx) => {
    const id = cfg.name ?? `${cfg.kind}-${idx + 1}`;

    const state: AssetBucketState = {
      value: cfg.initialValue ?? 0,
      costBasis: cfg.initialValue ?? 0,
      ageMonths: 0,
      taxesPaid: 0,
      contributed: 0,
      ltcgRealizedThisYear: 0,
    };

    const kind = cfg.kind;

    const step = (ctx: SimulationStepContext, contribution: number) => {
      const taxConfig = normalizeTaxConfig(ctx.taxes);

      // Contributions buy at NAV; increases cost basis.
      if (contribution > 0) {
        state.value += contribution;
        state.costBasis += contribution;
        state.contributed += contribution;
      }

      // Apply growth / interest.
      if (kind === "FD") {
        const fdAnnual = cfg.fdAnnualRate ?? 0.07;
        const fdMonthly = Math.pow(1 + fdAnnual, 1 / 12) - 1;
        const interest = state.value * fdMonthly;
        const { taxPaid } = computeInterestIncomeTax({ interestIncome: interest, taxConfig });
        state.taxesPaid += taxPaid;
        state.value += interest - (taxConfig.deductOnRealization ? taxPaid : 0);
      } else if (kind === "Insurance") {
        // Simplified insurance: pay premium, no market growth.
        const annualPremium = cfg.annualPremium ?? 0;
        const premiumMonthly = annualPremium / 12;
        if (premiumMonthly > 0) {
          state.value = Math.max(0, state.value - premiumMonthly);
          state.contributed += premiumMonthly;
        }

        // Maturity payout.
        const maturityYearOffset = cfg.maturityYearOffset ?? null;
        if (maturityYearOffset !== null && ctx.yearIndex === maturityYearOffset && ctx.monthIndex % 12 === 11) {
          const payout = cfg.maturityPayout ?? 0;
          state.value += payout;
        }
      } else {
        // Equity-like buckets: MF/SIP/Stocks use equity return stream.
        // Debt-like MF could be modeled later by separate exposure type.
        state.value *= 1 + ctx.marketReturns.equityMonthly;

        // Behavioural derisking: realize gains and move a portion to cash/debt later.
        // Here, we simply realize tax on a notional sale (simplified, extensible later).
        if (ctx.behaviour.toggles.includes("panic") && ctx.marketCycle === "bear") {
          const sellFraction = 0.08;
          const sellAmount = state.value * sellFraction;
          const gains = Math.max(0, sellAmount - (state.costBasis * sellFraction));

          const { taxPaid } = computeEquityCapitalGainsTax({
            realizedGains: gains,
            holdingPeriodMonths: state.ageMonths,
            taxConfig,
            ltcgRealizedThisYear: state.ltcgRealizedThisYear,
          });

          state.taxesPaid += taxPaid;
          state.ltcgRealizedThisYear += state.ageMonths >= 12 ? gains : 0;

          // Reduce position by sell amount; cost basis reduced proportionally.
          state.value -= sellAmount;
          state.costBasis -= state.costBasis * sellFraction;

          // Deduct tax (assume paid from proceeds).
          if (taxConfig.deductOnRealization) {
            state.value = Math.max(0, state.value - taxPaid);
          }
        }
      }

      state.ageMonths += 1;
    };

    const maybeYearEndReset = (ctx: SimulationStepContext) => {
      // Reset exemption tracking at financial year boundary.
      // NOTE: Simplified to calendar year; plug FY logic later.
      if (ctx.monthIndex % 12 === 11) {
        state.ltcgRealizedThisYear = 0;
      }
    };

    return {
      id,
      kind,
      step,
      maybeYearEndReset,
      snapshotValue: () => state.value,
      snapshotTaxesPaid: () => state.taxesPaid,
      snapshotContributed: () => state.contributed,
    } satisfies AssetBucket;
  });
}

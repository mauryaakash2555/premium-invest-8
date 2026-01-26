export type MarketCycle = "bull" | "bear" | "sideways" | "crash";

/**
 * Behaviour toggles are used by the engine and are intentionally consequence-focused.
 * STEP_1_PROMPT uses names like panic_sell/stop_sip/delay_start/perfect_discipline/overconfident.
 * We keep backward-compatible aliases (panic/discipline/delay) as well.
 */
export type BehaviourToggle =
  | "panic"
  | "discipline"
  | "delay"
  | "panic_sell"
  | "stop_sip"
  | "delay_start"
  | "perfect_discipline"
  | "overconfident";

export type AssetBucketKind = "MF" | "SIP" | "Stocks" | "FD" | "Insurance";

export type AssetClass = "equity" | "debt" | "hybrid" | "cash";

export type TaxAssetTypeIndia =
  | "equity_mf"
  | "stocks"
  | "debt_mf"
  | "fd"
  | "insurance";

export type Frequency = "monthly" | "yearly";

export interface MarketCycleScheduleItem {
  cycle: MarketCycle;
  /** Inclusive start year offset from simulation start (0-based). */
  fromYear: number;
  /** Inclusive end year offset from simulation start (0-based). */
  toYear: number;
}

export interface MarketModelConfig {
  /** Seeded randomness for deterministic runs. */
  seed: number;
  /** Year-range schedule of market cycles. */
  schedule: MarketCycleScheduleItem[];
  /** Optional override for monthly volatility by cycle. */
  volMonthly?: Partial<Record<MarketCycle, number>>;
  /** Optional override for annualized expected return by cycle (equity). */
  equityReturnAnnual?: Partial<Record<MarketCycle, number>>;
  /** Optional override for annualized expected return by cycle (debt). */
  debtReturnAnnual?: Partial<Record<MarketCycle, number>>;
  /** If true, applies volatility clustering to equity returns (GARCH-like). */
  volatilityClustering?: boolean;
}

export interface InflationModelConfig {
  /** Constant annual inflation rate (e.g. 0.06 for 6%). Pluggable later. */
  inflationAnnual: number;
}

export interface BehaviourConfig {
  toggles: BehaviourToggle[];
  /** How strongly behaviour affects decisions (0..1). */
  intensity?: number;
}

export interface TaxConfigIndia {
  /** LTCG on listed equity above exemption. Defaults reflect common rules but are pluggable. */
  equityLtcgRate?: number; // e.g. 0.10
  equityLtcgExemptionAnnual?: number; // e.g. 100000
  equityStcgRate?: number; // e.g. 0.15

  /** Interest income tax rate (FD, debt-like). */
  interestIncomeRate?: number; // e.g. slab proxy 0.30

  /** If true, taxes are deducted from cash/bucket immediately on realization. */
  deductOnRealization?: boolean;

  /** Slab proxy for debt MF & other income (simplified). */
  incomeTaxSlabRate?: number;

  /** Section 80C max deduction (placeholder for education; not advice). */
  section80cMaxDeduction?: number;
}

export interface PortfolioAllocation {
  /** 0..1 weights; sum should be 1. */
  equityWeight: number;
  debtWeight: number;
}

export interface ContributionPlan {
  /** Monthly contribution amount in INR at simulation start (nominal). */
  monthlyContribution: number;
  /** Optional annual step-up rate (e.g. 0.10 for 10% SIP step-up). */
  stepUpAnnual?: number;
  /** Months to delay starting contributions (behaviour "delay" can add more). */
  startDelayMonths?: number;
}

export interface SimulationConfig {
  startYear: number;
  years: number;
  frequency?: Frequency;

  inflation: InflationModelConfig;
  market: MarketModelConfig;
  behaviour: BehaviourConfig;
  taxes: TaxConfigIndia;

  /** Starting capital in INR. */
  initialCapital: number;

  /** SIP/periodic contributions. */
  contributions?: ContributionPlan;

  /** Target allocation between equity/debt style exposures. */
  allocation: PortfolioAllocation;

  /** Optional: run multiple named asset buckets with their own parameters later. */
  buckets?: AssetBucketConfig[];
}

export interface AssetBucketConfig {
  kind: AssetBucketKind;
  name?: string;
  /** Initial value in INR. */
  initialValue?: number;
  /** Contribution plan specific to this bucket (optional). */
  contributions?: ContributionPlan;
  /** FD-specific */
  fdAnnualRate?: number;
  /** Insurance-specific */
  annualPremium?: number;
  maturityYearOffset?: number;
  maturityPayout?: number;
}

export interface SimulationStepContext {
  /** 0-based month index. */
  monthIndex: number;
  /** 0-based year offset from start. */
  yearIndex: number;
  /** Calendar year. */
  calendarYear: number;
  /** Market cycle active for this step. */
  marketCycle: MarketCycle;
  /** Monthly inflation rate. */
  inflationMonthly: number;
  /** Returns for this month by asset class. */
  marketReturns: {
    equityMonthly: number;
    debtMonthly: number;
  };
  behaviour: BehaviourConfig;
  taxes: Required<TaxConfigIndia>;
}

export interface YearSnapshot {
  yearIndex: number;
  calendarYear: number;
  marketCycle: MarketCycle;

  contributedTotal: number;
  taxesPaidTotal: number;

  nominalWealth: number;
  realWealth: number;

  buckets: Record<string, number>;
}

export interface SimulationResult {
  config: SimulationConfig;
  snapshots: YearSnapshot[];
  final: YearSnapshot;

  /** Convenience metrics. */
  nominalCagr: number;
  realCagr: number;
}

import type { TaxConfigIndia } from "./types";
import {
  INDIA_EQUITY_LTCG_EXEMPTION_ANNUAL,
  INDIA_EQUITY_LTCG_RATE,
  INDIA_EQUITY_LONG_TERM_HOLDING_MONTHS,
  INDIA_EQUITY_STCG_RATE,
} from "./constants";

export interface TaxOutcome {
  taxPaid: number;
  taxableIncome: number;
}

export function normalizeTaxConfig(config: TaxConfigIndia): Required<TaxConfigIndia> {
  return {
    equityLtcgRate: config.equityLtcgRate ?? INDIA_EQUITY_LTCG_RATE,
    equityLtcgExemptionAnnual: config.equityLtcgExemptionAnnual ?? INDIA_EQUITY_LTCG_EXEMPTION_ANNUAL,
    equityStcgRate: config.equityStcgRate ?? INDIA_EQUITY_STCG_RATE,
    interestIncomeRate: config.interestIncomeRate ?? 0.3,
    deductOnRealization: config.deductOnRealization ?? true,
    incomeTaxSlabRate: config.incomeTaxSlabRate ?? config.interestIncomeRate ?? 0.3,
    section80cMaxDeduction: config.section80cMaxDeduction ?? 150_000,
  };
}

export function computeEquityCapitalGainsTax(params: {
  realizedGains: number;
  holdingPeriodMonths: number;
  taxConfig: Required<TaxConfigIndia>;
  /** Total LTCG already realized this financial year (for exemption tracking). */
  ltcgRealizedThisYear: number;
}): TaxOutcome {
  const { realizedGains, holdingPeriodMonths, taxConfig, ltcgRealizedThisYear } = params;

  if (realizedGains <= 0) {
    return { taxPaid: 0, taxableIncome: 0 };
  }

  const isLongTerm = holdingPeriodMonths >= 12;
  if (!isLongTerm) {
    const tax = realizedGains * taxConfig.equityStcgRate;
    return { taxPaid: tax, taxableIncome: realizedGains };
  }

  const exemptionLeft = Math.max(0, taxConfig.equityLtcgExemptionAnnual - ltcgRealizedThisYear);
  const taxable = Math.max(0, realizedGains - exemptionLeft);
  const tax = taxable * taxConfig.equityLtcgRate;
  return { taxPaid: tax, taxableIncome: realizedGains };
}

export function computeInterestIncomeTax(params: {
  interestIncome: number;
  taxConfig: Required<TaxConfigIndia>;
}): TaxOutcome {
  const { interestIncome, taxConfig } = params;
  if (interestIncome <= 0) return { taxPaid: 0, taxableIncome: 0 };
  return {
    taxPaid: interestIncome * taxConfig.interestIncomeRate,
    taxableIncome: interestIncome,
  };
}

export type CapitalGainsAssetType =
  | "equity_mf"
  | "stocks"
  | "debt_mf"
  | "fd"
  | "insurance";

export interface CapitalGainsTaxResult {
  taxPaid: number;
  effectiveRate: number; // 0..1
  taxableGains: number;
  category: "ltcg" | "stcg" | "slab";
}

export interface SurchargeAndCessBreakdown {
  baseTax: number;
  surchargeRate: number; // 0..1
  surcharge: number;
  cessRate: number; // 0..1
  cess: number;
  totalTax: number;
}

export function applySurchargeAndCess(params: {
  baseTax: number;
  surchargeRate?: number;
  cessRate?: number;
}): SurchargeAndCessBreakdown {
  const baseTax = Math.max(0, params.baseTax);
  const surchargeRate = Math.max(0, params.surchargeRate ?? 0);
  const cessRate = Math.max(0, params.cessRate ?? 0);

  const surcharge = baseTax * surchargeRate;
  const cess = (baseTax + surcharge) * cessRate;
  const totalTax = baseTax + surcharge + cess;

  return {
    baseTax,
    surchargeRate,
    surcharge,
    cessRate,
    cess,
    totalTax,
  };
}

/**
 * TAX ENGINE (STEP_1_PROMPT core function)
 * Calculates capital gains tax for India-first scenarios.
 * - Equity (MF/stocks): LTCG 12.5% (>1y) with ₹1.25L annual exemption; STCG 20% (<1y)
 * - Debt MF: simplified slab-rate taxation (post-2023 style, education-only)
 * - FD/Insurance: not capital gains (handled elsewhere), returns zero here.
 */
export function calculateCapitalGainsTax(params: {
  gains: number;
  holdingPeriodMonths: number;
  assetType: CapitalGainsAssetType;
  // Optional overrides
  ltcgRate?: number;
  stcgRate?: number;
  ltcgExemptionAnnual?: number;
  longTermHoldingMonths?: number;
  slabRate?: number;
}): CapitalGainsTaxResult {
  const {
    gains,
    holdingPeriodMonths,
    assetType,
    ltcgRate = INDIA_EQUITY_LTCG_RATE,
    stcgRate = INDIA_EQUITY_STCG_RATE,
    ltcgExemptionAnnual = INDIA_EQUITY_LTCG_EXEMPTION_ANNUAL,
    longTermHoldingMonths = INDIA_EQUITY_LONG_TERM_HOLDING_MONTHS,
    slabRate = 0.3,
  } = params;

  const g = Math.max(0, gains);
  if (g <= 0) return { taxPaid: 0, effectiveRate: 0, taxableGains: 0, category: "stcg" };

  if (assetType === "debt_mf") {
    const taxPaid = g * Math.max(0, slabRate);
    const effectiveRate = taxPaid / g;
    return { taxPaid, effectiveRate, taxableGains: g, category: "slab" };
  }

  if (assetType === "fd" || assetType === "insurance") {
    return { taxPaid: 0, effectiveRate: 0, taxableGains: 0, category: "slab" };
  }

  const isLongTerm = holdingPeriodMonths >= longTermHoldingMonths;
  if (!isLongTerm) {
    const taxPaid = g * Math.max(0, stcgRate);
    return { taxPaid, effectiveRate: taxPaid / g, taxableGains: g, category: "stcg" };
  }

  const taxableGains = Math.max(0, g - Math.max(0, ltcgExemptionAnnual));
  const taxPaid = taxableGains * Math.max(0, ltcgRate);
  const effectiveRate = g > 0 ? taxPaid / g : 0;
  return { taxPaid, effectiveRate, taxableGains, category: "ltcg" };
}

/**
 * Placeholder: indexation benefit (where applicable).
 * Not applied by default in Step 1 calculators.
 */
export function applyIndexation(params: {
  costBasis: number;
  inflationIndexFactor: number;
}): { indexedCostBasis: number } {
  const { costBasis, inflationIndexFactor } = params;
  const factor = Math.max(0, inflationIndexFactor);
  return { indexedCostBasis: Math.max(0, costBasis) * factor };
}

/**
 * Placeholder: Section 80C deduction calculator (education-only).
 */
export function calculateSection80cDeduction(params: {
  eligibleInvestments: number;
  maxDeduction: number;
}): number {
  return Math.min(Math.max(0, params.eligibleInvestments), Math.max(0, params.maxDeduction));
}

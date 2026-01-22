import type { TaxConfigIndia } from "./types";

export interface TaxOutcome {
  taxPaid: number;
  taxableIncome: number;
}

export function normalizeTaxConfig(config: TaxConfigIndia): Required<TaxConfigIndia> {
  return {
    equityLtcgRate: config.equityLtcgRate ?? 0.1,
    equityLtcgExemptionAnnual: config.equityLtcgExemptionAnnual ?? 100_000,
    equityStcgRate: config.equityStcgRate ?? 0.15,
    interestIncomeRate: config.interestIncomeRate ?? 0.3,
    deductOnRealization: config.deductOnRealization ?? true,
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

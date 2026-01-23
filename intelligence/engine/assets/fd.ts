import {
  INDIA_FD_PREMATURE_PENALTY_RATE_DEFAULT,
  INDIA_FD_TDS_INTEREST_THRESHOLD_ANNUAL,
  INDIA_FD_TDS_RATE,
} from "../constants";

export interface FdResult {
  /** Net maturity amount after TDS and slab tax on interest (simplified). */
  maturityAmount: number;
  /** Gross maturity amount before taxes (principal + interest). */
  grossMaturityAmount: number;
  interestEarned: number;
  tdsDeducted: number;
  taxPaidOnInterest: number;
}

/**
 * FD calculator (education-only): supports simple compounding and TDS threshold.
 * tenureYears can be fractional.
 */
export function calculateFdReturns(params: {
  principal: number;
  rateAnnual: number;
  tenureYears: number;
  /** Income tax slab proxy (e.g. 0.30). */
  taxSlabRate?: number;
  compounding?: "quarterly" | "annual";
  prematureWithdrawal?: boolean;
  prematurePenaltyRate?: number;
}): FdResult {
  const {
    principal,
    rateAnnual,
    tenureYears,
    taxSlabRate = 0.3,
    compounding = "quarterly",
    prematureWithdrawal = false,
    prematurePenaltyRate = INDIA_FD_PREMATURE_PENALTY_RATE_DEFAULT,
  } = params;

  const p = Math.max(0, principal);
  const years = Math.max(0, tenureYears);

  const n = compounding === "quarterly" ? 4 : 1;
  const effRate = prematureWithdrawal ? Math.max(0, rateAnnual - prematurePenaltyRate) : Math.max(0, rateAnnual);

  const maturityAmount = p * Math.pow(1 + effRate / n, n * years);
  const interestEarned = Math.max(0, maturityAmount - p);

  // TDS logic: if annual interest > threshold, deduct 10% on interest (simplified)
  const annualInterestApprox = years > 0 ? interestEarned / years : interestEarned;
  const tdsDeducted = annualInterestApprox > INDIA_FD_TDS_INTEREST_THRESHOLD_ANNUAL ? interestEarned * INDIA_FD_TDS_RATE : 0;

  // Slab tax on interest income (simplified). TDS is treated as pre-paid; we still report total tax.
  const slab = Math.min(1, Math.max(0, taxSlabRate));
  const totalTaxOnInterest = interestEarned * slab;
  const additionalTaxPayable = Math.max(0, totalTaxOnInterest - tdsDeducted);
  const netAfterTaxes = Math.max(0, maturityAmount - tdsDeducted - additionalTaxPayable);

  return {
    maturityAmount: netAfterTaxes,
    grossMaturityAmount: maturityAmount,
    interestEarned,
    tdsDeducted,
    taxPaidOnInterest: totalTaxOnInterest,
  };
}

import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function safeNonNegative(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, v);
}

function round0(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v);
}

export const LUMPSUM_PLANNER_ASSUMPTIONS = {
  defaultReturn: 0.12,
  defaultYears: 10,
  maxYears: 40,
  maxReturn: 0.30,
};

/**
 * Computes lumpsum investment projection and equivalent SIP comparison.
 * - Maturity = lumpsum × (1 + rate)^years
 * - Equivalent monthly SIP = maturity / SIP-FV-factor
 */
export function computeLumpsumPlan({ lumpsumAmount, annualReturn, years }) {
  const a = LUMPSUM_PLANNER_ASSUMPTIONS;

  const lumpsum = safeNonNegative(lumpsumAmount);
  const rate = clampNumber(annualReturn ?? a.defaultReturn, 0, a.maxReturn);
  const Y = Math.round(clampNumber(years ?? a.defaultYears, 1, a.maxYears));

  // Lumpsum maturity
  const maturityValue = lumpsum * Math.pow(1 + rate, Y);
  const totalGain = maturityValue - lumpsum;
  const wealthMultiplier = lumpsum > 0 ? maturityValue / lumpsum : 0;

  // Equivalent monthly SIP to reach the same maturity
  // FV = PMT × (((1+r)^n - 1) / r) × (1+r)
  // PMT = FV / ((((1+r)^n - 1) / r) × (1+r))
  const monthlyRate = rate / 12;
  const totalMonths = Y * 12;
  let equivalentMonthlySip = 0;
  if (maturityValue > 0 && monthlyRate > 0 && totalMonths > 0) {
    const factor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    const factorWithStart = factor * (1 + monthlyRate);
    equivalentMonthlySip = maturityValue / factorWithStart;
  }

  const sipTotalInvested = equivalentMonthlySip * totalMonths;

  return {
    inputs: { lumpsumAmount: lumpsum, annualReturn: rate, years: Y },
    assumptions: { ...a },
    maturityValue,
    totalGain,
    wealthMultiplier,
    cagr: rate,
    equivalentMonthlySip,
    sipTotalInvested,
  };
}

export function formatLumpsumPlanResults(model) {
  return {
    values: {
      maturityValue: formatINR(round0(model?.maturityValue || 0)),
      totalGain: formatINR(round0(model?.totalGain || 0)),
      wealthMultiplier: (model?.wealthMultiplier || 0).toFixed(2) + "x",
      cagr: ((model?.cagr || 0) * 100).toFixed(1) + "%",
      equivalentMonthlySip: formatINR(round0(model?.equivalentMonthlySip || 0)),
      sipTotalInvested: formatINR(round0(model?.sipTotalInvested || 0)),
      lumpsumAmount: formatINR(round0(model?.inputs?.lumpsumAmount || 0)),
    },
  };
}

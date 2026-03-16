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

function roundToNearest(n, step) {
  return Math.round(n / step) * step;
}

export const INSURANCE_VALUE_ASSUMPTIONS = {
  maxAge: 60,
  minAge: 18,
  incomeReplacementFactor: 0.7, // 70% of income replacement
  dependentBuffer: 2500000, // ₹25L per dependent
  minimumCover: 5000000, // ₹50L minimum
  roundingStep: 2500000, // round to nearest ₹25L
};

/**
 * Computes recommended insurance cover and coverage gap.
 * - Income replacement = annual income × (60 - age) × 0.7
 * - Loan coverage = outstanding loans
 * - Dependent buffer = dependents × ₹25L
 * - Total recommended = income replacement + loans + dependent buffer
 * - Gap = recommended - existing cover
 * - Suggested term = gap rounded to nearest ₹25L (min ₹50L)
 */
export function computeInsuranceValue({
  annualIncome,
  age,
  dependents,
  existingCover,
  outstandingLoans,
}) {
  const a = INSURANCE_VALUE_ASSUMPTIONS;

  const income = safeNonNegative(annualIncome);
  const currentAge = Math.round(clampNumber(age ?? 30, a.minAge, a.maxAge));
  const deps = Math.round(clampNumber(dependents ?? 0, 0, 5));
  const existing = safeNonNegative(existingCover);
  const loans = safeNonNegative(outstandingLoans);

  const yearsToReplace = Math.max(0, a.maxAge - currentAge);

  // Income replacement component
  const incomeReplacement = income * yearsToReplace * a.incomeReplacementFactor;

  // Loan coverage
  const loanCoverage = loans;

  // Dependent buffer
  const dependentBuffer = deps * a.dependentBuffer;

  // Total recommended cover
  const totalRecommended = incomeReplacement + loanCoverage + dependentBuffer;

  // Coverage gap
  const coverageGap = Math.max(0, totalRecommended - existing);

  // Suggested term insurance (min ₹50L, rounded to nearest ₹25L)
  let suggestedTermInsurance = 0;
  if (coverageGap > 0) {
    suggestedTermInsurance = Math.max(
      a.minimumCover,
      roundToNearest(coverageGap, a.roundingStep)
    );
  }

  return {
    inputs: {
      annualIncome: income,
      age: currentAge,
      dependents: deps,
      existingCover: existing,
      outstandingLoans: loans,
    },
    assumptions: { ...a },
    yearsToReplace,
    incomeReplacement,
    loanCoverage,
    dependentBuffer,
    totalRecommended,
    coverageGap,
    suggestedTermInsurance,
  };
}

export function formatInsuranceValueResults(model) {
  return {
    values: {
      totalRecommended: formatINR(round0(model?.totalRecommended || 0)),
      existingCover: formatINR(round0(model?.inputs?.existingCover || 0)),
      coverageGap: formatINR(round0(model?.coverageGap || 0)),
      suggestedTermInsurance: formatINR(round0(model?.suggestedTermInsurance || 0)),
      incomeReplacement: formatINR(round0(model?.incomeReplacement || 0)),
      loanCoverage: formatINR(round0(model?.loanCoverage || 0)),
      dependentBuffer: formatINR(round0(model?.dependentBuffer || 0)),
    },
  };
}

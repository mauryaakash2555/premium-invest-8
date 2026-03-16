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

export const RETIREMENT_GAP_ASSUMPTIONS = {
  defaultCurrentAge: 30,
  defaultRetirementAge: 60,
  defaultInflation: 0.06,
  defaultReturn: 0.10,
  corpusMultiplier: 25, // 25x rule (4% safe withdrawal rate)
  maxAge: 80,
  minAge: 18,
};

/**
 * Computes retirement gap analysis.
 * - Monthly expenses at retirement = today × (1 + inflation)^years
 * - Corpus needed = annual retirement expenses × 25
 * - Future value of current savings = savings × (1 + return)^years
 * - Gap = corpus needed - future value of savings
 * - Monthly SIP to close gap = standard SIP formula
 */
export function computeRetirementGap({
  currentAge,
  retirementAge,
  monthlyExpenses,
  inflationRate,
  currentSavings,
  expectedReturn,
}) {
  const a = RETIREMENT_GAP_ASSUMPTIONS;

  const age = Math.round(clampNumber(currentAge ?? a.defaultCurrentAge, a.minAge, a.maxAge));
  const retAge = Math.round(clampNumber(retirementAge ?? a.defaultRetirementAge, age + 1, a.maxAge));
  const expenses = safeNonNegative(monthlyExpenses);
  const inflation = clampNumber(inflationRate ?? a.defaultInflation, 0, 0.20);
  const savings = safeNonNegative(currentSavings);
  const returnRate = clampNumber(expectedReturn ?? a.defaultReturn, 0, 0.30);

  const yearsToRetirement = retAge - age;

  // Monthly expenses at retirement (inflation-adjusted)
  const monthlyExpensesAtRetirement = expenses * Math.pow(1 + inflation, yearsToRetirement);
  const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;

  // Corpus needed using 25x rule (4% withdrawal rate)
  const corpusNeeded = annualExpensesAtRetirement * a.corpusMultiplier;

  // Future value of current savings
  const futureValueOfSavings = savings * Math.pow(1 + returnRate, yearsToRetirement);

  // Retirement gap
  const retirementGap = Math.max(0, corpusNeeded - futureValueOfSavings);

  // Monthly SIP to close the gap
  // FV = PMT × (((1+r)^n - 1) / r) × (1+r)
  // PMT = FV / ((((1+r)^n - 1) / r) × (1+r))
  const monthlyRate = returnRate / 12;
  const totalMonths = yearsToRetirement * 12;
  let monthlySipRequired = 0;
  if (retirementGap > 0 && monthlyRate > 0 && totalMonths > 0) {
    const factor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    const factorWithStart = factor * (1 + monthlyRate);
    monthlySipRequired = retirementGap / factorWithStart;
  }

  return {
    inputs: {
      currentAge: age,
      retirementAge: retAge,
      monthlyExpenses: expenses,
      inflationRate: inflation,
      currentSavings: savings,
      expectedReturn: returnRate,
    },
    assumptions: { ...a },
    yearsToRetirement,
    monthlyExpensesAtRetirement,
    annualExpensesAtRetirement,
    corpusNeeded,
    futureValueOfSavings,
    retirementGap,
    monthlySipRequired,
  };
}

export function formatRetirementGapResults(model) {
  return {
    values: {
      corpusNeeded: formatINR(round0(model?.corpusNeeded || 0)),
      futureValueOfSavings: formatINR(round0(model?.futureValueOfSavings || 0)),
      retirementGap: formatINR(round0(model?.retirementGap || 0)),
      monthlySipRequired: formatINR(round0(model?.monthlySipRequired || 0)),
      monthlyExpensesAtRetirement: formatINR(round0(model?.monthlyExpensesAtRetirement || 0)),
      annualExpensesAtRetirement: formatINR(round0(model?.annualExpensesAtRetirement || 0)),
    },
  };
}

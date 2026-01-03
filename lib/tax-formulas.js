function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function computeSlabTaxWithBreakdown(taxableIncome, slabs, topRate) {
  let remaining = Math.max(0, Number(taxableIncome) || 0);
  let lastLimit = 0;
  let tax = 0;
  const breakdown = [];

  for (const slab of slabs) {
    const limit = Number(slab?.limit);
    const rate = Number(slab?.rate);
    if (!Number.isFinite(limit) || !Number.isFinite(rate)) continue;
    if (remaining <= 0) break;

    const slabWidth = limit - lastLimit;
    const amountInSlab = clampNumber(Math.min(remaining, slabWidth), 0, slabWidth);
    const slabTax = amountInSlab * rate;
    tax += slabTax;
    breakdown.push({ from: lastLimit, to: limit, rate, amount: amountInSlab, tax: slabTax });
    remaining -= amountInSlab;
    lastLimit = limit;
  }

  const top = Number.isFinite(Number(topRate)) ? Number(topRate) : 0;
  if (remaining > 0 && top > 0) {
    const slabTax = remaining * top;
    tax += slabTax;
    breakdown.push({ from: lastLimit, to: null, rate: top, amount: remaining, tax: slabTax });
  }

  return { tax, breakdown };
}

function applyRebate({ baseTax, taxableIncome, regime }) {
  const tax = Math.max(0, Number(baseTax) || 0);
  const ti = Math.max(0, Number(taxableIncome) || 0);

  if (regime === "old") {
    // FY 2025-26: rebate up to ₹12,500 if taxable income ≤ ₹5,00,000 (effectively makes tax 0)
    if (ti <= 5_00_000) return Math.max(0, tax - Math.min(12_500, tax));
    return tax;
  }

  // FY 2025-26: rebate up to ₹60,000 if taxable income ≤ ₹12,00,000 (effectively makes tax 0)
  if (ti <= 12_00_000) return Math.max(0, tax - Math.min(60_000, tax));
  return tax;
}

function computeHraExemption({ hraReceived, rentPaid, basicSalary, isMetro }) {
  const hra = Math.max(0, Number(hraReceived) || 0);
  const rent = Math.max(0, Number(rentPaid) || 0);
  const basic = Math.max(0, Number(basicSalary) || 0);
  const metroLimit = (isMetro ? 0.5 : 0.4) * basic;
  const rentLess10 = Math.max(0, rent - 0.1 * basic);
  return Math.max(0, Math.min(hra, rentLess10, metroLimit));
}

function applyNewRegimeMarginalRelief({ taxBeforeCess, taxableIncome }) {
  const tax = Math.max(0, Number(taxBeforeCess) || 0);
  const ti = Math.max(0, Number(taxableIncome) || 0);
  // FY 2025-26: marginal relief for taxable income just above ₹12L
  // Tax (before cess) should not exceed (taxableIncome - ₹12L)
  if (ti > 12_00_000) {
    const cap = ti - 12_00_000;
    if (tax > cap) return { tax: cap, relief: tax - cap };
  }
  return { tax, relief: 0 };
}

export function calculateTaxFY2526({
  annualSalary = 0,
  deduction80C = 0,
  deduction80D = 0,
  hraReceived = 0,
  rentPaid = 0,
  basicSalary = 0,
  homeLoanInterest = 0,
  nps80ccd1b = 0,
  regime = "new",
} = {}) {
  const salary = clampNumber(annualSalary, 0, 50_00_000);

  // If not provided, default basicSalary to 50% of salary to avoid over-exempting HRA.
  // UI will collect basic/rent for accurate computation.
  const basic = clampNumber(basicSalary || salary * 0.5, 0, 50_00_000);

  const slabsNew = [
    { limit: 4_00_000, rate: 0 },
    { limit: 8_00_000, rate: 0.05 },
    { limit: 12_00_000, rate: 0.1 },
    { limit: 16_00_000, rate: 0.15 },
    { limit: 20_00_000, rate: 0.2 },
  ];
  const topRateNew = 0.3;

  const slabsOld = [
    { limit: 2_50_000, rate: 0 },
    { limit: 5_00_000, rate: 0.05 },
    { limit: 10_00_000, rate: 0.2 },
  ];
  const topRateOld = 0.3;

  const isOld = regime === "old";
  const standardDeduction = isOld ? 50_000 : 75_000;

  const d80c = clampNumber(deduction80C, 0, 1_50_000);
  const d80d = clampNumber(deduction80D, 0, 1_00_000);
  const homeLoan = clampNumber(homeLoanInterest, 0, 2_00_000);
  const nps = clampNumber(nps80ccd1b, 0, 50_000);
  const hraExempt = computeHraExemption({
    hraReceived,
    rentPaid,
    basicSalary: basic,
    // Tool is Mumbai-first. Default to metro (50%).
    isMetro: true,
  });

  const totalDeductions = isOld
    ? d80c + d80d + hraExempt + homeLoan + nps + standardDeduction
    : standardDeduction;

  const taxableIncome = Math.max(0, salary - totalDeductions);
  const slabs = isOld ? slabsOld : slabsNew;
  const topRate = isOld ? topRateOld : topRateNew;

  const slabRes = computeSlabTaxWithBreakdown(taxableIncome, slabs, topRate);
  const baseTaxBeforeRebate = slabRes.tax;
  const taxAfterRebate = applyRebate({ baseTax: baseTaxBeforeRebate, taxableIncome, regime });

  const mr = !isOld ? applyNewRegimeMarginalRelief({ taxBeforeCess: taxAfterRebate, taxableIncome }) : { tax: taxAfterRebate, relief: 0 };
  const taxAfterRelief = mr.tax;

  const cess = taxAfterRelief * 0.04;
  const totalTax = taxAfterRelief + cess;

  const effectiveRate = salary > 0 ? totalTax / salary : 0;

  return {
    regime,
    grossIncome: salary,
    standardDeduction,
    deductions: {
      section80C: isOld ? d80c : 0,
      section80D: isOld ? d80d : 0,
      hraExempt: isOld ? hraExempt : 0,
      homeLoanInterest: isOld ? homeLoan : 0,
      nps80ccd1b: isOld ? nps : 0,
    },
    totalDeductions,
    taxableIncome,
    taxBeforeRebate: baseTaxBeforeRebate,
    taxAfterRebate: taxAfterRebate,
    marginalRelief: !isOld ? mr.relief : 0,
    slabBreakdown: slabRes.breakdown,
    cess,
    taxAmount: totalTax,
    effectiveRate,
    assumptions: {
      hraMode: "min(actual, rent_minus_10pct_basic, 50pct_basic_metro)",
      hraCityAssumption: "mumbai_metro_default",
      basicSalaryDefault: basicSalary ? "provided" : "assumed_50pct_of_salary",
    },
  };
}

export function compareRegimesFY2526(inputs) {
  const oldResult = calculateTaxFY2526({ ...inputs, regime: "old" });
  const newResult = calculateTaxFY2526({ ...inputs, regime: "new" });

  const oldTax = oldResult.taxAmount;
  const newTax = newResult.taxAmount;

  let winner = "tie";
  if (oldTax < newTax) winner = "old";
  if (newTax < oldTax) winner = "new";

  const savings = Math.abs(oldTax - newTax);

  return {
    old: oldResult,
    new: newResult,
    winner,
    savings,
  };
}

export function formatINR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "₹0";
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

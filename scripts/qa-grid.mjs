import { calculateTaxFY2526, compareRegimesFY2526 } from '../lib/tax-formulas.js';

function runGrid() {
  const salaryBand1 = [1100000, 1200000, 1275000, 1280000, 1300000, 1400000, 1500000];
  const salaryBand2 = [2000000, 2500000, 3000000, 3500000, 4000000, 4500000];
  const i80cVals = [0, 150000];
  const i80dVals = [0, 75000];
  const loanVals = [0, 200000];
  const npsVals = [0, 50000];
  const hraRatioVals = [0.2, 0.4];
  const rentRatioVals = [0.3, 0.5];

  const anomalies = [];
  const summary = { band1: { total: 0, anomalies: 0 }, band2: { total: 0, anomalies: 0 }, checks: { cessOk: 0, stdDeductionOk: 0, hraCapOk: 0, rebateOk: 0, reliefOk: 0 } };

  function checkCase(inputs) {
    const comp = compareRegimesFY2526(inputs);
    const old = comp.old; const nw = comp.new;

    // Check cess applied after final tax
    const taxBeforeCessNew = nw.taxAfterRebate - (nw.marginalRelief || 0);
    const cessOk = Math.abs(nw.taxAmount - (taxBeforeCessNew + nw.cess)) < 0.5 && Math.abs(nw.cess - taxBeforeCessNew * 0.04) < 0.5;
    const stdDeductionOk = old.standardDeduction === 50000 && nw.standardDeduction === 75000 && nw.totalDeductions === 75000;

    // HRA statutory cap sanity (non-metro 40%)
    const basic = inputs.basicSalary || inputs.annualSalary * 0.5;
    const rentLess10 = Math.max(0, (inputs.rentPaid || 0) - 0.1 * basic);
    const nonMetroCap = 0.4 * basic;
    const hraExempt = old.deductions.hraExempt || 0;
    const hraCapOk = hraExempt <= (inputs.hraReceived || 0) + 1 && hraExempt <= rentLess10 + 1 && hraExempt <= nonMetroCap + 1; // +1 tolerance

    // 87A rebate check: Old up to 5L taxable => 0; New up to 12L taxable => 0;
    const rebateOk = (old.taxableIncome <= 500000 ? old.taxAmount === 0 : true) && (nw.taxableIncome <= 1200000 ? nw.taxAmount === 0 : true);

    // Marginal relief check for new regime when taxable just above 12L
    let reliefOk = true;
    if (nw.taxableIncome > 1200000) {
      const cap = nw.taxableIncome - 1200000; // before cess cap
      reliefOk = taxBeforeCessNew <= cap + 1; // tolerance
    }

    // Wrong zero-tax new regime when taxable > 12L
    const wrongZeroNew = nw.taxAmount === 0 && nw.taxableIncome > 1200000;

    // Both zero without threshold explanation
    const bothZeroWrong = old.taxAmount === 0 && nw.taxAmount === 0 && !(old.taxableIncome <= 500000 && nw.taxableIncome <= 1200000);

    const anomaly = (!cessOk) || (!stdDeductionOk) || (!hraCapOk) || (!rebateOk) || (!reliefOk) || wrongZeroNew || bothZeroWrong;

    summary.checks.cessOk += cessOk ? 1 : 0;
    summary.checks.stdDeductionOk += stdDeductionOk ? 1 : 0;
    summary.checks.hraCapOk += hraCapOk ? 1 : 0;
    summary.checks.rebateOk += rebateOk ? 1 : 0;
    summary.checks.reliefOk += reliefOk ? 1 : 0;

    if (anomaly) {
      anomalies.push({ inputs, old: { taxableIncome: old.taxableIncome, tax: old.taxAmount }, new: { taxableIncome: nw.taxableIncome, tax: nw.taxAmount, mr: nw.marginalRelief }, flags: { cessOk, stdDeductionOk, hraCapOk, rebateOk, reliefOk, wrongZeroNew, bothZeroWrong } });
      return true;
    }
    return false;
  }

  function runBand(salaries, summaryKey) {
    let total = 0; let anomaliesCount = 0;
    for (const annualSalary of salaries) {
      const basicSalary = Math.round(annualSalary * 0.5);
      for (const deduction80C of i80cVals) {
        for (const deduction80D of i80dVals) {
          for (const homeLoanInterest of loanVals) {
            for (const nps80ccd1b of npsVals) {
              for (const hraRatio of hraRatioVals) {
                for (const rentRatio of rentRatioVals) {
                  const hraReceived = Math.round(basicSalary * hraRatio);
                  const rentPaid = Math.round(basicSalary * rentRatio);
                  const inputs = { annualSalary, deduction80C, deduction80D, homeLoanInterest, nps80ccd1b, hraReceived, rentPaid, basicSalary };
                  const isAnom = checkCase(inputs);
                  total++;
                  if (isAnom) anomaliesCount++;
                }
              }
            }
          }
        }
      }
    }
    summary[summaryKey].total = total;
    summary[summaryKey].anomalies = anomaliesCount;
  }

  runBand(salaryBand1, 'band1');
  runBand(salaryBand2, 'band2');

  const report = {
    summary,
    anomalies: anomalies.slice(0, 30), // cap printed anomalies
  };
  console.log(JSON.stringify(report, null, 2));
}

runGrid();

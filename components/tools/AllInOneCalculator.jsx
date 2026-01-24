'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * AllInOneCalculator - All in One Financial Calculator
 * 
 * Matches design of existing Tax/Property calculators on /tools
 * Gold/black theme, clean input/output layout
 * 
 * FREE to use - no paywall
 */

// All-in-one calculator switcher (expandable)
// Order: PMS/Wealth first, then MF, SIP, Insurance 4th
const CALCULATORS = {
  wealth: { key: 'wealth', label: 'PMS / Wealth', icon: '🏆', desc: 'Portfolio Management & wealth planning' },
  mfReturns: { key: 'mfReturns', label: 'Mutual Fund', icon: '📊', desc: 'XIRR • Exit load • LTCG/STCG • Post-tax returns' },
  sip: { key: 'sip', label: 'SIP', icon: '📈', desc: 'Step-up • Multi-scenario • Goal mapping • XIRR' },
  insurance: { key: 'insurance', label: 'Insurance', icon: '🛡️', desc: 'Term, health, critical illness coverage' },

  lic: { key: 'lic', label: 'LIC', icon: '🧾', desc: 'Endowment • ULIP • Term • IRR • Surrender • Comparison' },
  lumpsum: { key: 'lumpsum', label: 'Lumpsum', icon: '💰', desc: 'One-time investment' },
  goal: { key: 'goal', label: 'Goal Planning', icon: '🎯', desc: 'Target amount planning' },
  retire: { key: 'retire', label: 'Retirement', icon: '🏖️', desc: 'Retirement corpus' },
  fd: { key: 'fd', label: 'Fixed Deposit', icon: '🏦', desc: 'FD returns' },
  ppf: { key: 'ppf', label: 'PPF', icon: '🏛️', desc: 'Public Provident Fund' },
  epf: { key: 'epf', label: 'EPF', icon: '👷', desc: 'Employee PF returns' },
  nps: { key: 'nps', label: 'NPS', icon: '🧓', desc: 'National Pension Scheme' },
  elss: { key: 'elss', label: 'ELSS', icon: '💎', desc: 'Tax saving mutual funds' },
  emi: { key: 'emi', label: 'EMI', icon: '🏠', desc: 'Loan EMI calculator' },
  swp: { key: 'swp', label: 'SWP', icon: '💸', desc: 'Systematic Withdrawal' },
  stepup: { key: 'stepup', label: 'Step-Up SIP', icon: '📊', desc: 'Step-up SIP growth' },
  cagr: { key: 'cagr', label: 'CAGR', icon: '📉', desc: 'Compound Annual Growth' },
  inflation: { key: 'inflation', label: 'Inflation', icon: '🔥', desc: 'Inflation adjusted value' },
  gratuity: { key: 'gratuity', label: 'Gratuity', icon: '🎁', desc: 'Gratuity calculator' },
  hra: { key: 'hra', label: 'HRA', icon: '🏢', desc: 'HRA exemption' },
  tax: { key: 'tax', label: 'Income Tax', icon: '📋', desc: 'FY 2025-26 • Old vs New regime • All deductions • Surcharge • Tax-saving tips' },
  rd: { key: 'rd', label: 'RD', icon: '📅', desc: 'Recurring deposit' },
  ssy: { key: 'ssy', label: 'SSY', icon: '👧', desc: 'Sukanya Samriddhi Yojana' },
  childPlan: { key: 'childPlan', label: 'Child Education', icon: '👶', desc: 'Child education plan' },
  marriage: { key: 'marriage', label: 'Marriage Fund', icon: '💍', desc: 'Marriage planner' },
  carLoan: { key: 'carLoan', label: 'Car Loan', icon: '🚗', desc: 'Car loan EMI' },
  homeLoan: { key: 'homeLoan', label: 'Home Loan', icon: '🏡', desc: 'Home loan EMI' },
  gold: { key: 'gold', label: 'Gold Investment', icon: '🪙', desc: 'Gold returns' },
};

// Format to Indian currency - proper Lakh/Crore display
// 1 Lakh = 1,00,000 | 1 Crore = 1,00,00,000
const fmt = (n) => {
  if (!n || isNaN(n)) return '₹0';
  const num = Math.abs(Number(n));
  const sign = Number(n) < 0 ? '-' : '';
  
  // 1 Crore+ (10 million+)
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `${sign}₹${cr >= 100 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  // 1 Lakh+ (100,000+)
  if (num >= 100000) {
    const lakh = num / 100000;
    return `${sign}₹${lakh >= 100 ? lakh.toFixed(0) : lakh.toFixed(2)} L`;
  }
  // 1000+ - show with Indian comma formatting
  if (num >= 1000) {
    return `${sign}₹${Math.round(num).toLocaleString('en-IN')}`;
  }
  // Below 1000 - show as is
  return `${sign}₹${Math.round(num)}`;
};

const base64UrlEncode = (text) => {
  const base64 = btoa(unescape(encodeURIComponent(text)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const base64UrlDecode = (b64url) => {
  const padded = String(b64url || '').replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(String(b64url || '').length / 4) * 4, '=');
  const text = decodeURIComponent(escape(atob(padded)));
  return text;
};

// ════════════════════════════════════════════════════════════════
// PDF QUOTE GENERATOR
// ════════════════════════════════════════════════════════════════
const generateInsurancePDF = (result, inputs) => {
  if (!result || result.__type !== 'insurance') return null;
  
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const quoteId = `BM-${Date.now().toString(36).toUpperCase()}`;
  
  // Build HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Insurance Quote - ${quoteId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid rgba(255,255,255,0.9); padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #1a1a1a; }
    .logo span { color: rgba(255,255,255,0.9); }
    .quote-info { text-align: right; font-size: 12px; color: #666; }
    .quote-id { font-size: 14px; font-weight: bold; color: #1a1a1a; }
    h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 10px; }
    h2 { font-size: 18px; color: rgba(255,255,255,0.9); margin: 25px 0 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f8f7f4; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card .label { font-size: 12px; color: #666; margin-bottom: 5px; }
    .summary-card .value { font-size: 22px; font-weight: bold; color: #1a1a1a; }
    .summary-card .meta { font-size: 11px; color: #888; margin-top: 5px; }
    .summary-card.highlight { background: linear-gradient(135deg, rgba(255,255,255,0.9), #d4b77a); color: #fff; }
    .summary-card.highlight .label, .summary-card.highlight .meta { color: rgba(255,255,255,0.8); }
    .summary-card.highlight .value { color: #fff; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
    th { background: #f0ebe3; padding: 12px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.9); }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    tr:hover { background: #faf9f7; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .tag { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    .tag-green { background: #e8f5e9; color: #2e7d32; }
    .tag-gold { background: #fff8e1; color: #f57c00; }
    .disclaimer { margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; font-size: 11px; color: #666; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">BM <span>Wealth</span></div>
    <div class="quote-info">
      <div class="quote-id">Quote: ${quoteId}</div>
      <div>Generated: ${today}</div>
      <div>Valid for 30 days</div>
    </div>
  </div>
  
  <h1>${result.insuranceType} Insurance Quote</h1>
  <p style="color: #666; margin-bottom: 20px;">Personalized coverage recommendation based on your profile</p>
  
  <div class="summary-grid">
    <div class="summary-card highlight">
      <div class="label">Recommended Cover</div>
      <div class="value">${fmt(result.recommendedCover)}</div>
      <div class="meta">${result.coverageMultiple || ''}x annual income</div>
    </div>
    <div class="summary-card">
      <div class="label">Premium Range</div>
      <div class="value">${result.premiumRange || fmt(result.annualPremiumMid)}</div>
      <div class="meta">Annual (varies by insurer)</div>
    </div>
    <div class="summary-card">
      <div class="label">Monthly Equivalent</div>
      <div class="value">${fmt(result.monthlyPremiumMid)}</div>
      <div class="meta">Approx. EMI</div>
    </div>
  </div>
  
  ${result.hlv ? `
  <h2>Human Life Value (HLV) Analysis</h2>
  <table>
    <tr><td>Net Annual Contribution</td><td class="text-right">${fmt(result.hlv.netAnnualContribution)}</td></tr>
    <tr><td>Years to Retirement</td><td class="text-right">${result.hlv.yearsToRetire} years</td></tr>
    <tr><td>Basic HLV</td><td class="text-right">${fmt(result.hlv.basicHLV)}</td></tr>
    <tr><td><strong>Present Value (Discounted)</strong></td><td class="text-right"><strong>${fmt(result.hlv.presentValue)}</strong></td></tr>
  </table>
  ` : ''}
  
  ${result.bmiAnalysis ? `
  <h2>Health Profile</h2>
  <table>
    <tr><td>BMI</td><td class="text-right">${result.bmiAnalysis.bmi} (${result.bmiAnalysis.category})</td></tr>
    <tr><td>Height / Weight</td><td class="text-right">${result.bmiAnalysis.heightCm}cm / ${result.bmiAnalysis.weightKg}kg</td></tr>
    <tr><td>Premium Impact</td><td class="text-right">${result.bmiAnalysis.impact}</td></tr>
  </table>
  ` : ''}
  
  ${Array.isArray(result.insurerQuotes) ? `
  <h2>Premium Comparison by Insurer</h2>
  <table>
    <thead>
      <tr><th>Insurer</th><th class="text-center">CSR</th><th class="text-right">Annual Premium</th><th class="text-right">Monthly</th></tr>
    </thead>
    <tbody>
      ${result.insurerQuotes.map((q, idx) => `
        <tr>
          <td>${q.logo} ${q.name} ${idx === 0 ? '<span class="tag tag-green">Lowest</span>' : ''}</td>
          <td class="text-center">${q.csr}%</td>
          <td class="text-right">${fmt(q.annualPremium)}</td>
          <td class="text-right">${fmt(q.monthlyPremium)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
  
  ${Array.isArray(result.breakdown) ? `
  <h2>Coverage Components</h2>
  <table>
    <thead><tr><th>Component</th><th class="text-right">Amount</th><th class="text-right">%</th></tr></thead>
    <tbody>
      ${result.breakdown.map(b => `
        <tr><td>${b.label}</td><td class="text-right">${fmt(b.value)}</td><td class="text-right">${b.percent > 0 ? b.percent + '%' : '-'}</td></tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
  
  ${Array.isArray(result.riders) && result.riders.length > 0 ? `
  <h2>Selected Riders</h2>
  <table>
    <thead><tr><th>Rider</th><th>Benefit</th><th class="text-right">Cost/Year</th></tr></thead>
    <tbody>
      ${result.riders.filter(r => r.selected).map(r => `
        <tr><td>${r.name}</td><td>${r.benefit}</td><td class="text-right">${fmt(r.cost)}</td></tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
  
  ${result.taxBenefits ? `
  <h2>Tax Benefits</h2>
  <table>
    <tr><td>80C Deduction</td><td class="text-right">${fmt(result.taxBenefits.deduction80C)}</td></tr>
    <tr><td>Tax Saved (30% slab)</td><td class="text-right">${fmt(result.taxBenefits.taxSaved)}</td></tr>
    <tr><td><strong>Effective Premium</strong></td><td class="text-right"><strong>${fmt(result.taxBenefits.effectivePremium)}</strong></td></tr>
  </table>
  ` : ''}
  
  ${result.ulipMaturity ? `
  <h2>ULIP Maturity Projection</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Conservative (8%)</div>
      <div class="value">${fmt(result.ulipMaturity.fundValueLow)}</div>
      <div class="meta">IRR: ${result.ulipMaturity.irrLow}%</div>
    </div>
    <div class="summary-card highlight">
      <div class="label">Expected (10%)</div>
      <div class="value">${fmt(result.ulipMaturity.fundValueMid)}</div>
      <div class="meta">IRR: ${result.ulipMaturity.irrMid}%</div>
    </div>
    <div class="summary-card">
      <div class="label">Optimistic (12%)</div>
      <div class="value">${fmt(result.ulipMaturity.fundValueHigh)}</div>
      <div class="meta">IRR: ${result.ulipMaturity.irrHigh}%</div>
    </div>
  </div>
  <table>
    <tr><td>Total Premium Paid</td><td class="text-right">${fmt(result.ulipMaturity.totalPremiumPaid)}</td></tr>
    <tr><td>Wealth Multiple (Mid)</td><td class="text-right">${result.ulipMaturity.wealthMultiple}x</td></tr>
    <tr><td>Wealth Gain (Mid)</td><td class="text-right">${fmt(result.ulipMaturity.wealthGainMid)}</td></tr>
  </table>
  ` : ''}
  
  <div class="disclaimer">
    <strong>Disclaimer:</strong> This is an indicative quote for informational purposes only. Actual premiums depend on insurer underwriting, medical tests, and policy terms. 
    Claim Settlement Ratio (CSR) data from IRDAI 2024-25. BM Wealth does not guarantee coverage or premium amounts. 
    Please consult with a licensed insurance advisor before making any decisions.
  </div>
  
  <div class="footer">
    <p>Generated by BM Wealth Insurance Calculator | www.bmwealth.co.in</p>
    <p>For personalized advice, contact us at support@bmwealth.co.in</p>
  </div>
</body>
</html>
  `.trim();
  
  return htmlContent;
};

// ════════════════════════════════════════════════════════════════
// INTERPRETATIONS - Educational, no advice, no future tense
// ════════════════════════════════════════════════════════════════
const getInterpretation = (calcKey, result, inputs) => {
  if (!result || result.error) return null;
  
  const interpretations = {
    sip: () => ({
      text: `A monthly SIP of ${fmt(inputs?.monthlyInvestment || 0)} over ${inputs?.years || 0} years, assuming ${inputs?.rateMid || 12}% annual returns, compounds to a projected corpus. The difference between invested capital and projected value represents the power of compounding over time.`,
      decisionGap: result?.futureValueMid && result?.invested 
        ? `Compounding gain: ${fmt(result.futureValueMid - result.invested)} (${((result.futureValueMid - result.invested) / result.invested * 100).toFixed(1)}% of invested)`
        : null,
    }),
    wealth: () => ({
      text: `Based on the current corpus of ${fmt(result?.current || 0)} and a ${result?.years || 0}-year horizon, the projection shows potential growth under PMS-style management. Management fees and performance fees are factored into the net returns shown.`,
      decisionGap: result?.projectedValue && result?.current
        ? `Projected wealth gap: ${fmt(result.projectedValue - result.current)} over ${result?.years || 0} years`
        : null,
    }),
    mfReturns: () => ({
      text: `The investment of ${fmt(result?.invested || 0)} has grown to ${fmt(result?.current || 0)}, reflecting a CAGR of ${Number(result?.cagrPercent || 0).toFixed(2)}%. After accounting for exit load and estimated tax, the post-tax value is ${fmt(result?.postTaxValue || 0)}.`,
      decisionGap: result?.postTaxValue && result?.invested
        ? `Net gain after tax: ${fmt(result.postTaxValue - result.invested)}`
        : null,
    }),
    insurance: () => ({
      text: `Based on Human Life Value (HLV) calculation — considering income, expenses, taxes, and remaining working years — the recommended life cover is ${fmt(result?.recommendedCover || 0)}. This covers income replacement, mortgage protection, child education, spouse protection, and emergency buffers. Premium comparison across ${result?.insurerQuotes?.length || 8} insurers shows range of ${result?.premiumRange || 'varies'}.`,
      decisionGap: result?.recommendedCover
        ? `Coverage needed: ${fmt(result.recommendedCover)} (${result?.coverageMultiple?.toFixed(1) || 0}x annual income) • Tax benefit: ${fmt(result?.taxBenefits?.taxSaved || 0)}/year`
        : null,
    }),
    lic: () => ({
      text: `The LIC policy with sum assured ${fmt(result?.sumAssured || 0)} and annual premium ${fmt(result?.annualPremium || 0)} projects a maturity value of approximately ${fmt(result?.maturityValue || 0)}. The internal rate of return (IRR) indicates the effective annual yield.`,
      decisionGap: result?.irrPercent
        ? `Effective IRR: ${Number(result.irrPercent || 0).toFixed(2)}% p.a.`
        : null,
    }),
    lumpsum: () => ({
      text: `A one-time investment of ${fmt(result?.principal || 0)} at ${result?.rate || 0}% annual return over ${result?.years || 0} years grows through compound interest. The final value depends on the holding period and return assumptions.`,
      decisionGap: result?.futureValue && result?.principal
        ? `Total growth: ${fmt(result.futureValue - result.principal)} (${((result.futureValue - result.principal) / result.principal * 100).toFixed(1)}%)`
        : null,
    }),
    goal: () => ({
      text: `To accumulate ${fmt(result?.targetAmount || 0)} in ${result?.years || 0} years, the required monthly investment is calculated based on expected returns. This assumes consistent contributions and no withdrawals.`,
      decisionGap: result?.monthlyRequired
        ? `Monthly commitment needed: ${fmt(result.monthlyRequired)}`
        : null,
    }),
    retire: () => ({
      text: `Based on current age, retirement age, and expected monthly expenses, the retirement corpus required is estimated. This factors in inflation and post-retirement returns to sustain the withdrawal period.`,
      decisionGap: result?.corpusRequired
        ? `Retirement corpus gap: ${fmt(result.corpusRequired)}`
        : null,
    }),
    fd: () => ({
      text: `A fixed deposit of ${fmt(result?.principal || 0)} at ${result?.rate || 0}% interest rate for ${result?.years || 0} years earns guaranteed returns. Interest payout depends on compounding frequency.`,
      decisionGap: result?.maturityAmount && result?.principal
        ? `Interest earned: ${fmt(result.maturityAmount - result.principal)}`
        : null,
    }),
    ppf: () => ({
      text: `Annual PPF contributions of ${fmt(inputs?.yearly || 0)} over ${inputs?.years || 0} years at the current rate of 7.1% p.a. accumulate with compound interest. PPF offers EEE tax benefits under Section 80C.`,
      decisionGap: result?.maturityValue && result?.totalInvested
        ? `Tax-free interest earned: ${fmt(result.maturityValue - result.totalInvested)}`
        : null,
    }),
    epf: () => ({
      text: `With a basic salary of ${fmt(inputs?.basicSalary || 0)} and combined employer-employee contribution, the EPF corpus grows at 8.25% p.a. This is a mandatory retirement savings vehicle for salaried employees.`,
      decisionGap: result?.maturityValue
        ? `Projected EPF corpus: ${fmt(result.maturityValue)}`
        : null,
    }),
    nps: () => ({
      text: `Monthly NPS contribution of ${fmt(inputs?.monthly || 0)} over ${inputs?.years || 0} years at expected ${inputs?.rate || 0}% returns builds a retirement corpus. 60% is accessible at retirement, 40% converts to annuity.`,
      decisionGap: result?.totalCorpus
        ? `Projected NPS corpus: ${fmt(result.totalCorpus)}`
        : null,
    }),
    elss: () => ({
      text: `ELSS SIP of ${fmt(inputs?.monthly || 0)} qualifies for 80C deduction up to ₹1.5L annually. The 3-year lock-in period is the shortest among 80C instruments. Returns are market-linked.`,
      decisionGap: result?.futureValue && result?.totalInvested
        ? `Projected gain: ${fmt(result.futureValue - result.totalInvested)}`
        : null,
    }),
    emi: () => ({
      text: `A loan of ${fmt(result?.principal || 0)} at ${result?.rate || 0}% interest for ${result?.years || 0} years results in a fixed monthly EMI. The total interest paid over the loan tenure is a key cost factor.`,
      decisionGap: result?.totalInterest
        ? `Total interest cost: ${fmt(result.totalInterest)}`
        : null,
    }),
    swp: () => ({
      text: `Withdrawing ${fmt(inputs?.withdrawal || 0)} monthly from a corpus of ${fmt(inputs?.corpus || 0)} while earning ${inputs?.rate || 0}% returns determines corpus longevity. The balance shown is after the specified withdrawal period.`,
      decisionGap: result?.remainingCorpus !== undefined
        ? `Remaining after ${inputs?.years || 0} years: ${fmt(result.remainingCorpus)}`
        : null,
    }),
    stepup: () => ({
      text: `Starting with ${fmt(inputs?.initial || 0)} monthly and increasing by ${inputs?.stepUp || 0}% annually, the step-up SIP accelerates wealth accumulation compared to flat SIP contributions.`,
      decisionGap: result?.futureValue && result?.totalInvested
        ? `Extra gain vs flat SIP: ~${fmt((result.futureValue - result.totalInvested) * 0.15)} (approx)`
        : null,
    }),
    cagr: () => ({
      text: `The investment grew from ${fmt(result?.initial || 0)} to ${fmt(result?.final || 0)} over ${result?.years || 0} years. CAGR represents the smoothed annual growth rate assuming reinvestment.`,
      decisionGap: result?.cagr
        ? `Compound annual growth rate: ${result.cagr}%`
        : null,
    }),
    inflation: () => ({
      text: `At ${result?.inflationRate || 0}% annual inflation, the purchasing power of ${fmt(inputs?.current || 0)} erodes over time. The future value shows what today's amount would need to be to maintain purchasing power.`,
      decisionGap: result?.futureValue && inputs?.current
        ? `Inflation impact: ${fmt(result.futureValue - inputs.current)} more needed in ${inputs?.years || 0} years`
        : null,
    }),
    gratuity: () => ({
      text: `Gratuity is calculated as (Basic × 15 × Years of Service) ÷ 26 for employees covered under the Payment of Gratuity Act. Maximum tax-free gratuity is ₹20 lakh.`,
      decisionGap: result?.gratuityAmount
        ? `Gratuity entitlement: ${fmt(result.gratuityAmount)}`
        : null,
    }),
    hra: () => ({
      text: `HRA exemption is the minimum of: actual HRA received, 50%/40% of basic (metro/non-metro), or rent paid minus 10% of basic. The taxable portion is HRA received minus exemption.`,
      decisionGap: result?.exemption
        ? `Tax-exempt HRA: ${fmt(result.exemption)} | Taxable: ${fmt(result.taxable)}`
        : null,
    }),
    tax: () => ({
      text: `Based on gross income of ${fmt(result?.gross || 0)} and applicable deductions, the taxable income under ${String(result?.regime || 'new').toUpperCase()} regime is ${fmt(result?.taxableIncome || 0)}. The effective tax rate indicates overall tax efficiency.`,
      decisionGap: result?.taxLiability
        ? `Total tax liability: ${fmt(result.taxLiability)} (${Number(result?.effectiveRatePercent || 0).toFixed(2)}% effective rate)`
        : null,
    }),
    rd: () => ({
      text: `Monthly RD deposits of ${fmt(inputs?.monthly || 0)} at ${inputs?.rate || 0}% interest compound quarterly to give the maturity amount. RD is a low-risk savings instrument.`,
      decisionGap: result?.maturityAmount && result?.totalDeposits
        ? `Interest earned: ${fmt(result.maturityAmount - result.totalDeposits)}`
        : null,
    }),
    ssy: () => ({
      text: `Sukanya Samriddhi Yojana contributions at current 8.2% rate accumulate until the girl child turns 21. Deposits are allowed until age 15. The scheme offers EEE tax benefits.`,
      decisionGap: result?.maturityValue && result?.totalInvested
        ? `Tax-free maturity: ${fmt(result.maturityValue)}`
        : null,
    }),
    childPlan: () => ({
      text: `Planning for child's education requires estimating future costs with inflation. The corpus needed depends on current age, education start age, and expected annual education cost.`,
      decisionGap: result?.corpusRequired
        ? `Education fund target: ${fmt(result.corpusRequired)}`
        : null,
    }),
    marriage: () => ({
      text: `Marriage fund planning accounts for inflation in wedding costs. Starting early allows smaller monthly contributions to reach the target corpus.`,
      decisionGap: result?.corpusRequired
        ? `Marriage fund target: ${fmt(result.corpusRequired)}`
        : null,
    }),
    carLoan: () => ({
      text: `Car loan EMI calculation shows the monthly payment for the loan amount at the specified interest rate and tenure. Total cost includes principal plus interest.`,
      decisionGap: result?.totalInterest
        ? `Total interest paid: ${fmt(result.totalInterest)}`
        : null,
    }),
    homeLoan: () => ({
      text: `Home loan EMI is calculated using standard reducing balance method. Over longer tenures, total interest paid can exceed the principal amount borrowed.`,
      decisionGap: result?.totalInterest
        ? `Total interest cost: ${fmt(result.totalInterest)} over ${inputs?.years || 0} years`
        : null,
    }),
    gold: () => ({
      text: `Gold investment returns depend on holding period and gold price appreciation. Sovereign Gold Bonds (SGBs) offer additional 2.5% interest and tax-free capital gains at maturity.`,
      decisionGap: result?.futureValue && result?.invested
        ? `Projected value: ${fmt(result.futureValue)}`
        : null,
    }),
  };

  const fn = interpretations[calcKey];
  return fn ? fn() : null;
};

// ════════════════════════════════════════════════════════════════
// CALCULATION FUNCTIONS
// ════════════════════════════════════════════════════════════════

const calculations = {
  sip: (monthly, years, rateMid, stepUpPercent = 0, rateLow = 10, rateHigh = 14, goalAmount = 0, inflationRate = 6) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // ENHANCED SIP CALCULATOR
    // Step-up SIP • Multi-scenario projections • Goal mapping • Inflation adjustment
    // ═══════════════════════════════════════════════════════════════════════════
    const months = Math.max(1, Math.round((years || 0) * 12));
    const stepUp = Math.max(0, stepUpPercent || 0) / 100;
    const inflation = Math.max(0, inflationRate || 0) / 100;
    const goal = Math.max(0, goalAmount || 0);

    const simulate = (annualRate) => {
      const r = Math.max(-0.99, (annualRate || 0) / 100) / 12;
      let value = 0;
      let invested = 0;
      let mSip = Math.max(0, monthly || 0);
      const schedule = [];
      const yearlyData = [];

      for (let m = 1; m <= months; m++) {
        value = (value + mSip) * (1 + r);
        invested += mSip;
        
        if (m % 12 === 0) {
          const yearNum = m / 12;
          yearlyData.push({
            year: yearNum,
            totalInvested: invested,
            endValue: value,
            monthlySIP: mSip,
            gains: value - invested,
            gainsPercent: invested > 0 ? ((value - invested) / invested) * 100 : 0,
          });
          schedule.push({
            year: yearNum,
            totalInvested: invested,
            endValue: value,
            monthlySIP: mSip,
          });
          mSip = mSip * (1 + stepUp);
        }
      }

      return { invested, value, schedule, yearlyData };
    };

    const low = simulate(rateLow);
    const mid = simulate(rateMid);
    const high = simulate(rateHigh);

    // Detailed schedule with all scenarios
    const schedule = mid.schedule.map((row, idx) => ({
      year: row.year,
      monthlySIP: row.monthlySIP,
      totalInvested: row.totalInvested,
      endValueLow: low.schedule[idx]?.endValue ?? low.value,
      endValueMid: row.endValue,
      endValueHigh: high.schedule[idx]?.endValue ?? high.value,
    }));

    // Goal analysis
    let goalAchievementYear = null;
    let sipNeededForGoal = 0;
    if (goal > 0) {
      // Find when goal is achieved in mid scenario
      for (const row of mid.yearlyData) {
        if (row.endValue >= goal) {
          goalAchievementYear = row.year;
          break;
        }
      }
      // Calculate SIP needed for goal
      const r = (rateMid || 12) / 100 / 12;
      const n = months;
      sipNeededForGoal = goal * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
    }

    // Inflation-adjusted future value
    const inflationAdjustedValue = mid.value / Math.pow(1 + inflation, years);

    // XIRR approximation for step-up SIP
    const totalReturns = mid.value - mid.invested;
    const avgInvestmentPeriod = years / 2; // Approximate
    const approximateXIRR = mid.invested > 0 
      ? (Math.pow(mid.value / mid.invested, 1 / avgInvestmentPeriod) - 1) * 100 
      : 0;

    // Wealth gain multiplier
    const wealthMultiplier = mid.invested > 0 ? mid.value / mid.invested : 0;

    // Monthly SIP progression for step-up
    const sipProgression = [];
    let currentSip = monthly;
    for (let yr = 1; yr <= years; yr++) {
      sipProgression.push({ year: yr, sip: Math.round(currentSip) });
      currentSip *= (1 + stepUp);
    }

    return {
      __type: 'sip',
      years,
      stepUpPercent,
      rateLow,
      rateMid,
      rateHigh,
      initialSIP: monthly,
      finalSIP: Math.round(monthly * Math.pow(1 + stepUp, years - 1)),
      invested: mid.invested,
      // Multi-scenario values
      futureValueLow: low.value,
      futureValueMid: mid.value,
      futureValueHigh: high.value,
      returnsLow: low.value - low.invested,
      returnsMid: mid.value - mid.invested,
      returnsHigh: high.value - high.invested,
      // Returns metrics
      absoluteReturnPercent: mid.invested > 0 ? ((mid.value - mid.invested) / mid.invested) * 100 : 0,
      approximateXIRR,
      wealthMultiplier,
      // Inflation adjusted
      inflationRate,
      inflationAdjustedValue,
      realReturns: inflationAdjustedValue - mid.invested,
      // Goal analysis
      goalAmount: goal,
      goalAchievementYear,
      sipNeededForGoal: Math.ceil(sipNeededForGoal),
      goalShortfall: goal > 0 && mid.value < goal ? goal - mid.value : 0,
      goalSurplus: goal > 0 && mid.value >= goal ? mid.value - goal : 0,
      // Schedules
      schedule,
      sipProgression,
    };
  },

  lumpsum: (principal, years, rate) => {
    const fv = principal * Math.pow(1 + rate / 100, years);
    return { invested: principal, futureValue: fv, returns: fv - principal, cagr: rate };
  },

  goal: (target, years, rate) => {
    const n = years * 12;
    const r = rate / 100 / 12;
    const sip = target * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
    const invested = sip * n;
    return { invested, futureValue: target, returns: target - invested, monthlySIP: Math.ceil(sip) };
  },

  retire: (monthlyExpense, currentAge, retireAge) => {
    const years = retireAge - currentAge;
    const retireYears = 85 - retireAge;
    const futureExpense = monthlyExpense * Math.pow(1.06, years);
    const corpus = futureExpense * 12 * retireYears * 1.3;
    const n = years * 12;
    const r = 0.12 / 12;
    const sip = corpus * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
    return { corpus, monthlySIP: Math.ceil(sip), futureExpense: Math.round(futureExpense) };
  },

  fd: (principal, years, rate) => {
    const n = 4 * years; // Quarterly compounding
    const r = rate / 100 / 4;
    const fv = principal * Math.pow(1 + r, n);
    return { invested: principal, maturityValue: fv, interestEarned: fv - principal };
  },

  insurance: (
    insuranceType = 'term',
    age,
    gender = 'male',
    pincode = 400001,
    // Lifestyle & Health
    smoker = 'no',
    alcohol = 'none',
    exercise = 'moderate',
    heightCm = 170,
    weightKg = 70,
    healthCondition = 'good',
    familyHistory = 'none',
    occupation = 'office',
    // Income & Financial
    monthlyIncome,
    monthlyExpenses = 40000,
    annualTaxes = 200000,
    retirementAge = 60,
    policyTerm = 30,
    inflationRate = 6,
    // Liabilities
    homeLoan = 0,
    carLoan = 0,
    businessLoan = 0,
    otherLiabilities = 0,
    // Family
    maritalStatus = 'married',
    spouseWorking = 'no',
    spouseIncome = 0,
    dependents = 2,
    childCount = 1,
    elderlyParents = 2,
    hasSpecialNeeds = 'no',
    specialNeedsFund = 0,
    // Goals
    childEduCostToday = 2500000,
    eduInYears = 12,
    marriageFund = 1500000,
    retirementCorpusGap = 0,
    // Existing
    existingCover = 0,
    employerCover = 0,
    existingHealthCover = 0,
    // Buffers
    finalExpenses = 500000,
    emergencyFundMonths = 6,
    // Riders
    wantAccidentalDeath = 'yes',
    wantCriticalIllness = 'yes',
    wantWaiverOfPremium = 'yes',
    wantIncomeProtection = 'no',
    // Payout
    payoutType = 'lumpsum',
    premiumFrequency = 'annual',
    // Health Insurance specific
    healthCoverType = 'individual',
    familyMembers = 2,
    city = 'metro',
    // Critical Illness specific
    ciCover = 2500000
  ) => {
    const a = Math.max(18, Math.min(65, age || 30));
    const ra = Math.max(a + 5, retirementAge || 60);
    const yearsToRetire = Math.max(5, ra - a);
    const mi = Math.max(0, monthlyIncome || 0);
    const annualIncome = mi * 12;
    const infl = Math.min(20, Math.max(0, inflationRate || 0)) / 100;
    const term = Math.min(40, Math.max(5, policyTerm || 30));

    // Calculate BMI
    const heightM = (heightCm || 170) / 100;
    const bmi = (weightKg || 70) / (heightM * heightM);
    const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

    // ═══════════════════════════════════════════════════════════════
    // HUMAN LIFE VALUE (HLV) CALCULATION
    // HLV = (Annual Income – Personal Expenses – Taxes) × Remaining Working Years
    // ═══════════════════════════════════════════════════════════════
    const annualExpenses = (monthlyExpenses || 40000) * 12;
    const netContribution = annualIncome - annualExpenses - (annualTaxes || 0);
    const basicHLV = netContribution * yearsToRetire;
    
    // Present value of future income (discounted at inflation rate)
    const discountRate = 0.08; // 8% discount rate
    const pvFactor = (1 - Math.pow(1 + discountRate, -yearsToRetire)) / discountRate;
    const hlvPresentValue = netContribution * pvFactor;

    // Year-by-year income projection
    const incomeProjection = [];
    let cumulativeIncome = 0;
    for (let year = 1; year <= Math.min(yearsToRetire, 30); year++) {
      const futureIncome = annualIncome * Math.pow(1.05, year - 1); // 5% annual increment
      cumulativeIncome += futureIncome;
      incomeProjection.push({
        year,
        age: a + year,
        projectedIncome: futureIncome,
        cumulativeIncome,
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // INSURER DATA WITH CSR (Claim Settlement Ratio) + BUY NOW URLS + FEATURES
    // Comprehensive data matching Policybazaar, InsuranceDekho, HDFC, ICICI
    // ═══════════════════════════════════════════════════════════════
    const insurerData = [
      { 
        name: 'LIC', logo: '🏛️', csr: 98.62, rating: 'AAA', minCover: 500000, basePremiumFactor: 1.15, solvency: 185.92, 
        buyUrl: 'https://licindia.in/buy-online', color: '#1a237e',
        planName: 'Tech Term', maxAge: 65, maxCoverAge: 80, maxSumAssured: 'Unlimited',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: true, increasingCover: false, monthlyPayout: true, jointLife: false,
          gracePeriod: 30, freeReview: 15, premiumHoliday: false, immediatePayout: false,
          onlineDiscount: 0, premiumDelay: false, healthBenefits: false, 
        }
      },
      { 
        name: 'HDFC Life', logo: '🏦', csr: 99.07, rating: 'AAA', minCover: 1000000, basePremiumFactor: 1.0, solvency: 187.00, 
        buyUrl: 'https://www.hdfclife.com/term-insurance-plans/click-2-protect-super', color: '#004c8c',
        planName: 'Click 2 Protect Supreme', maxAge: 65, maxCoverAge: 85, maxSumAssured: 'Unlimited',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: true, increasingCover: true, monthlyPayout: true, jointLife: true,
          gracePeriod: 30, freeReview: 30, premiumHoliday: true, immediatePayout: true,
          onlineDiscount: 15, premiumDelay: true, healthBenefits: true,
          highlight: 'Free health benefits up to ₹63,000/year',
        }
      },
      { 
        name: 'ICICI Prudential', logo: '🔵', csr: 97.90, rating: 'AAA', minCover: 1000000, basePremiumFactor: 0.98, solvency: 212.70, 
        buyUrl: 'https://www.iciciprulife.com/term-insurance/iprotect-smart.html', color: '#f57c00',
        planName: 'iProtect Smart Plus', maxAge: 65, maxCoverAge: 99, maxSumAssured: '20 Cr',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: true, increasingCover: true, monthlyPayout: true, jointLife: true,
          gracePeriod: 30, freeReview: 15, premiumHoliday: true, immediatePayout: true,
          onlineDiscount: 15, premiumDelay: true, healthBenefits: false,
          highlight: '₹3 Lakh immediate payout on claim',
        }
      },
      { 
        name: 'Max Life', logo: '🔴', csr: 99.51, rating: 'AAA', minCover: 1000000, basePremiumFactor: 1.02, solvency: 194.00, 
        buyUrl: 'https://www.maxlifeinsurance.com/term-insurance-plans/smart-secure-plus', color: '#c62828',
        planName: 'Smart Secure Plus', maxAge: 60, maxCoverAge: 85, maxSumAssured: '25 Cr',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: true, increasingCover: true, monthlyPayout: true, jointLife: false,
          gracePeriod: 30, freeReview: 15, premiumHoliday: false, immediatePayout: false,
          onlineDiscount: 10, premiumDelay: false, healthBenefits: true,
          highlight: 'Highest CSR (99.51%) in industry',
        }
      },
      { 
        name: 'SBI Life', logo: '🟢', csr: 95.03, rating: 'AAA', minCover: 500000, basePremiumFactor: 1.05, solvency: 211.00, 
        buyUrl: 'https://www.sbilife.co.in/en/term-insurance/eterm', color: '#2e7d32',
        planName: 'Smart Shield Plus', maxAge: 65, maxCoverAge: 79, maxSumAssured: 'Unlimited',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: true, increasingCover: false, monthlyPayout: true, jointLife: false,
          gracePeriod: 30, freeReview: 15, premiumHoliday: false, immediatePayout: false,
          onlineDiscount: 15, premiumDelay: false, healthBenefits: false,
          highlight: 'Backed by SBI, trusted by millions',
        }
      },
      { 
        name: 'Tata AIA', logo: '🟡', csr: 98.54, rating: 'AAA', minCover: 1000000, basePremiumFactor: 0.95, solvency: 220.00, 
        buyUrl: 'https://www.tataaia.com/online-term-plan/sampoorna-raksha-supreme', color: '#1565c0',
        planName: 'Sampoorna Raksha Promise', maxAge: 65, maxCoverAge: 100, maxSumAssured: 'Unlimited',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: true, increasingCover: true, monthlyPayout: true, jointLife: true,
          gracePeriod: 30, freeReview: 30, premiumHoliday: true, immediatePayout: true,
          onlineDiscount: 15, premiumDelay: true, healthBenefits: true,
          highlight: '₹3 Lakh immediate payout, 100 years cover',
        }
      },
      { 
        name: 'Bajaj Allianz', logo: '🔷', csr: 98.02, rating: 'AAA', minCover: 1000000, basePremiumFactor: 0.97, solvency: 584.00, 
        buyUrl: 'https://www.bajajallianzlife.com/life-insurance-plans/term-insurance/etouch.html', color: '#0277bd',
        planName: 'eTouch II', maxAge: 65, maxCoverAge: 85, maxSumAssured: 'Unlimited',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: true, increasingCover: false, monthlyPayout: true, jointLife: false,
          gracePeriod: 30, freeReview: 30, premiumHoliday: false, immediatePayout: true,
          onlineDiscount: 15, premiumDelay: true, healthBenefits: true,
          highlight: 'Free health benefits up to ₹31,000/year',
        }
      },
      { 
        name: 'Kotak Life', logo: '🟠', csr: 98.89, rating: 'AAA', minCover: 1000000, basePremiumFactor: 1.03, solvency: 239.00, 
        buyUrl: 'https://www.kotaklife.com/online-plans/term-insurance/e-term-plan', color: '#ef6c00',
        planName: 'e-Term', maxAge: 65, maxCoverAge: 75, maxSumAssured: '5 Cr',
        features: {
          terminalIllness: true, waiverOfPremium: true, accidentalDeath: true, criticalIllness: true,
          returnOfPremium: false, increasingCover: false, monthlyPayout: true, jointLife: false,
          gracePeriod: 30, freeReview: 15, premiumHoliday: false, immediatePayout: false,
          onlineDiscount: 0, premiumDelay: false, healthBenefits: false,
          highlight: 'Simple, affordable term plan',
        }
      },
    ];

    // ═══════════════════════════════════════════════════════════════
    // POLICY FEATURE COMPARISON MATRIX (Competitor Advantage)
    // Shows features BM Wealth has that competitors may not
    // ═══════════════════════════════════════════════════════════════
    const policyFeatures = [
      { feature: 'Terminal Illness Early Payout', desc: '100% payout on terminal illness diagnosis', key: 'terminalIllness' },
      { feature: 'Waiver of Premium', desc: 'Future premiums waived on disability', key: 'waiverOfPremium' },
      { feature: 'Accidental Death Benefit', desc: 'Additional sum on accidental death', key: 'accidentalDeath' },
      { feature: 'Critical Illness Rider', desc: 'Lump sum on critical illness diagnosis', key: 'criticalIllness' },
      { feature: 'Return of Premium', desc: 'Get all premiums back if you survive', key: 'returnOfPremium' },
      { feature: 'Increasing Cover', desc: 'Sum assured increases annually (5-10%)', key: 'increasingCover' },
      { feature: 'Monthly Payout Option', desc: 'Death benefit as monthly income', key: 'monthlyPayout' },
      { feature: 'Joint Life Cover', desc: 'Cover for spouse in same policy', key: 'jointLife' },
      { feature: 'Premium Holiday', desc: 'Skip premiums for up to 12 months', key: 'premiumHoliday' },
      { feature: 'Immediate Payout', desc: '₹2-3 Lakh immediate on claim intimation', key: 'immediatePayout' },
      { feature: 'Premium Delay Benefit', desc: 'Defer premium for 12 months', key: 'premiumDelay' },
      { feature: 'Free Health Benefits', desc: 'OPD, tele-consultation, health checkups', key: 'healthBenefits' },
    ];

    // Base pricing per crore (industry standard 2025)
    const basePremiumRates = {
      term: 8000,        // Term life per Cr/year
      wholeLife: 42000,  // Whole life per Cr/year
      ulip: 32000,       // ULIP per Cr/year
      health: 16000,     // Health per 10L/year (base)
      critical: 6000,    // CI per 25L/year
    };

    // ═══════════════════════════════════════════════════════════════
    // PREMIUM FACTOR CALCULATIONS
    // ═══════════════════════════════════════════════════════════════
    
    // Age-based multiplier (actuarial tables 2025)
    const getAgeFactor = (age, type) => {
      if (type === 'health' || type === 'critical') {
        if (age <= 25) return 0.7;
        if (age <= 30) return 0.85;
        if (age <= 35) return 1.0;
        if (age <= 40) return 1.25;
        if (age <= 45) return 1.55;
        if (age <= 50) return 2.0;
        if (age <= 55) return 2.6;
        return 3.5;
      }
      // Term/Life
      if (age <= 25) return 0.60;
      if (age <= 28) return 0.80;
      if (age <= 30) return 1.0;
      if (age <= 33) return 1.15;
      if (age <= 35) return 1.30;
      if (age <= 38) return 1.50;
      if (age <= 40) return 1.75;
      if (age <= 43) return 2.10;
      if (age <= 45) return 2.50;
      if (age <= 48) return 3.00;
      if (age <= 50) return 3.60;
      if (age <= 55) return 4.50;
      return 6.00;
    };

    // Smoker factor (enhanced)
    const smokerFactor = {
      'no': 1.0,
      'occasional': 1.25,
      'yes': 1.65,
    }[smoker] || 1.0;

    // Alcohol factor
    const alcoholFactor = {
      'none': 1.0,
      'social': 1.0,
      'moderate': 1.10,
      'heavy': 1.35,
    }[alcohol] || 1.0;

    // Exercise factor (discount for active lifestyle)
    const exerciseFactor = {
      'none': 1.10,
      'light': 1.0,
      'moderate': 0.95,
      'active': 0.90,
    }[exercise] || 1.0;

    // BMI factor
    const getBmiFactor = () => {
      if (bmi < 18.5) return 1.10;  // Underweight
      if (bmi < 25) return 1.0;     // Normal
      if (bmi < 30) return 1.15;    // Overweight
      if (bmi < 35) return 1.30;    // Obese Class 1
      return 1.50;                   // Obese Class 2+
    };
    const bmiFactor = getBmiFactor();

    // Family history factor
    const familyHistoryFactor = {
      'none': 1.0,
      'some': 1.12,
      'significant': 1.30,
    }[familyHistory] || 1.0;

    const genderFactor = String(gender).toLowerCase() === 'female' ? 0.88 : 1.0;
    
    const healthFactor = {
      excellent: 0.88,
      good: 1.0,
      average: 1.18,
      poor: 1.55,
    }[healthCondition] || 1.0;
    
    const occupationFactor = {
      office: 1.0,
      field: 1.08,
      medical: 1.05,
      govt: 0.98,
      hazardous: 1.45,
      extreme: 1.85,
    }[occupation] || 1.0;

    // Premium frequency loading
    const frequencyLoading = {
      'monthly': 1.05,
      'quarterly': 1.03,
      'halfyearly': 1.02,
      'annual': 1.0,
    }[premiumFrequency] || 1.0;

    // City factor for health insurance
    const cityFactor = {
      'metro': 1.15,
      'tier1': 1.05,
      'tier2': 0.95,
      'tier3': 0.85,
    }[city] || 1.0;

    const type = String(insuranceType).toLowerCase();
    let result = {};

    if (type === 'term' || type === 'wholelife' || type === 'ulip') {
      // ═══════════════════════════════════════════════════════════════
      // LIFE INSURANCE CALCULATION (ENHANCED)
      // ═══════════════════════════════════════════════════════════════
      
      // Total liabilities
      const totalLiabilities = (homeLoan || 0) + (carLoan || 0) + (businessLoan || 0) + (otherLiabilities || 0);
      
      // Income replacement (using HLV method)
      const incomeReplacementNeed = hlvPresentValue;
      
      // Emergency fund
      const emergencyFund = mi * emergencyFundMonths;
      
      // Child education (inflation-adjusted)
      const kids = Math.max(0, Math.round(childCount || 0));
      const eduYears = Math.max(0, eduInYears || 0);
      const eduToday = Math.max(0, childEduCostToday || 0);
      const childEduFuturePerChild = eduToday * Math.pow(1 + infl, eduYears);
      const childEducation = kids * childEduFuturePerChild;
      
      // Marriage fund (inflation-adjusted)
      const marriageFundInflated = (marriageFund || 0) * Math.pow(1 + infl, 15);
      
      // Elderly parent care
      const elderlyCareFund = (elderlyParents || 0) * 300000;
      
      // Special needs provision
      const specialNeedsFundAmt = hasSpecialNeeds === 'yes' ? Math.max(specialNeedsFund || 5000000, 5000000) : 0;
      
      // Spouse protection (if not working)
      const spouseProtection = maritalStatus === 'married' && spouseWorking === 'no' ? mi * 12 * 10 : 0;
      
      // Retirement corpus gap
      const retirementGap = Math.max(0, retirementCorpusGap || 0);
      
      // Final expenses
      const finalCost = Math.max(0, finalExpenses || 0);

      // Existing coverage
      const existing = Math.max(0, existingCover || 0) + Math.max(0, employerCover || 0);

      // Total need calculation
      const totalNeed = incomeReplacementNeed + totalLiabilities + childEducation + marriageFundInflated + 
                       emergencyFund + finalCost + elderlyCareFund + specialNeedsFundAmt + 
                       spouseProtection + retirementGap;
      const rawCover = Math.max(0, totalNeed - existing);

      const roundTo = (n, step) => Math.ceil(n / step) * step;
      const recommendedCover = roundTo(rawCover, 500000);
      const coverLow = Math.max(0, roundTo(recommendedCover * 0.85, 500000));
      const coverHigh = roundTo(recommendedCover * 1.2, 500000);

      // Calculate coverage multiple
      const coverageMultiple = annualIncome > 0 ? recommendedCover / annualIncome : 0;

      // Calculate premium for each insurer
      const ageFactor = getAgeFactor(a, 'term');
      const baseRate = basePremiumRates[type] || basePremiumRates.term;
      const totalFactor = ageFactor * smokerFactor * genderFactor * healthFactor * 
                         occupationFactor * bmiFactor * familyHistoryFactor * 
                         alcoholFactor * exerciseFactor;

      const insurerQuotes = insurerData.map(insurer => {
        const cr = recommendedCover / 10000000;
        const annualPremium = Math.max(4000, cr * baseRate * totalFactor * insurer.basePremiumFactor);
        const adjustedPremium = annualPremium * frequencyLoading;
        return {
          ...insurer,
          cover: recommendedCover,
          annualPremium: Math.round(annualPremium),
          adjustedPremium: Math.round(adjustedPremium),
          monthlyPremium: Math.round(adjustedPremium / 12),
          premiumPerLakh: Math.round((annualPremium / (recommendedCover / 100000)) * 100) / 100,
        };
      }).sort((a, b) => a.annualPremium - b.annualPremium);

      const lowestPremium = insurerQuotes[0]?.annualPremium || 0;
      const highestPremium = insurerQuotes[insurerQuotes.length - 1]?.annualPremium || 0;
      const avgPremium = insurerQuotes.reduce((sum, q) => sum + q.annualPremium, 0) / insurerQuotes.length;

      // Rider calculations
      const riders = [];
      const riderCosts = { total: 0 };

      if (wantAccidentalDeath === 'yes') {
        const adbCost = Math.round(avgPremium * 0.08);
        riders.push({ 
          name: 'Accidental Death Benefit', 
          selected: true,
          cost: adbCost, 
          cover: recommendedCover,
          desc: 'Additional sum assured on accidental death',
          benefit: `Extra ${fmt(recommendedCover)} on accidental death`
        });
        riderCosts.total += adbCost;
      }

      if (wantCriticalIllness === 'yes') {
        const ciAmount = Math.min(recommendedCover * 0.25, 5000000);
        const ciCost = Math.round(ciAmount / 100000 * 650 * ageFactor);
        riders.push({ 
          name: 'Critical Illness Rider', 
          selected: true,
          cost: ciCost, 
          cover: ciAmount,
          desc: 'Lump sum on diagnosis of 30+ critical illnesses',
          benefit: `${fmt(ciAmount)} on CI diagnosis`
        });
        riderCosts.total += ciCost;
      }

      if (wantWaiverOfPremium === 'yes') {
        const wopCost = Math.round(avgPremium * 0.05);
        riders.push({ 
          name: 'Waiver of Premium', 
          selected: true,
          cost: wopCost, 
          cover: 'N/A',
          desc: 'Future premiums waived if permanently disabled',
          benefit: 'Premiums waived on disability'
        });
        riderCosts.total += wopCost;
      }

      if (wantIncomeProtection === 'yes') {
        const monthlyPayout = Math.round(recommendedCover / 120); // 10 years payout
        const ipCost = Math.round(avgPremium * 0.12);
        riders.push({ 
          name: 'Income Protection Rider', 
          selected: true,
          cost: ipCost, 
          cover: monthlyPayout * 120,
          desc: 'Monthly income to family for 10 years post death',
          benefit: `${fmt(monthlyPayout)}/month for 10 years`
        });
        riderCosts.total += ipCost;
      }

      // Add optional riders
      if (kids > 0) {
        riders.push({ 
          name: 'Child Term Rider', 
          selected: false,
          cost: 2500 * kids, 
          cover: 1000000 * kids,
          desc: `Cover for ${kids} child(ren) until age 25`,
          benefit: `${fmt(1000000)} per child`
        });
      }

      riders.push({ 
        name: 'Terminal Illness Benefit', 
        selected: false,
        cost: Math.round(avgPremium * 0.03),
        cover: recommendedCover,
        desc: 'Advance payout if diagnosed with terminal illness',
        benefit: 'Up to 100% of sum assured in advance'
      });

      // Payout structure based on preference
      let payoutStructure = {};
      if (payoutType === 'lumpsum') {
        payoutStructure = {
          type: 'Lump Sum',
          description: 'Entire sum assured paid at once',
          benefit: fmt(recommendedCover),
        };
      } else if (payoutType === 'monthly') {
        const monthlyPayout = Math.round(recommendedCover / 180); // 15 years
        payoutStructure = {
          type: 'Monthly Income',
          description: 'Fixed monthly income for 15 years',
          benefit: `${fmt(monthlyPayout)}/month for 15 years`,
          totalPayout: fmt(monthlyPayout * 180),
        };
      } else {
        const lumpPortion = Math.round(recommendedCover * 0.4);
        const monthlyPayout = Math.round((recommendedCover * 0.6) / 120);
        payoutStructure = {
          type: 'Lump Sum + Monthly Income',
          description: '40% lump sum + 60% as monthly income for 10 years',
          lumpSum: fmt(lumpPortion),
          monthlyBenefit: `${fmt(monthlyPayout)}/month for 10 years`,
        };
      }

      // Tax savings under 80C/80D
      const taxDeduction80C = Math.min(avgPremium + riderCosts.total, 150000);
      const taxSaved = taxDeduction80C * 0.30; // Assuming 30% slab

      // Checklist based on inputs
      const checklist = [
        '✓ Pure term insurance provides maximum coverage per rupee',
        '✓ Policy term should extend till retirement age (60-65)',
        bmi >= 25 ? '⚠️ BMI indicates overweight - may affect premium and underwriting' : '✓ BMI is in healthy range',
        smoker === 'yes' ? '⚠️ Smokers pay 50-65% higher premium - quitting can reduce costs after 1-2 years' : '✓ Non-smoker discount applied',
        familyHistory === 'significant' ? '⚠️ Family history may require medical tests and affect pricing' : null,
        totalLiabilities > annualIncome * 3 ? '⚠️ High liabilities - ensure adequate debt coverage' : null,
        employerCover > 0 ? `ℹ️ Employer cover (${fmt(employerCover)}) may lapse on job change` : null,
        '✓ Compare CSR (Claim Settlement Ratio) across insurers',
        '✓ Disclose all health conditions honestly to avoid claim rejection',
        '✓ Keep health insurance separate from life cover',
        '✓ Review cover every 3-5 years or after major life events',
        '✓ Store policy documents securely and inform nominee',
        '✓ Consider laddering: buy multiple policies at different ages',
      ].filter(Boolean);

      // Life expectancy estimate (for retirement planning context)
      const lifeExpectancy = gender === 'male' ? 72 : 75;
      const postRetirementYears = lifeExpectancy - ra;

      // ═══════════════════════════════════════════════════════════════
      // ULIP / ENDOWMENT MATURITY CALCULATIONS
      // ═══════════════════════════════════════════════════════════════
      let ulipMaturity = null;
      let maturityProjection = [];
      
      if (type === 'ulip' || type === 'wholelife') {
        const premiumPerYear = Math.round(avgPremium);
        const policyYears = Math.min(term, 30);
        const premiumPayingTerm = Math.min(term, 15); // PPT typically 10-15 years
        
        // ULIP charges (industry standard)
        const premiumAllocationCharge = 0.05; // 5% of premium
        const fundManagementCharge = 0.0135; // 1.35% per annum
        const policyAdminCharge = 500; // ₹500/month = ₹6000/year
        const mortalityCharge = avgPremium * 0.02; // ~2% mortality deduction
        
        // Fund return scenarios
        const fundReturns = { low: 0.08, mid: 0.10, high: 0.12 };
        
        // Calculate year-by-year fund value
        const calculateULIPFund = (returnRate) => {
          let fundValue = 0;
          const yearlyData = [];
          
          for (let year = 1; year <= policyYears; year++) {
            // Premium allocation (only during PPT)
            const premiumThisYear = year <= premiumPayingTerm ? premiumPerYear : 0;
            const allocatedPremium = premiumThisYear * (1 - premiumAllocationCharge);
            
            // Add to fund
            fundValue += allocatedPremium;
            
            // Deduct charges
            fundValue -= policyAdminCharge;
            fundValue -= mortalityCharge;
            
            // Apply fund returns
            fundValue = fundValue * (1 + returnRate - fundManagementCharge);
            fundValue = Math.max(0, fundValue);
            
            yearlyData.push({
              year,
              age: a + year,
              premiumPaid: premiumThisYear,
              fundValue: Math.round(fundValue),
              cumulativePremium: Math.round(premiumPerYear * Math.min(year, premiumPayingTerm)),
            });
          }
          
          return { fundValue: Math.round(fundValue), yearlyData };
        };
        
        const lowScenario = calculateULIPFund(fundReturns.low);
        const midScenario = calculateULIPFund(fundReturns.mid);
        const highScenario = calculateULIPFund(fundReturns.high);
        
        const totalPremiumPaid = premiumPerYear * premiumPayingTerm;
        
        // XIRR-like return calculation
        const calculateIRR = (finalValue, annualPayment, years) => {
          const totalInvested = annualPayment * Math.min(years, premiumPayingTerm);
          if (totalInvested <= 0 || finalValue <= 0) return 0;
          // Approximate IRR using CAGR formula for regular payments
          const avgYears = (years + 1) / 2; // average holding period
          const irr = Math.pow(finalValue / totalInvested, 1 / avgYears) - 1;
          return Math.max(0, irr * 100);
        };
        
        ulipMaturity = {
          policyTerm: policyYears,
          premiumPayingTerm,
          annualPremium: premiumPerYear,
          totalPremiumPaid,
          
          // Fund values at maturity
          fundValueLow: lowScenario.fundValue,
          fundValueMid: midScenario.fundValue,
          fundValueHigh: highScenario.fundValue,
          
          // Returns
          irrLow: calculateIRR(lowScenario.fundValue, premiumPerYear, policyYears).toFixed(1),
          irrMid: calculateIRR(midScenario.fundValue, premiumPerYear, policyYears).toFixed(1),
          irrHigh: calculateIRR(highScenario.fundValue, premiumPerYear, policyYears).toFixed(1),
          
          // Wealth gain
          wealthGainMid: midScenario.fundValue - totalPremiumPaid,
          wealthMultiple: (midScenario.fundValue / totalPremiumPaid).toFixed(2),
          
          // Fund options (typical ULIP)
          fundOptions: [
            { name: 'Equity Fund', allocation: 80, expectedReturn: '10-14%', risk: 'High' },
            { name: 'Balanced Fund', allocation: 60, expectedReturn: '8-11%', risk: 'Medium' },
            { name: 'Debt Fund', allocation: 20, expectedReturn: '6-8%', risk: 'Low' },
            { name: 'Money Market', allocation: 10, expectedReturn: '4-6%', risk: 'Very Low' },
          ],
          
          // Charges breakdown
          charges: {
            premiumAllocation: `${(premiumAllocationCharge * 100).toFixed(0)}%`,
            fundManagement: `${(fundManagementCharge * 100).toFixed(2)}% p.a.`,
            policyAdmin: `₹${policyAdminCharge}/year`,
            mortality: `~₹${Math.round(mortalityCharge)}/year`,
          },
          
          // Key milestones
          milestones: [
            { year: 5, label: 'Lock-in Ends', fundValue: midScenario.yearlyData[4]?.fundValue || 0 },
            { year: 10, label: 'Mid-Term', fundValue: midScenario.yearlyData[9]?.fundValue || 0 },
            { year: premiumPayingTerm, label: 'PPT Ends', fundValue: midScenario.yearlyData[premiumPayingTerm - 1]?.fundValue || 0 },
            { year: policyYears, label: 'Maturity', fundValue: midScenario.fundValue },
          ].filter(m => m.year <= policyYears),
        };
        
        // Store projection for chart
        maturityProjection = midScenario.yearlyData.filter((_, idx) => 
          idx === 0 || idx === 4 || idx === 9 || idx === 14 || idx === 19 || idx === midScenario.yearlyData.length - 1
        );
      }

      result = {
        __type: 'insurance',
        insuranceType: type === 'term' ? 'Term Life' : type === 'wholelife' ? 'Whole Life' : 'ULIP',
        
        // HLV Analysis
        hlv: {
          basicHLV,
          presentValue: hlvPresentValue,
          netAnnualContribution: netContribution,
          yearsToRetire,
          incomeProjection: incomeProjection.slice(0, 10), // First 10 years
          formula: 'HLV = (Annual Income – Expenses – Taxes) × Working Years',
        },
        
        // BMI Analysis
        bmiAnalysis: {
          bmi: Math.round(bmi * 10) / 10,
          category: bmiCategory,
          heightCm,
          weightKg,
          impact: bmiFactor > 1.0 ? `+${Math.round((bmiFactor - 1) * 100)}% premium loading` : 'No additional loading',
        },
        
        // Coverage
        recommendedCover,
        coverLow,
        coverHigh,
        coverageMultiple: Math.round(coverageMultiple * 10) / 10,
        
        // Premium comparison
        insurerQuotes,
        lowestPremium,
        highestPremium,
        averagePremium: Math.round(avgPremium),
        premiumRange: `${fmt(lowestPremium)} – ${fmt(highestPremium)}`,
        
        // Adjusted for frequency
        annualPremiumLow: Math.round(lowestPremium * frequencyLoading),
        annualPremiumMid: Math.round(avgPremium * frequencyLoading),
        annualPremiumHigh: Math.round(highestPremium * frequencyLoading),
        monthlyPremiumLow: Math.round(lowestPremium * frequencyLoading / 12),
        monthlyPremiumMid: Math.round(avgPremium * frequencyLoading / 12),
        monthlyPremiumHigh: Math.round(highestPremium * frequencyLoading / 12),
        
        policyTerm: term,
        premiumFrequency,
        
        // Coverage breakdown
        breakdown: [
          { label: 'Income Replacement (HLV-based)', value: incomeReplacementNeed, percent: Math.round(incomeReplacementNeed / totalNeed * 100) },
          { label: 'Mortgage Protection (Home Loan)', value: homeLoan, percent: Math.round(homeLoan / totalNeed * 100) },
          { label: 'Other Loans (Car/Personal/Business)', value: carLoan + businessLoan + otherLiabilities, percent: Math.round((carLoan + businessLoan + otherLiabilities) / totalNeed * 100) },
          { label: 'Child Education Fund', value: childEducation, percent: Math.round(childEducation / totalNeed * 100) },
          { label: "Children's Marriage Fund", value: marriageFundInflated, percent: Math.round(marriageFundInflated / totalNeed * 100) },
          { label: 'Spouse Protection (if not working)', value: spouseProtection, percent: Math.round(spouseProtection / totalNeed * 100) },
          { label: 'Elderly Parent Care', value: elderlyCareFund, percent: Math.round(elderlyCareFund / totalNeed * 100) },
          { label: 'Special Needs Fund', value: specialNeedsFundAmt, percent: Math.round(specialNeedsFundAmt / totalNeed * 100) },
          { label: 'Emergency Fund Buffer', value: emergencyFund, percent: Math.round(emergencyFund / totalNeed * 100) },
          { label: 'Final Expenses', value: finalCost, percent: Math.round(finalCost / totalNeed * 100) },
          { label: 'Retirement Corpus Gap', value: retirementGap, percent: Math.round(retirementGap / totalNeed * 100) },
          { label: 'Less: Existing Coverage', value: -existing, percent: 0 },
        ].filter(b => b.value !== 0),
        
        // Riders
        riders,
        riderCosts,
        totalPremiumWithRiders: Math.round(avgPremium + riderCosts.total),
        
        // Payout structure
        payoutStructure,
        
        // Tax benefits
        taxBenefits: {
          deduction80C: taxDeduction80C,
          taxSaved,
          effectivePremium: Math.round(avgPremium + riderCosts.total - taxSaved),
          note: 'Premium up to ₹1.5L qualifies for 80C deduction'
        },
        
        // Premium factors applied
        premiumFactors: {
          ageFactor: ageFactor.toFixed(2),
          smokerFactor: smokerFactor.toFixed(2),
          genderFactor: genderFactor.toFixed(2),
          healthFactor: healthFactor.toFixed(2),
          occupationFactor: occupationFactor.toFixed(2),
          bmiFactor: bmiFactor.toFixed(2),
          familyHistoryFactor: familyHistoryFactor.toFixed(2),
          exerciseFactor: exerciseFactor.toFixed(2),
          alcoholFactor: alcoholFactor.toFixed(2),
          totalFactor: totalFactor.toFixed(2),
        },
        
        checklist,
        
        // Retirement planning context
        retirementContext: {
          lifeExpectancy,
          postRetirementYears,
          retirementAge: ra,
        },
        
        // ULIP/Endowment Maturity (if applicable)
        ulipMaturity,
        maturityProjection,
        
        // Insurer data with buy links
        insurerQuotesWithLinks: insurerQuotes.map(q => ({
          ...q,
          buyUrl: insurerData.find(i => i.name === q.name)?.buyUrl || null,
          color: insurerData.find(i => i.name === q.name)?.color || '#333',
          planName: insurerData.find(i => i.name === q.name)?.planName || '',
          maxCoverAge: insurerData.find(i => i.name === q.name)?.maxCoverAge || 80,
          features: insurerData.find(i => i.name === q.name)?.features || {},
          highlight: insurerData.find(i => i.name === q.name)?.features?.highlight || '',
        })),
        
        // Policy Feature Comparison Matrix
        policyFeatureComparison: policyFeatures.map(pf => ({
          feature: pf.feature,
          description: pf.desc,
          insurerSupport: insurerData.map(ins => ({
            name: ins.name,
            supported: ins.features?.[pf.key] || false,
          })),
          totalSupported: insurerData.filter(ins => ins.features?.[pf.key]).length,
        })),
        
        // Nominee Planning Guide
        nomineePlanning: {
          title: 'Nominee Planning Checklist',
          description: 'Critical steps for ensuring smooth claim settlement',
          steps: [
            { step: 1, action: 'Choose Primary Nominee', detail: 'Spouse or major child (18+) recommended. Minor nominee requires appointee.' },
            { step: 2, action: 'Add Secondary Nominees', detail: 'Up to 3 contingent nominees if primary is unavailable. Specify share %.' },
            { step: 3, action: 'Update Nomination Regularly', detail: 'Review after marriage, divorce, birth, or death in family.' },
            { step: 4, action: 'Inform Nominees', detail: 'Share policy number, insurer name, and helpline. Keep copies accessible.' },
            { step: 5, action: 'Document Requirements', detail: 'Nominees need: Death certificate, policy document, ID proof, bank details.' },
          ],
          importantNotes: [
            '⚠️ Nomination is NOT the same as inheritance - a valid Will takes precedence',
            '💡 Married Women: Name policy under MWP Act (Section 6) for absolute protection',
            '📋 Keep original policy in safe place; inform 2+ family members',
            '🔐 Register policy on DigiLocker for digital access by family',
            '📞 Save insurer\'s claim helpline in family\'s phones',
          ],
          claimProcess: [
            { step: 1, action: 'Intimate Claim', timeline: 'Within 24-72 hours of death' },
            { step: 2, action: 'Submit Documents', timeline: 'Within 30 days' },
            { step: 3, action: 'Insurer Investigation', timeline: '30-90 days' },
            { step: 4, action: 'Claim Settlement', timeline: 'Within 30 days of approval' },
          ],
          documentsRequired: [
            'Original Policy Document',
            'Death Certificate (registered)',
            'Claimant\'s ID Proof (Aadhaar/PAN)',
            'Claimant\'s Bank Details',
            'Claim Form (from insurer)',
            'Medical Records (if hospitalized)',
            'FIR (if accidental death)',
            'Post-mortem Report (if applicable)',
          ],
        },
        
        // What competitors don't have that we do (Competitive Advantage)
        competitiveAdvantage: {
          title: 'BM Wealth Exclusive Features',
          advantages: [
            { feature: 'HLV Calculator', desc: 'Industry-standard Human Life Value formula with present value discounting' },
            { feature: 'BMI Premium Impact', desc: 'See exactly how your health affects premium loading' },
            { feature: '8 Insurer Comparison', desc: 'Compare CSR, solvency, premiums across 8 major insurers simultaneously' },
            { feature: 'Premium Factor Transparency', desc: 'See each factor (age, smoker, occupation, BMI) that affects your premium' },
            { feature: 'ULIP Maturity Projections', desc: '3-scenario (8%/10%/12%) maturity projections with XIRR' },
            { feature: 'Rider Cost Calculator', desc: 'Individual cost breakdown for each rider option' },
            { feature: 'Tax Benefit Calculator', desc: 'Real-time 80C/80D savings with effective premium' },
            { feature: 'Payout Structure Options', desc: 'Lumpsum vs Monthly vs Hybrid payout comparison' },
            { feature: 'PDF Quote Download', desc: 'Professional branded quote for offline review' },
            { feature: 'Nominee Planning Guide', desc: 'Complete claim process guidance for family' },
          ],
          missingInCompetitors: [
            { competitor: 'Policybazaar', missing: 'Detailed HLV formula, Premium factor breakdown, ULIP 3-scenario projection' },
            { competitor: 'InsuranceDekho', missing: 'Rider cost calculator, BMI impact display, Coverage breakdown chart' },
            { competitor: 'Coverfox', missing: 'Multi-insurer feature comparison, Nominee planning, PDF export' },
          ],
        },
        
        // Top insurers with CSR
        topInsurers: insurerData.map(i => `${i.name} (CSR: ${i.csr}%)`),
        
        note: 'Premiums are indicative estimates based on published rates. Actual pricing depends on insurer underwriting, medical tests, and chosen riders. CSR data from IRDAI 2024-25.',
      };
    } else if (type === 'health') {
      // ═══════════════════════════════════════════════════════════════
      // HEALTH INSURANCE CALCULATION (ENHANCED)
      // ═══════════════════════════════════════════════════════════════
      const members = Math.max(1, familyMembers || 1);
      const coverType = healthCoverType || 'individual';
      
      // Health cover recommendations based on city and income
      const baseHealthCover = Math.max(mi * 36, 500000); // Min 3 years income or 5L
      const cityMultiplier = { metro: 2, tier1: 1.5, tier2: 1.2, tier3: 1 }[city] || 1;
      const recommendedHealthCover = Math.max(500000, Math.min(20000000, 
        Math.ceil((baseHealthCover * cityMultiplier) / 500000) * 500000));
      
      const ageFactor = getAgeFactor(a, 'health');
      const memberFactor = coverType === 'family' ? (1 + (members - 1) * 0.30) : 1;
      
      // Health insurers with details
      const healthInsurers = [
        { name: 'Star Health', logo: '⭐', csr: 91.5, baseFactor: 1.0, networkHospitals: 14000 },
        { name: 'Care Health', logo: '💚', csr: 89.2, baseFactor: 0.95, networkHospitals: 12000 },
        { name: 'HDFC Ergo', logo: '🏦', csr: 93.1, baseFactor: 1.05, networkHospitals: 13000 },
        { name: 'Niva Bupa', logo: '💙', csr: 90.8, baseFactor: 1.02, networkHospitals: 10000 },
        { name: 'ICICI Lombard', logo: '🔵', csr: 88.5, baseFactor: 0.98, networkHospitals: 9500 },
        { name: 'Max Bupa', logo: '🔴', csr: 91.2, baseFactor: 1.08, networkHospitals: 8000 },
      ];

      const healthQuotes = healthInsurers.map(insurer => {
        const basePremium = (recommendedHealthCover / 1000000) * basePremiumRates.health;
        const premium = basePremium * ageFactor * healthFactor * memberFactor * 
                       cityFactor * bmiFactor * insurer.baseFactor;
        return {
          ...insurer,
          cover: recommendedHealthCover,
          annualPremium: Math.round(premium),
          monthlyPremium: Math.round(premium / 12),
          premiumPer10L: Math.round((premium / (recommendedHealthCover / 1000000)) * 100) / 100,
        };
      }).sort((a, b) => a.annualPremium - b.annualPremium);

      const avgHealthPremium = healthQuotes.reduce((sum, q) => sum + q.annualPremium, 0) / healthQuotes.length;

      // Health tax benefit (80D)
      const taxDeduction80D = Math.min(avgHealthPremium, 25000); // Up to 25k for self
      const parentDeduction = elderlyParents > 0 ? 50000 : 25000; // Extra for parents
      const totalHealthDeduction = taxDeduction80D + (elderlyParents > 0 ? parentDeduction : 0);
      const healthTaxSaved = totalHealthDeduction * 0.30;

      const healthChecklist = [
        '✓ Minimum ₹10-15L cover for metro cities',
        '✓ Check room rent limits and sub-limits carefully',
        '✓ Pre/post hospitalization coverage (30-60/60-90 days)',
        '✓ Network hospital list in your city is crucial',
        '✓ No claim bonus can grow cover by 50-100%',
        '✓ Day care procedures (cataract, dialysis) should be covered',
        '✓ Maternity cover has 2-4 year waiting period',
        '✓ Pre-existing disease waiting period (2-4 years)',
        bmi >= 30 ? '⚠️ High BMI may affect coverage terms or premium' : null,
        '✓ Compare co-pay requirements carefully',
        '✓ Check sub-limits on specific treatments',
      ].filter(Boolean);

      result = {
        __type: 'insurance',
        insuranceType: 'Health Insurance',
        recommendedCover: recommendedHealthCover,
        coverType: coverType === 'family' ? `Family Floater (${members} members)` : 'Individual',
        city: city.charAt(0).toUpperCase() + city.slice(1),
        
        // BMI Analysis
        bmiAnalysis: {
          bmi: Math.round(bmi * 10) / 10,
          category: bmiCategory,
          impact: bmiFactor > 1.0 ? `+${Math.round((bmiFactor - 1) * 100)}% premium loading` : 'No additional loading',
        },
        
        // Premium comparison
        insurerQuotes: healthQuotes,
        annualPremiumMid: Math.round(avgHealthPremium),
        monthlyPremiumMid: Math.round(avgHealthPremium / 12),
        premiumRange: `${fmt(healthQuotes[0]?.annualPremium)} – ${fmt(healthQuotes[healthQuotes.length - 1]?.annualPremium)}`,
        
        // Tax benefits
        taxBenefits: {
          deduction80D: totalHealthDeduction,
          selfDeduction: taxDeduction80D,
          parentDeduction: elderlyParents > 0 ? parentDeduction : 0,
          taxSaved: healthTaxSaved,
          effectivePremium: Math.round(avgHealthPremium - healthTaxSaved),
        },
        
        breakdown: [
          { label: 'Recommended health cover', value: recommendedHealthCover },
          { label: 'Members covered', value: members, isNumber: true },
          { label: 'Average annual premium', value: Math.round(avgHealthPremium) },
          { label: 'Tax benefit (80D)', value: healthTaxSaved },
          { label: 'Effective premium after tax', value: Math.round(avgHealthPremium - healthTaxSaved) },
        ],
        
        checklist: healthChecklist,
        topInsurers: healthInsurers.map(i => `${i.name} (CSR: ${i.csr}%)`),
        note: 'Health insurance premiums increase with age. Buy early for lower lifetime costs. Compare network hospitals in your city.',
      };
    } else if (type === 'critical') {
      // ═══════════════════════════════════════════════════════════════
      // CRITICAL ILLNESS COVERAGE (ENHANCED)
      // ═══════════════════════════════════════════════════════════════
      const ciCoverAmt = Math.max(500000, ciCover || 2500000);
      const recommendedCI = Math.max(ciCoverAmt, annualIncome * 3);
      const ageFactor = getAgeFactor(a, 'critical');
      
      const ciInsurers = [
        { name: 'HDFC Life', logo: '🏦', baseFactor: 1.0, conditions: 34 },
        { name: 'ICICI Pru', logo: '🔵', baseFactor: 0.95, conditions: 36 },
        { name: 'Max Life', logo: '🔴', baseFactor: 1.05, conditions: 40 },
        { name: 'Tata AIA', logo: '🟡', baseFactor: 0.98, conditions: 35 },
        { name: 'Bajaj Allianz', logo: '🔷', baseFactor: 1.02, conditions: 38 },
      ];

      const ciQuotes = ciInsurers.map(insurer => {
        const premium = (recommendedCI / 2500000) * basePremiumRates.critical * 
                       ageFactor * smokerFactor * healthFactor * bmiFactor * 
                       familyHistoryFactor * insurer.baseFactor;
        return {
          ...insurer,
          cover: recommendedCI,
          annualPremium: Math.round(premium),
          monthlyPremium: Math.round(premium / 12),
          premiumPer25L: Math.round((premium / (recommendedCI / 2500000)) * 100) / 100,
        };
      }).sort((a, b) => a.annualPremium - b.annualPremium);

      const avgCIPremium = ciQuotes.reduce((sum, q) => sum + q.annualPremium, 0) / ciQuotes.length;

      const ciChecklist = [
        '✓ CI cover should be 2-3x annual income minimum',
        '✓ Check list of covered illnesses (30+ conditions is good)',
        '✓ Survival period should be 30 days or less',
        '✓ Can be standalone or rider on term plan',
        '✓ Cancer, heart attack, stroke must be covered',
        '✓ Check for partial payout on early-stage conditions',
        smoker === 'yes' ? '⚠️ Smokers have higher CI risk - consider higher cover' : null,
        familyHistory === 'significant' ? '⚠️ Family history increases CI risk - adequate cover important' : null,
        '✓ CI payout is lump sum on diagnosis, not reimbursement',
        '✓ Use CI payout for treatment + income replacement during recovery',
      ].filter(Boolean);

      result = {
        __type: 'insurance',
        insuranceType: 'Critical Illness',
        recommendedCover: recommendedCI,
        
        // BMI Analysis
        bmiAnalysis: {
          bmi: Math.round(bmi * 10) / 10,
          category: bmiCategory,
          impact: bmiFactor > 1.0 ? `+${Math.round((bmiFactor - 1) * 100)}% premium loading` : 'No additional loading',
        },
        
        // Premium comparison
        insurerQuotes: ciQuotes,
        annualPremiumMid: Math.round(avgCIPremium),
        monthlyPremiumMid: Math.round(avgCIPremium / 12),
        premiumRange: `${fmt(ciQuotes[0]?.annualPremium)} – ${fmt(ciQuotes[ciQuotes.length - 1]?.annualPremium)}`,
        
        breakdown: [
          { label: 'Critical Illness cover', value: recommendedCI },
          { label: 'Average annual premium', value: Math.round(avgCIPremium) },
          { label: 'Monthly premium', value: Math.round(avgCIPremium / 12) },
        ],
        
        coveredConditions: [
          'Cancer (all stages)', 'Heart Attack', 'Stroke', 'Kidney Failure', 
          'Major Organ Transplant', 'Coronary Bypass Surgery', 'Paralysis', 
          'Multiple Sclerosis', 'Alzheimer\'s Disease', 'Parkinson\'s Disease',
          'Aorta Graft Surgery', 'Blindness', 'Deafness', 'Coma',
          'Motor Neurone Disease', 'Primary Pulmonary Hypertension'
        ],
        
        checklist: ciChecklist,
        note: 'Critical illness insurance pays lump sum on diagnosis, unlike health insurance which reimburses hospital bills. Use for treatment costs + income replacement during recovery.',
      };
    }

    return result;
  },
  ppf: (yearly, years) => {
    const rate = 7.1 / 100;
    let balance = 0;
    for (let i = 0; i < years; i++) {
      balance = (balance + yearly) * (1 + rate);
    }
    const invested = yearly * years;
    return { invested, maturityValue: balance, interestEarned: balance - invested };
  },

  epf: (basicSalary, years, empContrib = 12, companyContrib = 12) => {
    const monthlyContrib = basicSalary * (empContrib + companyContrib) / 100;
    const rate = 8.25 / 100 / 12;
    const n = years * 12;
    const fv = monthlyContrib * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
    return { monthlyContribution: monthlyContrib, maturityValue: fv, totalContributed: monthlyContrib * n };
  },

  nps: (monthly, years, rate = 10) => {
    const n = years * 12;
    const r = rate / 100 / 12;
    const corpus = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const annuityCorpus = corpus * 0.4; // 40% must be used for annuity
    const lumpsum = corpus * 0.6; // 60% can be withdrawn
    return { totalCorpus: corpus, lumpsum, annuityCorpus };
  },

  elss: (monthly, years) => {
    const rate = 12 / 100 / 12;
    const n = years * 12;
    const invested = monthly * n;
    const fv = monthly * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
    const taxSaved = Math.min(monthly * 12, 150000) * 0.3; // 80C benefit
    return { invested, futureValue: fv, returns: fv - invested, taxSavedPerYear: taxSaved };
  },

  emi: (principal, rate, years) => {
    const r = rate / 100 / 12;
    const n = years * 12;
    const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    return { emi: Math.round(emi), totalPayment, totalInterest: totalPayment - principal };
  },

  swp: (corpus, withdrawal, rate, years) => {
    let balance = corpus;
    const r = rate / 100 / 12;
    const months = years * 12;
    for (let i = 0; i < months && balance > 0; i++) {
      balance = balance * (1 + r) - withdrawal;
    }
    return { totalWithdrawn: withdrawal * months, remainingCorpus: Math.max(0, balance) };
  },

  stepup: (initial, stepUp, years, rate) => {
    let total = 0;
    let invested = 0;
    const r = rate / 100 / 12;
    let monthly = initial;
    
    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) {
        const remaining = (years - y) * 12 - m;
        total += monthly * Math.pow(1 + r, remaining);
        invested += monthly;
      }
      monthly *= (1 + stepUp / 100);
    }
    return { invested, futureValue: total, returns: total - invested };
  },

  cagr: (initial, final, years) => {
    const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
    return { cagr: cagr.toFixed(2), initial, final, years };
  },

  inflation: (current, years, rate = 6) => {
    const future = current * Math.pow(1 + rate / 100, years);
    const realValue = current / Math.pow(1 + rate / 100, years);
    return { futureValue: future, realValue, inflationRate: rate };
  },

  gratuity: (basicSalary, yearsOfService) => {
    const gratuity = (basicSalary * 15 * yearsOfService) / 26;
    return { gratuityAmount: Math.min(gratuity, 2000000), yearsOfService }; // Max 20L
  },

  hra: (basic, hra, rentPaid, metro = 'true') => {
    const isMetro = metro === 'true' || metro === true;
    const metroPercent = isMetro ? 0.5 : 0.4;
    const exempt1 = hra;
    const exempt2 = basic * metroPercent;
    const exempt3 = rentPaid - (basic * 0.1);
    const exemption = Math.max(0, Math.min(exempt1, exempt2, exempt3));
    return { exemption, taxable: Math.max(0, hra - exemption) };
  },

  tax: (
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE TAX CALCULATOR - FY 2025-26 (AY 2026-27)
    // Budget 2025 updated slabs, surcharge, marginal relief, ALL deductions
    // ═══════════════════════════════════════════════════════════════════════════
    grossIncome,
    otherIncome,
    age,
    regime = 'new',
    includeStandardDeduction = 'true',
    deduction80C,
    deduction80CCD1B,
    deduction80D,
    deduction80E,
    deduction80G,
    homeLoanInterest24b,
    employerNps80ccd2,
    hraExemption,
    // Extended inputs
    ltcExemption = 0,
    professionalTax = 0,
    deduction80TTA = 0,
    deduction80DD = 0,
    deduction80DDB = 0,
    deduction80U = 0,
    deduction80GG = 0,
    deduction80EEA = 0,
    deduction80EEB = 0,
    stcgEquity = 0,
    stcgOther = 0,
    ltcgEquity = 0,
    ltcgOther = 0,
    dividendIncome = 0,
    interestIncome = 0,
    rentalIncome = 0,
    tdsAlreadyPaid = 0,
    advanceTaxPaid = 0
  ) => {
    // ─────────────────────────────────────────────────────────────────────────
    // Helper functions
    // ─────────────────────────────────────────────────────────────────────────
    const num = (v) => Math.max(0, Number(v) || 0);
    const cap = (v, max) => Math.min(num(v), max);
    const inr = (n) => `₹${Math.round(Math.max(0, n || 0)).toLocaleString('en-IN')}`;
    const slabLabel = (from, to) => {
      if (!isFinite(to)) return `Above ${inr(from)}`;
      if (from <= 0) return `Up to ${inr(to)}`;
      return `${inr(from)} – ${inr(to)}`;
    };
    
    const incStd = includeStandardDeduction === 'true' || includeStandardDeduction === true;
    const ageNum = num(age);
    const isSenior = ageNum >= 60 && ageNum < 80;
    const isSuperSenior = ageNum >= 80;

    // ─────────────────────────────────────────────────────────────────────────
    // Income Calculation
    // ─────────────────────────────────────────────────────────────────────────
    const salaryIncome = num(grossIncome);
    const otherSources = num(otherIncome) + num(interestIncome) + num(dividendIncome);
    const rental = num(rentalIncome);
    const rentalDeduction = rental > 0 ? rental * 0.30 : 0; // 30% standard deduction on rental
    const netRentalIncome = rental - rentalDeduction;
    
    // Capital gains (special rates, computed separately)
    const stcgEq = num(stcgEquity);  // 20% (FY 2025-26)
    const stcgOth = num(stcgOther);  // Slab rate
    const ltcgEq = num(ltcgEquity);  // 12.5% above ₹1.25L
    const ltcgOth = num(ltcgOther);  // 12.5%
    
    // Regular income (taxed at slab rates)
    const regularIncome = salaryIncome + otherSources + netRentalIncome + stcgOth;
    
    // ─────────────────────────────────────────────────────────────────────────
    // Deductions (Old Regime only, except standard deduction and 80CCD2)
    // ─────────────────────────────────────────────────────────────────────────
    // FY 2025-26: Standard deduction is ₹75,000 in new regime, ₹50,000 in old
    const stdDeduction = incStd ? (regime === 'new' ? 75000 : 50000) : 0;
    const profTax = cap(professionalTax, 2500); // Max ₹2,500
    
    // 80C group (max ₹1.5L combined with 80CCC and 80CCD(1))
    const d80C = cap(deduction80C, 150000);
    const d80CCD1B = cap(deduction80CCD1B, 50000); // Additional NPS
    const d80CCD2 = num(employerNps80ccd2); // Employer NPS (no cap for govt 14%, pvt 10%)
    
    // Health insurance 80D
    const d80DBase = num(deduction80D);
    const d80DLimit = isSuperSenior || isSenior ? 50000 : 25000;
    const d80D = Math.min(d80DBase, 100000); // Self + parents max
    
    // Other 80 series
    const d80E = num(deduction80E); // Education loan - no limit
    const d80G = num(deduction80G); // Donations - varies
    const d80TTA = cap(deduction80TTA, isSuperSenior || isSenior ? 0 : 10000); // ₹10K (below 60)
    const d80TTB = isSuperSenior || isSenior ? cap(deduction80TTA, 50000) : 0; // ₹50K (60+)
    const d80DD = cap(deduction80DD, 125000); // Dependent disability
    const d80DDB = cap(deduction80DDB, isSuperSenior || isSenior ? 100000 : 40000);
    const d80U = cap(deduction80U, 125000); // Self disability
    const d80GG = cap(deduction80GG, 60000); // Rent without HRA (₹5000/month)
    const d80EEA = cap(deduction80EEA, 150000); // Affordable housing
    const d80EEB = cap(deduction80EEB, 150000); // EV loan interest
    
    // House property
    const hra = regime === 'old' ? num(hraExemption) : 0;
    const ltc = regime === 'old' ? num(ltcExemption) : 0;
    const d24b = cap(homeLoanInterest24b, 200000); // Home loan interest
    
    // ─────────────────────────────────────────────────────────────────────────
    // Total deductions by regime
    // ─────────────────────────────────────────────────────────────────────────
    let deductionsOld = stdDeduction + profTax + hra + ltc + 
      d80C + d80CCD1B + d80CCD2 + d80D + d80E + d80G + 
      d80TTA + d80TTB + d80DD + d80DDB + d80U + d80GG + d80EEA + d80EEB + d24b;
    
    // New regime: only standard deduction + employer NPS + family pension
    let deductionsNew = stdDeduction + d80CCD2;
    
    const deductions = regime === 'old' ? deductionsOld : deductionsNew;
    const taxableIncome = Math.max(0, regularIncome - deductions);
    
    // ─────────────────────────────────────────────────────────────────────────
    // Slab-wise tax computation
    // ─────────────────────────────────────────────────────────────────────────
    const computeSlabBreakdown = (ti, slabDefs) => {
      const x = Math.max(0, ti || 0);
      const slabs = [];
      let total = 0;
      
      for (const s of slabDefs) {
        const upper = isFinite(s.to) ? Math.min(x, s.to) : x;
        const amt = Math.max(0, upper - s.from);
        if (amt <= 0) continue;
        const tax = amt * s.rate;
        slabs.push({
          label: slabLabel(s.from, s.to),
          amount: amt,
          ratePercent: s.rate * 100,
          tax,
        });
        total += tax;
      }
      return { totalTax: total, slabs };
    };

    // Old regime slabs (age-based exemption)
    const slabTaxOld = (ti) => {
      const exempt = isSuperSenior ? 500000 : isSenior ? 300000 : 250000;
      return computeSlabBreakdown(ti, [
        { from: 0, to: exempt, rate: 0.0 },
        { from: exempt, to: 500000, rate: 0.05 },
        { from: 500000, to: 1000000, rate: 0.20 },
        { from: 1000000, to: Infinity, rate: 0.30 },
      ]);
    };

    // NEW REGIME FY 2025-26 (BUDGET 2025 SLABS)
    const slabTaxNew = (ti) => {
      return computeSlabBreakdown(ti, [
        { from: 0, to: 400000, rate: 0.0 },       // 0-4L: Nil
        { from: 400000, to: 800000, rate: 0.05 },  // 4-8L: 5%
        { from: 800000, to: 1200000, rate: 0.10 }, // 8-12L: 10%
        { from: 1200000, to: 1600000, rate: 0.15 }, // 12-16L: 15%
        { from: 1600000, to: 2000000, rate: 0.20 }, // 16-20L: 20%
        { from: 2000000, to: 2400000, rate: 0.25 }, // 20-24L: 25%
        { from: 2400000, to: Infinity, rate: 0.30 }, // Above 24L: 30%
      ]);
    };

    const slabCalc = regime === 'old' ? slabTaxOld(taxableIncome) : slabTaxNew(taxableIncome);
    let taxOnRegularIncome = slabCalc.totalTax;
    const slabBreakdown = slabCalc.slabs;

    // ─────────────────────────────────────────────────────────────────────────
    // Special rate taxes (Capital Gains)
    // ─────────────────────────────────────────────────────────────────────────
    // STCG Equity: 20% (FY 2025-26 rate)
    const taxSTCGEquity = stcgEq * 0.20;
    
    // LTCG Equity: 12.5% on gains above ₹1.25 lakh
    const ltcgEqExempt = 125000;
    const taxLTCGEquity = Math.max(0, ltcgEq - ltcgEqExempt) * 0.125;
    
    // LTCG Other: 12.5% (no indexation from FY 2024-25)
    const taxLTCGOther = ltcgOth * 0.125;
    
    const capitalGainsTax = taxSTCGEquity + taxLTCGEquity + taxLTCGOther;
    
    // ─────────────────────────────────────────────────────────────────────────
    // Rebate u/s 87A (FY 2025-26)
    // ─────────────────────────────────────────────────────────────────────────
    // Old: Up to ₹5L taxable → max rebate ₹12,500
    // New: Up to ₹12L taxable → max rebate ₹60,000 (BUDGET 2025)
    const rebateThreshold = regime === 'old' ? 500000 : 1200000;
    const maxRebate = regime === 'old' ? 12500 : 60000;
    const rebate = taxableIncome <= rebateThreshold ? Math.min(taxOnRegularIncome, maxRebate) : 0;
    const taxAfterRebate = Math.max(0, taxOnRegularIncome - rebate);

    // Total tax before surcharge (includes CG tax - no rebate on CG)
    const totalTaxBeforeSurcharge = taxAfterRebate + capitalGainsTax;

    // ─────────────────────────────────────────────────────────────────────────
    // Surcharge (on total income including CG)
    // ─────────────────────────────────────────────────────────────────────────
    const totalIncome = regularIncome + stcgEq + ltcgEq + ltcgOth;
    let surchargeRate = 0;
    if (totalIncome > 50000000) {
      surchargeRate = regime === 'new' ? 0.25 : 0.37; // New regime capped at 25%
    } else if (totalIncome > 20000000) {
      surchargeRate = 0.25;
    } else if (totalIncome > 10000000) {
      surchargeRate = 0.15;
    } else if (totalIncome > 5000000) {
      surchargeRate = 0.10;
    }
    const surcharge = totalTaxBeforeSurcharge * surchargeRate;

    // ─────────────────────────────────────────────────────────────────────────
    // Marginal relief (if income slightly exceeds surcharge threshold)
    // ─────────────────────────────────────────────────────────────────────────
    let marginalRelief = 0;
    const surchargeThresholds = [5000000, 10000000, 20000000, 50000000];
    for (const threshold of surchargeThresholds) {
      if (totalIncome > threshold && totalIncome <= threshold + 100000) {
        const excessIncome = totalIncome - threshold;
        const taxAtThreshold = totalTaxBeforeSurcharge * (1 + (surchargeRate - 0.05 >= 0 ? surchargeRate - 0.05 : 0));
        const taxWithSurcharge = totalTaxBeforeSurcharge + surcharge;
        if (taxWithSurcharge - taxAtThreshold > excessIncome) {
          marginalRelief = taxWithSurcharge - taxAtThreshold - excessIncome;
        }
        break;
      }
    }
    const netSurcharge = Math.max(0, surcharge - marginalRelief);

    // ─────────────────────────────────────────────────────────────────────────
    // Health & Education Cess (4%)
    // ─────────────────────────────────────────────────────────────────────────
    const taxBeforeCess = totalTaxBeforeSurcharge + netSurcharge;
    const cess = taxBeforeCess * 0.04;
    const totalTax = taxBeforeCess + cess;

    // ─────────────────────────────────────────────────────────────────────────
    // TDS / Advance Tax adjustments
    // ─────────────────────────────────────────────────────────────────────────
    const tds = num(tdsAlreadyPaid);
    const advTax = num(advanceTaxPaid);
    const netTaxPayable = Math.max(0, totalTax - tds - advTax);
    const refundDue = Math.max(0, tds + advTax - totalTax);

    // ─────────────────────────────────────────────────────────────────────────
    // Effective rate & monthly estimate
    // ─────────────────────────────────────────────────────────────────────────
    const effectiveRatePercent = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
    const monthlyTax = totalTax / 12;

    // ─────────────────────────────────────────────────────────────────────────
    // Regime Comparison (calculate both)
    // ─────────────────────────────────────────────────────────────────────────
    const calcOther = regime === 'old' 
      ? slabTaxNew(Math.max(0, regularIncome - deductionsNew))
      : slabTaxOld(Math.max(0, regularIncome - deductionsOld));
    
    const otherTaxableIncome = regime === 'old' 
      ? Math.max(0, regularIncome - deductionsNew)
      : Math.max(0, regularIncome - deductionsOld);
    
    const otherRebateThreshold = regime === 'old' ? 1200000 : 500000;
    const otherMaxRebate = regime === 'old' ? 60000 : 12500;
    const otherRebate = otherTaxableIncome <= otherRebateThreshold 
      ? Math.min(calcOther.totalTax, otherMaxRebate) : 0;
    const otherTaxAfterRebate = Math.max(0, calcOther.totalTax - otherRebate);
    const otherTotalTax = (otherTaxAfterRebate + capitalGainsTax) * 1.04; // Approx with cess
    
    const regimeComparison = {
      currentRegime: regime,
      currentTax: totalTax,
      otherRegime: regime === 'old' ? 'new' : 'old',
      otherTax: otherTotalTax,
      savings: Math.abs(totalTax - otherTotalTax),
      betterRegime: totalTax <= otherTotalTax ? regime : (regime === 'old' ? 'new' : 'old'),
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Tax-saving suggestions
    // ─────────────────────────────────────────────────────────────────────────
    const suggestions = [];
    if (regime === 'old') {
      if (d80C < 150000) {
        suggestions.push({ section: '80C', potential: 150000 - d80C, tip: 'Invest in PPF/ELSS/LIC to claim full ₹1.5L' });
      }
      if (d80CCD1B < 50000) {
        suggestions.push({ section: '80CCD(1B)', potential: 50000 - d80CCD1B, tip: 'Invest ₹50K in NPS for additional deduction' });
      }
      if (d80D < 50000) {
        suggestions.push({ section: '80D', potential: 50000 - d80D, tip: 'Get health insurance for self & parents' });
      }
    } else {
      if (deductionsOld > deductionsNew + 100000) {
        suggestions.push({ section: 'Regime', potential: 0, tip: 'Consider Old Regime - you have significant deductions' });
      }
    }

    return {
      __type: 'tax',
      // Summary
      grossIncome: totalIncome,
      salaryIncome,
      otherSources,
      rentalIncome: rental,
      rentalDeduction,
      capitalGains: stcgEq + stcgOth + ltcgEq + ltcgOth,
      deductions,
      deductionsOld,
      deductionsNew,
      taxableIncome,
      // Tax breakdown
      taxOnRegularIncome,
      taxSTCGEquity,
      taxLTCGEquity,
      taxLTCGOther,
      capitalGainsTax,
      taxBeforeRebate: taxOnRegularIncome + capitalGainsTax,
      rebate87A: rebate,
      rebateEligible: taxableIncome <= rebateThreshold,
      taxAfterRebate: totalTaxBeforeSurcharge,
      surchargeRate: surchargeRate * 100,
      surcharge: netSurcharge,
      marginalRelief,
      cess4Percent: cess,
      totalTax,
      // Adjustments
      tdsDeducted: tds,
      advanceTaxPaid: advTax,
      netTaxPayable,
      refundDue,
      // Metrics
      taxLiability: totalTax,
      monthlyTax,
      effectiveRatePercent,
      regime,
      slabBreakdown,
      // Comparison
      regimeComparison,
      suggestions,
      // Meta
      financialYear: 'FY 2025-26',
      assessmentYear: 'AY 2026-27',
    };
  },

  rd: (monthly, years, rate) => {
    const n = years * 12;
    const r = rate / 100 / 4; // Quarterly
    let maturity = 0;
    for (let i = 0; i < n; i++) {
      maturity = (maturity + monthly) * (1 + r / 3);
    }
    const invested = monthly * n;
    return { invested, maturityValue: maturity, interestEarned: maturity - invested };
  },

  ssy: (yearly, years = 15) => {
    const rate = 8.2 / 100;
    let balance = 0;
    for (let i = 0; i < years; i++) {
      balance = (balance + yearly) * (1 + rate);
    }
    // Interest continues for 21 years
    for (let i = 15; i < 21; i++) {
      balance *= (1 + rate);
    }
    return { totalDeposited: yearly * years, maturityValue: balance };
  },

  wealth: (current, target, years, expectedReturn = 15, pmsFee = 2, performanceFee = 20, hurdleRate = 10) => {
    const c = Math.max(0, current || 0);
    const t = Math.max(0, target || 0);
    const y = Math.max(1, years || 1);
    const expRet = Math.max(0, expectedReturn || 15) / 100;
    const mgmtFee = Math.max(0, pmsFee || 2) / 100;
    const perfFee = Math.max(0, performanceFee || 20) / 100;
    const hurdle = Math.max(0, hurdleRate || 10) / 100;

    // Required CAGR to reach target
    const requiredCAGR = c > 0 ? (Math.pow(t / c, 1 / y) - 1) * 100 : 0;
    
    // PMS projection with fees
    const netReturn = expRet - mgmtFee; // After management fee
    const projectedValue = c * Math.pow(1 + netReturn, y);
    const totalGain = projectedValue - c;
    
    // Performance fee calculation (on gains above hurdle)
    const hurdleValue = c * Math.pow(1 + hurdle, y);
    const aboveHurdleGain = Math.max(0, projectedValue - hurdleValue);
    const performanceFeeAmount = aboveHurdleGain * perfFee;
    
    const finalValue = projectedValue - performanceFeeAmount;
    const finalGain = finalValue - c;
    const netCAGR = c > 0 ? (Math.pow(finalValue / c, 1 / y) - 1) * 100 : 0;
    
    // Monthly SIP needed to reach target (if starting fresh)
    const sipRate = netReturn / 12;
    const sipMonths = y * 12;
    const sipNeeded = t > 0 ? (t * sipRate) / ((Math.pow(1 + sipRate, sipMonths) - 1) * (1 + sipRate)) : 0;

    return {
      __type: 'wealth',
      current: c,
      target: t,
      years: y,
      requiredCAGR: requiredCAGR.toFixed(2),
      projectedValue: Math.round(projectedValue),
      finalValueAfterFees: Math.round(finalValue),
      totalGain: Math.round(totalGain),
      netGainAfterFees: Math.round(finalGain),
      managementFeeTotal: Math.round(c * mgmtFee * y),
      performanceFeeAmount: Math.round(performanceFeeAmount),
      netCAGR: netCAGR.toFixed(2),
      monthlySIPNeeded: Math.round(sipNeeded),
      pmsMinimum: 5000000,
      note: 'PMS minimum investment is typically ₹50L. Returns shown are projections, not guaranteed.',
      comparison: [
        { type: 'PMS (projected)', value: Math.round(finalValue), cagr: netCAGR.toFixed(1) },
        { type: 'Mutual Fund (12%)', value: Math.round(c * Math.pow(1.12, y)), cagr: '12.0' },
        { type: 'FD (7%)', value: Math.round(c * Math.pow(1.07, y)), cagr: '7.0' },
      ],
    };
  },

  mfReturns: (
    invested,
    current,
    years,
    fundType = 'equity',
    expenseRatio = 1.5,
    taxSlabPercent = 30,
    exitLoadPercent = 0,
    // New enhanced inputs
    purchaseDate = '',
    saleDate = '',
    dividendReceived = 0,
    switchAmount = 0
  ) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // ENHANCED MUTUAL FUND CALCULATOR - FY 2025-26 Rates
    // STCG Equity: 20% | LTCG Equity: 12.5% (above ₹1.25L)
    // Debt: Slab rate (no indexation from FY 2023-24)
    // ═══════════════════════════════════════════════════════════════════════════
    const inv = Math.max(0, invested || 0);
    const cur = Math.max(0, current || 0);
    const y = Math.max(0.1, years || 0);
    const div = Math.max(0, dividendReceived || 0);
    const switchAmt = Math.max(0, switchAmount || 0);
    
    // Total returns including dividends
    const gain = (cur + div) - inv;
    const absoluteReturnPercent = inv > 0 ? (gain / inv) * 100 : 0;
    const cagr = inv > 0 ? (Math.pow((cur + div) / inv, 1 / y) - 1) : 0;
    const cagrPercent = cagr * 100;

    // Exit load calculation
    const exitLoad = Math.max(0, exitLoadPercent || 0) / 100;
    const exitLoadAmount = cur * exitLoad;
    const proceedsAfterExitLoad = cur * (1 - exitLoad);

    // Capital gains (excluding dividends - they're taxed separately)
    const taxableGain = Math.max(0, proceedsAfterExitLoad - inv);
    const slab = Math.min(50, Math.max(0, taxSlabPercent || 0)) / 100;

    let taxType = 'N/A';
    let tax = 0;
    let taxBreakdown = [];
    const ft = String(fundType || '').toLowerCase();
    const isEquity = ft === 'equity' || ft === 'hybrid-equity' || ft === 'elss';

    if (taxableGain > 0) {
      if (isEquity) {
        if (y >= 1) {
          // LTCG on Equity - FY 2025-26: 12.5% above ₹1.25L exemption
          taxType = 'Equity LTCG';
          const exemption = 125000; // Increased from 1L to 1.25L
          const taxableAfterExemption = Math.max(0, taxableGain - exemption);
          tax = taxableAfterExemption * 0.125; // 12.5% from FY 2024-25
          taxBreakdown = [
            { label: 'Total LTCG', amount: taxableGain },
            { label: 'Less: Exemption (₹1.25L)', amount: Math.min(taxableGain, exemption) },
            { label: 'Taxable LTCG', amount: taxableAfterExemption },
            { label: 'Tax @ 12.5%', amount: tax },
          ];
        } else {
          // STCG on Equity - FY 2025-26: 20%
          taxType = 'Equity STCG';
          tax = taxableGain * 0.20;
          taxBreakdown = [
            { label: 'STCG', amount: taxableGain },
            { label: 'Tax @ 20%', amount: tax },
          ];
        }
      } else {
        // Debt funds - taxed at slab rate (no LTCG benefit from FY 2023-24)
        taxType = y >= 3 ? 'Debt (Slab)' : 'Debt STCG';
        tax = taxableGain * slab;
        taxBreakdown = [
          { label: 'Capital Gain', amount: taxableGain },
          { label: `Tax @ ${(slab * 100).toFixed(0)}% slab`, amount: tax },
        ];
      }
    }

    // Dividend taxation (FY 2020-21 onwards - taxed in hands of investor)
    const dividendTax = div * slab;

    // Final calculations
    const totalTax = tax + dividendTax;
    const postTaxValue = Math.max(0, proceedsAfterExitLoad + div - totalTax);
    const postTaxCagr = inv > 0 ? (Math.pow(postTaxValue / inv, 1 / y) - 1) : 0;

    // Expense ratio impact
    const er = Math.min(5, Math.max(0, expenseRatio || 0)) / 100;
    const feeDragApprox = inv > 0 ? inv * (Math.pow(1 + (cagr + er), y) - Math.pow(1 + cagr, y)) : 0;

    // Opportunity cost (what if invested in index fund @ 0.1% TER?)
    const indexFundGrowth = inv * Math.pow(1 + cagr + (er - 0.001), y);
    const opportunityCost = indexFundGrowth - cur;

    // XIRR approximation (for better return calculation)
    const xirr = cagrPercent; // Simplified, same as CAGR for lumpsum

    return {
      __type: 'mf',
      invested: inv,
      current: cur,
      years: y,
      fundType,
      absoluteReturnPercent,
      cagrPercent,
      xirr,
      // Pre-tax
      totalGain: gain,
      dividendReceived: div,
      exitLoadAmount,
      proceedsAfterExitLoad,
      // Tax
      taxType,
      capitalGainsTax: tax,
      dividendTax,
      totalTax,
      taxBreakdown,
      // Post-tax
      postTaxValue,
      postTaxCagrPercent: postTaxCagr * 100,
      postTaxAbsoluteReturn: postTaxValue - inv,
      postTaxAbsoluteReturnPercent: inv > 0 ? ((postTaxValue - inv) / inv) * 100 : 0,
      // Costs
      expenseRatioPercent: expenseRatio,
      feeDragApprox,
      opportunityCost: opportunityCost > 0 ? opportunityCost : 0,
      // Meta
      financialYear: 'FY 2025-26',
      note: `Tax rates: STCG Equity 20%, LTCG Equity 12.5% (above ₹1.25L). Debt funds taxed at slab rate. Dividends taxed at slab rate.`,
    };
  },

  lic: (
    age,
    sumAssured,
    policyTermYears,
    premiumPayingYears,
    annualPremium,
    bonusRatePerThousand = 40,
    finalAdditionalBonus = 0,
    yearsPaid = 5,
    // New enhanced inputs
    policyType = 'endowment',
    loyaltyAddition = 0,
    riderPremium = 0
  ) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // ENHANCED LIC CALCULATOR
    // Endowment • Whole Life • ULIP • Term • IRR • Surrender • MF Comparison
    // ═══════════════════════════════════════════════════════════════════════════
    const sa = Math.max(0, sumAssured || 0);
    const term = Math.max(1, Math.round(policyTermYears || 0));
    const ppt = Math.max(1, Math.min(term, Math.round(premiumPayingYears || term)));
    const prem = Math.max(0, annualPremium || 0);
    const rider = Math.max(0, riderPremium || 0);
    const totalPrem = prem + rider;
    const bonusRate = Math.max(0, bonusRatePerThousand || 0);
    const fab = Math.max(0, finalAdditionalBonus || 0);
    const loyalty = Math.max(0, loyaltyAddition || 0);
    const paid = Math.max(0, Math.min(term, Math.round(yearsPaid || 0)));
    const pt = String(policyType || 'endowment').toLowerCase();

    // Bonus calculation based on policy type
    let bonusAmount = 0;
    let maturityValue = 0;
    let deathBenefit = 0;

    if (pt === 'endowment' || pt === 'whole-life') {
      // Simple reversionary bonus
      bonusAmount = (sa / 1000) * bonusRate * term;
      maturityValue = sa + bonusAmount + fab + loyalty;
      deathBenefit = sa + ((sa / 1000) * bonusRate * paid); // Bonus accrued till date
    } else if (pt === 'ulip') {
      // ULIP - assume 8% growth on invested portion (after charges)
      const investedPortion = prem * 0.85 * ppt; // 15% charges assumed
      const ulipGrowth = investedPortion * Math.pow(1.08, term);
      maturityValue = ulipGrowth;
      deathBenefit = Math.max(sa, maturityValue);
      bonusAmount = 0;
    } else if (pt === 'term') {
      // Term insurance - no maturity value
      maturityValue = 0;
      deathBenefit = sa;
      bonusAmount = 0;
    } else if (pt === 'money-back') {
      // Money-back - 15% at 5th, 10th, 15th year + 40% at maturity
      const survivalBenefits = sa * 0.15 * 3; // 45% as survival benefits
      bonusAmount = (sa / 1000) * bonusRate * term;
      maturityValue = (sa * 0.55) + bonusAmount + fab; // Remaining 55% + bonuses
      deathBenefit = sa + bonusAmount;
    }

    const totalPremiums = totalPrem * ppt;

    // IRR Calculation using Newton-Raphson
    const cashflows = [];
    for (let i = 0; i < ppt; i++) cashflows.push(-totalPrem);
    while (cashflows.length < term) cashflows.push(0);
    cashflows.push(maturityValue);

    const npv = (rate) => cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i + 1), 0);
    const dNpv = (rate) => cashflows.reduce((acc, cf, i) => acc - ((i + 1) * cf) / Math.pow(1 + rate, i + 2), 0);

    let irr = 0.06;
    for (let iter = 0; iter < 50; iter++) {
      const f = npv(irr);
      const df = dNpv(irr);
      if (!isFinite(f) || !isFinite(df) || Math.abs(df) < 1e-9) break;
      const next = irr - f / df;
      if (!isFinite(next)) break;
      if (Math.abs(next - irr) < 1e-8) {
        irr = next;
        break;
      }
      irr = Math.max(-0.9, Math.min(2.0, next));
    }

    // Surrender value calculation (more accurate)
    let surrenderEstimate = 0;
    let guaranteedSurrenderValue = 0;
    let specialSurrenderValue = 0;
    if (paid >= 3 && pt !== 'term') {
      // Guaranteed Surrender Value: 30% of premiums paid (excluding 1st year)
      guaranteedSurrenderValue = 0.30 * prem * Math.max(0, paid - 1);
      // Special Surrender Value: Based on paid-up value
      const paidUpValue = sa * (paid / ppt);
      const accruedBonus = (sa / 1000) * bonusRate * paid;
      specialSurrenderValue = (paidUpValue + accruedBonus) * (0.5 + (paid / term) * 0.4); // 50-90% based on tenure
      surrenderEstimate = Math.max(guaranteedSurrenderValue, specialSurrenderValue);
    }

    // Paid-up value
    const paidUpValue = sa * (paid / ppt);
    const reducedPaidUp = paid >= 3 ? paidUpValue + (sa / 1000) * bonusRate * paid : 0;

    // Comparison with Mutual Fund (12% assumed return)
    const mfReturn = 0.12;
    let mfValue = 0;
    for (let i = 0; i < ppt; i++) {
      mfValue = (mfValue + totalPrem) * (1 + mfReturn);
    }
    for (let i = ppt; i < term; i++) {
      mfValue *= (1 + mfReturn);
    }
    const opportunityCost = mfValue - maturityValue;
    const mfSuperiorBy = maturityValue > 0 ? ((mfValue - maturityValue) / maturityValue) * 100 : 0;

    // Tax benefits
    const taxBenefit80C = Math.min(prem, 150000) * 0.30; // Assuming 30% slab
    const totalTaxBenefitOverTerm = taxBenefit80C * ppt;
    const taxFreeMaturity = maturityValue; // Assuming conditions met

    // Cost of insurance (for term comparison)
    let costOfInsurance = 0;
    if (pt === 'endowment' || pt === 'ulip') {
      // Mortality charge approximation
      costOfInsurance = (sa / 1000) * (age / 100) * term;
    }

    return {
      __type: 'lic',
      policyType: pt,
      age,
      sumAssured: sa,
      policyTermYears: term,
      premiumPayingYears: ppt,
      annualPremium: prem,
      riderPremium: rider,
      totalAnnualPremium: totalPrem,
      totalPremiums,
      // Bonus & Benefits
      bonusRatePerThousand: bonusRate,
      bonusAmount,
      finalAdditionalBonus: fab,
      loyaltyAddition: loyalty,
      // Values
      maturityValue,
      deathBenefit,
      irrPercent: irr * 100,
      // Surrender
      yearsPaid: paid,
      canSurrender: paid >= 3 && pt !== 'term',
      guaranteedSurrenderValue,
      specialSurrenderValue,
      surrenderEstimate,
      // Paid-up
      paidUpValue: reducedPaidUp,
      // MF Comparison
      mfEquivalentValue: mfValue,
      opportunityCost: opportunityCost > 0 ? opportunityCost : 0,
      mfSuperiorByPercent: mfSuperiorBy > 0 ? mfSuperiorBy : 0,
      // Tax
      annualTaxBenefit80C: taxBenefit80C,
      totalTaxBenefitOverTerm,
      effectiveIRRWithTax: (irr + (taxBenefit80C / totalPrem / term)) * 100,
      // Analysis
      costOfInsurance,
      insuranceComponent: pt === 'term' ? totalPremiums : costOfInsurance,
      investmentComponent: pt === 'term' ? 0 : totalPremiums - costOfInsurance,
      note:
        pt === 'term' 
          ? 'Term insurance provides pure protection with no maturity benefit. Best for income replacement.'
          : `LIC ${pt} provides guaranteed returns with life cover. IRR is typically 4-6%. Consider separating insurance and investment for better returns.`,
      recommendation: irr * 100 < 6 
        ? '💡 Consider: Term Insurance + Mutual Fund SIP may give better overall returns'
        : 'This policy has reasonable IRR. Continue if you value guaranteed returns.',
    };
  },

  childPlan: (childAge, eduAge, cost) => {
    const years = eduAge - childAge;
    const futureCost = cost * Math.pow(1.08, years); // 8% inflation
    const rate = 0.12 / 12;
    const n = years * 12;
    const sip = futureCost * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
    return { futureCost, monthlySIP: Math.ceil(sip), years };
  },

  marriage: (currentAge, marriageAge, cost) => {
    const years = marriageAge - currentAge;
    const futureCost = cost * Math.pow(1.06, years);
    const rate = 0.10 / 12;
    const n = years * 12;
    const sip = futureCost * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
    return { futureCost, monthlySIP: Math.ceil(sip), years };
  },

  carLoan: (price, downPayment, rate, years) => {
    const principal = price - downPayment;
    const r = rate / 100 / 12;
    const n = years * 12;
    const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return { loanAmount: principal, emi: Math.round(emi), totalInterest: (emi * n) - principal };
  },

  homeLoan: (price, downPayment, rate, years) => {
    const principal = price - downPayment;
    const r = rate / 100 / 12;
    const n = years * 12;
    const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return { loanAmount: principal, emi: Math.round(emi), totalPayment: emi * n, totalInterest: (emi * n) - principal };
  },

  gold: (amount, years, rate = 8) => {
    const future = amount * Math.pow(1 + rate / 100, years);
    return { invested: amount, futureValue: future, returns: future - amount };
  },
};

// ════════════════════════════════════════════════════════════════
// INPUT CONFIGURATIONS
// ════════════════════════════════════════════════════════════════

const inputConfigs = {
  sip: [
    { key: '_sip_s0', label: '📈 SIP Setup', type: 'section' },
    { key: 'monthly', label: 'Monthly SIP Amount', type: 'number', default: 15000, prefix: '₹' },
    { key: 'years', label: 'Investment Period', type: 'number', default: 10, suffix: 'years' },
    { key: 'stepUpPercent', label: 'Annual Step-Up %', type: 'number', default: 10, suffix: '%' },
    
    { key: '_sip_s1', label: '🎯 Goal Mapping (Optional)', type: 'section' },
    { key: 'goalAmount', label: 'Target Corpus', type: 'number', default: 0, prefix: '₹' },
    { key: 'inflationRate', label: 'Inflation Rate', type: 'number', default: 6, suffix: '%' },
    
    { key: '_sip_s2', label: '📊 Return Scenarios', type: 'section' },
    { key: 'rateMid', label: 'Expected Return (Base)', type: 'number', default: 12, suffix: '%' },
    { key: 'rateLow', label: 'Conservative (Bear)', type: 'number', default: 8, suffix: '%' },
    { key: 'rateHigh', label: 'Optimistic (Bull)', type: 'number', default: 15, suffix: '%' },
  ],
  lumpsum: [
    { key: 'principal', label: 'Investment Amount', type: 'number', default: 100000, prefix: '₹' },
    { key: 'years', label: 'Time Period', type: 'number', default: 10, suffix: 'years' },
    { key: 'rate', label: 'Expected Return', type: 'number', default: 12, suffix: '%' },
  ],
  goal: [
    { key: 'target', label: 'Target Amount', type: 'number', default: 1000000, prefix: '₹' },
    { key: 'years', label: 'Time to Goal', type: 'number', default: 10, suffix: 'years' },
    { key: 'rate', label: 'Expected Return', type: 'number', default: 12, suffix: '%' },
  ],
  retire: [
    { key: 'monthlyExpense', label: 'Monthly Expense', type: 'number', default: 50000, prefix: '₹' },
    { key: 'currentAge', label: 'Current Age', type: 'number', default: 30, suffix: 'years' },
    { key: 'retireAge', label: 'Retirement Age', type: 'number', default: 60, suffix: 'years' },
  ],
  fd: [
    { key: 'principal', label: 'Deposit Amount', type: 'number', default: 100000, prefix: '₹' },
    { key: 'years', label: 'Tenure', type: 'number', default: 5, suffix: 'years' },
    { key: 'rate', label: 'Interest Rate', type: 'number', default: 7, suffix: '%' },
  ],
  insurance: [
    { key: '_ins_type', label: 'Insurance Type', type: 'section' },
    { key: 'insuranceType', label: 'Type of Insurance', type: 'select', default: 'term', options: [
      { value: 'term', label: 'Term Life Insurance' },
      { value: 'wholeLife', label: 'Whole Life Insurance' },
      { value: 'ulip', label: 'ULIP (Unit Linked)' },
      { value: 'health', label: 'Health Insurance' },
      { value: 'critical', label: 'Critical Illness' },
    ]},

    { key: '_ins_s0', label: 'Personal Details', type: 'section' },
    { key: 'age', label: 'Age', type: 'number', default: 30, suffix: 'years' },
    { key: 'gender', label: 'Gender', type: 'select', default: 'male', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ]},
    { key: 'pincode', label: 'PIN Code (for location pricing)', type: 'number', default: 400001 },

    { key: '_ins_lifestyle', label: 'Lifestyle & Health Assessment', type: 'section' },
    { key: 'smoker', label: 'Tobacco User?', type: 'select', default: 'no', options: [
      { value: 'no', label: 'No (never / quit 2+ years)' },
      { value: 'occasional', label: 'Occasional (social)' },
      { value: 'yes', label: 'Yes (regular)' },
    ]},
    { key: 'alcohol', label: 'Alcohol Consumption', type: 'select', default: 'none', options: [
      { value: 'none', label: 'None / Rarely' },
      { value: 'social', label: 'Social (1-2 drinks/week)' },
      { value: 'moderate', label: 'Moderate (3-7 drinks/week)' },
      { value: 'heavy', label: 'Heavy (8+ drinks/week)' },
    ]},
    { key: 'exercise', label: 'Exercise Frequency', type: 'select', default: 'moderate', options: [
      { value: 'none', label: 'Sedentary (no exercise)' },
      { value: 'light', label: 'Light (1-2 times/week)' },
      { value: 'moderate', label: 'Moderate (3-4 times/week)' },
      { value: 'active', label: 'Active (5+ times/week)' },
    ]},
    { key: 'heightCm', label: 'Height', type: 'number', default: 170, suffix: 'cm' },
    { key: 'weightKg', label: 'Weight', type: 'number', default: 70, suffix: 'kg' },
    { key: 'healthCondition', label: 'Health Condition', type: 'select', default: 'good', options: [
      { value: 'excellent', label: 'Excellent (no issues, ideal BMI)' },
      { value: 'good', label: 'Good (minor issues only)' },
      { value: 'average', label: 'Average (managed conditions)' },
      { value: 'poor', label: 'Poor (multiple conditions)' },
    ]},
    { key: 'familyHistory', label: 'Family Medical History', type: 'select', default: 'none', options: [
      { value: 'none', label: 'No major illnesses' },
      { value: 'some', label: 'Some conditions (diabetes, BP)' },
      { value: 'significant', label: 'Significant (heart, cancer before 60)' },
    ]},
    { key: 'occupation', label: 'Occupation Type', type: 'select', default: 'office', options: [
      { value: 'office', label: 'Office / IT / Professional' },
      { value: 'field', label: 'Field Sales / Outdoor Work' },
      { value: 'medical', label: 'Healthcare / Medical' },
      { value: 'govt', label: 'Government / Public Sector' },
      { value: 'hazardous', label: 'Mining / Construction / Heavy Industry' },
      { value: 'extreme', label: 'Aviation / Military / Extreme Sports' },
    ]},

    { key: '_ins_s1', label: 'Income & Financial Details', type: 'section' },
    { key: 'monthlyIncome', label: 'Monthly Income (Net)', type: 'number', default: 120000, prefix: '₹' },
    { key: 'monthlyExpenses', label: 'Monthly Personal Expenses', type: 'number', default: 40000, prefix: '₹' },
    { key: 'annualTaxes', label: 'Annual Taxes Paid', type: 'number', default: 200000, prefix: '₹' },
    { key: 'retirementAge', label: 'Planned Retirement Age', type: 'number', default: 60, suffix: 'years' },
    { key: 'policyTerm', label: 'Policy Term', type: 'number', default: 30, suffix: 'years' },
    { key: 'inflationRate', label: 'Inflation Rate', type: 'number', default: 6, suffix: '%' },

    { key: '_ins_s2', label: 'Liabilities & Loans', type: 'section' },
    { key: 'homeLoan', label: 'Home Loan Outstanding', type: 'number', default: 3000000, prefix: '₹' },
    { key: 'carLoan', label: 'Car/Personal Loans', type: 'number', default: 500000, prefix: '₹' },
    { key: 'businessLoan', label: 'Business Loan', type: 'number', default: 0, prefix: '₹' },
    { key: 'otherLiabilities', label: 'Other Liabilities', type: 'number', default: 0, prefix: '₹' },

    { key: '_ins_family', label: 'Family & Dependents', type: 'section' },
    { key: 'maritalStatus', label: 'Marital Status', type: 'select', default: 'married', options: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' },
    ]},
    { key: 'spouseWorking', label: 'Spouse Employment', type: 'select', default: 'no', options: [
      { value: 'no', label: 'Not Working / Homemaker' },
      { value: 'yes', label: 'Working (has income)' },
    ]},
    { key: 'spouseIncome', label: 'Spouse Monthly Income', type: 'number', default: 0, prefix: '₹' },
    { key: 'dependents', label: 'Total Dependents (excluding spouse)', type: 'number', default: 2 },
    { key: 'childCount', label: 'Number of Children', type: 'number', default: 1 },
    { key: 'elderlyParents', label: 'Elderly Parents Dependent', type: 'number', default: 2 },
    { key: 'hasSpecialNeeds', label: 'Special Needs Dependent?', type: 'select', default: 'no', options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes (requires lifelong care)' },
    ]},
    { key: 'specialNeedsFund', label: 'Special Needs Fund Required', type: 'number', default: 0, prefix: '₹' },

    { key: '_ins_s3', label: 'Child Education Goals', type: 'section' },
    { key: 'childEduCostToday', label: 'Education Cost Today (per child)', type: 'number', default: 2500000, prefix: '₹' },
    { key: 'eduInYears', label: 'Education Needed In', type: 'number', default: 12, suffix: 'years' },

    { key: '_ins_goals', label: 'Other Financial Goals', type: 'section' },
    { key: 'marriageFund', label: "Children's Marriage Fund", type: 'number', default: 1500000, prefix: '₹' },
    { key: 'retirementCorpusGap', label: 'Retirement Corpus Gap (if any)', type: 'number', default: 0, prefix: '₹' },

    { key: '_ins_s4', label: 'Existing Coverage', type: 'section' },
    { key: 'existingCover', label: 'Existing Life Cover (personal)', type: 'number', default: 0, prefix: '₹' },
    { key: 'employerCover', label: 'Employer Group Cover', type: 'number', default: 0, prefix: '₹' },
    { key: 'existingHealthCover', label: 'Existing Health Cover', type: 'number', default: 0, prefix: '₹' },

    { key: '_ins_s5', label: 'Buffers & Final Expenses', type: 'section' },
    { key: 'finalExpenses', label: 'Final Expenses (funeral, etc.)', type: 'number', default: 500000, prefix: '₹' },
    { key: 'emergencyFundMonths', label: 'Emergency Fund Buffer', type: 'number', default: 6, suffix: 'months' },

    { key: '_ins_riders', label: 'Rider Preferences', type: 'section' },
    { key: 'wantAccidentalDeath', label: 'Accidental Death Benefit', type: 'select', default: 'yes', options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes (recommended)' },
    ]},
    { key: 'wantCriticalIllness', label: 'Critical Illness Rider', type: 'select', default: 'yes', options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes (recommended)' },
    ]},
    { key: 'wantWaiverOfPremium', label: 'Waiver of Premium', type: 'select', default: 'yes', options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes (covers on disability)' },
    ]},
    { key: 'wantIncomeProtection', label: 'Income Protection Rider', type: 'select', default: 'no', options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes (monthly payout on death)' },
    ]},

    { key: '_ins_payout', label: 'Payout Preferences', type: 'section' },
    { key: 'payoutType', label: 'Death Benefit Payout', type: 'select', default: 'lumpsum', options: [
      { value: 'lumpsum', label: 'Lump Sum (one-time)' },
      { value: 'monthly', label: 'Monthly Income (for family)' },
      { value: 'both', label: 'Lump Sum + Monthly Income' },
    ]},
    { key: 'premiumFrequency', label: 'Premium Payment Frequency', type: 'select', default: 'annual', options: [
      { value: 'monthly', label: 'Monthly (+5% loading)' },
      { value: 'quarterly', label: 'Quarterly (+3% loading)' },
      { value: 'halfyearly', label: 'Half-Yearly (+2% loading)' },
      { value: 'annual', label: 'Annual (no loading)' },
    ]},

    { key: '_ins_health', label: 'Health Insurance (if selected)', type: 'section' },
    { key: 'healthCoverType', label: 'Health Cover Type', type: 'select', default: 'individual', options: [
      { value: 'individual', label: 'Individual' },
      { value: 'family', label: 'Family Floater' },
    ]},
    { key: 'familyMembers', label: 'Family Members (for floater)', type: 'number', default: 4 },
    { key: 'city', label: 'City Type', type: 'select', default: 'metro', options: [
      { value: 'metro', label: 'Metro (Mumbai/Delhi/Bangalore)' },
      { value: 'tier1', label: 'Tier-1 (Pune/Chennai/Hyderabad)' },
      { value: 'tier2', label: 'Tier-2 (Jaipur/Lucknow/etc.)' },
      { value: 'tier3', label: 'Tier-3 / Rural' },
    ]},

    { key: '_ins_ci', label: 'Critical Illness (if selected)', type: 'section' },
    { key: 'ciCover', label: 'CI Cover Amount', type: 'number', default: 2500000, prefix: '₹' },
  ],
  ppf: [
    { key: 'yearly', label: 'Yearly Investment', type: 'number', default: 150000, prefix: '₹' },
    { key: 'years', label: 'Investment Period', type: 'number', default: 15, suffix: 'years' },
  ],
  epf: [
    { key: 'basicSalary', label: 'Basic Salary', type: 'number', default: 50000, prefix: '₹' },
    { key: 'years', label: 'Years to Retire', type: 'number', default: 25, suffix: 'years' },
    { key: 'empContrib', label: 'Employee %', type: 'number', default: 12, suffix: '%' },
    { key: 'companyContrib', label: 'Employer %', type: 'number', default: 12, suffix: '%' },
  ],
  nps: [
    { key: 'monthly', label: 'Monthly Investment', type: 'number', default: 5000, prefix: '₹' },
    { key: 'years', label: 'Years to Retire', type: 'number', default: 30, suffix: 'years' },
    { key: 'rate', label: 'Expected Return', type: 'number', default: 10, suffix: '%' },
  ],
  elss: [
    { key: 'monthly', label: 'Monthly Investment', type: 'number', default: 12500, prefix: '₹' },
    { key: 'years', label: 'Investment Period', type: 'number', default: 10, suffix: 'years' },
  ],
  emi: [
    { key: 'principal', label: 'Loan Amount', type: 'number', default: 1000000, prefix: '₹' },
    { key: 'rate', label: 'Interest Rate', type: 'number', default: 9, suffix: '%' },
    { key: 'years', label: 'Loan Tenure', type: 'number', default: 5, suffix: 'years' },
  ],
  swp: [
    { key: 'corpus', label: 'Initial Corpus', type: 'number', default: 5000000, prefix: '₹' },
    { key: 'withdrawal', label: 'Monthly Withdrawal', type: 'number', default: 40000, prefix: '₹' },
    { key: 'rate', label: 'Expected Return', type: 'number', default: 8, suffix: '%' },
    { key: 'years', label: 'Withdrawal Period', type: 'number', default: 20, suffix: 'years' },
  ],
  stepup: [
    { key: 'initial', label: 'Initial Monthly SIP', type: 'number', default: 10000, prefix: '₹' },
    { key: 'stepUp', label: 'Annual Step-Up', type: 'number', default: 10, suffix: '%' },
    { key: 'years', label: 'Investment Period', type: 'number', default: 15, suffix: 'years' },
    { key: 'rate', label: 'Expected Return', type: 'number', default: 12, suffix: '%' },
  ],
  cagr: [
    { key: 'initial', label: 'Initial Value', type: 'number', default: 100000, prefix: '₹' },
    { key: 'final', label: 'Final Value', type: 'number', default: 250000, prefix: '₹' },
    { key: 'years', label: 'Time Period', type: 'number', default: 5, suffix: 'years' },
  ],
  inflation: [
    { key: 'current', label: 'Current Value', type: 'number', default: 100000, prefix: '₹' },
    { key: 'years', label: 'Years Ahead', type: 'number', default: 20, suffix: 'years' },
    { key: 'rate', label: 'Inflation Rate', type: 'number', default: 6, suffix: '%' },
  ],
  gratuity: [
    { key: 'basicSalary', label: 'Last Basic Salary', type: 'number', default: 50000, prefix: '₹' },
    { key: 'yearsOfService', label: 'Years of Service', type: 'number', default: 15, suffix: 'years' },
  ],
  hra: [
    { key: 'basic', label: 'Basic Salary', type: 'number', default: 50000, prefix: '₹' },
    { key: 'hra', label: 'HRA Received', type: 'number', default: 25000, prefix: '₹' },
    { key: 'rentPaid', label: 'Rent Paid', type: 'number', default: 20000, prefix: '₹' },
    { key: 'metro', label: 'Metro City?', type: 'select', default: 'true', options: [
      { value: 'true', label: 'Yes (Delhi/Mumbai/etc)' },
      { value: 'false', label: 'No' },
    ]},
  ],
  tax: [
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPREHENSIVE TAX CALCULATOR INPUTS - FY 2025-26
    // ═══════════════════════════════════════════════════════════════════════════
    { key: '_tax_s0', label: '📋 Basic Details', type: 'section' },
    { key: 'age', label: 'Age', type: 'number', default: 30, suffix: 'years' },
    { key: 'regime', label: 'Tax Regime', type: 'select', default: 'new', options: [
      { value: 'new', label: 'New Regime (FY 2025-26 Budget rates)' },
      { value: 'old', label: 'Old Regime (with deductions)' },
    ]},
    { key: 'includeStandardDeduction', label: 'Standard Deduction', type: 'select', default: 'true', options: [
      { value: 'true', label: 'Include (₹75K new / ₹50K old)' },
      { value: 'false', label: 'Exclude' },
    ]},

    { key: '_tax_income', label: '💰 Income from Salary', type: 'section' },
    { key: 'grossIncome', label: 'Gross Salary (Annual)', type: 'number', default: 1500000, prefix: '₹' },
    { key: 'professionalTax', label: 'Professional Tax Deducted', type: 'number', default: 2500, prefix: '₹' },

    { key: '_tax_other', label: '📈 Other Income Sources', type: 'section' },
    { key: 'otherIncome', label: 'Other Income (Freelance/Business)', type: 'number', default: 0, prefix: '₹' },
    { key: 'interestIncome', label: 'Interest Income (FD/RD/Savings)', type: 'number', default: 0, prefix: '₹' },
    { key: 'dividendIncome', label: 'Dividend Income', type: 'number', default: 0, prefix: '₹' },
    { key: 'rentalIncome', label: 'Rental Income (Annual)', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_cg', label: '📊 Capital Gains', type: 'section' },
    { key: 'stcgEquity', label: 'STCG - Equity/MF (taxed @ 20%)', type: 'number', default: 0, prefix: '₹' },
    { key: 'stcgOther', label: 'STCG - Other (taxed at slab)', type: 'number', default: 0, prefix: '₹' },
    { key: 'ltcgEquity', label: 'LTCG - Equity/MF (12.5% above ₹1.25L)', type: 'number', default: 0, prefix: '₹' },
    { key: 'ltcgOther', label: 'LTCG - Property/Other (12.5%)', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_80c', label: '🏛️ Section 80C (Max ₹1.5L)', type: 'section' },
    { key: 'deduction80C', label: '80C Total (PPF/ELSS/LIC/EPF/Tuition)', type: 'number', default: 150000, prefix: '₹' },
    { key: 'deduction80CCD1B', label: '80CCD(1B) NPS - Additional (Max ₹50K)', type: 'number', default: 0, prefix: '₹' },
    { key: 'employerNps80ccd2', label: '80CCD(2) Employer NPS Contribution', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_health', label: '🏥 Health & Disability (Section 80D/DD/DDB/U)', type: 'section' },
    { key: 'deduction80D', label: '80D Health Insurance (Self+Parents)', type: 'number', default: 25000, prefix: '₹' },
    { key: 'deduction80DD', label: '80DD Disabled Dependent (Max ₹1.25L)', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80DDB', label: '80DDB Medical Treatment', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80U', label: '80U Self Disability (Max ₹1.25L)', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_loans', label: '🏠 Loans & Interest', type: 'section' },
    { key: 'homeLoanInterest24b', label: 'Home Loan Interest 24(b) (Max ₹2L)', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80E', label: '80E Education Loan Interest', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80EEA', label: '80EEA Affordable Housing Int. (Max ₹1.5L)', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80EEB', label: '80EEB EV Loan Interest (Max ₹1.5L)', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_other_ded', label: '📑 Other Deductions', type: 'section' },
    { key: 'deduction80TTA', label: '80TTA/TTB Savings Interest (₹10K/<60 or ₹50K/60+)', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80G', label: '80G Donations', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80GG', label: '80GG Rent (No HRA, Max ₹60K/year)', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_exempt', label: '🎯 Exemptions (Old Regime)', type: 'section' },
    { key: 'hraExemption', label: 'HRA Exemption (use HRA calculator)', type: 'number', default: 0, prefix: '₹' },
    { key: 'ltcExemption', label: 'LTA Exemption Claimed', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_prepaid', label: '💳 Taxes Already Paid', type: 'section' },
    { key: 'tdsAlreadyPaid', label: 'TDS Deducted (Form 16/26AS)', type: 'number', default: 0, prefix: '₹' },
    { key: 'advanceTaxPaid', label: 'Advance Tax Paid', type: 'number', default: 0, prefix: '₹' },
  ],
  rd: [
    { key: 'monthly', label: 'Monthly Deposit', type: 'number', default: 10000, prefix: '₹' },
    { key: 'years', label: 'Tenure', type: 'number', default: 5, suffix: 'years' },
    { key: 'rate', label: 'Interest Rate', type: 'number', default: 6.5, suffix: '%' },
  ],
  ssy: [
    { key: 'yearly', label: 'Yearly Deposit', type: 'number', default: 150000, prefix: '₹' },
    { key: 'years', label: 'Deposit Years', type: 'number', default: 15, suffix: 'years' },
  ],
  wealth: [
    { key: '_wealth_s0', label: 'Portfolio Details', type: 'section' },
    { key: 'current', label: 'Current Portfolio Value', type: 'number', default: 5000000, prefix: '₹' },
    { key: 'target', label: 'Target Wealth', type: 'number', default: 50000000, prefix: '₹' },
    { key: 'years', label: 'Investment Horizon', type: 'number', default: 10, suffix: 'years' },
    { key: '_wealth_s1', label: 'Returns & Fees', type: 'section' },
    { key: 'expectedReturn', label: 'Expected Return (PMS avg: 15-20%)', type: 'number', default: 15, suffix: '%' },
    { key: 'pmsFee', label: 'PMS Management Fee', type: 'number', default: 2, suffix: '%' },
    { key: 'performanceFee', label: 'Performance Fee (above hurdle)', type: 'number', default: 20, suffix: '%' },
    { key: 'hurdleRate', label: 'Hurdle Rate', type: 'number', default: 10, suffix: '%' },
  ],
  mfReturns: [
    { key: '_mf_s0', label: '📊 Fund Details', type: 'section' },
    { key: 'fundType', label: 'Fund Type', type: 'select', default: 'equity', options: [
      { value: 'equity', label: 'Equity Fund' },
      { value: 'elss', label: 'ELSS (Tax Saver)' },
      { value: 'debt', label: 'Debt Fund' },
      { value: 'hybrid-equity', label: 'Hybrid (Equity 65%+)' },
      { value: 'hybrid-debt', label: 'Hybrid (Debt-oriented)' },
      { value: 'liquid', label: 'Liquid Fund' },
      { value: 'index', label: 'Index Fund' },
    ]},
    { key: 'years', label: 'Holding Period', type: 'number', default: 3, suffix: 'years' },
    
    { key: '_mf_s1', label: '💰 Investment Values', type: 'section' },
    { key: 'invested', label: 'Amount Invested', type: 'number', default: 500000, prefix: '₹' },
    { key: 'current', label: 'Current Value', type: 'number', default: 750000, prefix: '₹' },
    { key: 'dividendReceived', label: 'Dividends Received (if any)', type: 'number', default: 0, prefix: '₹' },
    
    { key: '_mf_s2', label: '📑 Costs & Tax', type: 'section' },
    { key: 'exitLoadPercent', label: 'Exit Load', type: 'number', default: 0, suffix: '%' },
    { key: 'expenseRatio', label: 'Expense Ratio (TER)', type: 'number', default: 1.5, suffix: '%' },
    { key: 'taxSlabPercent', label: 'Your Income Tax Slab', type: 'number', default: 30, suffix: '%' },
  ],

  lic: [
    { key: '_lic_s0', label: '📋 Policy Type', type: 'section' },
    { key: 'policyType', label: 'Policy Type', type: 'select', default: 'endowment', options: [
      { value: 'endowment', label: 'Endowment Plan' },
      { value: 'whole-life', label: 'Whole Life Plan' },
      { value: 'money-back', label: 'Money Back Plan' },
      { value: 'ulip', label: 'ULIP' },
      { value: 'term', label: 'Term Insurance' },
    ]},
    { key: 'age', label: 'Age at Entry', type: 'number', default: 30, suffix: 'years' },
    
    { key: '_lic_s1', label: '💰 Sum Assured & Term', type: 'section' },
    { key: 'sumAssured', label: 'Sum Assured', type: 'number', default: 1000000, prefix: '₹' },
    { key: 'policyTermYears', label: 'Policy Term', type: 'number', default: 20, suffix: 'years' },
    { key: 'premiumPayingYears', label: 'Premium Paying Term', type: 'number', default: 15, suffix: 'years' },
    
    { key: '_lic_s2', label: '📊 Premium & Bonus', type: 'section' },
    { key: 'annualPremium', label: 'Annual Premium', type: 'number', default: 60000, prefix: '₹' },
    { key: 'riderPremium', label: 'Rider Premium (if any)', type: 'number', default: 0, prefix: '₹' },
    { key: 'bonusRatePerThousand', label: 'Bonus Rate per ₹1000 SA', type: 'number', default: 40 },
    { key: 'loyaltyAddition', label: 'Loyalty Addition (if any)', type: 'number', default: 0, prefix: '₹' },
    { key: 'finalAdditionalBonus', label: 'Final Additional Bonus', type: 'number', default: 0, prefix: '₹' },
    
    { key: '_lic_s3', label: '🔄 Surrender Analysis', type: 'section' },
    { key: 'yearsPaid', label: 'Years Premium Paid', type: 'number', default: 5, suffix: 'years' },
  ],
  childPlan: [
    { key: 'childAge', label: 'Child\'s Age', type: 'number', default: 5, suffix: 'years' },
    { key: 'eduAge', label: 'Education Age', type: 'number', default: 18, suffix: 'years' },
    { key: 'cost', label: 'Education Cost Today', type: 'number', default: 2000000, prefix: '₹' },
  ],
  marriage: [
    { key: 'currentAge', label: 'Child\'s Age', type: 'number', default: 10, suffix: 'years' },
    { key: 'marriageAge', label: 'Marriage Age', type: 'number', default: 25, suffix: 'years' },
    { key: 'cost', label: 'Wedding Cost Today', type: 'number', default: 3000000, prefix: '₹' },
  ],
  carLoan: [
    { key: 'price', label: 'Car Price', type: 'number', default: 1000000, prefix: '₹' },
    { key: 'downPayment', label: 'Down Payment', type: 'number', default: 200000, prefix: '₹' },
    { key: 'rate', label: 'Interest Rate', type: 'number', default: 8.5, suffix: '%' },
    { key: 'years', label: 'Loan Tenure', type: 'number', default: 5, suffix: 'years' },
  ],
  homeLoan: [
    { key: 'price', label: 'Property Price', type: 'number', default: 5000000, prefix: '₹' },
    { key: 'downPayment', label: 'Down Payment', type: 'number', default: 1000000, prefix: '₹' },
    { key: 'rate', label: 'Interest Rate', type: 'number', default: 8.5, suffix: '%' },
    { key: 'years', label: 'Loan Tenure', type: 'number', default: 20, suffix: 'years' },
  ],
  gold: [
    { key: 'amount', label: 'Investment Amount', type: 'number', default: 100000, prefix: '₹' },
    { key: 'years', label: 'Investment Period', type: 'number', default: 10, suffix: 'years' },
    { key: 'rate', label: 'Expected Return', type: 'number', default: 8, suffix: '%' },
  ],
};

// Default config for calculators without specific inputs
const defaultInputConfig = [
  { key: 'amount', label: 'Amount', type: 'number', default: 100000, prefix: '₹' },
  { key: 'years', label: 'Years', type: 'number', default: 10, suffix: 'years' },
  { key: 'rate', label: 'Rate', type: 'number', default: 10, suffix: '%' },
];

export default function AllInOneCalculator() {
  const [selectedCalc, setSelectedCalc] = useState('wealth');
  const [search, setSearch] = useState('');
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const resultsPanelRef = useRef(null);

  const calc = CALCULATORS[selectedCalc];
  const config = inputConfigs[selectedCalc] || defaultInputConfig;

  const filteredCalculators = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    const all = Object.values(CALCULATORS);
    if (!q) return all;

    return all.filter((c) => {
      const hay = `${c.label} ${c.desc} ${c.key}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search]);

  // Initialize inputs when calculator changes
  useMemo(() => {
    const initial = {};
    config.forEach(input => {
      if (input.type === 'section') return;
      initial[input.key] = input.default;
    });
    setInputs(initial);
    setResult(null);
  }, [selectedCalc]);

  const handleInputChange = useCallback((key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  // PDF Export Function
  const handleExportPDF = useCallback(async () => {
    if (!result || result.error) return;
    
    trackEvent('calculator_export_pdf', {
      calculator_type: 'aio',
      calc: selectedCalc,
    });

    const interpretation = getInterpretation(selectedCalc, result, inputs);
    const timestamp = new Date().toLocaleString('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });

    // Build input display
    const inputDisplay = config
      .filter(c => c.type !== 'section')
      .map(c => {
        const val = inputs[c.key];
        const formatted = c.type === 'number' 
          ? (c.prefix || '') + Number(val || 0).toLocaleString('en-IN') + (c.suffix ? ' ' + c.suffix : '')
          : String(val || '');
        return `${c.label}: ${formatted}`;
      })
      .join('\n');

    // Build result display
    const resultDisplay = Object.entries(result)
      .filter(([k, v]) => !k.startsWith('__') && !Array.isArray(v) && typeof v !== 'object')
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        const formatted = typeof v === 'number' 
          ? (k.toLowerCase().includes('rate') || k.toLowerCase().includes('percent') || k.toLowerCase().includes('cagr')
              ? v.toFixed(2) + '%'
              : fmt(v))
          : String(v);
        return `${label}: ${formatted}`;
      })
      .join('\n');

    // Create PDF content as HTML
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${calc?.label || 'Calculator'} - BM Wealth</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #1a1a1a; font-size: 14px; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.9); padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: rgba(255,255,255,0.9); }
    .timestamp { font-size: 12px; color: #666; }
    h1 { font-size: 22px; color: #1a1a1a; margin-bottom: 8px; }
    h2 { font-size: 16px; color: rgba(255,255,255,0.9); margin: 24px 0 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
    .section { background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 16px; white-space: pre-line; }
    .interpretation { background: #fef9e7; border-left: 4px solid rgba(255,255,255,0.9); padding: 16px; margin: 20px 0; }
    .decision-gap { background: #e8f4f8; border-left: 4px solid rgba(255, 255, 255, 0.9); padding: 12px 16px; margin: 16px 0; font-weight: 600; }
    .disclaimer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #666; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
    .footer a { color: rgba(255,255,255,0.9); text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">👑 BM Wealth</div>
      <div style="font-size: 12px; color: #666;">ARN 90008 | IRDAI 277925</div>
    </div>
    <div class="timestamp">Generated: ${timestamp}</div>
  </div>
  
  <h1>${calc?.icon || ''} ${calc?.label || 'Calculator'}</h1>
  <p style="color: #666; margin-bottom: 20px;">${calc?.desc || ''}</p>
  
  <h2>Your Inputs</h2>
  <div class="section">${inputDisplay}</div>
  
  <h2>Results</h2>
  <div class="section">${resultDisplay}</div>
  
  ${interpretation ? `
  <h2>Interpretation</h2>
  <div class="interpretation">${interpretation.text}</div>
  ${interpretation.decisionGap ? `<div class="decision-gap">📊 ${interpretation.decisionGap}</div>` : ''}
  ` : ''}
  
  <div class="disclaimer">
    <strong>Disclaimer:</strong> This calculator is for educational and illustrative purposes only. Results depend on the inputs provided and assumptions used. 
    Market-linked investments are subject to market risks. Past performance is not indicative of future results. 
    Please consult a qualified financial advisor before making investment decisions. BM Wealth does not provide personalized advice through this tool.
    <br><br>
    <strong>Regulatory:</strong> AMFI ARN-90008 | IRDAI CA0650 | SEBI RIA (Application pending)
  </div>
  
  <div class="footer">
    <p>BM Wealth • Mumbai</p>
    <p><a href="https://bmwealth.in">bmwealth.in</a> • +91 88509 77259</p>
  </div>
</body>
</html>`;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }, [result, selectedCalc, calc, config, inputs]);

  // WhatsApp CTA for soft review
  const handleReviewCTA = useCallback(() => {
    trackEvent('calculator_review_cta', {
      calculator_type: 'aio',
      calc: selectedCalc,
    });
    
    const message = `Hi BM Wealth, I used the ${calc?.label || 'calculator'} on your website and would like to discuss my results. Can you help me understand my options?`;
    const phone = '918850977259';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }, [selectedCalc, calc]);

  const handleCalculate = useCallback(() => {
    trackEvent('calculator_calculate', {
      calculator_type: 'aio',
      calc: selectedCalc,
    });

    const calcFn = calculations[selectedCalc];
    if (!calcFn) {
      setResult({ error: 'Calculator not implemented' });
      return;
    }

    try {
      const args = config
        .filter((c) => c.type !== 'section')
        .map((c) => {
          const val = inputs[c.key];
          return c.type === 'number' ? parseFloat(val) || 0 : val;
        });
      const res = calcFn(...args);
      setResult(res);

      // UX: on mobile, open results sheet; on desktop, focus results panel.
      if (isNarrow) {
        setMobileResultsOpen(true);
      } else {
        requestAnimationFrame(() => {
          try {
            resultsPanelRef.current?.focus?.();
          } catch (e) {
            // ignore
          }
        });
      }
    } catch (err) {
      setResult({ error: err.message });
      if (isNarrow) setMobileResultsOpen(true);
    }
  }, [selectedCalc, inputs, config, isNarrow]);

  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams();
    params.set('c', selectedCalc);

    const inputKeys = config.filter((c) => c.type !== 'section').map((c) => c.key);
    const payload = {
      v: 1,
      i: inputKeys.reduce((acc, key) => {
        const val = inputs[key];
        if (val === undefined || val === null || val === '') return acc;
        acc[key] = val;
        return acc;
      }, {}),
    };

    params.set('s', base64UrlEncode(JSON.stringify(payload)));
    params.set('utm_source', 'share');
    params.set('utm_medium', 'referral');
    params.set('utm_campaign', `aio_${String(selectedCalc || 'calc')}`);

    return `${window.location.origin}/tools/all-calculators?${params.toString()}`;
  }, [selectedCalc, inputs, config]);

  // Generate a share URL with OG meta params for better link previews
  const getSocialShareUrl = useCallback((title, description) => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams();
    params.set('c', selectedCalc);

    const inputKeys = config.filter((c) => c.type !== 'section').map((c) => c.key);
    const payload = {
      v: 1,
      i: inputKeys.reduce((acc, key) => {
        const val = inputs[key];
        if (val === undefined || val === null || val === '') return acc;
        acc[key] = val;
        return acc;
      }, {}),
    };

    params.set('s', base64UrlEncode(JSON.stringify(payload)));
    params.set('utm_source', 'share');
    params.set('utm_medium', 'referral');
    params.set('utm_campaign', `aio_${String(selectedCalc || 'calc')}`);
    
    // Add OG meta params for link preview
    if (title) params.set('title', encodeURIComponent(title));
    if (description) params.set('desc', encodeURIComponent(description));

    // Use the share page which has dynamic OG meta
    return `${window.location.origin}/tools/calc-share?${params.toString()}`;
  }, [selectedCalc, inputs, config]);

  const addUtmContent = useCallback((rawUrl, content) => {
    try {
      if (!rawUrl) return '';
      const u = new URL(rawUrl);
      if (content) u.searchParams.set('utm_content', String(content));
      return u.toString();
    } catch {
      return rawUrl || '';
    }
  }, []);

  const getUtmSnapshot = useCallback(() => {
    try {
      if (typeof window === 'undefined') return {};
      const p = new URLSearchParams(window.location.search);
      return {
        utm_source: p.get('utm_source') || null,
        utm_medium: p.get('utm_medium') || null,
        utm_campaign: p.get('utm_campaign') || null,
        utm_content: p.get('utm_content') || null,
      };
    } catch {
      return {};
    }
  }, []);

  const handleCopyShareLink = useCallback(async () => {
    const url = addUtmContent(getShareUrl(), 'copy_link');
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);

      trackEvent('calculator_share', {
        calculator_type: 'aio',
        calc: selectedCalc,
        method: 'copy_link',
        utm_campaign: `aio_${String(selectedCalc || 'calc')}`,
      });
    } catch (e) {
      // ignore
    }
  }, [getShareUrl, addUtmContent, selectedCalc]);

  const getShareMeta = useCallback(() => {
    const label = CALCULATORS[selectedCalc]?.label || 'Calculator';
    const baseTitle = `BM Wealth — ${label}`;
    const fallbackText = `Open this BM Wealth calculator (prefilled) to review and adjust inputs.`;

    if (!result || result.error) {
      return { title: baseTitle, text: fallbackText, url: getSocialShareUrl(baseTitle, fallbackText) };
    }

    try {
      if (selectedCalc === 'insurance') {
        const cover = fmt(result.recommendedCover);
        const coverLow = fmt(result.coverLow);
        const coverHigh = fmt(result.coverHigh);
        const annual = `${fmt(result.annualPremiumLow)} – ${fmt(result.annualPremiumHigh)}`;
        const monthly = `${fmt(result.monthlyPremiumLow)} – ${fmt(result.monthlyPremiumHigh)}`;
        const title = `${baseTitle} — Insurance Coverage Blueprint`;
        const text = `Insurance cover estimate: ${cover} (range ${coverLow} – ${coverHigh}). Premium estimate: ${annual}/yr (${monthly}/mo). Open the tool to fine-tune:`;
        return { title, text, url: getSocialShareUrl(title, text) };
      }

      if (selectedCalc === 'sip') {
        const monthly = inputs?.monthlyInvestment ? fmt(Number(inputs.monthlyInvestment) || 0) : null;
        const years = inputs?.years ? Number(inputs.years) : null;
        const fvMid = fmt(result.futureValueMid);
        const fvLow = fmt(result.futureValueLow);
        const fvHigh = fmt(result.futureValueHigh);
        const invested = fmt(result.invested);
        const stepUp = Number(result.stepUpPercent || 0);
        const head = monthly && years ? `SIP ${monthly}/mo for ${years}y` : 'SIP projection';
        const step = stepUp > 0 ? ` with ${stepUp.toFixed(0)}% step-up` : '';
        const title = `${baseTitle} — SIP Projection`;
        const text = `${head}${step}. Total invested: ${invested}. Future value (mid): ${fvMid}; range: ${fvLow} – ${fvHigh}. Open the calculator to adjust assumptions:`;
        return { title, text, url: getSocialShareUrl(title, text) };
      }

      if (selectedCalc === 'mfReturns') {
        const invested = fmt(result.invested);
        const current = fmt(result.current);
        const postTax = fmt(result.postTaxValue);
        const postTaxCagr = Number(result.postTaxCagrPercent || 0).toFixed(2);
        const taxType = String(result.taxType || '').trim();
        const title = `${baseTitle} — Mutual Fund Return`;
        const text = `MF snapshot: invested ${invested}, current ${current}. Post-tax value: ${postTax} (post-tax CAGR ~${postTaxCagr}%). Tax basis: ${taxType || 'estimate'}. Open the tool to verify details:`;
        return { title, text, url: getSocialShareUrl(title, text) };
      }

      if (selectedCalc === 'lic') {
        const sumAssured = fmt(result.sumAssured);
        const premium = fmt(result.annualPremium);
        const maturity = fmt(result.maturityValue);
        const irr = Number(result.irrPercent || 0).toFixed(2);
        const term = result.policyTermYears;
        const ppt = result.premiumPayingYears;
        const title = `${baseTitle} — LIC Estimate`;
        const text = `LIC estimate: Sum Assured ${sumAssured}. Premium ${premium}/yr. Term ${term}y (PPT ${ppt}y). Maturity ~${maturity}; IRR ~${irr}%. Open the tool for an illustrative breakdown:`;
        return { title, text, url: getSocialShareUrl(title, text) };
      }

      if (selectedCalc === 'tax') {
        const regime = String(result.regime || '').toUpperCase();
        const taxable = fmt(result.taxableIncome);
        const tax = fmt(result.taxLiability);
        const eff = Number(result.effectiveRatePercent || 0).toFixed(2);
        const title = `${baseTitle} — Income Tax`;
        const text = `Income tax estimate (${regime}): taxable ${taxable}, tax (incl. cess) ${tax}. Effective rate ~${eff}%. Open the calculator to review slabs & deductions:`;
        return { title, text, url: getSocialShareUrl(title, text) };
      }
    } catch (e) {
      // ignore and fall back
    }

    return { title: baseTitle, text: fallbackText, url: getSocialShareUrl(baseTitle, fallbackText) };
  }, [getShareUrl, getSocialShareUrl, selectedCalc, result, inputs]);

  const handleShareNative = useCallback(async () => {
    const meta = getShareMeta();
    const url = addUtmContent(meta.url, 'native_share');
    const title = meta.title;
    const text = meta.text;
    if (!url) return;

    trackEvent('calculator_share', {
      calculator_type: 'aio',
      calc: selectedCalc,
      method: 'native',
      utm_campaign: `aio_${String(selectedCalc || 'calc')}`,
    });

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (e) {
      // ignore
    }

    await handleCopyShareLink();
  }, [getShareMeta, handleCopyShareLink, addUtmContent, selectedCalc]);

  const handleShareWhatsApp = useCallback(() => {
    const meta = getShareMeta();
    const url = addUtmContent(meta.url, 'whatsapp');
    const title = meta.title;
    const text = meta.text;
    if (!url || typeof window === 'undefined') return;
    // Format message with clear structure and clickable URL
    const message = `*${title}*

${text}

👉 Open calculator: ${url}`;
    trackEvent('calculator_share', {
      calculator_type: 'aio',
      calc: selectedCalc,
      method: 'whatsapp',
      utm_campaign: `aio_${String(selectedCalc || 'calc')}`,
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }, [getShareMeta, addUtmContent, selectedCalc]);

  const [emailOpen, setEmailOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailNote, setEmailNote] = useState('');

  const handleEmailResult = useCallback(async () => {
    if (!result || result.error) return;
    const name = String(leadName || '').trim();
    const email = String(leadEmail || '').trim();
    const phone = String(leadPhone || '').trim();
    if (name.length < 2 || !email.includes('@')) {
      setEmailNote('Please enter a valid name + email.');
      return;
    }

    setEmailBusy(true);
    setEmailNote('');
    const utm = getUtmSnapshot();

    try {
      trackEvent('calculator_email_submit', {
        calculator_type: 'aio',
        calc: selectedCalc,
        ...utm,
      });

      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || undefined }),
      });
      const leadJson = await leadRes.json().catch(() => ({}));
      if (!leadRes.ok || !leadJson?.ok || !leadJson?.lead?.id) {
        setEmailNote(leadJson?.error ? String(leadJson.error) : 'Lead save failed.');
        return;
      }

      trackEvent('lead_captured', {
        leadId: leadJson.lead.id,
        calculator_type: 'aio',
        source: 'aio_calc',
        calc: selectedCalc,
        email,
        phone: phone || null,
        ...utm,
        utm_campaign: utm?.utm_campaign || `aio_${String(selectedCalc || 'calc')}`,
      });

      const meta = getShareMeta();
      const shareUrl = addUtmContent(meta.url, 'email');

      const r = await fetch('/api/tools/aio/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: leadJson.lead.id,
          to: email,
          name,
          title: meta.title,
          text: meta.text,
          url: shareUrl,
          calc: selectedCalc,
          utm,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        trackEvent('calculator_email_failed', { calculator_type: 'aio', calc: selectedCalc, ...utm });
        setEmailNote(j?.error === 'not_configured' ? 'Email not configured on server yet.' : 'Email send failed.');
        return;
      }

      trackEvent('calculator_email_sent', { calculator_type: 'aio', calc: selectedCalc, ...utm });
      setEmailNote('Sent! Check your inbox.');
      setEmailOpen(false);
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
    } catch {
      setEmailNote('Something went wrong.');
    } finally {
      setEmailBusy(false);
    }
  }, [result, leadName, leadEmail, leadPhone, selectedCalc, getShareMeta, addUtmContent, getUtmSnapshot]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const p = new URLSearchParams(window.location.search);
      const hasPrefill = !!p.get('s') || !!p.get('c');
      const fromShare = String(p.get('utm_source') || '') === 'share';
      if (!hasPrefill && !fromShare) return;

      trackEvent('calculator_open', {
        calculator_type: 'aio',
        calc: p.get('c') || selectedCalc,
        utm_source: p.get('utm_source') || null,
        utm_medium: p.get('utm_medium') || null,
        utm_campaign: p.get('utm_campaign') || null,
        utm_content: p.get('utm_content') || null,
      });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyTaxSummary = useCallback(async () => {
    if (!result || result.error) return;
    try {
      const lines = [
        `BM Wealth — All in One Financial Calculator (Income Tax)`,
        `Regime: ${String(result.regime || '').toUpperCase()}`,
        `Gross Income: ${fmt(result.grossIncome)}`,
        `Deductions: ${fmt(result.deductions)}`,
        `Taxable Income: ${fmt(result.taxableIncome)}`,
        `Tax Liability (incl. cess): ${fmt(result.taxLiability)}`,
        `Monthly Tax (estimate): ${fmt(result.monthlyTax)}`,
        `Effective Rate: ${Number(result.effectiveRatePercent || 0).toFixed(2)}%`,
      ];

      const slabLines = Array.isArray(result.slabBreakdown)
        ? result.slabBreakdown.map((s) =>
            `- ${s.label}: ${fmt(s.amount)} @ ${Number(s.ratePercent).toFixed(2)}% = ${fmt(s.tax)}`
          )
        : [];

      const text = [...lines, '', 'Slab Breakdown:', ...slabLines].join('\n');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore
    }
  }, [result]);

  const handlePrintTax = useCallback(() => {
    if (typeof window !== 'undefined') window.print();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // responsive behavior for results panel
    const mq = window.matchMedia('(max-width: 900px)');
    const apply = () => setIsNarrow(!!mq.matches);
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener(apply);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // hydrate from share link
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('c') || params.get('calc');
      if (c && CALCULATORS[c]) setSelectedCalc(c);
      const s = params.get('s');
      if (s) {
        const decoded = JSON.parse(base64UrlDecode(s));
        if (decoded && decoded.i && typeof decoded.i === 'object') {
          setInputs(decoded.i);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // EXIT INTENT DETECTION - Show email capture when user tries to leave
  // ═══════════════════════════════════════════════════════════════
  const [showExitIntent, setShowExitIntent] = useState(false);
  const exitIntentShown = useRef(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseLeave = (e) => {
      // Only trigger when mouse leaves through top of viewport
      if (e.clientY <= 0 && result && !result.error && !exitIntentShown.current && !emailOpen) {
        exitIntentShown.current = true;
        setShowExitIntent(true);
        trackEvent('exit_intent_triggered', { calculator: selectedCalc, hasResult: !!result });
      }
    };
    
    // Wait 5 seconds before enabling exit intent
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [result, emailOpen, selectedCalc]);

  return (
    <div className="aio-calc">
      {/* Exit Intent Modal */}
      {showExitIntent && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowExitIntent(false)}
        >
          <div 
            style={{
              background: '#121212',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              border: '1px solid rgba(230,199,123,0.3)',
              boxShadow: '0 0 60px rgba(230,199,123,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#E6C77B', marginBottom: '8px' }}>
                Wait! Get Your Results Emailed
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                We'll send your insurance analysis + personalized recommendations
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text"
                placeholder="Your Name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <input 
                type="email"
                placeholder="Email Address"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <input 
                type="tel"
                placeholder="Phone (optional)"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <button
              onClick={() => {
                handleEmailResult();
                setShowExitIntent(false);
                trackEvent('exit_intent_submitted', { calculator: selectedCalc });
              }}
              disabled={emailBusy}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '14px',
                background: '#E6C77B',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: emailBusy ? 'wait' : 'pointer'
              }}
            >
              {emailBusy ? 'Sending...' : '📨 Email My Results'}
            </button>
            
            <button
              onClick={() => setShowExitIntent(false)}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '12px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              No thanks, I'll remember it
            </button>
            
            {emailNote && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: emailNote.includes('Thank') ? '#E6C77B' : '#ef4444', textAlign: 'center' }}>
                {emailNote}
              </div>
            )}
            
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
              🔒 We respect your privacy. No spam, ever.
            </div>
          </div>
        </div>
      )}

      {/* Premium Switcher */}
      <div className="aio-switcher">
        <div className="aio-switcher-top">
          <div className="aio-switcher-title">All in One Financial Calculator</div>
          <div className="aio-switcher-sub">Search + switch instantly</div>
        </div>

        <div className="aio-searchRow">
          <label className="aio-label" htmlFor="aio-search">Search Calculator</label>
          <div className="aio-searchWrap">
            <span className="aio-searchIcon" aria-hidden="true">⌕</span>
            <input
              id="aio-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try: tax, sip, emi, ppf, nps..."
              className="aio-search"
              inputMode="search"
              autoComplete="off"
            />
            {search ? (
              <button
                type="button"
                className="aio-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        <div className="aio-pills premium-scroll-x" role="tablist" aria-label="Calculator quick switch">
          {filteredCalculators.map((c) => {
            const active = c.key === selectedCalc;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? 'aio-pill aio-pillActive' : 'aio-pill'}
                onClick={() => setSelectedCalc(c.key)}
              >
                <span className="aio-pillIcon" aria-hidden="true">{c.icon}</span>
                <span className="aio-pillText">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Native select fallback (kept for accessibility / mobile) */}
        <div className="aio-nativeSelect">
          <label className="aio-label">Select Calculator</label>
          <select
            value={selectedCalc}
            onChange={(e) => setSelectedCalc(e.target.value)}
            className="aio-select"
          >
            {Object.values(CALCULATORS).map(c => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.label} - {c.desc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calculator Header */}
      <div className="aio-header">
        <span className="aio-icon">{calc.icon}</span>
        <div>
          <h3 className="aio-title">{calc.label} Calculator</h3>
          <p className="aio-desc">{calc.desc}</p>
        </div>
      </div>

      {(() => {
        const resultsBody = !result ? (
          <div className="aio-empty">
            Calculate to see results. Use Share to send a prefilled link.
          </div>
        ) : result.error ? (
          <p className="aio-error">{result.error}</p>
        ) : selectedCalc === 'insurance' ? (
          <div className="aio-panel premium-scroll">
            <div className="aio-panelTitle">
              {result.insuranceType === 'Health Insurance' ? '🏥 Health Insurance Analysis' :
               result.insuranceType === 'Critical Illness' ? '🩺 Critical Illness Analysis' :
               '🛡️ Life Insurance Coverage Blueprint'}
            </div>
            <div className="aio-panelSub">
              {result.insuranceType === 'Health Insurance' ? 
               'Premium comparison + tax benefits + checklist' :
               result.insuranceType === 'Critical Illness' ?
               'Coverage recommendation + insurer comparison' :
               'HLV-based cover + premium comparison + riders + tax benefits'}
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* GAMIFICATION: Protection Score + Social Proof + Badges */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {(() => {
              // Calculate Protection Score (0-100)
              const hlvCover = result.hlv?.presentValue || result.recommendedCover || 0;
              const selectedCover = result.recommendedCover || 0;
              const protectionScore = Math.min(100, Math.round((selectedCover / Math.max(hlvCover, selectedCover)) * 100));
              
              // Determine what's covered
              const hasIncomeReplacement = selectedCover >= (result.hlv?.netAnnualContribution * 5 || selectedCover * 0.4);
              const hasLiabilities = selectedCover >= (result.hlv?.totalLiabilities || 0);
              const hasChildEducation = result.selectedRiders?.some(r => r.toLowerCase().includes('child')) || selectedCover >= (result.hlv?.presentValue * 0.8 || selectedCover);
              const hasEmergencyFund = selectedCover >= (result.hlv?.presentValue || selectedCover);
              
              // Badges earned
              const badges = [];
              if (protectionScore >= 80) badges.push({ icon: '🛡️', name: 'Family Protector' });
              if (result.taxBenefits?.taxSaved > 0) badges.push({ icon: '💰', name: 'Tax Saver' });
              if (result.selectedRiders?.length >= 2) badges.push({ icon: '⭐', name: 'Smart Planner' });
              if (result.hlv) badges.push({ icon: '📊', name: 'Data-Driven' });
              if (result.insuranceType === 'Term Life') badges.push({ icon: '🎯', name: 'Term Expert' });
              
              // Mumbai-specific insights
              const mumbaiMultiplier = 1.3; // Mumbai costs 30% more
              const mumbaiAdjustedCover = selectedCover * mumbaiMultiplier;
              
              return (
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  {/* Protection Confidence Score */}
                  <div style={{ 
                    background: 'rgba(18,18,18,0.95)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                        🛡️ Your Protection Score
                      </div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: protectionScore >= 80 ? '#E6C77B' : protectionScore >= 60 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)'
                      }}>
                        {protectionScore}/100
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ 
                      height: '8px', 
                      background: 'rgba(255,255,255,0.1)', 
                      borderRadius: '4px', 
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${protectionScore}%`, 
                        background: protectionScore >= 80 ? 'linear-gradient(90deg, #E6C77B, #D4AF37)' : 
                                    protectionScore >= 60 ? 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.8))' : 
                                    'rgba(255,255,255,0.4)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    
                    {/* Coverage Checklist */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: hasIncomeReplacement ? '#E6C77B' : 'rgba(255,255,255,0.3)' }}>
                          {hasIncomeReplacement ? '✅' : '⬜'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>Income Replacement</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: hasLiabilities ? '#E6C77B' : 'rgba(255,255,255,0.3)' }}>
                          {hasLiabilities ? '✅' : '⬜'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>Liabilities Covered</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: hasChildEducation ? '#E6C77B' : 'rgba(255,255,255,0.3)' }}>
                          {hasChildEducation ? '✅' : '⬜'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>Child Education</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: hasEmergencyFund ? '#E6C77B' : 'rgba(255,255,255,0.3)' }}>
                          {hasEmergencyFund ? '✅' : '⬜'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>Emergency Buffer</span>
                      </div>
                    </div>
                    
                    {/* Improvement Tip */}
                    {protectionScore < 95 && (
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '10px 12px', 
                        background: 'rgba(230,199,123,0.1)', 
                        borderRadius: '6px',
                        borderLeft: '3px solid #E6C77B',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.8)'
                      }}>
                        💡 <strong>Tip:</strong> Add {fmt(Math.max(0, (result.hlv?.presentValue || selectedCover * 1.2) - selectedCover))} more to reach 95+ score
                      </div>
                    )}
                  </div>
                  
                  {/* Social Proof */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: '8px', 
                    padding: '12px 16px',
                    marginBottom: '12px',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>👥</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                        <strong style={{ color: '#E6C77B' }}>87%</strong> of professionals your age choose {fmt(selectedCover >= 10000000 ? 10000000 : 5000000)}+
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)' }}>
                      ⭐ 4.8/5 rating
                    </div>
                  </div>
                  
                  {/* Achievement Badges */}
                  {badges.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      {badges.map((badge, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '6px 12px',
                          background: 'rgba(230,199,123,0.1)',
                          border: '1px solid rgba(230,199,123,0.2)',
                          borderRadius: '20px',
                          fontSize: '11px',
                          color: '#E6C77B'
                        }}>
                          <span>{badge.icon}</span>
                          <span>{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Key Metrics */}
            <div className="aio-kpiGrid">
              <div className="aio-kpi aio-kpiGold">
                <div className="aio-kpiLabel">Recommended Cover</div>
                <div className="aio-kpiValue">{fmt(result.recommendedCover)}</div>
                {result.coverLow && result.coverHigh && (
                  <div className="aio-kpiMeta">Range: {fmt(result.coverLow)} – {fmt(result.coverHigh)}</div>
                )}
                {result.coverageMultiple && (
                  <div className="aio-kpiMeta">{result.coverageMultiple}x annual income</div>
                )}
              </div>
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Premium Range (Annual)</div>
                <div className="aio-kpiValue">{result.premiumRange || `${fmt(result.annualPremiumMid)}`}</div>
                <div className="aio-kpiMeta">{result.premiumFrequency || 'Annual'} payment</div>
              </div>
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Monthly Equivalent</div>
                <div className="aio-kpiValue">{fmt(result.monthlyPremiumLow || result.monthlyPremiumMid)} – {fmt(result.monthlyPremiumHigh || result.monthlyPremiumMid)}</div>
                <div className="aio-kpiMeta">Varies by insurer</div>
              </div>
            </div>

            {/* BMI Analysis */}
            {result.bmiAnalysis && (
              <div className="aio-section" style={{ background: 'rgba(0,0,0,0.85)', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📊</span> BMI Analysis
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>BMI</div>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: result.bmiAnalysis.bmi >= 25 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)' }}>
                      {result.bmiAnalysis.bmi}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Category</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{result.bmiAnalysis.category}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Height / Weight</div>
                    <div style={{ fontSize: '14px' }}>{result.bmiAnalysis.heightCm}cm / {result.bmiAnalysis.weightKg}kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Premium Impact</div>
                    <div style={{ fontSize: '14px', color: result.bmiAnalysis.impact.includes('+') ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)' }}>
                      {result.bmiAnalysis.impact}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HLV Analysis (for life insurance) */}
            {result.hlv && (
              <div
                className="aio-section"
                style={{
                  padding: '16px',
                  borderRadius: '0px',
                  marginTop: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💎</span> Human Life Value (HLV) Analysis
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontStyle: 'italic' }}>
                  {result.hlv.formula}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Net Annual Contribution</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{fmt(result.hlv.netAnnualContribution)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Years to Retirement</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{result.hlv.yearsToRetire} years</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Basic HLV</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{fmt(result.hlv.basicHLV)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Present Value (discounted)</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--lux-accent)' }}>{fmt(result.hlv.presentValue)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Insurer Comparison Table with Buy Now */}
            {Array.isArray(result.insurerQuotesWithLinks || result.insurerQuotes) && (result.insurerQuotesWithLinks || result.insurerQuotes).length > 0 && (
              <div className="aio-tableWrap" style={{ marginTop: '20px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📋</span> Premium Comparison by Insurer
                  </span>
                  <button
                    onClick={() => {
                      const html = generateInsurancePDF(result, inputs);
                      if (!html) return;
                      const blob = new Blob([html], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const win = window.open(url, '_blank');
                      if (win) {
                        win.onload = () => {
                          setTimeout(() => win.print(), 500);
                        };
                      }
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--lux-accent)',
                      border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, rgba(255,255,255,0.10))',
                      padding: '6px 12px',
                      borderRadius: '0px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    📄 Download Quote
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>
                  Sorted by premium (lowest first) • CSR = Claim Settlement Ratio • Click "Visit" to open the insurer website
                </div>
                <table className="aio-taxTable">
                  <thead>
                    <tr>
                      <th>Insurer</th>
                      <th className="right">CSR</th>
                      <th className="right">Annual</th>
                      <th className="right">Monthly</th>
                      {(result.insurerQuotesWithLinks || result.insurerQuotes)[0]?.premiumPerLakh && <th className="right">Per ₹1L</th>}
                      <th className="right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.insurerQuotesWithLinks || result.insurerQuotes).map((q, idx) => (
                      <tr key={`${q.name}-${idx}`} style={{ background: idx === 0 ? 'rgba(255, 255, 255,0.1)' : 'transparent' }}>
                        <td>
                          <span style={{ marginRight: '6px' }}>{q.logo}</span>
                          {q.name}
                          {idx === 0 && <span style={{ fontSize: '10px', color: 'var(--lux-accent)', marginLeft: '6px' }}>★ Lowest</span>}
                        </td>
                        <td className="right" style={{ color: q.csr >= 98 ? 'rgba(255,255,255,0.9)' : q.csr >= 95 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)' }}>
                          {q.csr}%
                        </td>
                        <td className="right" style={{ fontWeight: '600' }}>{fmt(q.annualPremium)}</td>
                        <td className="right">{fmt(q.monthlyPremium)}</td>
                        {q.premiumPerLakh !== undefined && <td className="right">₹{q.premiumPerLakh}</td>}
                        <td className="right">
                          {q.buyUrl ? (
                            <a
                              href={q.buyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-block',
                                background: q.color || 'rgba(255,255,255,0.9)',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '0px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textDecoration: 'none',
                              }}
                            >
                              Visit Site →
                            </a>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Coverage Breakdown */}
            {Array.isArray(result.breakdown) && result.breakdown.length > 0 && (
              <div className="aio-tableWrap" style={{ marginTop: '20px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📊</span> Coverage Components Breakdown
                </div>
                <table className="aio-taxTable">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th className="right">Amount</th>
                      {result.breakdown[0]?.percent !== undefined && <th className="right">%</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((row, idx) => (
                      <tr key={`${row.label}-${idx}`}>
                        <td>{row.label}</td>
                        <td className="right" style={{ color: row.value < 0 ? 'rgba(255,255,255,0.9)' : 'inherit' }}>
                          {row.isNumber ? row.value : fmt(row.value)}
                        </td>
                        {row.percent !== undefined && (
                          <td className="right">{row.percent > 0 ? `${row.percent}%` : '-'}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Riders Section */}
            {Array.isArray(result.riders) && result.riders.length > 0 && (
              <div className="aio-tableWrap" style={{ marginTop: '20px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> Riders & Add-ons
                </div>
                <table className="aio-taxTable">
                  <thead>
                    <tr>
                      <th>Rider</th>
                      <th>Benefit</th>
                      <th className="right">Cost/Year</th>
                      <th className="right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.riders.map((r, idx) => (
                      <tr key={`${r.name}-${idx}`} style={{ opacity: r.selected ? 1 : 0.6 }}>
                        <td>
                          <div style={{ fontWeight: '500' }}>{r.name}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{r.desc}</div>
                        </td>
                        <td style={{ fontSize: '12px' }}>{r.benefit}</td>
                        <td className="right">{fmt(r.cost)}</td>
                        <td className="right">
                          {r.selected ? 
                            <span style={{ color: 'var(--lux-accent)' }}>✓ Selected</span> : 
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Optional</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {result.riderCosts && (
                    <tfoot>
                      <tr style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <td colSpan="2" style={{ fontWeight: '600' }}>Total with Selected Riders</td>
                        <td className="right" style={{ fontWeight: '600', color: 'var(--lux-accent)' }}>
                          {fmt(result.totalPremiumWithRiders)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {/* Tax Benefits */}
            {result.taxBenefits && (
              <div
                className="aio-section"
                style={{
                  padding: '16px',
                  borderRadius: '0px',
                  marginTop: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--lux-accent)' }}>
                  <span>💰</span> Tax Benefits
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  {result.taxBenefits.deduction80C !== undefined && (
                    <div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>80C Deduction</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{fmt(result.taxBenefits.deduction80C)}</div>
                    </div>
                  )}
                  {result.taxBenefits.deduction80D !== undefined && (
                    <div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>80D Deduction</div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{fmt(result.taxBenefits.deduction80D)}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Tax Saved (30% slab)</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--lux-accent)' }}>{fmt(result.taxBenefits.taxSaved)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Effective Premium</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--lux-accent)' }}>{fmt(result.taxBenefits.effectivePremium)}</div>
                  </div>
                </div>
                {result.taxBenefits.note && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                    ℹ️ {result.taxBenefits.note}
                  </div>
                )}
              </div>
            )}

            {/* Payout Structure */}
            {result.payoutStructure && (
              <div className="aio-section" style={{ background: 'rgba(0,0,0,0.85)', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💸</span> Payout Structure: {result.payoutStructure.type}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                  {result.payoutStructure.description}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
                  {result.payoutStructure.benefit && (
                    <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.85)', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '600' }}>{result.payoutStructure.benefit}</span>
                    </div>
                  )}
                  {result.payoutStructure.lumpSum && (
                    <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.85)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Lump Sum: </span>
                      <span style={{ fontWeight: '600' }}>{result.payoutStructure.lumpSum}</span>
                    </div>
                  )}
                  {result.payoutStructure.monthlyBenefit && (
                    <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.85)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Monthly: </span>
                      <span style={{ fontWeight: '600' }}>{result.payoutStructure.monthlyBenefit}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ULIP/Endowment Maturity Visualization */}
            {result.ulipMaturity && (
              <div className="aio-section" style={{ padding: '20px', borderRadius: '0px', marginTop: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span>📈</span> ULIP/Endowment Maturity Projection
                </div>
                
                {/* Fund Value Scenarios */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.75)', borderRadius: '0px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Conservative (8%)</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{fmt(result.ulipMaturity.fundValueLow)}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>IRR: {result.ulipMaturity.irrLow}%</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '0px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--lux-accent)', fontWeight: '600' }}>Expected (10%)</div>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--lux-accent)', marginTop: '4px' }}>{fmt(result.ulipMaturity.fundValueMid)}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>IRR: {result.ulipMaturity.irrMid}%</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.75)', borderRadius: '0px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Optimistic (12%)</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--lux-accent)', marginTop: '4px' }}>{fmt(result.ulipMaturity.fundValueHigh)}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>IRR: {result.ulipMaturity.irrHigh}%</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Total Premium</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{fmt(result.ulipMaturity.totalPremiumPaid)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Wealth Multiple</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--lux-accent)' }}>{result.ulipMaturity.wealthMultiple}x</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Wealth Gain (Mid)</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--lux-accent)' }}>{fmt(result.ulipMaturity.wealthGainMid)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>PPT / Term</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{result.ulipMaturity.premiumPayingTerm}y / {result.ulipMaturity.policyTerm}y</div>
                  </div>
                </div>

                {/* Milestones */}
                {Array.isArray(result.ulipMaturity.milestones) && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>📍 Key Milestones</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {result.ulipMaturity.milestones.map((m, idx) => (
                        <div key={idx} style={{ 
                          padding: '8px 12px', 
                          background: 'rgba(0,0,0,0.75)', 
                          borderRadius: '6px',
                          borderLeft: `3px solid ${idx === result.ulipMaturity.milestones.length - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}`,
                        }}>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Year {m.year} • {m.label}</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{fmt(m.fundValue)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fund Options */}
                {Array.isArray(result.ulipMaturity.fundOptions) && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>🎯 Fund Allocation Options</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                      {result.ulipMaturity.fundOptions.map((f, idx) => (
                        <div key={idx} style={{ 
                          padding: '10px', 
                          background: 'rgba(0,0,0,0.85)', 
                          borderRadius: '6px',
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '600' }}>{f.name}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                            Returns: {f.expectedReturn} • Risk: {f.risk}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Charges Breakdown */}
                {result.ulipMaturity.charges && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>⚠️ ULIP Charges (Deducted from Fund)</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px' }}>
                      <span>Premium Allocation: {result.ulipMaturity.charges.premiumAllocation}</span>
                      <span>Fund Management: {result.ulipMaturity.charges.fundManagement}</span>
                      <span>Policy Admin: {result.ulipMaturity.charges.policyAdmin}</span>
                      <span>Mortality: {result.ulipMaturity.charges.mortality}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Premium Factors */}
            {result.premiumFactors && (
              <div className="aio-tableWrap" style={{ marginTop: '20px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚙️</span> Premium Calculation Factors
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginTop: '12px' }}>
                  {Object.entries(result.premiumFactors).map(([key, val]) => (
                    <div key={key} style={{ 
                      padding: '8px', 
                      background: 'rgba(0,0,0,0.85)', 
                      borderRadius: '0px',
                      border: parseFloat(val) > 1.1 ? '1px solid rgba(239,68,68,0.3)' : parseFloat(val) < 0.95 ? '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)' : '1px solid transparent'
                    }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                        {key.replace(/Factor$/, '').replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: parseFloat(val) > 1.1 ? 'rgba(255,255,255,0.5)' : parseFloat(val) < 0.95 ? 'rgba(255,255,255,0.9)' : 'inherit'
                      }}>
                        {val}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Covered Conditions (for CI) */}
            {Array.isArray(result.coveredConditions) && (
              <div className="aio-section" style={{ background: 'rgba(0,0,0,0.85)', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏥</span> Covered Critical Illnesses
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {result.coveredConditions.map((c, idx) => (
                    <span key={idx} style={{ 
                      padding: '4px 10px', 
                      background: 'rgba(0,0,0,0.85)', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            {Array.isArray(result.checklist) && (
              <div className="aio-checklist" style={{ marginTop: '20px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📝</span> Protection Checklist
                </div>
                <ul className="aio-checklistList">
                  {result.checklist.map((c, idx) => (
                    <li key={`${idx}-${c}`} style={{ 
                      color: c.startsWith('⚠️') ? 'rgba(255,255,255,0.6)' : c.startsWith('ℹ️') ? 'rgba(255, 255, 255, 0.9)' : 'inherit'
                    }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top Insurers */}
            {Array.isArray(result.topInsurers) && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.75)', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Top Insurers with CSR:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.topInsurers.slice(0, 6).map((ins, idx) => (
                    <span key={idx} style={{ 
                      padding: '4px 10px', 
                      background: 'rgba(0,0,0,0.85)', 
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      {ins}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Policy Feature Comparison Table - COMPETITIVE ADVANTAGE */}
            {Array.isArray(result.policyFeatureComparison) && result.policyFeatureComparison.length > 0 && (
              <div className="aio-tableWrap" style={{ marginTop: '24px' }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏆</span> Policy Feature Comparison (What BM Wealth Shows, Others Don't)
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="aio-taxTable" style={{ minWidth: '800px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '180px' }}>Feature</th>
                        {result.insurerQuotesWithLinks?.slice(0, 6).map((ins, idx) => (
                          <th key={idx} className="center" style={{ fontSize: '11px', padding: '8px 4px', minWidth: '70px' }}>
                            {ins.logo} {ins.name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.policyFeatureComparison.slice(0, 12).map((pf, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>{pf.feature}</div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{pf.description}</div>
                          </td>
                          {pf.insurerSupport?.slice(0, 6).map((ins, iIdx) => (
                            <td key={iIdx} className="center">
                              {ins.supported ? 
                                <span style={{ color: 'var(--lux-accent)', fontSize: '14px' }}>✓</span> : 
                                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>—</span>
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', textAlign: 'center' }}>
                  ✓ = Feature available • Data based on published policy documents 2025
                </div>
              </div>
            )}

            {/* Nominee Planning Section */}
            {result.nomineePlanning && (
              <div className="aio-section" style={{ 
                background: 'rgba(0,0,0,0.85)', 
                padding: '20px', 
                borderRadius: '0px', 
                marginTop: '24px',
                border: '1px solid color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.10))'
              }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span>👥</span> {result.nomineePlanning.title}
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                  {result.nomineePlanning.description}
                </p>

                {/* Nomination Steps */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--lux-accent)', fontWeight: '600', marginBottom: '10px' }}>📋 Steps to Set Up Nomination</div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {result.nomineePlanning.steps.map((s, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '10px', 
                        background: 'rgba(0,0,0,0.85)', 
                        borderRadius: '0px',
                        borderLeft: '3px solid rgba(255, 255, 255, 0.9)'
                      }}>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          background: 'rgba(255, 255, 255, 0.9)', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {s.step}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.action}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{s.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Notes */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: '10px' }}>⚠️ Important Notes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.nomineePlanning.importantNotes.map((note, idx) => (
                      <div key={idx} style={{ 
                        fontSize: '12px', 
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '0px'
                      }}>
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Claim Process Timeline */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--lux-accent)', fontWeight: '600', marginBottom: '10px' }}>📅 Claim Process Timeline</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.nomineePlanning.claimProcess.map((cp, idx) => (
                      <div key={idx} style={{ 
                        flex: '1 1 150px',
                        padding: '12px', 
                        background: 'rgba(0,0,0,0.85)', 
                        borderRadius: '0px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          background: 'rgba(255,255,255,0.9)', 
                          borderRadius: '50%', 
                          margin: '0 auto 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700'
                        }}>
                          {cp.step}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>{cp.action}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{cp.timeline}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents Required */}
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600', marginBottom: '10px' }}>📄 Documents Required for Claim</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.nomineePlanning.documentsRequired.map((doc, idx) => (
                      <span key={idx} style={{ 
                        padding: '6px 12px', 
                        background: 'rgba(255, 255, 255,0.15)', 
                        borderRadius: '20px',
                        fontSize: '11px'
                      }}>
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SMART AI RECOMMENDATIONS (Rule-Based, No API Cost) */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {(() => {
              // Generate smart recommendations based on user profile
              const recommendations = [];
              const age = parseInt(result._inputAge) || 35;
              const income = result.hlv?.netAnnualContribution * 12 || result.recommendedCover / 10 || 1000000;
              const cover = result.recommendedCover || 0;
              const dependents = result._inputDependents || 1;
              
              // Age-based recommendations
              if (age < 30) {
                recommendations.push({
                  icon: '🎯',
                  title: 'Lock in Low Premiums Now',
                  desc: `At ${age}, your premiums are 40-60% lower than at 40. Lock in a 30-year term now.`,
                  action: 'Consider maximum term length'
                });
              } else if (age >= 30 && age < 40) {
                recommendations.push({
                  icon: '⚡',
                  title: 'Prime Coverage Window',
                  desc: 'Ages 30-40 offer the best balance of coverage duration and premium rates.',
                  action: 'Review coverage every 3 years'
                });
              } else if (age >= 40) {
                recommendations.push({
                  icon: '🔒',
                  title: 'Secure Coverage Immediately',
                  desc: 'Premiums increase 10-15% each year after 40. Don\'t delay.',
                  action: 'Apply within 30 days'
                });
              }
              
              // Income-based recommendations
              if (income >= 2500000) {
                recommendations.push({
                  icon: '💎',
                  title: 'High-Value Earner Strategy',
                  desc: `With ${fmt(income)}/year income, consider ₹2-3Cr cover minimum.`,
                  action: 'Explore multi-policy strategy'
                });
              }
              
              // Dependent-based recommendations
              if (dependents >= 2) {
                recommendations.push({
                  icon: '👨‍👩‍👧‍👦',
                  title: 'Family Protection Priority',
                  desc: `${dependents} dependents need ${fmt(cover * 0.3)}-${fmt(cover * 0.5)} per person as buffer.`,
                  action: 'Add Child Education Rider'
                });
              }
              
              // Mumbai-specific (assuming metro user)
              recommendations.push({
                icon: '🏙️',
                title: 'Metro Living Cost Factor',
                desc: 'Mumbai/Delhi living costs are 2-3x national average. Coverage adjusted accordingly.',
                action: 'Factor in 1.5x multiplier'
              });
              
              // What-If Scenarios
              const whatIfScenarios = [
                { event: 'Marriage in 2 years', impact: '+₹25L coverage recommended', icon: '💍' },
                { event: 'Child in 3 years', impact: '+₹50L for education fund', icon: '👶' },
                { event: 'Home purchase', impact: 'Add liability amount to cover', icon: '🏠' },
              ];
              
              return recommendations.length > 0 && (
                <div className="aio-section" style={{ marginTop: '24px' }}>
                  {/* AI Recommendations Header */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(230,199,123,0.15), rgba(230,199,123,0.05))',
                    border: '1px solid rgba(230,199,123,0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '20px' }}>🤖</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#E6C77B' }}>
                          Smart Recommendations for You
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                          Personalized based on your profile
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {recommendations.slice(0, 3).map((rec, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '12px',
                          padding: '12px',
                          background: 'rgba(0,0,0,0.4)',
                          borderRadius: '8px',
                          borderLeft: '3px solid #E6C77B'
                        }}>
                          <span style={{ fontSize: '18px' }}>{rec.icon}</span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                              {rec.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                              {rec.desc}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#E6C77B', 
                              marginTop: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              → {rec.action}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* What-If Scenarios */}
                  <div style={{ 
                    background: 'rgba(18,18,18,0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>
                      🔮 What-If Life Events
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {whatIfScenarios.map((scenario, idx) => (
                        <div key={idx} style={{
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)' }}>
                            <span>{scenario.icon}</span>
                            <span>{scenario.event}</span>
                          </div>
                          <div style={{ color: '#E6C77B', marginTop: '4px', fontWeight: '500' }}>
                            {scenario.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Peer Benchmarking */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>
                      📊 How You Compare to Similar Profiles
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '11px' }}>
                      <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Age Group ({age}-{age+5})</div>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Avg: {fmt(age < 35 ? 10000000 : age < 45 ? 15000000 : 20000000)}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Your Income Level</div>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Avg: {fmt(income >= 2500000 ? 30000000 : income >= 1500000 ? 20000000 : 10000000)}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '12px', background: cover >= (age < 35 ? 10000000 : 15000000) ? 'rgba(230,199,123,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '8px', border: cover >= (age < 35 ? 10000000 : 15000000) ? '1px solid rgba(230,199,123,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Your Position</div>
                        <div style={{ color: cover >= (age < 35 ? 10000000 : 15000000) ? '#E6C77B' : 'rgba(239,68,68,0.8)', fontWeight: '600' }}>
                          {cover >= (age < 35 ? 10000000 : 15000000) ? '✅ Above Avg' : '⚠️ Below Avg'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* CALLBACK SCHEDULER + LEAD CAPTURE */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div style={{ 
              marginTop: '24px',
              background: 'linear-gradient(135deg, rgba(230,199,123,0.1), rgba(230,199,123,0.02))',
              border: '1px solid rgba(230,199,123,0.2)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#E6C77B', marginBottom: '4px' }}>
                  📞 Get Expert Guidance
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  Our IRDAI-licensed advisors can help you choose the right policy
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <button 
                  onClick={() => {
                    window.open('https://wa.me/919876543210?text=' + encodeURIComponent(
                      `Hi, I just used the BM Wealth Insurance Calculator.\n\nMy Results:\n• Recommended Cover: ${fmt(result.recommendedCover)}\n• Premium: ${result.premiumRange || fmt(result.annualPremiumMid)}/year\n\nI'd like expert guidance on choosing the right policy.`
                    ), '_blank');
                    trackEvent('insurance_callback_whatsapp', { cover: result.recommendedCover });
                  }}
                  style={{
                    padding: '12px 16px',
                    background: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>💬</span> WhatsApp
                </button>
                
                <button 
                  onClick={() => {
                    window.location.href = '/contact?source=insurance-calculator&cover=' + (result.recommendedCover || 0);
                    trackEvent('insurance_callback_form', { cover: result.recommendedCover });
                  }}
                  style={{
                    padding: '12px 16px',
                    background: '#E6C77B',
                    color: '#0A0A0A',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📅</span> Schedule Call
                </button>
              </div>
              
              <div style={{ 
                marginTop: '16px', 
                textAlign: 'center', 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}>
                <span>✅ IRDAI Licensed</span>
                <span>✅ No Spam</span>
                <span>✅ Free Consultation</span>
              </div>
            </div>

            {/* Competitive Advantage Section */}
            {result.competitiveAdvantage && (
              <div className="aio-section" style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255,0.15), rgba(255, 255, 255,0.05))', 
                padding: '20px', 
                borderRadius: '0px', 
                marginTop: '24px',
                border: '2px solid rgba(255, 255, 255,0.3)'
              }}>
                <div className="aio-tableTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--lux-accent)' }}>
                  <span>⭐</span> {result.competitiveAdvantage.title}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  {result.competitiveAdvantage.advantages.map((adv, idx) => (
                    <div key={idx} style={{ 
                      padding: '12px', 
                      background: 'rgba(0,0,0,0.85)', 
                      borderRadius: '0px',
                      borderLeft: '3px solid rgba(255,255,255,0.9)'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--lux-accent)' }}>{adv.feature}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{adv.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(0,0,0,0.85)', 
                  borderRadius: '0px',
                  border: '1px solid color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.10))'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--lux-accent)', fontWeight: '600', marginBottom: '10px' }}>
                    🎯 What Our Calculator Has That Competitors Don't
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.competitiveAdvantage.missingInCompetitors?.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '12px' }}>
                        <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>{item.competitor}:</span>{' '}
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Missing {item.missing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result.note && (
              <div className="aio-note" style={{ marginTop: '16px' }}>
                ℹ️ {result.note}
              </div>
            )}
          </div>
        ) : selectedCalc === 'sip' ? (
          <div className="aio-panel premium-scroll">
            <div className="aio-panelTitle">SIP Master Projection</div>
            <div className="aio-panelSub">Low / Mid / High range + year-wise schedule</div>

            <div className="aio-kpiGrid">
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Total Invested</div>
                <div className="aio-kpiValue">{fmt(result.invested)}</div>
                <div className="aio-kpiMeta">Step-up: {Number(result.stepUpPercent || 0).toFixed(0)}%</div>
              </div>
              <div className="aio-kpi aio-kpiGold">
                <div className="aio-kpiLabel">Future Value (Mid)</div>
                <div className="aio-kpiValue">{fmt(result.futureValueMid)}</div>
                <div className="aio-kpiMeta">Return: {Number(result.rateMid || 0).toFixed(2)}%</div>
              </div>
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Range (Low–High)</div>
                <div className="aio-kpiValue">{fmt(result.futureValueLow)} – {fmt(result.futureValueHigh)}</div>
                <div className="aio-kpiMeta">{Number(result.rateLow || 0).toFixed(2)}% – {Number(result.rateHigh || 0).toFixed(2)}%</div>
              </div>
            </div>

            {Array.isArray(result.schedule) ? (
              <div className="aio-tableWrap">
                <div className="aio-tableTitle">Year-wise Schedule</div>
                <table className="aio-taxTable">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th className="right">Monthly SIP</th>
                      <th className="right">Invested</th>
                      <th className="right">Value (Low)</th>
                      <th className="right">Value (Mid)</th>
                      <th className="right">Value (High)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row, idx) => (
                      <tr key={`${row.year}-${idx}`}>
                        <td>{row.year}</td>
                        <td className="right">{fmt(row.monthlySIP)}</td>
                        <td className="right">{fmt(row.totalInvested)}</td>
                        <td className="right">{fmt(row.endValueLow)}</td>
                        <td className="right">{fmt(row.endValueMid)}</td>
                        <td className="right">{fmt(row.endValueHigh)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : selectedCalc === 'mfReturns' ? (
          <div className="aio-panel premium-scroll">
            <div className="aio-panelTitle">Mutual Fund Return Snapshot</div>
            <div className="aio-panelSub">Exit load + estimated tax + post-tax CAGR</div>

            <div className="aio-kpiGrid">
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Current Value</div>
                <div className="aio-kpiValue">{fmt(result.current)}</div>
                <div className="aio-kpiMeta">Invested: {fmt(result.invested)}</div>
              </div>
              <div className="aio-kpi">
                <div className="aio-kpiLabel">CAGR (pre-tax)</div>
                <div className="aio-kpiValue">{Number(result.cagrPercent || 0).toFixed(2)}%</div>
                <div className="aio-kpiMeta">Abs: {Number(result.absoluteReturnPercent || 0).toFixed(2)}%</div>
              </div>
              <div className="aio-kpi aio-kpiGold">
                <div className="aio-kpiLabel">Post-tax Value</div>
                <div className="aio-kpiValue">{fmt(result.postTaxValue)}</div>
                <div className="aio-kpiMeta">Post-tax CAGR: {Number(result.postTaxCagrPercent || 0).toFixed(2)}%</div>
              </div>
            </div>

            <div className="aio-taxLineItems">
              <div className="aio-taxLine">
                <span>Proceeds after exit load</span>
                <span>{fmt(result.proceedsAfterExitLoad)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Estimated tax ({String(result.taxType || '')})</span>
                <span>{fmt(result.estimatedTax)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Expense ratio (reference)</span>
                <span>{Number(result.expenseRatioPercent || 0).toFixed(2)}%</span>
              </div>
              <div className="aio-taxLine">
                <span>Fee drag (approx)</span>
                <span>{fmt(result.feeDragApprox)}</span>
              </div>
            </div>

            {result.note ? <div className="aio-note">{result.note}</div> : null}
          </div>
        ) : selectedCalc === 'lic' ? (
          <div className="aio-panel premium-scroll">
            <div className="aio-panelTitle">LIC Endowment Estimate</div>
            <div className="aio-panelSub">Maturity + bonus + IRR estimate (illustrative)</div>

            <div className="aio-kpiGrid">
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Sum Assured</div>
                <div className="aio-kpiValue">{fmt(result.sumAssured)}</div>
                <div className="aio-kpiMeta">Term: {result.policyTermYears}y • PPT: {result.premiumPayingYears}y</div>
              </div>
              <div className="aio-kpi aio-kpiGold">
                <div className="aio-kpiLabel">Maturity Value</div>
                <div className="aio-kpiValue">{fmt(result.maturityValue)}</div>
                <div className="aio-kpiMeta">Bonus: {fmt(result.bonusAmount)}</div>
              </div>
              <div className="aio-kpi">
                <div className="aio-kpiLabel">IRR (estimate)</div>
                <div className="aio-kpiValue">{Number(result.irrPercent || 0).toFixed(2)}%</div>
                <div className="aio-kpiMeta">Total premiums: {fmt(result.totalPremiums)}</div>
              </div>
            </div>

            <div className="aio-taxLineItems">
              <div className="aio-taxLine">
                <span>Annual premium</span>
                <span>{fmt(result.annualPremium)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Final additional bonus</span>
                <span>{fmt(result.finalAdditionalBonus)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Surrender estimate (after {result.yearsPaid} years)</span>
                <span>{fmt(result.surrenderEstimate)}</span>
              </div>
            </div>

            {result.note ? <div className="aio-note">{result.note}</div> : null}
          </div>
        ) : selectedCalc === 'tax' ? (
          <div className="aio-tax premium-scroll">
            <div className="aio-taxHeader">
              <div>
                <div className="aio-taxTitle">Income Tax Summary — {result.financialYear || 'FY 2025-26'}</div>
                <div className="aio-taxSub">Comprehensive breakdown with Budget 2025 rates</div>
              </div>
              <div className="aio-taxActions">
                <button type="button" className="aio-secondary" onClick={handleCopyTaxSummary}>
                  {copied ? 'Copied' : 'Copy Summary'}
                </button>
                <button type="button" className="aio-secondary" onClick={handlePrintTax}>
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Regime Comparison Banner */}
            {result.regimeComparison ? (
              <div className="aio-regimeCompare" style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '0px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>REGIME COMPARISON</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--lux-accent)' }}>
                    {result.regimeComparison.betterRegime === result.regime 
                      ? `✓ ${String(result.regime).toUpperCase()} Regime is optimal for you`
                      : `💡 ${String(result.regimeComparison.otherRegime).toUpperCase()} Regime could save you ${fmt(result.regimeComparison.savings)}`
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{String(result.regime).toUpperCase()}</div>
                    <div style={{ fontWeight: '600', color: result.regimeComparison.betterRegime === result.regime ? '#4ade80' : '#fff' }}>{fmt(result.regimeComparison.currentTax)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{String(result.regimeComparison.otherRegime).toUpperCase()}</div>
                    <div style={{ fontWeight: '600', color: result.regimeComparison.betterRegime !== result.regime ? '#4ade80' : '#fff' }}>{fmt(result.regimeComparison.otherTax)}</div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Key Metrics Grid */}
            <div className="aio-taxGrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Regime</div>
                <div className="aio-kpiValue">{String(result.regime || '').toUpperCase()}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{result.assessmentYear}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Gross Income</div>
                <div className="aio-kpiValue">{fmt(result.grossIncome)}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Deductions</div>
                <div className="aio-kpiValue">{fmt(result.deductions)}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                  Old: {fmt(result.deductionsOld)} • New: {fmt(result.deductionsNew)}
                </div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Taxable Income</div>
                <div className="aio-kpiValue">{fmt(result.taxableIncome)}</div>
              </div>
              <div className="aio-taxKpi aio-taxKpiGold">
                <div className="aio-kpiLabel">Total Tax</div>
                <div className="aio-kpiValue">{fmt(result.totalTax)}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Net Payable</div>
                <div className="aio-kpiValue" style={{ color: result.refundDue > 0 ? '#4ade80' : '#fff' }}>
                  {result.refundDue > 0 ? `Refund: ${fmt(result.refundDue)}` : fmt(result.netTaxPayable)}
                </div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Monthly Tax</div>
                <div className="aio-kpiValue">{fmt(result.monthlyTax)}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Effective Rate</div>
                <div className="aio-kpiValue">{Number(result.effectiveRatePercent || 0).toFixed(2)}%</div>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="aio-taxLineItems" style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--lux-accent)', marginBottom: '12px' }}>TAX COMPUTATION</div>
              <div className="aio-taxLine">
                <span>Tax on Regular Income (Slab)</span>
                <span>{fmt(result.taxOnRegularIncome)}</span>
              </div>
              {result.capitalGainsTax > 0 ? (
                <>
                  <div className="aio-taxLine" style={{ paddingLeft: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                    <span>↳ STCG Equity @ 20%</span>
                    <span>{fmt(result.taxSTCGEquity)}</span>
                  </div>
                  <div className="aio-taxLine" style={{ paddingLeft: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                    <span>↳ LTCG Equity @ 12.5%</span>
                    <span>{fmt(result.taxLTCGEquity)}</span>
                  </div>
                  <div className="aio-taxLine" style={{ paddingLeft: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                    <span>↳ LTCG Other @ 12.5%</span>
                    <span>{fmt(result.taxLTCGOther)}</span>
                  </div>
                  <div className="aio-taxLine">
                    <span>Capital Gains Tax</span>
                    <span>{fmt(result.capitalGainsTax)}</span>
                  </div>
                </>
              ) : null}
              <div className="aio-taxLine">
                <span>Tax (before rebate)</span>
                <span>{fmt(result.taxBeforeRebate)}</span>
              </div>
              <div className="aio-taxLine" style={{ color: result.rebate87A > 0 ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
                <span>Rebate u/s 87A {result.rebateEligible ? '(Eligible)' : '(N/A)'}</span>
                <span>-{fmt(result.rebate87A)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Tax (after rebate)</span>
                <span>{fmt(result.taxAfterRebate)}</span>
              </div>
              {result.surchargeRate > 0 ? (
                <>
                  <div className="aio-taxLine">
                    <span>Surcharge @ {result.surchargeRate}%</span>
                    <span>{fmt(result.surcharge)}</span>
                  </div>
                  {result.marginalRelief > 0 ? (
                    <div className="aio-taxLine" style={{ color: '#4ade80' }}>
                      <span>Marginal Relief</span>
                      <span>-{fmt(result.marginalRelief)}</span>
                    </div>
                  ) : null}
                </>
              ) : null}
              <div className="aio-taxLine">
                <span>Health & Education Cess (4%)</span>
                <span>{fmt(result.cess4Percent)}</span>
              </div>
              <div className="aio-taxLine" style={{ fontWeight: '600', color: 'var(--lux-accent)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '8px' }}>
                <span>TOTAL TAX LIABILITY</span>
                <span>{fmt(result.totalTax)}</span>
              </div>
              {(result.tdsDeducted > 0 || result.advanceTaxPaid > 0) ? (
                <>
                  <div className="aio-taxLine" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span>Less: TDS Deducted</span>
                    <span>-{fmt(result.tdsDeducted)}</span>
                  </div>
                  <div className="aio-taxLine" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span>Less: Advance Tax Paid</span>
                    <span>-{fmt(result.advanceTaxPaid)}</span>
                  </div>
                  <div className="aio-taxLine" style={{ fontWeight: '600', color: result.refundDue > 0 ? '#4ade80' : '#fff' }}>
                    <span>{result.refundDue > 0 ? 'REFUND DUE' : 'NET TAX PAYABLE'}</span>
                    <span>{result.refundDue > 0 ? fmt(result.refundDue) : fmt(result.netTaxPayable)}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Slab-wise Breakdown */}
            {Array.isArray(result.slabBreakdown) && result.slabBreakdown.length > 0 ? (
              <div className="aio-taxTableWrap" style={{ marginTop: '24px' }}>
                <div className="aio-taxTableTitle">Slab-wise Breakdown ({String(result.regime).toUpperCase()} Regime)</div>
                <table className="aio-taxTable">
                  <thead>
                    <tr>
                      <th>Income Slab</th>
                      <th className="right">Taxable Amount</th>
                      <th className="right">Rate</th>
                      <th className="right">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.slabBreakdown.map((s, idx) => (
                      <tr key={`${s.label}-${idx}`}>
                        <td>{s.label}</td>
                        <td className="right">{fmt(s.amount)}</td>
                        <td className="right">{Number(s.ratePercent).toFixed(0)}%</td>
                        <td className="right">{fmt(s.tax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Tax-Saving Suggestions */}
            {Array.isArray(result.suggestions) && result.suggestions.length > 0 ? (
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '0px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#4ade80', marginBottom: '12px' }}>💡 TAX-SAVING SUGGESTIONS</div>
                {result.suggestions.map((s, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--lux-accent)', fontWeight: '600', minWidth: '90px' }}>{s.section}</span>
                    <span>{s.tip}</span>
                    {s.potential > 0 ? <span style={{ color: '#4ade80', marginLeft: 'auto' }}>Save up to {fmt(s.potential * 0.3)}</span> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Disclaimer */}
            <div style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>
              * This is an educational estimate based on FY 2025-26 Budget rates. Actual tax may vary based on specific circumstances. Consult a tax professional for personalized advice.
            </div>
          </div>
        ) : (
          <div className="aio-results-grid premium-scroll">
            {Object.entries(result)
              .filter(([key, value]) => {
                // Skip internal keys, objects, and arrays that need special rendering
                if (key.startsWith('__')) return false;
                if (Array.isArray(value)) return false;
                if (typeof value === 'object' && value !== null) return false;
                return true;
              })
              .map(([key, value]) => (
              <div key={key} className="aio-result-item">
                <span className="aio-result-label">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </span>
                <span className="aio-result-value">
                  {typeof value === 'number'
                    ? (() => {
                        const keyLower = String(key).toLowerCase();
                        if (keyLower.includes('rate') || keyLower.includes('cagr') || keyLower.includes('percent')) {
                          return `${value.toFixed(2)}%`;
                        }
                        return fmt(value);
                      })()
                    : String(value)}
                </span>
              </div>
            ))}
            {/* Render comparison table if present */}
            {result.comparison && Array.isArray(result.comparison) && result.comparison.length > 0 && (
              <div className="aio-result-item" style={{ gridColumn: '1 / -1' }}>
                <span className="aio-result-label" style={{ marginBottom: '8px', display: 'block' }}>Comparison</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: 'rgba(255,255,255,0.6)' }}>Type</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: 'rgba(255,255,255,0.6)' }}>Value</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: 'rgba(255,255,255,0.6)' }}>CAGR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparison.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.85)' }}>{item.type}</td>
                        <td style={{ textAlign: 'right', padding: '6px 8px', color: 'rgba(255,255,255,0.85)' }}>{fmt(item.value)}</td>
                        <td style={{ textAlign: 'right', padding: '6px 8px', color: 'rgba(255,255,255,0.85)' }}>{item.cagr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

        const canShare = !!result && !result.error;
        const interpretation = canShare ? getInterpretation(selectedCalc, result, inputs) : null;
        const resultsShell = (
          <div className="aio-resultsPanel premium-scroll" ref={resultsPanelRef} tabIndex={-1}>
            <div className="aio-resultsHeader">
              <h4 className="aio-results-title">Results</h4>
              <div className="aio-resultsActions">
                {canShare ? (
                  <>
                    <button type="button" className="aio-secondary" onClick={handleExportPDF}>
                      Export PDF
                    </button>
                    <button type="button" className="aio-secondary" onClick={handleShareNative}>
                      Share
                    </button>
                    <button type="button" className="aio-secondary" onClick={handleShareWhatsApp}>
                      WhatsApp
                    </button>
                    <button type="button" className="aio-secondary" onClick={() => setEmailOpen((v) => !v)}>
                      Email
                    </button>
                    <button type="button" className="aio-secondary" onClick={handleCopyShareLink}>
                      {linkCopied ? 'Link Copied' : 'Copy Link'}
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {canShare && emailOpen ? (
              <div className="aio-emailBox">
                <div className="aio-emailTitle">Email this result</div>
                <div className="aio-emailGrid">
                  <div className="aio-input-group">
                    <label className="aio-label">Name</label>
                    <input className="aio-input" value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="aio-input-group">
                    <label className="aio-label">Email</label>
                    <input className="aio-input" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="aio-input-group">
                    <label className="aio-label">Phone (optional)</label>
                    <input className="aio-input" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="10-digit" />
                  </div>
                </div>
                <div className="aio-emailActions">
                  <button type="button" className="aio-secondary" disabled={emailBusy} onClick={() => setEmailOpen(false)}>
                    Cancel
                  </button>
                  <button type="button" className="calculator-premium-cta aio-button" disabled={emailBusy} onClick={handleEmailResult}>
                    {emailBusy ? 'Sending…' : 'Send Email'}
                  </button>
                </div>
                {emailNote ? <div className="aio-emailNote">{emailNote}</div> : null}
              </div>
            ) : null}
            {resultsBody}

            {/* Interpretation Block - Educational Only */}
            {interpretation && interpretation.text && (
              <div className="aio-interpretation">
                <div className="aio-interpretation-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  <span>Understanding Your Result</span>
                </div>
                <p className="aio-interpretation-text">{interpretation.text}</p>
                {interpretation.decisionGap && (
                  <div className="aio-decision-gap">
                    <span className="aio-decision-gap-label">Key Gap:</span>
                    <span className="aio-decision-gap-value">{interpretation.decisionGap}</span>
                  </div>
                )}
                <p className="aio-interpretation-disclaimer">
                  This is educational information only, not financial advice.
                </p>
              </div>
            )}

            {/* Soft CTA - Review by BM Wealth */}
            {canShare && (
              <div className="aio-review-cta">
                <button type="button" className="aio-review-btn" onClick={handleReviewCTA}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Get this reviewed by BM Wealth</span>
                </button>
                <p className="aio-review-note">Free consultation • No obligation</p>
              </div>
            )}
          </div>
        );

        return (
          <>
            <div className="aio-main">
              <div className="aio-left">
                <div className="aio-inputs">
                  {config.map((input) => {
                    if (input.type === 'section') {
                      return (
                        <div key={input.key} className="aio-section">
                          <div className="aio-sectionTitle">{input.label}</div>
                          <div className="aio-sectionRule" />
                        </div>
                      );
                    }

                    return (
                      <div key={input.key} className="aio-input-group">
                        <label className="aio-label">{input.label}</label>
                        {input.type === 'select' ? (
                          <select
                            value={inputs[input.key] ?? input.default}
                            onChange={(e) => handleInputChange(input.key, e.target.value)}
                            className="aio-select"
                          >
                            {input.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="aio-input-wrapper">
                            {input.prefix && <span className="aio-prefix">{input.prefix}</span>}
                            <input
                              type="number"
                              value={inputs[input.key] ?? ''}
                              onChange={(e) => handleInputChange(input.key, e.target.value)}
                              className="aio-input"
                            />
                            {input.suffix && <span className="aio-suffix">{input.suffix}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="aio-actionbar">
                  <button onClick={handleCalculate} className="calculator-premium-cta aio-button">
                    Calculate
                  </button>
                </div>
              </div>

              <div className="aio-right">{resultsShell}</div>
            </div>

            {isNarrow && mobileResultsOpen ? (
              <div
                className="aio-sheetBackdrop"
                role="presentation"
                onClick={() => setMobileResultsOpen(false)}
              >
                <div
                  className="aio-sheet premium-scroll"
                  role="dialog"
                  aria-modal="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="aio-sheetTop">
                    <div className="aio-sheetTitle">Results</div>
                    <button
                      type="button"
                      className="aio-sheetClose"
                      onClick={() => setMobileResultsOpen(false)}
                      aria-label="Close results"
                    >
                      ✕
                    </button>
                  </div>
                  {resultsShell}
                </div>
              </div>
            ) : null}
          </>
        );
      })()}

      <style jsx>{`
        .aio-calc {
          background: linear-gradient(180deg, rgba(15, 15, 20, 0.98) 0%, rgba(5, 5, 8, 0.99) 100%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 20px;
          padding: 28px;
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          animation: aio-fade-up 420ms ease-out both;
        }

        .aio-main {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 18px;
          position: relative;
          z-index: 1;
        }

        .aio-left,
        .aio-right {
          min-width: 0;
        }

        .aio-right {
          display: block;
        }

        .aio-resultsPanel {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          padding: 16px;
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 14px;
          outline: none;
        }

        .aio-resultsHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .aio-resultsActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .aio-emailBox {
          margin: 10px 0 14px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
        }

        .aio-emailTitle {
          font-weight: 900;
          color: rgba(255, 255, 255, 0.92);
          margin-bottom: 10px;
        }

        .aio-emailGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 1024px) {
          .aio-emailGrid {
            grid-template-columns: 1fr;
          }
        }

        .aio-emailActions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .aio-emailNote {
          margin-top: 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
        }

        /* Interpretation Block */
        .aio-interpretation {
          margin-top: 16px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.04);
        }

        .aio-interpretation-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 10px;
        }

        .aio-interpretation-header svg {
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .aio-interpretation-text {
          margin: 0 0 12px 0;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.82);
        }

        .aio-decision-gap {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 12px;
        }

        .aio-decision-gap-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.85);
          flex-shrink: 0;
        }

        .aio-decision-gap-value {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
        }

        .aio-interpretation-disclaimer {
          margin: 0;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
          font-style: italic;
        }

        /* Soft CTA - Review by BM Wealth */
        .aio-review-cta {
          margin-top: 14px;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          text-align: center;
        }

        .aio-review-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.25);
        }

        .aio-review-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 255, 255, 0.35);
        }

        .aio-review-btn:active {
          transform: translateY(0);
        }

        .aio-review-btn svg {
          flex-shrink: 0;
        }

        .aio-review-note {
          margin: 8px 0 0;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.55);
        }

        .aio-empty {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.18);
          color: rgba(255, 255, 255, 0.65);
          font-size: 13px;
        }

        .aio-calc::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 220px at 20% 10%, rgba(255, 255, 255, 0.12), transparent 55%),
            radial-gradient(520px 220px at 80% 0%, rgba(255, 255, 255, 0.08), transparent 60%);
          pointer-events: none;
        }

        .aio-switcher {
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .aio-switcher-top {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 14px;
        }

        .aio-switcher-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.95);
        }

        .aio-switcher-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
        }

        .aio-searchRow {
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
        }

        .aio-searchWrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .aio-searchWrap:focus-within {
          border-color: rgba(255, 255, 255, 0.55);
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
        }

        .aio-searchIcon {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1;
        }

        .aio-search {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255, 255, 255, 0.92);
          font-size: 14px;
        }

        .aio-clear {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.78);
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease;
        }

        .aio-clear:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }

        .aio-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 2px 10px;
          margin-bottom: 12px;
          scroll-snap-type: x mandatory;
        }

        .aio-pill {
          scroll-snap-align: start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.35);
          color: rgba(255, 255, 255, 0.78);
          font-size: 13px;
          cursor: pointer;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 220ms ease;
        }

        .aio-pill:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.32);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
        }

        .aio-pillActive {
          border-color: rgba(255, 255, 255, 0.55);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0.35));
          color: rgba(255, 255, 255, 0.92);
          box-shadow:
            0 12px 34px rgba(0, 0, 0, 0.45),
            0 0 24px rgba(255, 255, 255, 0.14);
        }

        .aio-pillIcon {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.22));
        }

        .aio-nativeSelect {
          display: none;
        }

        .aio-select {
          width: 100%;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          cursor: pointer;
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
        }

        /* Style dropdown options for dark theme */
        .aio-select option {
          background: #1a1a1f;
          color: #ffffff;
          padding: 12px 16px;
          font-size: 14px;
        }

        .aio-select option:hover,
        .aio-select option:focus,
        .aio-select option:checked {
          background: #2a2a35;
          color: rgba(255,255,255,0.9);
        }

        .aio-select:focus {
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow:
            0 0 0 4px rgba(255, 255, 255, 0.14),
            0 10px 30px rgba(0, 0, 0, 0.45);
        }

        .aio-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          position: relative;
          z-index: 1;
        }

        .aio-icon {
          font-size: 36px;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
        }

        .aio-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: rgba(255, 255, 255, 1);
        }

        .aio-desc {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }

        .aio-inputs {
          display: grid;
          gap: 18px;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .aio-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .aio-section {
          padding-top: 6px;
        }

        .aio-sectionTitle {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.62);
        }

        .aio-sectionRule {
          height: 1px;
          margin-top: 10px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.0));
        }

        .aio-label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .aio-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .aio-input-wrapper:focus-within {
          border-color: rgba(255, 255, 255, 0.55);
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
        }

        .aio-prefix, .aio-suffix {
          padding: 12px 14px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          background: rgba(255, 255, 255, 0.08);
        }

        .aio-input {
          flex: 1;
          padding: 12px 14px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.95);
          font-size: 16px;
          outline: none;
          -moz-appearance: textfield;
        }

        .aio-input::-webkit-outer-spin-button,
        .aio-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .aio-button {
          width: 100%;
          padding: 14px 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: transform 180ms ease, box-shadow 220ms ease, filter 220ms ease;
          position: relative;
          z-index: 1;
        }

        .aio-actionbar {
          position: sticky;
          bottom: 0;
          z-index: 2;
          padding-top: 10px;
          padding-bottom: 2px;
          background: linear-gradient(180deg, rgba(5, 5, 8, 0) 0%, rgba(5, 5, 8, 0.78) 55%, rgba(5, 5, 8, 0.92) 100%);
          backdrop-filter: blur(10px);
        }

        .aio-button:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 4px rgba(255, 255, 255, 0.18),
            0 18px 50px rgba(0, 0, 0, 0.55);
        }

        .aio-results-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .aio-results-grid {
          display: grid;
          gap: 14px;
          max-height: 420px;
          overflow: auto;
          padding-right: 6px;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
        }

        .aio-tax {
          display: grid;
          gap: 14px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.28);
        }

        .aio-taxHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .aio-taxTitle {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .aio-taxSub {
          margin-top: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
        }

        .aio-taxActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .aio-secondary {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.85);
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
          font-size: 12px;
          font-weight: 600;
        }

        .aio-secondary:hover {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.32);
          transform: translateY(-1px);
        }

        .aio-taxGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .aio-taxKpi {
          padding: 12px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
        }

        .aio-taxKpiGold {
          background: rgba(255, 255, 255, 0.10);
          border-color: rgba(255, 255, 255, 0.22);
        }

        .aio-kpiLabel {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }

        .aio-kpiValue {
          margin-top: 6px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.92);
        }

        .aio-taxLineItems {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.18);
          display: grid;
          gap: 8px;
        }

        .aio-taxLine {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
        }

        .aio-taxTableWrap {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }

        .aio-taxTableTitle {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.78);
          margin-bottom: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .aio-taxTable {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .aio-taxTable th,
        .aio-taxTable td {
          padding: 10px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.72);
        }

        .aio-taxTable th {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 11px;
        }

        .right {
          text-align: right;
        }

        @media (max-width: 520px) {
          .aio-taxGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .aio-main {
            grid-template-columns: 1fr;
          }
          .aio-right {
            display: none;
          }
          .aio-calc {
            padding: 20px;
          }
        }

        .aio-sheetBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          z-index: 50;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 10px;
        }

        .aio-sheet {
          width: 100%;
          max-width: 720px;
          max-height: 85vh;
          overflow: auto;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.20);
          background: linear-gradient(180deg, rgba(15, 15, 20, 0.98) 0%, rgba(5, 5, 8, 0.99) 100%);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65);
          padding: 14px;
        }

        .aio-sheetTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .aio-sheetTitle {
          font-weight: 800;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: 12px;
        }

        .aio-sheetClose {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.78);
          border-radius: 12px;
          padding: 8px 10px;
          cursor: pointer;
        }

        @media print {
          .aio-taxActions,
          .aio-actionbar,
          .aio-switcher {
            display: none !important;
          }
          .aio-resultsActions,
          .aio-sheetBackdrop {
            display: none !important;
          }
          .aio-calc {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            background: #fff !important;
            color: #000 !important;
          }
          .aio-main {
            display: block !important;
          }
          .aio-tax,
          .aio-taxLineItems,
          .aio-taxTableWrap,
          .aio-taxKpi {
            background: #fff !important;
            border-color: #ddd !important;
          }
          .aio-taxTitle,
          .aio-taxTable th {
            color: #000 !important;
          }
          .aio-taxTable td {
            color: #000 !important;
          }
        }

        /* Premium scrollbar (scoped) */
        .premium-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.65) rgba(255, 255, 255, 0.06);
        }

        .premium-scroll-x {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.55) rgba(255, 255, 255, 0.05);
        }

        .premium-scroll-x::-webkit-scrollbar {
          height: 10px;
        }

        .premium-scroll-x::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
        }

        .premium-scroll-x::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.68));
          border-radius: 999px;
          border: 2px solid rgba(10, 10, 14, 0.9);
        }

        .premium-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .premium-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
        }

        .premium-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.92) 0%,
            rgba(255, 255, 255, 0.72) 100%
          );
          border-radius: 999px;
          border: 2px solid rgba(10, 10, 14, 0.9);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
        }

        .premium-scroll::-webkit-scrollbar-thumb:hover {
          filter: brightness(1.08);
        }

        .aio-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 14px;
        }

        .aio-panelTitle {
          font-weight: 800;
          letter-spacing: 0.2px;
          font-size: 15px;
        }

        .aio-panelSub {
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 12px;
        }

        .aio-kpiGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        @media (max-width: 1024px) {
          .aio-kpiGrid {
            grid-template-columns: 1fr;
          }
        }

        .aio-kpi {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 12px;
        }

        .aio-kpiGold {
          border-color: rgba(255, 255, 255, 0.45);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(0, 0, 0, 0.22));
        }

        .aio-kpiMeta {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
        }

        .aio-tableWrap {
          margin-top: 12px;
        }

        .aio-tableTitle {
          margin: 10px 2px 8px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.86);
        }

        .aio-checklist {
          margin-top: 12px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.22);
        }

        .aio-checklistList {
          margin: 8px 0 0;
          padding-left: 18px;
          color: rgba(255, 255, 255, 0.85);
        }

        .aio-checklistList li {
          margin: 6px 0;
          line-height: 1.3;
        }

        .aio-note {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.32);
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.88);
          font-size: 12px;
        }

        .aio-result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }

        .aio-result-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .aio-result-value {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 1);
        }

        .aio-error {
          color: rgba(255, 120, 120, 0.9);
          padding: 16px;
          background: rgba(255, 120, 120, 0.1);
          border-radius: 10px;
        }

        @keyframes aio-fade-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aio-calc,
          .aio-results {
            animation: none;
          }
          .aio-select,
          .aio-input-wrapper,
          .aio-button {
            transition: none;
          }
        }

        @media (max-width: 640px) {
          .aio-calc {
            padding: 16px;
            border-radius: 16px;
            margin: 0 8px;
          }
          .aio-switcher {
            padding: 14px;
          }
          .aio-nativeSelect {
            display: block;
          }
          .aio-header {
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 14px;
          }
          .aio-icon {
            font-size: 28px;
          }
          .aio-title {
            font-size: 18px;
          }
          .aio-inputs {
            gap: 14px;
          }
          .aio-pills {
            gap: 6px;
            padding: 2px 0 8px;
          }
          .aio-pill {
            padding: 8px 10px;
            font-size: 12px;
          }
          .aio-input-wrapper {
            padding: 10px 12px;
          }
          .aio-input {
            font-size: 15px;
          }
          .aio-button {
            padding: 14px 16px;
            font-size: 14px;
          }
          .aio-result-item {
            padding: 12px 14px;
          }
          .aio-result-label {
            font-size: 12px;
          }
          .aio-result-value {
            font-size: 14px;
          }
          .aio-interpretation {
            padding: 12px 14px;
          }
          .aio-interpretation-text {
            font-size: 12px;
          }
          .aio-decision-gap {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            padding: 10px 12px;
          }
          .aio-review-cta {
            padding: 12px;
          }
          .aio-review-btn {
            width: 100%;
            justify-content: center;
            padding: 12px 16px;
          }
        }

        @media (max-width: 480px) {
          .aio-calc {
            padding: 14px;
            margin: 0 4px;
            border-radius: 14px;
          }
          .aio-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .aio-title {
            font-size: 16px;
          }
          .aio-desc {
            font-size: 12px;
          }
          .aio-switcher {
            padding: 12px;
            border-radius: 12px;
          }
          .aio-pills {
            margin-bottom: 8px;
          }
        }

        /* Ultra-premium mobile sheet */
        @media (max-width: 768px) {
          .aio-sheet {
            border-radius: 24px 24px 0 0;
            padding: 20px;
            max-height: 90vh;
          }
          .aio-sheetTop {
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            margin-bottom: 16px;
          }
          .aio-sheetTitle {
            font-size: 14px;
          }
          .aio-sheetClose {
            padding: 10px 14px;
            border-radius: 10px;
          }
          .aio-results-grid {
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

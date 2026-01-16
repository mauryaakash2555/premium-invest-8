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
  mfReturns: { key: 'mfReturns', label: 'Mutual Fund', icon: '📊', desc: 'Returns + exit load + tax estimate' },
  sip: { key: 'sip', label: 'SIP', icon: '📈', desc: 'SIP growth + step-up + range projections' },
  insurance: { key: 'insurance', label: 'Insurance', icon: '🛡️', desc: 'Term, health, critical illness coverage' },

  lic: { key: 'lic', label: 'LIC', icon: '🧾', desc: 'Endowment maturity + bonus + IRR estimate' },
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
  tax: { key: 'tax', label: 'Income Tax', icon: '📋', desc: 'Tax liability' },
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
// CALCULATION FUNCTIONS
// ════════════════════════════════════════════════════════════════

const calculations = {
  sip: (monthly, years, rateMid, stepUpPercent = 0, rateLow = 10, rateHigh = 14) => {
    const months = Math.max(1, Math.round((years || 0) * 12));
    const stepUp = Math.max(0, stepUpPercent || 0) / 100;

    const simulate = (annualRate) => {
      const r = Math.max(-0.99, (annualRate || 0) / 100) / 12;
      let value = 0;
      let invested = 0;
      let mSip = Math.max(0, monthly || 0);
      const schedule = [];

      for (let m = 1; m <= months; m++) {
        value = (value + mSip) * (1 + r);
        invested += mSip;
        if (m % 12 === 0) {
          schedule.push({
            year: m / 12,
            totalInvested: invested,
            endValue: value,
            monthlySIP: mSip,
          });
          mSip = mSip * (1 + stepUp);
        }
      }

      return { invested, value, schedule };
    };

    const low = simulate(rateLow);
    const mid = simulate(rateMid);
    const high = simulate(rateHigh);

    const schedule = mid.schedule.map((row, idx) => ({
      year: row.year,
      monthlySIP: row.monthlySIP,
      totalInvested: row.totalInvested,
      endValueLow: low.schedule[idx]?.endValue ?? low.value,
      endValueMid: row.endValue,
      endValueHigh: high.schedule[idx]?.endValue ?? high.value,
    }));

    return {
      __type: 'sip',
      years,
      stepUpPercent,
      rateLow,
      rateMid,
      rateHigh,
      invested: mid.invested,
      futureValueLow: low.value,
      futureValueMid: mid.value,
      futureValueHigh: high.value,
      returnsLow: low.value - low.invested,
      returnsMid: mid.value - mid.invested,
      returnsHigh: high.value - high.invested,
      schedule,
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
    smoker = 'no',
    monthlyIncome,
    retirementAge = 60,
    replacementPercent = 70,
    inflationRate = 6,
    liabilities = 0,
    existingCover = 0,
    employerCover = 0,
    dependents = 2,
    childCount = 1,
    childEduCostToday = 2500000,
    eduInYears = 12,
    finalExpenses = 500000,
    emergencyFundMonths = 6,
    healthCondition = 'good',
    occupation = 'office',
    policyTerm = 30,
    // Health Insurance specific
    healthCoverType = 'individual',
    familyMembers = 2,
    // Critical Illness specific
    ciCover = 2500000
  ) => {
    const a = Math.max(18, Math.min(65, age || 30));
    const ra = Math.max(a + 5, retirementAge || 60);
    const yearsToRetire = Math.max(5, ra - a);
    const mi = Math.max(0, monthlyIncome || 0);
    const annualIncome = mi * 12;
    const rep = Math.min(100, Math.max(0, replacementPercent || 0)) / 100;
    const infl = Math.min(20, Math.max(0, inflationRate || 0)) / 100;
    const liab = Math.max(0, liabilities || 0);
    const existing = Math.max(0, existingCover || 0) + Math.max(0, employerCover || 0);
    const kids = Math.max(0, Math.round(childCount || 0));
    const eduYears = Math.max(0, eduInYears || 0);
    const eduToday = Math.max(0, childEduCostToday || 0);
    const emergencyMonths = Math.min(24, Math.max(0, emergencyFundMonths || 0));
    const finalCost = Math.max(0, finalExpenses || 0);
    const term = Math.min(40, Math.max(5, policyTerm || 30));

    // Base pricing per crore (industry standard 2024-25)
    const basePremiumRates = {
      term: 8500,        // Term life per Cr/year
      wholeLife: 45000,  // Whole life per Cr/year
      ulip: 35000,       // ULIP per Cr/year
      health: 18000,     // Health per 10L/year (base)
      critical: 6500,    // CI per 25L/year
    };

    // Age-based multiplier (market actuarial tables)
    const getAgeFactor = (age, type) => {
      if (type === 'health' || type === 'critical') {
        if (age <= 25) return 0.7;
        if (age <= 35) return 1.0;
        if (age <= 45) return 1.4;
        if (age <= 55) return 2.1;
        return 3.2;
      }
      // Term/Life
      if (age <= 25) return 0.65;
      if (age <= 30) return 1.0;
      if (age <= 35) return 1.2;
      if (age <= 40) return 1.5;
      if (age <= 45) return 2.0;
      if (age <= 50) return 2.8;
      if (age <= 55) return 4.0;
      return 5.5;
    };

    // Factors
    const smokerFactor = String(smoker).toLowerCase() === 'yes' ? 1.6 : 1.0;
    const genderFactor = String(gender).toLowerCase() === 'female' ? 0.88 : 1.0;
    const healthFactor = {
      excellent: 0.9,
      good: 1.0,
      average: 1.15,
      poor: 1.5,
    }[healthCondition] || 1.0;
    const occupationFactor = {
      office: 1.0,
      field: 1.1,
      hazardous: 1.5,
      extreme: 2.0,
    }[occupation] || 1.0;

    const type = String(insuranceType).toLowerCase();
    let result = {};

    if (type === 'term' || type === 'wholelife' || type === 'ulip') {
      // Life Insurance calculation
      const incomeReplacement = annualIncome * rep * yearsToRetire;
      const emergencyFund = mi * emergencyMonths;
      const childEduFuturePerChild = eduToday * Math.pow(1 + infl, eduYears);
      const childEducation = kids * childEduFuturePerChild;
      const dependentBuffer = Math.max(0, (dependents || 0)) * 300000;

      const totalNeed = incomeReplacement + liab + childEducation + emergencyFund + finalCost + dependentBuffer;
      const rawCover = Math.max(0, totalNeed - existing);

      const roundTo = (n, step) => Math.ceil(n / step) * step;
      const recommendedCover = roundTo(rawCover, 500000);
      const coverLow = Math.max(0, roundTo(recommendedCover * 0.85, 500000));
      const coverHigh = roundTo(recommendedCover * 1.2, 500000);

      const ageFactor = getAgeFactor(a, 'term');
      const baseRate = basePremiumRates[type] || basePremiumRates.term;
      const totalFactor = ageFactor * smokerFactor * genderFactor * healthFactor * occupationFactor;

      const premiumForCover = (cover) => {
        const cr = cover / 10000000;
        return Math.max(3000, cr * baseRate * totalFactor);
      };

      const annualMid = premiumForCover(recommendedCover);
      const annualLow = premiumForCover(coverLow);
      const annualHigh = premiumForCover(coverHigh);

      // Rider suggestions
      const riders = [];
      if (dependents > 0) riders.push({ name: 'Accidental Death Benefit', cost: annualMid * 0.08, desc: 'Additional payout on accidental death' });
      if (mi > 75000) riders.push({ name: 'Critical Illness Rider', cost: annualMid * 0.15, desc: 'Lump sum on diagnosis of major illness' });
      riders.push({ name: 'Waiver of Premium', cost: annualMid * 0.05, desc: 'Premium waived if disabled' });
      if (kids > 0) riders.push({ name: 'Child Term Rider', cost: 2500 * kids, desc: 'Cover for children' });

      const checklist = [
        '✓ Pure term insurance gives maximum cover per rupee',
        '✓ Policy term should extend till retirement (60-65)',
        '✓ Compare quotes from HDFC Life, ICICI Pru, Max Life, LIC',
        '✓ Disclose all health conditions honestly',
        '✓ Keep health insurance separate from life cover',
        '✓ Review cover every 3-5 years or after major life events',
        '✓ Store policy documents securely, inform nominee',
        smoker === 'yes' ? '⚠️ Quitting smoking can reduce premiums by 30-40%' : null,
      ].filter(Boolean);

      result = {
        __type: 'insurance',
        insuranceType: type === 'term' ? 'Term Life' : type === 'wholelife' ? 'Whole Life' : 'ULIP',
        recommendedCover,
        coverLow,
        coverHigh,
        annualPremiumLow: annualLow,
        annualPremiumMid: annualMid,
        annualPremiumHigh: annualHigh,
        monthlyPremiumLow: annualLow / 12,
        monthlyPremiumMid: annualMid / 12,
        monthlyPremiumHigh: annualHigh / 12,
        policyTerm: term,
        breakdown: [
          { label: 'Income replacement need', value: incomeReplacement },
          { label: 'Liabilities payoff', value: liab },
          { label: 'Child education (inflation-adjusted)', value: childEducation },
          { label: 'Emergency fund', value: emergencyFund },
          { label: 'Final expenses', value: finalCost },
          { label: 'Dependent buffer', value: dependentBuffer },
          { label: 'Less: Existing cover', value: -existing },
        ],
        riders,
        assumptions: {
          yearsToRetire,
          replacementPercent,
          inflationRate,
          emergencyFundMonths: emergencyMonths,
          premiumFactors: { ageFactor: ageFactor.toFixed(2), smokerFactor, genderFactor, healthFactor, occupationFactor },
        },
        checklist,
        topInsurers: ['HDFC Life', 'ICICI Prudential', 'Max Life', 'LIC', 'SBI Life', 'Tata AIA'],
        note: 'Premiums are indicative estimates. Actual pricing depends on insurer underwriting, medicals, and chosen riders.',
      };
    } else if (type === 'health') {
      // Health Insurance calculation
      const members = Math.max(1, familyMembers || 1);
      const coverType = healthCoverType || 'individual';
      
      // Health cover recommendations based on city/lifestyle
      const baseHealthCover = mi * 36; // 3 years of income
      const recommendedHealthCover = Math.max(500000, Math.min(20000000, Math.ceil(baseHealthCover / 500000) * 500000));
      
      const ageFactor = getAgeFactor(a, 'health');
      const memberFactor = coverType === 'family' ? (1 + (members - 1) * 0.35) : 1;
      
      const premiumPer10L = basePremiumRates.health * ageFactor * healthFactor * memberFactor;
      const annualPremium = (recommendedHealthCover / 1000000) * premiumPer10L;

      const healthChecklist = [
        '✓ Minimum ₹10-15L cover for metro cities',
        '✓ Check room rent limits and sub-limits',
        '✓ Pre/post hospitalization coverage important',
        '✓ Network hospital list in your city',
        '✓ No claim bonus can grow cover 50-100%',
        '✓ Day care procedures should be covered',
        '✓ Compare: Star Health, HDFC Ergo, Care Health, Niva Bupa',
      ];

      result = {
        __type: 'insurance',
        insuranceType: 'Health Insurance',
        recommendedCover: recommendedHealthCover,
        coverType: coverType === 'family' ? `Family Floater (${members} members)` : 'Individual',
        annualPremiumMid: annualPremium,
        monthlyPremiumMid: annualPremium / 12,
        breakdown: [
          { label: 'Recommended health cover', value: recommendedHealthCover },
          { label: 'Members covered', value: members, isNumber: true },
          { label: 'Estimated annual premium', value: annualPremium },
        ],
        checklist: healthChecklist,
        topInsurers: ['Star Health', 'HDFC Ergo', 'Care Health', 'Niva Bupa', 'ICICI Lombard', 'Max Bupa'],
        note: 'Health insurance premiums increase with age. Buy early for lower lifetime costs.',
      };
    } else if (type === 'critical') {
      // Critical Illness coverage
      const ciCoverAmt = Math.max(500000, ciCover || 2500000);
      const ageFactor = getAgeFactor(a, 'critical');
      
      const annualCI = (ciCoverAmt / 2500000) * basePremiumRates.critical * ageFactor * smokerFactor * healthFactor;

      const ciChecklist = [
        '✓ CI cover = 2-3x annual income minimum',
        '✓ Check list of covered illnesses (30+ is good)',
        '✓ Survival period should be 30 days or less',
        '✓ Can be standalone or rider on term plan',
        '✓ Cancer, heart attack, stroke must be covered',
        smoker === 'yes' ? '⚠️ Smokers have higher CI risk - consider higher cover' : null,
      ].filter(Boolean);

      result = {
        __type: 'insurance',
        insuranceType: 'Critical Illness',
        recommendedCover: ciCoverAmt,
        annualPremiumMid: annualCI,
        monthlyPremiumMid: annualCI / 12,
        breakdown: [
          { label: 'Critical Illness cover', value: ciCoverAmt },
          { label: 'Estimated annual premium', value: annualCI },
        ],
        coveredConditions: ['Cancer', 'Heart Attack', 'Stroke', 'Kidney Failure', 'Major Organ Transplant', 'Paralysis', 'Multiple Sclerosis', 'Coronary Bypass'],
        checklist: ciChecklist,
        note: 'Critical illness insurance pays lump sum on diagnosis, unlike health insurance which reimburses hospital bills.',
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
    hraExemption
  ) => {
    // NOTE: This is an estimate model; rates/slabs can change by FY.
    const incStd = includeStandardDeduction === 'true' || includeStandardDeduction === true;
    const gross = Math.max(0, (grossIncome || 0) + (otherIncome || 0));
    const ageNum = Math.max(0, age || 0);

    const standardDeduction = incStd ? 50000 : 0;

    // HRA exemption is allowed only in old regime.
    const hraAllowed = regime === 'old' ? Math.max(0, hraExemption || 0) : 0;

    // Deductions (caps applied where applicable)
    const d80C = Math.max(0, Math.min(150000, deduction80C || 0));
    const d80CCD1B = Math.max(0, Math.min(50000, deduction80CCD1B || 0));
    const d80D = Math.max(0, deduction80D || 0);
    const d80E = Math.max(0, deduction80E || 0);
    const d80G = Math.max(0, deduction80G || 0);
    const d24b = Math.max(0, Math.min(200000, homeLoanInterest24b || 0));
    const d80ccd2 = Math.max(0, employerNps80ccd2 || 0);

    let deductions = 0;
    if (regime === 'old') {
      deductions = standardDeduction + hraAllowed + d80C + d80CCD1B + d80D + d80E + d80G + d24b + d80ccd2;
    } else {
      // New regime (estimate): standard deduction + employer NPS 80CCD(2)
      deductions = standardDeduction + d80ccd2;
    }

    const taxableIncome = Math.max(0, gross - deductions);

    const inr = (n) => `₹${Math.round(Math.max(0, n || 0)).toLocaleString('en-IN')}`;
    const slabLabel = (from, to) => {
      if (!isFinite(to)) return `Above ${inr(from)}`;
      if (from <= 0) return `Up to ${inr(to)}`;
      return `${inr(from)} – ${inr(to)}`;
    };

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

    const slabTaxOld = (ti) => {
      // Old regime: age-based basic exemption
      const basicExemption = ageNum >= 80 ? 500000 : ageNum >= 60 ? 300000 : 250000;
      return computeSlabBreakdown(ti, [
        { from: 0, to: basicExemption, rate: 0.0 },
        { from: basicExemption, to: basicExemption + 250000, rate: 0.05 },
        { from: basicExemption + 250000, to: basicExemption + 750000, rate: 0.20 },
        { from: basicExemption + 750000, to: Infinity, rate: 0.30 },
      ]);
    };

    const slabTaxNew = (ti) => {
      // New regime FY 2024-25 style slabs (estimate)
      return computeSlabBreakdown(ti, [
        { from: 0, to: 300000, rate: 0.0 },
        { from: 300000, to: 600000, rate: 0.05 },
        { from: 600000, to: 900000, rate: 0.10 },
        { from: 900000, to: 1200000, rate: 0.15 },
        { from: 1200000, to: 1500000, rate: 0.20 },
        { from: 1500000, to: Infinity, rate: 0.30 },
      ]);
    };

    const slabCalc = regime === 'old' ? slabTaxOld(taxableIncome) : slabTaxNew(taxableIncome);
    const taxBeforeRebate = slabCalc.totalTax;
    const slabBreakdown = slabCalc.slabs;

    // Rebate 87A (estimate): old up to 5L, new up to 7L
    const rebateThreshold = regime === 'old' ? 500000 : 700000;
    const rebate = taxableIncome <= rebateThreshold ? taxBeforeRebate : 0;
    const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate);

    const cess = taxAfterRebate * 0.04;
    const totalTax = taxAfterRebate + cess;
    const effectiveRatePercent = gross > 0 ? (totalTax / gross) * 100 : 0;

    return {
      grossIncome: gross,
      deductions,
      taxableIncome,
      taxBeforeRebate,
      rebate87A: rebate,
      taxAfterRebate,
      cess4Percent: cess,
      taxLiability: totalTax,
      monthlyTax: totalTax / 12,
      effectiveRatePercent,
      regime,
      slabBreakdown,
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
    exitLoadPercent = 0
  ) => {
    const inv = Math.max(0, invested || 0);
    const cur = Math.max(0, current || 0);
    const y = Math.max(0.1, years || 0);
    const gain = cur - inv;
    const absoluteReturnPercent = inv > 0 ? (gain / inv) * 100 : 0;
    const cagr = inv > 0 ? (Math.pow(cur / inv, 1 / y) - 1) : 0;
    const cagrPercent = cagr * 100;

    const exitLoad = Math.max(0, exitLoadPercent || 0) / 100;
    const proceedsAfterExitLoad = cur * (1 - exitLoad);

    const taxableGain = Math.max(0, proceedsAfterExitLoad - inv);
    const slab = Math.min(50, Math.max(0, taxSlabPercent || 0)) / 100;

    let taxType = 'N/A';
    let tax = 0;
    const ft = String(fundType || '').toLowerCase();
    const isEquity = ft === 'equity' || ft === 'hybrid-equity';

    if (taxableGain > 0) {
      if (isEquity) {
        if (y >= 1) {
          taxType = 'Equity LTCG (est)';
          const exemption = 100000;
          tax = Math.max(0, taxableGain - exemption) * 0.10;
        } else {
          taxType = 'Equity STCG (est)';
          tax = taxableGain * 0.15;
        }
      } else {
        if (y >= 3) {
          taxType = 'Debt LTCG (est)';
          tax = taxableGain * 0.20;
        } else {
          taxType = 'Debt STCG (est)';
          tax = taxableGain * slab;
        }
      }
    }

    const postTaxValue = Math.max(0, proceedsAfterExitLoad - tax);
    const postTaxCagr = inv > 0 ? (Math.pow(postTaxValue / inv, 1 / y) - 1) : 0;

    const er = Math.min(5, Math.max(0, expenseRatio || 0)) / 100;
    const feeDragApprox = inv > 0 ? inv * (Math.pow(1 + (cagr + er), y) - Math.pow(1 + cagr, y)) : 0;

    return {
      __type: 'mf',
      invested: inv,
      current: cur,
      years: y,
      fundType,
      absoluteReturnPercent,
      cagrPercent,
      proceedsAfterExitLoad,
      taxType,
      estimatedTax: tax,
      postTaxValue,
      postTaxCagrPercent: postTaxCagr * 100,
      expenseRatioPercent: expenseRatio,
      feeDragApprox,
      note:
        'Tax is an estimate and can differ based on fund category, holding period, and rules for the current FY.',
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
    yearsPaid = 5
  ) => {
    const sa = Math.max(0, sumAssured || 0);
    const term = Math.max(1, Math.round(policyTermYears || 0));
    const ppt = Math.max(1, Math.min(term, Math.round(premiumPayingYears || term)));
    const prem = Math.max(0, annualPremium || 0);
    const bonusRate = Math.max(0, bonusRatePerThousand || 0);
    const fab = Math.max(0, finalAdditionalBonus || 0);
    const paid = Math.max(0, Math.min(term, Math.round(yearsPaid || 0)));

    const bonusAmount = (sa / 1000) * bonusRate * term;
    const maturityValue = sa + bonusAmount + fab;
    const totalPremiums = prem * ppt;

    const cashflows = [];
    for (let i = 0; i < ppt; i++) cashflows.push(-prem);
    while (cashflows.length < term) cashflows.push(0);
    cashflows.push(maturityValue);

    const npv = (rate) => cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i + 1), 0);
    const dNpv = (rate) => cashflows.reduce((acc, cf, i) => acc - ((i + 1) * cf) / Math.pow(1 + rate, i + 2), 0);

    let irr = 0.08;
    for (let iter = 0; iter < 40; iter++) {
      const f = npv(irr);
      const df = dNpv(irr);
      if (!isFinite(f) || !isFinite(df) || Math.abs(df) < 1e-9) break;
      const next = irr - f / df;
      if (!isFinite(next)) break;
      if (Math.abs(next - irr) < 1e-7) {
        irr = next;
        break;
      }
      irr = Math.max(-0.9, Math.min(2.0, next));
    }

    let surrenderEstimate = 0;
    if (paid >= 2) {
      surrenderEstimate = 0.30 * prem * Math.max(0, paid - 1);
    }

    return {
      __type: 'lic',
      age,
      sumAssured: sa,
      policyTermYears: term,
      premiumPayingYears: ppt,
      annualPremium: prem,
      totalPremiums,
      bonusRatePerThousand: bonusRate,
      bonusAmount,
      finalAdditionalBonus: fab,
      maturityValue,
      irrPercent: irr * 100,
      yearsPaid: paid,
      surrenderEstimate,
      note:
        'LIC maturity and surrender values vary by policy type, bonus declarations, and LIC terms. This is an estimate model.',
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
    { key: '_sip_s0', label: 'SIP Setup', type: 'section' },
    { key: 'monthly', label: 'Monthly SIP', type: 'number', default: 15000, prefix: '₹' },
    { key: 'years', label: 'Time Period', type: 'number', default: 10, suffix: 'years' },
    { key: 'stepUpPercent', label: 'Annual Step-Up (optional)', type: 'number', default: 10, suffix: '%' },
    { key: '_sip_s1', label: 'Return Assumptions (range)', type: 'section' },
    { key: 'rateMid', label: 'Expected Return (mid)', type: 'number', default: 12, suffix: '%' },
    { key: 'rateLow', label: 'Conservative Return (low)', type: 'number', default: 10, suffix: '%' },
    { key: 'rateHigh', label: 'Optimistic Return (high)', type: 'number', default: 14, suffix: '%' },
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
    { key: 'smoker', label: 'Tobacco User?', type: 'select', default: 'no', options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
    ]},
    { key: 'healthCondition', label: 'Health Condition', type: 'select', default: 'good', options: [
      { value: 'excellent', label: 'Excellent (no issues)' },
      { value: 'good', label: 'Good (minor issues)' },
      { value: 'average', label: 'Average (some conditions)' },
      { value: 'poor', label: 'Poor (major conditions)' },
    ]},
    { key: 'occupation', label: 'Occupation Risk', type: 'select', default: 'office', options: [
      { value: 'office', label: 'Office / Desk Job' },
      { value: 'field', label: 'Field Work' },
      { value: 'hazardous', label: 'Hazardous (mining, etc.)' },
      { value: 'extreme', label: 'Extreme Sports / Military' },
    ]},

    { key: '_ins_s1', label: 'Income & Horizon', type: 'section' },
    { key: 'monthlyIncome', label: 'Monthly Income', type: 'number', default: 120000, prefix: '₹' },
    { key: 'retirementAge', label: 'Retirement Age', type: 'number', default: 60, suffix: 'years' },
    { key: 'policyTerm', label: 'Policy Term', type: 'number', default: 30, suffix: 'years' },
    { key: 'replacementPercent', label: 'Income Replacement Needed', type: 'number', default: 70, suffix: '%' },
    { key: 'inflationRate', label: 'Inflation Rate', type: 'number', default: 6, suffix: '%' },

    { key: '_ins_s2', label: 'Liabilities & Family', type: 'section' },
    { key: 'liabilities', label: 'Total Liabilities (loans, etc.)', type: 'number', default: 2500000, prefix: '₹' },
    { key: 'dependents', label: 'Total Dependents', type: 'number', default: 2 },
    { key: 'childCount', label: 'Children Count', type: 'number', default: 1 },

    { key: '_ins_s3', label: 'Child Education (optional)', type: 'section' },
    { key: 'childEduCostToday', label: 'Education Cost Today (per child)', type: 'number', default: 2500000, prefix: '₹' },
    { key: 'eduInYears', label: 'Education Needed In', type: 'number', default: 12, suffix: 'years' },

    { key: '_ins_s4', label: 'Existing Cover (deducted)', type: 'section' },
    { key: 'existingCover', label: 'Existing Life Cover', type: 'number', default: 0, prefix: '₹' },
    { key: 'employerCover', label: 'Employer Cover', type: 'number', default: 0, prefix: '₹' },

    { key: '_ins_s5', label: 'Buffers & Extras', type: 'section' },
    { key: 'finalExpenses', label: 'Final Expenses Buffer', type: 'number', default: 500000, prefix: '₹' },
    { key: 'emergencyFundMonths', label: 'Emergency Fund', type: 'number', default: 6, suffix: 'months' },

    { key: '_ins_health', label: 'Health Insurance (if selected)', type: 'section' },
    { key: 'healthCoverType', label: 'Health Cover Type', type: 'select', default: 'individual', options: [
      { value: 'individual', label: 'Individual' },
      { value: 'family', label: 'Family Floater' },
    ]},
    { key: 'familyMembers', label: 'Family Members (for floater)', type: 'number', default: 4 },

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
    { key: '_tax_s0', label: 'Income', type: 'section' },
    { key: 'grossIncome', label: 'Salary / Gross Income (Annual)', type: 'number', default: 1200000, prefix: '₹' },
    { key: 'otherIncome', label: 'Other Income (Interest/Rent/etc)', type: 'number', default: 0, prefix: '₹' },
    { key: 'age', label: 'Age', type: 'number', default: 30, suffix: 'years' },
    { key: 'regime', label: 'Tax Regime', type: 'select', default: 'new', options: [
      { value: 'new', label: 'New Regime' },
      { value: 'old', label: 'Old Regime' },
    ]},
    { key: 'includeStandardDeduction', label: 'Standard Deduction (₹50,000)', type: 'select', default: 'true', options: [
      { value: 'true', label: 'Include' },
      { value: 'false', label: 'Exclude' },
    ]},

    { key: '_tax_s1', label: 'Deductions (Old Regime)', type: 'section' },
    { key: 'deduction80C', label: '80C (Max ₹1,50,000)', type: 'number', default: 150000, prefix: '₹' },
    { key: 'deduction80CCD1B', label: '80CCD(1B) NPS (Max ₹50,000)', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80D', label: '80D (Health Insurance)', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80E', label: '80E (Education Loan Interest)', type: 'number', default: 0, prefix: '₹' },
    { key: 'deduction80G', label: '80G (Donations - estimate)', type: 'number', default: 0, prefix: '₹' },
    { key: 'homeLoanInterest24b', label: 'Home Loan Interest 24(b) (Max ₹2,00,000)', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_s2', label: 'New Regime Allowed', type: 'section' },
    { key: 'employerNps80ccd2', label: 'Employer NPS 80CCD(2) (if any)', type: 'number', default: 0, prefix: '₹' },

    { key: '_tax_s3', label: 'HRA (Old Regime)', type: 'section' },
    { key: 'hraExemption', label: 'HRA Exemption (from HRA calculator)', type: 'number', default: 0, prefix: '₹' },
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
    { key: '_mf_s0', label: 'Fund & Holding', type: 'section' },
    { key: 'fundType', label: 'Fund Type', type: 'select', default: 'equity', options: [
      { value: 'equity', label: 'Equity' },
      { value: 'debt', label: 'Debt' },
      { value: 'hybrid-equity', label: 'Hybrid (Equity-oriented)' },
      { value: 'hybrid-debt', label: 'Hybrid (Debt-oriented)' },
    ]},
    { key: 'years', label: 'Holding Period', type: 'number', default: 3, suffix: 'years' },
    { key: '_mf_s1', label: 'Values', type: 'section' },
    { key: 'invested', label: 'Amount Invested', type: 'number', default: 500000, prefix: '₹' },
    { key: 'current', label: 'Current Value', type: 'number', default: 750000, prefix: '₹' },
    { key: '_mf_s2', label: 'Loads & Tax Assumptions', type: 'section' },
    { key: 'exitLoadPercent', label: 'Exit Load (if any)', type: 'number', default: 0, suffix: '%' },
    { key: 'taxSlabPercent', label: 'Your Tax Slab (for debt STCG)', type: 'number', default: 30, suffix: '%' },
    { key: 'expenseRatio', label: 'Expense Ratio (reference)', type: 'number', default: 1.5, suffix: '%' },
  ],

  lic: [
    { key: '_lic_s0', label: 'Policy', type: 'section' },
    { key: 'age', label: 'Age', type: 'number', default: 30, suffix: 'years' },
    { key: 'sumAssured', label: 'Sum Assured', type: 'number', default: 1000000, prefix: '₹' },
    { key: 'policyTermYears', label: 'Policy Term', type: 'number', default: 20, suffix: 'years' },
    { key: 'premiumPayingYears', label: 'Premium Paying Term', type: 'number', default: 15, suffix: 'years' },
    { key: '_lic_s1', label: 'Premium & Bonus (estimate)', type: 'section' },
    { key: 'annualPremium', label: 'Annual Premium', type: 'number', default: 60000, prefix: '₹' },
    { key: 'bonusRatePerThousand', label: 'Bonus Rate per ₹1000 SA', type: 'number', default: 40 },
    { key: 'finalAdditionalBonus', label: 'Final Additional Bonus', type: 'number', default: 0, prefix: '₹' },
    { key: '_lic_s2', label: 'Surrender Snapshot (optional)', type: 'section' },
    { key: 'yearsPaid', label: 'Years Premium Paid So Far', type: 'number', default: 5, suffix: 'years' },
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
    const message = `${title}

${text}
${url}`;
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

  return (
    <div className="aio-calc">
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
            <div className="aio-panelTitle">Insurance Coverage Blueprint</div>
            <div className="aio-panelSub">Cover recommendation + premium range + checklist (estimate)</div>

            <div className="aio-kpiGrid">
              <div className="aio-kpi aio-kpiGold">
                <div className="aio-kpiLabel">Recommended Cover</div>
                <div className="aio-kpiValue">{fmt(result.recommendedCover)}</div>
                <div className="aio-kpiMeta">Range: {fmt(result.coverLow)} – {fmt(result.coverHigh)}</div>
              </div>
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Premium (Annual)</div>
                <div className="aio-kpiValue">{fmt(result.annualPremiumLow)} – {fmt(result.annualPremiumHigh)}</div>
                <div className="aio-kpiMeta">Range only • underwriting varies</div>
              </div>
              <div className="aio-kpi">
                <div className="aio-kpiLabel">Premium (Monthly)</div>
                <div className="aio-kpiValue">{fmt(result.monthlyPremiumLow)} – {fmt(result.monthlyPremiumHigh)}</div>
                <div className="aio-kpiMeta">Monthly equivalent</div>
              </div>
            </div>

            {Array.isArray(result.breakdown) ? (
              <div className="aio-tableWrap">
                <div className="aio-tableTitle">Coverage Components</div>
                <table className="aio-taxTable">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th className="right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((row, idx) => (
                      <tr key={`${row.label}-${idx}`}>
                        <td>{row.label}</td>
                        <td className="right">{fmt(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {Array.isArray(result.checklist) ? (
              <div className="aio-checklist">
                <div className="aio-tableTitle">Protection Checklist</div>
                <ul className="aio-checklistList">
                  {result.checklist.map((c, idx) => (
                    <li key={`${idx}-${c}`}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.note ? <div className="aio-note">{result.note}</div> : null}
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
                <div className="aio-taxTitle">Income Tax Summary</div>
                <div className="aio-taxSub">Downloadable-style breakdown (estimate)</div>
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

            <div className="aio-taxGrid">
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Regime</div>
                <div className="aio-kpiValue">{String(result.regime || '').toUpperCase()}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Gross Income</div>
                <div className="aio-kpiValue">{fmt(result.grossIncome)}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Deductions</div>
                <div className="aio-kpiValue">{fmt(result.deductions)}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Taxable Income</div>
                <div className="aio-kpiValue">{fmt(result.taxableIncome)}</div>
              </div>
              <div className="aio-taxKpi aio-taxKpiGold">
                <div className="aio-kpiLabel">Tax Liability</div>
                <div className="aio-kpiValue">{fmt(result.taxLiability)}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Monthly (Estimate)</div>
                <div className="aio-kpiValue">{fmt(result.monthlyTax)}</div>
              </div>
              <div className="aio-taxKpi">
                <div className="aio-kpiLabel">Effective Rate</div>
                <div className="aio-kpiValue">{Number(result.effectiveRatePercent || 0).toFixed(2)}%</div>
              </div>
            </div>

            <div className="aio-taxLineItems">
              <div className="aio-taxLine">
                <span>Tax (before rebate)</span>
                <span>{fmt(result.taxBeforeRebate)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Rebate 87A</span>
                <span>-{fmt(result.rebate87A)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Tax (after rebate)</span>
                <span>{fmt(result.taxAfterRebate)}</span>
              </div>
              <div className="aio-taxLine">
                <span>Cess (4%)</span>
                <span>{fmt(result.cess4Percent)}</span>
              </div>
            </div>

            {Array.isArray(result.slabBreakdown) ? (
              <div className="aio-taxTableWrap">
                <div className="aio-taxTableTitle">Slab-wise Breakdown</div>
                <table className="aio-taxTable">
                  <thead>
                    <tr>
                      <th>Slab</th>
                      <th className="right">Amount</th>
                      <th className="right">Rate</th>
                      <th className="right">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.slabBreakdown.map((s, idx) => (
                      <tr key={`${s.label}-${idx}`}>
                        <td>{s.label}</td>
                        <td className="right">{fmt(s.amount)}</td>
                        <td className="right">{Number(s.ratePercent).toFixed(2)}%</td>
                        <td className="right">{fmt(s.tax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="aio-results-grid premium-scroll">
            {Object.entries(result).map(([key, value]) => (
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
                    : value}
                </span>
              </div>
            ))}
          </div>
        );

        const canShare = !!result && !result.error;
        const resultsShell = (
          <div className="aio-resultsPanel" ref={resultsPanelRef} tabIndex={-1}>
            <div className="aio-resultsHeader">
              <h4 className="aio-results-title">Results</h4>
              <div className="aio-resultsActions">
                {canShare ? (
                  <>
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
                  className="aio-sheet"
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
          border: 1px solid rgba(192, 160, 98, 0.25);
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
          border: 1px solid rgba(192, 160, 98, 0.16);
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
          border: 1px solid rgba(192, 160, 98, 0.2);
          background: rgba(192, 160, 98, 0.06);
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
            radial-gradient(600px 220px at 20% 10%, rgba(192, 160, 98, 0.12), transparent 55%),
            radial-gradient(520px 220px at 80% 0%, rgba(192, 160, 98, 0.08), transparent 60%);
          pointer-events: none;
        }

        .aio-switcher {
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(192, 160, 98, 0.16);
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
          color: rgba(192, 160, 98, 0.95);
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
          border: 1px solid rgba(192, 160, 98, 0.2);
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .aio-searchWrap:focus-within {
          border-color: rgba(192, 160, 98, 0.55);
          box-shadow: 0 0 0 4px rgba(192, 160, 98, 0.12);
        }

        .aio-searchIcon {
          color: rgba(192, 160, 98, 0.7);
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
          border: 1px solid rgba(192, 160, 98, 0.18);
          background: rgba(192, 160, 98, 0.08);
          color: rgba(255, 255, 255, 0.78);
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease;
        }

        .aio-clear:hover {
          background: rgba(192, 160, 98, 0.14);
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
          border: 1px solid rgba(192, 160, 98, 0.16);
          background: rgba(0, 0, 0, 0.35);
          color: rgba(255, 255, 255, 0.78);
          font-size: 13px;
          cursor: pointer;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 220ms ease;
        }

        .aio-pill:hover {
          transform: translateY(-1px);
          border-color: rgba(192, 160, 98, 0.32);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
        }

        .aio-pillActive {
          border-color: rgba(192, 160, 98, 0.55);
          background: linear-gradient(180deg, rgba(192, 160, 98, 0.18), rgba(0, 0, 0, 0.35));
          color: rgba(255, 255, 255, 0.92);
          box-shadow:
            0 12px 34px rgba(0, 0, 0, 0.45),
            0 0 24px rgba(192, 160, 98, 0.14);
        }

        .aio-pillIcon {
          filter: drop-shadow(0 0 8px rgba(192, 160, 98, 0.22));
        }

        .aio-nativeSelect {
          display: none;
        }

        .aio-select {
          width: 100%;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(192, 160, 98, 0.3);
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
          color: #c0a062;
        }

        .aio-select:focus {
          border-color: rgba(192, 160, 98, 0.6);
          box-shadow:
            0 0 0 4px rgba(192, 160, 98, 0.14),
            0 10px 30px rgba(0, 0, 0, 0.45);
        }

        .aio-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(192, 160, 98, 0.15);
          position: relative;
          z-index: 1;
        }

        .aio-icon {
          font-size: 36px;
          filter: drop-shadow(0 0 8px rgba(192, 160, 98, 0.4));
        }

        .aio-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: rgba(192, 160, 98, 1);
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
          background: linear-gradient(90deg, rgba(192, 160, 98, 0.0), rgba(192, 160, 98, 0.35), rgba(192, 160, 98, 0.0));
        }

        .aio-label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(192, 160, 98, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .aio-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(192, 160, 98, 0.25);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .aio-input-wrapper:focus-within {
          border-color: rgba(192, 160, 98, 0.55);
          box-shadow: 0 0 0 4px rgba(192, 160, 98, 0.12);
        }

        .aio-prefix, .aio-suffix {
          padding: 12px 14px;
          color: rgba(192, 160, 98, 0.7);
          font-size: 14px;
          background: rgba(192, 160, 98, 0.08);
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
            0 0 0 4px rgba(192, 160, 98, 0.18),
            0 18px 50px rgba(0, 0, 0, 0.55);
        }

        .aio-results-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(192, 160, 98, 0.9);
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
          border: 1px solid rgba(192, 160, 98, 0.14);
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
          color: rgba(192, 160, 98, 0.95);
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
          border: 1px solid rgba(192, 160, 98, 0.18);
          background: rgba(192, 160, 98, 0.08);
          color: rgba(255, 255, 255, 0.85);
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
          font-size: 12px;
          font-weight: 600;
        }

        .aio-secondary:hover {
          background: rgba(192, 160, 98, 0.14);
          border-color: rgba(192, 160, 98, 0.32);
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
          border: 1px solid rgba(192, 160, 98, 0.12);
          background: rgba(192, 160, 98, 0.05);
        }

        .aio-taxKpiGold {
          background: rgba(192, 160, 98, 0.10);
          border-color: rgba(192, 160, 98, 0.22);
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
          border: 1px solid rgba(192, 160, 98, 0.10);
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
          border: 1px solid rgba(192, 160, 98, 0.10);
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
          color: rgba(192, 160, 98, 0.9);
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
          border: 1px solid rgba(192, 160, 98, 0.20);
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
          color: rgba(192, 160, 98, 0.95);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: 12px;
        }

        .aio-sheetClose {
          border: 1px solid rgba(192, 160, 98, 0.18);
          background: rgba(192, 160, 98, 0.08);
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
          scrollbar-color: rgba(192, 160, 98, 0.65) rgba(255, 255, 255, 0.06);
        }

        .premium-scroll-x {
          scrollbar-width: thin;
          scrollbar-color: rgba(192, 160, 98, 0.55) rgba(255, 255, 255, 0.05);
        }

        .premium-scroll-x::-webkit-scrollbar {
          height: 10px;
        }

        .premium-scroll-x::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
        }

        .premium-scroll-x::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, rgba(214, 179, 106, 0.92), rgba(192, 160, 98, 0.68));
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
            rgba(214, 179, 106, 0.92) 0%,
            rgba(192, 160, 98, 0.72) 100%
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
          border-color: rgba(192, 160, 98, 0.45);
          background: linear-gradient(180deg, rgba(192, 160, 98, 0.14), rgba(0, 0, 0, 0.22));
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
          border: 1px solid rgba(192, 160, 98, 0.32);
          background: rgba(192, 160, 98, 0.1);
          color: rgba(255, 255, 255, 0.88);
          font-size: 12px;
        }

        .aio-result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: rgba(192, 160, 98, 0.06);
          border: 1px solid rgba(192, 160, 98, 0.12);
          border-radius: 10px;
        }

        .aio-result-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .aio-result-value {
          font-size: 16px;
          font-weight: 600;
          color: rgba(192, 160, 98, 1);
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
          .aio-switcher {
            padding: 14px;
          }
          .aio-nativeSelect {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

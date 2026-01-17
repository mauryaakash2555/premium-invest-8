'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * DonutCalculator - Ultimate All-Services Calculator
 * 
 * ALL 21 SERVICES:
 * 1. SIP Calculator
 * 2. Lumpsum Calculator
 * 3. Goal Planning
 * 4. Retirement Planning
 * 5. FD Calculator
 * 6. Insurance Calculator
 * 
 * Features:
 * - Scrollable dropdown (morn style)
 * - No arrows on numbers
 * - Modern & premium design
 * - Donut changes when numbers change
 */

// All 21 service calculators
const CALC_MODES = {
  sip: { key: 'sip', label: 'SIP', icon: '📈', desc: 'Monthly investment growth' },
  lumpsum: { key: 'lumpsum', label: 'Lumpsum', icon: '💰', desc: 'One-time investment' },
  goal: { key: 'goal', label: 'Goal', icon: '🎯', desc: 'Target amount planning' },
  retire: { key: 'retire', label: 'Retire', icon: '🏖️', desc: 'Retirement corpus' },
  fd: { key: 'fd', label: 'FD', icon: '🏦', desc: 'Fixed deposit returns' },
  insurance: { key: 'insurance', label: 'Insurance', icon: '🛡️', desc: 'Life cover calculator' },
  ppf: { key: 'ppf', label: 'PPF', icon: '🏛️', desc: 'Public Provident Fund' },
  epf: { key: 'epf', label: 'EPF', icon: '👷', desc: 'Employee PF returns' },
  nps: { key: 'nps', label: 'NPS', icon: '🧓', desc: 'National Pension Scheme' },
  elss: { key: 'elss', label: 'ELSS', icon: '💎', desc: 'Tax saving mutual funds' },
  emi: { key: 'emi', label: 'EMI', icon: '🏠', desc: 'Loan EMI calculator' },
  swp: { key: 'swp', label: 'SWP', icon: '💸', desc: 'Systematic Withdrawal' },
  stepup: { key: 'stepup', label: 'Step-Up', icon: '📊', desc: 'Step-up SIP growth' },
  cagr: { key: 'cagr', label: 'CAGR', icon: '📉', desc: 'Compound Annual Growth' },
  inflation: { key: 'inflation', label: 'Inflation', icon: '🔥', desc: 'Inflation adjusted value' },
  gratuity: { key: 'gratuity', label: 'Gratuity', icon: '🎁', desc: 'Gratuity calculator' },
  hra: { key: 'hra', label: 'HRA', icon: '🏢', desc: 'HRA exemption' },
  tax: { key: 'tax', label: 'Tax', icon: '📋', desc: 'Income tax calculator' },
  rd: { key: 'rd', label: 'RD', icon: '📅', desc: 'Recurring deposit' },
  ssy: { key: 'ssy', label: 'SSY', icon: '👧', desc: 'Sukanya Samriddhi Yojana' },
  wealth: { key: 'wealth', label: 'Wealth', icon: '💵', desc: 'Wealth growth planner' },
  // Additional calculators
  mf: { key: 'mf', label: 'MF Returns', icon: '📊', desc: 'Mutual fund returns' },
  childPlan: { key: 'childPlan', label: 'Child', icon: '👶', desc: 'Child education plan' },
  marriage: { key: 'marriage', label: 'Marriage', icon: '💍', desc: 'Marriage fund planner' },
  car: { key: 'car', label: 'Car Loan', icon: '🚗', desc: 'Car loan EMI' },
  home: { key: 'home', label: 'Home Loan', icon: '🏡', desc: 'Home loan EMI' },
  gold: { key: 'gold', label: 'Gold', icon: '🪙', desc: 'Gold investment returns' },
};

// Format to Indian currency
const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

// SIP Calculator
const calcSIP = (m, y, r) => {
  const n = y * 12, rate = r / 100 / 12;
  const inv = m * n;
  const fv = m * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: r, years: y };
};

// Lumpsum Calculator
const calcLump = (p, y, r) => {
  const fv = p * Math.pow(1 + r / 100, y);
  return { invested: p, futureValue: fv, returns: fv - p, cagr: r, years: y };
};

// Goal Planning Calculator
const calcGoal = (t, y, r) => {
  const n = y * 12, rate = r / 100 / 12;
  const sip = t * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
  const inv = sip * n;
  return { invested: inv, futureValue: t, returns: t - inv, monthlySIP: Math.ceil(sip), cagr: r, years: y };
};

// Retirement Calculator
const calcRetire = (exp, age, retAge) => {
  const yrs = retAge - age, retYrs = 85 - retAge;
  const futExp = exp * Math.pow(1.06, yrs);
  const corpus = futExp * 12 * retYrs * 1.3;
  const n = yrs * 12, rate = 0.12 / 12;
  const sip = corpus * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
  return { invested: sip * n, futureValue: corpus, returns: corpus - sip * n, monthlySIP: Math.ceil(sip), futureExp: Math.round(futExp), cagr: 12, years: yrs };
};

// FD Calculator
const calcFD = (p, y, r, compound = 4) => {
  const n = compound * y;
  const rate = r / 100 / compound;
  const fv = p * Math.pow(1 + rate, n);
  const interest = fv - p;
  return { invested: p, futureValue: fv, returns: interest, interestEarned: interest, cagr: r, years: y };
};

// Insurance Calculator (Life Cover estimation)
const calcInsurance = (age, income, liabilities, dependents) => {
  const workingYears = 60 - age;
  const incomeReplacement = income * 12 * workingYears * 0.7;
  const liabilityCover = liabilities;
  const dependentCover = dependents * 500000;
  const totalCover = incomeReplacement + liabilityCover + dependentCover;
  const annualPremium = totalCover * 0.003 * (1 + (age - 25) * 0.02);
  return { 
    coverNeeded: totalCover, 
    annualPremium: Math.round(annualPremium), 
    monthlyPremium: Math.round(annualPremium / 12),
    incomeReplacement,
    liabilityCover,
    dependentCover,
  };
};

// PPF Calculator (7.1% annual, 15 years typical)
const calcPPF = (m, y = 15, r = 7.1) => {
  const n = y, rate = r / 100;
  const inv = m * 12 * n;
  let fv = 0;
  for (let i = 0; i < n; i++) {
    fv = (fv + m * 12) * (1 + rate);
  }
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: r, years: y };
};

// EPF Calculator
const calcEPF = (basicSalary, y = 25, r = 8.15) => {
  const monthly = basicSalary * 0.24; // 12% employee + 12% employer
  const n = y * 12, rate = r / 100 / 12;
  const inv = monthly * n;
  const fv = monthly * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: r, years: y };
};

// NPS Calculator
const calcNPS = (m, y, r = 10) => calcSIP(m, y, r);

// ELSS Calculator (3yr lock-in, equity returns)
const calcELSS = (m, y = 3, r = 12) => calcSIP(m, y, r);

// EMI Calculator
const calcEMI = (p, y, r) => {
  const n = y * 12, rate = r / 100 / 12;
  const emi = p * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
  const totalPaid = emi * n;
  return { emi: Math.round(emi), totalPaid, interestPaid: totalPaid - p, principal: p, years: y };
};

// SWP Calculator
const calcSWP = (corpus, monthly, r = 8) => {
  const rate = r / 100 / 12;
  const months = Math.log(corpus * rate / (corpus * rate - monthly)) / Math.log(1 + rate);
  const years = Math.max(0, months / 12);
  return { corpus, monthlyWithdrawal: monthly, yearsLast: years.toFixed(1), cagr: r };
};

// Step-up SIP Calculator
const calcStepUp = (m, y, r = 12, stepUp = 10) => {
  const rate = r / 100 / 12;
  let fv = 0, inv = 0, currentSIP = m;
  for (let yr = 0; yr < y; yr++) {
    for (let mn = 0; mn < 12; mn++) {
      inv += currentSIP;
      fv = (fv + currentSIP) * (1 + rate);
    }
    currentSIP = currentSIP * (1 + stepUp / 100);
  }
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: r, years: y };
};

// CAGR Calculator
const calcCAGR = (initial, final, y) => {
  const cagr = (Math.pow(final / initial, 1 / y) - 1) * 100;
  return { initial, final, years: y, cagr: cagr.toFixed(2) };
};

// Inflation Calculator
const calcInflation = (amount, y, inflationRate = 6) => {
  const futureValue = amount * Math.pow(1 + inflationRate / 100, y);
  const realValue = amount / Math.pow(1 + inflationRate / 100, y);
  return { currentValue: amount, futureValue, realValue, years: y, rate: inflationRate };
};

// Gratuity Calculator
const calcGratuity = (basicSalary, y) => {
  const gratuity = (basicSalary * 15 * y) / 26;
  return { basicSalary, years: y, gratuity: Math.round(gratuity) };
};

// HRA Calculator
const calcHRA = (hra, basic, rent, metro = true) => {
  const exemption1 = hra;
  const exemption2 = basic * (metro ? 0.5 : 0.4);
  const exemption3 = rent - (basic * 0.1);
  const hraExemption = Math.max(0, Math.min(exemption1, exemption2, exemption3));
  return { hra, basic, rent, hraExemption: Math.round(hraExemption), taxable: hra - hraExemption };
};

// Tax Calculator (simplified)
const calcTax = (income) => {
  let tax = 0;
  if (income > 1500000) tax += (income - 1500000) * 0.30 + 187500;
  else if (income > 1200000) tax += (income - 1200000) * 0.20 + 127500;
  else if (income > 900000) tax += (income - 900000) * 0.15 + 82500;
  else if (income > 600000) tax += (income - 600000) * 0.10 + 37500;
  else if (income > 300000) tax += (income - 300000) * 0.05 + 12500;
  else if (income > 250000) tax += (income - 250000) * 0.05;
  return { income, tax: Math.round(tax), netIncome: income - tax, effectiveRate: ((tax / income) * 100).toFixed(1) };
};

// RD Calculator
const calcRD = (m, y, r = 6.5) => {
  const n = y * 12, rate = r / 100 / 12;
  const inv = m * n;
  const fv = m * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: r, years: y };
};

// SSY (Sukanya Samriddhi Yojana)
const calcSSY = (m, y = 15, r = 8.2) => calcPPF(m, y, r);

// Wealth Growth Planner (generic)
const calcWealth = (initial, monthly, y, r = 12) => {
  const rate = r / 100 / 12;
  const n = y * 12;
  const fvLumpsum = initial * Math.pow(1 + r / 100, y);
  const fvSIP = monthly * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  const totalFV = fvLumpsum + fvSIP;
  const inv = initial + (monthly * n);
  return { invested: inv, futureValue: totalFV, returns: totalFV - inv, cagr: r, years: y };
};

// MF Returns Calculator (with expense ratio adjustment)
const calcMF = (m, y, r = 12, expenseRatio = 1.5) => {
  const effectiveReturn = r - expenseRatio;
  const rate = effectiveReturn / 100 / 12;
  const n = y * 12;
  const inv = m * n;
  const fv = m * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: effectiveReturn.toFixed(1), years: y, expenseRatio };
};

// Child Education Plan Calculator
const calcChildPlan = (currentAge, targetAge, targetAmt, inflationRate = 6, returnRate = 12) => {
  const years = targetAge - currentAge;
  const inflatedTarget = targetAmt * Math.pow(1 + inflationRate / 100, years);
  const rate = returnRate / 100 / 12;
  const n = years * 12;
  const monthlyNeeded = inflatedTarget / (((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate));
  return { 
    targetAmount: targetAmt, 
    inflatedTarget, 
    monthlySIP: Math.round(monthlyNeeded), 
    years, 
    invested: monthlyNeeded * n,
    futureValue: inflatedTarget,
    returns: inflatedTarget - (monthlyNeeded * n)
  };
};

// Marriage Fund Calculator
const calcMarriage = (years, targetAmt, inflationRate = 7) => {
  const inflatedTarget = targetAmt * Math.pow(1 + inflationRate / 100, years);
  const rate = 12 / 100 / 12;
  const n = years * 12;
  const monthlyNeeded = inflatedTarget / (((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate));
  return { 
    targetAmount: targetAmt, 
    inflatedTarget, 
    monthlySIP: Math.round(monthlyNeeded), 
    years,
    invested: monthlyNeeded * n,
    futureValue: inflatedTarget,
    returns: inflatedTarget - (monthlyNeeded * n)
  };
};

// Car Loan EMI Calculator (with processing fee & insurance)
const calcCarLoan = (carPrice, downPayment, y, r = 9, processingFee = 1) => {
  const loanAmt = carPrice - downPayment;
  const processing = loanAmt * processingFee / 100;
  const n = y * 12, rate = r / 100 / 12;
  const emi = loanAmt * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
  const totalPaid = emi * n + processing;
  return { 
    loanAmount: loanAmt, 
    emi: Math.round(emi), 
    totalPaid, 
    interestPaid: totalPaid - loanAmt, 
    processingFee: processing,
    years: y 
  };
};

// Home Loan EMI Calculator (with stamp duty & registration)
const calcHomeLoan = (propertyPrice, downPayment, y, r = 8.5, stampDuty = 7) => {
  const loanAmt = propertyPrice - downPayment;
  const stampDutyAmt = propertyPrice * stampDuty / 100;
  const n = y * 12, rate = r / 100 / 12;
  const emi = loanAmt * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
  const totalPaid = emi * n;
  return { 
    loanAmount: loanAmt, 
    emi: Math.round(emi), 
    totalPaid, 
    interestPaid: totalPaid - loanAmt,
    stampDuty: stampDutyAmt,
    totalCost: totalPaid + stampDutyAmt + downPayment,
    years: y 
  };
};

// Gold Investment Calculator (with making charges)
const calcGold = (weight, currentPrice, y, growthRate = 8, makingCharges = 15) => {
  const purchaseCost = weight * currentPrice * (1 + makingCharges / 100);
  const futurePrice = currentPrice * Math.pow(1 + growthRate / 100, y);
  const resaleValue = weight * futurePrice * 0.98; // 2% resale loss
  return { 
    purchaseCost, 
    futureValue: resaleValue, 
    returns: resaleValue - purchaseCost,
    invested: purchaseCost,
    weight,
    futurePrice: Math.round(futurePrice),
    years: y 
  };
};

export default function DonutCalculator({ onResultChange }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('sip');
  
  // SIP inputs
  const [sipAmt, setSipAmt] = useState(10000);
  const [sipYrs, setSipYrs] = useState(10);
  const [sipRate, setSipRate] = useState(12);
  
  // Lumpsum inputs
  const [lumpAmt, setLumpAmt] = useState(500000);
  const [lumpYrs, setLumpYrs] = useState(5);
  const [lumpRate, setLumpRate] = useState(12);
  
  // Goal inputs
  const [goalAmt, setGoalAmt] = useState(2500000);
  const [goalYrs, setGoalYrs] = useState(10);
  const [goalRate, setGoalRate] = useState(12);
  
  // Retirement inputs
  const [retExp, setRetExp] = useState(50000);
  const [currAge, setCurrAge] = useState(30);
  const [retAge, setRetAge] = useState(55);
  
  // FD inputs
  const [fdAmt, setFdAmt] = useState(500000);
  const [fdYrs, setFdYrs] = useState(3);
  const [fdRate, setFdRate] = useState(7.5);
  
  // Insurance inputs
  const [insAge, setInsAge] = useState(30);
  const [insIncome, setInsIncome] = useState(100000);
  const [insLiabilities, setInsLiabilities] = useState(2000000);
  const [insDependents, setInsDependents] = useState(2);
  
  // PPF inputs
  const [ppfAmt, setPpfAmt] = useState(12500);
  const [ppfYrs, setPpfYrs] = useState(15);
  
  // EPF inputs
  const [epfBasic, setEpfBasic] = useState(50000);
  const [epfYrs, setEpfYrs] = useState(25);
  
  // NPS inputs
  const [npsAmt, setNpsAmt] = useState(5000);
  const [npsYrs, setNpsYrs] = useState(25);
  const [npsRate, setNpsRate] = useState(10);
  
  // ELSS inputs
  const [elssAmt, setElssAmt] = useState(12500);
  const [elssYrs, setElssYrs] = useState(5);
  const [elssRate, setElssRate] = useState(12);
  
  // EMI inputs
  const [emiPrincipal, setEmiPrincipal] = useState(1000000);
  const [emiYrs, setEmiYrs] = useState(5);
  const [emiRate, setEmiRate] = useState(10);
  
  // SWP inputs
  const [swpCorpus, setSwpCorpus] = useState(5000000);
  const [swpMonthly, setSwpMonthly] = useState(30000);
  const [swpRate, setSwpRate] = useState(8);
  
  // Step-up SIP inputs
  const [stepAmt, setStepAmt] = useState(10000);
  const [stepYrs, setStepYrs] = useState(10);
  const [stepRate, setStepRate] = useState(12);
  const [stepUp, setStepUp] = useState(10);
  
  // CAGR inputs
  const [cagrInitial, setCagrInitial] = useState(100000);
  const [cagrFinal, setCagrFinal] = useState(200000);
  const [cagrYrs, setCagrYrs] = useState(5);
  
  // Inflation inputs
  const [infAmt, setInfAmt] = useState(100000);
  const [infYrs, setInfYrs] = useState(10);
  const [infRate, setInfRate] = useState(6);
  
  // Gratuity inputs
  const [gratBasic, setGratBasic] = useState(50000);
  const [gratYrs, setGratYrs] = useState(15);
  
  // HRA inputs
  const [hraAmt, setHraAmt] = useState(20000);
  const [hraBasic, setHraBasic] = useState(40000);
  const [hraRent, setHraRent] = useState(15000);
  const [hraMetro, setHraMetro] = useState(true);
  
  // Tax inputs
  const [taxIncome, setTaxIncome] = useState(1200000);
  
  // RD inputs
  const [rdAmt, setRdAmt] = useState(5000);
  const [rdYrs, setRdYrs] = useState(5);
  const [rdRate, setRdRate] = useState(6.5);
  
  // SSY inputs
  const [ssyAmt, setSsyAmt] = useState(12500);
  const [ssyYrs, setSsyYrs] = useState(15);
  
  // Wealth inputs
  const [wealthInitial, setWealthInitial] = useState(500000);
  const [wealthMonthly, setWealthMonthly] = useState(10000);
  const [wealthYrs, setWealthYrs] = useState(10);
  const [wealthRate, setWealthRate] = useState(12);
  
  // MF inputs
  const [mfAmt, setMfAmt] = useState(10000);
  const [mfYrs, setMfYrs] = useState(10);
  const [mfRate, setMfRate] = useState(12);
  const [mfExpense, setMfExpense] = useState(1.5);
  
  // Child Plan inputs
  const [childAge, setChildAge] = useState(5);
  const [childTargetAge, setChildTargetAge] = useState(18);
  const [childAmt, setChildAmt] = useState(2500000);
  
  // Marriage inputs
  const [marriageYrs, setMarriageYrs] = useState(10);
  const [marriageAmt, setMarriageAmt] = useState(2500000);
  
  // Car Loan inputs
  const [carPrice, setCarPrice] = useState(1000000);
  const [carDown, setCarDown] = useState(200000);
  const [carYrs, setCarYrs] = useState(5);
  const [carRate, setCarRate] = useState(9);
  
  // Home Loan inputs
  const [homePrice, setHomePrice] = useState(7500000);
  const [homeDown, setHomeDown] = useState(1500000);
  const [homeYrs, setHomeYrs] = useState(20);
  const [homeRate, setHomeRate] = useState(8.5);
  
  // Gold inputs
  const [goldWeight, setGoldWeight] = useState(10);
  const [goldPrice, setGoldPrice] = useState(6500);
  const [goldYrs, setGoldYrs] = useState(5);

  const result = useMemo(() => {
    switch (mode) {
      case 'sip': return calcSIP(sipAmt, sipYrs, sipRate);
      case 'lumpsum': return calcLump(lumpAmt, lumpYrs, lumpRate);
      case 'goal': return calcGoal(goalAmt, goalYrs, goalRate);
      case 'retire': return calcRetire(retExp, currAge, retAge);
      case 'fd': return calcFD(fdAmt, fdYrs, fdRate);
      case 'insurance': return calcInsurance(insAge, insIncome, insLiabilities, insDependents);
      case 'ppf': return calcPPF(ppfAmt, ppfYrs);
      case 'epf': return calcEPF(epfBasic, epfYrs);
      case 'nps': return calcNPS(npsAmt, npsYrs, npsRate);
      case 'elss': return calcELSS(elssAmt, elssYrs, elssRate);
      case 'emi': return calcEMI(emiPrincipal, emiYrs, emiRate);
      case 'swp': return calcSWP(swpCorpus, swpMonthly, swpRate);
      case 'stepup': return calcStepUp(stepAmt, stepYrs, stepRate, stepUp);
      case 'cagr': return calcCAGR(cagrInitial, cagrFinal, cagrYrs);
      case 'inflation': return calcInflation(infAmt, infYrs, infRate);
      case 'gratuity': return calcGratuity(gratBasic, gratYrs);
      case 'hra': return calcHRA(hraAmt, hraBasic, hraRent, hraMetro);
      case 'tax': return calcTax(taxIncome);
      case 'rd': return calcRD(rdAmt, rdYrs, rdRate);
      case 'ssy': return calcSSY(ssyAmt, ssyYrs);
      case 'wealth': return calcWealth(wealthInitial, wealthMonthly, wealthYrs, wealthRate);
      case 'mf': return calcMF(mfAmt, mfYrs, mfRate, mfExpense);
      case 'childPlan': return calcChildPlan(childAge, childTargetAge, childAmt);
      case 'marriage': return calcMarriage(marriageYrs, marriageAmt);
      case 'car': return calcCarLoan(carPrice, carDown, carYrs, carRate);
      case 'home': return calcHomeLoan(homePrice, homeDown, homeYrs, homeRate);
      case 'gold': return calcGold(goldWeight, goldPrice, goldYrs);
      default: return calcSIP(10000, 10, 12);
    }
  }, [mode, sipAmt, sipYrs, sipRate, lumpAmt, lumpYrs, lumpRate, goalAmt, goalYrs, goalRate, 
      retExp, currAge, retAge, fdAmt, fdYrs, fdRate, insAge, insIncome, insLiabilities, insDependents,
      ppfAmt, ppfYrs, epfBasic, epfYrs, npsAmt, npsYrs, npsRate, elssAmt, elssYrs, elssRate,
      emiPrincipal, emiYrs, emiRate, swpCorpus, swpMonthly, swpRate, stepAmt, stepYrs, stepRate, stepUp,
      cagrInitial, cagrFinal, cagrYrs, infAmt, infYrs, infRate, gratBasic, gratYrs,
      hraAmt, hraBasic, hraRent, hraMetro, taxIncome, rdAmt, rdYrs, rdRate, ssyAmt, ssyYrs,
      wealthInitial, wealthMonthly, wealthYrs, wealthRate, mfAmt, mfYrs, mfRate, mfExpense,
      childAge, childTargetAge, childAmt, marriageYrs, marriageAmt, carPrice, carDown, carYrs, carRate,
      homePrice, homeDown, homeYrs, homeRate, goldWeight, goldPrice, goldYrs]);

  // Handle input changes (no arrows)
  const handleNumericInput = (setter, min = 0, max = Infinity) => (e) => {
    const val = e.target.value.replace(/[^\d.]/g, '');
    const num = parseFloat(val) || min;
    setter(Math.min(max, Math.max(min, num)));
  };

  return (
    <div className="calc-wrap">
      {/* Toggle Header */}
      <button type="button" className="calc-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="calc-toggle-icon li-calc-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(140, 200, 255, 0.95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="10" y2="10"/>
            <line x1="14" y1="10" x2="16" y2="10"/>
            <line x1="8" y1="14" x2="10" y2="14"/>
            <line x1="14" y1="14" x2="16" y2="14"/>
            <line x1="8" y1="18" x2="10" y2="18"/>
            <line x1="14" y1="18" x2="16" y2="18"/>
          </svg>
        </span>
        <span className="calc-toggle-text">Ultimate Calculator</span>
        <span className={`calc-toggle-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {/* Collapsible Calculator Content - SCROLLABLE */}
      {isOpen && (
        <div className="calc-content">
          {/* Scrollable Tabs */}
          <div className="calc-tabs-scroll">
            <div className="calc-tabs">
              {Object.values(CALC_MODES).map(m => (
                <button
                  key={m.key}
                  type="button"
                  className={`calc-tab ${mode === m.key ? 'active' : ''}`}
                  onClick={() => setMode(m.key)}
                >
                  <span className="calc-tab-icon">{m.icon}</span>
                  <span className="calc-tab-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Mode description */}
          <div className="calc-mode-desc">
            {CALC_MODES[mode].desc}
          </div>

          {/* Inputs - varies by mode */}
          <div className="calc-inputs">
            {mode === 'sip' && (
              <>
                <div className="calc-field">
                  <label>Monthly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={sipAmt} onChange={handleNumericInput(setSipAmt, 500)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={sipYrs} onChange={handleNumericInput(setSipYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={sipRate} onChange={handleNumericInput(setSipRate, 1, 30)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'lumpsum' && (
              <>
                <div className="calc-field">
                  <label>Amount</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={lumpAmt} onChange={handleNumericInput(setLumpAmt, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={lumpYrs} onChange={handleNumericInput(setLumpYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={lumpRate} onChange={handleNumericInput(setLumpRate, 1, 30)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'goal' && (
              <>
                <div className="calc-field">
                  <label>Target</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={goalAmt} onChange={handleNumericInput(setGoalAmt, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={goalYrs} onChange={handleNumericInput(setGoalYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={goalRate} onChange={handleNumericInput(setGoalRate, 1, 30)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'retire' && (
              <>
                <div className="calc-field">
                  <label>Expense/mo</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={retExp} onChange={handleNumericInput(setRetExp, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Your Age</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={currAge} onChange={handleNumericInput(setCurrAge, 18, 55)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Retire At</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={retAge} onChange={handleNumericInput(setRetAge, currAge + 5, 65)} />
                  </div>
                </div>
              </>
            )}
            
            {mode === 'fd' && (
              <>
                <div className="calc-field">
                  <label>Principal</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={fdAmt} onChange={handleNumericInput(setFdAmt, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Tenure</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={fdYrs} onChange={handleNumericInput(setFdYrs, 1, 10)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Rate</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={fdRate} onChange={handleNumericInput(setFdRate, 3, 10)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'insurance' && (
              <>
                <div className="calc-field">
                  <label>Your Age</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={insAge} onChange={handleNumericInput(setInsAge, 18, 55)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Income/mo</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={insIncome} onChange={handleNumericInput(setInsIncome, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Liabilities</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={insLiabilities} onChange={handleNumericInput(setInsLiabilities, 0)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Dependents</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={insDependents} onChange={handleNumericInput(setInsDependents, 0, 10)} />
                  </div>
                </div>
              </>
            )}
            
            {mode === 'ppf' && (
              <>
                <div className="calc-field">
                  <label>Yearly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={ppfAmt * 12} onChange={(e) => setPpfAmt(Math.round(parseFloat(e.target.value.replace(/[^\d]/g, '')) / 12) || 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={ppfYrs} onChange={handleNumericInput(setPpfYrs, 15, 50)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'epf' && (
              <>
                <div className="calc-field">
                  <label>Basic Salary</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={epfBasic} onChange={handleNumericInput(setEpfBasic, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={epfYrs} onChange={handleNumericInput(setEpfYrs, 1, 35)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'nps' && (
              <>
                <div className="calc-field">
                  <label>Monthly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={npsAmt} onChange={handleNumericInput(setNpsAmt, 500)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={npsYrs} onChange={handleNumericInput(setNpsYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={npsRate} onChange={handleNumericInput(setNpsRate, 6, 14)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'elss' && (
              <>
                <div className="calc-field">
                  <label>Monthly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={elssAmt} onChange={handleNumericInput(setElssAmt, 500)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={elssYrs} onChange={handleNumericInput(setElssYrs, 3, 30)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={elssRate} onChange={handleNumericInput(setElssRate, 6, 20)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'emi' && (
              <>
                <div className="calc-field">
                  <label>Loan Amt</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={emiPrincipal} onChange={handleNumericInput(setEmiPrincipal, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Tenure</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={emiYrs} onChange={handleNumericInput(setEmiYrs, 1, 30)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Rate</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={emiRate} onChange={handleNumericInput(setEmiRate, 5, 20)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'swp' && (
              <>
                <div className="calc-field">
                  <label>Corpus</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={swpCorpus} onChange={handleNumericInput(setSwpCorpus, 100000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Withdraw/mo</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={swpMonthly} onChange={handleNumericInput(setSwpMonthly, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={swpRate} onChange={handleNumericInput(setSwpRate, 4, 15)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'stepup' && (
              <>
                <div className="calc-field">
                  <label>Start SIP</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={stepAmt} onChange={handleNumericInput(setStepAmt, 500)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={stepYrs} onChange={handleNumericInput(setStepYrs, 1, 30)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Step-up</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={stepUp} onChange={handleNumericInput(setStepUp, 0, 50)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'cagr' && (
              <>
                <div className="calc-field">
                  <label>Initial</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={cagrInitial} onChange={handleNumericInput(setCagrInitial, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Final</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={cagrFinal} onChange={handleNumericInput(setCagrFinal, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={cagrYrs} onChange={handleNumericInput(setCagrYrs, 1, 50)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'inflation' && (
              <>
                <div className="calc-field">
                  <label>Amount</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={infAmt} onChange={handleNumericInput(setInfAmt, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={infYrs} onChange={handleNumericInput(setInfYrs, 1, 50)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Inflation</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={infRate} onChange={handleNumericInput(setInfRate, 1, 15)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'gratuity' && (
              <>
                <div className="calc-field">
                  <label>Basic Salary</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={gratBasic} onChange={handleNumericInput(setGratBasic, 5000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Service Yrs</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={gratYrs} onChange={handleNumericInput(setGratYrs, 5, 50)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'hra' && (
              <>
                <div className="calc-field">
                  <label>HRA Rcvd</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={hraAmt} onChange={handleNumericInput(setHraAmt, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Basic</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={hraBasic} onChange={handleNumericInput(setHraBasic, 5000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Rent Paid</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={hraRent} onChange={handleNumericInput(setHraRent, 0)} />
                  </div>
                </div>
              </>
            )}
            
            {mode === 'tax' && (
              <>
                <div className="calc-field">
                  <label>Annual Income</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={taxIncome} onChange={handleNumericInput(setTaxIncome, 100000)} />
                  </div>
                </div>
              </>
            )}
            
            {mode === 'rd' && (
              <>
                <div className="calc-field">
                  <label>Monthly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={rdAmt} onChange={handleNumericInput(setRdAmt, 100)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Tenure</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={rdYrs} onChange={handleNumericInput(setRdYrs, 1, 10)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Rate</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={rdRate} onChange={handleNumericInput(setRdRate, 3, 10)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'ssy' && (
              <>
                <div className="calc-field">
                  <label>Yearly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={ssyAmt * 12} onChange={(e) => setSsyAmt(Math.round(parseFloat(e.target.value.replace(/[^\d]/g, '')) / 12) || 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={ssyYrs} onChange={handleNumericInput(setSsyYrs, 15, 21)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'wealth' && (
              <>
                <div className="calc-field">
                  <label>Initial</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={wealthInitial} onChange={handleNumericInput(setWealthInitial, 0)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Monthly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={wealthMonthly} onChange={handleNumericInput(setWealthMonthly, 500)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={wealthYrs} onChange={handleNumericInput(setWealthYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'mf' && (
              <>
                <div className="calc-field">
                  <label>Monthly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={mfAmt} onChange={handleNumericInput(setMfAmt, 500)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={mfYrs} onChange={handleNumericInput(setMfYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Expense</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={mfExpense} onChange={handleNumericInput(setMfExpense, 0.1, 3)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'childPlan' && (
              <>
                <div className="calc-field">
                  <label>Child Age</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={childAge} onChange={handleNumericInput(setChildAge, 0, 15)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Target Age</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={childTargetAge} onChange={handleNumericInput(setChildTargetAge, 16, 25)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Target Amt</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={childAmt} onChange={handleNumericInput(setChildAmt, 100000)} />
                  </div>
                </div>
              </>
            )}
            
            {mode === 'marriage' && (
              <>
                <div className="calc-field">
                  <label>In Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={marriageYrs} onChange={handleNumericInput(setMarriageYrs, 1, 30)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Target Amt</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={marriageAmt} onChange={handleNumericInput(setMarriageAmt, 100000)} />
                  </div>
                </div>
              </>
            )}
            
            {mode === 'car' && (
              <>
                <div className="calc-field">
                  <label>Car Price</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={carPrice} onChange={handleNumericInput(setCarPrice, 100000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Down Pay</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={carDown} onChange={handleNumericInput(setCarDown, 0)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Tenure</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={carYrs} onChange={handleNumericInput(setCarYrs, 1, 7)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'home' && (
              <>
                <div className="calc-field">
                  <label>Property</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={homePrice} onChange={handleNumericInput(setHomePrice, 1000000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Down Pay</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={homeDown} onChange={handleNumericInput(setHomeDown, 0)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Tenure</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={homeYrs} onChange={handleNumericInput(setHomeYrs, 5, 30)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'gold' && (
              <>
                <div className="calc-field">
                  <label>Weight (g)</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={goldWeight} onChange={handleNumericInput(setGoldWeight, 1)} />
                    <span className="calc-input-suffix">g</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Price/g</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={goldPrice} onChange={handleNumericInput(setGoldPrice, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Hold Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={goldYrs} onChange={handleNumericInput(setGoldYrs, 1, 30)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Results - varies by mode */}
          <div className="calc-results">
            {/* Insurance mode */}
            {mode === 'insurance' && (
              <>
                <div className="calc-result highlight">
                  <span className="calc-result-label">Cover Needed</span>
                  <span className="calc-result-value">{fmt(result.coverNeeded)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Annual Premium</span>
                  <span className="calc-result-value">{fmt(result.annualPremium)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Monthly</span>
                  <span className="calc-result-value">{fmt(result.monthlyPremium)}</span>
                </div>
              </>
            )}
            
            {/* EMI-based modes */}
            {(mode === 'emi' || mode === 'car' || mode === 'home') && (
              <>
                <div className="calc-result highlight">
                  <span className="calc-result-label">Monthly EMI</span>
                  <span className="calc-result-value">{fmt(result.emi)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Total Paid</span>
                  <span className="calc-result-value">{fmt(result.totalPaid)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Interest</span>
                  <span className="calc-result-value loss">{fmt(result.interestPaid)}</span>
                </div>
              </>
            )}
            
            {/* SWP mode */}
            {mode === 'swp' && (
              <>
                <div className="calc-result highlight">
                  <span className="calc-result-label">Monthly</span>
                  <span className="calc-result-value">{fmt(result.monthlyWithdrawal)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Corpus</span>
                  <span className="calc-result-value">{fmt(result.corpus)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Lasts</span>
                  <span className="calc-result-value gain">{result.yearsLast} yrs</span>
                </div>
              </>
            )}
            
            {/* CAGR mode */}
            {mode === 'cagr' && (
              <>
                <div className="calc-result">
                  <span className="calc-result-label">Initial</span>
                  <span className="calc-result-value">{fmt(result.initial)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Final</span>
                  <span className="calc-result-value">{fmt(result.final)}</span>
                </div>
                <div className="calc-result highlight">
                  <span className="calc-result-label">CAGR</span>
                  <span className="calc-result-value gain">{result.cagr}%</span>
                </div>
              </>
            )}
            
            {/* Inflation mode */}
            {mode === 'inflation' && (
              <>
                <div className="calc-result">
                  <span className="calc-result-label">Today</span>
                  <span className="calc-result-value">{fmt(result.currentValue)}</span>
                </div>
                <div className="calc-result highlight">
                  <span className="calc-result-label">Future Cost</span>
                  <span className="calc-result-value loss">{fmt(result.futureValue)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Real Value</span>
                  <span className="calc-result-value">{fmt(result.realValue)}</span>
                </div>
              </>
            )}
            
            {/* Gratuity mode */}
            {mode === 'gratuity' && (
              <>
                <div className="calc-result">
                  <span className="calc-result-label">Basic Salary</span>
                  <span className="calc-result-value">{fmt(result.basicSalary)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Years</span>
                  <span className="calc-result-value">{result.years} yrs</span>
                </div>
                <div className="calc-result highlight">
                  <span className="calc-result-label">Gratuity</span>
                  <span className="calc-result-value gain">{fmt(result.gratuity)}</span>
                </div>
              </>
            )}
            
            {/* HRA mode */}
            {mode === 'hra' && (
              <>
                <div className="calc-result highlight">
                  <span className="calc-result-label">HRA Exempt</span>
                  <span className="calc-result-value gain">{fmt(result.hraExemption)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Taxable HRA</span>
                  <span className="calc-result-value loss">{fmt(result.taxable)}</span>
                </div>
              </>
            )}
            
            {/* Tax mode */}
            {mode === 'tax' && (
              <>
                <div className="calc-result">
                  <span className="calc-result-label">Income</span>
                  <span className="calc-result-value">{fmt(result.income)}</span>
                </div>
                <div className="calc-result highlight">
                  <span className="calc-result-label">Tax</span>
                  <span className="calc-result-value loss">{fmt(result.tax)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Effective Rate</span>
                  <span className="calc-result-value">{result.effectiveRate}%</span>
                </div>
              </>
            )}
            
            {/* Goal-based modes (need monthly SIP) */}
            {(mode === 'goal' || mode === 'retire' || mode === 'childPlan' || mode === 'marriage') && (
              <>
                <div className="calc-result highlight">
                  <span className="calc-result-label">SIP Needed</span>
                  <span className="calc-result-value">{fmt(result.monthlySIP)}/mo</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Target</span>
                  <span className="calc-result-value">{fmt(result.futureValue || result.inflatedTarget)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Invested</span>
                  <span className="calc-result-value">{fmt(result.invested)}</span>
                </div>
              </>
            )}
            
            {/* Standard investment modes (invested, future value, returns) */}
            {['sip', 'lumpsum', 'fd', 'ppf', 'epf', 'nps', 'elss', 'stepup', 'rd', 'ssy', 'wealth', 'mf', 'gold'].includes(mode) && (
              <>
                <div className="calc-result">
                  <span className="calc-result-label">
                    {mode === 'gold' ? 'Purchase Cost' : 'Invested'}
                  </span>
                  <span className="calc-result-value">{fmt(result.invested || result.purchaseCost)}</span>
                </div>
                <div className="calc-result highlight">
                  <span className="calc-result-label">
                    {mode === 'fd' || mode === 'rd' ? 'Maturity' : 'Future Value'}
                  </span>
                  <span className="calc-result-value">{fmt(result.futureValue)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">
                    {mode === 'fd' || mode === 'rd' ? 'Interest' : 'Returns'}
                  </span>
                  <span className="calc-result-value gain">{fmt(result.returns)}</span>
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="calc-cta">
            <button type="button" onClick={() => router.push('/tools')}>
              📥 All Calculators
            </button>
            <button type="button" onClick={() => router.push('/contact')} className="calc-cta-primary">
              📞 Talk to Expert
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .calc-wrap {
          margin-top: 16px;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(8, 12, 20, 0.65);
          border: 1px solid rgba(100, 180, 255, 0.10);
          backdrop-filter: blur(12px);
        }

        .calc-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .calc-toggle:hover {
          background: rgba(100, 180, 255, 0.06);
        }

        .calc-toggle-icon { 
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .calc-toggle-icon svg {
          filter: drop-shadow(0 0 4px rgba(140, 200, 255, 0.4));
          animation: calcIconPulse 3s ease-in-out infinite;
        }
        
        @keyframes calcIconPulse {
          0%, 100% { 
            filter: drop-shadow(0 0 4px rgba(140, 200, 255, 0.4));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 12px rgba(140, 220, 255, 0.8));
            transform: scale(1.08);
          }
        }

        .calc-toggle-text {
          flex: 1;
          text-align: left;
          color: rgba(200, 220, 255, 0.85);
          font-size: 13px;
          font-weight: 600;
        }

        .calc-toggle-badge {
          padding: 3px 8px;
          background: rgba(100, 180, 255, 0.12);
          border: 1px solid rgba(100, 180, 255, 0.20);
          border-radius: 6px;
          color: rgba(140, 200, 255, 0.90);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .calc-toggle-arrow {
          color: rgba(150, 180, 220, 0.5);
          font-size: 10px;
          transition: transform 0.25s ease;
        }

        .calc-toggle-arrow.open {
          transform: rotate(180deg);
        }

        .calc-content {
          padding: 0 16px 16px;
          animation: fadeSlide 0.25s ease-out;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scrollable tabs container - Premium Scroll */
        .calc-tabs-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          margin: 0 -16px;
          padding: 0 16px 8px 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(170, 198, 255, 0.35) rgba(0, 0, 0, 0);
          -ms-overflow-style: auto;
        }

        .calc-tabs-scroll::-webkit-scrollbar {
          height: 6px;
        }
        
        .calc-tabs-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0);
          border-radius: 3px;
        }
        
        .calc-tabs-scroll::-webkit-scrollbar-thumb {
          background: rgba(170, 198, 255, 0.25);
          border-radius: 3px;
        }
        
        .calc-tabs-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(170, 198, 255, 0.40);
        }

        .calc-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          min-width: max-content;
          padding-bottom: 4px;
        }

        .calc-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 10px 14px;
          min-width: 58px;
          background: rgba(100, 180, 255, 0.04);
          border: 1px solid rgba(100, 180, 255, 0.08);
          border-radius: 10px;
          color: rgba(150, 180, 220, 0.55);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .calc-tab-icon { font-size: 16px; }
        .calc-tab-label { font-size: 10px; font-weight: 600; }

        .calc-tab:hover {
          background: rgba(100, 180, 255, 0.10);
          color: rgba(180, 210, 255, 0.80);
          border-color: rgba(100, 180, 255, 0.15);
        }

        .calc-tab.active {
          background: rgba(100, 180, 255, 0.15);
          border-color: rgba(100, 180, 255, 0.30);
          color: rgba(140, 210, 255, 0.95);
          box-shadow: 0 0 20px rgba(100, 180, 255, 0.12);
        }

        .calc-mode-desc {
          text-align: center;
          color: rgba(150, 180, 220, 0.50);
          font-size: 11px;
          margin-bottom: 14px;
          padding: 0 10px;
        }

        .calc-inputs {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .calc-field {
          flex: 1;
          min-width: 70px;
        }

        .calc-field label {
          display: block;
          font-size: 10px;
          color: rgba(150, 180, 220, 0.55);
          margin-bottom: 5px;
          font-weight: 500;
        }

        .calc-input-wrap {
          display: flex;
          align-items: center;
          background: rgba(10, 18, 30, 0.75);
          border: 1px solid rgba(100, 180, 255, 0.12);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .calc-input-wrap:focus-within {
          border-color: rgba(100, 180, 255, 0.35);
          box-shadow: 0 0 12px rgba(100, 180, 255, 0.10);
        }

        .calc-input-prefix,
        .calc-input-suffix {
          padding: 0 8px;
          color: rgba(150, 180, 220, 0.45);
          font-size: 12px;
          font-weight: 500;
        }

        .calc-field input {
          flex: 1;
          width: 100%;
          padding: 10px 8px;
          background: transparent;
          border: none;
          color: rgba(230, 245, 255, 0.95);
          font-size: 15px;
          font-weight: 600;
          text-align: center;
          outline: none;
          -moz-appearance: textfield;
        }

        .calc-field input::-webkit-outer-spin-button,
        .calc-field input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .calc-results {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .calc-result {
          flex: 1;
          min-width: 80px;
          padding: 12px 10px;
          background: rgba(15, 22, 38, 0.55);
          border: 1px solid rgba(100, 180, 255, 0.06);
          border-radius: 10px;
          text-align: center;
        }

        .calc-result.highlight {
          background: linear-gradient(180deg, rgba(100, 180, 255, 0.12) 0%, rgba(100, 180, 255, 0.06) 100%);
          border-color: rgba(100, 180, 255, 0.18);
        }

        .calc-result-label {
          display: block;
          font-size: 9px;
          color: rgba(150, 180, 220, 0.55);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .calc-result-value {
          font-size: 14px;
          font-weight: 700;
          color: rgba(230, 245, 255, 0.95);
        }

        .calc-result-value.gain {
          color: rgba(100, 220, 160, 0.95);
        }

        .calc-cta {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .calc-cta button {
          padding: 10px 16px;
          background: rgba(100, 180, 255, 0.08);
          border: 1px solid rgba(100, 180, 255, 0.15);
          border-radius: 8px;
          color: rgba(140, 200, 255, 0.85);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calc-cta button:hover {
          background: rgba(100, 180, 255, 0.15);
          border-color: rgba(100, 180, 255, 0.25);
        }

        .calc-cta-primary {
          background: linear-gradient(180deg, rgba(100, 180, 255, 0.18) 0%, rgba(100, 180, 255, 0.08) 100%) !important;
          border-color: rgba(100, 180, 255, 0.30) !important;
          color: rgba(200, 230, 255, 0.95) !important;
        }

        .calc-cta-primary:hover {
          background: linear-gradient(180deg, rgba(100, 180, 255, 0.25) 0%, rgba(100, 180, 255, 0.12) 100%) !important;
          box-shadow: 0 0 20px rgba(100, 180, 255, 0.15);
        }

        @media (max-width: 500px) {
          .calc-inputs { gap: 8px; }
          .calc-field { min-width: calc(50% - 4px); }
          .calc-results { gap: 6px; }
          .calc-result { min-width: calc(33% - 4px); padding: 10px 6px; }
          .calc-result-value { font-size: 12px; }
          .calc-cta { flex-wrap: wrap; }
          .calc-cta button { flex: 1; min-width: 120px; }
        }
      `}</style>
    </div>
  );
}

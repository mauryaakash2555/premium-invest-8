import { inflationMonthlyFromAnnual } from "./time";

/**
 * COST ENGINE
 * Calculates the opportunity cost of delaying an investment.
 */
export function calculateOpportunityCost(params: {
  delayedAmount: number;
  marketReturns: number[];
  delayPeriod: number; // months
}): number {
  const { delayedAmount, marketReturns, delayPeriod } = params;
  const delay = Math.max(0, Math.floor(delayPeriod));

  let valueIfInvested = delayedAmount;
  for (let i = 0; i < Math.min(delay, marketReturns.length); i += 1) {
    valueIfInvested *= 1 + marketReturns[i];
  }

  const valueIfDelayed = delayedAmount;
  return valueIfInvested - valueIfDelayed;
}

/**
 * COST ENGINE
 * Inflation erosion on a nominal amount.
 */
export function calculateInflationErosion(params: {
  amount: number;
  years: number;
  inflationRateAnnual: number;
}): { realValue: number; erosion: number } {
  const { amount, years, inflationRateAnnual } = params;
  const months = Math.max(0, Math.floor(years * 12));
  const m = inflationMonthlyFromAnnual(inflationRateAnnual);
  const factor = Math.pow(1 + m, months);
  const realValue = factor > 0 ? amount / factor : amount;
  return { realValue, erosion: amount - realValue };
}

export function calculateExpenseRatioDrag(params: {
  value: number;
  expenseRatioAnnual: number;
}): number {
  const monthly = Math.pow(1 + params.expenseRatioAnnual, 1 / 12) - 1;
  return params.value * monthly;
}

export function calculateExitLoad(params: {
  amountRedeemed: number;
  exitLoadRate: number;
}): number {
  return Math.max(0, params.amountRedeemed) * Math.max(0, params.exitLoadRate);
}

import type { Frequency } from "./types";

export function monthsForYears(years: number): number {
  return Math.max(0, Math.floor(years * 12));
}

export function monthToYearIndex(monthIndex: number): number {
  return Math.floor(monthIndex / 12);
}

export function inflationMonthlyFromAnnual(annual: number): number {
  // Compounded: (1 + a)^(1/12) - 1
  return Math.pow(1 + annual, 1 / 12) - 1;
}

export function contributionForMonth(params: {
  monthIndex: number;
  baseMonthly: number;
  stepUpAnnual?: number;
}): number {
  const { monthIndex, baseMonthly, stepUpAnnual } = params;
  if (!stepUpAnnual) return baseMonthly;

  const yearIndex = monthToYearIndex(monthIndex);
  const factor = Math.pow(1 + stepUpAnnual, yearIndex);
  return baseMonthly * factor;
}

export function effectiveFrequency(freq: Frequency | undefined): Frequency {
  return freq ?? "monthly";
}

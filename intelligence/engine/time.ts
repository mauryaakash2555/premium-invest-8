import type { Frequency } from "./types";

export interface TimelinePoint {
  index: number;
  date: Date;
  /** ISO YYYY-MM-DD */
  isoDate: string;
}

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

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Trading-day approximation: weekdays excluding provided holiday dates.
 * Holiday calendar is passed in (versioned) to avoid hardcoding.
 */
export function isTradingDay(d: Date, holidayIsoSet: ReadonlySet<string>): boolean {
  if (isWeekend(d)) return false;
  return !holidayIsoSet.has(toIsoDate(d));
}

function lastTradingDayOfMonth(year: number, monthIndex0: number, holidays: ReadonlySet<string>): Date {
  const last = new Date(year, monthIndex0 + 1, 0);
  let cursor = new Date(last);
  while (!isTradingDay(cursor, holidays)) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return cursor;
}

/**
 * TIME ENGINE
 * Creates a timeline between two dates.
 * - frequency: 'monthly' returns month-end (last trading day) points.
 */
export function createTimeline(params: {
  startDate: Date;
  endDate: Date;
  frequency?: Frequency;
  holidaysIso?: ReadonlyArray<string>;
}): TimelinePoint[] {
  const { startDate, endDate } = params;
  const frequency = effectiveFrequency(params.frequency);
  const holidays = new Set(params.holidaysIso ?? []);

  if (endDate.getTime() < startDate.getTime()) return [];

  const out: TimelinePoint[] = [];

  if (frequency === "monthly") {
    // iterate month by month
    let y = startDate.getFullYear();
    let m = startDate.getMonth();

    // include starting month if startDate <= last trading day
    while (true) {
      const pointDate = lastTradingDayOfMonth(y, m, holidays);
      if (pointDate.getTime() >= startDate.getTime() && pointDate.getTime() <= endDate.getTime()) {
        out.push({ index: out.length, date: pointDate, isoDate: toIsoDate(pointDate) });
      }

      // advance month
      if (y > endDate.getFullYear() || (y === endDate.getFullYear() && m >= endDate.getMonth())) break;
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }

      // safety stop
      if (out.length > 2000) break;
    }

    return out;
  }

  // Yearly: pick last trading day of December each year.
  if (frequency === "yearly") {
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year += 1) {
      const d = lastTradingDayOfMonth(year, 11, holidays);
      if (d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime()) {
        out.push({ index: out.length, date: d, isoDate: toIsoDate(d) });
      }
    }
  }
  return out;
}

/**
 * Fast-forwards the timeline by N years (pure transformation).
 */
export function fastForward(timeline: TimelinePoint[], years: number): TimelinePoint[] {
  const monthsShift = Math.round(years * 12);
  return timeline.map((p, idx) => {
    const d = new Date(p.date);
    d.setMonth(d.getMonth() + monthsShift);
    return { index: idx, date: d, isoDate: toIsoDate(d) };
  });
}

/**
 * Creates multiple identical parallel timelines (structural copies).
 */
export function createParallelTimelines(baseTimeline: TimelinePoint[], count: number): TimelinePoint[][] {
  const n = Math.max(0, Math.floor(count));
  const out: TimelinePoint[][] = [];
  for (let i = 0; i < n; i += 1) {
    out.push(baseTimeline.map((p) => ({ ...p, date: new Date(p.date) })));
  }
  return out;
}

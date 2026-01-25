import { DEFAULT_PANIC_DRAWDOWN_THRESHOLD } from "../constants";
import { calculateDrawdowns } from "../market";

/**
 * Applies panic selling: once drawdown crosses threshold, returns become 0 thereafter.
 * This is a simplified consequence model (extensible to realization + taxes).
 */
export function applyPanicSelling(returns: number[], threshold = DEFAULT_PANIC_DRAWDOWN_THRESHOLD): number[] {
  const dd = calculateDrawdowns(returns);
  const t = Math.max(0, threshold);

  let triggeredAt: number | null = null;
  for (const p of dd) {
    if (p.drawdown >= t) {
      triggeredAt = p.index;
      break;
    }
  }

  if (triggeredAt === null) return [...returns];

  return returns.map((r, idx) => (idx > triggeredAt! ? 0 : r));
}

/**
 * Stops SIP contributions during negative return months after a trigger.
 */
export function applySipDiscontinuation(params: {
  sipFlow: number[];
  marketReturns: number[];
  triggerEvent: "any-negative" | "drawdown";
  drawdownThreshold?: number;
}): number[] {
  const { sipFlow, marketReturns, triggerEvent } = params;
  const n = Math.min(sipFlow.length, marketReturns.length);

  if (triggerEvent === "any-negative") {
    return sipFlow.slice(0, n).map((amt, i) => (marketReturns[i] < 0 ? 0 : amt));
  }

  const dd = calculateDrawdowns(marketReturns.slice(0, n));
  const t = Math.max(0, params.drawdownThreshold ?? DEFAULT_PANIC_DRAWDOWN_THRESHOLD);

  return sipFlow.slice(0, n).map((amt, i) => (dd[i]?.drawdown >= t ? 0 : amt));
}

/**
 * Shifts a timeline by delay months (used to quantify delay cost).
 */
export function applyDelayCost<T>(timeline: T[], delayMonths: number): T[] {
  const d = Math.max(0, Math.floor(delayMonths));
  if (d === 0) return [...timeline];
  if (d >= timeline.length) return [];
  return timeline.slice(d);
}

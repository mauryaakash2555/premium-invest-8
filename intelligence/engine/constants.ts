/**
 * India-first constants (2025 baseline) used by the simulation engine.
 * Keep all numeric policy values centralized here (no magic numbers).
 */

export const INDIA_CURRENCY = "₹" as const;

export const NSE_MARKET_HOURS = {
  open: "09:15",
  close: "15:30",
} as const;

// NOTE: NSE holiday calendars change yearly. This is a minimal placeholder set.
// The engine accepts custom holiday sets per simulation.
export const DEFAULT_NSE_HOLIDAYS_2026: ReadonlyArray<string> = [
  // ISO dates, example placeholders
  "2026-01-26", // Republic Day
  "2026-03-08",
  "2026-08-15", // Independence Day
  "2026-10-02", // Gandhi Jayanti
];

export const INDIA_INFLATION_BASELINE_ANNUAL = 0.06;

// Equity tax baseline (as per STEP_1_PROMPT.md)
export const INDIA_EQUITY_LTCG_RATE = 0.125;
export const INDIA_EQUITY_STCG_RATE = 0.2;
export const INDIA_EQUITY_LTCG_EXEMPTION_ANNUAL = 125_000;
export const INDIA_EQUITY_LONG_TERM_HOLDING_MONTHS = 12;

// Mutual fund costs
export const INDIA_EQUITY_MF_EXIT_LOAD_RATE = 0.01;
export const INDIA_EQUITY_MF_EXIT_LOAD_MONTHS = 12;

// FD + TDS baseline
export const INDIA_FD_TDS_RATE = 0.1;
export const INDIA_FD_TDS_INTEREST_THRESHOLD_ANNUAL = 40_000;
export const INDIA_FD_PREMATURE_PENALTY_RATE_DEFAULT = 0.015;

// Transaction costs (simplified, education-only placeholders)
export const INDIA_STOCKS_BROKERAGE_RATE = 0.001; // 0.10%
export const INDIA_STOCKS_STT_RATE = 0.001; // placeholder

// Behavior defaults
export const DEFAULT_PANIC_DRAWDOWN_THRESHOLD = 0.2;

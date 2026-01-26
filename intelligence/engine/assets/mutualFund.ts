import type { TaxAssetTypeIndia } from "../types";
import {
  INDIA_EQUITY_LTCG_EXEMPTION_ANNUAL,
  INDIA_EQUITY_LTCG_RATE,
  INDIA_EQUITY_LONG_TERM_HOLDING_MONTHS,
  INDIA_EQUITY_MF_EXIT_LOAD_MONTHS,
  INDIA_EQUITY_MF_EXIT_LOAD_RATE,
  INDIA_EQUITY_STCG_RATE,
} from "../constants";
import { calculateExpenseRatioDrag, calculateExitLoad } from "../costs";
import { calculateCapitalGainsTax } from "../tax";

export interface MfSimulationResult {
  /** Final corpus before exit load + tax. */
  finalValue: number;
  /** Final corpus after exit load + tax. */
  postTaxFinalValue: number;
  investedTotal: number;
  gains: number;
  taxPaid: number;
  exitLoadPaid: number;
}

/**
 * Calculates equity mutual fund value path using market returns.
 * Supports SIP contributions, expense ratio drag, and simplified exit load + tax.
 */
export function calculateMfReturns(params: {
  initial: number;
  timeline: unknown[];
  sipAmount: number;
  marketReturns: number[];
  behaviorReturns?: number[];
  expenseRatioAnnual?: number;
  redeemAtEnd?: boolean;
}): MfSimulationResult {
  const {
    initial,
    timeline,
    sipAmount,
    marketReturns,
    behaviorReturns,
    expenseRatioAnnual = 0.01,
    redeemAtEnd = true,
  } = params;

  const n = Math.min(timeline.length, marketReturns.length);

  let value = Math.max(0, initial);
  let investedTotal = Math.max(0, initial);

  // Very simplified holding period assumption: average holding = half the horizon.
  const holdingMonthsApprox = Math.max(0, Math.floor(n / 2));

  for (let i = 0; i < n; i += 1) {
    const contrib = Math.max(0, sipAmount);
    value += contrib;
    investedTotal += contrib;

    const r = behaviorReturns ? behaviorReturns[i] ?? marketReturns[i] : marketReturns[i];
    value *= 1 + r;

    const drag = calculateExpenseRatioDrag({ value, expenseRatioAnnual });
    value = Math.max(0, value - drag);
  }

  const preTaxValue = value;
  const gains = Math.max(0, preTaxValue - investedTotal);

  let exitLoadPaid = 0;
  let postTaxValue = preTaxValue;
  if (redeemAtEnd && n < INDIA_EQUITY_MF_EXIT_LOAD_MONTHS) {
    exitLoadPaid = calculateExitLoad({ amountRedeemed: postTaxValue, exitLoadRate: INDIA_EQUITY_MF_EXIT_LOAD_RATE });
    postTaxValue = Math.max(0, postTaxValue - exitLoadPaid);
  }

  let taxPaid = 0;
  if (redeemAtEnd) {
    const assetType: TaxAssetTypeIndia = "equity_mf";
    const holdingPeriodMonths = holdingMonthsApprox;

    const tax = calculateCapitalGainsTax({
      gains,
      holdingPeriodMonths,
      assetType,
      ltcgRate: INDIA_EQUITY_LTCG_RATE,
      stcgRate: INDIA_EQUITY_STCG_RATE,
      ltcgExemptionAnnual: INDIA_EQUITY_LTCG_EXEMPTION_ANNUAL,
      longTermHoldingMonths: INDIA_EQUITY_LONG_TERM_HOLDING_MONTHS,
    });

    taxPaid = tax.taxPaid;
    postTaxValue = Math.max(0, postTaxValue - taxPaid);
  }

  return {
    finalValue: preTaxValue,
    postTaxFinalValue: postTaxValue,
    investedTotal,
    gains,
    taxPaid,
    exitLoadPaid,
  };
}

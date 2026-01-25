import type { TaxAssetTypeIndia } from "../types";
import {
  INDIA_EQUITY_LTCG_EXEMPTION_ANNUAL,
  INDIA_EQUITY_LTCG_RATE,
  INDIA_EQUITY_LONG_TERM_HOLDING_MONTHS,
  INDIA_EQUITY_STCG_RATE,
  INDIA_STOCKS_BROKERAGE_RATE,
  INDIA_STOCKS_STT_RATE,
} from "../constants";
import { calculateCapitalGainsTax } from "../tax";

export interface StockSimulationResult {
  /** Final corpus before transaction costs + tax. */
  finalValue: number;
  /** Final corpus after transaction costs + tax. */
  postTaxFinalValue: number;
  investedTotal: number;
  gains: number;
  taxPaid: number;
  transactionCosts: number;
}

/**
 * Calculates stock portfolio value using market returns + optional dividends.
 * Includes simplified STT + brokerage costs.
 */
export function calculateStockReturns(params: {
  initial: number;
  timeline: unknown[];
  marketReturns: number[];
  dividendsAnnualYield?: number;
  behaviorReturns?: number[];
  redeemAtEnd?: boolean;
}): StockSimulationResult {
  const {
    initial,
    timeline,
    marketReturns,
    behaviorReturns,
    dividendsAnnualYield = 0.01,
    redeemAtEnd = true,
  } = params;

  const n = Math.min(timeline.length, marketReturns.length);

  let value = Math.max(0, initial);
  const investedTotal = Math.max(0, initial);

  let transactionCosts = 0;

  // Approx holding: full horizon
  const holdingPeriodMonths = n;

  const dividendMonthly = Math.pow(1 + dividendsAnnualYield, 1 / 12) - 1;

  for (let i = 0; i < n; i += 1) {
    const r = behaviorReturns ? behaviorReturns[i] ?? marketReturns[i] : marketReturns[i];
    value *= 1 + r;
    value *= 1 + dividendMonthly;
  }

  const preTaxValue = value;
  let postTaxValue = preTaxValue;

  if (redeemAtEnd) {
    // Sell transaction costs
    const stt = postTaxValue * INDIA_STOCKS_STT_RATE;
    const brokerage = postTaxValue * INDIA_STOCKS_BROKERAGE_RATE;
    transactionCosts = stt + brokerage;
    postTaxValue = Math.max(0, postTaxValue - transactionCosts);
  }

  const gains = Math.max(0, preTaxValue - investedTotal);

  let taxPaid = 0;
  if (redeemAtEnd) {
    const assetType: TaxAssetTypeIndia = "stocks";
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

  return { finalValue: preTaxValue, postTaxFinalValue: postTaxValue, investedTotal, gains, taxPaid, transactionCosts };
}

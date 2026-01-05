import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function safeNonNegative(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, v);
}

function round0(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v);
}

function formatSignedINR(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v === 0) return formatINR(0);
  const abs = Math.abs(v);
  const base = formatINR(round0(abs));
  return v < 0 ? `−${base}` : base;
}

// Locked assumptions
export const MUMBAI_PROPERTY_VS_SIP_ASSUMPTIONS = {
  propertyCagr: 0.04,
  sipCagr: 0.145,
  maintenanceDrag: 0.025,
  rentalYield: 0.025,
  maxYears: 30,
  defaultYears: 15,
};

/**
 * Computes Mumbai Property vs SIP wealth gap using deterministic compounding.
 * - Property FV = propertyPrice × (1 + propertyCagr) ^ years
 * - Annual rent = propertyPrice × rentalYield
 * - Total rent = annualRent × years
 * - Maintenance = propertyPrice × maintenanceDrag × years
 * - Equity path uses the SAME upfront capital as property purchase:
 *   Lump-sum FV = propertyPrice × (1 + sipCagr) ^ years
 * - Plus monthly SIP FV using monthly rate r = sipCagr / 12
 */
export function computeMumbaiPropertyVsSip({ propertyPrice, monthlySip, years }) {
  const a = MUMBAI_PROPERTY_VS_SIP_ASSUMPTIONS;

  const P0 = safeNonNegative(propertyPrice);
  const pmt = safeNonNegative(monthlySip);
  const Y = Math.round(clampNumber(years ?? a.defaultYears, 1, a.maxYears));

  const gP = a.propertyCagr;
  const gS = a.sipCagr;

  const propertyEndValue = P0 * Math.pow(1 + gP, Y);

  const annualRent = P0 * a.rentalYield;
  const totalRent = annualRent * Y;

  const annualMaintenance = P0 * a.maintenanceDrag;
  const totalMaintenance = annualMaintenance * Y;

  const netPropertyWealth = propertyEndValue + totalRent - totalMaintenance;

  const months = Y * 12;
  const r = gS / 12;
  const sipMonthlyFutureValue = r > 0 ? pmt * (((Math.pow(1 + r, months) - 1) / r) * (1 + r)) : pmt * months;
  const sipLumpSumFutureValue = P0 * Math.pow(1 + gS, Y);
  const sipFutureValue = sipLumpSumFutureValue + sipMonthlyFutureValue;

  const sipTotalInvested = P0 + pmt * months;
  const sipWealthCreated = sipFutureValue - sipTotalInvested;

  const wealthGap = sipFutureValue - netPropertyWealth;

  return {
    inputs: { propertyPrice: P0, monthlySip: pmt, years: Y },
    assumptions: { ...a },
    propertyEndValue,
    annualRent,
    totalRent,
    annualMaintenance,
    totalMaintenance,
    netPropertyWealth,
    sipLumpSumFutureValue,
    sipMonthlyFutureValue,
    sipFutureValue,
    sipTotalInvested,
    sipWealthCreated,
    wealthGap,
  };
}

export function formatMumbaiPropertyVsSipResults(model) {
  return {
    values: {
      propertyEndValue: formatINR(round0(model?.propertyEndValue || 0)),
      annualRent: formatINR(round0(model?.annualRent || 0)),
      totalRent: formatINR(round0(model?.totalRent || 0)),
      annualMaintenance: formatINR(round0(model?.annualMaintenance || 0)),
      totalMaintenance: formatINR(round0(model?.totalMaintenance || 0)),
      netPropertyWealth: formatINR(round0(model?.netPropertyWealth || 0)),
      sipFutureValue: formatINR(round0(model?.sipFutureValue || 0)),
      wealthGap: formatSignedINR(model?.wealthGap || 0),
    },
  };
}

export function buildMumbaiPropertyVsSipPdfPayload({ lead, model }) {
  const name = String(lead?.name || "").trim();
  const y = model?.inputs?.years || MUMBAI_PROPERTY_VS_SIP_ASSUMPTIONS.defaultYears;

  const premiumFooterLine = "BM Wealth | ARN 90008";

  const disclaimerFooter =
    "Disclaimer: BM Wealth (ARN 90008) is an AMFI-registered Mutual Fund Distributor. This report is a mathematical projection based on historical market data (Property 4% / Equity 14.5%) and is intended for educational purposes only. This is not SEBI-regulated investment advice. Mutual fund investments are subject to market risks; read all scheme-related documents carefully.";

  return {
    meta: {
      coverBrand: "BM WEALTH",
      coverTitle: "Mumbai Property vs SIP Wealth Gap Report",
      coverSubtitle: `EDUCATIONAL PROJECTION • ${y} years`,
      footerLine: premiumFooterLine,
      disclaimerFooter,
      filename: "Mumbai-Property-vs-SIP-Wealth-Gap-Report.pdf",
      emailSubject: "📥 Your Private Wealth Roadmap: Property vs SIP Analysis",
      emailTitle: "Your Private Wealth Roadmap: Property vs SIP Analysis",
      emailSubtitle: "Your PDF is attached.",
      emailFooter: disclaimerFooter,
      adminLabel: "Mumbai Property vs SIP Report ₹399",
    },
    variables: {
      userName: name,
      generatedOn: new Date().toLocaleString("en-IN"),
      income: formatINR(round0(model?.inputs?.propertyPrice || 0)),
      regime: "SIP vs Property",
      tax: formatINR(round0(model?.sipFutureValue || 0)),
      savings: formatINR(round0(model?.wealthGap || 0)),
      section87A: "This report is an illustrative wealth comparison model.",
      standardDeduction: "N/A",
    },
    blocks: {
      coverLines: [
        `Prepared for: ${name || ""}`.trim(),
        `Property Price: ${formatINR(round0(model?.inputs?.propertyPrice || 0))}`,
        `Monthly SIP: ${formatINR(round0(model?.inputs?.monthlySip || 0))}`,
        `Years: ${y}`,
        `Generated on: ${new Date().toLocaleString("en-IN")}`,
      ],
      summaryPageTitle: "SUMMARY",
      summaryLines: [
        `Property value after ${y} years: ${formatINR(round0(model?.propertyEndValue || 0))}`,
        `Net property wealth (incl. rent − maintenance): ${formatINR(round0(model?.netPropertyWealth || 0))}`,
        `SIP value after ${y} years: ${formatINR(round0(model?.sipFutureValue || 0))}`,
        `Wealth gap (SIP − property): ${formatSignedINR(model?.wealthGap || 0)}`,
      ],
      summaryParagraph:
        "This comparison uses locked assumptions: Property CAGR 4%, SIP CAGR 14.5%, rental yield 2.5%/yr, maintenance drag 2.5%/yr. It ignores loans, taxes, and transaction costs.",
      whyTitle: "WHY THE GAP HAPPENS",
      whyBullets: [
        "SIP compounds at 14.5% CAGR in this model.",
        "Property compounds at 4% CAGR in this model.",
        "Rent and maintenance are modeled as equal rates (2.5% each) on property price.",
        "Results are illustrative and depend on assumptions.",
      ],
      keyInsightLabel: "Key Insight:",
      keyInsightText:
        "When the expected SIP CAGR materially exceeds property CAGR, the compounding difference can dominate the outcome over long horizons.",
      executionTitle: "ACTION CHECKLIST",
      executionPlan: {
        APRIL: ["Decide your target horizon and SIP amount", "Set a monthly SIP date", "Choose a diversified SIP vehicle"],
        JUNE: ["Review asset allocation", "Automate step-up if feasible"],
        SEPTEMBER: ["Re-check assumptions vs reality", "Avoid reacting to short-term volatility"],
        DECEMBER: ["Review annual savings rate", "Confirm long-term goals alignment"],
        MARCH: ["Document learnings", "Reset plan for next year"],
      },
      checklistTitle: "WHAT TO VERIFY",
      caChecklist: [
        "Loan/EMI impact (excluded from this model)",
        "Transaction costs and stamp duty (excluded)",
        "Tax implications (excluded)",
        "Liquidity needs and emergency fund",
        "Risk tolerance and diversification",
      ],
      mistakesTitle: "COMMON MISTAKES",
      commonMistakes: [
        "Comparing gross returns without costs/constraints",
        "Stopping SIPs due to short-term volatility",
        "Underestimating liquidity needs",
        "Ignoring concentration risk",
      ],
      stepsTitle: "NEXT STEPS",
      savingsSteps: ["Build an emergency buffer", "Maintain SIP discipline", "Review annually"],
      stepsNote: "Note:\nThis report is an illustrative model and does not recommend specific products.",
      disclaimerTitle: "DISCLAIMER",
      disclaimerText:
        disclaimerFooter,
    },
  };
}

import { compareRegimesFY2526 } from "@/lib/tax-formulas";
import { buildBmWealthTaxPremiumReportPayload, generateBmWealthPremiumReportPdfBytes } from "./bmWealthPremiumReport";

// LOCKED PDF CONTENT & STRUCTURE (Premium Report). Do not change without explicit instruction.
export function generateTaxBlueprintPdfBytes({ lead, inputs }) {
  const cmp = compareRegimesFY2526(inputs || {});
  const payload = buildBmWealthTaxPremiumReportPayload({ lead, inputs, compare: cmp });
  return generateBmWealthPremiumReportPdfBytes(payload);
}

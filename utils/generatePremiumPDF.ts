import { formatINR } from "@/lib/tax-formulas";
import { buildMumbaiPropertyVsSipPdfPayload, computeMumbaiPropertyVsSip } from "@/lib/property-vs-sip";
import { generatePropertyVsSipPremium18PdfBytes } from "@/lib/pdf/propertyVsSipPremium18";

export type GeneratePremiumPDFInput = {
  userName: string;
  propertyPrice: number;
  monthlySIP: number;
  years: number;
  wealthGap?: number;
  sipValue?: number;
  propValue?: number;
};

function n(v: unknown, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function formatSignedINR(value: number) {
  const v = n(value, 0);
  if (v === 0) return formatINR(0);
  const abs = Math.abs(v);
  const base = formatINR(Math.round(abs));
  return v < 0 ? `−${base}` : base;
}

/**
 * Generates the Premium Property vs SIP PDF (18 pages) as bytes.
 *
 * This is a thin wrapper around the existing 18-page generator:
 * `generatePropertyVsSipPremium18PdfBytes`.
 */
export function generatePremiumPDF(input: GeneratePremiumPDFInput): Uint8Array {
  const userName = String(input?.userName || "").trim();

  const propertyPrice = Math.max(0, n(input?.propertyPrice, 0));
  const monthlySip = Math.max(0, n(input?.monthlySIP, 0));
  const years = Math.max(1, Math.min(30, Math.round(n(input?.years, 15))));

  const model = computeMumbaiPropertyVsSip({ propertyPrice, monthlySip, years });
  const payload = buildMumbaiPropertyVsSipPdfPayload({ lead: { name: userName }, model });

  // Optional override support for API callers (keeps generator deterministic if omitted).
  const overrideSip = Number.isFinite(n(input?.sipValue, NaN)) ? n(input?.sipValue, NaN) : null;
  const overrideProp = Number.isFinite(n(input?.propValue, NaN)) ? n(input?.propValue, NaN) : null;
  const overrideGap = Number.isFinite(n(input?.wealthGap, NaN)) ? n(input?.wealthGap, NaN) : null;

  if (payload?.blocks?.summaryLines && (overrideSip !== null || overrideProp !== null || overrideGap !== null)) {
    const y = model?.inputs?.years || years;
    const finalProp = overrideProp !== null ? overrideProp : model.propertyFutureValue;
    const finalSip = overrideSip !== null ? overrideSip : model.sipFutureValue;
    const finalGap = overrideGap !== null ? overrideGap : finalSip - finalProp;

    payload.blocks.summaryLines = [
      `Property value after ${y} years: ${formatINR(Math.round(finalProp || 0))}`,
      `SIP value after ${y} years: ${formatINR(Math.round(finalSip || 0))}`,
      `Wealth gap (SIP − property): ${formatSignedINR(finalGap || 0)}`,
    ];

    if (payload.variables) {
      payload.variables.tax = formatINR(Math.round(finalSip || 0));
      payload.variables.savings = formatINR(Math.round(finalGap || 0));
    }
  }

  const bytes = generatePropertyVsSipPremium18PdfBytes(payload);
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

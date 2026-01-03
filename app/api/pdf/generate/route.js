import { NextResponse } from "next/server";

import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";
import { generateBmWealthPremiumReportPdfBytes } from "@/lib/pdf/bmWealthPremiumReport";
import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const lead = body?.lead || {};
    const inputs = body?.inputs || {};

    // For reuse across future calculators: allow direct payload-based rendering.
    const pdfPayload = body?.pdfPayload;

    const pdfBytes = pdfPayload ? generateBmWealthPremiumReportPdfBytes(pdfPayload) : generateTaxBlueprintPdfBytes({ lead, inputs });

    await logEventSafe({
      event_type: "pdf_generated",
      data: {
        type: pdfPayload ? "bm_wealth_blueprint_15" : "tax_optimization",
        email: String(lead?.email || "").trim() || null,
      },
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=BM-Wealth-Tax-Optimization-Roadmap-FY2025-26.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "pdf_failed" }, { status: 500 });
  }
}

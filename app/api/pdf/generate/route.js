import { NextResponse } from "next/server";

import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";
import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const lead = body?.lead || {};
    const inputs = body?.inputs || {};

    const pdfBytes = generateTaxBlueprintPdfBytes({ lead, inputs });

    await logEventSafe({
      event_type: "pdf_generated",
      data: {
        type: "tax_optimization",
        email: String(lead?.email || "").trim() || null,
      },
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=BM-Wealth-Tax-Blueprint-FY2025-26.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "pdf_failed" }, { status: 500 });
  }
}

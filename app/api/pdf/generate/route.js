import { NextResponse } from "next/server";

import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";
import { generateBmWealthBlueprint15PdfBytes } from "@/lib/pdf/bmWealthBlueprint15";
import { logEventSafe } from "@/lib/db/events";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const lead = body?.lead || {};
    const inputs = body?.inputs || {};

    // For reuse across future calculators: allow direct payload-based rendering.
    const pdfPayload = body?.pdfPayload;

     // Optional: verify a signed download token for premium PDFs.
    const downloadToken = body?.downloadToken ? String(body.downloadToken) : "";
    const tokenPayload = body?.tokenPayload ? String(body.tokenPayload) : "";
    if (downloadToken || tokenPayload) {
      if (!downloadToken || !tokenPayload) {
        return NextResponse.json({ ok: false, error: "missing_download_token" }, { status: 401 });
      }
      const tokenSecret = String(process.env.PDF_DOWNLOAD_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || "").trim();
      if (!tokenSecret) {
        return NextResponse.json({ ok: false, error: "token_secret_missing" }, { status: 500 });
      }
      const expected = crypto.createHmac("sha256", tokenSecret).update(tokenPayload).digest("hex");
      if (expected !== downloadToken) {
        return NextResponse.json({ ok: false, error: "invalid_download_token" }, { status: 401 });
      }
    }

    const pdfBytes = pdfPayload ? generateBmWealthBlueprint15PdfBytes(pdfPayload) : generateTaxBlueprintPdfBytes({ lead, inputs });

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
        "Content-Disposition": `attachment; filename=${pdfPayload?.meta?.filename || "BM-Wealth-Tax-Optimization-Roadmap-FY2025-26.pdf"}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "pdf_failed" }, { status: 500 });
  }
}

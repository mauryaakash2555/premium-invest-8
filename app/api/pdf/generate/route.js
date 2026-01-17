import { NextResponse } from "next/server";

import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";
import { generateBmWealthBlueprint15PdfBytes } from "@/lib/pdf/bmWealthBlueprint15";
import { generatePropertyVsSipPremium18PdfBytes } from "@/lib/pdf/propertyVsSipPremium18";
import { logEventSafe } from "@/lib/db/events";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { computeMumbaiPropertyVsSip, buildMumbaiPropertyVsSipPdfPayload } from "@/lib/property-vs-sip";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const lead = body?.lead || {};
    const inputs = body?.inputs || {};

    const kind = body?.kind ? String(body.kind).trim() : "";
    const leadId = body?.leadId ? String(body.leadId).trim() : "";

    // For reuse across future calculators: allow direct payload-based rendering.
    const pdfPayload = body?.pdfPayload;

     // Optional: verify a signed download token for premium PDFs.
    const downloadToken = body?.downloadToken ? String(body.downloadToken) : "";
    const tokenPayload = body?.tokenPayload ? String(body.tokenPayload) : "";
    if (downloadToken || tokenPayload) {
      if (!downloadToken || !tokenPayload) {
        return NextResponse.json({ ok: false, error: "missing_download_token" }, { status: 401 });
      }
      const tokenSecret = String(process.env.PDF_DOWNLOAD_TOKEN_SECRET || "").trim();
      if (!tokenSecret) {
        return NextResponse.json({ ok: false, error: "token_secret_missing" }, { status: 500 });
      }
      const expected = crypto.createHmac("sha256", tokenSecret).update(tokenPayload).digest("hex");
      if (expected !== downloadToken) {
        return NextResponse.json({ ok: false, error: "invalid_download_token" }, { status: 401 });
      }
    }

    let resolvedPayload = pdfPayload || null;
    let resolvedLead = lead || {};
    let resolvedType = resolvedPayload ? "bm_wealth_blueprint_15" : "tax_optimization";

    // If client doesn't send the payload (e.g. payment-success redirect), reconstruct from DB using leadId.
    if (!resolvedPayload && kind === "property_vs_sip_paid") {
      if (!downloadToken || !tokenPayload) {
        return NextResponse.json({ ok: false, error: "missing_download_token" }, { status: 401 });
      }
      let tokenObj = null;
      try {
        tokenObj = JSON.parse(tokenPayload);
      } catch {
        return NextResponse.json({ ok: false, error: "invalid_token_payload" }, { status: 401 });
      }
      const tokenLeadId = tokenObj?.leadId ? String(tokenObj.leadId) : "";
      const finalLeadId = leadId || tokenLeadId;
      if (!finalLeadId) {
        return NextResponse.json({ ok: false, error: "missing_lead_id" }, { status: 400 });
      }

      let sb;
      try {
        sb = supabaseAdmin();
      } catch {
        return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
      }

      const { data: leadRow } = await sb.from("leads").select("id,name,email,phone").eq("id", finalLeadId).limit(1);
      if (leadRow?.[0]) resolvedLead = leadRow[0];

      // Prefer the exact payload used for the paid deliverable (avoids requiring the free-email flow).
      const { data: paidEvs } = await sb
        .from("events")
        .select("id,created_at,data")
        .eq("lead_id", finalLeadId)
        .filter("event_type", "in", '("property_vs_sip_paid_email_sent","premium_pdf_paid_email_sent")')
        .order("created_at", { ascending: false })
        .limit(1);

      const paid = paidEvs?.[0];
      const paidPayload = paid?.data?.pdfPayload || null;
      if (paidPayload) {
        resolvedPayload = paidPayload;
        resolvedType = "property_vs_sip_premium_18";
      } else {
        // Fallback: reconstruct from the last free-email inputs, otherwise from request inputs.
        const { data: evs } = await sb
          .from("events")
          .select("id,created_at,data")
          .eq("lead_id", finalLeadId)
          .eq("event_type", "property_vs_sip_email_sent")
          .order("created_at", { ascending: false })
          .limit(1);

        const e = evs?.[0];
        const lastInputs = e?.data?.inputs || null;
        const calcInputs = lastInputs
          ? {
              propertyPrice: Number(lastInputs.propertyPrice) || 0,
              monthlySip: Number(lastInputs.monthlySip) || 0,
              years: Number(lastInputs.years) || 15,
            }
          : {
              propertyPrice: Number(inputs?.propertyPrice) || 0,
              monthlySip: Number(inputs?.monthlySip) || 0,
              years: Number(inputs?.years) || 15,
            };

        const model = computeMumbaiPropertyVsSip(calcInputs);
        resolvedPayload = buildMumbaiPropertyVsSipPdfPayload({ lead: resolvedLead || {}, model });
        resolvedType = "property_vs_sip_premium_18";
      }
    }

    const isPropertyVsSipPayload =
      Boolean(resolvedPayload) &&
      String(resolvedPayload?.meta?.coverTitle || "").toLowerCase().includes("property") &&
      String(resolvedPayload?.meta?.coverTitle || "").toLowerCase().includes("sip");

    const pdfBytes = resolvedPayload
      ? isPropertyVsSipPayload
        ? generatePropertyVsSipPremium18PdfBytes(resolvedPayload)
        : generateBmWealthBlueprint15PdfBytes(resolvedPayload)
      : generateTaxBlueprintPdfBytes({ lead: resolvedLead, inputs });

    await logEventSafe({
      event_type: "pdf_generated",
      data: {
        type: resolvedType,
        email: String(resolvedLead?.email || lead?.email || "").trim() || null,
      },
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${resolvedPayload?.meta?.filename || "BM-Wealth-Tax-Optimization-Roadmap-FY2025-26.pdf"}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "pdf_failed" }, { status: 500 });
  }
}

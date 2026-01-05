import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { computeMumbaiPropertyVsSip, buildMumbaiPropertyVsSipPdfPayload } from "@/lib/property-vs-sip";
import { generateBmWealthBlueprint15PdfBytes } from "@/lib/pdf/bmWealthBlueprint15";
import { generatePropertyVsSipPremium18PdfBytes } from "@/lib/pdf/propertyVsSipPremium18";
import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";

export const runtime = "nodejs";

async function getEventById(sb, id) {
  const { data, error } = await sb
    .from("events")
    .select("id,event_type,created_at,data,lead_id")
    .eq("id", id)
    .limit(1);
  if (error) throw new Error(error.message);
  return data?.[0] || null;
}

async function getLeadById(sb, leadId) {
  if (!leadId) return null;
  const { data } = await sb.from("leads").select("id,name,email,phone").eq("id", leadId).limit(1);
  return data?.[0] || null;
}

async function getLatestPropertyVsSipInputs(sb, leadId) {
  if (!leadId) return null;
  const { data } = await sb
    .from("events")
    .select("id,created_at,data")
    .eq("lead_id", leadId)
    .eq("event_type", "property_vs_sip_email_sent")
    .order("created_at", { ascending: false })
    .limit(1);

  const e = data?.[0];
  const inputs = e?.data?.inputs || null;
  if (!inputs) return null;
  return {
    propertyPrice: Number(inputs.propertyPrice) || 0,
    monthlySip: Number(inputs.monthlySip) || 0,
    years: Number(inputs.years) || 15,
  };
}

function pdfResponse(bytes, filename) {
  const safeName = String(filename || "report.pdf").replace(/[\r\n"]/g, "");
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${safeName}"`,
      "cache-control": "no-store",
    },
  });
}

export async function GET(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const url = new URL(req.url);
  const id = String(url.searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

  const e = await getEventById(sb, id);
  if (!e) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const lead = await getLeadById(sb, e.lead_id);

  if (e.event_type === "premium_pdf_paid_email_sent") {
    const payload = e?.data?.pdfPayload || null;
    if (!payload) return NextResponse.json({ ok: false, error: "missing_payload" }, { status: 409 });
    const bytes = generateBmWealthBlueprint15PdfBytes(payload);
    const filename = String(payload?.meta?.filename || e?.data?.attachmentName || "BM-Wealth-Premium-Report.pdf");
    return pdfResponse(bytes, filename);
  }

  if (e.event_type === "property_vs_sip_paid_email_sent") {
    const payload = e?.data?.pdfPayload || null;
    if (payload) {
      const isPropertyVsSipPayload = String(payload?.meta?.coverTitle || "").toLowerCase().includes("property") &&
        String(payload?.meta?.coverTitle || "").toLowerCase().includes("sip");
      const bytes = isPropertyVsSipPayload ? generatePropertyVsSipPremium18PdfBytes(payload) : generateBmWealthBlueprint15PdfBytes(payload);
      const filename = String(payload?.meta?.filename || e?.data?.attachmentName || "BM-Wealth-Property-vs-SIP-Report.pdf");
      return pdfResponse(bytes, filename);
    }

    const inputs = await getLatestPropertyVsSipInputs(sb, e.lead_id);
    if (!inputs) return NextResponse.json({ ok: false, error: "missing_inputs" }, { status: 409 });

    const model = computeMumbaiPropertyVsSip(inputs);
    const pdfPayload = buildMumbaiPropertyVsSipPdfPayload({ lead: lead || {}, model });
    const bytes = generatePropertyVsSipPremium18PdfBytes(pdfPayload);
    const filename = String(pdfPayload?.meta?.filename || e?.data?.attachmentName || "BM-Wealth-Property-vs-SIP-Report.pdf");
    return pdfResponse(bytes, filename);
  }

  if (e.event_type === "tax_blueprint_paid_email_sent") {
    const inputs = e?.data?.inputs || null;
    if (!inputs) return NextResponse.json({ ok: false, error: "missing_inputs" }, { status: 409 });

    const bytes = generateTaxBlueprintPdfBytes({ lead: lead || {}, inputs });
    const filename = String(e?.data?.attachmentName || "BM-Wealth-Tax-Optimization-Roadmap-FY2025-26.pdf");
    return pdfResponse(bytes, filename);
  }

  return NextResponse.json({ ok: false, error: "pdf_not_available" }, { status: 409 });
}

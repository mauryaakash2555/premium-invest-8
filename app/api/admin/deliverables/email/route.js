import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildPropertyVsSipFreeSummaryEmail, buildPropertyVsSipPaidPdfEmail } from "@/lib/email/propertyVsSipTemplates";
import { computeMumbaiPropertyVsSip, buildMumbaiPropertyVsSipPdfPayload } from "@/lib/property-vs-sip";

export const runtime = "nodejs";

function getBaseUrlSafe() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "https://www.bmwealth.co.in").replace(/\/+$/, "");
}

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

  const subjectFromEvent = String(e?.data?.email_subject || "").trim();
  const htmlFromEvent = String(e?.data?.email_html || "").trim();
  if (subjectFromEvent && htmlFromEvent) {
    return NextResponse.json({ ok: true, subject: subjectFromEvent, html: htmlFromEvent, source: "event" });
  }

  const lead = await getLeadById(sb, e.lead_id);

  // Fallback: reconstruct for known deliverables.
  if (e.event_type === "property_vs_sip_email_sent") {
    const inputs = e?.data?.inputs || {};
    const built = buildPropertyVsSipFreeSummaryEmail({
      lead: { name: lead?.name || "", email: lead?.email || e?.data?.email || "" },
      inputs: {
        propertyPrice: String(inputs?.propertyPrice ?? ""),
        monthlySip: String(inputs?.monthlySip ?? ""),
        years: String(inputs?.years ?? ""),
      },
      siteUrl: getBaseUrlSafe(),
      tracking: null,
    });
    return NextResponse.json({ ok: true, subject: built.subject, html: built.html, source: "rebuild" });
  }

  if (e.event_type === "property_vs_sip_paid_email_sent") {
    const inputs = await getLatestPropertyVsSipInputs(sb, e.lead_id);
    if (!inputs) return NextResponse.json({ ok: false, error: "missing_inputs" }, { status: 409 });

    const model = computeMumbaiPropertyVsSip(inputs);
    const pdfPayload = buildMumbaiPropertyVsSipPdfPayload({ lead: lead || {}, model });
    const attachmentName = String(pdfPayload?.meta?.filename || e?.data?.attachmentName || "BM-Wealth-Premium-Report.pdf");

    const built = buildPropertyVsSipPaidPdfEmail({
      lead: { name: lead?.name || "", email: lead?.email || e?.data?.email || "" },
      pdfPayload,
      attachmentName,
      tracking: null,
    });

    return NextResponse.json({ ok: true, subject: built.subject, html: built.html, source: "rebuild" });
  }

  // If we don't have stored HTML and can't rebuild, return a clear error.
  return NextResponse.json({ ok: false, error: "preview_not_available" }, { status: 409 });
}

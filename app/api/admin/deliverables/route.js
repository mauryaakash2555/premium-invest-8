import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function clampInt(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.round(x)));
}

function toolLabelFromEvent(e) {
  const t = String(e?.event_type || "");
  if (t === "property_vs_sip_email_sent") return "Property vs SIP (Free Email)";
  if (t === "property_vs_sip_paid_email_sent") return "Property vs SIP (Paid PDF)";
  if (t === "tax_blueprint_paid_email_sent") return "Tax Blueprint (Paid PDF)";
  if (t === "premium_pdf_paid_email_sent") {
    const meta = e?.data?.pdfPayload?.meta || e?.data?.pdfPayloadMeta || null;
    const label = String(meta?.adminLabel || meta?.coverTitle || "Premium PDF");
    return label;
  }
  return t || "Deliverable";
}

function hasPdfForEventType(t) {
  return t === "property_vs_sip_paid_email_sent" || t === "tax_blueprint_paid_email_sent" || t === "premium_pdf_paid_email_sent";
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
  const limit = clampInt(url.searchParams.get("limit"), 50, 200);

  const eventTypes = [
    "property_vs_sip_email_sent",
    "property_vs_sip_paid_email_sent",
    "tax_blueprint_paid_email_sent",
    "premium_pdf_paid_email_sent",
  ];

  const { data: events, error } = await sb
    .from("events")
    .select("id,event_type,created_at,data,lead_id")
    .in("event_type", eventTypes)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const rows = events || [];
  const leadIds = Array.from(new Set(rows.map((r) => r?.lead_id).filter(Boolean)));

  let leadsById = new Map();
  if (leadIds.length) {
    const { data: leads, error: lErr } = await sb
      .from("leads")
      .select("id,name,email,phone")
      .in("id", leadIds)
      .limit(1000);
    if (!lErr) {
      leadsById = new Map((leads || []).map((l) => [l.id, l]));
    }
  }

  const items = rows.map((e) => {
    const et = String(e?.event_type || "");
    const lead = e?.lead_id ? leadsById.get(e.lead_id) || null : null;
    return {
      id: e.id,
      created_at: e.created_at,
      event_type: et,
      tool: toolLabelFromEvent(e),
      lead_id: e.lead_id || null,
      lead: lead
        ? {
            id: lead.id,
            name: lead.name || null,
            email: lead.email || null,
            phone: lead.phone || null,
          }
        : null,
      meta: {
        email: e?.data?.email || lead?.email || null,
        phone: e?.data?.phone || lead?.phone || null,
        campaign: e?.data?.campaign || null,
        template: e?.data?.template || null,
        status: e?.data?.status || null,
        attachmentName: e?.data?.attachmentName || null,
        hasEmailHtml: Boolean(e?.data?.email_html),
        hasPdf: hasPdfForEventType(et),
      },
    };
  });

  return NextResponse.json({ ok: true, items });
}

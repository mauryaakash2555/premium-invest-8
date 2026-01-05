import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { buildPropertyVsSipFreeSummaryEmail, buildPropertyVsSipPaidPdfEmail } from "@/lib/email/propertyVsSipTemplates";
import { buildTaxBlueprintPaidPdfEmail } from "@/lib/email/taxBlueprintTemplates";
import { computeMumbaiPropertyVsSip, buildMumbaiPropertyVsSipPdfPayload } from "@/lib/property-vs-sip";

export const runtime = "nodejs";

function getBaseUrlSafe() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "");
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

function sampleLead() {
  return { name: "Akash", email: "akash@example.com" };
}

function samplePropertyVsSipInputs() {
  return { propertyPrice: 15000000, monthlySip: 50000, years: 15 };
}

function sampleTaxInputs() {
  return {
    annualSalary: 1800000,
    deduction80C: 150000,
    deduction80D: 25000,
    hraReceived: 240000,
    rentPaid: 360000,
    basicSalary: 900000,
    homeLoanInterest: 200000,
    nps80ccd1b: 50000,
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
  const kind = String(url.searchParams.get("kind") || "").trim();
  const leadId = String(url.searchParams.get("leadId") || "").trim();

  const leadFromDb = leadId ? await getLeadById(sb, leadId) : null;
  const lead = leadFromDb || sampleLead();

  if (kind === "property_vs_sip_free") {
    const inputs = (await getLatestPropertyVsSipInputs(sb, leadId)) || samplePropertyVsSipInputs();
    const built = buildPropertyVsSipFreeSummaryEmail({
      lead: { name: lead?.name || "", email: lead?.email || "" },
      inputs: {
        propertyPrice: String(inputs.propertyPrice ?? ""),
        monthlySip: String(inputs.monthlySip ?? ""),
        years: String(inputs.years ?? ""),
      },
      siteUrl: getBaseUrlSafe(),
      tracking: null,
    });
    return NextResponse.json({ ok: true, subject: built.subject, html: built.html });
  }

  if (kind === "property_vs_sip_paid") {
    const inputs = (await getLatestPropertyVsSipInputs(sb, leadId)) || samplePropertyVsSipInputs();
    const model = computeMumbaiPropertyVsSip(inputs);
    const pdfPayload = buildMumbaiPropertyVsSipPdfPayload({ lead: lead || {}, model });
    const attachmentName = String(pdfPayload?.meta?.filename || "BM-Wealth-Property-vs-SIP-Report.pdf");
    const built = buildPropertyVsSipPaidPdfEmail({
      lead: { name: lead?.name || "", email: lead?.email || "" },
      pdfPayload,
      attachmentName,
      tracking: null,
    });
    return NextResponse.json({ ok: true, subject: built.subject, html: built.html });
  }

  if (kind === "tax_blueprint_paid") {
    const built = buildTaxBlueprintPaidPdfEmail({ lead, inputs: sampleTaxInputs() });
    return NextResponse.json({ ok: true, subject: built.subject, html: built.html });
  }

  return NextResponse.json({ ok: false, error: "unknown_kind" }, { status: 400 });
}

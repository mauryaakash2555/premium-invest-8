import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { computeMumbaiPropertyVsSip, buildMumbaiPropertyVsSipPdfPayload } from "@/lib/property-vs-sip";
import { generateBmWealthBlueprint15PdfBytes } from "@/lib/pdf/bmWealthBlueprint15";
import { generatePropertyVsSipPremium18PdfBytes } from "@/lib/pdf/propertyVsSipPremium18";
import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";

export const runtime = "nodejs";

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
  return { name: "Dev", email: "dev@example.com" };
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
  const kind = String(url.searchParams.get("kind") || "").trim();
  const leadId = String(url.searchParams.get("leadId") || "").trim();

  const lead = (leadId ? await getLeadById(sb, leadId) : null) || sampleLead();

  if (kind === "property_vs_sip_paid") {
    const inputs = (await getLatestPropertyVsSipInputs(sb, leadId)) || samplePropertyVsSipInputs();
    const model = computeMumbaiPropertyVsSip(inputs);
    const pdfPayload = buildMumbaiPropertyVsSipPdfPayload({ lead: lead || {}, model });
    const bytes = generatePropertyVsSipPremium18PdfBytes(pdfPayload);
    const filename = String(pdfPayload?.meta?.filename || "BM-Wealth-Property-vs-SIP-Report.pdf");
    return pdfResponse(bytes, filename);
  }

  if (kind === "tax_blueprint_paid") {
    const bytes = generateTaxBlueprintPdfBytes({ lead: lead || {}, inputs: sampleTaxInputs() });
    const filename = "BM-Wealth-Tax-Optimization-Roadmap-FY2025-26.pdf";
    return pdfResponse(bytes, filename);
  }

  return NextResponse.json({ ok: false, error: "unknown_kind" }, { status: 400 });
}

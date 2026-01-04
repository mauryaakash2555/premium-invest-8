import { NextResponse } from "next/server";

import { EmailService } from "@/lib/email/emailService";
import { LeadsDB } from "@/lib/db/leads";
import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function normalizePhone(v) {
  const raw = String(v || "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (raw.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return "";
}

function safeStr(v) {
  return String(v ?? "").trim();
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const lead = body?.lead || {};
    const name = safeStr(lead?.name);
    const email = safeStr(lead?.email);
    const phone = normalizePhone(lead?.phone || lead?.whatsapp || lead?.contact);
    const whatsappOptIn = Boolean(lead?.whatsappOptIn);

    const inputs = body?.inputs || {};
    const results = body?.results || {};

    if (!name || name.length < 2 || !isValidEmail(email) || !phone) {
      return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
    }

    const propertyPrice = safeStr(inputs?.propertyPrice);
    const monthlySip = safeStr(inputs?.monthlySip);
    const years = safeStr(inputs?.years);

    const propertyEndValue = safeStr(results?.propertyEndValue);
    const sipFutureValue = safeStr(results?.sipFutureValue);
    const wealthGap = safeStr(results?.wealthGap);
    const gapCr = safeStr(results?.gapCr);

    const subject = gapCr
      ? `BM Wealth — Your Property vs SIP Summary (₹${gapCr}Cr gap)`
      : "BM Wealth — Your Property vs SIP Summary";

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
        <h2>Your Property vs SIP Summary</h2>
        <p>Hi ${name},</p>
        <p>Here’s a snapshot based on your inputs:</p>
        <ul>
          <li><strong>Property price:</strong> ${propertyPrice || "-"}</li>
          <li><strong>Monthly SIP:</strong> ${monthlySip || "-"}</li>
          <li><strong>Timeline:</strong> ${years ? `${years} years` : "-"}</li>
        </ul>
        <p><strong>Results</strong></p>
        <ul>
          <li><strong>Property future value:</strong> ${propertyEndValue || "-"}</li>
          <li><strong>Equity (SIP) future value:</strong> ${sipFutureValue || "-"}</li>
          <li><strong>Wealth gap (SIP − property):</strong> ${wealthGap || "-"}${gapCr ? ` (≈ ₹${gapCr}Cr)` : ""}</li>
        </ul>
        <p>If you want the premium blueprint (PDF + action plan), you can unlock it from the calculator.</p>
        <p style="margin-top:16px">Support: <a href="mailto:support@bmwealth.co.in">support@bmwealth.co.in</a></p>
        <hr/>
        <p style="font-size:12px;color:#555">ARN 90008 | IRDAI 277925. Educational tool only. Not investment advice.</p>
      </div>
    `;

    const { lead: savedLead, error: leadError } = await LeadsDB.create({ name, email, phone });
    if (leadError) {
      return NextResponse.json({ ok: false, error: "lead_save_failed" }, { status: 500 });
    }

    await logEventSafe({
      event_type: "lead_captured",
      data: {
        source: "property_vs_sip",
        email,
        phone,
        whatsappOptIn,
      },
    });

    const emailRes = await EmailService.sendRaw({
      to: email,
      subject,
      html,
    });

    if (!emailRes?.ok) {
      const err = emailRes?.skipped ? "email_not_configured" : "email_send_failed";
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leadId: savedLead?.id || null });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

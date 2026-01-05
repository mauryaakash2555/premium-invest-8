import { NextResponse } from "next/server";

import { EmailService } from "@/lib/email/emailService";
import { LeadsDB } from "@/lib/db/leads";
import { logEventSafe } from "@/lib/db/events";
import { buildPropertyVsSipFreeSummaryEmail } from "@/lib/email/propertyVsSipTemplates";

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

    if (!name || name.length < 2 || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
    }

    const propertyPriceStr = safeStr(inputs?.propertyPrice);
    const monthlySipStr = safeStr(inputs?.monthlySip);
    const yearsStr = safeStr(inputs?.years);

    const propertyPrice = parseINR(propertyPriceStr);
    const monthlySip = parseINR(monthlySipStr);
    const years = Math.max(1, Math.min(30, Math.round(Number(yearsStr || 0) || 0) || 15));

    const model = computeMumbaiPropertyVsSip({ propertyPrice, monthlySip, years });

    const wealthGapNum = Number(model?.wealthGap || 0);
    const wealthGapAbs = Math.max(0, Math.abs(wealthGapNum));
    const gapCrRounded = Math.round((wealthGapAbs / 1e7) * 10) / 10;

    const dailyLeak = years > 0 ? wealthGapAbs / (years * 365) : 0;
    const monthlyLeak = dailyLeak * 30;
    const yearlyLeak = dailyLeak * 360;

    const variant = hashMod3(email);
    const subjectA = `🚨 CRITICAL: Your ${formatCrLakh(wealthGapAbs)} Wealth Leak identified`;
    const subjectB = `${name || "You"}, your ${formatCrLakh(propertyPrice)} property is bleeding money`;
    const subjectC = `This Mumbai property mistake costs ₹${Math.round(monthlyLeak).toLocaleString("en-IN")}/month`;
    const built = buildPropertyVsSipFreeSummaryEmail({ lead: { name, email }, inputs });
    const subject = built.subject;
    const html = built.html;
    if (!emailRes?.ok) {
      const err = emailRes?.skipped ? "email_not_configured" : "email_send_failed";
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true, leadId: savedLead?.id || null });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

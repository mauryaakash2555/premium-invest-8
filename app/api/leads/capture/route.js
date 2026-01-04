import { NextResponse } from "next/server";

import { LeadsDB } from "@/lib/db/leads";
import { EmailService } from "@/lib/email/emailService";
import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function normalizePhone(v) {
  const digits = String(v || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+") && digits.length >= 10) return digits;
  const only = digits.replace(/[^\d]/g, "");
  if (only.length >= 10) return only.slice(-10);
  return "";
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const source = String(body?.source || "tax_optimization").trim() || "tax_optimization";
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const phone = normalizePhone(body?.phone || body?.whatsapp || "");
    const whatsappOptIn = Boolean(body?.whatsappOptIn);

    if (!name || !isValidEmail(email) || !phone) {
      return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
    }

    const { lead, error } = await LeadsDB.create({ name, email, phone });
    if (error) {
      return NextResponse.json({ ok: false, error: "lead_save_failed" }, { status: 500 });
    }

    await logEventSafe({
      event_type: "lead_captured",
      data: {
        source,
        email,
        phone,
        whatsappOptIn,
      },
    });

    // Only send the Tax Optimization welcome email for that specific tool.
    if (source === "tax_optimization") {
      await EmailService.sendRaw({
        to: email,
        subject: "BM Wealth — Your Tax Optimization Intelligence summary is initiated",
        html: `
          <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
            <h2>Welcome to BM Wealth</h2>
            <p>Hi ${name},</p>
            <p>Thanks for using Tax Optimization Intelligence (FY 2025–26). If you opted for premium, you’ll receive your PDF after payment.</p>
            <p style="font-size:12px;color:#555">ARN 90008 | IRDAI 277925. Educational tool only.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, leadId: lead?.id || null });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

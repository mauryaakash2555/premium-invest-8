import { NextResponse } from "next/server";

import { LeadsDB } from "@/lib/db/leads";
import { EmailService } from "@/lib/email/emailService";
import { logEventSafe } from "@/lib/db/events";
import { EmailFollowupsDB } from "@/lib/db/emailFollowups";
import { WhatsAppFollowupsDB } from "@/lib/db/whatsappFollowups";
import { buildTaxOptimizationFollowupEmail } from "@/lib/email/taxOptimizationFollowupTemplates";
import { buildTaxOptimizationWhatsAppSequence } from "@/lib/whatsapp/taxOptimizationFollowupTemplates";

export const runtime = "nodejs";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function normalizePhone(v) {
  const digits = String(v || "").replace(/[^\d+]/g, "");
  const plus = digits.startsWith("+") ? digits : "";
  if (plus) {
    const p = plus.replace(/[^\d+]/g, "");
    const only = p.replace(/[^\d]/g, "");
    if (only.length === 10) return `+91${only}`;
    if (only.length >= 11) return `+${only}`;
  }
  const only = digits.replace(/[^\d]/g, "");
  if (only.length >= 10) return `+91${only.slice(-10)}`;
  return "";
}

function getBaseUrlSafe() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in").replace(/\/+$/, "");
}

async function scheduleTaxEmailFollowups({ leadId, email, name }) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return { ok: false, reason: "missing_email" };

  const base = getBaseUrlSafe();
  const executionUrl = `${base}/execution-partners`;

  const now = Date.now();
  const step1Due = new Date(now + 15 * 60 * 1000).toISOString();
  const step2Due = new Date(now + 48 * 60 * 60 * 1000).toISOString();

  const e1 = buildTaxOptimizationFollowupEmail({ step: 1, leadName: name, executionUrl });
  const e2 = buildTaxOptimizationFollowupEmail({ step: 2, leadName: name, executionUrl });

  const contextBase = {
    tool: "tax_optimization",
    executionUrl,
  };

  const rows = [
    {
      lead_id: leadId || null,
      email: e,
      source: "tax_optimization",
      step: 1,
      due_at: step1Due,
      context: { ...contextBase, subject: e1.subject, html: e1.html },
    },
    {
      lead_id: leadId || null,
      email: e,
      source: "tax_optimization",
      step: 2,
      due_at: step2Due,
      context: { ...contextBase, subject: e2.subject, html: e2.html },
    },
  ];

  const { error } = await EmailFollowupsDB.createMany(rows);
  if (error) return { ok: false, reason: "db_unavailable" };
  return { ok: true };
}

async function scheduleTaxWhatsAppFollowups({ leadId, phone, name, estSavingsInr }) {
  const to = String(phone || "").trim();
  if (!to) return { ok: false, reason: "missing_phone" };

  const base = getBaseUrlSafe();
  const executionLink = `${base}/execution-partners`;

  const now = Date.now();
  const step1Due = new Date(now + 2 * 60 * 60 * 1000).toISOString();
  const step2Due = new Date(now + 48 * 60 * 60 * 1000).toISOString();

  const seq = buildTaxOptimizationWhatsAppSequence({
    leadName: name,
    executionLink,
    estSavingsInr,
    agentName: String(process.env.WHATSAPP_AGENT_NAME || "BM Wealth"),
  });

  const context = {
    tool: "tax_optimization",
    executionLink,
  };

  const rows = [
    { lead_id: leadId || null, phone: to, source: "tax_optimization", step: 1, due_at: step1Due, context: { ...context, body: seq.message1 } },
    { lead_id: leadId || null, phone: to, source: "tax_optimization", step: 2, due_at: step2Due, context: { ...context, body: seq.message2 } },
  ];

  const { error } = await WhatsAppFollowupsDB.createMany(rows);
  if (error) return { ok: false, reason: "db_unavailable" };
  return { ok: true };
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
            <p style="font-size:12px;color:#555">ARN 90008 | IRDAI 277925</p>
          </div>
        `,
      });

      const { ok: emailFollowupsOk, reason: emailReason } = await scheduleTaxEmailFollowups({
        leadId: lead?.id || null,
        email,
        name,
      });
      await logEventSafe({
        leadId: lead?.id || null,
        event_type: "email_followup_scheduled",
        data: { ok: emailFollowupsOk, email, reason: emailReason || null },
      });

      if (whatsappOptIn && phone) {
        const estSavingsInr = Number(body?.meta?.estimatedSavingsInr || 0) || null;
        const { ok: waOk, reason: waReason } = await scheduleTaxWhatsAppFollowups({
          leadId: lead?.id || null,
          phone,
          name,
          estSavingsInr,
        });
        await logEventSafe({
          leadId: lead?.id || null,
          event_type: "whatsapp_followup_scheduled",
          data: { ok: waOk, phone, reason: waReason || null, source: "tax_optimization" },
        });
      }
    }

    return NextResponse.json({ ok: true, leadId: lead?.id || null });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

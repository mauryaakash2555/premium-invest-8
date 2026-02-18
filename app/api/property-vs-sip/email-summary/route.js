import { NextResponse } from "next/server";
import crypto from "crypto";

import { EmailService } from "@/lib/email/emailService";
import { LeadsDB } from "@/lib/db/leads";
import { logEventSafe } from "@/lib/db/events";
import { buildPropertyVsSipFreeSummaryEmail } from "@/lib/email/propertyVsSipTemplates";
import { computeMumbaiPropertyVsSip } from "@/lib/property-vs-sip";
import { WhatsAppFollowupsDB } from "@/lib/db/whatsappFollowups";
import { buildPropertyVsSipWhatsAppSequence } from "@/lib/whatsapp/propertyVsSipFollowupTemplates";

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

function parseINR(v) {
  const raw = String(v ?? "").trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9\-\.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function getBaseUrlSafe() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "https://www.bmwealth.co.in").replace(/\/+$/, "");
}

function buildPaymentLinkSafe() {
  const explicit = String(process.env.PROPERTY_VS_SIP_PAYMENT_LINK || "").trim();
  if (explicit) return explicit;
  return `${getBaseUrlSafe()}/tools/property-vs-sip`;
}

async function scheduleWhatsAppSequence({ leadId, phone, name, inputs, model }) {
  const to = String(phone || "").trim();
  if (!to) return { ok: false, reason: "missing_phone" };

  const now = Date.now();
  const emailSentAtIso = new Date(now).toISOString();
  const step1Due = new Date(now + 2 * 60 * 60 * 1000).toISOString();
  const step2Due = new Date(now + 6 * 60 * 60 * 1000).toISOString();
  const step3Due = new Date(now + 24 * 60 * 60 * 1000).toISOString();

  const seq = buildPropertyVsSipWhatsAppSequence({
    leadName: name,
    propertyPrice: Number(model?.inputs?.propertyPrice || 0),
    monthlySip: Number(model?.inputs?.monthlySip || 0),
    years: Number(model?.inputs?.years || 15),
    wealthGap: Number(model?.wealthGap || 0),
    paymentLink: buildPaymentLinkSafe(),
    agentName: String(process.env.WHATSAPP_AGENT_NAME || "Brahmdeo"),
    agentSignature: String(process.env.WHATSAPP_AGENT_SIGNATURE || "").trim() || undefined,
  });

  const context = {
    tool: "property_vs_sip",
    emailSentAt: emailSentAtIso,
    inputs: {
      propertyPrice: Number(model?.inputs?.propertyPrice || 0),
      monthlySip: Number(model?.inputs?.monthlySip || 0),
      years: Number(model?.inputs?.years || 15),
    },
    computed: {
      wealthGap: Number(model?.wealthGap || 0),
    },
    paymentLink: buildPaymentLinkSafe(),
  };

  const rows = [
    { lead_id: leadId || null, phone: to, source: "property_vs_sip_email", step: 1, due_at: step1Due, context: { ...context, body: seq.message1 } },
    { lead_id: leadId || null, phone: to, source: "property_vs_sip_email", step: 2, due_at: step2Due, context: { ...context, body: seq.message2 } },
    { lead_id: leadId || null, phone: to, source: "property_vs_sip_email", step: 3, due_at: step3Due, context: { ...context, body: seq.message3 } },
  ];

  const { error } = await WhatsAppFollowupsDB.createMany(rows);
  if (error) return { ok: false, reason: "db_unavailable" };
  return { ok: true };
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

    if (!name || name.length < 2 || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
    }

    const propertyPrice = parseINR(inputs?.propertyPrice);
    const monthlySip = parseINR(inputs?.monthlySip);
    const years = Math.max(1, Math.min(30, Math.round(Number(inputs?.years || 0) || 0) || 15));

    const model = computeMumbaiPropertyVsSip({ propertyPrice, monthlySip, years });

    const { lead: savedLead } = await LeadsDB.create({ name, email, phone });

    const messageId = crypto.randomUUID();
    const tracking = {
      leadId: savedLead?.id || null,
      messageId,
      campaign: "property_vs_sip_free",
      template: "property_vs_sip_free_summary",
    };

    const built = buildPropertyVsSipFreeSummaryEmail({
      lead: { name, email },
      inputs: {
        propertyPrice: String(inputs?.propertyPrice ?? ""),
        monthlySip: String(inputs?.monthlySip ?? ""),
        years: String(inputs?.years ?? ""),
      },
      siteUrl: getBaseUrlSafe(),
      tracking,
    });

    const emailRes = await EmailService.sendRaw({
      to: email,
      subject: built.subject,
      html: built.html,
    });

    await logEventSafe({
      leadId: savedLead?.id || null,
      event_type: "property_vs_sip_email_sent",
      data: {
        messageId,
        campaign: tracking.campaign,
        template: tracking.template,
        email,
        phone: phone || null,
        whatsappOptIn,
        email_subject: built.subject,
        email_html: built.html,
        inputs: { propertyPrice, monthlySip, years },
        computed: { wealthGap: Number(model?.wealthGap || 0) },
      },
    });

    if (!emailRes?.ok) {
      const err = emailRes?.skipped ? "email_not_configured" : "email_send_failed";
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    let waScheduled = false;
    if (whatsappOptIn && phone) {
      const r = await scheduleWhatsAppSequence({ leadId: savedLead?.id || null, phone, name, inputs, model });
      waScheduled = Boolean(r?.ok);
      await logEventSafe({
        leadId: savedLead?.id || null,
        event_type: "whatsapp_followup_scheduled",
        data: { ok: waScheduled, phone, reason: r?.reason || null },
      });
    }

    return NextResponse.json({ ok: true, leadId: savedLead?.id || null, waScheduled });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

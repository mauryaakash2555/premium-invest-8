import crypto from "crypto";
import { NextResponse } from "next/server";

import { EmailService } from "@/lib/email/emailService";
import { logEventSafe } from "@/lib/db/events";
import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";
import { generateBmWealthBlueprint15PdfBytes } from "@/lib/pdf/bmWealthBlueprint15";
import { generatePropertyVsSipPremium18PdfBytes } from "@/lib/pdf/propertyVsSipPremium18";
import { buildPropertyVsSipPaidPdfEmail } from "@/lib/email/propertyVsSipTemplates";
import { buildTaxBlueprintPaidPdfEmail } from "@/lib/email/taxBlueprintTemplates";

export const runtime = "nodejs";

function getKeySecret() {
  return String(process.env.RAZORPAY_KEY_SECRET || "").trim();
}

function verifySignature({ orderId, paymentId, signature }) {
  const secret = getKeySecret();
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === String(signature || "");
}

function parseINR(v) {
  const raw = String(v ?? "").trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9\-\.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function pickFromCoverLines(lines, prefix) {
  const arr = Array.isArray(lines) ? lines : [];
  const hit = arr.find((l) => String(l || "").toLowerCase().startsWith(String(prefix).toLowerCase()));
  if (!hit) return "";
  const parts = String(hit).split(":");
  return parts.length >= 2 ? parts.slice(1).join(":").trim() : "";
}

function buildAttachmentNameFromLead(lead) {
  const raw = String(lead?.name || "").trim();
  const safe = raw
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/[\\/]+/g, "_")
    .trim();
  return `${safe || "Customer"}_Report.pdf`;
}

async function buildEmailHtml({ lead, inputs }) {
  const built = buildTaxBlueprintPaidPdfEmail({ lead, inputs });
  return built.html;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const orderId = String(body?.razorpay_order_id || "");
    const paymentId = String(body?.razorpay_payment_id || "");
    const signature = String(body?.razorpay_signature || "");
    const leadId = body?.leadId ? String(body.leadId) : "";
    const lead = body?.lead || {};
    const inputs = body?.inputs || {};
    const pdfPayload = body?.pdfPayload || null;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const sigOk = verifySignature({ orderId, paymentId, signature });
    if (!sigOk) {
      await logEventSafe({
        leadId: leadId || null,
        event_type: "payment_failed",
        data: { provider: "razorpay", reason: "bad_signature", orderId },
      });
      return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
    }

    await logEventSafe({
      leadId: leadId || null,
      event_type: "payment_success",
      data: {
        provider: "razorpay",
        orderId,
        paymentId,
        email: String(lead?.email || "").trim() || null,
      },
    });

    const emailTo = String(lead?.email || "").trim();
    const isPayloadMode = Boolean(pdfPayload);

    let propertyVsSipPaidMessageId = null;
    let propertyVsSipPaidTracking = null;

    let pdfBytes;
    let emailSubject;
    let emailHtml;
    let attachmentName;

    if (isPayloadMode) {
      attachmentName = String(pdfPayload?.meta?.filename || "BM-Wealth-Premium-Report.pdf");
      emailSubject = String(pdfPayload?.meta?.emailSubject || "Your BM Wealth Premium Report is Ready");

      const isPropertyVsSip = String(pdfPayload?.meta?.coverTitle || "").toLowerCase().includes("property") &&
        String(pdfPayload?.meta?.coverTitle || "").toLowerCase().includes("sip");

      if (isPropertyVsSip) {
        attachmentName = buildAttachmentNameFromLead(lead);
        pdfBytes = generatePropertyVsSipPremium18PdfBytes(pdfPayload);
        const messageId = crypto.randomUUID();
        const tracking = {
          leadId: leadId || null,
          messageId,
          campaign: "property_vs_sip_paid",
          template: "property_vs_sip_paid_pdf",
        };

        propertyVsSipPaidMessageId = messageId;
        propertyVsSipPaidTracking = tracking;

        const built = buildPropertyVsSipPaidPdfEmail({ lead, pdfPayload, attachmentName, tracking });
        emailSubject = built.subject;
        emailHtml = built.html;

        await logEventSafe({
          leadId: leadId || null,
          event_type: "revenue",
          data: {
            amount: 399,
            currency: "INR",
            product: "property_vs_sip_pdf",
            provider: "razorpay",
            orderId,
            paymentId,
          },
        });
      } else {
        pdfBytes = generateBmWealthBlueprint15PdfBytes(pdfPayload);
        const emailTitle = String(pdfPayload?.meta?.emailTitle || "Your BM Wealth Premium Report is Ready");
        const emailSubtitle = String(pdfPayload?.meta?.emailSubtitle || "Your PDF is attached.");
        const emailFooter = String(pdfPayload?.meta?.emailFooter || "ARN 90008");

        emailHtml = `
          <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
            <h2>${emailTitle}</h2>
            <p>Hi ${String(lead?.name || "").trim() || "there"},</p>
            <p>${emailSubtitle}</p>
            <hr/>
            <p style="font-size:12px;color:#555">${emailFooter}</p>
          </div>
        `;
      }
    } else {
      pdfBytes = generateTaxBlueprintPdfBytes({ lead, inputs });
      attachmentName = "BM-Wealth-Tax-Optimization-Roadmap-FY2025-26.pdf";
      const built = buildTaxBlueprintPaidPdfEmail({ lead, inputs });
      emailSubject = built.subject;
      emailHtml = built.html;
    }

    let emailStatus = "missing_email";
    let emailError = null;

    if (emailTo) {
      const emailRes = await EmailService.sendWithAttachments({
        to: emailTo,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: attachmentName,
            content: pdfBytes,
            contentType: "application/pdf",
          },
        ],
      });

      if (emailRes?.ok) {
        emailStatus = "sent";
      } else if (emailRes?.skipped) {
        emailStatus = "not_configured";
        emailError = emailRes?.reason || "not_configured_or_missing_fields";
      } else {
        emailStatus = "failed";
        emailError = emailRes?.error ? "send_failed" : "unknown";
      }

      if (propertyVsSipPaidMessageId && propertyVsSipPaidTracking) {
        await logEventSafe({
          leadId: leadId || null,
          event_type: "property_vs_sip_paid_email_sent",
          data: {
            messageId: propertyVsSipPaidMessageId,
            campaign: propertyVsSipPaidTracking.campaign,
            template: propertyVsSipPaidTracking.template,
            email: emailTo || null,
            status: emailStatus,
            error: emailError,
            attachmentName,
            email_subject: emailSubject,
            email_html: emailHtml,
            pdfPayload,
          },
        });
      }

      // Generic deliverables logging so Super Admin can preview what was actually sent.
      if (isPayloadMode && !propertyVsSipPaidMessageId) {
        await logEventSafe({
          leadId: leadId || null,
          event_type: "premium_pdf_paid_email_sent",
          data: {
            email: emailTo || null,
            status: emailStatus,
            error: emailError,
            attachmentName,
            email_subject: emailSubject,
            email_html: emailHtml,
            pdfPayload,
          },
        });
      }

      if (!isPayloadMode) {
        await logEventSafe({
          leadId: leadId || null,
          event_type: "tax_blueprint_paid_email_sent",
          data: {
            email: emailTo || null,
            status: emailStatus,
            error: emailError,
            attachmentName,
            email_subject: emailSubject,
            email_html: emailHtml,
            inputs,
          },
        });
      }
    }

    // WhatsApp notification requested: send an admin email as a reliable placeholder.
    const adminLabel = isPayloadMode
      ? String(pdfPayload?.meta?.adminLabel || "New premium customer")
      : "New premium customer: Tax Optimization Blueprint ₹299";

    await EmailService.sendRaw({
      to: "mauryaakash2555@gmail.com",
      subject: adminLabel,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
          <h2>New premium customer</h2>
          <p><strong>Name:</strong> ${String(lead?.name || "-")}</p>
          <p><strong>Email:</strong> ${String(lead?.email || "-")}</p>
          <p><strong>WhatsApp:</strong> ${String(lead?.phone || "-")}</p>
          <p><strong>Order:</strong> ${orderId}</p>
          <p><strong>Payment:</strong> ${paymentId}</p>
        </div>
      `,
    });

    if (!isPayloadMode) {
      return NextResponse.json({ ok: true, emailStatus, emailError });
    }

    const tokenPayload = JSON.stringify({
      orderId,
      paymentId,
      filename: attachmentName,
      leadId: leadId || null,
      kind: isPayloadMode ? "payload" : "tax_blueprint_paid",
      ts: Date.now(),
    });
    const tokenSecret = String(process.env.PDF_DOWNLOAD_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || "").trim();
    const downloadToken = crypto.createHmac("sha256", tokenSecret).update(tokenPayload).digest("hex");

    return NextResponse.json({ ok: true, downloadToken, tokenPayload, emailStatus, emailError });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

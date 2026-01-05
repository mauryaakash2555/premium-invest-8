import crypto from "crypto";
import { NextResponse } from "next/server";

import { EmailService } from "@/lib/email/emailService";
import { compareRegimesFY2526, formatINR } from "@/lib/tax-formulas";
import { logEventSafe } from "@/lib/db/events";
import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";
import { generateBmWealthBlueprint15PdfBytes } from "@/lib/pdf/bmWealthBlueprint15";
import { buildPropertyVsSipPaidPdfEmail } from "@/lib/email/propertyVsSipTemplates";

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

function safeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

async function buildEmailHtml({ name, inputs }) {
  const cmp = compareRegimesFY2526(inputs || {});
  const best = cmp.winner === "old" ? "Old Regime" : cmp.winner === "new" ? "New Regime" : "Tie";

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111">
      <h2>Your Tax Optimization Blueprint is Ready</h2>
      <p>Hi ${String(name || "").trim() || "there"},</p>
      <p>Payment received for <strong>BM Wealth Tax Optimization Intelligence (FY 2025–26)</strong>.</p>
      <p><strong>Optimal regime:</strong> ${best}<br/>
         <strong>Estimated savings:</strong> ${formatINR(cmp.savings)}</p>
      <p>Your PDF is attached. If you need help, reply to this email.</p>
      <hr/>
      <p style="font-size:12px;color:#555">ARN 90008 | IRDAI 277925. Educational tool only. Not investment advice.</p>
    </div>
  `;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const orderId = String(body?.razorpay_order_id || "");
    const paymentId = String(body?.razorpay_payment_id || "");
    const signature = String(body?.razorpay_signature || "");
    const lead = body?.lead || {};
    const inputs = body?.inputs || {};
    const pdfPayload = body?.pdfPayload || null;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const sigOk = verifySignature({ orderId, paymentId, signature });
    if (!sigOk) {
      await logEventSafe({
        event_type: "payment_failed",
        data: { provider: "razorpay", reason: "bad_signature", orderId },
      });
      return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
    }

    await logEventSafe({
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

    let pdfBytes;
    let emailSubject;
    let emailHtml;
    let attachmentName;

    if (isPayloadMode) {
      pdfBytes = generateBmWealthBlueprint15PdfBytes(pdfPayload);
      attachmentName = String(pdfPayload?.meta?.filename || "BM-Wealth-Premium-Report.pdf");
      emailSubject = String(pdfPayload?.meta?.emailSubject || "Your BM Wealth Premium Report is Ready");

      const isPropertyVsSip = String(pdfPayload?.meta?.coverTitle || "").toLowerCase().includes("property") &&
        String(pdfPayload?.meta?.coverTitle || "").toLowerCase().includes("sip");

      if (isPropertyVsSip) {
        const built = buildPropertyVsSipPaidPdfEmail({ lead, pdfPayload, attachmentName });
        emailSubject = built.subject;
        emailHtml = built.html;
      } else {
        const emailTitle = String(pdfPayload?.meta?.emailTitle || "Your BM Wealth Premium Report is Ready");
        const emailSubtitle = String(pdfPayload?.meta?.emailSubtitle || "Your PDF is attached.");
        const emailFooter = String(pdfPayload?.meta?.emailFooter || "ARN 90008 | Educational use only. Not investment advice.");

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
      emailSubject = "Your Tax Optimization Blueprint is Ready!";
      emailHtml = await buildEmailHtml({ name: lead?.name, inputs });
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
      ts: Date.now(),
    });
    const tokenSecret = String(process.env.PDF_DOWNLOAD_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || "").trim();
    const downloadToken = crypto.createHmac("sha256", tokenSecret).update(tokenPayload).digest("hex");

    return NextResponse.json({ ok: true, downloadToken, tokenPayload, emailStatus, emailError });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

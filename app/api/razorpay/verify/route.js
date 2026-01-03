import crypto from "crypto";
import { NextResponse } from "next/server";

import { EmailService } from "@/lib/email/emailService";
import { compareRegimesFY2526, formatINR } from "@/lib/tax-formulas";
import { logEventSafe } from "@/lib/db/events";
import { generateTaxBlueprintPdfBytes } from "@/lib/pdf/taxBlueprint";

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

    const pdfBytes = generateTaxBlueprintPdfBytes({ lead, inputs });

    const html = await buildEmailHtml({ name: lead?.name, inputs });
    await EmailService.sendWithAttachments({
      to: String(lead?.email || "").trim(),
      subject: "Your Tax Optimization Blueprint is Ready!",
      html,
      attachments: [
        {
          filename: "BM-Wealth-Tax-Blueprint-FY2025-26.pdf",
          content: pdfBytes,
          contentType: "application/pdf",
        },
      ],
    });

    // WhatsApp notification requested: send an admin email as a reliable placeholder.
    await EmailService.sendRaw({
      to: "mauryaakash2555@gmail.com",
      subject: "New premium customer: Tax Optimization Blueprint ₹299",
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

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

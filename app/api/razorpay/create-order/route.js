import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getKeyId() {
  // Allow both server-only and NEXT_PUBLIC naming (some deployments only set the latter).
  return String(process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
}

function getKeySecret() {
  return String(process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "").trim();
}

async function razorpayCreateOrder({ amountPaise, receipt }) {
  const keyId = getKeyId();
  const keySecret = getKeySecret();
  if (!keyId || !keySecret) throw new Error("razorpay_not_configured");

  let r;
  try {
    r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(keyId + ":" + keySecret).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amountPaise),
        currency: "INR",
        receipt: String(receipt || "bm-tax-299"),
        payment_capture: 1,
      }),
    });
  } catch {
    return { ok: false, error: "razorpay_request_failed" };
  }

  const j = await r.json().catch(() => null);
  if (!r.ok) {
    return { ok: false, error: j?.error?.description || "order_create_failed" };
  }
  return { ok: true, order: j };
}

function sanitizeReceiptPrefix(prefix) {
  const raw = String(prefix || "").trim() || "tax";
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 10);
}

function buildReceipt({ receiptPrefix, leadId }) {
  // Razorpay constraint: receipt length must be <= 40.
  // Keep it short and unique enough for basic tracing.
  const prefix = sanitizeReceiptPrefix(receiptPrefix);
  const leadFrag = String(leadId || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
  const ts = Date.now().toString(36); // shorter than millis

  const base = leadFrag ? `${prefix}_${ts}_${leadFrag}` : `${prefix}_${ts}`;
  return base.length <= 40 ? base : base.slice(0, 40);
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const amountPaise = Number(body?.amountPaise || 29900);
    const leadId = body?.leadId ? String(body.leadId) : "";

    const receiptPrefix = body?.receiptPrefix ? String(body.receiptPrefix) : "tax";

    const safeAmount = Number.isFinite(amountPaise) ? amountPaise : 29900;
    const receipt = buildReceipt({ receiptPrefix, leadId });

    const res = await razorpayCreateOrder({ amountPaise: safeAmount, receipt });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      keyId: getKeyId(),
      orderId: res.order?.id,
      amount: res.order?.amount,
      currency: res.order?.currency,
    });
  } catch (e) {
    const message = typeof e?.message === "string" ? e.message : "";
    if (message === "razorpay_not_configured") {
      return NextResponse.json({ ok: false, error: "razorpay_not_configured" }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getKeyId() {
  return String(process.env.RAZORPAY_KEY_ID || "").trim();
}

function getKeySecret() {
  return String(process.env.RAZORPAY_KEY_SECRET || "").trim();
}

async function razorpayCreateOrder({ amountPaise, receipt }) {
  const keyId = getKeyId();
  const keySecret = getKeySecret();
  if (!keyId || !keySecret) throw new Error("razorpay_not_configured");

  const r = await fetch("https://api.razorpay.com/v1/orders", {
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

  const j = await r.json().catch(() => null);
  if (!r.ok) {
    return { ok: false, error: j?.error?.description || "order_create_failed" };
  }
  return { ok: true, order: j };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const amountPaise = Number(body?.amountPaise || 29900);
    const leadId = body?.leadId ? String(body.leadId) : "";

    const safeAmount = Number.isFinite(amountPaise) ? amountPaise : 29900;
    const receipt = leadId ? `tax_${leadId}_${Date.now()}` : `tax_${Date.now()}`;

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
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

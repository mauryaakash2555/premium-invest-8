import crypto from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getNormalizedHost(req) {
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const host = String(rawHost).split(",")[0].trim().toLowerCase();
  const hostNoPort = host.split(":")[0];
  return hostNoPort.startsWith("www.") ? hostNoPort.slice(4) : hostNoPort;
}

function getKeySecret() {
  return String(process.env.RAZORPAY_KEY_SECRET || "").trim();
}

function safeText(v, max = 200) {
  return String(v || "").trim().slice(0, max);
}

export async function POST(req) {
  try {
    // bmwealth.co.in must remain non-commercial. Payments must only happen on store.bmwealth.co.in.
    const normalizedHost = getNormalizedHost(req);
    const isStoreHost = normalizedHost === "store.bmwealth.co.in";
    if (!isStoreHost) {
      return NextResponse.json(
        { error: "payments_disabled_on_main_site", message: "Payments are handled only on https://store.bmwealth.co.in." },
        { status: 404 }
      );
    }

    const secret = getKeySecret();
    if (!secret) {
      return NextResponse.json({ error: "razorpay_not_configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentId = safeText(body?.razorpay_payment_id, 100);
    const orderId = safeText(body?.razorpay_order_id, 100);
    const signature = safeText(body?.razorpay_signature, 200);

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

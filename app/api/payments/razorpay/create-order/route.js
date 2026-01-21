import crypto from "crypto";
import { NextResponse } from "next/server";
import products from "@/data/store-products.json";

export const runtime = "nodejs";

function getNormalizedHost(req) {
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const host = String(rawHost).split(",")[0].trim().toLowerCase();
  const hostNoPort = host.split(":")[0];
  return hostNoPort.startsWith("www.") ? hostNoPort.slice(4) : hostNoPort;
}

function getKeyId() {
  return String(process.env.RAZORPAY_KEY_ID || "").trim();
}

function getKeySecret() {
  return String(process.env.RAZORPAY_KEY_SECRET || "").trim();
}

function safeSlug(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (!/^[a-z0-9-]{3,80}$/.test(s)) return null;
  return s;
}

function toPaise(priceInr) {
  const n = Number(priceInr);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function makeReceipt(slug) {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(6).toString("hex");
  return `bmw_${slug}_${ts}_${rand}`.slice(0, 40);
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

    const keyId = getKeyId();
    const keySecret = getKeySecret();
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "razorpay_not_configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const slug = safeSlug(body?.productSlug);
    if (!slug) {
      return NextResponse.json({ error: "invalid_product" }, { status: 400 });
    }

    const product = products.find((p) => p.slug === slug);
    if (!product) {
      return NextResponse.json({ error: "product_not_found" }, { status: 404 });
    }

    const amountPaise = toPaise(product.priceInr);
    if (!amountPaise) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const receipt = makeReceipt(slug);

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
        payment_capture: 1,
        notes: {
          productSlug: slug,
          productName: String(product.name || "").slice(0, 120),
        },
      }),
    });

    const rpJson = await rpRes.json().catch(() => null);
    if (!rpRes.ok) {
      return NextResponse.json(
        { error: "razorpay_order_create_failed", details: rpJson?.error || rpJson || null },
        { status: rpRes.status || 502 }
      );
    }

    return NextResponse.json({
      keyId,
      orderId: rpJson?.id,
      amount: amountPaise,
      currency: "INR",
      product: {
        slug: product.slug,
        name: product.name,
        priceInr: product.priceInr,
      },
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

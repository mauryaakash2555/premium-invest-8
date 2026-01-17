import crypto from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getCashfreeEnv() {
  return String(process.env.CASHFREE_ENV || "").trim().toUpperCase();
}

function getCashfreeBaseUrl() {
  // Cashfree PG Orders API
  // PROD: https://api.cashfree.com/pg/orders
  // TEST: https://sandbox.cashfree.com/pg/orders
  return getCashfreeEnv() === "PROD" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
}

function getCashfreeCheckoutBaseUrl() {
  // Cashfree hosted checkout base
  // PROD: https://payments.cashfree.com
  // TEST: https://payments-test.cashfree.com
  return getCashfreeEnv() === "PROD" ? "https://payments.cashfree.com" : "https://payments-test.cashfree.com";
}

function getAppId() {
  return String(process.env.CASHFREE_APP_ID || "").trim();
}

function getSecretKey() {
  const raw = String(process.env.CASHFREE_SECRET_KEY || "").trim();
  // Some env setups paste labels like "Secret Key <key>".
  return raw.replace(/^secret\s+key\s*/i, "").trim();
}

function digitsOnly(v) {
  return String(v || "").replace(/\D+/g, "");
}

function safeAmountINR(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  // Cashfree allows up to 2 decimals
  const rounded = Math.round(n * 100) / 100;
  if (rounded < 1) return null;
  return rounded;
}

function makeOrderId() {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(6).toString("hex");
  // Allowed: alphanumeric, '_' and '-'; length 3-45.
  const raw = `bmw_${ts}_${rand}`;
  return raw.slice(0, 45);
}

export async function POST(req) {
  try {
    const appId = getAppId();
    const secretKey = getSecretKey();
    const env = getCashfreeEnv();
    
    if (!appId || !secretKey) {
      console.error("[Cashfree] Missing credentials. CASHFREE_APP_ID or CASHFREE_SECRET_KEY not set.");
      return NextResponse.json({ error: "cashfree_not_configured" }, { status: 500 });
    }
    
    // Log environment for debugging (no secrets)
    console.log(`[Cashfree] Environment: ${env || "TEST (default)"}, AppID prefix: ${appId.slice(0, 8)}...`);
    
    // Warn if credentials don't match environment pattern
    const looksLikeTestKey = appId.toLowerCase().includes("test") || appId.startsWith("TEST");
    const looksLikeProdEnv = env === "PROD";
    if (looksLikeTestKey && looksLikeProdEnv) {
      console.warn("[Cashfree] WARNING: CASHFREE_ENV=PROD but APP_ID looks like a test key. This will cause 404 errors!");
    }

    const body = await req.json().catch(() => ({}));
    const amount = safeAmountINR(body?.amount);
    const productName = String(body?.productName || "BM Wealth Purchase").trim() || "BM Wealth Purchase";

    if (amount == null) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const orderId = makeOrderId();

    // Cashfree requires customer_details. If you don't have details yet, you can pass dummy values.
    const customerEmail = String(body?.customerEmail || "support@bmwealth.co.in").trim() || "support@bmwealth.co.in";
    const customerPhone = digitsOnly(body?.customerPhone) || "9999999999";
    const customerName = String(body?.customerName || "Customer").trim() || "Customer";

    const requestId = crypto.randomUUID();
    const idempotencyKey = crypto.randomUUID();

    const baseUrl = getCashfreeBaseUrl();
    const url = `${baseUrl}/pg/orders`;

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      order_note: productName.slice(0, 200),
      customer_details: {
        customer_id: orderId,
        customer_name: customerName.slice(0, 60),
        customer_email: customerEmail.slice(0, 80),
        customer_phone: customerPhone.slice(0, 15),
      },
      order_meta: {
        return_url: "https://bmwealth.co.in/payment-success",
      },
    };

    const cfRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "x-request-id": requestId,
        "x-idempotency-key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const cfJson = await cfRes.json().catch(() => null);
    
    // Log Cashfree response for debugging
    console.log(`[Cashfree] Order API response: status=${cfRes.status}, has_session=${!!cfJson?.payment_session_id}`);
    
    if (!cfRes.ok) {
      console.error(`[Cashfree] Order creation failed:`, cfJson);
      return NextResponse.json(
        {
          error: cfJson?.message || cfJson?.error || "cashfree_order_create_failed",
        },
        { status: cfRes.status || 502 }
      );
    }

    const paymentSessionId = cfJson?.payment_session_id;
    const returnedOrderId = cfJson?.order_id || orderId;

    if (!paymentSessionId) {
      return NextResponse.json({ error: "missing_payment_session_id" }, { status: 502 });
    }

    const checkoutUrl = `${getCashfreeCheckoutBaseUrl()}/checkout?payment_session_id=${encodeURIComponent(paymentSessionId)}`;
    return NextResponse.json({ payment_session_id: paymentSessionId, order_id: returnedOrderId, checkout_url: checkoutUrl });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

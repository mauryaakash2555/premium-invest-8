import { NextResponse } from "next/server";

import { WhatsAppFollowupsDB } from "@/lib/db/whatsappFollowups";
import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

export async function GET(req) {
  // Meta webhook verification
  // https://developers.facebook.com/docs/graph-api/webhooks/getting-started
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = String(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "").trim();
  if (!expected) {
    return new NextResponse("missing_verify_token", { status: 501 });
  }

  if (mode === "subscribe" && token && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("forbidden", { status: 403 });
}

function normalizePhone(v) {
  const raw = String(v || "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";

  // Twilio: whatsapp:+91XXXXXXXXXX
  if (raw.toLowerCase().startsWith("whatsapp:")) {
    const rest = raw.slice("whatsapp:".length);
    return normalizePhone(rest);
  }

  if (raw.startsWith("+") && digits.length >= 10) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

async function parseBody(req) {
  const ct = String(req.headers.get("content-type") || "").toLowerCase();

  if (ct.includes("application/json")) {
    const json = await req.json().catch(() => null);
    return { kind: "json", json };
  }

  // Twilio uses x-www-form-urlencoded
  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const obj = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return { kind: "form", form: obj };
  }

  const text = await req.text();
  return { kind: "raw", raw: text };
}

export async function POST(req) {
  // NOTE: Provider signature verification should be added when you wire real WA provider.
  // We keep this endpoint minimal and safe: it only stops followups for the inbound sender.

  const parsed = await parseBody(req);

  // Twilio inbound
  const fromTwilio = parsed?.form?.From;
  const bodyTwilio = parsed?.form?.Body;

  // Meta Cloud inbound
  let fromMeta = "";
  let bodyMeta = "";
  try {
    const entry = parsed?.json?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];
    fromMeta = msg?.from ? `+${String(msg.from).replace(/^\+/, "")}` : "";
    bodyMeta = msg?.text?.body || "";
  } catch {
    // ignore
  }

  const from = normalizePhone(fromTwilio || fromMeta);
  if (!from) {
    return NextResponse.json({ ok: false, error: "missing_from" }, { status: 400 });
  }

  const stopRes = await WhatsAppFollowupsDB.stopPhone({ phone: from });

  await logEventSafe({
    event_type: "whatsapp_reply_received",
    data: {
      phone: from,
      provider: fromTwilio ? "twilio" : fromMeta ? "meta" : "unknown",
      body: String(bodyTwilio || bodyMeta || "").slice(0, 500),
      stopOk: Boolean(stopRes?.ok),
    },
  });

  return NextResponse.json({ ok: true });
}

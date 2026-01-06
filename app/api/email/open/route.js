import { NextResponse } from "next/server";
import crypto from "crypto";

import { logEventSafe } from "@/lib/db/events";
import { getAnalyticsSaltSafe } from "@/lib/auth/secrets";

export const runtime = "nodejs";

// 1x1 transparent GIF
const GIF_1X1_BASE64 = "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

function ipHashFromRequest(req) {
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = String(xff).split(",")[0]?.trim() || "";
  const salt = getAnalyticsSaltSafe() || "bmwealth";
  return ip ? crypto.createHmac("sha256", salt).update(ip).digest("hex") : null;
}

export async function GET(req) {
  const url = new URL(req.url);
  const leadId = url.searchParams.get("lid");
  const messageId = url.searchParams.get("mid");
  const campaign = url.searchParams.get("c") || null;
  const template = url.searchParams.get("t") || null;

  const ipHash = ipHashFromRequest(req);

  await logEventSafe({
    leadId: leadId || null,
    event_type: "email_open",
    data: {
      campaign,
      template,
      messageId,
      ipHash,
      ua: String(req.headers.get("user-agent") || "").slice(0, 120) || null,
    },
  });

  const bytes = Buffer.from(GIF_1X1_BASE64, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

import { NextResponse } from "next/server";
import crypto from "crypto";

import { logEventSafe } from "@/lib/db/events";
import { getAnalyticsSaltSafe } from "@/lib/auth/secrets";

export const runtime = "nodejs";

function ipHashFromRequest(req) {
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = String(xff).split(",")[0]?.trim() || "";
  const salt = getAnalyticsSaltSafe() || "bmwealth";
  return ip ? crypto.createHmac("sha256", salt).update(ip).digest("hex") : null;
}

function getAllowedHosts(req) {
  const hosts = new Set();

  try {
    const site = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
    if (site) hosts.add(new URL(site).host);
  } catch {
    // ignore
  }

  const reqHost = String(req.headers.get("host") || "").trim();
  if (reqHost) hosts.add(reqHost);

  // Common variants
  for (const h of Array.from(hosts)) {
    if (h.startsWith("www.")) hosts.add(h.slice(4));
    else hosts.add(`www.${h}`);
  }

  return hosts;
}

function parseTargetUrl({ req, encodedTarget }) {
  const raw = String(encodedTarget || "").trim();
  if (!raw) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  // Support relative URLs.
  if (decoded.startsWith("/")) {
    const origin = `https://${String(req.headers.get("host") || "").trim()}`;
    try {
      return new URL(decoded, origin);
    } catch {
      return null;
    }
  }

  try {
    return new URL(decoded);
  } catch {
    return null;
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  const encodedTarget = url.searchParams.get("u");
  const leadId = url.searchParams.get("lid");
  const messageId = url.searchParams.get("mid");
  const campaign = url.searchParams.get("c") || null;
  const template = url.searchParams.get("t") || null;
  const label = url.searchParams.get("l") || null;

  const target = parseTargetUrl({ req, encodedTarget });
  if (!target) return NextResponse.redirect(new URL("/", url.origin), 302);

  const allowed = getAllowedHosts(req);
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }
  if (!allowed.has(target.host)) {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }

  const ipHash = ipHashFromRequest(req);
  await logEventSafe({
    leadId: leadId || null,
    event_type: "email_click",
    data: {
      campaign,
      template,
      messageId,
      label,
      target: target.pathname + (target.search || ""),
      ipHash,
      ua: String(req.headers.get("user-agent") || "").slice(0, 120) || null,
    },
  });

  return NextResponse.redirect(target, 302);
}

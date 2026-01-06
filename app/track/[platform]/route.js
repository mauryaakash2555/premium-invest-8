/**
 * Affiliate Click Tracker & Redirector
 * Logs click then redirects to the actual affiliate URL.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function redirect307(request, location) {
  const res = NextResponse.redirect(location, 307);
  // Avoid caching redirects (affiliate URLs can change).
  res.headers.set("Cache-Control", "no-store");
  // Defensive: some clients look for Location header explicitly.
  res.headers.set("Location", String(location));
  return res;
}

function safeSlug(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function GET(request, { params }) {
  const platformSlug = safeSlug(params?.platform);
  const leadId = request?.nextUrl?.searchParams?.get("lead") || null;

  if (!platformSlug) {
    return redirect307(request, new URL("/", request.url));
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    // If DB isn't configured, just go home.
    return redirect307(request, new URL("/", request.url));
  }

  try {
    // Match against stored platform names case-insensitively.
    const { data: affiliate, error } = await sb
      .from("affiliate_links")
      .select("*")
      .ilike("platform", platformSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !affiliate?.affiliate_url) {
      return redirect307(request, new URL("/", request.url));
    }

    // Log the click (best-effort)
    try {
      await sb.from("affiliate_clicks").insert({
        affiliate_id: affiliate.id,
        lead_id: leadId || null,
        platform: affiliate.platform,
        clicked_at: new Date().toISOString(),
      });
    } catch {
      // ignore logging failures
    }

    return redirect307(request, affiliate.affiliate_url);
  } catch (e) {
    console.error("Affiliate tracking error:", e);
    return redirect307(request, new URL("/", request.url));
  }
}

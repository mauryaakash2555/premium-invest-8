/**
 * FILE: app/api/track/route.js
 * PURPOSE: Affiliate tracking endpoint (placeholder).
 * CATEGORY: api
 *
 * SIMPLE EXPLANATION:
 * When someone clicks a tracked link, we can log it here.
 * Right now it stores a simple event in Supabase (best effort).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getAnalyticsSaltSafe } from "@/lib/auth/secrets";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  platform: z.string().min(1).max(80),
  campaign: z.string().max(120).optional(),
  leadId: z.string().uuid().optional(),
});

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  // Privacy-safe IP hash
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = String(xff).split(",")[0]?.trim() || "";
  const salt = getAnalyticsSaltSafe() || "bmwealth";
  const ipHash = ip ? crypto.createHmac("sha256", salt).update(ip).digest("hex") : null;

  try {
    const sb = supabaseAdmin();
    const { platform, campaign, leadId } = parsed.data;

    await sb.from("events").insert({
      lead_id: leadId ?? null,
      event_type: "affiliate_click",
      data: { platform, campaign: campaign || null, ipHash },
    });
  } catch {
    // ignore if DB not configured
  }

  return NextResponse.json({ ok: true });
}

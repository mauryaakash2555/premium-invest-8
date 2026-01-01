/**
 * Client-side affiliate click ping (best-effort).
 * Real attribution + redirect is handled by `/track/[platform]`.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  platform: z.string().min(1).max(80),
  leadId: z.string().uuid().optional(),
});

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  // We intentionally do NOT insert into affiliate_clicks here to avoid double-counting
  // (the redirect route /track/[platform] logs the canonical click).
  // Instead, log a lightweight event for debugging/telemetry.
  try {
    const sb = supabaseAdmin();
    await sb.from("events").insert({
      lead_id: parsed.data.leadId ?? null,
      event_type: "affiliate_click_ui",
      data: { platform: parsed.data.platform },
    });
  } catch {
    // ignore if DB not configured
  }

  return NextResponse.json({ ok: true });
}

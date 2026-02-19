/**
 * POST /api/onboarding/click
 * Tracks monetisation clicks (whatsapp / advisor_call / sip_start / book_consultation).
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { step_number, click_type, session_id, meta } = body || {};

    if (!click_type) {
      return NextResponse.json(
        { error: "click_type is required" },
        { status: 400 }
      );
    }

    let db;
    try { db = supabaseAdmin(); } catch {
      return NextResponse.json({ ok: true, offline: true });
    }

    const { error } = await db.from("onboarding_clicks").insert({
      step_number: step_number ? Number(step_number) : null,
      click_type,
      session_id: session_id || null,
      meta: meta || null,
    });

    if (error) {
      console.error("[onboarding/click] insert error:", error.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding/click] error:", err.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

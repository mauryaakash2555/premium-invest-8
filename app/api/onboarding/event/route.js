/**
 * POST /api/onboarding/event
 * Logs an onboarding step action (complete / skip / assist) to Supabase.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

export const runtime = "nodejs";

const VALID_ACTIONS = new Set(["complete", "skip", "assist"]);

export async function POST(req) {
  try {
    const body = await req.json();
    const { step_number, action_type, skip_reason, session_id, meta } = body || {};

    if (!step_number || !VALID_ACTIONS.has(action_type)) {
      return NextResponse.json(
        { error: "step_number (int) and action_type (complete|skip|assist) required" },
        { status: 400 }
      );
    }

    let db;
    try { db = supabaseAdmin(); } catch {
      /* Supabase not configured — graceful degradation */
      return NextResponse.json({ ok: true, offline: true });
    }

    const { error } = await db.from("onboarding_events").insert({
      step_number: Number(step_number),
      action_type,
      skip_reason: skip_reason || null,
      session_id: session_id || null,
      meta: meta || null,
    });

    if (error) {
      console.error("[onboarding/event] insert error:", error.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding/event] error:", err.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

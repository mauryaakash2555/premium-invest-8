/**
 * GET /api/onboarding/progress
 * Returns the current user/session's completed and skipped step numbers.
 *
 * Query params (optional):
 *   ?session_id=xxx — filter by session (used when no auth)
 *
 * Response: { completed: [1,3], skipped: [2] }
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    let db;
    try { db = supabaseAdmin(); } catch {
      return NextResponse.json({ completed: [], skipped: [] });
    }

    let query = db
      .from("onboarding_events")
      .select("step_number, action_type")
      .order("created_at", { ascending: false });

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query.limit(200);

    if (error) {
      console.error("[onboarding/progress] query error:", error.message);
      return NextResponse.json({ completed: [], skipped: [] });
    }

    /* Newest event per step wins */
    const stepMap = {};
    for (const row of data || []) {
      if (!stepMap[row.step_number]) {
        stepMap[row.step_number] = row.action_type;
      }
    }

    const completed = [];
    const skipped = [];
    for (const [step, action] of Object.entries(stepMap)) {
      if (action === "complete") completed.push(Number(step));
      if (action === "skip") skipped.push(Number(step));
    }

    return NextResponse.json({ completed, skipped });
  } catch (err) {
    console.error("[onboarding/progress] error:", err.message);
    return NextResponse.json({ completed: [], skipped: [] });
  }
}

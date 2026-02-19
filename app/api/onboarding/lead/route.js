/**
 * POST /api/onboarding/lead
 * Captures a lead from the public onboarding page (name, phone, email, step_stuck).
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, email, step_stuck, source } = body || {};

    if (!email && !phone) {
      return NextResponse.json(
        { error: "At least one of email or phone is required" },
        { status: 400 }
      );
    }

    let db;
    try { db = supabaseAdmin(); } catch {
      return NextResponse.json({ ok: true, offline: true });
    }

    const { error } = await db.from("onboarding_leads").insert({
      name: name || null,
      phone: phone || null,
      email: email || null,
      step_stuck: step_stuck ? Number(step_stuck) : null,
      source: source || "onboarding_public",
    });

    if (error) {
      console.error("[onboarding/lead] insert error:", error.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding/lead] error:", err.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

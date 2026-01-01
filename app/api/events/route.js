/**
 * FILE: app\api\events\route.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server
 * - zod
 * - crypto
 * - @/config/env
 * - @/lib/db/events
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

﻿import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getAdminEnvSafe } from "@/config/env";
import { insertEvent } from "@/lib/db/events";

const schema = z.object({
  leadId: z.string().uuid().optional(),
  event_type: z.string().min(1).max(120),
  data: z.any().optional(),
});

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const { leadId, event_type, data } = parsed.data;

  // Privacy-safe analytics: hash IP server-side (never store raw IP).
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = String(xff).split(",")[0]?.trim() || "";
  const salt = getAdminEnvSafe()?.ADMIN_PASSWORD || "bmwealth";
  const ipHash = ip ? crypto.createHmac("sha256", salt).update(ip).digest("hex") : null;

  const nextData =
    event_type === "visitor" ||
    event_type === "conversation_started" ||
    event_type === "message_sent" ||
    event_type === "lead_captured"
      ? { ...(data || {}), ipHash }
      : data ?? null;

  try {
    await insertEvent({ leadId, event_type, data: nextData });
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("Supabase env not configured")) {
      return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}




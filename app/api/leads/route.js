/**
 * FILE: app/api/leads/route.js
 * PURPOSE: Create or update a lead (by email) in Supabase.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server (NextResponse)
 * - lib/db/leads (upsertLead)
 *
 * USED BY:
 * - components/user/AIChatFloat.jsx (lead capture)
 *
 * SIMPLE EXPLANATION:
 * When a user shares name/email/phone, we save it as a "lead".
 * We use email as the unique key so the same person updates their record.
 */

import { NextResponse } from "next/server";
import { upsertLead } from "@/lib/db/leads";

function isMissingLeadsTable(msg) {
  const m = String(msg || "");
  return m.includes("Could not find the table") && m.includes("public.leads");
}

export async function POST(req) {
  // 🔵 Parse input
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const phone = String(body?.phone || "").trim();

  // 🔵 Validate
  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  // 🔵 Save lead
  try {
    const lead = await upsertLead({ name, email, phone });
    return NextResponse.json({ ok: true, lead });
  } catch (e) {
    const msg = String(e?.message || "");

    // ⚠️ Common setup issue: Supabase reachable but schema not applied.
    if (isMissingLeadsTable(msg)) {
      return NextResponse.json(
        {
          ok: false,
          error: "setup_required",
          detail: "leads_table_missing",
          hint: "Run supabase/schema.sql in your Supabase SQL editor (creates public.leads, public.conversations, public.events).",
        },
        { status: 503 }
      );
    }

    if (msg.includes("Supabase env not configured")) {
      return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
    }

    return NextResponse.json({ ok: false, error: msg || "unknown" }, { status: 500 });
  }
}

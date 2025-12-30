import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isMissingLeadsTable(msg) {
  const m = String(msg || '');
  return m.includes('Could not find the table') && m.includes('public.leads');
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const email = normalizeEmail(body?.email);
  const phone = String(body?.phone || "").trim();

  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json(
      { ok: false, error: "setup_required" },
      { status: 503 }
    );
  }

  // Upsert by email
  const { data, error } = await sb
    .from("leads")
    .upsert({ name: name || null, email, phone: phone || null }, { onConflict: "email" })
    .select("id,name,email,phone,created_at")
    .single();
  if (error) {
    // Common setup issue: Supabase project is reachable but schema hasn't been applied.
    if (isMissingLeadsTable(error.message)) {
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

    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: data });
}



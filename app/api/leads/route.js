import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
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
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: data });
}



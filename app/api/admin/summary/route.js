import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const cookieStore = await cookies();
  if (!isAdminFromCookies(cookieStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [leadsRes, convRes] = await Promise.all([
    sb
      .from("leads")
      .select("id,name,email,phone,created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: false })
      .limit(100),
    sb
      .from("conversations")
      .select("id,lead_id,message,sender,created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (leadsRes.error || convRes.error) {
    return NextResponse.json(
      { ok: false, error: leadsRes.error?.message || convRes.error?.message || "Supabase error" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    today: {
      leads: leadsRes.data || [],
      conversations: convRes.data || [],
    },
  });
}



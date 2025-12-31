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

  const [leadsRes, convRes, errRes, revRes] = await Promise.all([
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
  
    sb
      .from("events")
      .select("id,event_type,created_at")
      .gte("created_at", start.toISOString())
      .eq("event_type", "chat_error")
      .limit(1000),

    // Manual revenue tracking (admin-only UI)
    sb
      .from("events")
      .select("id,lead_id,event_type,data,created_at")
      .gte("created_at", start.toISOString())
      .eq("event_type", "revenue_manual")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (leadsRes.error || convRes.error || errRes.error || revRes.error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          leadsRes.error?.message ||
          convRes.error?.message ||
          errRes.error?.message ||
          revRes.error?.message ||
          "Supabase error",
      },
      { status: 500 }
    );
  }

  const revenueEntries = revRes.data || [];
  const revenue_total = revenueEntries.reduce((sum, e) => {
    const n = Number(e?.data?.amount);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);

  return NextResponse.json({
    ok: true,
    today: {
      leads: leadsRes.data || [],
      conversations: convRes.data || [],
      chat_errors_count: (errRes.data || []).length,
      revenue_total,
      revenue_entries: revenueEntries,
    },
  });
}




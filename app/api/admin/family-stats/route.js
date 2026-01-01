import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { isFamilyFromCookies } from "@/lib/familySession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CONSTANTS } from "@/config/constants";

function sumRevenue(events = []) {
  return (events || []).reduce((sum, e) => {
    const n = Number(e?.data?.amount);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);
}

function tierFromScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "COLD";
  if (n >= (CONSTANTS?.LEAD_SCORING?.HOT_THRESHOLD ?? 80)) return "HOT";
  if (n >= (CONSTANTS?.LEAD_SCORING?.WARM_THRESHOLD ?? 40)) return "WARM";
  return "COLD";
}

function mondayStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  x.setDate(x.getDate() + diff);
  return x;
}

export async function GET(req) {
  const cookieStore = await cookies();
  const authed = isAdminFromCookies(cookieStore) || isFamilyFromCookies(cookieStore);
  if (!authed) return NextResponse.json({ ok: false }, { status: 401 });

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = mondayStart(now);
  const monthStart = new Date(now);
  monthStart.setHours(0, 0, 0, 0);
  monthStart.setDate(1);

  const [todayLeadsCount, weekLeadsRes, monthLeadsCount, todayConversationsCount, revTodayRes, revWeekRes, revMonthRes] =
    await Promise.all([
      sb.from("leads").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
      sb.from("leads").select("id,created_at").gte("created_at", weekStart.toISOString()).order("created_at", { ascending: false }).limit(5000),
      sb.from("leads").select("id", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
      sb.from("conversations").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
      sb.from("events").select("id,data,created_at").gte("created_at", todayStart.toISOString()).in("event_type", ["revenue", "revenue_manual"]).limit(5000),
      sb.from("events").select("id,data,created_at").gte("created_at", weekStart.toISOString()).in("event_type", ["revenue", "revenue_manual"]).limit(5000),
      sb.from("events").select("id,data,created_at").gte("created_at", monthStart.toISOString()).in("event_type", ["revenue", "revenue_manual"]).limit(5000),
    ]);

  if (
    todayLeadsCount.error ||
    weekLeadsRes.error ||
    monthLeadsCount.error ||
    todayConversationsCount.error ||
    revTodayRes.error ||
    revWeekRes.error ||
    revMonthRes.error
  ) {
    return NextResponse.json({ ok: false, error: "supabase_error" }, { status: 500 });
  }

  const weekLeadIds = (weekLeadsRes.data || []).map((l) => l.id).filter(Boolean);
  const latestScore = Object.create(null);
  const chunkSize = 200;
  for (let i = 0; i < weekLeadIds.length; i += chunkSize) {
    const chunk = weekLeadIds.slice(i, i + chunkSize);
    const { data, error } = await sb
      .from("events")
      .select("lead_id,data,created_at")
      .eq("event_type", "lead_score")
      .in("lead_id", chunk)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) continue;
    for (const e of data || []) {
      const lid = e?.lead_id;
      if (!lid || latestScore[lid] != null) continue;
      const s = Number(e?.data?.score);
      latestScore[lid] = Number.isFinite(s) ? s : 0;
    }
  }

  const breakdown = { hot: 0, warm: 0, cold: 0 };
  for (const lid of weekLeadIds) {
    const score = latestScore[lid] ?? 0;
    const tier = tierFromScore(score);
    if (tier === "HOT") breakdown.hot += 1;
    else if (tier === "WARM") breakdown.warm += 1;
    else breakdown.cold += 1;
  }

  return NextResponse.json({
    ok: true,
    today: {
      leads: todayLeadsCount.count ?? 0,
      conversations: todayConversationsCount.count ?? 0,
      revenue: sumRevenue(revTodayRes.data || []),
    },
    week: {
      leads: weekLeadIds.length,
      revenue: sumRevenue(revWeekRes.data || []),
    },
    month: {
      leads: monthLeadsCount.count ?? 0,
      revenue: sumRevenue(revMonthRes.data || []),
    },
    breakdown,
  });
}

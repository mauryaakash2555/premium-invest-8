import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminFromRequest } from "@/lib/adminSession";
import { isFamilyFromRequest } from "@/lib/familySession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CONSTANTS } from "@/config/constants";
import { getIstRangeStarts } from "@/lib/time/istRanges";

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

export async function GET(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const isSuper = isAdminFromRequest(cookieStore, headerStore);
  const isFamily = isFamilyFromRequest(cookieStore, headerStore);
  if (!isSuper && !isFamily) {
    const isLocalOrDev = String(process.env.VERCEL || "") !== "1";
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
        ...(isLocalOrDev
          ? {
              debug: {
                nodeEnv: process.env.NODE_ENV || "",
                vercel: process.env.VERCEL || "",
                hasBmFamilyCookie: Boolean(cookieStore?.get?.("bm_family")?.value),
              },
            }
          : null),
      },
      { status: 401 }
    );
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const { dayStart: todayStart, weekStart, monthStart } = getIstRangeStarts();

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

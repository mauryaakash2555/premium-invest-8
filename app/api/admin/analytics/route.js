import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeekMonday(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  x.setDate(x.getDate() + diff);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function prevMonthRange(now) {
  const thisMonth = startOfMonth(now);
  const prevEnd = new Date(thisMonth.getTime() - 1);
  const prevStart = startOfMonth(prevEnd);
  return { prevStart, prevEnd };
}

function pctChange(cur, prev) {
  const c = Number(cur) || 0;
  const p = Number(prev) || 0;
  if (p <= 0) return c > 0 ? 100 : 0;
  return Math.round(((c - p) / p) * 1000) / 10;
}

function normalizeQuestion(text) {
  const t = String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[^\w\s\?\-\/₹]/g, "");
  return t.slice(0, 140);
}

function isQuestion(text) {
  const raw = String(text || "");
  const t = raw.toLowerCase();
  if (raw.includes("?")) return true;
  return /\b(what|how|which|can i|should i|tell me|explain)\b/.test(t);
}

export async function GET(req) {
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

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeekMonday(now);
  const monthStart = startOfMonth(now);
  const { prevStart, prevEnd } = prevMonthRange(now);

  // Pull events we need for month + previous month (bounded limits).
  const { data: eventsMonth, error: evErr } = await sb
    .from("events")
    .select("id,event_type,created_at,data,lead_id")
    .gte("created_at", prevStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);
  if (evErr) return NextResponse.json({ ok: false, error: evErr.message }, { status: 500 });

  const events = eventsMonth || [];

  function inRange(iso, start, end) {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return false;
    if (start && t < start.getTime()) return false;
    if (end && t > end.getTime()) return false;
    return true;
  }

  const uniqVisitors = (arr) => {
    const s = new Set();
    for (const e of arr) {
      const h = e?.data?.ipHash;
      if (h) s.add(h);
    }
    return s.size;
  };

  const countType = (arr, type) => arr.filter((e) => e.event_type === type).length;

  const visitorsToday = uniqVisitors(events.filter((e) => e.event_type === "visitor" && inRange(e.created_at, todayStart)));
  const visitorsWeek = uniqVisitors(events.filter((e) => e.event_type === "visitor" && inRange(e.created_at, weekStart)));
  const visitorsMonth = uniqVisitors(events.filter((e) => e.event_type === "visitor" && inRange(e.created_at, monthStart)));
  const visitorsPrevMonth = uniqVisitors(
    events.filter((e) => e.event_type === "visitor" && inRange(e.created_at, prevStart, prevEnd))
  );

  const convStartedToday = countType(events.filter((e) => inRange(e.created_at, todayStart)), "conversation_started");
  const msgSentToday = countType(events.filter((e) => inRange(e.created_at, todayStart)), "message_sent");
  const leadsCapturedToday = countType(events.filter((e) => inRange(e.created_at, todayStart)), "lead_captured");

  const conversionToday = visitorsToday > 0 ? Math.round((leadsCapturedToday / visitorsToday) * 1000) / 10 : 0;
  const avgMsgsPerConversationToday = convStartedToday > 0 ? Math.round((msgSentToday / convStartedToday) * 10) / 10 : 0;

  // Revenue month + prev month
  const revenueSum = (arr) =>
    arr.reduce((sum, e) => {
      if (e.event_type !== "revenue" && e.event_type !== "revenue_manual") return sum;
      const n = Number(e?.data?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);

  const revenueThisMonth = revenueSum(events.filter((e) => inRange(e.created_at, monthStart)));
  const revenuePrevMonth = revenueSum(events.filter((e) => inRange(e.created_at, prevStart, prevEnd)));

  // Lead tier breakdown this week: use latest lead_score per lead_id (from events)
  const leadScoresLatest = {};
  for (const e of events) {
    if (e.event_type !== "lead_score") continue;
    const lid = e.lead_id;
    if (!lid || leadScoresLatest[lid]) continue; // events ordered desc
    const score = Number(e?.data?.score);
    const tier = String(e?.data?.tier || "").toUpperCase() || null;
    leadScoresLatest[lid] = {
      score: Number.isFinite(score) ? score : null,
      tier: tier === "HOT" || tier === "WARM" || tier === "COLD" ? tier : null,
      at: e.created_at || null,
    };
  }

  // Leads this week from leads table (more reliable than lead_captured events)
  const { data: leadsWeek, error: leadsWeekErr } = await sb
    .from("leads")
    .select("id,created_at")
    .gte("created_at", weekStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(2000);
  if (leadsWeekErr) return NextResponse.json({ ok: false, error: leadsWeekErr.message }, { status: 500 });

  const tierCountsWeek = { HOT: 0, WARM: 0, COLD: 0 };
  for (const l of leadsWeek || []) {
    const tier = leadScoresLatest[l.id]?.tier || "COLD";
    tierCountsWeek[tier] = (tierCountsWeek[tier] || 0) + 1;
  }

  // Top questions this week from conversations table (user messages)
  const { data: convWeek, error: convWeekErr } = await sb
    .from("conversations")
    .select("message,sender,created_at")
    .gte("created_at", weekStart.toISOString())
    .eq("sender", "user")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (convWeekErr) return NextResponse.json({ ok: false, error: convWeekErr.message }, { status: 500 });

  const qCounts = new Map();
  for (const c of convWeek || []) {
    if (!isQuestion(c.message)) continue;
    const key = normalizeQuestion(c.message);
    if (!key) continue;
    qCounts.set(key, (qCounts.get(key) || 0) + 1);
  }
  const topQuestions = Array.from(qCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([q, count]) => ({ question: q, count }));

  // Most active hour this month (based on message_sent events), in IST.
  const hourCounts = Array(24).fill(0);
  for (const e of events) {
    if (e.event_type !== "message_sent") continue;
    if (!inRange(e.created_at, monthStart)) continue;
    const t = new Date(e.created_at).getTime();
    if (Number.isNaN(t)) continue;
    const ist = new Date(t + 330 * 60 * 1000);
    hourCounts[ist.getUTCHours()] += 1;
  }
  let mostActiveHour = 0;
  for (let i = 1; i < 24; i++) if (hourCounts[i] > hourCounts[mostActiveHour]) mostActiveHour = i;

  // Weekly trend: last 7 days leads + visitors
  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const d0 = startOfDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
    const d1 = startOfDay(new Date(d0.getTime() + 24 * 60 * 60 * 1000));
    const visitors = uniqVisitors(events.filter((e) => e.event_type === "visitor" && inRange(e.created_at, d0, new Date(d1.getTime() - 1))));
    const leads = (leadsWeek || []).filter((l) => inRange(l.created_at, d0, new Date(d1.getTime() - 1))).length;
    daily.push({
      date: d0.toISOString().slice(0, 10),
      visitors,
      leads,
    });
  }

  return NextResponse.json({
    ok: true,
    asOf: now.toISOString(),
    today: {
      visitors: visitorsToday,
      conversations_started: convStartedToday,
      leads_captured: leadsCapturedToday,
      conversion_rate: conversionToday,
      avg_messages_per_conversation: avgMsgsPerConversationToday,
    },
    week: {
      visitors: visitorsWeek,
      leads: (leadsWeek || []).length,
      tier_breakdown: tierCountsWeek,
      top_questions: topQuestions,
      daily,
    },
    month: {
      visitors: visitorsMonth,
      visitors_growth_pct: pctChange(visitorsMonth, visitorsPrevMonth),
      revenue: revenueThisMonth,
      revenue_growth_pct: pctChange(revenueThisMonth, revenuePrevMonth),
      most_active_hour_ist: mostActiveHour,
    },
  });
}



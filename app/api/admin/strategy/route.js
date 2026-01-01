import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { getAIEnvSafe } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { callClaudeSafe } from "@/lib/ai/claude";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildAdminStrategicPrompt() {
  return (
    "You are BM Wealth's strategic business advisor.\n" +
    "User is Akash (founder).\n\n" +
    "Analyze provided data and provide:\n" +
    "- Revenue optimization recommendations\n" +
    "- Marketing strategy suggestions\n" +
    "- Competitive positioning advice\n" +
    "- Growth opportunities\n" +
    "- Risk analysis\n\n" +
    "Be direct, data-driven, actionable. Act like a demanding business partner who pushes for better results.\n\n" +
    "Output format:\n" +
    "1) Executive snapshot (2-3 bullets)\n" +
    "2) Priority actions (P0/P1/P2, each with owner + next step)\n" +
    "3) Funnel diagnosis (visitors -> conversations -> leads)\n" +
    "4) Messaging improvements (top objections/questions)\n" +
    "5) 7-day experiment plan (metrics + expected impact)\n\n" +
    "Constraints:\n" +
    "- Do NOT give personalized investment advice.\n" +
    "- Do NOT mention API keys or internal secrets.\n"
  );
}

// Claude provider moved to /lib/ai/claude

async function buildContext(sb) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  {
    const day = weekStart.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    weekStart.setDate(weekStart.getDate() + diff);
  }
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);

  const [analyticsRes, summaryRes] = await Promise.all([
    sb
      .from("events")
      .select("id,event_type,created_at,data,lead_id")
      .gte("created_at", weekStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000),
    sb
      .from("leads")
      .select("id,created_at")
      .gte("created_at", monthStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  // Reuse the already-built /api/admin/analytics endpoint output shape would be ideal,
  // but we keep this self-contained to avoid internal auth hops.
  const events = analyticsRes.data || [];
  const leadsMonth = summaryRes.data || [];

  const uniqVisitorsToday = new Set();
  const uniqVisitorsWeek = new Set();
  const hourCounts = Array(24).fill(0);
  const topQuestions = new Map();

  for (const e of events) {
    const ts = new Date(e.created_at);
    if (Number.isNaN(ts.getTime())) continue;
    const ipHash = e?.data?.ipHash;
    if (e.event_type === "visitor" && ipHash) {
      if (ts >= todayStart) uniqVisitorsToday.add(ipHash);
      uniqVisitorsWeek.add(ipHash);
    }

    if (e.event_type === "message_sent") {
      const ist = new Date(ts.getTime() + 330 * 60 * 1000);
      hourCounts[ist.getUTCHours()] += 1;
    }
  }

  // Pull conversations this week for question mining
  const convWeekRes = await sb
    .from("conversations")
    .select("message,sender,created_at")
    .gte("created_at", weekStart.toISOString())
    .eq("sender", "user")
    .order("created_at", { ascending: false })
    .limit(2000);
  const convWeek = convWeekRes.data || [];
  for (const c of convWeek) {
    const msg = String(c.message || "").trim();
    if (!msg) continue;
    const key = msg.toLowerCase().replace(/\s+/g, " ").slice(0, 140);
    if (!key) continue;
    topQuestions.set(key, (topQuestions.get(key) || 0) + 1);
  }

  const topQ = Array.from(topQuestions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([q, count]) => ({ q, count }));

  let mostActiveHour = 0;
  for (let i = 1; i < 24; i++) if (hourCounts[i] > hourCounts[mostActiveHour]) mostActiveHour = i;

  // Revenue this month
  const revRes = await sb
    .from("events")
    .select("id,event_type,data,created_at")
    .gte("created_at", monthStart.toISOString())
    .filter("event_type", "in", '("revenue","revenue_manual")')
    .order("created_at", { ascending: false })
    .limit(500);
  const revenue = (revRes.data || []).reduce((sum, e) => {
    const n = Number(e?.data?.amount);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);

  return {
    asOf: now.toISOString(),
    today: { visitors: uniqVisitorsToday.size },
    week: { visitors: uniqVisitorsWeek.size, top_questions: topQ },
    month: { revenue, most_active_hour_ist: mostActiveHour, leads: leadsMonth.length },
  };
}

export async function GET(req) {
  const cookieStore = await cookies();
  if (!isAdminFromCookies(cookieStore)) return NextResponse.json({ ok: false }, { status: 401 });

  const env = getAIEnvSafe();
  if (!env?.ANTHROPIC_API_KEY) return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";

  const now = new Date();
  const todayStart = startOfDay(now);

  // Cache: if we already generated advice today, return latest unless force=1.
  if (!force) {
    const cached = await sb
      .from("events")
      .select("id,data,created_at")
      .eq("event_type", "admin_strategy")
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
    const item = cached.data?.[0];
    const text = String(item?.data?.text || "").trim();
    if (text) {
      return NextResponse.json({ ok: true, cached: true, asOf: item.created_at, text });
    }
  }

  const context = await buildContext(sb);
  const task =
    "Generate today's strategic advice for BM Wealth using the context. Be very specific about what to do next.\n" +
    "Also include 1 conversion improvement for the chat flow, 1 marketing channel focus, and 1 KPI to watch today.";

  const system = buildAdminStrategicPrompt();
  const res = await callClaudeSafe({
    apiKey: env.ANTHROPIC_API_KEY,
    userText: task,
    system,
    context,
    maxTokens: 900,
    temperature: 0.35,
  });
  if (res.error) throw new Error(res.error);
  const text = res.reply;

  // Persist as event for caching + audit
  try {
    await sb.from("events").insert({
      lead_id: null,
      event_type: "admin_strategy",
      data: { text, context, cached_for_day: todayStart.toISOString().slice(0, 10) },
    });
    await sb.from("events").insert({
      lead_id: null,
      event_type: "chat_ai",
      data: { provider: "anthropic", mode: "admin_strategy" },
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true, cached: false, asOf: new Date().toISOString(), text });
}




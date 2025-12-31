import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  const url = new URL(req.url);
  const leadId = url.searchParams.get("leadId") || "";

  // If a lead is requested, return full conversation history for that lead (newest last).
  if (leadId) {
    const [leadRes, convRes] = await Promise.all([
      sb.from("leads").select("id,name,email,phone,created_at").eq("id", leadId).maybeSingle(),
      sb
        .from("conversations")
        .select("id,lead_id,message,sender,created_at")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true })
        .limit(500),
    ]);

    if (leadRes.error || convRes.error) {
      return NextResponse.json(
        { ok: false, error: leadRes.error?.message || convRes.error?.message || "Supabase error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      lead: leadRes.data || null,
      conversations: convRes.data || [],
    });
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [leadsAllRes, leadsTodayRes, convTodayRes, errRes, revRes, scoreRes, aiRes, leadsCountRes] =
    await Promise.all([
    sb
      .from("leads")
      .select("id,name,email,phone,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    sb
      .from("leads")
      .select("id,name,email,phone,created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: false })
      .limit(500),
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

    // Lead qualification (HOT/WARM/COLD)
    sb
      .from("events")
      .select("id,lead_id,data,created_at")
      .gte("created_at", start.toISOString())
      .eq("event_type", "lead_score")
      .order("created_at", { ascending: false })
      .limit(1000),

    // AI provider usage (Gemini vs Groq)
    sb
      .from("events")
      .select("id,data,created_at")
      .gte("created_at", start.toISOString())
      .eq("event_type", "chat_ai")
      .order("created_at", { ascending: false })
      .limit(1000),

    // Total leads (all-time)
    sb.from("leads").select("id", { count: "exact", head: true }),
  ]);

  if (
    leadsAllRes.error ||
    leadsTodayRes.error ||
    convTodayRes.error ||
    errRes.error ||
    revRes.error ||
    scoreRes.error ||
    aiRes.error ||
    leadsCountRes.error
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          leadsAllRes.error?.message ||
          leadsTodayRes.error?.message ||
          convTodayRes.error?.message ||
          errRes.error?.message ||
          revRes.error?.message ||
          scoreRes.error?.message ||
          aiRes.error?.message ||
          leadsCountRes.error?.message ||
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

  const lead_scores = {};
  for (const e of scoreRes.data || []) {
    const lid = e?.lead_id;
    if (!lid || lead_scores[lid]) continue; // first seen is latest (ordered desc)
    const tier = String(e?.data?.tier || "").toUpperCase();
    lead_scores[lid] = {
      tier: tier === "HOT" || tier === "WARM" ? tier : "COLD",
      signals: e?.data?.signals || null,
      at: e?.created_at || null,
    };
  }

  const lead_score_counts = { HOT: 0, WARM: 0, COLD: 0 };
  for (const l of leadsTodayRes.data || []) {
    const tier = lead_scores[l.id]?.tier || "COLD";
    lead_score_counts[tier] = (lead_score_counts[tier] || 0) + 1;
  }

  const ai_provider_counts = { gemini: 0, groq: 0 };
  for (const e of aiRes.data || []) {
    const p = String(e?.data?.provider || "").toLowerCase();
    if (p === "groq") ai_provider_counts.groq += 1;
    else if (p === "gemini") ai_provider_counts.gemini += 1;
  }

  return NextResponse.json({
    ok: true,
    today: {
      leads: leadsTodayRes.data || [],
      conversations: convTodayRes.data || [],
      chat_errors_count: (errRes.data || []).length,
      revenue_total,
      revenue_entries: revenueEntries,
      lead_scores,
      lead_score_counts,
      ai_provider_counts,
    },
    all: {
      leads: leadsAllRes.data || [],
      total_leads: leadsCountRes.count ?? (leadsAllRes.data || []).length,
      new_today: (leadsTodayRes.data || []).length,
      total_conversations_today: (convTodayRes.data || []).length,
    },
  });
}




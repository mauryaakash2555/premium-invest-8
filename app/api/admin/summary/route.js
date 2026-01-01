/**
 * FILE: app/api/admin/summary/route.js
 * PURPOSE: Admin summary endpoint (leads + conversations + key stats).
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - lib/adminSession (cookie auth)
 * - lib/db/leads, lib/db/conversations, lib/db/events
 *
 * SIMPLE EXPLANATION:
 * Admin can load this to see what happened today (leads, chats, errors, revenue events).
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { getLeadById, listLeads, countLeadsExact } from "@/lib/db/leads";
import { listConversations } from "@/lib/db/conversations";
import { listEvents } from "@/lib/db/events";

export async function GET(req) {
  const cookieStore = await cookies();
  if (!isAdminFromCookies(cookieStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = new URL(req.url);
  const leadId = url.searchParams.get("leadId") || "";

  // 🔵 If a lead is requested, return full conversation history for that lead (newest last).
  if (leadId) {
    try {
      const [lead, conversations] = await Promise.all([
        getLeadById(leadId),
        listConversations({ leadId, limit: 500, oldestFirst: true }),
      ]);

      return NextResponse.json({ ok: true, lead: lead || null, conversations: conversations || [] });
    } catch (e) {
      const msg = String(e?.message || "");
      if (msg.includes("Supabase env not configured")) {
        return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();

  const weekStart = new Date(start);
  {
    const day = weekStart.getDay(); // 0 Sun..6 Sat
    const diff = (day === 0 ? -6 : 1) - day; // Monday start
    weekStart.setDate(weekStart.getDate() + diff);
  }
  const weekStartIso = weekStart.toISOString();

  const monthStart = new Date(start);
  monthStart.setDate(1);
  const monthStartIso = monthStart.toISOString();

  try {
    const [
      allLeads,
      todayLeads,
      todayConversations,
      todayChatErrors,
      revenueEntries,
      leadScoreEvents,
      todayAiEvents,
      totalLeads,
    ] = await Promise.all([
      listLeads({ limit: 500, newestFirst: true }),
      listLeads({ sinceIso: startIso, limit: 500, newestFirst: true }),
      listConversations({ sinceIso: startIso, limit: 200, oldestFirst: false }),
      listEvents({ sinceIso: startIso, eventType: "chat_error", limit: 1000, newestFirst: true }),
      listEvents({ sinceIso: monthStartIso, eventTypes: ["revenue", "revenue_manual"], limit: 1000, newestFirst: true }),
      listEvents({ eventType: "lead_score", limit: 2000, newestFirst: true }),
      listEvents({ sinceIso: startIso, eventType: "chat_ai", limit: 1000, newestFirst: true }),
      countLeadsExact(),
    ]);

    const revenue_today = (revenueEntries || []).reduce((sum, e) => {
      if (!e?.created_at || e.created_at < startIso) return sum;
      const n = Number(e?.data?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);

    const revenue_week = (revenueEntries || []).reduce((sum, e) => {
      if (!e?.created_at || e.created_at < weekStartIso) return sum;
      const n = Number(e?.data?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);

    const revenue_month = (revenueEntries || []).reduce((sum, e) => {
      if (!e?.created_at || e.created_at < monthStartIso) return sum;
      const n = Number(e?.data?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);

    const lead_scores = {};
    for (const e of leadScoreEvents || []) {
      const lid = e?.lead_id;
      if (!lid || lead_scores[lid]) continue; // first seen is latest (ordered desc)
      const scoreNum = Number(e?.data?.score);
      const tier = String(e?.data?.tier || "").toUpperCase();
      lead_scores[lid] = {
        tier: tier === "HOT" || tier === "WARM" ? tier : "COLD",
        score: Number.isFinite(scoreNum) ? scoreNum : null,
        signals: e?.data?.signals || null,
        at: e?.created_at || null,
      };
    }

    const lead_score_counts = { HOT: 0, WARM: 0, COLD: 0 };
    for (const l of todayLeads || []) {
      const tier = lead_scores[l.id]?.tier || "COLD";
      lead_score_counts[tier] = (lead_score_counts[tier] || 0) + 1;
    }

    const ai_provider_counts = { gemini: 0, groq: 0, rule: 0 };
    for (const e of todayAiEvents || []) {
      const p = String(e?.data?.provider || "").toLowerCase();
      if (p === "groq") ai_provider_counts.groq += 1;
      else if (p === "gemini") ai_provider_counts.gemini += 1;
      else if (p === "rule") ai_provider_counts.rule += 1;
    }

    // Sort all leads: HOT first (highest score), then newest as tie-breaker.
    const allLeadsSorted = (allLeads || []).slice().sort((a, b) => {
      const as = lead_scores[a.id]?.score ?? -1;
      const bs = lead_scores[b.id]?.score ?? -1;
      if (bs !== as) return bs - as;
      const at = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bt = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bt - at;
    });

    return NextResponse.json({
      ok: true,
      today: {
        leads: todayLeads || [],
        conversations: todayConversations || [],
        chat_errors_count: (todayChatErrors || []).length,
        revenue_today,
        revenue_week,
        revenue_month,
        revenue_entries: revenueEntries || [],
        lead_scores,
        lead_score_counts,
        ai_provider_counts,
      },
      all: {
        leads: allLeadsSorted,
        total_leads: totalLeads ?? (allLeads || []).length,
        new_today: (todayLeads || []).length,
        total_conversations_today: (todayConversations || []).length,
      },
    });
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("Supabase env not configured")) {
      return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

/**
 * ⚠️⚠️⚠️ CRITICAL FILE - CHATBOT DATABASE: LEADS ⚠️⚠️⚠️
 *
 * This file saves/loads lead info (name/email/phone) and lead score.
 * Breaking this = lead capture fails = revenue loss.
 *
 * BEFORE MODIFYING:
 * 1) Read /docs/chatbot/CHATBOT_DONT_TOUCH.md
 * 2) Run backup: node scripts/backup-chatbot.js
 * 3) Run validation: node scripts/validate-chatbot.js
 *
 * SAFE TO CHANGE: adding new read helpers
 * NEVER CHANGE casually: upsertLead(), table/column names, score updates
 *
 * Last modified: 2026-01-09
 * Modified by: [name]
 * Reason: [why]
 */

/**
 * FILE: lib/db/leads.js
 * PURPOSE: Lead database operations (Supabase).
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * Leads are people who give us their name/email/phone.
 * These helpers save and read leads from Supabase.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// 🔵 CREATE / UPDATE
export async function upsertLead({ name, email, phone }) {
  const sb = supabaseAdmin();
  const e = normalizeEmail(email);
  if (!e) throw new Error("email_required");

  const { data, error } = await sb
    .from("leads")
    .upsert(
      { name: String(name || "").trim() || null, email: e, phone: String(phone || "").trim() || null },
      { onConflict: "email" }
    )
    .select("id,name,email,phone,created_at")
    .single();

  if (error) throw error;
  return data;
}

// 🔵 READ
export async function getLeadById(leadId) {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("leads")
    .select("id,name,email,phone,created_at")
    .eq("id", leadId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listLeads({ sinceIso = null, limit = 500, newestFirst = true } = {}) {
  const sb = supabaseAdmin();
  let q = sb.from("leads").select("id,name,email,phone,created_at");
  if (sinceIso) q = q.gte("created_at", sinceIso);
  q = q.order("created_at", { ascending: !newestFirst }).limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function countLeadsExact() {
  const sb = supabaseAdmin();
  const { count, error } = await sb.from("leads").select("id", { count: "exact", head: true });
  if (error) throw error;
  return Number(count || 0);
}

// 🔵 SAFE HELPERS (do not throw)
export async function getLeadNameSafe(leadId) {
  if (!leadId) return "";
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("leads").select("name").eq("id", leadId).limit(1);
    if (error) return "";
    return String(data?.[0]?.name || "").trim();
  } catch {
    return "";
  }
}

export async function getLeadContactSafe(leadId) {
  if (!leadId) return { hasEmail: false, hasPhone: false };
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("leads").select("email,phone").eq("id", leadId).maybeSingle();
    if (error) return { hasEmail: false, hasPhone: false };
    return { hasEmail: Boolean(data?.email), hasPhone: Boolean(data?.phone) };
  } catch {
    return { hasEmail: false, hasPhone: false };
  }
}

export async function getLeadScoreSafe(leadId) {
  if (!leadId) return 0;
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("leads").select("lead_score").eq("id", leadId).maybeSingle();
    if (error) return 0;
    const n = Number(data?.lead_score || 0);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function updateLeadScoreColumnSafe(leadId, score) {
  if (!leadId) return;
  try {
    const sb = supabaseAdmin();
    await sb.from("leads").update({ lead_score: score }).eq("id", leadId);
  } catch {
    // ignore (column may not exist in some envs)
  }
}

/**
 * Leads Database Module (CRUD-style)
 * New code should prefer LeadsDB.* but legacy helpers remain exported above.
 */
export const LeadsDB = {
  async create(data) {
    try {
      const lead = await upsertLead(data || {});
      return { lead, error: null };
    } catch (e) {
      return { lead: null, error: e };
    }
  },

  async getAll(filters = {}) {
    const sb = supabaseAdmin();
    let q = sb.from("leads").select("*");

    if (filters?.minScore != null) {
      q = q.gte("lead_score", Number(filters.minScore));
    }

    if (filters?.today) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      q = q.gte("created_at", d.toISOString());
    }

    q = q.order("created_at", { ascending: false }).limit(1000);
    const { data, error } = await q;
    return { leads: data || [], error };
  },

  async getById(id) {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("leads").select("*").eq("id", id).single();
    return { lead: data || null, error };
  },

  async updateScore(id, score) {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("leads").update({ lead_score: score }).eq("id", id).select("*").single();
    return { lead: data || null, error };
  },

  async delete(id) {
    const sb = supabaseAdmin();
    const { error } = await sb.from("leads").delete().eq("id", id);
    return { error };
  },

  async getStats() {
    const sb = supabaseAdmin();
    const { count: total } = await sb.from("leads").select("id", { count: "exact", head: true });
    const { count: hot } = await sb.from("leads").select("id", { count: "exact", head: true }).gte("lead_score", 80);
    return { total: Number(total || 0), hot: Number(hot || 0) };
  },
};

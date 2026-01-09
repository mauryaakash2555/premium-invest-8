/**
 * ⚠️⚠️⚠️ CRITICAL FILE - CHATBOT DATABASE: CONVERSATIONS ⚠️⚠️⚠️
 *
 * This file saves/loads chat messages.
 * Breaking this = lost chat history + broken context + admin cannot review chats.
 *
 * BEFORE MODIFYING:
 * 1) Read /docs/chatbot/CHATBOT_DONT_TOUCH.md
 * 2) Run backup: node scripts/backup-chatbot.js
 * 3) Run validation: node scripts/validate-chatbot.js
 *
 * SAFE TO CHANGE: adding new helper functions (without breaking existing exports)
 * NEVER CHANGE casually: saveMessage(), schema assumptions, table names
 *
 * Last modified: 2026-01-09
 * Modified by: [name]
 * Reason: [why]
 */

/**
 * FILE: lib/db/conversations.js
 * PURPOSE: Conversation database operations (Supabase).
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * Conversations store chat messages so admin can review them later.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function saveMessage({ leadId, message, sender }) {
  if (!leadId) return;
  const sb = supabaseAdmin();
  await sb.from("conversations").insert({ lead_id: leadId, message, sender }).throwOnError();
}

export async function listConversations({ leadId = null, sinceIso = null, limit = 500, oldestFirst = true } = {}) {
  const sb = supabaseAdmin();
  let q = sb
    .from("conversations")
    .select("id,lead_id,message,sender,created_at");

  if (leadId) q = q.eq("lead_id", leadId);
  if (sinceIso) q = q.gte("created_at", sinceIso);

  q = q.order("created_at", { ascending: !!oldestFirst }).limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function countUserMessagesSafe(leadId) {
  if (!leadId) return 0;
  try {
    const sb = supabaseAdmin();
    const { count, error } = await sb
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", leadId)
      .eq("sender", "user");
    if (error) return 0;
    return Number(count || 0);
  } catch {
    return 0;
  }
}

export async function getConversationHistory({ leadId, limit = 500 }) {
  return await listConversations({ leadId, limit, oldestFirst: true });
}

/**
 * Conversations Database Module (CRUD-style)
 * New code should prefer ConversationsDB.* but legacy helpers remain exported above.
 */
export const ConversationsDB = {
  async create({ leadId, message, sender }) {
    try {
      await saveMessage({ leadId, message, sender });
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async getAll({ leadId = null, sinceIso = null, limit = 500, oldestFirst = true } = {}) {
    try {
      const conversations = await listConversations({ leadId, sinceIso, limit, oldestFirst });
      return { conversations, error: null };
    } catch (e) {
      return { conversations: [], error: e };
    }
  },

  async deleteByLead(leadId) {
    const sb = supabaseAdmin();
    const { error } = await sb.from("conversations").delete().eq("lead_id", leadId);
    return { error };
  },
};

/**
 * Context Memory Manager
 * Fetches prior conversations from DB (best-effort) and returns a compact history
 * usable by AI providers.
 */

import { isFeatureEnabled } from "@/config/features";
import { getConversationHistory } from "@/lib/db/conversations";

function safeTrim(s) {
  return String(s || "").trim();
}

function toHistoryItem(row) {
  const sender = row?.sender === "user" ? "user" : "bot";
  const text = safeTrim(row?.message).slice(0, 2000);
  if (!text) return null;
  return { sender, text };
}

/**
 * @param {Object} params
 * @param {string|undefined|null} params.leadId
 * @param {Array<{sender:'user'|'bot', text:string}>} params.fallbackHistory
 * @param {number} [params.limit]
 */
export async function buildConversationHistorySafe({ leadId, fallbackHistory = [], limit = 12 }) {
  // Feature off: just use what the client provided.
  if (!isFeatureEnabled("CONTEXT_MEMORY")) return Array.isArray(fallbackHistory) ? fallbackHistory : [];

  // No lead => no DB memory
  if (!leadId) return Array.isArray(fallbackHistory) ? fallbackHistory : [];

  try {
    const rows = await getConversationHistory({ leadId, limit: Math.max(1, Number(limit || 12)) });
    // getConversationHistory returns oldest-first; keep last N to bound prompt.
    const mapped = (rows || []).map(toHistoryItem).filter(Boolean).slice(-limit);
    return mapped.length ? mapped : (Array.isArray(fallbackHistory) ? fallbackHistory : []);
  } catch {
    return Array.isArray(fallbackHistory) ? fallbackHistory : [];
  }
}








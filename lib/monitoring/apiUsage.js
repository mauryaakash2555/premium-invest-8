/**
 * Track API usage
 * Best-effort logging to Supabase events (if configured).
 */

import { logEventSafe } from "@/lib/db/events";
import { logger } from "@/lib/utils/logger";

export async function logAPIUsage({ provider, tokens = null, userType = "public", leadId = null, conversationId = null, mode = "user" } = {}) {
  try {
    const p = String(provider || "unknown").toLowerCase();
    const ut = String(userType || "public");
    const tok = Number(tokens);

    await logEventSafe({
      leadId: leadId || null,
      event_type: "api_usage",
      data: {
        provider: p,
        tokens_used: Number.isFinite(tok) ? tok : null,
        user_type: ut,
        mode: String(mode || "user"),
        conversationId: conversationId || null,
        timestamp: new Date().toISOString(),
      },
    });

    if ((p === "anthropic" || p === "claude") && ut !== "super_admin") {
      logger.error("[api_usage] ALERT: Claude used by non-super-admin", { provider: p, userType: ut, leadId, conversationId, mode });
    }
  } catch {
    // ignore logging failures
  }
}

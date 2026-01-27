import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createFollowups(rows) {
  const sb = supabaseAdmin();
  const payload = Array.isArray(rows) ? rows : [];
  if (!payload.length) return [];

  const { data, error } = await sb.from("email_followups").insert(payload).select("*");
  if (error) throw error;
  return data || [];
}

export async function listDueFollowups({ limit = 50 } = {}) {
  const sb = supabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data, error } = await sb
    .from("email_followups")
    .select("*")
    .eq("status", "scheduled")
    .lte("due_at", nowIso)
    .order("due_at", { ascending: true })
    .limit(Math.max(1, Math.min(200, Number(limit) || 50)));

  if (error) throw error;
  return data || [];
}

export async function markSent({ id, provider, providerMessageId }) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("email_followups")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      provider: provider || null,
      provider_message_id: providerMessageId || null,
      last_error: null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function markFailed({ id, errorText }) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("email_followups")
    .update({
      status: "failed",
      last_error: String(errorText || "send_failed"),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function markSkipped({ id, reason }) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("email_followups")
    .update({
      status: "skipped",
      last_error: String(reason || "skipped"),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function stopAllForEmail({ email, repliedAtIso = null }) {
  const sb = supabaseAdmin();
  const e = String(email || "").trim().toLowerCase();
  if (!e) return;

  const patch = {
    status: "stopped",
    replied_at: repliedAtIso || new Date().toISOString(),
  };

  const { error } = await sb
    .from("email_followups")
    .update(patch)
    .in("status", ["scheduled", "sent", "failed", "skipped"])
    .eq("email", e);

  if (error) throw error;
}

export const EmailFollowupsDB = {
  async createMany(rows) {
    try {
      const created = await createFollowups(rows);
      return { created, error: null };
    } catch (e) {
      return { created: [], error: e };
    }
  },
  async due(limit = 50) {
    try {
      const due = await listDueFollowups({ limit });
      return { due, error: null };
    } catch (e) {
      return { due: [], error: e };
    }
  },
  async sent({ id, provider, providerMessageId }) {
    try {
      await markSent({ id, provider, providerMessageId });
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: e };
    }
  },
  async failed({ id, errorText }) {
    try {
      await markFailed({ id, errorText });
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: e };
    }
  },
  async skipped({ id, reason }) {
    try {
      await markSkipped({ id, reason });
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: e };
    }
  },
  async stopEmail({ email, repliedAtIso = null }) {
    try {
      await stopAllForEmail({ email, repliedAtIso });
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: e };
    }
  },
};

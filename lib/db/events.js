/**
 * FILE: lib/db/events.js
 * PURPOSE: Events database operations (Supabase).
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * Events are tiny records like "visitor" or "lead_score".
 * They help the admin dashboard show stats and history.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function insertEvent({ leadId, event_type, data }) {
  const sb = supabaseAdmin();
  await sb
    .from("events")
    .insert({ lead_id: leadId ?? null, event_type, data: data ?? null })
    .throwOnError();
}

export async function listEvents({
  sinceIso = null,
  eventType = null,
  eventTypes = null,
  limit = 1000,
  newestFirst = true,
} = {}) {
  const sb = supabaseAdmin();
  let q = sb.from("events").select("id,lead_id,event_type,data,created_at");

  if (sinceIso) q = q.gte("created_at", sinceIso);
  if (eventType) q = q.eq("event_type", eventType);
  if (eventTypes && Array.isArray(eventTypes)) q = q.in("event_type", eventTypes);

  q = q.order("created_at", { ascending: !newestFirst }).limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function logEventSafe({ leadId, event_type, data }) {
  try {
    await insertEvent({ leadId, event_type, data });
  } catch {
    // ignore if DB not configured
  }
}

export async function saveLeadScoreEvent({ leadId, score }) {
  if (!leadId) return;
  try {
    await insertEvent({ leadId, event_type: "lead_score", data: score });
  } catch {
    // ignore
  }
}

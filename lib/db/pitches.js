/**
 * Track pitch performance
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const PitchesDB = {
  async logPitch(leadId, pitchType, shown = true) {
    const sb = supabaseAdmin();
    await sb.from("events").insert({
      lead_id: leadId ?? null,
      event_type: shown ? "pitch_shown" : "pitch_hidden",
      data: { pitch: pitchType },
    });
  },

  async logPitchClick(leadId, pitchType) {
    const sb = supabaseAdmin();
    await sb.from("events").insert({
      lead_id: leadId ?? null,
      event_type: "pitch_clicked",
      data: { pitch: pitchType },
    });
  },

  async getPitchStats({ sinceIso = null, limit = 5000 } = {}) {
    const sb = supabaseAdmin();
    let q = sb.from("events").select("event_type,data,created_at");

    if (sinceIso) q = q.gte("created_at", sinceIso);

    q = q.in("event_type", ["pitch_shown", "pitch_clicked"]).order("created_at", { ascending: false }).limit(limit);

    const { data, error } = await q;
    if (error) throw error;

    const stats = {};
    for (const e of data || []) {
      const pitch = String(e?.data?.pitch || "").trim() || "UNKNOWN";
      if (!stats[pitch]) stats[pitch] = { pitch, shown: 0, clicked: 0 };
      if (e.event_type === "pitch_shown") stats[pitch].shown += 1;
      if (e.event_type === "pitch_clicked") stats[pitch].clicked += 1;
    }

    return stats;
  },
};

/**
 * Affiliate Links Database Module (optional)
 * NOTE: Schema for affiliate_links is not part of supabase/schema.sql yet.
 * This module is best-effort and safe in environments where the table doesn't exist.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const AffiliateLinksDB = {
  async create({ platform, campaign, url }) {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("affiliate_links")
      .insert({ platform: platform || null, campaign: campaign || null, url: url || null })
      .select("*")
      .single();
    return { link: data || null, error };
  },

  async getAll({ limit = 200 } = {}) {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("affiliate_links").select("*").order("created_at", { ascending: false }).limit(limit);
    return { links: data || [], error };
  },

  async delete(id) {
    const sb = supabaseAdmin();
    const { error } = await sb.from("affiliate_links").delete().eq("id", id);
    return { error };
  },
};






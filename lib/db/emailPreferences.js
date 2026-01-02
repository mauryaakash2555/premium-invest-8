/**
 * FILE: lib/db/emailPreferences.js
 * PURPOSE: Store email notification preferences in Supabase.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PREFS_ID = '00000000-0000-0000-0000-000000000001';

export const DEFAULT_EMAIL_PREFERENCES = {
  id: PREFS_ID,
  email_address: 'mauryaakash2555@gmail.com',
  hot_lead_alerts: true,
  daily_summary: true,
  weekly_summary: true,
  conversion_alerts: true,
  error_alerts: true,
};

function normalizePrefs(input) {
  const email_address = String(input?.email_address || DEFAULT_EMAIL_PREFERENCES.email_address).trim();
  return {
    id: PREFS_ID,
    email_address,
    hot_lead_alerts: Boolean(input?.hot_lead_alerts ?? DEFAULT_EMAIL_PREFERENCES.hot_lead_alerts),
    daily_summary: Boolean(input?.daily_summary ?? DEFAULT_EMAIL_PREFERENCES.daily_summary),
    weekly_summary: Boolean(input?.weekly_summary ?? DEFAULT_EMAIL_PREFERENCES.weekly_summary),
    conversion_alerts: Boolean(input?.conversion_alerts ?? DEFAULT_EMAIL_PREFERENCES.conversion_alerts),
    error_alerts: Boolean(input?.error_alerts ?? DEFAULT_EMAIL_PREFERENCES.error_alerts),
  };
}

export const EmailPreferencesDB = {
  async get() {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from('email_preferences').select('*').eq('id', PREFS_ID).maybeSingle();
    if (error) throw error;
    if (!data) return { ...DEFAULT_EMAIL_PREFERENCES };
    return { ...DEFAULT_EMAIL_PREFERENCES, ...data };
  },

  async upsert(prefs) {
    const sb = supabaseAdmin();
    const normalized = normalizePrefs(prefs);
    const payload = { ...normalized, updated_at: new Date().toISOString() };

    const { data, error } = await sb
      .from('email_preferences')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async getSafe() {
    try {
      return await this.get();
    } catch {
      // schema/env may not exist yet
      return { ...DEFAULT_EMAIL_PREFERENCES };
    }
  },
};

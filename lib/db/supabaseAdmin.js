/**
 * FILE: lib/db/supabaseAdmin.js
 * PURPOSE: Create a server-side Supabase client using the service role key.
 * CATEGORY: lib/db
 *
 * SIMPLE EXPLANATION:
 * Supabase is our database.
 * The service role key can read/write everything, so we only use it in API routes.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnvSafe } from "@/config/env";

let _client;

export function supabaseAdmin() {
  if (_client) return _client;
  const env = getSupabaseEnvSafe();
  if (!env) {
    throw new Error("Supabase env not configured");
  }
  _client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  return _client;
}

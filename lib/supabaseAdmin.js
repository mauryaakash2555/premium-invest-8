import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnvSafe } from "./env";

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




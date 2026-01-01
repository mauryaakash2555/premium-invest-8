/**
 * FILE: lib/supabaseAdmin.js
 * PURPOSE: Backwards-compatible wrapper for the Supabase server client.
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * The real Supabase server client now lives in `lib/db/supabaseAdmin.js`.
 * This file stays so older imports keep working during the reorganization.
 */

export { supabaseAdmin } from "@/lib/db/supabaseAdmin";

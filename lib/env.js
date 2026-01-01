/**
 * FILE: lib/env.js
 * PURPOSE: Backwards-compatible re-export for environment helpers.
 * CATEGORY: lib
 *
 * DEPENDENCIES:
 * - config/env.js
 *
 * USED BY:
 * - API routes and helpers that still import from `@/lib/env`
 *
 * SIMPLE EXPLANATION:
 * We moved env validation to `config/env.js`.
 * This file stays so older imports keep working during the reorganization.
 */

export * from "@/config/env";

import {
  getAdminEnv,
  getAdminEnvSafe,
  getSupabaseEnv,
  getSupabaseEnvSafe,
  getAIEnv,
  getAIEnvSafe,
} from "@/config/env";

// Backwards-compatible helpers (kept for older code paths).
export function getServerEnv() {
  return {
    ...getSupabaseEnv(),
    ...getAIEnv(),
    ...getAdminEnv(),
  };
}

export function getServerEnvSafe() {
  const s = getSupabaseEnvSafe();
  const a = getAIEnvSafe();
  const adm = getAdminEnvSafe();
  if (!s || !a || !adm) return null;
  return { ...s, ...a, ...adm };
}

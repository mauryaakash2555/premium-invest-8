/**
 * FILE: lib/auth/secrets.js
 * PURPOSE: Central place to read security secrets (cookie signing, analytics salt).
 * CATEGORY: lib
 */

import { CONSTANTS } from "@/config/constants";

export function getSessionSecretSafe() {
  // Preferred: explicit signing secret
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;

  // Preferred: Super Admin password hash (usable as signing secret fallback)
  if (process.env.SUPER_ADMIN_PASSWORD_HASH) return process.env.SUPER_ADMIN_PASSWORD_HASH;
  // Legacy: older Phase 5 name
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH;

  // Dev-only fallbacks (keep local working even if env vars are missing)
  if (CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_HASH_FALLBACK) return CONSTANTS.AUTH.SUPER_ADMIN_PASSWORD_HASH_FALLBACK;
  if (CONSTANTS?.AUTH?.ADMIN_PASSWORD_HASH_FALLBACK) return CONSTANTS.AUTH.ADMIN_PASSWORD_HASH_FALLBACK;

  // Last resort: plaintext (avoid in production)
  if (process.env.SUPER_ADMIN_PASSWORD) return process.env.SUPER_ADMIN_PASSWORD;
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;

  return null;
}

export function getFamilySessionSecretSafe() {
  if (process.env.FAMILY_ADMIN_SESSION_SECRET) return process.env.FAMILY_ADMIN_SESSION_SECRET;
  if (process.env.FAMILY_ADMIN_PASSWORD_HASH) return process.env.FAMILY_ADMIN_PASSWORD_HASH;
  if (CONSTANTS?.AUTH?.FAMILY_ADMIN_PASSWORD_HASH_FALLBACK) return CONSTANTS.AUTH.FAMILY_ADMIN_PASSWORD_HASH_FALLBACK;
  if (process.env.FAMILY_ADMIN_PASSWORD) return process.env.FAMILY_ADMIN_PASSWORD;
  return getSessionSecretSafe();
}

export function getAnalyticsSaltSafe() {
  if (process.env.ANALYTICS_SALT) return process.env.ANALYTICS_SALT;
  return getSessionSecretSafe();
}

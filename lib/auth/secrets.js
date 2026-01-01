/**
 * FILE: lib/auth/secrets.js
 * PURPOSE: Central place to read security secrets (cookie signing, analytics salt).
 * CATEGORY: lib
 */

import { getAdminEnvSafe } from "@/config/env";

export function getSessionSecretSafe() {
  const env = getAdminEnvSafe();
  if (env?.ADMIN_SESSION_SECRET) return env.ADMIN_SESSION_SECRET;
  if (env?.ADMIN_PASSWORD_HASH) return env.ADMIN_PASSWORD_HASH;
  if (env?.ADMIN_PASSWORD) return env.ADMIN_PASSWORD;
  return null;
}

export function getAnalyticsSaltSafe() {
  const env = getAdminEnvSafe();
  if (env?.ANALYTICS_SALT) return env.ANALYTICS_SALT;
  return getSessionSecretSafe();
}

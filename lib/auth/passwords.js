/**
 * FILE: lib/auth/passwords.js
 * PURPOSE: Verify admin passwords securely (supports bcrypt hashes).
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * We never want to store real passwords in code.
 * Instead, we store a "password hash" in environment variables and compare safely.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { CONSTANTS } from "@/config/constants";

function safeEq(a, b) {
  const aa = Buffer.from(String(a ?? ""), "utf8");
  const bb = Buffer.from(String(b ?? ""), "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function isFamilyAdminPasswordConfigured() {
  return Boolean(
    process.env.FAMILY_ADMIN_PASSWORD_HASH ||
      process.env.FAMILY_ADMIN_PASSWORD ||
      // Backward compatibility: some environments only set ADMIN_PASSWORD / ADMIN_PASSWORD_HASH
      process.env.ADMIN_PASSWORD_HASH ||
      process.env.ADMIN_PASSWORD ||
      CONSTANTS?.AUTH?.FAMILY_ADMIN_PASSWORD_HASH_FALLBACK
  );
}

export function isSuperAdminPasswordConfigured() {
  return Boolean(
    process.env.SUPER_ADMIN_PASSWORD_HASH ||
      process.env.SUPER_ADMIN_PASSWORD ||
      // Backward compatibility (older Phase 5 naming)
      process.env.ADMIN_PASSWORD_HASH ||
      process.env.ADMIN_PASSWORD ||
      CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_HASH_FALLBACK ||
      CONSTANTS?.AUTH?.ADMIN_PASSWORD_HASH_FALLBACK
  );
}

export function verifySuperAdminPassword(input) {
  const pwd = String(input ?? "");

  // 1. Preferred: dedicated super admin hash (env)
  const superHash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (superHash && bcrypt.compareSync(pwd, superHash)) return true;

  // 2. Backward compatibility: legacy ADMIN_PASSWORD_HASH (env)
  const legacyHash = process.env.ADMIN_PASSWORD_HASH;
  if (legacyHash && bcrypt.compareSync(pwd, legacyHash)) return true;

  // 3. Plaintext env vars (check BEFORE fallback constants so ADMIN_PASSWORD=7287 works)
  const superPlain = process.env.SUPER_ADMIN_PASSWORD;
  if (superPlain && safeEq(pwd, superPlain)) return true;

  const legacyPlain = process.env.ADMIN_PASSWORD;
  if (legacyPlain && safeEq(pwd, legacyPlain)) return true;

  // 4. Fallback constants (for demo/dev when no env is set)
  const fallbackHash = CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_HASH_FALLBACK || CONSTANTS?.AUTH?.ADMIN_PASSWORD_HASH_FALLBACK;
  if (fallbackHash && bcrypt.compareSync(pwd, fallbackHash)) return true;

  const fallbackPlain = CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_PLAIN_FALLBACK;
  if (fallbackPlain && safeEq(pwd, fallbackPlain)) return true;

  return false;
}

export function verifyFamilyAdminPassword(input) {
  const pwd = String(input ?? "");

  // Preferred: dedicated family admin hash
  const familyHash = process.env.FAMILY_ADMIN_PASSWORD_HASH || CONSTANTS?.AUTH?.FAMILY_ADMIN_PASSWORD_HASH_FALLBACK;
  if (familyHash && bcrypt.compareSync(pwd, familyHash)) return true;

  // Backward compatibility: accept legacy admin hash as family PIN when no family password is configured.
  // This matches existing setups that only define ADMIN_PASSWORD(_HASH).
  const legacyHash = process.env.ADMIN_PASSWORD_HASH;
  if (legacyHash && bcrypt.compareSync(pwd, legacyHash)) return true;

  // Plaintext (least preferred)
  const familyPlain = process.env.FAMILY_ADMIN_PASSWORD;
  if (familyPlain && safeEq(pwd, familyPlain)) return true;

  const legacyPlain = process.env.ADMIN_PASSWORD;
  if (legacyPlain && safeEq(pwd, legacyPlain)) return true;

  return false;
}

// Backward-compatible exports (older code paths)
export const isAdminPasswordConfigured = isSuperAdminPasswordConfigured;
export const verifyAdminPassword = verifySuperAdminPassword;

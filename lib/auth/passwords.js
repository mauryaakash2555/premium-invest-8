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
  const hash =
    process.env.SUPER_ADMIN_PASSWORD_HASH ||
    // Backward compatibility (older Phase 5 naming)
    process.env.ADMIN_PASSWORD_HASH ||
    CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_HASH_FALLBACK ||
    CONSTANTS?.AUTH?.ADMIN_PASSWORD_HASH_FALLBACK;

  if (hash) return bcrypt.compareSync(pwd, hash);

  const plain =
    process.env.SUPER_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_PLAIN_FALLBACK;
  if (!plain) return false;
  return safeEq(pwd, plain);
}

export function verifyFamilyAdminPassword(input) {
  const pwd = String(input ?? "");
  const hash = process.env.FAMILY_ADMIN_PASSWORD_HASH || CONSTANTS?.AUTH?.FAMILY_ADMIN_PASSWORD_HASH_FALLBACK;
  if (hash) return bcrypt.compareSync(pwd, hash);

  const plain = process.env.FAMILY_ADMIN_PASSWORD;
  if (!plain) return false;
  return safeEq(pwd, plain);
}

// Backward-compatible exports (older code paths)
export const isAdminPasswordConfigured = isSuperAdminPasswordConfigured;
export const verifyAdminPassword = verifySuperAdminPassword;

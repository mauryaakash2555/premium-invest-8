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

function safeEq(a, b) {
  const aa = Buffer.from(String(a ?? ""), "utf8");
  const bb = Buffer.from(String(b ?? ""), "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);
}

export function isFamilyAdminPasswordConfigured() {
  return Boolean(process.env.FAMILY_ADMIN_PASSWORD_HASH || process.env.FAMILY_ADMIN_PASSWORD);
}

export function verifyAdminPassword(input) {
  const pwd = String(input ?? "");
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compareSync(pwd, hash);

  // Backwards compatible fallback (Phase 5 transition)
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  return safeEq(pwd, plain);
}

export function verifyFamilyAdminPassword(input) {
  const pwd = String(input ?? "");
  const hash = process.env.FAMILY_ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compareSync(pwd, hash);

  const plain = process.env.FAMILY_ADMIN_PASSWORD;
  if (!plain) return false;
  return safeEq(pwd, plain);
}

/**
 * FILE: lib/adminSession.js
 * PURPOSE: Issue + verify an admin login cookie.
 * CATEGORY: lib
 *
 * DEPENDENCIES:
 * - crypto
 * - lib/env (admin password)
 *
 * SIMPLE EXPLANATION:
 * When admin logs in, we create a signed cookie.
 * Later API routes check the cookie to see if the user is admin.
 */

import crypto from "crypto";
import { getAdminEnv, getAdminEnvSafe } from "./env";

const COOKIE_NAME = "bm_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function sign(payload) {
  const env = getAdminEnv();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", env.ADMIN_PASSWORD).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;

  // In preview/staging environments ADMIN_PASSWORD may be unset.
  // Treat as "not admin" instead of throwing.
  const env = getAdminEnvSafe();
  if (!env?.ADMIN_PASSWORD) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", env.ADMIN_PASSWORD).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.exp || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function issueAdminCookie() {
  const token = sign({ exp: Date.now() + MAX_AGE_SECONDS * 1000 });

  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax",
      // 🔵 Secure cookie in production (HTTPS). Allow HTTP in local dev for easier testing.
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

export function isAdminFromCookies(cookies) {
  const token = cookies?.get?.(COOKIE_NAME)?.value;
  return Boolean(verify(token));
}

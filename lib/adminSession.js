import crypto from "crypto";
import { CONSTANTS } from "@/config/constants";
import { getSessionSecretSafe } from "@/lib/auth/secrets";

const COOKIE_NAME = CONSTANTS?.ADMIN?.COOKIE_NAME || "bm_admin";
const MAX_AGE_SECONDS = CONSTANTS?.ADMIN?.COOKIE_MAX_AGE_SECONDS || 60 * 30;

function sign(payload) {
  const secret = getSessionSecretSafe();
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET (or fallback secret)");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;
  const secret = getSessionSecretSafe();
  if (!secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
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

export function issueSuperAdminCookie() {
  const token = sign({ exp: Date.now() + MAX_AGE_SECONDS * 1000, role: "super" });
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

export function isSuperAdminFromCookies(cookies) {
  const token = cookies?.get?.(COOKIE_NAME)?.value;
  const payload = verify(token);
  return Boolean(payload && payload.role === "super");
}

// Backward-compatible exports (older code paths)
export const issueAdminCookie = issueSuperAdminCookie;
export const isAdminFromCookies = isSuperAdminFromCookies;

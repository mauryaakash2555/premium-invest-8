import crypto from "crypto";
import { CONSTANTS } from "@/config/constants";
import { getSessionSecretSafe } from "@/lib/auth/secrets";

const COOKIE_NAME = CONSTANTS?.ADMIN?.COOKIE_NAME || "bm_admin";
const MAX_AGE_SECONDS = CONSTANTS?.ADMIN?.COOKIE_MAX_AGE_SECONDS || 60 * 30;
const ADMIN_TOKEN_HEADER = "x-bm-admin-token";

function shouldUseSecureCookies() {
  if (String(process.env.FORCE_SECURE_COOKIES || "").toLowerCase() === "true") return true;
  return String(process.env.VERCEL || "") === "1";
}

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
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
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

function readBearer(authHeader) {
  const v = String(authHeader || "").trim();
  if (!v) return "";
  const m = v.match(/^Bearer\s+(.+)$/i);
  return m ? String(m[1] || "").trim() : "";
}

export function issueSuperAdminCookie() {
  const token = sign({ exp: Date.now() + MAX_AGE_SECONDS * 1000, role: "super" });
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureCookies(),
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

export function getSuperAdminPayloadFromHeaders(headers) {
  const token =
    headers?.get?.(ADMIN_TOKEN_HEADER) ||
    readBearer(headers?.get?.("authorization"));
  const payload = verify(token);
  if (!payload || payload.role !== "super") return null;
  return payload;
}

export function getSuperAdminPayloadFromRequest(cookieStore, headerStore) {
  const fromCookie = getSuperAdminPayloadFromCookies(cookieStore);
  if (fromCookie) return fromCookie;
  return getSuperAdminPayloadFromHeaders(headerStore);
}

export function isSuperAdminFromRequest(cookieStore, headerStore) {
  return Boolean(getSuperAdminPayloadFromRequest(cookieStore, headerStore));
}

export function getSuperAdminPayloadFromCookies(cookies) {
  const token = cookies?.get?.(COOKIE_NAME)?.value;
  const payload = verify(token);
  if (!payload || payload.role !== "super") return null;
  return payload;
}

export function issueSuperAdminTokenValue() {
  // Same token as cookie value; useful for dev/staging fallback auth.
  const token = sign({ exp: Date.now() + MAX_AGE_SECONDS * 1000, role: "super" });
  return token;
}

// Backward-compatible exports (older code paths)
export const issueAdminCookie = issueSuperAdminCookie;
export const isAdminFromCookies = isSuperAdminFromCookies;

// Newer export names for request-aware auth
export const isAdminFromRequest = isSuperAdminFromRequest;

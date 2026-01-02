import crypto from "crypto";
import { getSessionSecretSafe } from "@/lib/auth/secrets";

const COOKIE_NAME = "bm_family";
const MAX_AGE_SECONDS = 60 * 30; // 30 minutes

function shouldUseSecureCookies() {
  // Vercel deployments are HTTPS, so secure cookies are correct.
  // Local `next start` runs over http://localhost, so secure cookies would be dropped.
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
    if (payload.role !== "family") return null;
    return payload;
  } catch {
    return null;
  }
}

export function issueFamilyCookie() {
  const token = sign({ exp: Date.now() + MAX_AGE_SECONDS * 1000, role: "family" });
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

export function isFamilyFromCookies(cookies) {
  const token = cookies?.get?.(COOKIE_NAME)?.value;
  return Boolean(verify(token));
}

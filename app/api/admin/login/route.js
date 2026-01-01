import { NextResponse } from "next/server";
import { issueSuperAdminCookie } from "@/lib/adminSession";
import { isSuperAdminPasswordConfigured, verifySuperAdminPassword } from "@/lib/auth/passwords";

const MAX_FAILS = 3;
const LOCKOUT_MS = 5 * 60 * 1000;

// In-memory lockout per IP (best-effort; resets on redeploy)
const attempts = new Map();

function getIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return String(xf).split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return String(xr).trim();
  return "unknown";
}

function now() {
  return Date.now();
}

export async function POST(req) {
  if (!isSuperAdminPasswordConfigured()) {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const ip = getIp(req);
  const rec = attempts.get(ip);
  if (rec?.lockedUntil && rec.lockedUntil > now()) {
    const retryAfterSeconds = Math.max(1, Math.ceil((rec.lockedUntil - now()) / 1000));
    return NextResponse.json({ ok: false, error: "locked", retryAfterSeconds }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (!verifySuperAdminPassword(password)) {
    const prevFails = rec?.fails || 0;
    const fails = prevFails + 1;
    const next = { fails, lockedUntil: null };
    if (fails >= MAX_FAILS) next.lockedUntil = now() + LOCKOUT_MS;
    attempts.set(ip, next);

    if (next.lockedUntil) {
      return NextResponse.json({ ok: false, error: "locked", retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) }, { status: 429 });
    }

    return NextResponse.json({ ok: false, error: "invalid", remaining: Math.max(0, MAX_FAILS - fails) }, { status: 401 });
  }

  // success: clear lockout
  attempts.delete(ip);

  const cookie = issueSuperAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

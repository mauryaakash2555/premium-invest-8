import { NextResponse } from "next/server";
import { getAdminEnvSafe } from "@/config/env";
import { issueAdminCookie } from "@/lib/adminSession";
import { isAdminPasswordConfigured, verifyAdminPassword } from "@/lib/auth/passwords";

export async function POST(req) {
  const env = getAdminEnvSafe();
  // setup_required if no admin password configured (hash preferred)
  if (!env || !isAdminPasswordConfigured()) {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookie = issueAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

import { NextResponse } from "next/server";
import { issueAdminCookie } from "@/lib/adminSession";
import { isSuperAdminPasswordConfigured, verifySuperAdminPassword } from "@/lib/auth/passwords";

export async function POST(req) {
  if (!isSuperAdminPasswordConfigured()) {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (!verifySuperAdminPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookie = issueAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

import { NextResponse } from "next/server";
import { getServerEnvSafe } from "@/lib/env";
import { issueAdminCookie } from "@/lib/adminSession";

export async function POST(req) {
  const env = getServerEnvSafe();
  if (!env?.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (password !== env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookie = issueAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}



import { NextResponse } from "next/server";
import { isFamilyAdminPasswordConfigured, verifyFamilyAdminPassword } from "@/lib/auth/passwords";
import { issueFamilyCookie } from "@/lib/familySession";

export async function POST(req) {
  if (!isFamilyAdminPasswordConfigured()) {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (!verifyFamilyAdminPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookie = issueFamilyCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

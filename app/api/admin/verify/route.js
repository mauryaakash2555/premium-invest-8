import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSuperAdminPayloadFromCookies, issueSuperAdminCookie } from "@/lib/adminSession";

export async function GET() {
  const cookieStore = await cookies();
  const payload = getSuperAdminPayloadFromCookies(cookieStore);
  if (!payload) return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });

  // Sliding expiration: refresh cookie on verify
  const cookie = issueSuperAdminCookie();
  const res = NextResponse.json({ ok: true, authenticated: true, role: "super" });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

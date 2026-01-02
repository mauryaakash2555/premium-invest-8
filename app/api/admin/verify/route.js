import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getSuperAdminPayloadFromRequest, issueSuperAdminCookie } from "@/lib/adminSession";

export async function GET() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const payload = getSuperAdminPayloadFromRequest(cookieStore, headerStore);
  if (!payload) return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });

  // Sliding expiration: refresh cookie on verify
  const cookie = issueSuperAdminCookie();
  const res = NextResponse.json({ ok: true, authenticated: true, role: "super" });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

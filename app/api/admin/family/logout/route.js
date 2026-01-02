import { NextResponse } from "next/server";

function shouldUseSecureCookies() {
  if (String(process.env.FORCE_SECURE_COOKIES || "").toLowerCase() === "true") return true;
  return String(process.env.VERCEL || "") === "1";
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bm_family", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 0,
  });
  return res;
}

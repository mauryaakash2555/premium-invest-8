import { NextResponse } from "next/server";
import { CONSTANTS } from "@/config/constants";

export async function POST() {
  const name = CONSTANTS?.ADMIN?.COOKIE_NAME || "bm_admin";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

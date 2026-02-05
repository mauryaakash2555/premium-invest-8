import { NextResponse } from "next/server";

export function GET(request) {
  const target = new URL("/contact", request.url);
  const res = NextResponse.redirect(target, 301);
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "public, max-age=86400");
  return res;
}

export function HEAD(request) {
  const target = new URL("/contact", request.url);
  const res = NextResponse.redirect(target, 301);
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "public, max-age=86400");
  return res;
}

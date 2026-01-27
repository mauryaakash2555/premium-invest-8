import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse("Gone", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    status: 410,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

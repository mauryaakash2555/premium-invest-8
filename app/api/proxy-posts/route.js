import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://bmwealth-backend.onrender.com";

function json(status, body) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req) {
  const pillar = req.nextUrl.searchParams.get("pillar") || "EDITORIAL";
  const status = req.nextUrl.searchParams.get("status") || "APPROVED";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const upstream = await fetch(
      `${BACKEND_URL}/api/posts?pillar=${encodeURIComponent(pillar)}&status=${encodeURIComponent(status)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeout));

    const contentType = upstream.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await upstream.json() : await upstream.text();

    if (!upstream.ok) {
      const detail =
        typeof data === "object" && data && "detail" in data
          ? data.detail
          : typeof data === "string" && data
            ? data
            : "Posts request failed";
      return json(upstream.status || 502, { success: false, detail });
    }

    return json(200, data);
  } catch (e) {
    const aborted = e && typeof e === "object" && "name" in e && e.name === "AbortError";
    return json(aborted ? 504 : 502, {
      success: false,
      detail: aborted ? "Upstream timeout" : "Upstream error",
    });
  }
}

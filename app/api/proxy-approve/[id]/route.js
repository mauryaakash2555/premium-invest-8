import { NextResponse } from "next/server";

function normalizeBackendOrigin(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const noTrailing = s.replace(/\/+$/, "");
  return noTrailing.endsWith("/api") ? noTrailing.slice(0, -4) : noTrailing;
}

function getBackendOrigin() {
  const candidates = [
    process.env.BACKEND_URL,
    process.env.NEXT_BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
  ];
  for (const c of candidates) {
    const origin = normalizeBackendOrigin(c);
    if (origin) return origin;
  }
  return "https://bmwealth-backend.onrender.com";
}

function json(status, body) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req, { params }) {
  const id = (await params)?.id;
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { success: false, detail: "Invalid JSON" });
  }

  try {
    const BACKEND_ORIGIN = getBackendOrigin();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstream = await fetch(`${BACKEND_ORIGIN}/api/approve/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const contentType = upstream.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await upstream.json() : await upstream.text();

    if (!upstream.ok) {
      const detail =
        typeof data === "object" && data && "detail" in data
          ? data.detail
          : typeof data === "string" && data
            ? data
            : "Approve failed";
      return json(upstream.status || 502, { success: false, detail });
    }

    return json(200, typeof data === "object" && data ? { ...data, success: true } : { success: true });
  } catch (e) {
    const aborted = e && typeof e === "object" && "name" in e && e.name === "AbortError";
    return json(aborted ? 504 : 502, {
      success: false,
      detail: aborted ? "Upstream timeout" : "Upstream error",
    });
  }
}

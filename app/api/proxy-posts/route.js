import { NextResponse } from "next/server";
import { getLocalCommunityPosts } from "@/lib/blog/localCommunityPosts";
import { listApprovedCommunitySubmissions } from '@/lib/blog/communitySubmissions';

function normalizeBackendOrigin(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const noTrailing = s.replace(/\/+$/, "");
  // Allow env values to be either origin (https://host) OR include /api.
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

function normalizePillar(value) {
  return String(value || "EDITORIAL").trim().toUpperCase();
}

function normalizeStatus(value) {
  return String(value || "APPROVED").trim().toUpperCase();
}

function mergeUniqueById(primary, secondary) {
  const a = Array.isArray(primary) ? primary : [];
  const b = Array.isArray(secondary) ? secondary : [];
  const seen = new Set(a.map((p) => String(p?._id || "")).filter(Boolean));
  const out = [...a];
  for (const p of b) {
    const id = String(p?._id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(p);
  }
  return out;
}

export async function GET(req) {
  const pillar = normalizePillar(req.nextUrl.searchParams.get("pillar") || "EDITORIAL");
  const status = normalizeStatus(req.nextUrl.searchParams.get("status") || "APPROVED");

  const hostname = String(req?.nextUrl?.hostname || '').toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  const localAll = await getLocalCommunityPosts({ includeContent: false }).catch(() => []);
  const local = (Array.isArray(localAll) ? localAll : []).filter(
    (p) => normalizePillar(p?.pillar) === pillar && normalizeStatus(p?.status) === status
  );

  const submissions = await listApprovedCommunitySubmissions({ pillar, status, limit: 120 }).catch(() => []);
  const localPlus = submissions.length ? mergeUniqueById(local, submissions) : local;

  // Local dev: never wait on upstream (it can be slow/unreachable and makes the page feel broken).
  if (isLocalhost) return json(200, localPlus);

  try {
    const BACKEND_ORIGIN = getBackendOrigin();
    const controller = new AbortController();
    // If we already have local curated posts, keep the page snappy.
    // Upstream is best-effort and should not block rendering.
    const timeoutMs = local.length ? 1800 : 8000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const upstream = await fetch(
      `${BACKEND_ORIGIN}/api/posts?pillar=${encodeURIComponent(pillar)}&status=${encodeURIComponent(status)}`,
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
      // Fall back to local curated posts if upstream is down.
      if (localPlus.length) return json(200, localPlus);
      return json(upstream.status || 502, { success: false, detail });
    }

    // Merge local curated posts with upstream list (avoid duplicates by _id)
    const upstreamList = Array.isArray(data) ? data : [];
    if (upstreamList.length) return json(200, mergeUniqueById(upstreamList, localPlus));
    return json(200, localPlus);
  } catch (e) {
    const aborted = e && typeof e === "object" && "name" in e && e.name === "AbortError";
    if (localPlus.length) return json(200, localPlus);
    return json(aborted ? 504 : 502, {
      success: false,
      detail: aborted ? "Upstream timeout" : "Upstream error",
    });
  }
}

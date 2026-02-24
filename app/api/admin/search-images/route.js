/**
 * Admin API: Search Unsplash for free images.
 * Uses the same Unsplash pattern as blog-images API.
 */

import { NextResponse } from "next/server";
import { isAdminFromRequest } from "@/lib/adminSession";
import { cookies, headers } from "next/headers";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "";

function json(status, body) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return json(401, { ok: false });
  }

  const { searchParams } = new URL(req.url);
  const query = String(searchParams.get("q") || "").trim();
  if (!query) {
    return json(400, { ok: false, error: "Missing query" });
  }

  if (!UNSPLASH_ACCESS_KEY) {
    // Return placeholder results from Lorem Picsum
    const results = Array.from({ length: 12 }, (_, i) => ({
      id: `picsum-${i}`,
      url: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/800/500`,
      thumb: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/200/125`,
      alt: `${query} image ${i + 1}`,
      credit: "Lorem Picsum",
      source: "picsum",
    }));
    return json(200, { ok: true, results, source: "picsum" });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      }
    );
    if (!res.ok) throw new Error(`Unsplash ${res.status}`);
    const data = await res.json();

    const results = (data.results || []).map((r) => ({
      id: r.id,
      url: `${r.urls?.regular || r.urls?.small}&w=1200&h=675&fit=crop&auto=format&q=80`,
      thumb: r.urls?.thumb || r.urls?.small,
      alt: r.alt_description || r.description || query,
      credit: r.user?.name || "Unsplash",
      creditLink: r.user?.links?.html || "https://unsplash.com",
      source: "unsplash",
    }));

    return json(200, { ok: true, results, source: "unsplash" });
  } catch (e) {
    return json(502, { ok: false, error: e?.message });
  }
}

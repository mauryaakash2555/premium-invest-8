import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function pct(n) {
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function pick(items, id) {
  if (!Array.isArray(items)) return null;
  return items.find((x) => x && x.id === id) || null;
}

function computeCrisisSignal(marketPayload) {
  const items = marketPayload?.items;
  const nifty = pick(items, "NIFTY50");
  const sensex = pick(items, "SENSEX");

  const niftyPct = pct(nifty?.changePct);
  const sensexPct = pct(sensex?.changePct);

  const worstPct = [niftyPct, sensexPct].filter((x) => typeof x === "number");
  const minPct = worstPct.length ? Math.min(...worstPct) : null;

  // Threshold: -1.25% or worse is a meaningful down day for a banner.
  const threshold = -1.25;
  const active = typeof minPct === "number" ? minPct <= threshold : false;

  const headline = active
    ? "Markets are down today — see what history rewards"
    : "";

  const detail = active
    ? "Simulate discipline vs panic selling in 2 minutes (education-only)."
    : "";

  return {
    ok: true,
    active,
    thresholdPct: threshold,
    asOf: marketPayload?.asOf || null,
    source: marketPayload?.source || null,
    indices: {
      nifty50: niftyPct,
      sensex: sensexPct,
    },
    minPct,
    headline,
    detail,
    cta: {
      label: "Run SIP vs Panic",
      href: "/intelligence/sip-vs-panic",
    },
  };
}

export async function GET(req) {
  try {
    const url = req?.url ? new URL(req.url) : null;
    const bypass = url?.searchParams?.get("nocache") === "1";

    const baseUrl = req?.nextUrl?.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in";
    const res = await fetch(`${baseUrl}/api/market-data${bypass ? "?nocache=1" : ""}` , {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, active: false, error: `market-data ${res.status}` }, { status: 200 });
    }

    const payload = await res.json();
    const out = computeCrisisSignal(payload);

    const response = NextResponse.json(out);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (e) {
    return NextResponse.json({ ok: false, active: false, error: String(e?.message || e) }, { status: 200 });
  }
}

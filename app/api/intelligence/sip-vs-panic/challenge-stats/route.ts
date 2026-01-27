import { NextResponse } from "next/server";

import { listEvents } from "@/lib/db/events";

export const runtime = "nodejs";
export const revalidate = 300;

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n * 1000) / d) / 10;
}

function safeBool(v: any): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

export async function GET() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [openEvents, completeEvents] = await Promise.all([
      listEvents({
        sinceIso: since.toISOString(),
        eventType: "sip_vs_panic_challenge_opened",
        limit: 5000,
        newestFirst: true,
      }),
      listEvents({
        sinceIso: since.toISOString(),
        eventType: "sip_vs_panic_story_completed",
        limit: 5000,
        newestFirst: true,
      }),
    ]);

    const opens = (openEvents || []).length;

    const completes = (completeEvents || [])
      .map((e) => (e as any)?.data ?? {})
      .filter(Boolean)
      .filter((d) => safeBool((d as any)?.is_challenge_response)).length;

    return NextResponse.json({
      ok: true,
      windowDays: 30,
      opens,
      completes,
      completionPct: pct(completes, opens),
    });
  } catch {
    // Strict: no fake stats.
    return NextResponse.json({
      ok: true,
      windowDays: 30,
      opens: 0,
      completes: 0,
      completionPct: 0,
    });
  }
}

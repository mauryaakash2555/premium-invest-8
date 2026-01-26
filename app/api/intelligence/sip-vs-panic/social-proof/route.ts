import { NextResponse } from "next/server";

import { listEvents } from "@/lib/db/events";

export const runtime = "nodejs";
export const revalidate = 300;

const ALLOWED_KEYS = new Set(["discipline", "panic20", "panic40", "stopAnyFall", "custom"]);

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n * 1000) / d) / 10;
}

function safeNum(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const events = await listEvents({
      sinceIso: since.toISOString(),
      eventType: "sip_panic_simulation_completed",
      limit: 5000,
      newestFirst: true,
    });

    // Only count events with a valid scenario_key.
    const validEvents = events.filter((e) => {
      const key = String((e as any)?.data?.scenario_key ?? "");
      return ALLOWED_KEYS.has(key);
    });

    const total = validEvents.length;
    if (!total) {
      return NextResponse.json({
        ok: true,
        windowDays: 30,
        total: 0,
        panic20OrEarlierPct: 0,
        disciplinePct: 0,
        avgBehavioralCost: 0,
      });
    }

    let panic20OrEarlier = 0;
    let discipline = 0;
    let costSum = 0;
    let costCount = 0;

    for (const e of validEvents) {
      const data = e?.data ?? {};
      const key = String(data?.scenario_key ?? "");
      const th = typeof data?.panic_threshold_pct === "number" ? data.panic_threshold_pct : null;
      const cost = safeNum(data?.behavioral_cost);

      if (key === "discipline") discipline += 1;

      // Count users who choose to panic at 20% or earlier.
      // - panic20 scenario
      // - custom threshold <= 20
      if (key === "panic20") panic20OrEarlier += 1;
      if (key === "custom" && th !== null && th <= 20) panic20OrEarlier += 1;
      if (key === "stopAnyFall") panic20OrEarlier += 1;

      if (cost > 0) {
        costSum += cost;
        costCount += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      windowDays: 30,
      total,
      panic20OrEarlierPct: pct(panic20OrEarlier, total),
      disciplinePct: pct(discipline, total),
      avgBehavioralCost: costCount ? Math.round(costSum / costCount) : 0,
    });
  } catch {
    // If DB isn't configured, return a stable fallback (no social proof rather than errors).
    return NextResponse.json({
      ok: true,
      windowDays: 30,
      total: 0,
      panic20OrEarlierPct: 0,
      disciplinePct: 0,
      avgBehavioralCost: 0,
    });
  }
}

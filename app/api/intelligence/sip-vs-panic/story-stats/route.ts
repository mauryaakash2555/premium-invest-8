import { NextResponse } from "next/server";

import { listEvents } from "@/lib/db/events";

export const runtime = "nodejs";
export const revalidate = 300;

type StoryChoice = "continue" | "stop" | "pause_6" | "pause_12";

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n * 1000) / d) / 10;
}

function safeChoice(v: any): StoryChoice | null {
  const s = String(v ?? "").trim();
  if (s === "continue" || s === "stop" || s === "pause_6" || s === "pause_12") return s;
  return null;
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
      eventType: "sip_vs_panic_story_completed",
      limit: 5000,
      newestFirst: true,
    });

    const rows = (events || []).map((e) => (e as any)?.data ?? {}).filter(Boolean);

    const total = rows.length;
    if (!total) {
      return NextResponse.json({
        ok: true,
        windowDays: 30,
        total: 0,
        choices: {
          continuePct: 0,
          stopPct: 0,
          pause6Pct: 0,
          pause12Pct: 0,
        },
        avgBehavioralCost: 0,
        avgCostByChoice: {
          continue: 0,
          stop: 0,
          pause_6: 0,
          pause_12: 0,
        },
      });
    }

    const counts: Record<StoryChoice, number> = {
      continue: 0,
      stop: 0,
      pause_6: 0,
      pause_12: 0,
    };

    const costSum: Record<StoryChoice, number> = {
      continue: 0,
      stop: 0,
      pause_6: 0,
      pause_12: 0,
    };

    const costCount: Record<StoryChoice, number> = {
      continue: 0,
      stop: 0,
      pause_6: 0,
      pause_12: 0,
    };

    let overallCostSum = 0;
    let overallCostCount = 0;

    for (const r of rows) {
      const choice = safeChoice(r?.story_choice);
      if (!choice) continue;
      counts[choice] += 1;

      const cost = Math.max(0, safeNum(r?.behavioral_cost));
      if (cost > 0) {
        costSum[choice] += cost;
        costCount[choice] += 1;
        overallCostSum += cost;
        overallCostCount += 1;
      }
    }

    const avg = (c: StoryChoice) => (costCount[c] ? Math.round(costSum[c] / costCount[c]) : 0);

    return NextResponse.json({
      ok: true,
      windowDays: 30,
      total,
      choices: {
        continuePct: pct(counts.continue, total),
        stopPct: pct(counts.stop, total),
        pause6Pct: pct(counts.pause_6, total),
        pause12Pct: pct(counts.pause_12, total),
      },
      avgBehavioralCost: overallCostCount ? Math.round(overallCostSum / overallCostCount) : 0,
      avgCostByChoice: {
        continue: avg("continue"),
        stop: avg("stop"),
        pause_6: avg("pause_6"),
        pause_12: avg("pause_12"),
      },
    });
  } catch {
    // Strict: no fake stats.
    return NextResponse.json({
      ok: true,
      windowDays: 30,
      total: 0,
      choices: {
        continuePct: 0,
        stopPct: 0,
        pause6Pct: 0,
        pause12Pct: 0,
      },
      avgBehavioralCost: 0,
      avgCostByChoice: {
        continue: 0,
        stop: 0,
        pause_6: 0,
        pause_12: 0,
      },
    });
  }
}

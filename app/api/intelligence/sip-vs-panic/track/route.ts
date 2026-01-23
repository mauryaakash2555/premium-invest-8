import { NextResponse } from "next/server";

import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

const ALLOWED_KEYS = new Set(["discipline", "panic20", "panic40", "stopAnyFall", "custom"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const rawKey = String(body?.scenario_key ?? "");
    const scenario_key = ALLOWED_KEYS.has(rawKey) ? rawKey : null;

    const payload = {
      scenario_key,
      panic_threshold_pct: typeof body?.panic_threshold_pct === "number" ? body.panic_threshold_pct : null,
      behavioral_cost: typeof body?.behavioral_cost === "number" ? body.behavioral_cost : null,
      monthly_amount: typeof body?.monthly_amount === "number" ? body.monthly_amount : null,
      duration_years: typeof body?.duration_years === "number" ? body.duration_years : null,
      tax_profile: String(body?.tax_profile ?? ""),
      risk_comfort: String(body?.risk_comfort ?? ""),
      crash_preset: String(body?.crash_preset ?? ""),
      embed: Boolean(body?.embed ?? false),
      partner: String(body?.partner ?? ""),
      ts: new Date().toISOString(),
    };

    // Best-effort anonymous tracking (no lead_id).
    await logEventSafe({ leadId: null, event_type: "sip_panic_simulation_completed", data: payload });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  leadId: z.string().uuid(),
  event_type: z.string().min(1).max(120),
  data: z.any().optional(),
});

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const { leadId, event_type, data } = parsed.data;
  const { error } = await sb.from("events").insert({
    lead_id: leadId,
    event_type,
    data: data ?? null,
  });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}



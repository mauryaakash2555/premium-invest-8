import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  amount: z.number().finite().positive().max(1_000_000_000_000),
  currency: z.string().max(8).optional(),
  source: z.enum(["Affiliate", "Lead Sale", "Product", "Other"]).optional(),
  note: z.string().max(240).optional(),
  leadId: z.string().uuid().optional(),
});

export async function POST(req) {
  const cookieStore = await cookies();
  if (!isAdminFromCookies(cookieStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  // Accept "15000" or "15,000" (string/number) safely
  const rawAmount = String(body?.amount ?? "").trim();
  const cleaned = rawAmount.replace(/[,\s]/g, "");
  const amount = Number(cleaned);

  const parsed = schema.safeParse({
    amount,
    currency: body?.currency,
    source: body?.source,
    note: body?.note,
    leadId: body?.leadId,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const { amount: a, currency, source, note, leadId } = parsed.data;
  const { error } = await sb.from("events").insert({
    lead_id: leadId ?? null,
    event_type: "revenue",
    data: {
      amount: a,
      currency: currency || "INR",
      note: note || null,
      source: source || "Other",
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "supabase_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}



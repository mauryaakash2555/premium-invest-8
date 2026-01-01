import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  clickId: z.string().uuid(),
  amount: z.number().finite().nonnegative().optional(),
});

export async function POST(req) {
  const cookieStore = await cookies();
  if (!isAdminFromCookies(cookieStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const { clickId, amount } = parsed.data;

  const { error } = await sb
    .from("affiliate_clicks")
    .update({
      converted: true,
      conversion_amount: typeof amount === "number" ? amount : null,
      converted_at: new Date().toISOString(),
    })
    .eq("id", clickId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message || "Supabase error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

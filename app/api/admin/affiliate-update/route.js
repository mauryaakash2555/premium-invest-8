import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z
  .object({
    id: z.string().uuid().optional(),
    platform: z.string().min(1).max(80).optional(),
    affiliate_url: z.string().url().optional(),
    category: z.string().max(40).optional(),
    commission_rate: z.number().finite().nonnegative().optional(),
    commission_type: z.string().max(40).optional(),
    is_active: z.boolean().optional(),
    placeholder: z.boolean().optional(),
  })
  .refine((v) => Boolean(v.id || v.platform), { message: "id_or_platform_required" });

export async function POST(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
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

  const patch = {};
  if (typeof parsed.data.affiliate_url === "string") patch.affiliate_url = parsed.data.affiliate_url;
  if (typeof parsed.data.category === "string") patch.category = parsed.data.category;
  if (typeof parsed.data.commission_rate === "number") patch.commission_rate = parsed.data.commission_rate;
  if (typeof parsed.data.commission_type === "string") patch.commission_type = parsed.data.commission_type;
  if (typeof parsed.data.is_active === "boolean") patch.is_active = parsed.data.is_active;
  if (typeof parsed.data.placeholder === "boolean") patch.placeholder = parsed.data.placeholder;

  if (!Object.keys(patch).length) {
    return NextResponse.json({ ok: false, error: "no_changes" }, { status: 400 });
  }

  let q = sb.from("affiliate_links").update(patch);

  if (parsed.data.id) {
    q = q.eq("id", parsed.data.id);
  } else {
    q = q.ilike("platform", parsed.data.platform);
  }

  const { data, error } = await q.select("*").maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message || "Supabase error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, affiliate: data || null });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { EmailPreferencesDB } from "@/lib/db/emailPreferences";
import { EmailService } from "@/lib/email/emailService";

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

  const convertedAt = new Date().toISOString();
  const { error } = await sb
    .from("affiliate_clicks")
    .update({
      converted: true,
      conversion_amount: typeof amount === "number" ? amount : null,
      converted_at: convertedAt,
    })
    .eq("id", clickId);

  if (error) {
    // Best-effort error email
    const prefs = await EmailPreferencesDB.getSafe();
    if (prefs.error_alerts) {
      await EmailService.sendErrorAlert({
        to: prefs.email_address,
        err: { message: error.message || "affiliate_convert_failed", location: "admin/affiliate-convert", stack: String(error?.stack || "") },
      });
    }
    return NextResponse.json({ ok: false, error: error.message || "Supabase error" }, { status: 500 });
  }

  // Best-effort conversion alert email
  const prefs = await EmailPreferencesDB.getSafe();
  if (prefs.conversion_alerts) {
    try {
      const clickRes = await sb
        .from("affiliate_clicks")
        .select("platform,lead_id,conversion_amount,converted_at")
        .eq("id", clickId)
        .maybeSingle();
      const leadId = clickRes?.data?.lead_id;
      const leadName = leadId
        ? (
            await sb
              .from("leads")
              .select("name")
              .eq("id", leadId)
              .maybeSingle()
          )?.data?.name
        : null;

      await EmailService.sendConversionAlert({
        to: prefs.email_address,
        conversion: {
          platform: clickRes?.data?.platform || null,
          leadName: leadName || null,
          amount: typeof amount === "number" ? amount : clickRes?.data?.conversion_amount,
          converted_at: clickRes?.data?.converted_at || convertedAt,
        },
      });
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ ok: true });
}

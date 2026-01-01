import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function startOfDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function safeNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function computeEarning({ click, link }) {
  if (!click?.converted) return 0;
  const rate = safeNumber(link?.commission_rate);
  const type = String(link?.commission_type || "");
  const amt = click?.conversion_amount;

  if (type === "percentage") {
    const base = safeNumber(amt);
    return base > 0 && rate > 0 ? (base * rate) / 100 : 0;
  }

  // per_signup / per_policy / fixed -> rate as flat payout
  return rate > 0 ? rate : 0;
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isAdminFromCookies(cookieStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const dayStart = startOfDayISO();

  const [linksRes, clicksRes, clicksTodayRes, pendingRes] = await Promise.all([
    sb
      .from("affiliate_links")
      .select("id,platform,category,affiliate_url,commission_rate,commission_type,is_active,placeholder,created_at")
      .order("platform", { ascending: true })
      .limit(500),

    sb
      .from("affiliate_clicks")
      .select("id,affiliate_id,lead_id,platform,clicked_at,converted,conversion_amount,converted_at")
      .order("clicked_at", { ascending: false })
      .limit(10000),

    sb
      .from("affiliate_clicks")
      .select("id,affiliate_id,lead_id,platform,clicked_at,converted,conversion_amount,converted_at")
      .gte("clicked_at", dayStart)
      .order("clicked_at", { ascending: false })
      .limit(5000),

    sb
      .from("affiliate_clicks")
      .select("id,lead_id,platform,clicked_at")
      .eq("converted", false)
      .is("converted_at", null)
      .order("clicked_at", { ascending: false })
      .limit(80),
  ]);

  if (linksRes.error || clicksRes.error || clicksTodayRes.error || pendingRes.error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          linksRes.error?.message ||
          clicksRes.error?.message ||
          clicksTodayRes.error?.message ||
          pendingRes.error?.message ||
          "Supabase error",
      },
      { status: 500 }
    );
  }

  const links = linksRes.data || [];
  const clicks = clicksRes.data || [];
  const clicksToday = clicksTodayRes.data || [];

  const linkById = new Map(links.map((l) => [l.id, l]));

  // Overall stats
  const totalClicks = clicks.length;
  const clicksTodayCount = clicksToday.length;
  const conversions = clicks.reduce((sum, c) => sum + (c.converted ? 1 : 0), 0);
  const conversionRate = totalClicks ? Math.round((conversions / totalClicks) * 1000) / 10 : 0;

  const earnings = clicks.reduce((sum, c) => {
    const link = c.affiliate_id ? linkById.get(c.affiliate_id) : null;
    return sum + computeEarning({ click: c, link });
  }, 0);

  const earningsToday = clicksToday.reduce((sum, c) => {
    const link = c.affiliate_id ? linkById.get(c.affiliate_id) : null;
    return sum + computeEarning({ click: c, link });
  }, 0);

  // Per-platform stats
  const byPlatform = new Map();
  for (const link of links) {
    byPlatform.set(link.platform, {
      id: link.id,
      platform: link.platform,
      category: link.category || null,
      affiliate_url: link.affiliate_url || null,
      is_active: Boolean(link.is_active),
      placeholder: Boolean(link.placeholder),
      commission_rate: link.commission_rate ?? null,
      commission_type: link.commission_type ?? null,
      clicks: 0,
      conversions: 0,
      earnings: 0,
    });
  }

  for (const c of clicks) {
    const key = c.platform || (c.affiliate_id ? linkById.get(c.affiliate_id)?.platform : null);
    if (!key) continue;
    if (!byPlatform.has(key)) {
      byPlatform.set(key, {
        id: c.affiliate_id || null,
        platform: key,
        category: null,
        affiliate_url: null,
        is_active: true,
        placeholder: true,
        commission_rate: null,
        commission_type: null,
        clicks: 0,
        conversions: 0,
        earnings: 0,
      });
    }
    const row = byPlatform.get(key);
    row.clicks += 1;
    if (c.converted) {
      row.conversions += 1;
      const link = c.affiliate_id ? linkById.get(c.affiliate_id) : null;
      row.earnings += computeEarning({ click: c, link });
    }
  }

  const platforms = Array.from(byPlatform.values()).map((p) => {
    const rate = p.clicks ? Math.round((p.conversions / p.clicks) * 1000) / 10 : 0;
    return { ...p, conversion_rate: rate };
  });

  // Pending conversions (with lead names)
  const pending = pendingRes.data || [];
  const leadIds = Array.from(new Set(pending.map((p) => p.lead_id).filter(Boolean)));
  let leadsById = new Map();
  if (leadIds.length) {
    const leadsRes = await sb.from("leads").select("id,name").in("id", leadIds).limit(200);
    if (!leadsRes.error) {
      leadsById = new Map((leadsRes.data || []).map((l) => [l.id, l]));
    }
  }

  const pendingClicks = pending.map((c) => ({
    id: c.id,
    platform: c.platform,
    clicked_at: c.clicked_at,
    lead_id: c.lead_id || null,
    lead_name: c.lead_id ? leadsById.get(c.lead_id)?.name || null : null,
  }));

  return NextResponse.json({
    ok: true,
    totalClicks,
    clicksToday: clicksTodayCount,
    conversions,
    conversionRate,
    earnings: Math.round(earnings),
    earningsToday: Math.round(earningsToday),
    platforms,
    pendingClicks,
  });
}

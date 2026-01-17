import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isFeatureEnabled } from "@/config/features";

export const dynamic = "force-dynamic";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function safeStr(v) {
  return String(v ?? "").trim();
}

function bump(map, key, inc = 1) {
  const k = safeStr(key) || "(none)";
  map[k] = (map[k] || 0) + inc;
}

function uniqCount(arr) {
  return new Set((arr || []).filter(Boolean).map((s) => String(s).trim().toLowerCase())).size;
}

export async function GET(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!isFeatureEnabled("ANALYTICS")) {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 404 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") || 30)));

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - days);

  // Pull recent events (bounded). We'll filter in JS to stay schema-agnostic.
  const { data, error } = await sb
    .from("events")
    .select("id,event_type,created_at,data,lead_id")
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ ok: false, error: String(error.message || "query_failed") }, { status: 502 });
  }

  const events = (data || []).filter((e) => {
    const d = e?.data;
    return d && typeof d === "object" && d.calculator_type === "aio";
  });

  const byCampaign = {};
  const byContent = {};
  const byCalc = {};
  const byMethod = {};

  let opens = 0;
  let calculates = 0;
  let shares = 0;
  let emailSubmit = 0;
  let emailSent = 0;
  let emailFailed = 0;
  let leads = 0;

  const capturedEmails = [];

  for (const e of events) {
    const type = safeStr(e?.event_type);
    const d = e?.data && typeof e.data === "object" ? e.data : {};

    const campaign = d?.utm_campaign || d?.utm?.utm_campaign || null;
    const content = d?.utm_content || d?.utm?.utm_content || null;
    const calc = d?.calc || null;
    const method = d?.method || null;

    if (campaign) bump(byCampaign, campaign);
    if (content) bump(byContent, content);
    if (calc) bump(byCalc, calc);
    if (method) bump(byMethod, method);

    if (type === "calculator_open") opens += 1;
    if (type === "calculator_calculate") calculates += 1;
    if (type === "calculator_share") shares += 1;
    if (type === "calculator_email_submit") emailSubmit += 1;
    if (type === "calculator_email_sent") emailSent += 1;
    if (type === "calculator_email_failed") emailFailed += 1;
    if (type === "lead_captured") {
      leads += 1;
      if (d?.email) {
        capturedEmails.push(d.email);
      }
    }
  }

  const sortPairs = (obj) =>
    Object.entries(obj || {})
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 12)
      .map(([k, v]) => ({ key: k, count: v }));

  // Recent captured emails (from events, not leads table)
  const recentCaptures = events
    .filter((e) => e?.event_type === "lead_captured")
    .slice(0, 60)
    .map((e) => ({
      at: e?.created_at || null,
      leadId: e?.lead_id || null,
      calc: e?.data?.calc || null,
      email: e?.data?.email || null,
      phone: e?.data?.phone || null,
      utm: {
        utm_campaign: e?.data?.utm_campaign || e?.data?.utm?.utm_campaign || null,
        utm_source: e?.data?.utm_source || e?.data?.utm?.utm_source || null,
        utm_medium: e?.data?.utm_medium || e?.data?.utm?.utm_medium || null,
        utm_content: e?.data?.utm_content || e?.data?.utm?.utm_content || null,
      },
    }));

  return NextResponse.json({
    ok: true,
    windowDays: days,
    from: from.toISOString(),
    to: now.toISOString(),
    totals: {
      opens,
      calculates,
      shares,
      email_submit: emailSubmit,
      email_sent: emailSent,
      email_failed: emailFailed,
      leads,
      unique_emails: uniqCount(capturedEmails),
    },
    top: {
      campaigns: sortPairs(byCampaign),
      contents: sortPairs(byContent),
      calcs: sortPairs(byCalc),
      methods: sortPairs(byMethod),
    },
    recentCaptures,
  });
}

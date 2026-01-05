import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isFeatureEnabled } from "@/config/features";

const IST_OFFSET_MS = 330 * 60 * 1000;

function startOfDayIST(d) {
  const t = new Date(d).getTime();
  const ist = new Date(t + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

function istDateKey(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function clampInt(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.round(x)));
}

function median(nums) {
  const arr = (nums || []).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!arr.length) return 0;
  const mid = Math.floor(arr.length / 2);
  if (arr.length % 2 === 1) return arr[mid];
  return Math.round(((arr[mid - 1] + arr[mid]) / 2) * 10) / 10;
}

function pct(n, d) {
  const num = Number(n) || 0;
  const den = Number(d) || 0;
  if (den <= 0) return 0;
  return Math.round((num / den) * 1000) / 10;
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
  const days = clampInt(url.searchParams.get("days"), 1, 30);

  const now = new Date();
  const from = startOfDayIST(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
  const fromIso = from.toISOString();

  const eventTypes = [
    "property_vs_sip_email_sent",
    "property_vs_sip_paid_email_sent",
    "email_open",
    "email_click",
    "whatsapp_followup_scheduled",
    "whatsapp_followup_sent",
    "whatsapp_followup_skipped",
    "whatsapp_followup_failed",
    "whatsapp_reply_received",
    "calculator_calculate",
    "premium_click",
    "payment_start",
    "payment_success",
    "payment_failed",
    "purchase",
    "revenue",
    "revenue_manual",
  ];

  const { data: events, error: evErr } = await sb
    .from("events")
    .select("id,event_type,created_at,data,lead_id")
    .gte("created_at", fromIso)
    .in("event_type", eventTypes)
    .order("created_at", { ascending: true })
    .limit(10000);
  if (evErr) return NextResponse.json({ ok: false, error: evErr.message }, { status: 500 });

  const rows = events || [];

  const perDay = new Map();
  function dayBucket(key) {
    if (!perDay.has(key)) {
      perDay.set(key, {
        date_ist: key,
        email_sent: 0,
        email_open_unique: 0,
        email_click_unique: 0,
        whatsapp_sent_step1: 0,
        whatsapp_sent_step2: 0,
        whatsapp_sent_step3: 0,
        whatsapp_replies_unique: 0,
        calculator_calculations: 0,
        premium_clicks: 0,
        purchases: 0,
        revenue_inr: 0,
      });
    }
    return perDay.get(key);
  }

  // Build quick lookup structures.
  const emailSentByMessage = new Map(); // messageId -> { leadId, at }
  const emailSentByLead = new Map(); // leadId -> earliestSentAt
  const emailOpenByMessage = new Set();
  const emailClickByMessage = new Set();

  const waFirstSentAtByPhoneStep = new Map(); // phone|step -> earliest
  const waReplyAtByPhone = new Map(); // phone -> earliest reply at

  for (const e of rows) {
    const day = istDateKey(e.created_at) || "";
    if (!day) continue;
    const b = dayBucket(day);

    if (e.event_type === "property_vs_sip_email_sent") {
      const messageId = e?.data?.messageId ? String(e.data.messageId) : "";
      if (messageId && !emailSentByMessage.has(messageId)) {
        emailSentByMessage.set(messageId, { leadId: e.lead_id || null, at: e.created_at });
        b.email_sent += 1;
      }
      const lid = e.lead_id;
      if (lid && !emailSentByLead.has(lid)) emailSentByLead.set(lid, e.created_at);
    }

    if (e.event_type === "email_open") {
      const messageId = e?.data?.messageId ? String(e.data.messageId) : "";
      if (messageId) emailOpenByMessage.add(messageId);
    }

    if (e.event_type === "email_click") {
      const messageId = e?.data?.messageId ? String(e.data.messageId) : "";
      if (messageId) emailClickByMessage.add(messageId);
    }

    if (e.event_type === "whatsapp_followup_sent") {
      const phone = e?.data?.phone ? String(e.data.phone) : "";
      const step = Number(e?.data?.step);
      if (phone && Number.isFinite(step)) {
        const k = `${phone}|${step}`;
        if (!waFirstSentAtByPhoneStep.has(k)) waFirstSentAtByPhoneStep.set(k, e.created_at);
        if (step === 1) b.whatsapp_sent_step1 += 1;
        if (step === 2) b.whatsapp_sent_step2 += 1;
        if (step === 3) b.whatsapp_sent_step3 += 1;
      }
    }

    if (e.event_type === "whatsapp_reply_received") {
      const phone = e?.data?.phone ? String(e.data.phone) : "";
      if (phone && !waReplyAtByPhone.has(phone)) {
        waReplyAtByPhone.set(phone, e.created_at);
      }
    }

    if (e.event_type === "calculator_calculate") {
      if (String(e?.data?.calculator_type || "") === "property_vs_sip") b.calculator_calculations += 1;
    }

    if (e.event_type === "premium_click") {
      if (String(e?.data?.calculator_type || "") === "property_vs_sip") b.premium_clicks += 1;
    }

    if (e.event_type === "revenue" || e.event_type === "revenue_manual") {
      const amount = Number(e?.data?.amount);
      if (Number.isFinite(amount)) b.revenue_inr += amount;
      if (String(e?.data?.product || "") === "property_vs_sip_pdf") b.purchases += 1;
    }
  }

  // Fill per-day unique open/click/replies.
  for (const [messageId] of emailSentByMessage) {
    const sent = emailSentByMessage.get(messageId);
    const day = istDateKey(sent?.at);
    if (!day) continue;
    const b = dayBucket(day);
    if (emailOpenByMessage.has(messageId)) b.email_open_unique += 1;
    if (emailClickByMessage.has(messageId)) b.email_click_unique += 1;
  }

  for (const [phone, replyAt] of waReplyAtByPhone) {
    const day = istDateKey(replyAt);
    if (!day) continue;
    const b = dayBucket(day);
    b.whatsapp_replies_unique += 1;
  }

  // Time-to-purchase from email (lead-based): first email_sent -> first property_vs_sip revenue
  const revenueByLeadFirstAt = new Map();
  for (const e of rows) {
    if (e.event_type !== "revenue" && e.event_type !== "revenue_manual") continue;
    if (String(e?.data?.product || "") !== "property_vs_sip_pdf") continue;
    const lid = e.lead_id;
    if (!lid) continue;
    if (!revenueByLeadFirstAt.has(lid)) revenueByLeadFirstAt.set(lid, e.created_at);
  }

  const minutesToPurchase = [];
  for (const [lid, sentAt] of emailSentByLead.entries()) {
    const boughtAt = revenueByLeadFirstAt.get(lid);
    if (!boughtAt) continue;
    const t0 = new Date(sentAt).getTime();
    const t1 = new Date(boughtAt).getTime();
    if (Number.isNaN(t0) || Number.isNaN(t1) || t1 < t0) continue;
    minutesToPurchase.push(Math.round(((t1 - t0) / 60000) * 10) / 10);
  }

  // WhatsApp response rates per step (reply within 24h of that followup)
  const respondedByStep = { 1: new Set(), 2: new Set(), 3: new Set() };
  for (const [k, sentAt] of waFirstSentAtByPhoneStep.entries()) {
    const [phone, stepStr] = k.split("|");
    const step = Number(stepStr);
    const replyAt = waReplyAtByPhone.get(phone);
    if (!replyAt) continue;

    const t0 = new Date(sentAt).getTime();
    const t1 = new Date(replyAt).getTime();
    if (Number.isNaN(t0) || Number.isNaN(t1) || t1 < t0) continue;

    if (t1 <= t0 + 24 * 60 * 60 * 1000) {
      if (step === 1) respondedByStep[1].add(phone);
      if (step === 2) respondedByStep[2].add(phone);
      if (step === 3) respondedByStep[3].add(phone);
    }
  }

  const daily = Array.from(perDay.values()).sort((a, b) => (a.date_ist < b.date_ist ? -1 : 1));
  const todayKey = istDateKey(now.toISOString());
  const today = perDay.get(todayKey) || dayBucket(todayKey);

  const responseRates = {
    step1: pct(respondedByStep[1].size, today.whatsapp_sent_step1),
    step2: pct(respondedByStep[2].size, today.whatsapp_sent_step2),
    step3: pct(respondedByStep[3].size, today.whatsapp_sent_step3),
  };

  return NextResponse.json({
    ok: true,
    asOf: now.toISOString(),
    tz: "IST",
    from: fromIso,
    days,
    today: {
      email: {
        sent: today.email_sent,
        opened_unique: today.email_open_unique,
        clicked_unique: today.email_click_unique,
        open_rate_pct: pct(today.email_open_unique, today.email_sent),
        ctr_sent_pct: pct(today.email_click_unique, today.email_sent),
        ctor_open_pct: pct(today.email_click_unique, today.email_open_unique),
      },
      whatsapp: {
        sent_step1: today.whatsapp_sent_step1,
        sent_step2: today.whatsapp_sent_step2,
        sent_step3: today.whatsapp_sent_step3,
        replies_unique: today.whatsapp_replies_unique,
        response_rate_pct: responseRates,
      },
      calculator: {
        calculations: today.calculator_calculations,
        premium_clicks: today.premium_clicks,
      },
      revenue: {
        purchases: today.purchases,
        total_inr: today.revenue_inr,
      },
      time_to_purchase_minutes: {
        avg: minutesToPurchase.length
          ? Math.round((minutesToPurchase.reduce((s, n) => s + n, 0) / minutesToPurchase.length) * 10) / 10
          : 0,
        median: median(minutesToPurchase),
        sample: minutesToPurchase.length,
      },
    },
    daily,
  });
}

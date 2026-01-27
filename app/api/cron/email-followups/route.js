import { NextResponse } from "next/server";

import { EmailFollowupsDB } from "@/lib/db/emailFollowups";
import { EmailService } from "@/lib/email/emailService";
import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

function requireCronAuth(req) {
  const h = req.headers.get("authorization") || "";
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  return h === `Bearer ${secret}`;
}

function safeText(v) {
  return String(v ?? "").trim();
}

export async function GET(req) {
  if (!requireCronAuth(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { due, error } = await EmailFollowupsDB.due(50);
  if (error) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of due) {
    processed++;

    const email = String(item?.email || "").trim();
    const subject = safeText(item?.context?.subject || "");
    const html = safeText(item?.context?.html || "");

    const res = await EmailService.sendRaw({ to: email, subject, html });

    if (res?.ok) {
      sent++;
      await EmailFollowupsDB.sent({ id: item.id, provider: "resend", providerMessageId: null });
      await logEventSafe({
        leadId: item?.lead_id || null,
        event_type: "email_followup_sent",
        data: { step: item?.step, email },
      });
      continue;
    }

    if (res?.skipped) {
      skipped++;
      await EmailFollowupsDB.skipped({ id: item.id, reason: res?.reason || "skipped" });
      await logEventSafe({
        leadId: item?.lead_id || null,
        event_type: "email_followup_skipped",
        data: { step: item?.step, email, reason: res?.reason || null },
      });
      continue;
    }

    failed++;
    await EmailFollowupsDB.failed({ id: item.id, errorText: res?.error ? JSON.stringify(res.error) : "send_failed" });
    await logEventSafe({
      leadId: item?.lead_id || null,
      event_type: "email_followup_failed",
      data: { step: item?.step, email },
    });
  }

  return NextResponse.json({ ok: true, processed, sent, skipped, failed });
}

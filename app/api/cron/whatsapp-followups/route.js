import { NextResponse } from "next/server";

import { WhatsAppFollowupsDB } from "@/lib/db/whatsappFollowups";
import { WhatsAppService } from "@/lib/whatsapp/whatsappService";
import { logEventSafe } from "@/lib/db/events";

export const runtime = "nodejs";

function requireCronAuth(req) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const got = String(req.headers.get("x-cron-secret") || "").trim();
  return got && got === secret;
}

function safeText(v) {
  return String(v ?? "").trim();
}

export async function POST(req) {
  if (!requireCronAuth(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { due, error } = await WhatsAppFollowupsDB.due(50);
  if (error) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of due) {
    processed++;

    const phone = String(item?.phone || "").trim();
    const body = safeText(item?.context?.body || "");

    // If the lead has replied (any reply recorded), stop further followups.
    const { any: hasReply } = await WhatsAppFollowupsDB.replied(phone);
    if (hasReply) {
      await WhatsAppFollowupsDB.stopPhone({ phone });
      skipped++;
      continue;
    }

    const res = await WhatsAppService.sendText({ to: phone, body });

    if (res?.ok) {
      sent++;
      await WhatsAppFollowupsDB.sent({ id: item.id, provider: res.provider, providerMessageId: res.messageId });
      await logEventSafe({
        leadId: item?.lead_id || null,
        event_type: "whatsapp_followup_sent",
        data: { step: item?.step, phone, provider: res?.provider || null },
      });
      continue;
    }

    if (res?.skipped) {
      skipped++;
      await WhatsAppFollowupsDB.skipped({ id: item.id, reason: res?.reason || "skipped" });
      await logEventSafe({
        leadId: item?.lead_id || null,
        event_type: "whatsapp_followup_skipped",
        data: { step: item?.step, phone, reason: res?.reason || null },
      });
      continue;
    }

    failed++;
    await WhatsAppFollowupsDB.failed({ id: item.id, errorText: res?.error ? JSON.stringify(res.error) : "send_failed" });
    await logEventSafe({
      leadId: item?.lead_id || null,
      event_type: "whatsapp_followup_failed",
      data: { step: item?.step, phone },
    });
  }

  return NextResponse.json({ ok: true, processed, sent, skipped, failed });
}

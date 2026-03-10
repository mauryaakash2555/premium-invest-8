/**
 * FILE: app/api/leads/route.js
 * PURPOSE: Create or update a lead (by email) in Supabase.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server (NextResponse)
 * - lib/db/leads (upsertLead)
 */

import { NextResponse } from "next/server";
import { upsertLead } from "@/lib/db/leads";
import { isFeatureEnabled } from "@/config/features";
import { loadPlugins } from "@/lib/plugins/loadPlugins";
import { runPluginHook } from "@/lib/plugins/PluginManager";
import { sanitizeInput, validateLeadData, normalizePhone } from "@/lib/utils/validator";
import { EmailPreferencesDB } from "@/lib/db/emailPreferences";
import { EmailService } from "@/lib/email/emailService";
import { logEventSafe } from "@/lib/db/events";

function isMissingLeadsTable(msg) {
  const m = String(msg || "");
  return m.includes("Could not find the table") && m.includes("public.leads");
}

export async function POST(req) {
  if (!isFeatureEnabled("LEAD_CAPTURE")) {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 404 });
  }

  // Plugins (best-effort)
  await loadPlugins();

  // 🔵 Parse + sanitize input
  const body = await req.json().catch(() => ({}));
  const name = sanitizeInput(String(body?.name || ""));
  const email = sanitizeInput(String(body?.email || "")).toLowerCase();
  const phone = normalizePhone(sanitizeInput(String(body?.phone || "")));

  // 🔵 Validate
  const { valid, errors } = validateLeadData({ name, email, phone });
  if (!valid) {
    return NextResponse.json({ ok: false, error: errors.join(", ") }, { status: 400 });
  }

  // 🔵 Save lead
  try {
    const lead = await upsertLead({ name, email, phone });
    await runPluginHook("onLeadCapture", { lead });

    // Best-effort: notify super admin + log event.
    try {
      const prefs = await EmailPreferencesDB.getSafe();
      await EmailService.sendLeadCapturedAlert({
        to: prefs?.email_address,
        lead,
        source: String(body?.source || 'api_leads'),
      });
    } catch {
      // ignore
    }

    await logEventSafe({
      leadId: lead?.id || null,
      event_type: 'lead_captured',
      data: { source: String(body?.source || 'api_leads') },
    });

    return NextResponse.json({ ok: true, lead });
  } catch (e) {
    const msg = String(e?.message || "");

    // ⚠️ Common setup issue: Supabase reachable but schema not applied.
    if (isMissingLeadsTable(msg)) {
      return NextResponse.json(
        {
          ok: false,
          error: "setup_required",
          detail: "leads_table_missing",
          hint: "Run supabase/schema.sql in your Supabase SQL editor (creates public.leads, public.conversations, public.events).",
        },
        { status: 503 }
      );
    }

    if (msg.includes("Supabase env not configured")) {
      return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
    }

    return NextResponse.json({ ok: false, error: msg || "unknown" }, { status: 500 });
  }
}

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
import { sendGuideEmail } from "@/lib/email/brevo";

const GUIDE_URLS = {
  pms: "https://bmwealth.co.in/guides/portfolio-strategy-guide.pdf",
  default: "https://bmwealth.co.in/guides/beginner-guide.pdf",
};

function guideUrlForInterest(interest) {
  return String(interest || "").includes("PMS") ? GUIDE_URLS.pms : GUIDE_URLS.default;
}

function isMissingLeadsTable(msg) {
  const m = String(msg || "");
  return m.includes("Could not find the table") && m.includes("public.leads");
}

// In-memory rate-limit buckets (resets on redeploy)
const rateBuckets = new Map();

export async function POST(req) {
  if (!isFeatureEnabled("LEAD_CAPTURE")) {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 404 });
  }

  // Plugins (best-effort)
  await loadPlugins();

  // 🔵 Rate limit: max 3 per IP per hour
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (bucket && bucket.count >= 3 && now - bucket.start < 3600_000) {
    return NextResponse.json({ ok: false, error: "Too many requests. Try again later." }, { status: 429 });
  }
  if (!bucket || now - bucket.start >= 3600_000) {
    rateBuckets.set(ip, { count: 1, start: now });
  } else {
    bucket.count++;
  }

  // 🔵 Parse + sanitize input
  const body = await req.json().catch(() => ({}));
  const name = sanitizeInput(String(body?.name || ""));
  const email = sanitizeInput(String(body?.email || "")).toLowerCase();
  const phone = normalizePhone(sanitizeInput(String(body?.phone || "")));
  const interest = sanitizeInput(String(body?.interest || "")).slice(0, 200);
  const source = sanitizeInput(String(body?.source || "api_leads")).slice(0, 100);

  // 🔵 Validate
  const { valid, errors } = validateLeadData({ name, email, phone });
  if (!valid) {
    return NextResponse.json({ ok: false, error: errors.join(", ") }, { status: 400 });
  }

  // 🔵 Save lead
  try {
    const lead = await upsertLead({ name, email, phone, interest, source });
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
      data: { source, interest },
    });

    // Best-effort: send PDF guide via Brevo
    if (source === "blueprint" && email) {
      console.log("[leads] Brevo env check:", { keyExists: !!process.env.BREVO_API_KEY, sender: process.env.BREVO_SENDER_EMAIL });
      try {
        const emailResult = await sendGuideEmail({
          name,
          email,
          interest,
          guideUrl: guideUrlForInterest(interest),
        });
        console.log("[leads] Brevo guide email sent:", JSON.stringify(emailResult));
      } catch (emailErr) {
        console.error("[leads] Brevo guide email failed:", emailErr?.message, emailErr?.statusCode, JSON.stringify(emailErr?.body || emailErr?.response?.body || {}));
      }
    }

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

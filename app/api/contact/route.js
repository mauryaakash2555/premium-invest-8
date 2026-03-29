import { NextResponse } from "next/server";

import { upsertLead } from "@/lib/db/leads";
import { EmailPreferencesDB } from "@/lib/db/emailPreferences";
import { EmailService } from "@/lib/email/emailService";
import { logEventSafe } from "@/lib/db/events";
import { sanitizeInput, validateLeadData, normalizePhone, validateEmail } from "@/lib/utils/validator";

export const runtime = 'nodejs';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://bmwealth-backend.onrender.com";

function json(status, body) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { success: false, detail: "Invalid JSON" });
  }

  // Best-effort: capture lead + notify super admin (never blocks proxy).
  try {
    const name = sanitizeInput(String(payload?.name || ''));
    const email = sanitizeInput(String(payload?.email || '')).toLowerCase();
    const phone = normalizePhone(sanitizeInput(String(payload?.phone || payload?.mobile || '')));
    const message = String(payload?.message || '').toString().slice(0, 2000);
    const page = String(payload?.page || '/contact');

    let lead = null;
    const { valid } = validateLeadData({ name, email, phone });

    // Only upsert into leads if email is valid (leads table uses email as unique key).
    if (valid && validateEmail(email)) {
      const interest = String(payload?.interest || '').slice(0, 200) || undefined;
      const source = String(payload?.source || 'contact').slice(0, 100);
      lead = await upsertLead({ name, email, phone, interest, source });
    }

    await logEventSafe({
      leadId: lead?.id || null,
      event_type: 'contact_form_submitted',
      data: {
        name,
        email,
        phone,
        page,
        message: String(message || '').slice(0, 500),
      },
    });

    const prefs = await EmailPreferencesDB.getSafe();
    await EmailService.sendContactFormAlert({
      to: prefs?.email_address,
      contact: { name, email, phone, message, page },
    });
  } catch {
    // ignore
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const upstream = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const contentType = upstream.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await upstream.json() : await upstream.text();

    if (!upstream.ok) {
      const detail =
        typeof data === "object" && data && "detail" in data
          ? data.detail
          : typeof data === "string" && data
            ? data
            : "Contact request failed";

      return json(upstream.status || 502, { success: false, detail });
    }

    if (typeof data === "object" && data) {
      return json(200, { ...data, success: true });
    }

    return json(200, { success: true });
  } catch (e) {
    const aborted = e && typeof e === "object" && "name" in e && e.name === "AbortError";
    return json(aborted ? 504 : 502, {
      success: false,
      detail: aborted ? "Upstream timeout" : "Upstream error",
    });
  }
}

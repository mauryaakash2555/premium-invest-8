import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getIstRangeForFilter } from "@/lib/time/istRanges";

const LEADS_LIMIT = 5000;
const SUPABASE_TIMEOUT_MS = 8_000;

function isMissingColumnError(err, columnName) {
  const msg = String(err?.message || err || "");
  const col = String(columnName || "");
  if (!msg || !col) return false;
  // Common PostgREST/Supabase shapes.
  return (
    msg.toLowerCase().includes('column') &&
    msg.toLowerCase().includes(col.toLowerCase()) &&
    (msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('not found'))
  );
}

function isMissingRelationError(err, relationName) {
  const msg = String(err?.message || err || "").toLowerCase();
  const rel = String(relationName || "").toLowerCase();
  if (!msg || !rel) return false;
  return msg.includes(rel) && (msg.includes("relation") || msg.includes("table")) && msg.includes("does not exist");
}

async function withTimeout(promise, ms) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error("timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

function computeRange(filter) {
  return getIstRangeForFilter(filter);
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (status === "converted" || status === "won" || status === "closed") return "converted";
  if (status === "contacted" || status === "in_progress" || status === "followed_up" || status === "qualified") return "contacted";
  return "new";
}

function normalizeSource(value, fallback) {
  const source = String(value || "").trim().toLowerCase();
  if (!source) return fallback;
  if (source === "onboarding_public") return fallback;
  return source;
}

function firstNonEmpty(values) {
  for (const value of values) {
    const str = String(value || "").trim();
    if (str) return str;
  }
  return "";
}

function isHotMessage(text) {
  return /(funding|investment|portfolio|pms|crore|lakh)/i.test(String(text || ""));
}

function isTestLike(row) {
  const name = String(row?.name || "").trim();
  const email = String(row?.email || "").trim().toLowerCase();
  const phone = String(row?.phone || "").replace(/\D/g, "");
  const blob = JSON.stringify(row || {}).toLowerCase();
  if (/\b(test|demo|sample|dummy|fake|asdf)\b/.test(blob)) return true;
  if (name && /test|demo|sample|dummy|asdf|user\d*/i.test(name)) return true;
  if (email && (/example\.com/.test(email) || /test|demo|fake/.test(email))) return true;
  if (phone && (/^9{6,}/.test(phone) || /^1{6,}/.test(phone) || /^0{6,}/.test(phone) || /12345/.test(phone) || /^555/.test(phone))) return true;
  return false;
}

function mapLeadRow(row) {
  return {
    id: `leads:${row.id}`,
    row_id: row.id,
    lead_table: "leads",
    table_label: "leads",
    source_group: "blueprint_form",
    name: row.name || null,
    email: row.email || null,
    phone: row.phone || null,
    interest_or_message: firstNonEmpty([row.interest, row.message]),
    source: normalizeSource(row.source, "blueprint"),
    status: normalizeStatus(row.status),
    created_at: row.created_at || null,
    is_hot: false,
    is_test: isTestLike(row),
  };
}

function mapOnboardingRow(row) {
  const interestOrMessage = firstNonEmpty([
    row.message,
    row.interest,
    row.query,
    row.user_message,
    row.notes,
    row.last_message,
    Number.isFinite(Number(row.step_stuck)) ? `Stopped at step ${Number(row.step_stuck)}` : "",
  ]);

  return {
    id: `onboarding_leads:${row.id}`,
    row_id: row.id,
    lead_table: "onboarding_leads",
    table_label: "onboarding_leads",
    source_group: "whatsapp_bot",
    name: row.name || null,
    email: row.email || null,
    phone: row.phone || null,
    interest_or_message: interestOrMessage,
    source: normalizeSource(row.source, "whatsapp-bot"),
    status: normalizeStatus(row.status),
    created_at: row.created_at || null,
    is_hot: isHotMessage(interestOrMessage),
    is_test: isTestLike(row),
  };
}

function buildRangeQuery(q, from, to) {
  let next = q;
  if (from) next = next.gte("created_at", from.toISOString());
  if (to) next = next.lt("created_at", to.toISOString());
  return next;
}

async function fetchLeads(sb, from, to) {
  const baseQuery = (columns) => buildRangeQuery(
    sb.from("leads").select(columns).order("created_at", { ascending: false }).limit(LEADS_LIMIT),
    from,
    to
  );

  let res;
  try {
    res = await withTimeout(baseQuery("id,name,email,phone,interest,source,status,created_at,lead_score"), SUPABASE_TIMEOUT_MS);
  } catch (e) {
    throw e;
  }

  if (res?.error && isMissingColumnError(res.error, "lead_score")) {
    res = await withTimeout(baseQuery("id,name,email,phone,interest,source,status,created_at"), SUPABASE_TIMEOUT_MS);
  }

  if (res?.error) throw res.error;
  return (res.data || []).map(mapLeadRow);
}

async function fetchOnboardingLeads(sb, from, to) {
  try {
    const res = await withTimeout(
      buildRangeQuery(
        sb.from("onboarding_leads").select("*").order("created_at", { ascending: false }).limit(LEADS_LIMIT),
        from,
        to
      ),
      SUPABASE_TIMEOUT_MS
    );

    if (res?.error) {
      if (isMissingRelationError(res.error, "onboarding_leads")) return [];
      throw res.error;
    }

    return (res.data || []).map(mapOnboardingRow);
  } catch (e) {
    if (isMissingRelationError(e, "onboarding_leads")) return [];
    throw e;
  }
}

export async function GET(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const url = new URL(req.url);
  const filter = String(url.searchParams.get("filter") || "all").toLowerCase();
  const allowed = new Set(["today", "yesterday", "week", "month", "year", "all"]);
  const normalizedFilter = allowed.has(filter) ? filter : "all";

  const { from, to } = computeRange(normalizedFilter);

  let unifiedLeads;
  try {
    const [leadRows, onboardingRows] = await Promise.all([
      fetchLeads(sb, from, to),
      fetchOnboardingLeads(sb, from, to),
    ]);
    unifiedLeads = [...leadRows, ...onboardingRows].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } catch (e) {
    const msg = String(e?.message || "failed");
    const status = msg === "timeout" ? 504 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }

  return NextResponse.json({
    ok: true,
    filter: normalizedFilter,
    from: from ? from.toISOString() : null,
    to: to ? to.toISOString() : null,
    leads: unifiedLeads,
  });
}

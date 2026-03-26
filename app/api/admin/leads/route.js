import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const LEADS_LIMIT = 200;
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

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeekMonday(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  x.setDate(x.getDate() + diff);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function startOfYear(d) {
  const x = startOfDay(d);
  x.setMonth(0, 1);
  return x;
}

function computeRange(filter) {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (filter) {
    case "today":
      return { from: todayStart, to: null };
    case "yesterday": {
      const y = new Date(todayStart);
      y.setDate(y.getDate() - 1);
      return { from: y, to: todayStart };
    }
    case "week":
      return { from: startOfWeekMonday(now), to: null };
    case "month":
      return { from: startOfMonth(now), to: null };
    case "year":
      return { from: startOfYear(now), to: null };
    case "all":
    default:
      return { from: null, to: null };
  }
}

export async function GET(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) return NextResponse.json({ ok: false }, { status: 401 });

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

  const baseQuery = () => {
    let q = sb.from("leads").order("created_at", { ascending: false }).limit(LEADS_LIMIT);
    if (from) q = q.gte("created_at", from.toISOString());
    if (to) q = q.lt("created_at", to.toISOString());
    return q;
  };

  // Try selecting lead_score if present; if schema doesn't have it, fall back.
  let res;
  try {
    res = await withTimeout(baseQuery().select("id,name,email,phone,interest,source,status,created_at,lead_score"), SUPABASE_TIMEOUT_MS);
  } catch (e) {
    const msg = String(e?.message || "failed");
    const status = msg === "timeout" ? 504 : 502;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }

  if (res?.error && isMissingColumnError(res.error, 'lead_score')) {
    // Retry without lead_score for backwards compatible schemas.
    try {
      res = await withTimeout(baseQuery().select("id,name,email,phone,interest,source,status,created_at"), SUPABASE_TIMEOUT_MS);
    } catch (e) {
      const msg = String(e?.message || "failed");
      const status = msg === "timeout" ? 504 : 502;
      return NextResponse.json({ ok: false, error: msg }, { status });
    }
  }

  if (res?.error) {
    return NextResponse.json({ ok: false, error: String(res.error?.message || "query_failed") }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    filter: normalizedFilter,
    from: from ? from.toISOString() : null,
    to: to ? to.toISOString() : null,
    leads: res.data || [],
  });
}

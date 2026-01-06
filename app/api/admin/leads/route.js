import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  if (!isAdminFromCookies(cookieStore)) return NextResponse.json({ ok: false }, { status: 401 });

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

  let q = sb.from("leads").select("id,name,email,phone,created_at,lead_score").order("created_at", { ascending: false }).limit(500);
  if (from) q = q.gte("created_at", from.toISOString());
  if (to) q = q.lt("created_at", to.toISOString());

  const res = await q;

  return NextResponse.json({
    ok: true,
    filter: normalizedFilter,
    from: from ? from.toISOString() : null,
    to: to ? to.toISOString() : null,
    leads: res.data || [],
  });
}

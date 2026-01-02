/**
 * FILE: app\api\admin\export\route.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server
 * - next/headers
 * - @/lib/adminSession
 * - @/lib/supabaseAdmin
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Logger } from "@/lib/monitoring/logger";
function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toISO(d) {
  try {
    return new Date(d).toISOString();
  } catch {
    return "";
  }
}

function tierFromScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "COLD";
  if (n >= 80) return "HOT";
  if (n >= 40) return "WARM";
  return "COLD";
}

async function fetchAllRows({ sb, table, select, pageSize = 1000, queryFn }) {
  const out = [];
  let from = 0;
  for (let i = 0; i < 30; i++) {
    let q = sb.from(table).select(select).range(from, from + pageSize - 1);
    if (queryFn) q = queryFn(q);
    const { data, error } = await q;
    if (error) throw error;
    const rows = data || [];
    out.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

export async function GET(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }

  const url = new URL(req.url);
  const filter = (url.searchParams.get("filter") || "all").toLowerCase(); // all|hot|today|range
  const start = url.searchParams.get("start"); // ISO
  const end = url.searchParams.get("end"); // ISO

  try {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    // 1) Leads (some environments may not yet have the optional lead_score column)
    let leads = [];
    try {
      leads = await fetchAllRows({
        sb,
        table: "leads",
        select: "id,name,email,phone,created_at,lead_score",
        pageSize: 1000,
        queryFn: (q) => q.order("created_at", { ascending: false }),
      });
    } catch (e) {
      const msg = String(e?.message || "");
      if (msg.toLowerCase().includes("lead_score")) {
        leads = await fetchAllRows({
          sb,
          table: "leads",
          select: "id,name,email,phone,created_at",
          pageSize: 1000,
          queryFn: (q) => q.order("created_at", { ascending: false }),
        });
      } else {
        throw e;
      }
    }

    // 2) Conversations (count + last_active)
    const convs = await fetchAllRows({
      sb,
      table: "conversations",
      select: "lead_id,created_at",
      pageSize: 1000,
      queryFn: (q) => q.order("created_at", { ascending: false }),
    });

    const convCount = Object.create(null);
    const lastActive = Object.create(null);
    for (const c of convs) {
      const lid = c?.lead_id;
      if (!lid) continue;
      convCount[lid] = (convCount[lid] || 0) + 1;
      const at = c?.created_at ? new Date(c.created_at).getTime() : 0;
      if (!lastActive[lid] || at > lastActive[lid]) lastActive[lid] = at;
    }

    // 3) Latest lead_score events (authoritative, if present)
    const scoreEvents = await fetchAllRows({
      sb,
      table: "events",
      select: "lead_id,created_at,data",
      pageSize: 1000,
      queryFn: (q) => q.eq("event_type", "lead_score").order("created_at", { ascending: false }),
    });
    const latestScore = Object.create(null);
    for (const e of scoreEvents) {
      const lid = e?.lead_id;
      if (!lid || latestScore[lid]) continue;
      const s = Number(e?.data?.score);
      if (Number.isFinite(s)) latestScore[lid] = s;
    }

    // 4) Filter + normalize rows
    let rows = leads.map((l) => {
      const lid = l.id;
      const score = Number.isFinite(Number(latestScore[lid]))
        ? Number(latestScore[lid])
        : Number.isFinite(Number(l.lead_score))
          ? Number(l.lead_score)
          : 0;
      const tier = tierFromScore(score);
      const createdAt = l.created_at || null;
      const last = lastActive[lid] ? new Date(lastActive[lid]).toISOString() : createdAt;
      return {
        id: lid,
        name: l.name || "",
        email: l.email || "",
        phone: l.phone || "",
        score,
        tier,
        conversation_count: convCount[lid] || 0,
        created_at: createdAt,
        last_active: last,
      };
    });

  if (filter === "hot") {
    rows = rows.filter((r) => r.tier === "HOT");
  } else if (filter === "today") {
    rows = rows.filter((r) => r.created_at && new Date(r.created_at) >= dayStart);
  } else if (filter === "range") {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    rows = rows.filter((r) => {
      const d = r.created_at ? new Date(r.created_at) : null;
      if (!d || Number.isNaN(d.getTime())) return false;
      if (s && !Number.isNaN(s.getTime()) && d < s) return false;
      if (e && !Number.isNaN(e.getTime()) && d > e) return false;
      return true;
    });
  }

    // Sort newest first by captured date
    rows.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    const ymd = toISO(now).slice(0, 10);
    const filename = `bm-wealth-leads-${ymd}.csv`;

  const header = [
    "Name",
    "Email",
    "Phone",
    "Lead Score (Hot/Warm/Cold)",
    "Conversations",
    "Captured Date",
    "Last Active",
  ];

  const lines = [];
  lines.push(header.map(csvEscape).join(","));
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.email,
        r.phone,
        `${r.tier}${Number.isFinite(r.score) ? ` ${Math.round(r.score)}` : ""}`,
        String(r.conversation_count || 0),
        r.created_at ? String(r.created_at) : "",
        r.last_active ? String(r.last_active) : "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

    const csv = lines.join("\n") + "\n";

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Export-Count": String(rows.length),
      },
    });
  } catch (e) {
    Logger.error("admin_export_failed", { error: String(e?.message || e), stack: e?.stack });
    return NextResponse.json({ ok: false, error: String(e?.message || "export_failed") }, { status: 500 });
  }
}









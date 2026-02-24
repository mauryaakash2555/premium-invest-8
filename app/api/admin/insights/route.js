/**
 * Admin API: Manage Latest Insights cards on the homepage.
 * Stores overrides in Supabase storage (admin/insights-config.json).
 * Falls back to local file data/insights-config.json.
 *
 * GET  → returns current config
 * POST → saves new config
 */

import { NextResponse } from "next/server";
import { isAdminFromRequest } from "@/lib/adminSession";
import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";
import fs from "fs";
import path from "path";

const BUCKET = "admin";
const STORAGE_KEY = "insights-config.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "insights-config.json");

const DEFAULT_CONFIG = {
  editorial: {
    title: "Editorial",
    kicker: "BM Editorial",
    postTitle:
      "He Lost ₹47 Lakh Following \"Expert\" Advice - Here's What He Wishes He Knew 7 Years Ago",
    desc: "True story: How a Mumbai CA lost ₹47 lakh opportunity cost following wrong advice. Learn the 5 critical mistakes and what you should check in your portfolio today.",
    href: "/blog/47-lakh-investment-mistake-mumbai",
    img: "/blog-images/blog-hero-47lakh.jpg",
    kind: "post",
    enabled: true,
  },
  itr: {
    title: "ITR Filing Help",
    kicker: "Tool",
    postTitle: "ITR Filing Help",
    desc: "Guided income-tax return filing — step by step, stress-free.",
    href: "/tools/itr-filing-help",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=640&h=360&fit=crop&auto=format&q=75",
    kind: "tool",
    enabled: true,
  },
  liveIntel: {
    title: "Live Intelligence",
    kicker: "Live",
    postTitle: "Live Intelligence",
    desc: "Real-time market context, mood indicators & trading timings.",
    href: "/live-intelligence",
    kind: "live-intel",
    enabled: true,
  },
  // Custom slots that admin can add/edit
  custom: [],
};

function json(status, body) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readConfig() {
  // Try Supabase storage first
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.storage.from(BUCKET).download(STORAGE_KEY);
    if (!error && data) {
      const text = await data.text();
      return JSON.parse(text);
    }
  } catch {
    // fallthrough
  }

  // Try local file
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf-8"));
    }
  } catch {
    // fallthrough
  }

  return DEFAULT_CONFIG;
}

async function writeConfig(config) {
  const jsonStr = JSON.stringify(config, null, 2);

  // Write to local file (always, as backup)
  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_FILE, jsonStr, "utf-8");
  } catch {
    // non-fatal
  }

  // Write to Supabase storage
  try {
    const sb = supabaseAdmin();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const { error } = await sb.storage.from(BUCKET).upload(STORAGE_KEY, blob, {
      upsert: true,
      contentType: "application/json",
    });
    if (error) throw error;
  } catch (e) {
    console.warn("[insights-config] Supabase write failed:", e?.message);
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return json(401, { ok: false });
  }

  try {
    const config = await readConfig();
    return json(200, { ok: true, config });
  } catch (e) {
    return json(500, { ok: false, error: e?.message });
  }
}

export async function POST(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return json(401, { ok: false });
  }

  try {
    const body = await req.json();
    const config = body?.config;
    if (!config || typeof config !== "object") {
      return json(400, { ok: false, error: "Missing config object" });
    }

    await writeConfig(config);
    return json(200, { ok: true });
  } catch (e) {
    return json(500, { ok: false, error: e?.message });
  }
}

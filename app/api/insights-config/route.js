/**
 * Public API: Get current insights config for homepage rendering.
 * No auth required — cached aggressively.
 *
 * GET → returns insights config for homepage cards
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";
import fs from "fs";
import path from "path";

const BUCKET = "admin";
const STORAGE_KEY = "insights-config.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "insights-config.json");

function json(status, body) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

export async function GET() {
  // Try Supabase storage first
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.storage.from(BUCKET).download(STORAGE_KEY);
    if (!error && data) {
      const text = await data.text();
      const config = JSON.parse(text);
      return json(200, { ok: true, config });
    }
  } catch {
    // fallthrough
  }

  // Try local file
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      const config = JSON.parse(fs.readFileSync(LOCAL_FILE, "utf-8"));
      return json(200, { ok: true, config });
    }
  } catch {
    // fallthrough
  }

  // No config stored yet — return null (homepage falls back to defaults)
  return json(200, { ok: true, config: null });
}

/**
 * Admin API: Manage website images (URL-based).
 * Stores overrides in Supabase storage (admin/site-images.json).
 * Falls back to local file data/site-images.json.
 *
 * Each image has a key (e.g. "hero-bg", "about-banner") and a URL.
 * Pages check these overrides at render time via /api/site-images.
 *
 * GET  → returns current image map
 * POST → saves updated image map
 */

import { NextResponse } from "next/server";
import { isAdminFromRequest } from "@/lib/adminSession";
import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";
import fs from "fs";
import path from "path";

const BUCKET = "admin";
const STORAGE_KEY = "site-images.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "site-images.json");

function json(status, body) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readImages() {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.storage.from(BUCKET).download(STORAGE_KEY);
    if (!error && data) {
      const text = await data.text();
      return JSON.parse(text);
    }
  } catch { /* fallthrough */ }

  try {
    if (fs.existsSync(LOCAL_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf-8"));
    }
  } catch { /* fallthrough */ }

  return { images: {}, history: [] };
}

async function writeImages(imageData) {
  const jsonStr = JSON.stringify(imageData, null, 2);

  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_FILE, jsonStr, "utf-8");
  } catch { /* non-fatal */ }

  try {
    const sb = supabaseAdmin();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const { error } = await sb.storage.from(BUCKET).upload(STORAGE_KEY, blob, {
      upsert: true,
      contentType: "application/json",
    });
    if (error) throw error;
  } catch (e) {
    console.warn("[site-images] Supabase write failed:", e?.message);
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return json(401, { ok: false });
  }

  try {
    const data = await readImages();
    return json(200, { ok: true, ...data });
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
    const { key, url, action } = body || {};

    if (action === "full-replace" && body.images) {
      // Full replace of the entire image map
      const existing = await readImages();
      await writeImages({ images: body.images, history: existing.history || [] });
      return json(200, { ok: true });
    }

    if (!key || typeof key !== "string") {
      return json(400, { ok: false, error: "Missing image key" });
    }

    const existing = await readImages();
    const images = existing.images || {};
    const history = existing.history || [];

    if (action === "delete") {
      // Track history before deleting
      if (images[key]) {
        history.unshift({
          key,
          oldUrl: images[key],
          newUrl: null,
          action: "delete",
          timestamp: new Date().toISOString(),
        });
      }
      delete images[key];
    } else {
      if (!url || typeof url !== "string") {
        return json(400, { ok: false, error: "Missing image URL" });
      }
      // Track history
      if (images[key] && images[key] !== url) {
        history.unshift({
          key,
          oldUrl: images[key],
          newUrl: url,
          action: "update",
          timestamp: new Date().toISOString(),
        });
      } else if (!images[key]) {
        history.unshift({
          key,
          oldUrl: null,
          newUrl: url,
          action: "add",
          timestamp: new Date().toISOString(),
        });
      }
      images[key] = url;
    }

    // Keep only last 100 history entries
    if (history.length > 100) history.length = 100;

    await writeImages({ images, history });
    return json(200, { ok: true, images, historyCount: history.length });
  } catch (e) {
    return json(500, { ok: false, error: e?.message });
  }
}

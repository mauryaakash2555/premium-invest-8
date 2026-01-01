/**
 * FILE: app\api\admin\login\route.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server
 * - @/lib/env
 * - @/lib/adminSession
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

﻿import { NextResponse } from "next/server";
import { getAdminEnvSafe } from "@/config/env";
import { issueAdminCookie } from "@/lib/adminSession";

export async function POST(req) {
  const env = getAdminEnvSafe();
  if (!env?.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "setup_required" }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (password !== env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookie = issueAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}




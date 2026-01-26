/**
 * FILE: app\api\bmwealth\route.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: api
 *
 * DEPENDENCIES:
 * - next/server
 * - @/data/bmwealth.json
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
import info from "@/data/bmwealth.json";

export async function GET() {
  return NextResponse.json({
    ...info,
    receivedAt: new Date().toISOString(),
    note: "Connectivity check endpoint.",
  });
}


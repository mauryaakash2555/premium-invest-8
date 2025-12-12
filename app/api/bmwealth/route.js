import { NextResponse } from "next/server";
import info from "@/data/bmwealth.json";

export async function GET() {
  return NextResponse.json({
    ...info,
    receivedAt: new Date().toISOString(),
    note: "This is a dummy endpoint for connectivity checks.",
  });
}


import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "razorpay_removed",
      message: "Razorpay has been removed. No verify endpoint is available.",
    },
    { status: 410 }
  );
}

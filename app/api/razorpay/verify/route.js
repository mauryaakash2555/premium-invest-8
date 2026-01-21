import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "razorpay_removed",
      message: "Razorpay has been removed. Payments are handled only on https://store.bmwealth.co.in.",
    },
    { status: 410 }
  );
}

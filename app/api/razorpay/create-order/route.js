import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "razorpay_removed",
      message: "Razorpay has been removed. Use /api/payments/cashfree/create-order instead.",
    },
    { status: 410 }
  );
}

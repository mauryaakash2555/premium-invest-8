import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "payments_disabled_on_main_site",
      message: "Payments are handled only on https://store.bmwealth.co.in.",
    },
    { status: 404 }
  );
}

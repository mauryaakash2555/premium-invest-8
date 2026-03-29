import { NextResponse } from "next/server";
import { sendGuideEmail } from "@/lib/email/brevo";

export async function GET() {
  const diagnostics = {
    keyExists: !!process.env.BREVO_API_KEY,
    keyPrefix: (process.env.BREVO_API_KEY || "").slice(0, 10) + "...",
    sender: process.env.BREVO_SENDER_EMAIL || "(not set)",
    senderName: process.env.BREVO_SENDER_NAME || "(not set)",
  };

  try {
    const result = await sendGuideEmail({
      name: "Akash",
      email: "mauryaakash2555@gmail.com",
      interest: "Getting started with SIP",
      guideUrl: "https://bmwealth.co.in/guides/beginner-guide.pdf",
    });

    return NextResponse.json({
      ok: true,
      diagnostics,
      brevoResponse: result,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      diagnostics,
      error: err?.message || String(err),
      statusCode: err?.statusCode,
      body: err?.body || err?.response?.body || null,
    }, { status: 500 });
  }
}

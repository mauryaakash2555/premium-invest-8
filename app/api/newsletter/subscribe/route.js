import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendNewsletterWelcome } from "@/lib/email/brevo";

export async function POST(request) {
  try {
    const { email, source } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const allowedSources = ["footer-newsletter", "blog-newsletter"];
    const cleanSource = allowedSources.includes(source) ? source : "footer-newsletter";
    const sb = supabaseAdmin();

    const { error } = await sb.from("leads").insert({
      name: "Newsletter Subscriber",
      email: cleanEmail,
      phone: null,
      interest: "Newsletter",
      source: cleanSource,
      status: "new",
    });

    // Duplicate email — treat as success
    if (error && (error.code === "23505" || String(error.message || "").includes("unique"))) {
      return NextResponse.json({ message: "Successfully subscribed", email: cleanEmail });
    }

    if (error) {
      console.error("[newsletter/subscribe] Supabase error:", error.message);
      return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
    }

    // Best-effort: send welcome email via Brevo
    try {
      await sendNewsletterWelcome({ email: cleanEmail });
    } catch (emailErr) {
      console.error("[newsletter/subscribe] Welcome email failed:", emailErr?.message);
    }

    return NextResponse.json({ message: "Successfully subscribed", email: cleanEmail });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
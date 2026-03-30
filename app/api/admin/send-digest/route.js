import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminFromRequest } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendWeeklyDigest } from "@/lib/email/brevo";

export async function POST(req) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (!isAdminFromRequest(cookieStore, headerStore)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = supabaseAdmin();
    const now = new Date();

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let { data: articles } = await sb
      .from("live_intelligence_headlines")
      .select("id, headline, why_it_matters, category, cta_button, created_at, urgency, image_url")
      .eq("is_active", true)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!articles || articles.length < 5) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: extended } = await sb
        .from("live_intelligence_headlines")
        .select("id, headline, why_it_matters, category, cta_button, created_at, urgency, image_url")
        .eq("is_active", true)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(10);
      if (extended && extended.length > (articles?.length || 0)) {
        articles = extended;
      }
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ success: true, sent: 0, articles: 0, note: "No articles found" });
    }

    const digestArticles = articles.map((a) => ({
      headline: a.headline,
      why_it_matters: a.why_it_matters,
      summary: a.why_it_matters,
      category: a.category,
      source_url: a.cta_button?.link || null,
      image_url: a.image_url || null,
    }));

    const { data: subscribers } = await sb
      .from("leads")
      .select("email")
      .or("source.ilike.%newsletter%,interest.eq.Newsletter")
      .neq("email", "")
      .not("email", "is", null);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, articles: digestArticles.length, note: "No subscribers" });
    }

    const { sent, failed } = await sendWeeklyDigest(digestArticles, subscribers);
    return NextResponse.json({ success: true, sent, articles: digestArticles.length });
  } catch (err) {
    console.error("Admin send-digest error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

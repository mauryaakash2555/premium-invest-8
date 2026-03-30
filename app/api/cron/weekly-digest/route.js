import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendWeeklyDigest } from "@/lib/email/brevo";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const sb = supabaseAdmin();
    const now = new Date();

    // 1. Fetch top 10 articles from last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let { data: articles } = await sb
      .from("live_intelligence_headlines")
      .select("id, headline, why_it_matters, category, cta_button, created_at, urgency, image_url")
      .eq("is_active", true)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    // If fewer than 5 articles in last 7 days, extend to 30 days
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

    // Final fallback: fetch latest 10 regardless of date
    if (!articles || articles.length === 0) {
      const { data: latest } = await sb
        .from("live_intelligence_headlines")
        .select("id, headline, why_it_matters, category, cta_button, created_at, urgency, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (latest && latest.length > 0) {
        articles = latest;
      }
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ success: true, sent: 0, articles: 0, note: "No articles found" });
    }

    // Map articles to digest format
    const digestArticles = articles.map((a) => ({
      headline: a.headline,
      why_it_matters: a.why_it_matters,
      summary: a.why_it_matters,
      category: a.category,
      source_url: a.cta_button?.link || null,
      image_url: a.image_url || null,
    }));

    // 2. Fetch newsletter subscribers
    const { data: subscribers } = await sb
      .from("leads")
      .select("email")
      .or("source.ilike.%newsletter%,interest.ilike.newsletter")
      .neq("email", "")
      .not("email", "is", null);

    if (!subscribers || subscribers.length === 0) {
      console.log("Weekly digest: no newsletter subscribers found");
      return NextResponse.json({ success: true, sent: 0, articles: digestArticles.length, note: "No subscribers" });
    }

    // 3. Send digest
    const { sent, failed } = await sendWeeklyDigest(digestArticles, subscribers);
    console.log(`Weekly digest sent: ${sent} succeeded, ${failed} failed out of ${subscribers.length} subscribers`);

    return NextResponse.json({ success: true, sent, articles: digestArticles.length });
  } catch (err) {
    console.error("Weekly digest error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

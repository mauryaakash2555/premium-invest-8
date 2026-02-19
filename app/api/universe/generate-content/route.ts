import { NextResponse } from "next/server";
import { z } from "zod";
import { callGroqSafe } from "@/lib/ai/groq";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { consumeRate, makeRateKey } from "@/lib/utils/rateLimiter";

export const runtime = "nodejs";

const reqSchema = z.object({
  topic: z.string().min(1).max(120),
  depth: z.enum(["simple", "normal", "deep"]),
  section: z.enum(["explain", "examples", "practice", "flashcards", "quiz"]),
});

type Depth = z.infer<typeof reqSchema>["depth"];

type Section = z.infer<typeof reqSchema>["section"];

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  return String(xff).split(",")[0]?.trim() || "";
}

function buildExplainPrompt(topic: string, depth: Depth) {
  const topicSafe = String(topic || "").trim();
  const baseContext =
    "Context: This is for Indian investors. Use Indian examples, regulations, and currency (₹).\n" +
    "Use Indian context like SEBI, RBI, AMFI, NISM, NSE/BSE, Indian mutual funds, and Indian tax terms (LTCG, STCG, 80C) where relevant.\n" +
    "Educational only. Be factual, neutral tone. No marketing, no product promotion.\n";

  if (depth === "simple") {
    return (
      baseContext +
      `Explain ${topicSafe} in simple language for someone completely new to finance. ` +
      "Use stories, analogies, and everyday examples. Write 3-4 paragraphs. No jargon."
    );
  }

  if (depth === "deep") {
    return (
      baseContext +
      `Provide a comprehensive technical explanation of ${topicSafe}. ` +
      "Include mathematical formulas (use plain text), regulatory details, edge cases, common misconceptions, and advanced strategies. " +
      "Write 6-8 paragraphs for finance professionals."
    );
  }

  return (
    baseContext +
    `Explain ${topicSafe} with clear structure and frameworks. ` +
    "Include key concepts, how it works, and why it matters. Write 4-5 paragraphs for an educated beginner."
  );
}

function buildJsonOnlyPrompt(topic: string, section: Exclude<Section, "explain">, depth: Depth) {
  const topicSafe = String(topic || "").trim();
  const baseContext =
    "Context: This is for Indian investors. Use Indian examples, regulations, and currency (₹).\n" +
    "Educational only. Be factual, neutral tone. No marketing, no product promotion.\n" +
    "CRITICAL: Output ONLY a raw JSON array. No markdown, no ```json fences, no explanation before or after.\n" +
    "Your ENTIRE response must start with [ and end with ]. Nothing else.\n";

  if (section === "examples") {
    return (
      baseContext +
      `Generate 3 real-world examples for ${topicSafe} in Indian finance context. For each example:\n` +
      "- Title: Brief scenario name\n" +
      "- Scenario: 2-3 sentences describing the situation\n" +
      "- Steps: Numbered list of 3-5 action steps\n" +
      "- Outcome: What happened and key learning\n\n" +
      "Format as JSON array. Remember: output ONLY the raw JSON array, nothing else."
    );
  }

  if (section === "practice") {
    return (
      baseContext +
      `Generate 5 thought-provoking practice questions about ${topicSafe} for ${depth} level. For each:\n` +
      "- Question: Clear, specific question\n" +
      "- Answer: Detailed 3-4 sentence answer with explanation\n\n" +
      "Format as JSON array. Remember: output ONLY the raw JSON array, nothing else."
    );
  }

  if (section === "flashcards") {
    return (
      baseContext +
      `Generate 8 flashcards for ${topicSafe} at ${depth} level. For each:\n` +
      "- Front: Question or concept (10-15 words)\n" +
      "- Back: Clear answer or explanation (20-30 words)\n\n" +
      "Format as JSON array. Remember: output ONLY the raw JSON array, nothing else."
    );
  }

  // quiz
  return (
    baseContext +
    `Generate 5 multiple-choice quiz questions for ${topicSafe} at ${depth} level. For each:\n` +
    "- Question: Clear question text\n" +
    "- Options: Array of 4 choices (A, B, C, D)\n" +
    "- Correct: Index of correct answer (0-3)\n" +
    "- Explanation: Why this answer is correct (2-3 sentences)\n\n" +
    "Format as JSON array. Remember: output ONLY the raw JSON array, nothing else."
  );
}

function buildPrompt(topic: string, depth: Depth, section: Section) {
  if (section === "explain") return buildExplainPrompt(topic, depth);
  return buildJsonOnlyPrompt(topic, section, depth);
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  // 1) Parse + validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { topic, depth, section } = parsed.data;

  // 2) Rate limit (100/hour/IP)
  const ip = getClientIp(request);
  const rateKey = makeRateKey({ isAdmin: false, leadId: null, ip });
  const rate = consumeRate(rateKey, { max: 100, windowMs: 60 * 60_000 });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000) || 60),
        },
      }
    );
  }

  // 3) Supabase cache lookup
  const now = Date.now();
  let sb: ReturnType<typeof supabaseAdmin> | null = null;
  try {
    sb = supabaseAdmin();
  } catch (e) {
    // Cache is best-effort; proceed without DB.
    console.error("[universe/generate-content] supabase_not_configured", e);
  }

  if (sb) {
    try {
      const { data: rows, error } = await sb
        .from("universe_content")
        .select("content,created_at")
        .eq("topic", topic)
        .eq("depth", depth)
        .eq("section", section)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const row = rows?.[0];
      if (row?.content && row?.created_at) {
        const createdAt = new Date(row.created_at).getTime();
        if (Number.isFinite(createdAt) && now - createdAt < CACHE_TTL_MS) {
          return NextResponse.json({ content: String(row.content) });
        }
      }
    } catch (e) {
      // Cache is best-effort; proceed to generation.
      console.error("[universe/generate-content] cache_read_failed", e);
    }
  }

  // 4) Call Groq
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  const prompt = buildPrompt(topic, depth, section);
  const maxTokens = section === "explain" ? 2000 : 1500;

  const { reply, error } = await callGroqSafe({
    apiKey,
    userText: prompt,
    system:
      section === "explain"
        ? "You are a precise finance educator. Write accurate, clear, structured educational content for Indian investors. Avoid hype and marketing."
        : "You are a precise finance educator. Output ONLY a valid JSON array. No markdown fences, no explanation text, no code blocks. Start your response with [ and end with ]. Nothing else.",
    temperature: 0.7,
    maxTokens,
    model: "llama-3.3-70b-versatile",
  });

  if (error || !reply) {
    return NextResponse.json({ error: "Groq generation failed", details: error || "empty_reply" }, { status: 502 });
  }

  const content = String(reply).trim();

  // 5) Save to cache (best-effort)
  if (sb) {
    try {
      const { error: writeErr } = await sb.from("universe_content").insert({
        topic,
        depth,
        section,
        content,
      });
      if (writeErr) throw writeErr;
    } catch (e) {
      console.error("[universe/generate-content] cache_write_failed", e);
    }
  }

  // 6) Return content
  return NextResponse.json({ content });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAIEnvSafe } from "@/lib/env";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const reqSchema = z.object({
  message: z.string().min(1).max(6000),
  // The client sends the last few messages so Gemini can answer with context.
  // Shape is intentionally simple + strict to avoid prompt-injection blobs.
  conversationHistory: z
    .array(
      z.object({
        sender: z.enum(["user", "bot"]),
        text: z.string().min(1).max(6000),
      })
    )
    .max(20)
    .optional(),
  conversationId: z.string().min(1).max(200).optional(),
  leadId: z.string().uuid().optional(),
  mode: z.enum(["user", "admin"]).optional(),
});

const COMPLIANCE_TEXT =
  "Welcome to BM Wealth. We provide educational guidance and product\n" +
  "distribution services. AMFI Registered | IRDAI Licensed |\n" +
  "Investments subject to market dynamics.";

const COMPLIANCE_LINES = COMPLIANCE_TEXT.split("\n").map((l) => l.trim()).filter(Boolean);

function stripComplianceFooter(text) {
  let t = String(text || "");
  if (!t) return "";
  if (t.includes(COMPLIANCE_TEXT)) t = t.split(COMPLIANCE_TEXT).join("");
  for (const line of COMPLIANCE_LINES) {
    if (line && t.includes(line)) t = t.split(line).join("");
  }
  // clean up extra whitespace introduced by stripping
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

// Basic per-user rate limit (best-effort in serverless): 10 messages / minute.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const RATE_BUCKETS =
  globalThis.__bmwealth_chat_rate_buckets || (globalThis.__bmwealth_chat_rate_buckets = new Map());

function rateKey(req, leadId) {
  if (leadId) return `lead:${leadId}`;
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = String(xff).split(",")[0]?.trim();
  return ip ? `ip:${ip}` : "anon";
}

function consumeRate(key) {
  const now = Date.now();
  const existing = RATE_BUCKETS.get(key);
  if (!existing || now >= existing.resetAt) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (existing.count >= RATE_MAX) {
    return { allowed: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }
  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

async function logEventSafe({ leadId, event_type, data }) {
  try {
    const sb = supabaseAdmin();
    await sb
      .from("events")
      .insert({
        lead_id: leadId ?? null,
        event_type,
        data: data ?? null,
      })
      .throwOnError();
  } catch {
    // ignore if DB not configured yet
  }
}

async function getLeadNameSafe(leadId) {
  if (!leadId) return "";
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("leads").select("name").eq("id", leadId).limit(1);
    if (error) return "";
    const name = String(data?.[0]?.name || "").trim();
    return name;
  } catch {
    return "";
  }
}

function makeConversationId(fallback = "") {
  if (fallback) return String(fallback);
  try {
    // eslint-disable-next-line no-undef
    return crypto?.randomUUID?.() || Math.random().toString(16).slice(2);
  } catch {
    return Math.random().toString(16).slice(2);
  }
}

async function saveConversation({ leadId, message, sender }) {
  if (!leadId) return;
  const sb = supabaseAdmin();
  await sb.from("conversations").insert({ lead_id: leadId, message, sender }).throwOnError();
}

function scoreLeadMessage(text) {
  const raw = String(text || "");
  const t = raw.toLowerCase();

  // Signals: invest intent + amount mentioned ⇒ HOT
  const investIntent =
    /\b(invest|investing|sip|mutual\s*fund|mf\b|pms|portfolio|allocation|lumpsum|swp|elss|equity|debt|goal|retirement|wealth)\b/.test(
      t
    );

  const questionish =
    /\?/.test(raw) ||
    /\b(how|what|which|can i|should i|help me|guide me|tell me)\b/.test(t);

  // Amount detection: require INR context or Indian units (avoid phone-like numbers).
  const hasInrContext = /\b(inr|rs\.?|rupees)\b/.test(t) || /₹/.test(raw);
  const hasIndianUnit = /\b(k|lakh|lakhs|lac|lacs|crore|cr)\b/.test(t);
  const amountLike =
    /₹\s*\d{1,3}(?:,\d{3})+(?:\.\d+)?/.test(raw) ||
    /₹\s*\d+(?:\.\d+)?/.test(raw) ||
    /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/.test(raw) ||
    /\b\d+(?:\.\d+)?\s*(?:k|lakh|lakhs|lac|lacs|crore|cr)\b/i.test(raw);
  const amountMentioned = amountLike && (hasInrContext || hasIndianUnit);

  let tier = "COLD";
  if (amountMentioned && investIntent) tier = "HOT";
  else if (investIntent || questionish) tier = "WARM";

  return {
    tier,
    signals: { investIntent, amountMentioned, questionish },
  };
}

async function saveLeadScore({ leadId, score }) {
  if (!leadId) return;
  const sb = supabaseAdmin();
  await sb
    .from("events")
    .insert({
      lead_id: leadId,
      event_type: "lead_score",
      data: score,
    })
    .throwOnError();
}

async function callGemini({ apiKey, userText, conversationHistory = [], userName = "" }) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  // System prompt (SEBI-safe wording) + guardrails.
  const systemBase =
    "You are BM Wealth's financial assistant.\n" +
    "Provide educational guidance only (SEBI compliant — no specific investment advice).\n" +
    "Topics: mutual funds, SIP, insurance, fixed deposits.\n" +
    "Be helpful, professional, Mumbai-style friendly.\n" +
    "AMFI Registered • IRDAI Licensed.\n\n" +
    "STRICT WORDING RULES:\n" +
    "- Do NOT mention specific product types (example: \"equity mutual fund\").\n" +
    "- Do NOT mention fund categories (example: \"large cap\").\n" +
    "- Do NOT mention investment strategies (example: \"aggressive growth\").\n" +
    "- Prefer neutral phrases like: \"various mutual fund options\" and \"suitable investment products\".\n" +
    "- For anything that depends on personal details, say: \"consult our advisors for personalized recommendations\".\n" +
    "- Do not create urgency or hype.\n" +
    "- Keep answers concise and clear (4–8 short lines).";

  const system = [
    systemBase,
    userName ? `The user's name is "${userName}". Use it naturally (do not overuse).` : "",
    "Do NOT provide personalized recommendations, price targets, or specific buy/sell/hold calls.",
    "End every reply with this exact line (once): consult our advisors for personalized recommendations.",
    "Do NOT repeat the BM Wealth compliance footer text (it is shown once in the chat UI).",
  ]
    .filter(Boolean)
    .join("\n\n");

  const contents = [];
  for (const h of conversationHistory || []) {
    const sender = h?.sender === "user" ? "user" : "model";
    const text = String(h?.text || "").trim();
    if (!text) continue;
    contents.push({ role: sender, parts: [{ text }] });
  }
  contents.push({ role: "user", parts: [{ text: userText }] });

  const body = {
    systemInstruction: { role: "system", parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    // Log full failure details to server console for debugging (no secrets included).
    console.error("[api/chat] Gemini HTTP error", { status: r.status, body: t });
    throw new Error(`Gemini error: ${r.status} ${t}`);
  }

  const json = await r.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("") ||
    "I can help with educational guidance. consult our advisors for personalized recommendations.";
  return text.trim();
}

function cannedEducationalAnswer(userText) {
  const t = String(userText || "").toLowerCase();
  if (/\bsip\b/.test(t) || t.includes("systematic investment plan")) {
    return (
      "A SIP (Systematic Investment Plan) is a way to invest a fixed amount at regular intervals (e.g., monthly) into a mutual fund.\n" +
      "It helps build investing discipline and averages purchase cost across market ups/downs.\n" +
      "Example: investing ₹5,000 every month toward a long-term goal using various mutual fund options.\n\n" +
      "consult our advisors for personalized recommendations."
    );
  }
  return "";
}

async function callClaude({ apiKey, userText }) {
  const url = "https://api.anthropic.com/v1/messages";
  const system =
    `You are BM Wealth Admin AI assistant. Provide operational guidance for BM Wealth business (analytics, funnels, copy). ` +
    `Do not produce personalized investment advice. Always keep compliance text available: "${COMPLIANCE_TEXT}"`;

  const body = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 800,
    temperature: 0.4,
    system,
    messages: [{ role: "user", content: userText }],
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Claude error: ${r.status} ${t}`);
  }

  const json = await r.json();
  const text =
    json?.content?.map((c) => (c?.type === "text" ? c.text : "")).filter(Boolean).join("") ||
    "Admin assistant ready.";
  return text.trim();
}

export async function POST(req) {
  const env = getAIEnvSafe();
  const cookieStore = await cookies();
  const isAdmin = isAdminFromCookies(cookieStore);

  const body = await req.json().catch(() => ({}));
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const { message, leadId } = parsed.data;
  const mode = parsed.data.mode || "user";
  const conversationId = makeConversationId(parsed.data.conversationId || "");

  // Rate limit (best-effort): max 10 msgs/min/user.
  const rl = consumeRate(rateKey(req, leadId));
  if (!rl.allowed) {
    console.warn("[api/chat] rate_limited", { conversationId, leadId, mode });
    return NextResponse.json(
      { ok: false, error: "rate_limited", conversationId, retryAfterMs: rl.retryAfterMs },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil(rl.retryAfterMs / 1000))),
        },
      }
    );
  }

  const conversationHistory = (parsed.data.conversationHistory || [])
    .filter((x) => x && typeof x.text === "string" && (x.sender === "user" || x.sender === "bot"))
    .slice(-5)
    .map((x) => ({
      sender: x.sender,
      text: String(x.text || "").trim().slice(0, 2000),
    }))
    .filter((x) => x.text);

  // Persist user message (best-effort)
  try {
    await saveConversation({ leadId, message, sender: "user" });
  } catch {
    // ignore if DB not configured yet
  }

  // Lead qualification (best-effort; only when a real lead exists)
  if (leadId && mode !== "admin") {
    try {
      const score = scoreLeadMessage(message);
      await saveLeadScore({ leadId, score });
    } catch {
      // ignore if DB not configured yet
    }
  }

  try {
    let reply;
    if (mode === "admin") {
      if (!isAdmin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
      if (!env?.ANTHROPIC_API_KEY) {
        console.error("[api/chat] missing ANTHROPIC_API_KEY", { conversationId });
        throw new Error("setup_required");
      }
      reply = await callClaude({ apiKey: env.ANTHROPIC_API_KEY, userText: message });
    } else {
      if (!env?.GEMINI_API_KEY) {
        console.error("[api/chat] missing GEMINI_API_KEY", { conversationId });
        throw new Error("setup_required");
      }
      const userName = await getLeadNameSafe(leadId);
      reply = await callGemini({
        apiKey: env.GEMINI_API_KEY,
        userText: message,
        conversationHistory,
        userName,
      });

      // Keep chat clean: do not repeat the compliance footer text in every reply.
      reply = stripComplianceFooter(reply);

      // If the model returns something too short/empty, use a safe canned explainer.
      const cleaned = String(reply || "").trim();
      if (cleaned.length < 4) {
        const canned = cannedEducationalAnswer(message);
        if (canned) reply = canned;
      }
    }

    try {
      await saveConversation({ leadId, message: reply, sender: "bot" });
    } catch {
      // ignore if DB not configured yet
    }
    return NextResponse.json({ ok: true, reply, conversationId });
  } catch (e) {
    const msg = e?.message || "chat_failed";
    const provider = mode === "admin" ? "anthropic" : "gemini";

    // Log exact failure to server console for debugging.
    console.error("[api/chat] provider failure", { provider, conversationId, leadId, mode, error: msg });
    await logEventSafe({
      leadId,
      event_type: "chat_error",
      data: {
        provider,
        conversationId,
        mode,
        error: String(msg || "chat_failed").slice(0, 600),
      },
    });

    // If AI is unavailable (quota/setup/etc), provide a safe fallback.
    const canned = cannedEducationalAnswer(message);
    const fallback = canned || "I’m having a temporary connectivity issue right now. Please try again in a moment.";
    try {
      await saveConversation({ leadId, message: fallback, sender: "bot" });
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: true, reply: fallback, conversationId, warn: msg });
  }
}




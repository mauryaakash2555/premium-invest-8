import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAIEnvSafe } from "@/config/env";
import { CONSTANTS } from "@/config/constants";
import { isFeatureEnabled } from "@/config/features";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { AFFILIATE_CONTEXT_PROMPT, getAIResponse } from "@/lib/ai/provider";
import { buildConversationHistorySafe } from "@/lib/ai/contextManager";
import { getLeadContactSafe, getLeadNameSafe, updateLeadScoreColumnSafe } from "@/lib/db/leads";
import { countUserMessagesSafe, saveMessage } from "@/lib/db/conversations";
import { logEventSafe, saveLeadScoreEvent } from "@/lib/db/events";
import { consumeRate, makeRateKey } from "@/lib/utils/rateLimiter";
import { sanitizeInput } from "@/lib/utils/validator";
import { logger } from "@/lib/utils/logger";
import { loadPlugins } from "@/lib/plugins/loadPlugins";
import { runPluginHook } from "@/lib/plugins/PluginManager";

const historySchema = z
  .array(
    z.union([
      z.object({
        // New client format
        role: z.enum(["user", "bot"]),
        message: z.string().min(1).max(6000),
      }),
      z.object({
        // Backwards compatible format
        sender: z.enum(["user", "bot"]),
        text: z.string().min(1).max(6000),
      }),
    ])
  )
  .max(20);

const reqSchema = z.object({
  message: z.string().min(1).max(6000),
  conversationHistory: historySchema.optional(),
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

function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  return String(xff).split(",")[0]?.trim() || "";
}

function buildAdminStrategicPrompt({ userName = "Akash" } = {}) {
  return (
    `You are BM Wealth's strategic business advisor.\n` +
    `User is ${userName} (founder).\n\n` +
    `Analyze provided metrics and give:\n` +
    `- Revenue optimization recommendations\n` +
    `- Marketing strategy suggestions\n` +
    `- Competitive positioning advice\n` +
    `- Growth opportunities\n` +
    `- Risk analysis\n\n` +
    `Be direct, data-driven, actionable. Act like a demanding business partner who pushes for better results.\n` +
    `Output format:\n` +
    `1) Executive snapshot (2-3 bullets)\n` +
    `2) Priority actions (P0/P1/P2, each with owner + next step)\n` +
    `3) Funnel diagnosis (visitors -> conversations -> leads)\n` +
    `4) Messaging improvements (top objections/questions)\n` +
    `5) 7-day experiment plan (metrics + expected impact)\n\n` +
    `Constraints:\n` +
    `- Do NOT give personalized investment advice.\n` +
    `- Do NOT mention API keys or internal secrets.\n`
  );
}

async function buildAdminContextSafe() {
  try {
    const sb = supabaseAdmin();
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(dayStart);
    {
      const day = weekStart.getDay(); // 0 Sun..6 Sat
      const diff = (day === 0 ? -6 : 1) - day;
      weekStart.setDate(weekStart.getDate() + diff);
    }
    const monthStart = new Date(dayStart);
    monthStart.setDate(1);

    const [leadsTodayRes, leadsWeekRes, leadsAllCountRes, convTodayRes, convWeekRes, revMonthRes, aiTodayRes] =
      await Promise.all([
        sb.from("leads").select("id,created_at").gte("created_at", dayStart.toISOString()).order("created_at", { ascending: false }).limit(500),
        sb.from("leads").select("id,created_at").gte("created_at", weekStart.toISOString()).order("created_at", { ascending: false }).limit(2000),
        sb.from("leads").select("count", { count: "exact", head: true }),
        sb.from("conversations").select("id,lead_id,message,sender,created_at").gte("created_at", dayStart.toISOString()).order("created_at", { ascending: false }).limit(300),
        sb.from("conversations").select("id,lead_id,message,sender,created_at").gte("created_at", weekStart.toISOString()).order("created_at", { ascending: false }).limit(1000),
        sb.from("events").select("id,event_type,data,created_at").gte("created_at", monthStart.toISOString()).filter("event_type", "in", '("revenue","revenue_manual")').order("created_at", { ascending: false }).limit(500),
        sb.from("events").select("id,data,created_at").gte("created_at", dayStart.toISOString()).eq("event_type", "chat_ai").order("created_at", { ascending: false }).limit(500),
      ]);

    const leadsToday = leadsTodayRes.data || [];
    const leadsWeek = leadsWeekRes.data || [];
    const convToday = convTodayRes.data || [];
    const convWeek = convWeekRes.data || [];

    const revenueMonth = (revMonthRes.data || []).reduce((sum, e) => {
      const n = Number(e?.data?.amount);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);

    const providerCounts = { groq: 0, gemini: 0, anthropic: 0, rule: 0 };
    for (const e of aiTodayRes.data || []) {
      const p = String(e?.data?.provider || "").toLowerCase();
      if (p === "groq") providerCounts.groq += 1;
      else if (p === "gemini") providerCounts.gemini += 1;
      else if (p === "anthropic" || p === "claude") providerCounts.anthropic += 1;
      else if (p === "rule") providerCounts.rule += 1;
    }

    // Top questions (week) quick heuristic: user messages containing '?'
    const qMap = new Map();
    for (const c of convWeek) {
      if (c.sender !== "user") continue;
      const msg = String(c.message || "").trim();
      if (!msg) continue;
      if (!msg.includes("?") && msg.length > 140) continue;
      const key = msg.toLowerCase().replace(/\s+/g, " ").slice(0, 140);
      if (!key) continue;
      qMap.set(key, (qMap.get(key) || 0) + 1);
    }
    const topQuestions = Array.from(qMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([q, count]) => ({ q, count }));

    return {
      asOf: now.toISOString(),
      leads: {
        today: leadsToday.length,
        week: leadsWeek.length,
        total: leadsAllCountRes.count || 0,
      },
      conversations: {
        today: convToday.length,
        week: convWeek.length,
      },
      revenue: {
        month: revenueMonth,
      },
      ai_usage_today: providerCounts,
      top_questions_week: topQuestions,
      notes: {
        data_source: "supabase",
      },
    };
  } catch {
    return { asOf: new Date().toISOString(), error: "context_unavailable" };
  }
}

// (logEventSafe + getLeadNameSafe moved to /lib/db/*)

function makeConversationId(fallback = "") {
  if (fallback) return String(fallback);
  try {
    // eslint-disable-next-line no-undef
    return crypto?.randomUUID?.() || Math.random().toString(16).slice(2);
  } catch {
    return Math.random().toString(16).slice(2);
  }
}

function buildSeBiSafeSystemPrompt({ userName = "" } = {}) {
  const base =
    "You are BM Wealth's financial assistant. Provide educational guidance only.\n" +
    "Never recommend specific products, funds, or stocks. Use phrases like 'various mutual fund options available' not 'invest in equity funds'.\n" +
    "Topics: mutual funds, SIP, insurance, fixed deposits. Be helpful, professional, Mumbai-friendly.\n" +
    "Answer ONLY the user's latest message. Do NOT repeat or paraphrase the question at the start.\n" +
    "Do NOT include greetings like 'Welcome to BM Wealth' unless the user only greets and asks nothing else.\n" +
    "Do NOT insert filler greetings like 'hi', 'hello', 'hey' inside sentences.\n" +
    "You MAY refer to the user's earlier messages when helpful (example: 'As you mentioned earlier...') and connect the context naturally.\n" +
    "Do NOT list all topics; respond only to what the user asked.\n" +
    "Keep answers concise (3-4 sentences max).";

  const extras = [
    userName ? `The user's name is "${userName}". Use it naturally (do not overuse).` : "",
    "If asked for what to choose / which is best / personalized advice, say: consult our advisors for personalized recommendations.",
    AFFILIATE_CONTEXT_PROMPT,
  ].filter(Boolean);

  return extras.length ? `${base}\n\n${extras.join("\n")}` : base;
}

function extractAffiliatePlatformsTag(text) {
  const raw = String(text || "");
  // Match: [[affiliate_platforms:Zerodha,Groww,Angel One]]
  const re = /\[\[affiliate_platforms:([^\]]+)\]\]/i;
  const m = raw.match(re);
  if (!m) return { cleaned: raw, platforms: null };

  const list = String(m[1] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const cleaned = raw.replace(re, "").replace(/\n{3,}/g, "\n\n").trim();
  return { cleaned, platforms: list.length ? list : null };
}

function stripFillerHi(text) {
  let t = String(text || "");
  if (!t) return "";
  // Remove mid-sentence ", hi" / ", hi," patterns that some models may insert.
  t = t.replace(/,\s*hi\b\s*,\s*/gi, ", ");
  t = t.replace(/,\s*hi\b\s*\./gi, ".");
  t = t.replace(/,\s*hi\b\s*!/gi, "!");
  t = t.replace(/,\s*hi\b\s*\?/gi, "?");
  t = t.replace(/,\s*hi\b(?=\s)/gi, "");
  // Clean up spacing artifacts
  t = t.replace(/\s+([,.!?])/g, "$1").replace(/[ \t]{2,}/g, " ").trim();
  return t;
}

function truncateToSentences(text, maxSentences = 4) {
  const t = String(text || "").trim();
  if (!t) return "";
  const parts = t.match(/[^.!?\n]+(?:[.!?]+|\n+|$)/g) || [t];
  const out = parts.slice(0, maxSentences).join("").trim();
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

// (saveConversation moved to /lib/db/conversations)

function computeLeadScore({ message, hasEmail, hasPhone, userMessageCount }) {
  const raw = String(message || "");
  const t = raw.toLowerCase();

  const questionish =
    /\?/.test(raw) || /\b(how|what|which|can i|should i|help me|guide me|tell me)\b/.test(t);

  const getStartedIntent =
    /\b(how\s+to\s+invest|get\s+started|start\s+investing|begin\s+investing|how\s+do\s+i\s+invest)\b/.test(t);

  const investIntent = /\b(invest|investing|sip|mutual\s*fund|mf\b|portfolio)\b/.test(t);

  // Amount detection (avoid phone numbers by requiring INR context or Indian units).
  const hasInrContext = /\b(inr|rs\.?|rupees)\b/.test(t) || /₹/.test(raw);
  const hasIndianUnit = /\b(k|lakh|lakhs|lac|lacs|crore|cr)\b/.test(t);
  const amountLike =
    /₹\s*\d{1,3}(?:,\d{3})+(?:\.\d+)?/.test(raw) ||
    /₹\s*\d+(?:\.\d+)?/.test(raw) ||
    /\b\d+(?:\.\d+)?\s*(?:k|lakh|lakhs|lac|lacs|crore|cr)\b/i.test(raw);
  const amountMentioned = amountLike && (hasInrContext || hasIndianUnit);

  const contactPoints = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0);
  const engaged = Number(userMessageCount || 0) >= 3;
  const veryEngaged = Number(userMessageCount || 0) >= 5;

  let score = 0;
  const reasons = [];

  if (contactPoints === 2) {
    score += 30;
    reasons.push("contact_email_phone");
  } else if (contactPoints === 1) {
    score += 20;
    reasons.push("contact_partial");
  }

  if (questionish) {
    score += 10;
    reasons.push("questions");
  }

  if (investIntent) {
    score += 15;
    reasons.push("invest_intent");
  }

  // Hard intent mapping (as requested):
  // - Mentioned amount => at least WARM 60
  // - Asked "how to invest / get started" => at least HOT 85
  if (amountMentioned) {
    score = Math.max(score, 60);
    reasons.push("amount_warm60");
  }
  if (getStartedIntent) {
    score = Math.max(score, 85);
    reasons.push("how_to_invest_hot85");
  }

  if (veryEngaged) {
    score += 15;
    reasons.push("very_engaged");
  } else if (engaged) {
    score += 10;
    reasons.push("engaged");
  }

  score = Math.max(0, Math.min(100, score));
  const tier =
    score >= CONSTANTS.LEAD_SCORING.HOT_THRESHOLD
      ? "HOT"
      : score >= CONSTANTS.LEAD_SCORING.WARM_THRESHOLD
        ? "WARM"
        : "COLD";

  return {
    score,
    tier,
    reasons,
    signals: { questionish, investIntent, getStartedIntent, amountMentioned, hasEmail, hasPhone, userMessageCount },
  };
}

// getLeadContactSafe + countUserMessagesSafe moved to /lib/db/*

// updateLeadScoreColumnSafe moved to /lib/db/leads

function detectInvestmentIntent(message) {
  const raw = String(message || "");
  const t = raw.toLowerCase();
  const hasInrContext = /\b(inr|rs\.?|rupees)\b/.test(t) || /₹/.test(raw);
  const hasIndianUnit = /\b(k|lakh|lakhs|lac|lacs|crore|cr)\b/.test(t);
  const amountLike =
    /₹\s*\d{1,3}(?:,\d{3})+(?:\.\d+)?/.test(raw) ||
    /₹\s*\d+(?:\.\d+)?/.test(raw) ||
    /\b\d+(?:\.\d+)?\s*(?:k|lakh|lakhs|lac|lacs|crore|cr)\b/i.test(raw);
  const amountMentioned = amountLike && (hasInrContext || hasIndianUnit);
  const howToInvest = /\b(how\s+to\s+invest|get\s+started|start\s+investing|begin\s+investing|how\s+do\s+i\s+invest)\b/.test(t);
  const wantsBest = /\b(which\s+fund|best\s+fund|which\s+is\s+best|recommend|suggest)\b/.test(t);
  return { amountMentioned, howToInvest, wantsBest };
}

function buildConsultationReply({ userName = "", amountMentioned, howToInvest }) {
  const name = userName ? `${userName}, ` : "";
  const first =
    amountMentioned
      ? `${name}that’s a great start. Many investors use SIP for regular investing.`
      : `${name}many investors start with SIP for regular investing.`;

  const body =
    "We distribute various mutual fund options (equity/debt/hybrid categories) through our AMFI-registered platform.\n\n" +
    "To suggest suitable investment products, our advisors will understand:\n" +
    "- Your investment goals\n" +
    "- Investment timeline\n" +
    "- Risk comfort level\n\n" +
    "Book consultation for personalized guidance.\n\n" +
    "Would you like to schedule a call with our advisor?";

  // Keep it concise; avoid categories/allocations/returns.
  return `${first}\n\n${body}`;
}

// saveLeadScore moved to /lib/db/events (saveLeadScoreEvent)

// (AI provider calls moved to /lib/ai/*)

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

// (Claude provider call moved to /lib/ai/claude)

export async function POST(req) {
  let affiliate_platforms = null;
  const env = getAIEnvSafe();
  const cookieStore = await cookies();
  const isAdmin = isAdminFromCookies(cookieStore);

  const body = await req.json().catch(() => ({}));
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const { message: rawMessage, leadId } = parsed.data;
  const message = sanitizeInput(rawMessage);
  if (!message) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const mode = parsed.data.mode || "user";
  const conversationId = makeConversationId(parsed.data.conversationId || "");

  const adminSession = Boolean(isAdmin && mode === "admin");

  // Plugins (best-effort)
  await loadPlugins();
  await runPluginHook("onChatMessage", {
    message,
    leadId: leadId || null,
    mode: adminSession ? "admin" : "user",
    conversationId,
  });

  // Rate limit (best-effort):
  // - User: 10/min
  // - Admin: 50/hour
  const ip = getClientIp(req);
  const rl = consumeRate(
    makeRateKey({ isAdmin: adminSession, leadId, ip }),
    adminSession ? CONSTANTS.RATE_LIMITS.ADMIN : CONSTANTS.RATE_LIMITS.USER
  );
  if (!rl.allowed) {
    logger.warn("[api/chat] rate_limited", { conversationId, leadId, mode });
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
    .map((x) => {
      if (x && typeof x === "object") {
        if (Object.prototype.hasOwnProperty.call(x, "role") || Object.prototype.hasOwnProperty.call(x, "message")) {
          const role = x.role === "user" ? "user" : "bot";
          const message = String(x.message || "").trim();
          return { sender: role, text: message };
        }
        const sender = x.sender === "user" ? "user" : "bot";
        const text = String(x.text || "").trim();
        return { sender, text };
      }
      return null;
    })
    .filter((x) => x && (x.sender === "user" || x.sender === "bot") && typeof x.text === "string")
    .slice(-10)
    .map((x) => ({
      sender: x.sender,
      text: String(x.text || "").trim().slice(0, 2000),
    }))
    .filter((x) => x.text);

  // Persist user message (best-effort) - NEVER persist admin mode messages into lead conversations.
  if (!adminSession) {
    try {
      await saveMessage({ leadId, message, sender: "user" });
    } catch {
      // ignore if DB not configured yet
    }
  }

  // Lead qualification (best-effort; only when a real lead exists)
  if (isFeatureEnabled("LEAD_SCORING") && leadId && mode !== "admin") {
    try {
      const [{ hasEmail, hasPhone }, userMessageCount] = await Promise.all([
        getLeadContactSafe(leadId),
        countUserMessagesSafe(leadId),
      ]);

      const score = computeLeadScore({ message, hasEmail, hasPhone, userMessageCount });
      await saveLeadScoreEvent({ leadId, score });
      await updateLeadScoreColumnSafe(leadId, score.score);
    } catch {
      // ignore if DB not configured yet
    }
  }

  try {
    let reply;
    let providerUsed = null;
    if (adminSession) {
      if (!isFeatureEnabled("CLAUDE_ADMIN")) {
        return NextResponse.json({ ok: false, error: "disabled" }, { status: 404 });
      }
      const context = await buildAdminContextSafe();
      const system = buildAdminStrategicPrompt({ userName: "Akash" });
      const a = await getAIResponse({
        message,
        isAdmin: true,
        system,
        context,
        conversationHistory: [],
        keys: {
          ANTHROPIC_API_KEY: env?.ANTHROPIC_API_KEY,
          GEMINI_API_KEY: env?.GEMINI_API_KEY,
          GROQ_API_KEY: env?.GROQ_API_KEY,
        },
        claude: { maxTokens: 800, temperature: 0.4 },
      });
      if (a.error) throw new Error(a.error);
      reply = a.reply;
      providerUsed = a.provider || "anthropic";

      // Cost / usage tracking
      await logEventSafe({
        leadId,
        event_type: "chat_ai",
        data: { provider: providerUsed, conversationId, mode: "admin", fallback_from: a.fallback_from || null },
      });
    } else {
      const userName = await getLeadNameSafe(leadId);
      const intent = detectInvestmentIntent(message);

      // Log intent signals (best-effort)
      if (leadId) {
        await logEventSafe({
          leadId,
          event_type: "lead_intent",
          data: {
            conversationId,
            amountMentioned: intent.amountMentioned,
            howToInvest: intent.howToInvest,
            wantsBest: intent.wantsBest,
            message: String(message || "").slice(0, 240),
          },
        });
      }

      // SEBI-safe selling logic: when the user shows investment intent, offer a consultation CTA.
      const shouldOfferConsultation = intent.amountMentioned || intent.howToInvest || intent.wantsBest;
      const cta = shouldOfferConsultation
        ? {
            label: "Book Free Consultation",
            href: "/contact",
          }
        : null;

      // If intent is strong, respond with a guided consultation prompt (still SEBI-safe).
      if (shouldOfferConsultation) {
        reply = buildConsultationReply({
          userName,
          amountMentioned: intent.amountMentioned,
          howToInvest: intent.howToInvest,
        });
        // Persist bot message (best-effort) even on this early-return path.
        try {
          await saveMessage({ leadId, message: reply, sender: "bot" });
        } catch {
          // ignore
        }

        // Log provider used for admin visibility (this path is rule-based).
        await logEventSafe({
          leadId,
          event_type: "chat_ai",
          data: { provider: "rule", conversationId, mode: "user", fallback_from: null },
        });

        await runPluginHook("onChatReply", {
          reply,
          provider: "rule",
          leadId: leadId || null,
          mode: "user",
          conversationId,
        });

        return NextResponse.json({ ok: true, reply, conversationId, cta, intent });
      }

      const memoryHistory = await buildConversationHistorySafe({
        leadId,
        fallbackHistory: conversationHistory,
        limit: 12,
      });
      const system = buildSeBiSafeSystemPrompt({ userName });
      const g = await getAIResponse({
        message,
        isAdmin: false,
        system,
        context: null,
        conversationHistory: memoryHistory,
        keys: {
          ANTHROPIC_API_KEY: env?.ANTHROPIC_API_KEY,
          GEMINI_API_KEY: env?.GEMINI_API_KEY,
          GROQ_API_KEY: env?.GROQ_API_KEY,
        },
      });
      if (g.error) throw new Error(g.error);
      // Extract affiliate button metadata before cleanup/truncation.
      {
        const extracted = extractAffiliatePlatformsTag(g.reply);
        reply = extracted.cleaned;
        affiliate_platforms = extracted.platforms;
      }
      providerUsed = g.provider || "unknown";

      // Keep chat clean: do not repeat the compliance footer text in every reply.
      reply = stripComplianceFooter(reply);
      // Remove any stray mid-sentence filler "hi" artifacts from model output.
      reply = stripFillerHi(reply);

      // If the model returns something too short/empty, use a safe canned explainer.
      const cleaned = String(reply || "").trim();
      if (cleaned.length < 4) {
        const canned = cannedEducationalAnswer(message);
        if (canned) reply = canned;
      }

      // Enforce brevity (3–4 sentences max).
      reply = truncateToSentences(reply, 4);

      // Log which provider answered (admin visibility)
      await logEventSafe({
        leadId,
        event_type: "chat_ai",
        data: {
          provider: providerUsed,
          conversationId,
          mode: "user",
          fallback_from: g.fallback_from || null,
        },
      });
    }

    try {
      if (!adminSession) {
        await saveMessage({ leadId, message: reply, sender: "bot" });
      }
    } catch {
      // ignore if DB not configured yet
    }

    await runPluginHook("onChatReply", {
      reply,
      provider: providerUsed,
      leadId: leadId || null,
      mode: adminSession ? "admin" : "user",
      conversationId,
    });
    return NextResponse.json({ ok: true, reply, conversationId, affiliate_platforms });
  } catch (e) {
    const msg = e?.message || "chat_failed";
    const provider = adminSession ? "anthropic" : "ai";

    // Log exact failure to server console for debugging.
    logger.error("[api/chat] provider failure", { provider, conversationId, leadId, mode, error: msg });
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
      await saveMessage({ leadId, message: fallback, sender: "bot" });
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: true, reply: fallback, conversationId, warn: msg });
  }
}







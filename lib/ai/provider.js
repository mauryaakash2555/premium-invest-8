/**
 * AI Provider Orchestrator
 * Automatically picks a working provider based on feature flags + configured keys.
 */

import { isFeatureEnabled } from "@/config/features";
import { CONSTANTS } from "@/config/constants";
import { callGeminiSafe } from "@/lib/ai/gemini";
import { callGroqSafe } from "@/lib/ai/groq";
import { callClaudeSafe } from "@/lib/ai/claude";
import { consumeRate } from "@/lib/utils/rateLimiter";

// Affiliate context (FEATURE 10)
// This is appended to the user-chat system prompt in app/api/chat/route.js.
export const AFFILIATE_CONTEXT_PROMPT =
  "When the user asks about investing or trading platforms, you MAY mention these popular options as neutral choices (do not recommend one).\n" +
  "\n" +
  "TRADING PLATFORMS (options to explore):\n" +
  "- Zerodha: Zero brokerage for equity delivery, popular with active traders\n" +
  "- Groww: Beginner-friendly, simple interface\n" +
  "- Angel One: Advanced tools and charts\n" +
  "\n" +
  "INSURANCE (option to explore):\n" +
  "- HDFC Life: Life insurance plans\n" +
  "\n" +
  "INVESTMENTS (option to explore):\n" +
  "- Smallcase: Thematic portfolios (tech, ESG, etc.)\n" +
  "\n" +
  "IMPORTANT:\n" +
  "- Present as options: 'Popular platforms investors use include…'\n" +
  "- Do NOT recommend a specific platform or say 'best'\n" +
  "- Always suggest speaking to our advisors for personalized guidance\n" +
  "\n" +
  "If you mention any of the platforms above, end your reply with a SINGLE extra line exactly like this (so the UI can show buttons):\n" +
  "[[affiliate_platforms:Zerodha,Groww,Angel One]]\n" +
  "(Use a comma-separated subset as needed; keep names exactly as shown.)\n";

function hasKey(v) {
  return Boolean(String(v || "").trim());
}

function getDayKeyUtc() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function withinDailyLimit({ provider, userType, max }) {
  const limit = Number(max);
  if (!Number.isFinite(limit) || limit <= 0) return true;
  const key = `ai_daily:${String(provider)}:${String(userType)}:${getDayKeyUtc()}`;
  const rl = consumeRate(key, { max: limit, windowMs: 86_400_000 });
  return Boolean(rl.allowed);
}

/**
 * @typedef {Object} AIResponse
 * @property {string} reply
 * @property {string|null} error
 * @property {string|null} provider
 * @property {string|null} fallback_from
 * @property {{inputTokens:number|null, outputTokens:number|null, totalTokens:number|null}|null} [usage]
 */

/**
 * @param {Object} params
 * @param {string} params.message
 * @param {Array<{sender:'user'|'bot', text:string}>} [params.conversationHistory]
 * @param {string} [params.system]
 * @param {Object|null} [params.context] - Admin-only JSON context (Claude)
 * @param {'public'|'family_admin'|'super_admin'} [params.userType]
 * @param {Object} params.keys
 * @param {string} [params.keys.GEMINI_API_KEY]
 * @param {string} [params.keys.GROQ_API_KEY]
 * @param {string} [params.keys.ANTHROPIC_API_KEY]
 * @param {Object} [params.claude]
 * @param {number} [params.claude.maxTokens]
 * @param {number} [params.claude.temperature]
 * @returns {Promise<AIResponse>}
 */
export async function getAIResponse({
  message,
  conversationHistory = [],
  system = "",
  context = null,
  userType = "public",
  keys,
  claude = {},
}) {
  const text = String(message || "").trim();
  if (!text) {
    return { error: "empty_message", reply: "", provider: null, fallback_from: null };
  }

  const isSuperAdmin = userType === "super_admin";
  const isFamilyAdmin = userType === "family_admin";
  const wantGemini = isFeatureEnabled("USE_GEMINI");
  const wantGroq = isFeatureEnabled("USE_GROQ");
  const wantClaudeSuper = Boolean(isSuperAdmin && isFeatureEnabled("CLAUDE_ADMIN") && isFeatureEnabled("USE_CLAUDE"));
  const claudeAllowedUsers = Array.isArray(CONSTANTS?.API_LIMITS?.CLAUDE_ALLOWED_USERS)
    ? CONSTANTS.API_LIMITS.CLAUDE_ALLOWED_USERS
    : ["super_admin"];

  let fallbackFrom = null;

  // SUPER ADMIN: Claude first (when enabled), then Groq, then Gemini
  if (wantClaudeSuper && hasKey(keys?.ANTHROPIC_API_KEY) && claudeAllowedUsers.includes("super_admin")) {
    if (!withinDailyLimit({ provider: "anthropic", userType, max: CONSTANTS?.API_LIMITS?.CLAUDE_DAILY_LIMIT })) {
      fallbackFrom = "anthropic";
    } else {
    const res = await callClaudeSafe({
      apiKey: keys.ANTHROPIC_API_KEY,
      userText: text,
      system,
      context,
      maxTokens: claude?.maxTokens ?? 900,
      temperature: claude?.temperature ?? 0.35,
    });
    if (!res.error) return { error: null, reply: res.reply, provider: "anthropic", fallback_from: null, usage: res.usage || null };
    fallbackFrom = "anthropic";
    }
  }

  if (isSuperAdmin) {
    if (wantGroq && hasKey(keys?.GROQ_API_KEY)) {
      if (withinDailyLimit({ provider: "groq", userType, max: CONSTANTS?.API_LIMITS?.GROQ_DAILY_LIMIT })) {
        const res = await callGroqSafe({
          apiKey: keys.GROQ_API_KEY,
          userText: text,
          conversationHistory,
          system,
        });
        if (!res.error) return { error: null, reply: res.reply, provider: "groq", fallback_from: fallbackFrom, usage: res.usage || null };
        if (!fallbackFrom) fallbackFrom = "groq";
      } else if (!fallbackFrom) fallbackFrom = "groq";
    }

    if (wantGemini && hasKey(keys?.GEMINI_API_KEY)) {
      if (withinDailyLimit({ provider: "gemini", userType, max: CONSTANTS?.API_LIMITS?.GEMINI_DAILY_LIMIT })) {
        const res = await callGeminiSafe({
          apiKey: keys.GEMINI_API_KEY,
          userText: text,
          conversationHistory,
          system,
        });
        if (!res.error) return { error: null, reply: res.reply, provider: "gemini", fallback_from: fallbackFrom, usage: res.usage || null };
        if (!fallbackFrom) fallbackFrom = "gemini";
      } else if (!fallbackFrom) fallbackFrom = "gemini";
    }

    return {
      error: "all_providers_failed",
      reply: "I'm having connectivity issues. Please try again.",
      provider: null,
      fallback_from: fallbackFrom,
    };
  }

  // FAMILY ADMIN: Groq first, then Gemini
  if (isFamilyAdmin) {
    if (wantGroq && hasKey(keys?.GROQ_API_KEY)) {
      if (withinDailyLimit({ provider: "groq", userType, max: CONSTANTS?.API_LIMITS?.GROQ_DAILY_LIMIT })) {
        const res = await callGroqSafe({
          apiKey: keys.GROQ_API_KEY,
          userText: text,
          conversationHistory,
          system,
        });
        if (!res.error) return { error: null, reply: res.reply, provider: "groq", fallback_from: null, usage: res.usage || null };
        fallbackFrom = "groq";
      } else {
        fallbackFrom = "groq";
      }
    }

    if (wantGemini && hasKey(keys?.GEMINI_API_KEY)) {
      if (withinDailyLimit({ provider: "gemini", userType, max: CONSTANTS?.API_LIMITS?.GEMINI_DAILY_LIMIT })) {
        const res = await callGeminiSafe({
          apiKey: keys.GEMINI_API_KEY,
          userText: text,
          conversationHistory,
          system,
        });
        if (!res.error) return { error: null, reply: res.reply, provider: "gemini", fallback_from: fallbackFrom, usage: res.usage || null };
        if (!fallbackFrom) fallbackFrom = "gemini";
      } else if (!fallbackFrom) fallbackFrom = "gemini";
    }

    return {
      error: "all_providers_failed",
      reply: "I'm having connectivity issues. Please try again.",
      provider: null,
      fallback_from: fallbackFrom,
    };
  }

  // PUBLIC USERS: Gemini first, then Groq
  if (wantGemini && hasKey(keys?.GEMINI_API_KEY)) {
    if (!withinDailyLimit({ provider: "gemini", userType, max: CONSTANTS?.API_LIMITS?.GEMINI_DAILY_LIMIT })) {
      fallbackFrom = "gemini";
    } else {
    const res = await callGeminiSafe({
      apiKey: keys.GEMINI_API_KEY,
      userText: text,
      conversationHistory,
      system,
    });
    if (!res.error) return { error: null, reply: res.reply, provider: "gemini", fallback_from: fallbackFrom, usage: res.usage || null };
    if (!fallbackFrom) fallbackFrom = "gemini";
    }
  }

  // Fallback to Groq
  if (wantGroq && hasKey(keys?.GROQ_API_KEY)) {
    if (!withinDailyLimit({ provider: "groq", userType, max: CONSTANTS?.API_LIMITS?.GROQ_DAILY_LIMIT })) {
      if (!fallbackFrom) fallbackFrom = "groq";
    } else {
    const res = await callGroqSafe({
      apiKey: keys.GROQ_API_KEY,
      userText: text,
      conversationHistory,
      system,
    });
    if (!res.error) return { error: null, reply: res.reply, provider: "groq", fallback_from: fallbackFrom, usage: res.usage || null };
    if (!fallbackFrom) fallbackFrom = "groq";
    }
  }

  // All failed
  return {
    error: "all_providers_failed",
    reply: "I'm having connectivity issues. Please try again.",
    provider: null,
    fallback_from: fallbackFrom,
  };
}



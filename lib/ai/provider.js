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
 * @param {Object} [params.groq]
 * @param {number} [params.groq.maxTokens]
 * @param {number} [params.groq.temperature]
 * @param {string} [params.groq.model]
 * @param {Object} [params.gemini]
 * @param {number} [params.gemini.maxTokens]
 * @param {number} [params.gemini.temperature]
 * @param {string} [params.gemini.model]
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
  groq = {},
  gemini = {},
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
  // Claude is intentionally last-resort due to cost (super_admin only).
  const wantClaudeSuper = Boolean(isSuperAdmin && isFeatureEnabled("CLAUDE_ADMIN") && isFeatureEnabled("USE_CLAUDE"));
  const claudeAllowedUsers = Array.isArray(CONSTANTS?.API_LIMITS?.CLAUDE_ALLOWED_USERS)
    ? CONSTANTS.API_LIMITS.CLAUDE_ALLOWED_USERS
    : ["super_admin"];

  let fallbackFrom = null;

  // Cost-optimized order for all users:
  // 1) Groq (cheap)
  // 2) Gemini
  // 3) Claude (Anthropic) last resort (super_admin only)
  const orderedProviders = [
    {
      name: "groq",
      enabled: wantGroq,
      hasKey: hasKey(keys?.GROQ_API_KEY),
      withinLimit: () => withinDailyLimit({ provider: "groq", userType, max: CONSTANTS?.API_LIMITS?.GROQ_DAILY_LIMIT }),
      call: async () =>
        callGroqSafe({
          apiKey: keys.GROQ_API_KEY,
          userText: text,
          conversationHistory,
          system,
          maxTokens: groq?.maxTokens,
          temperature: groq?.temperature,
          model: groq?.model,
        }),
    },
    {
      name: "gemini",
      enabled: wantGemini,
      hasKey: hasKey(keys?.GEMINI_API_KEY),
      withinLimit: () => withinDailyLimit({ provider: "gemini", userType, max: CONSTANTS?.API_LIMITS?.GEMINI_DAILY_LIMIT }),
      call: async () =>
        callGeminiSafe({
          apiKey: keys.GEMINI_API_KEY,
          userText: text,
          conversationHistory,
          system,
          maxTokens: gemini?.maxTokens,
          temperature: gemini?.temperature,
          model: gemini?.model,
        }),
    },
  ];

  const claudeAllowed = Boolean(
    wantClaudeSuper &&
      hasKey(keys?.ANTHROPIC_API_KEY) &&
      isSuperAdmin &&
      claudeAllowedUsers.includes("super_admin")
  );
  if (claudeAllowed) {
    orderedProviders.push({
      name: "anthropic",
      enabled: true,
      hasKey: true,
      withinLimit: () => withinDailyLimit({ provider: "anthropic", userType, max: CONSTANTS?.API_LIMITS?.CLAUDE_DAILY_LIMIT }),
      call: async () =>
        callClaudeSafe({
          apiKey: keys.ANTHROPIC_API_KEY,
          userText: text,
          system,
          context,
          maxTokens: claude?.maxTokens ?? 900,
          temperature: claude?.temperature ?? 0.35,
        }),
    });
  }

  for (const p of orderedProviders) {
    if (!p.enabled || !p.hasKey) continue;
    if (!p.withinLimit()) {
      if (!fallbackFrom) fallbackFrom = p.name;
      continue;
    }

    const res = await p.call();
    if (!res?.error) {
      return {
        error: null,
        reply: res.reply,
        provider: p.name,
        fallback_from: fallbackFrom,
        usage: res.usage || null,
      };
    }

    if (!fallbackFrom) fallbackFrom = p.name;
  }

  // All failed
  return {
    error: "all_providers_failed",
    reply: "I'm having connectivity issues. Please try again.",
    provider: null,
    fallback_from: fallbackFrom,
  };
}







/**
 * AI Provider Orchestrator
 * Automatically picks a working provider based on feature flags + configured keys.
 */

import { isFeatureEnabled } from "@/config/features";
import { callGeminiSafe } from "@/lib/ai/gemini";
import { callGroqSafe } from "@/lib/ai/groq";
import { callClaudeSafe } from "@/lib/ai/claude";

function hasKey(v) {
  return Boolean(String(v || "").trim());
}

/**
 * @typedef {Object} AIResponse
 * @property {string} reply
 * @property {string|null} error
 * @property {string|null} provider
 * @property {string|null} fallback_from
 */

/**
 * @param {Object} params
 * @param {string} params.message
 * @param {Array<{sender:'user'|'bot', text:string}>} [params.conversationHistory]
 * @param {string} [params.system]
 * @param {Object|null} [params.context] - Admin-only JSON context (Claude)
 * @param {boolean} [params.isAdmin]
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
  isAdmin = false,
  keys,
  claude = {},
}) {
  const text = String(message || "").trim();
  if (!text) {
    return { error: "empty_message", reply: "", provider: null, fallback_from: null };
  }

  const wantClaudeAdmin = Boolean(isAdmin && isFeatureEnabled("CLAUDE_ADMIN") && isFeatureEnabled("USE_CLAUDE"));
  const wantGemini = isFeatureEnabled("USE_GEMINI");
  const wantGroq = isFeatureEnabled("USE_GROQ");
  const wantClaudeUser = Boolean(!isAdmin && isFeatureEnabled("USE_CLAUDE"));

  let fallbackFrom = null;

  // Admin gets Claude first (when enabled)
  if (wantClaudeAdmin && hasKey(keys?.ANTHROPIC_API_KEY)) {
    const res = await callClaudeSafe({
      apiKey: keys.ANTHROPIC_API_KEY,
      userText: text,
      system,
      context,
      maxTokens: claude?.maxTokens ?? 900,
      temperature: claude?.temperature ?? 0.35,
    });
    if (!res.error) return { error: null, reply: res.reply, provider: "anthropic", fallback_from: null };
    fallbackFrom = "anthropic";
  }

  // Try Gemini
  if (wantGemini && hasKey(keys?.GEMINI_API_KEY)) {
    const res = await callGeminiSafe({
      apiKey: keys.GEMINI_API_KEY,
      userText: text,
      conversationHistory,
      system,
    });
    if (!res.error) return { error: null, reply: res.reply, provider: "gemini", fallback_from: fallbackFrom };
    if (!fallbackFrom) fallbackFrom = "gemini";
  }

  // Fallback to Groq
  if (wantGroq && hasKey(keys?.GROQ_API_KEY)) {
    const res = await callGroqSafe({
      apiKey: keys.GROQ_API_KEY,
      userText: text,
      conversationHistory,
      system,
    });
    if (!res.error) return { error: null, reply: res.reply, provider: "groq", fallback_from: fallbackFrom };
    if (!fallbackFrom) fallbackFrom = "groq";
  }

  // Optional: Claude for user chat (disabled by default via flag)
  if (wantClaudeUser && hasKey(keys?.ANTHROPIC_API_KEY)) {
    const res = await callClaudeSafe({
      apiKey: keys.ANTHROPIC_API_KEY,
      userText: text,
      system,
      context: null,
      maxTokens: claude?.maxTokens ?? 700,
      temperature: claude?.temperature ?? 0.35,
    });
    if (!res.error) return { error: null, reply: res.reply, provider: "anthropic", fallback_from: fallbackFrom };
    if (!fallbackFrom) fallbackFrom = "anthropic";
  }

  // All failed
  return {
    error: "all_providers_failed",
    reply: "I'm having connectivity issues. Please try again.",
    provider: null,
    fallback_from: fallbackFrom,
  };
}



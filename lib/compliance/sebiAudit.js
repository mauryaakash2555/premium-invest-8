/**
 * SEBI Safety Audit (best-effort)
 *
 * Goal: reduce compliance risk by detecting and fixing:
 * - specific buy/sell recommendations
 * - guaranteed/assured return language
 * - overly personalized investment instructions
 *
 * Flow:
 * 1) Always run a fast regex check.
 * 2) If anything looks risky, ask Gemini to rewrite it to be SEBI-safe.
 * 3) If Gemini errors (quota/rate), fall back to Claude (if enabled).
 *
 * NOTE: This is a guardrail, not legal advice.
 */

import { isFeatureEnabled } from "@/config/features";
import { callGeminiSafe } from "@/lib/ai/gemini";
import { callClaudeSafe } from "@/lib/ai/claude";

function isTestEnv() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "test";
}

function looksLikeQuotaOrRateError(err) {
  const t = String(err || "").toLowerCase();
  return (
    t.includes("429") ||
    t.includes("resource_exhausted") ||
    t.includes("quota") ||
    t.includes("rate") ||
    t.includes("too many requests")
  );
}

function detectSebiRiskIssues(text) {
  const t = String(text || "");
  const issues = [];

  const rules = [
    { re: /\b(buy|sell|strong\s+buy|strong\s+sell|accumulate|exit|enter)\b/i, issue: "trade_instruction" },
    { re: /\b(target\s*price|stop\s*loss|sl|tp)\b/i, issue: "trading_levels" },
    { re: /\b(guaranteed|assured|sure-shot|risk[-\s]*free|no\s+risk)\b/i, issue: "guarantee_language" },
    { re: /\b(you\s+should\s+invest\s+in|i\s+recommend\s+investing\s+in)\b/i, issue: "personalized_recommendation" },
    { re: /\b(best\s+(mutual\s*fund|fund|stock|share))\b/i, issue: "best_claim" },
    { re: /\b(multibagger)\b/i, issue: "hype_claim" },
  ];

  for (const r of rules) {
    if (r.re.test(t)) issues.push(r.issue);
  }

  return Array.from(new Set(issues));
}

function safeFallbackRewrite({ userMessage }) {
  const base =
    "I can share general, educational guidance based on your question (not personalized investment advice). ";
  const next =
    "For decisions specific to your situation, please consult a SEBI-registered investment adviser. ";
  const ask =
    "If you share your goal, time horizon, and risk comfort, I can outline what people typically consider.";

  // Keep it short; avoid repeating the user message.
  return `${base}${next}${ask}`.trim();
}

/**
 * @typedef {Object} SebiAuditResult
 * @property {boolean} ok
 * @property {string} reply
 * @property {string[]} issues
 * @property {'regex'|'gemini'|'claude'|'skipped_test'|'skipped_disabled'} auditedBy
 */

/**
 * Best-effort audit/repair.
 *
 * @param {Object} params
 * @param {string} params.userMessage
 * @param {string} params.reply
 * @param {Object} params.keys
 * @param {string=} params.keys.GEMINI_API_KEY
 * @param {string=} params.keys.ANTHROPIC_API_KEY
 * @returns {Promise<SebiAuditResult>}
 */
export async function auditSebiReplySafe({ userMessage, reply, keys }) {
  if (!isFeatureEnabled("SEBI_AUDIT")) {
    return { ok: true, reply: String(reply || ""), issues: [], auditedBy: "skipped_disabled" };
  }

  if (isTestEnv()) {
    return { ok: true, reply: String(reply || ""), issues: [], auditedBy: "skipped_test" };
  }

  const issues = detectSebiRiskIssues(reply);
  if (issues.length === 0) {
    return { ok: true, reply: String(reply || ""), issues: [], auditedBy: "regex" };
  }

  const system =
    "You are an India finance compliance reviewer. Rewrite the assistant draft to be SEBI-safe:\n" +
    "- Educational, high-level, non-personalized\n" +
    "- No buy/sell/hold instructions, no target prices, no stock/fund recommendations\n" +
    "- No guaranteed/assured returns or hype\n" +
    "- Keep it concise (max 4 sentences)\n" +
    "- Add one line: 'For personalised advice, consult a SEBI-registered investment adviser.'\n" +
    "Return ONLY the rewritten reply text.";

  const prompt =
    `User message:\n${String(userMessage || "")}\n\n` +
    `Assistant draft reply:\n${String(reply || "")}\n\n` +
    `Issues detected: ${issues.join(", ")}`;

  const geminiKey = String(keys?.GEMINI_API_KEY || "").trim();
  if (geminiKey) {
    const g = await callGeminiSafe({
      apiKey: geminiKey,
      userText: prompt,
      system,
      maxTokens: 220,
      temperature: 0.2,
    });
    if (!g?.error && String(g.reply || "").trim().length > 20) {
      return { ok: true, reply: String(g.reply).trim(), issues, auditedBy: "gemini" };
    }

    // If Gemini fails due to quota/rate, optionally fall back to Claude.
    if (looksLikeQuotaOrRateError(g?.error)) {
      // continue to Claude
    } else {
      // non-quota Gemini failure: still try Claude if enabled, else fallback rewrite
    }
  }

  const allowClaudeFallback = isFeatureEnabled("SEBI_AUDIT_CLAUDE_FALLBACK") && isFeatureEnabled("USE_CLAUDE");
  const claudeKey = String(keys?.ANTHROPIC_API_KEY || "").trim();
  if (allowClaudeFallback && claudeKey) {
    const c = await callClaudeSafe({
      apiKey: claudeKey,
      userText: prompt,
      system,
      context: null,
      maxTokens: 240,
      temperature: 0.2,
    });
    if (!c?.error && String(c.reply || "").trim().length > 20) {
      return { ok: true, reply: String(c.reply).trim(), issues, auditedBy: "claude" };
    }
  }

  return {
    ok: false,
    reply: safeFallbackRewrite({ userMessage }),
    issues,
    auditedBy: "regex",
  };
}

/**
 * FILE: lib/ai/groq.js
 * PURPOSE: Groq AI Provider (user chat).
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * This file talks to Groq's chat API and returns the assistant reply.
 */

import { CONSTANTS } from "@/config/constants";

/**
 * Safe wrapper (preferred): returns { reply, error }.
 */
export async function callGroqSafe({ apiKey, userText, conversationHistory = [], system = "" }) {
  try {
    const { reply, usage } = await callGroqDetailed({ apiKey, userText, conversationHistory, system });
    return { reply, usage: usage || null, error: null };
  } catch (e) {
    return { reply: "", usage: null, error: String(e?.message || "groq_failed") };
  }
}

/**
 * Strict version: returns reply string or throws.
 * Kept for backwards compatibility with existing route code.
 */
export async function callGroq({ apiKey, userText, conversationHistory = [], system = "" }) {
  const { reply } = await callGroqDetailed({ apiKey, userText, conversationHistory, system });
  return reply;
}

/**
 * Detailed version: returns { reply, usage } or throws.
 * usage (when present): { inputTokens, outputTokens, totalTokens }
 */
export async function callGroqDetailed({ apiKey, userText, conversationHistory = [], system = "" }) {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const messages = [];
  if (system) messages.push({ role: "system", content: String(system) });

  for (const h of conversationHistory || []) {
    const role = h?.sender === "user" ? "user" : "assistant";
    const text = String(h?.text || "").trim();
    if (!text) continue;
    messages.push({ role, content: text });
  }

  messages.push({ role: "user", content: String(userText || "") });

  const body = {
    model: CONSTANTS.AI_MODELS.GROQ,
    temperature: 0.35,
    max_tokens: 260,
    messages,
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await r.text().catch(() => "");
  if (!r.ok) {
    console.error("[lib/ai/groq] Groq HTTP error", { status: r.status, body: raw });
    throw new Error(`Groq error: ${r.status} ${raw}`);
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("Groq error: bad_json");
  }

  const text =
    String(json?.choices?.[0]?.message?.content || "").trim() ||
    "I can help with educational guidance. consult our advisors for personalized recommendations.";

  const u = json?.usage;
  const promptTokens = Number(u?.prompt_tokens);
  const completionTokens = Number(u?.completion_tokens);
  const totalTokens = Number(u?.total_tokens);
  const usage =
    Number.isFinite(totalTokens) || Number.isFinite(promptTokens) || Number.isFinite(completionTokens)
      ? {
          inputTokens: Number.isFinite(promptTokens) ? promptTokens : null,
          outputTokens: Number.isFinite(completionTokens) ? completionTokens : null,
          totalTokens: Number.isFinite(totalTokens)
            ? totalTokens
            : (Number.isFinite(promptTokens) ? promptTokens : 0) + (Number.isFinite(completionTokens) ? completionTokens : 0),
        }
      : null;

  return { reply: text, usage };
}

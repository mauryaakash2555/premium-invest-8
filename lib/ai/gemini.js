/**
 * FILE: lib/ai/gemini.js
 * PURPOSE: Gemini AI Provider.
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * This file calls the Gemini API and returns the assistant reply.
 */

import { CONSTANTS } from "@/config/constants";

/**
 * Safe wrapper (preferred): returns { reply, error }.
 */
export async function callGeminiSafe({ apiKey, userText, conversationHistory = [], system = "" }) {
  try {
    const { reply, usage } = await callGeminiDetailed({ apiKey, userText, conversationHistory, system });
    return { reply, usage: usage || null, error: null };
  } catch (e) {
    return { reply: "", usage: null, error: String(e?.message || "gemini_failed") };
  }
}

/**
 * Strict version: returns reply string or throws.
 */
export async function callGemini({ apiKey, userText, conversationHistory = [], system = "" }) {
  const { reply } = await callGeminiDetailed({ apiKey, userText, conversationHistory, system });
  return reply;
}

/**
 * Detailed version: returns { reply, usage } or throws.
 * usage (when present): { inputTokens, outputTokens, totalTokens }
 */
export async function callGeminiDetailed({ apiKey, userText, conversationHistory = [], system = "" }) {
  const model = CONSTANTS.AI_MODELS.GEMINI;
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent?key=" +
    encodeURIComponent(apiKey);

  const contents = [];
  for (const h of conversationHistory || []) {
    const sender = h?.sender === "user" ? "user" : "model";
    const text = String(h?.text || "").trim();
    if (!text) continue;
    contents.push({ role: sender, parts: [{ text }] });
  }
  contents.push({ role: "user", parts: [{ text: String(userText || "") }] });

  const body = {
    systemInstruction: system ? { role: "system", parts: [{ text: String(system) }] } : undefined,
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 260 },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    console.error("[lib/ai/gemini] Gemini HTTP error", { status: r.status, body: t });
    throw new Error(`Gemini error: ${r.status} ${t}`);
  }

  const json = await r.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("") ||
    "I can help with educational guidance. consult our advisors for personalized recommendations.";

  const um = json?.usageMetadata;
  const promptTokens = Number(um?.promptTokenCount);
  const outputTokens = Number(um?.candidatesTokenCount);
  const totalTokens = Number(um?.totalTokenCount);
  const usage =
    Number.isFinite(totalTokens) || Number.isFinite(promptTokens) || Number.isFinite(outputTokens)
      ? {
          inputTokens: Number.isFinite(promptTokens) ? promptTokens : null,
          outputTokens: Number.isFinite(outputTokens) ? outputTokens : null,
          totalTokens: Number.isFinite(totalTokens)
            ? totalTokens
            : (Number.isFinite(promptTokens) ? promptTokens : 0) + (Number.isFinite(outputTokens) ? outputTokens : 0),
        }
      : null;

  return { reply: String(text || "").trim(), usage };
}

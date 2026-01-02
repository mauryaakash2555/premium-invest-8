/**
 * FILE: lib/ai/claude.js
 * PURPOSE: Claude (Anthropic) provider for admin mode.
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * This file calls Anthropic's API and returns the assistant reply.
 */

import { CONSTANTS } from "@/config/constants";

const CLAUDE_TIMEOUT_MS = 60_000;

/**
 * Safe wrapper (preferred): returns { reply, error }.
 */
export async function callClaudeSafe({ apiKey, userText, system = "", context = null, maxTokens = 900, temperature = 0.35 }) {
  try {
    const reply = await callClaude({ apiKey, userText, system, context, maxTokens, temperature });
    return { reply, error: null };
  } catch (e) {
    return { reply: "", error: String(e?.message || "claude_failed") };
  }
}

/**
 * Strict version: returns reply string or throws.
 */
export async function callClaude({ apiKey, userText, system = "", context = null, maxTokens = 900, temperature = 0.35 }) {
  const url = "https://api.anthropic.com/v1/messages";

  // Try a few model names for compatibility.
  const candidates = [CONSTANTS.AI_MODELS.CLAUDE, "claude-3-7-sonnet-latest", "claude-3-5-sonnet-latest"];

  let lastErr = null;
  for (const model of candidates) {
    const userBlock = context
      ? `Context (JSON):\n${JSON.stringify(context, null, 2)}\n\nAdmin question:\n${String(userText || "")}`
      : String(userText || "");

    const body = {
      model,
      max_tokens: Number(maxTokens || 900),
      temperature: Number(temperature ?? 0.35),
      system: system ? String(system) : undefined,
      messages: [{ role: "user", content: userBlock }],
    };

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), CLAUDE_TIMEOUT_MS);
    let r;
    try {
      r = await fetch(url, {
        method: "POST",
        signal: ac.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (e?.name === "AbortError") throw new Error("claude_timeout");
      throw e;
    } finally {
      clearTimeout(t);
    }

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      lastErr = new Error(`Claude error: ${r.status} ${t}`);
      if (r.status === 404) continue;
      throw lastErr;
    }

    const json = await r.json();
    const text =
      json?.content?.map((c) => (c?.type === "text" ? c.text : "")).filter(Boolean).join("") ||
      "Admin assistant ready.";
    return String(text || "").trim();
  }

  throw lastErr || new Error("Claude error: no_model_available");
}

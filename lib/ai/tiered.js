/**
 * Tiered AI usage (LOCK THIS)
 *
 * Tier 1 — Always ON (cheap): HuggingFace chat/inference for simple explainers/bubbles/FAQs.
 * Tier 2 — Shared Intelligence: Mistral chat for scenario explanations and cached narratives.
 * Tier 3 — Semantic Glue: Cohere embeddings for search/similarity/SEO clustering.
 *
 * Guardrails:
 * - Do NOT use Cohere for chatting.
 * - Do NOT use Mistral for embeddings.
 * - Do NOT call HuggingFace per keystroke; cache aggressively.
 * - Do NOT mix core simulator logic + AI; AI is for narration/explanations only.
 */

const DEFAULT_MISTRAL_MODEL = "mistral-small-latest";

export function getAiEnv() {
  return {
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || null,
    COHERE_API_KEY: process.env.COHERE_API_KEY || null,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || null,
    MISTRAL_CHAT_MODEL: process.env.MISTRAL_CHAT_MODEL || DEFAULT_MISTRAL_MODEL,
    HUGGINGFACE_CHAT_MODEL: process.env.HUGGINGFACE_CHAT_MODEL || null,
  };
}

export function assertAllowed({ provider, kind }) {
  // kind: "chat" | "embeddings"
  if (provider === "cohere" && kind === "chat") {
    throw new Error("AI policy violation: Cohere must not be used for chat");
  }
  if (provider === "mistral" && kind === "embeddings") {
    throw new Error("AI policy violation: Mistral must not be used for embeddings");
  }
}

export async function mistralChat({
  prompt,
  system,
  temperature = 0.3,
  maxTokens = 900,
  model,
}) {
  const env = getAiEnv();
  if (!env.MISTRAL_API_KEY) return null;

  assertAllowed({ provider: "mistral", kind: "chat" });

  const usedModel = model || env.MISTRAL_CHAT_MODEL || DEFAULT_MISTRAL_MODEL;
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: usedModel,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Mistral chat failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  const usage = data?.usage || null;

  return {
    provider: "mistral",
    model: usedModel,
    text,
    usage,
  };
}

// Placeholder for Tier 1 usage.
// Implement only when you decide on a fixed hosted model.
export async function huggingFaceChat() {
  const env = getAiEnv();
  if (!env.HUGGINGFACE_API_KEY) return null;

  assertAllowed({ provider: "huggingface", kind: "chat" });
  throw new Error(
    "HuggingFace chat not configured yet: set HUGGINGFACE_CHAT_MODEL and implement the provider call in lib/ai/tiered.js"
  );
}

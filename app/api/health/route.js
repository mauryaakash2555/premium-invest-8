import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAIEnvSafe, getAdminEnvSafe } from "@/config/env";
import { FEATURES } from "@/config/features";

function ok(name, extra = {}) {
  return { ok: true, name, ...extra };
}

function bad(name, error, extra = {}) {
  return { ok: false, name, error: String(error || "unknown"), ...extra };
}

async function withTimeout(promise, ms) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error("timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

async function deepCheckGemini(apiKey) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  const body = {
    contents: [{ role: "user", parts: [{ text: "ping" }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 1 },
  };

  const r = await withTimeout(
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    2500
  );

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`gemini_http_${r.status}:${t.slice(0, 180)}`);
  }
  return true;
}

async function deepCheckGroq(apiKey) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const body = {
    model: "llama-3.1-8b-instant",
    temperature: 0,
    max_tokens: 1,
    messages: [{ role: "user", content: "ping" }],
  };

  const r = await withTimeout(
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    }),
    2500
  );

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`groq_http_${r.status}:${t.slice(0, 180)}`);
  }
  return true;
}

async function deepCheckAnthropic(apiKey) {
  const r = await withTimeout(
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1, messages: [{ role: "user", content: "ping" }] }),
    }),
    2500
  );

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`anthropic_http_${r.status}:${t.slice(0, 180)}`);
  }
  return true;
}

export async function GET(req) {
  const url = new URL(req.url);
  const deep = url.searchParams.get("deep") === "1";

  const startedAt = Date.now();

  // Env readiness (do not throw)
  const aiEnv = getAIEnvSafe();

  const adminEnv = getAdminEnvSafe();

  // Supabase check
  let supa;
  let supabaseCheck;
  try {
    supa = supabaseAdmin();
    // lightweight query (table may not exist yet)
    const { error } = await withTimeout(supa.from("leads").select("id").limit(1), 2500);
    if (error) {
      // if schema missing, still report as not healthy for DB
      supabaseCheck = bad("supabase", error.message || "query_failed");
    } else {
      supabaseCheck = ok("supabase");
    }
  } catch (e) {
    supabaseCheck = bad("supabase", e?.message || "not_configured");
  }

  // AI checks
  const ai = {
    gemini: aiEnv?.GEMINI_API_KEY ? ok("gemini", { configured: true }) : bad("gemini", "missing_key", { configured: false }),
    anthropic: aiEnv?.ANTHROPIC_API_KEY ? ok("anthropic", { configured: true }) : bad("anthropic", "missing_key", { configured: false }),
    groq: aiEnv?.GROQ_API_KEY ? ok("groq", { configured: true }) : bad("groq", "missing_key", { configured: false }),
    mistral: process.env.MISTRAL_API_KEY ? ok("mistral", { configured: true }) : bad("mistral", "missing_key", { configured: false }),
  };

  if (deep && aiEnv?.GEMINI_API_KEY) {
    try {
      await deepCheckGemini(aiEnv.GEMINI_API_KEY);
      ai.gemini = ok("gemini", { configured: true, deep: true });
    } catch (e) {
      ai.gemini = bad("gemini", e?.message || "deep_failed", { configured: true, deep: true });
    }
  }

  if (deep && aiEnv?.ANTHROPIC_API_KEY) {
    try {
      await deepCheckAnthropic(aiEnv.ANTHROPIC_API_KEY);
      ai.anthropic = ok("anthropic", { configured: true, deep: true });
    } catch (e) {
      ai.anthropic = bad("anthropic", e?.message || "deep_failed", { configured: true, deep: true });
    }
  }

  if (deep && aiEnv?.GROQ_API_KEY) {
    try {
      await deepCheckGroq(aiEnv.GROQ_API_KEY);
      ai.groq = ok("groq", { configured: true, deep: true });
    } catch (e) {
      ai.groq = bad("groq", e?.message || "deep_failed", { configured: true, deep: true });
    }
  }

  const allOk = supabaseCheck.ok && ai.gemini.ok && ai.anthropic.ok && ai.groq.ok;

  return NextResponse.json({
    ok: allOk,
    asOf: new Date().toISOString(),
    ms: Date.now() - startedAt,
    features: FEATURES,
    checks: {
      supabase: supabaseCheck,
      ai,
      admin: adminEnv?.SUPER_ADMIN_PASSWORD_HASH || adminEnv?.ADMIN_PASSWORD_HASH || adminEnv?.SUPER_ADMIN_PASSWORD || adminEnv?.ADMIN_PASSWORD
        ? ok("admin", { configured: true })
        : bad("admin", "missing_admin_config", { configured: false }),
    },
  });
}




import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Best-effort smart cache:
// - Uses Supabase table `smart_cache` when configured.
// - Falls back to an in-memory Map (works in dev/tests, but not durable).

const memCache = (() => {
  // Share across hot reloads in dev.
  const g = globalThis;
  if (!g.__bm_smart_cache__) g.__bm_smart_cache__ = new Map();
  return g.__bm_smart_cache__;
})();

function normalizeQuestion(q) {
  return String(q || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function hashKey(input) {
  return crypto.createHash("sha256").update(String(input || ""), "utf8").digest("hex");
}

function getSupabaseClientSafe() {
  // In tests, stay fully in-memory.
  if (process.env.NODE_ENV === "test") return null;
  try {
    return supabaseAdmin();
  } catch {
    return null;
  }
}

export function makeSmartCacheKey({ scope, mode, message }) {
  const norm = normalizeQuestion(message);
  const raw = `${String(scope || "public")}|${String(mode || "user")}|${norm}`;
  return { norm, questionHash: hashKey(raw) };
}

export async function getSmartCachedReply({ scope, mode, message }) {
  const { norm, questionHash } = makeSmartCacheKey({ scope, mode, message });
  const memKey = `${scope}|${mode}|${questionHash}`;

  // Memory cache first (fast path)
  const m = memCache.get(memKey);
  if (m?.reply) {
    return { hit: true, reply: m.reply, provider: m.provider || null, norm, questionHash };
  }

  const sb = getSupabaseClientSafe();
  if (!sb) return { hit: false, norm, questionHash };

  try {
    const { data, error } = await sb
      .from("smart_cache")
      .select("answer,provider,hits")
      .eq("scope", String(scope))
      .eq("question_hash", questionHash)
      .maybeSingle();

    if (error || !data?.answer) return { hit: false, norm, questionHash };

    // Populate memory cache for speed
    memCache.set(memKey, { reply: data.answer, provider: data.provider || null });

    return { hit: true, reply: data.answer, provider: data.provider || null, norm, questionHash };
  } catch {
    return { hit: false, norm, questionHash };
  }
}

export async function recordSmartCacheHit({ scope, questionHash }) {
  const sb = getSupabaseClientSafe();
  if (!sb) return;

  // Best-effort read-modify-write increment (not fully atomic across instances).
  try {
    const { data, error } = await sb
      .from("smart_cache")
      .select("hits")
      .eq("scope", String(scope))
      .eq("question_hash", String(questionHash))
      .maybeSingle();
    if (error) return;
    const hits = Number(data?.hits) || 0;
    await sb
      .from("smart_cache")
      .update({ hits: hits + 1, last_hit_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("scope", String(scope))
      .eq("question_hash", String(questionHash))
      .throwOnError();
  } catch {
    // ignore
  }
}

export async function putSmartCache({ scope, mode, message, reply, provider }) {
  const { norm, questionHash } = makeSmartCacheKey({ scope, mode, message });
  const memKey = `${scope}|${mode}|${questionHash}`;
  memCache.set(memKey, { reply: String(reply || ""), provider: provider || null });

  const sb = getSupabaseClientSafe();
  if (!sb) return { norm, questionHash };

  try {
    const nowIso = new Date().toISOString();
    await sb
      .from("smart_cache")
      .upsert(
        {
          scope: String(scope),
          question_hash: questionHash,
          normalized_question: norm,
          answer: String(reply || ""),
          provider: provider || null,
          updated_at: nowIso,
        },
        { onConflict: "scope,question_hash" }
      )
      .throwOnError();
  } catch {
    // ignore if table not created yet
  }

  return { norm, questionHash };
}

export function clearSmartCacheForTests() {
  if (process.env.NODE_ENV === "test") {
    memCache.clear();
  }
}

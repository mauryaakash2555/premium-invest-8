/**
 * FILE: config/env.js
 * PURPOSE: Validate and safely read environment variables.
 * CATEGORY: config
 *
 * DEPENDENCIES:
 * - zod
 *
 * USED BY:
 * - API routes in `app/api/*`
 * - Supabase + AI helper modules in `lib/*`
 *
 * SIMPLE EXPLANATION:
 * Environment variables are secret settings (API keys, DB keys).
 * This file checks they exist (or returns null if missing) so the app can fail safely.
 *
 * TO MODIFY:
 * - Add a new env var: extend the appropriate zod schema.
 */

import { z } from "zod";

const adminSchema = z
  .object({
    // ✅ Preferred (hashed passwords)
    SUPER_ADMIN_PASSWORD_HASH: z.string().min(10).optional(),
    FAMILY_ADMIN_PASSWORD_HASH: z.string().min(10).optional(),

    // ✅ Cookie/session signing secret
    ADMIN_SESSION_SECRET: z.string().min(16).optional(),
    // ✅ Optional separate salt for IP hashing
    ANALYTICS_SALT: z.string().min(16).optional(),

    // ⚠️ Backward compatibility (older Phase 5 naming)
    ADMIN_PASSWORD_HASH: z.string().min(10).optional(),
    // ⚠️ Backward compatibility (plaintext)
    SUPER_ADMIN_PASSWORD: z.string().min(1).optional(),
    FAMILY_ADMIN_PASSWORD: z.string().min(1).optional(),
    ADMIN_PASSWORD: z.string().min(1).optional(),
  })
  .refine(
    (v) => Boolean(v.SUPER_ADMIN_PASSWORD_HASH || v.ADMIN_PASSWORD_HASH || v.SUPER_ADMIN_PASSWORD || v.ADMIN_PASSWORD),
    "Set SUPER_ADMIN_PASSWORD_HASH (preferred) or ADMIN_PASSWORD_HASH (legacy) or SUPER_ADMIN_PASSWORD/ADMIN_PASSWORD (fallback)"
  );

const supabaseSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const aiSchema = z
  .object({
    // Preferred names
    GEMINI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),

    // Aliases used in some deployments
    GOOGLE_AI_API_KEY: z.string().min(1).optional(),
    CLAUDE_API_KEY: z.string().min(1).optional(),

    // Optional providers
    GROQ_API_KEY: z.string().min(1).optional(),
  })
  .refine((v) => Boolean(v.GEMINI_API_KEY || v.GOOGLE_AI_API_KEY), "Set GEMINI_API_KEY or GOOGLE_AI_API_KEY")
  .refine((v) => Boolean(v.ANTHROPIC_API_KEY || v.CLAUDE_API_KEY), "Set ANTHROPIC_API_KEY or CLAUDE_API_KEY");

// Safe (partial) parsing: allow enabling only one provider in some environments.
const aiSafeSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GOOGLE_AI_API_KEY: z.string().min(1).optional(),
  CLAUDE_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
});

function normalizeAIEnv(v) {
  return {
    GEMINI_API_KEY: v?.GEMINI_API_KEY || v?.GOOGLE_AI_API_KEY || undefined,
    ANTHROPIC_API_KEY: v?.ANTHROPIC_API_KEY || v?.CLAUDE_API_KEY || undefined,
    GROQ_API_KEY: v?.GROQ_API_KEY || undefined,
  };
}

function hasRedacted(obj) {
  try {
    return Object.values(obj).some((x) => String(x).toUpperCase() === "REDACTED");
  } catch {
    return false;
  }
}

export function getAdminEnv() {
  const parsed = adminSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Missing/invalid environment variables: ${msg}`);
  }
  return parsed.data;
}

export function getAdminEnvSafe() {
  const parsed = adminSchema.safeParse(process.env);
  if (!parsed.success) return null;
  if (hasRedacted(parsed.data)) return null;
  return parsed.data;
}

export function getSupabaseEnv() {
  const parsed = supabaseSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Missing/invalid environment variables: ${msg}`);
  }
  return parsed.data;
}

export function getSupabaseEnvSafe() {
  const parsed = supabaseSchema.safeParse(process.env);
  if (!parsed.success) return null;
  if (hasRedacted(parsed.data)) return null;
  return parsed.data;
}

export function getAIEnv() {
  const parsed = aiSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Missing/invalid environment variables: ${msg}`);
  }
  return normalizeAIEnv(parsed.data);
}

export function getAIEnvSafe() {
  const parsed = aiSafeSchema.safeParse(process.env);
  if (!parsed.success) return null;
  if (hasRedacted(parsed.data)) return null;
  const normalized = normalizeAIEnv(parsed.data);
  if (!normalized.GEMINI_API_KEY && !normalized.ANTHROPIC_API_KEY && !normalized.GROQ_API_KEY) return null;
  return normalized;
}


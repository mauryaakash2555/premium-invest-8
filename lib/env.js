import { z } from "zod";

const adminSchema = z.object({
  ADMIN_PASSWORD: z.string().min(1),
});

const supabaseSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const aiSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1).optional(),
});

// Safe (partial) parsing: allow enabling only one provider in some environments.
const aiSafeSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
});

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
  return parsed.data;
}

export function getAIEnvSafe() {
  const parsed = aiSafeSchema.safeParse(process.env);
  if (!parsed.success) return null;
  if (hasRedacted(parsed.data)) return null;
  if (!parsed.data.GEMINI_API_KEY && !parsed.data.ANTHROPIC_API_KEY && !parsed.data.GROQ_API_KEY) return null;
  return parsed.data;
}

// Backwards-compatible helpers (kept for older code paths).
export function getServerEnv() {
  return {
    ...getSupabaseEnv(),
    ...getAIEnv(),
    ...getAdminEnv(),
  };
}

export function getServerEnvSafe() {
  const s = getSupabaseEnvSafe();
  const a = getAIEnvSafe();
  const adm = getAdminEnvSafe();
  if (!s || !a || !adm) return null;
  return { ...s, ...a, ...adm };
}

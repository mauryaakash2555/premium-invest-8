import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
});

export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Missing/invalid environment variables: ${msg}`);
  }
  return parsed.data;
}

export function getServerEnvSafe() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) return null;
  // Treat placeholder values as "not configured"
  const v = parsed.data;
  const anyRedacted = Object.values(v).some((x) => String(x).toUpperCase() === "REDACTED");
  if (anyRedacted) return null;
  return v;
}



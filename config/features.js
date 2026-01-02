/**
 * Feature Flags
 * Turn features on/off without code changes.
 *
 * IMPORTANT (Next.js):
 * - Server can read FEATURE_* env vars at runtime.
 * - Client bundles can only read NEXT_PUBLIC_* env vars.
 * This module supports BOTH:
 *   FEATURE_LEAD_CAPTURE=false
 *   NEXT_PUBLIC_FEATURE_LEAD_CAPTURE=false
 *
 * Convention:
 * - unset => enabled
 * - "false" => disabled
 */

// NOTE: Do NOT access process.env dynamically on the client.
// Next.js can inline `process.env.NEXT_PUBLIC_*` (static) at build time,
// but cannot inline `process.env[dynamicKey]`, which causes `process is not defined`.
const NEXT_PUBLIC = {
  LEAD_CAPTURE: process.env.NEXT_PUBLIC_FEATURE_LEAD_CAPTURE,
  CONTEXT_MEMORY: process.env.NEXT_PUBLIC_FEATURE_CONTEXT_MEMORY,
  TIME_GREETINGS: process.env.NEXT_PUBLIC_FEATURE_TIME_GREETINGS,
  SMART_SMALLTALK_REDIRECT: process.env.NEXT_PUBLIC_FEATURE_SMART_SMALLTALK_REDIRECT,
  REVENUE_TRACKING: process.env.NEXT_PUBLIC_FEATURE_REVENUE_TRACKING,
  LEAD_SCORING: process.env.NEXT_PUBLIC_FEATURE_LEAD_SCORING,
  ANALYTICS: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS,
  CLAUDE_ADMIN: process.env.NEXT_PUBLIC_FEATURE_CLAUDE_ADMIN,
  USE_GEMINI: process.env.NEXT_PUBLIC_FEATURE_USE_GEMINI,
  USE_GROQ: process.env.NEXT_PUBLIC_FEATURE_USE_GROQ,
  USE_CLAUDE: process.env.NEXT_PUBLIC_FEATURE_USE_CLAUDE,
};

function readFlag(key) {
  const k = String(key || "").trim();
  if (!k) return true;

  // Client: only NEXT_PUBLIC_FEATURE_* are available
  const vPublic = NEXT_PUBLIC?.[k];
  if (vPublic !== undefined) return String(vPublic || "").toLowerCase() !== "false";
  if (typeof window !== "undefined") return true;

  // Server: allow FEATURE_* runtime flags too
  const vServer = process.env?.[`FEATURE_${k}`];
  return String(vServer || "").toLowerCase() !== "false";
}

export const FEATURES = {
  // User Features
  LEAD_CAPTURE: readFlag("LEAD_CAPTURE"),
  CONTEXT_MEMORY: readFlag("CONTEXT_MEMORY"),
  TIME_GREETINGS: readFlag("TIME_GREETINGS"),
  SMART_SMALLTALK_REDIRECT: readFlag("SMART_SMALLTALK_REDIRECT"),

  // Admin Features
  REVENUE_TRACKING: readFlag("REVENUE_TRACKING"),
  LEAD_SCORING: readFlag("LEAD_SCORING"),
  ANALYTICS: readFlag("ANALYTICS"),
  CLAUDE_ADMIN: readFlag("CLAUDE_ADMIN"),

  // AI Providers
  USE_GEMINI: readFlag("USE_GEMINI"),
  USE_GROQ: readFlag("USE_GROQ"),
  USE_CLAUDE: readFlag("USE_CLAUDE"),
};

// Helper to check if feature enabled
export function isFeatureEnabled(featureName) {
  return FEATURES?.[featureName] === true;
}



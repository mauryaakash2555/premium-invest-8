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

function readFlag(key) {
  const k = String(key || "").trim();
  if (!k) return true;
  const publicKey = `NEXT_PUBLIC_FEATURE_${k}`;
  const serverKey = `FEATURE_${k}`;
  const v = process.env?.[publicKey] ?? process.env?.[serverKey];
  return String(v || "").toLowerCase() !== "false";
}

export const FEATURES = {
  // User Features
  LEAD_CAPTURE: readFlag("LEAD_CAPTURE"),
  CONTEXT_MEMORY: readFlag("CONTEXT_MEMORY"),
  TIME_GREETINGS: readFlag("TIME_GREETINGS"),

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



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
  CHAT_ENABLED: process.env.NEXT_PUBLIC_FEATURE_CHAT_ENABLED,
  LEAD_CAPTURE: process.env.NEXT_PUBLIC_FEATURE_LEAD_CAPTURE,
  CONTEXT_MEMORY: process.env.NEXT_PUBLIC_FEATURE_CONTEXT_MEMORY,
  TIME_GREETINGS: process.env.NEXT_PUBLIC_FEATURE_TIME_GREETINGS,
  SMART_SMALLTALK_REDIRECT: process.env.NEXT_PUBLIC_FEATURE_SMART_SMALLTALK_REDIRECT,
  REVENUE_TRACKING: process.env.NEXT_PUBLIC_FEATURE_REVENUE_TRACKING,
  LEAD_SCORING: process.env.NEXT_PUBLIC_FEATURE_LEAD_SCORING,
  ANALYTICS: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS,
  CLAUDE_ADMIN: process.env.NEXT_PUBLIC_FEATURE_CLAUDE_ADMIN,

  PRODUCT_PITCHING: process.env.NEXT_PUBLIC_FEATURE_PRODUCT_PITCHING,
  AFFILIATE_TRACKING: process.env.NEXT_PUBLIC_FEATURE_AFFILIATE_TRACKING,
  EMAIL_NOTIFICATIONS: process.env.NEXT_PUBLIC_FEATURE_EMAIL_NOTIFICATIONS,
  SMART_CACHE: process.env.NEXT_PUBLIC_FEATURE_SMART_CACHE,

  FAMILY_ADMIN_MODE: process.env.NEXT_PUBLIC_FEATURE_FAMILY_ADMIN_MODE,
  SUPER_ADMIN_MODE: process.env.NEXT_PUBLIC_FEATURE_SUPER_ADMIN_MODE,

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
  // Master switch
  CHAT_ENABLED: readFlag("CHAT_ENABLED"),

  // User Features
  LEAD_CAPTURE: readFlag("LEAD_CAPTURE"),
  CONTEXT_MEMORY: readFlag("CONTEXT_MEMORY"),
  TIME_GREETINGS: readFlag("TIME_GREETINGS"),
  SMART_SMALLTALK_REDIRECT: readFlag("SMART_SMALLTALK_REDIRECT"),

  // Optional user features
  PRODUCT_PITCHING: readFlag("PRODUCT_PITCHING"),
  AFFILIATE_TRACKING: readFlag("AFFILIATE_TRACKING"),
  EMAIL_NOTIFICATIONS: readFlag("EMAIL_NOTIFICATIONS"),
  SMART_CACHE: readFlag("SMART_CACHE"),

  // Admin Features
  REVENUE_TRACKING: readFlag("REVENUE_TRACKING"),
  LEAD_SCORING: readFlag("LEAD_SCORING"),
  ANALYTICS: readFlag("ANALYTICS"),
  CLAUDE_ADMIN: readFlag("CLAUDE_ADMIN"),

  // Admin modes
  FAMILY_ADMIN_MODE: readFlag("FAMILY_ADMIN_MODE"),
  SUPER_ADMIN_MODE: readFlag("SUPER_ADMIN_MODE"),

  // AI Providers
  USE_GEMINI: readFlag("USE_GEMINI"),
  USE_GROQ: readFlag("USE_GROQ"),
  USE_CLAUDE: readFlag("USE_CLAUDE"),
};

// Helper to check if feature enabled
export function isFeatureEnabled(featureName) {
  return FEATURES?.[featureName] === true;
}

// Chatbot feature bundle (requested by docs).
// This is a stable interface meant for simple toggles.
export const CHATBOT_FEATURES = {
  // Core features (always on)
  CHAT_ENABLED: FEATURES.CHAT_ENABLED,
  LEAD_CAPTURE_ENABLED: FEATURES.LEAD_CAPTURE,

  // Can be toggled if issues arise
  SMART_SMALLTALK_REDIRECT: FEATURES.SMART_SMALLTALK_REDIRECT,
  PRODUCT_PITCHING: FEATURES.PRODUCT_PITCHING,
  AFFILIATE_TRACKING: FEATURES.AFFILIATE_TRACKING,
  EMAIL_NOTIFICATIONS: FEATURES.EMAIL_NOTIFICATIONS,
  SMART_CACHE: FEATURES.SMART_CACHE,

  // Admin features
  FAMILY_ADMIN_MODE: FEATURES.FAMILY_ADMIN_MODE,
  SUPER_ADMIN_MODE: FEATURES.SUPER_ADMIN_MODE,
};



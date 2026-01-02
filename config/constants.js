/**
 * FILE: config/constants.js
 * PURPOSE: Single source of truth for important app constants/settings.
 * CATEGORY: config
 *
 * DEPENDENCIES:
 * - none (reads from process.env directly)
 *
 * USED BY:
 * - API routes, UI components, and lib helpers across the app
 *
 * SIMPLE EXPLANATION:
 * This file stores important numbers and text in one place.
 * If you change something here, the whole app uses the new value.
 *
 * TO MODIFY:
 * - Change rate limits: edit CONSTANTS.RATE_LIMITS
 * - Change lead score thresholds: edit CONSTANTS.LEAD_SCORING
 * - Change compliance text: edit CONSTANTS.COMPLIANCE
 */

export const CONSTANTS = {
  // 🔵 Admin
  ADMIN: {
    COOKIE_NAME: "bm_admin",
    // 30 min (matches Phase 5 "auto logout after inactivity" intent)
    COOKIE_MAX_AGE_SECONDS: 60 * 30,

    FAMILY: {
      NAME: "BM Wealth",
      ACCESS_LEVEL: "family",
    },
    SUPER: {
      NAME: "Akash",
      ACCESS_LEVEL: "super",
      SECRET_ROUTE: "/admin-secret-akash",
    },
  },
  // 🔵 Rate limits
  RATE_LIMITS: {
    USER: { max: 10, windowMs: 60_000 },
    ADMIN: { max: 50, windowMs: 60 * 60_000 },
  },

  // 🔵 API usage limits (best-effort; serverless instances may reset counters)
  API_LIMITS: {
    // Free-tier guardrails
    GEMINI_DAILY_LIMIT: 1500,
    GROQ_DAILY_LIMIT: 14400,

    // Paid provider guardrails
    CLAUDE_DAILY_LIMIT: 100,
    CLAUDE_ALLOWED_USERS: ["super_admin"],

    ALERT_AT_80_PERCENT: true,
  },

  // 🔵 Lead scoring
  LEAD_SCORING: {
    HOT_THRESHOLD: 80,
    WARM_THRESHOLD: 40,
  },

  // 🔵 UI
  UI: {
    COLORS: {
      PRIMARY_GOLD: "#C6A15B",
      SECONDARY_GOLD: "#E0C98A",
      BACKGROUND_DARK: "#0B0B0C",
      CARD_DARK: "#111214",
    },
  },

  // 🔵 Chat settings
  CHAT: {
    MAX_HISTORY: 10,
    TYPING_DELAY_MS: 1000,
  },

  // 🔵 Compliance
  COMPLIANCE: {
    SEBI_DISCLAIMER:
      "Welcome to BM Wealth. We provide educational guidance and product distribution services. AMFI Registered • IRDAI Licensed • Investments subject to market dynamics.",
  },

  // 🔵 AI models
  AI_MODELS: {
    GEMINI: "gemini-2.0-flash",
    GROQ: "llama-3.3-70b-versatile",
    CLAUDE: "claude-sonnet-4-20250514",
  },
  // 🔵 Auth (fallback hashes; override via .env.local)
  AUTH: {
    // ⚠️ Prefer env vars:
    // - FAMILY_ADMIN_PASSWORD_HASH (bcrypt hash of your family PIN)
    // - SUPER_ADMIN_PASSWORD_HASH (bcrypt hash of your super admin password)
    FAMILY_ADMIN_PASSWORD_HASH_FALLBACK: "$2a$10$yjHp3h4QlIbwxTA7hOlGReSDiy01Eo0ivKK3ZKJcEcNHHFfORz4eS",
    SUPER_ADMIN_PASSWORD_HASH_FALLBACK: "$2a$10$5CiHNP9agSs00vVpuD8jReiMbEXop1RBQ5ufx19UeEzjVAmLaP4uq",
    // Plain fallback for local/staging convenience (use env in production)
    SUPER_ADMIN_PASSWORD_PLAIN_FALLBACK: "Mmaurya@8080",

    // Backward compatibility (older Phase 5 variable name)
    ADMIN_PASSWORD_HASH_FALLBACK: "$2a$10$5CiHNP9agSs00vVpuD8jReiMbEXop1RBQ5ufx19UeEzjVAmLaP4uq",
  },
};







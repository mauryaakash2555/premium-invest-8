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
  ADMIN: {    COOKIE_NAME: "bm_admin",
    COOKIE_MAX_AGE_SECONDS: 60 * 60 * 8,
  },

  // 🔵 Rate limits
  RATE_LIMITS: {
    USER: { max: 10, windowMs: 60_000 },
    ADMIN: { max: 50, windowMs: 60 * 60_000 },
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
    ADMIN_PASSWORD_HASH_FALLBACK: "$2a$10$CfZIe1YsN4Fijm.eYXGpXOxQkrWsE6lueBcpOwzC6R67XBXbpik5m",
    FAMILY_ADMIN_PASSWORD_HASH_FALLBACK: "$2a$10$2rNAuL/Q3Zh3d0B5.9O/YOlNmK4GDsM9NnNn3qUh3kdjwGyx7mBga",
  },
};




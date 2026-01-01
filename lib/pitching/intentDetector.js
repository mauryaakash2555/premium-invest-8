/**
 * Intent Detection & Product Matcher
 * Analyzes user message and determines what to pitch
 */

export const INTENTS = {
  INVESTING_GENERAL: {
    keywords: ["invest", "investment", "where to invest", "how to invest"],
    signals: ["want to", "looking to", "planning to"],
    pitch: "FREE_CONSULTATION",
  },

  SIP_INTEREST: {
    keywords: ["sip", "systematic", "monthly investment", "recurring"],
    signals: ["start", "begin", "how much"],
    pitch: "SIP_CALCULATOR",
  },

  RETIREMENT_PLANNING: {
    keywords: ["retirement", "pension", "post-retirement", "60 years"],
    signals: ["planning", "saving for", "when i retire"],
    pitch: "RETIREMENT_PLANNER",
  },

  TAX_SAVING: {
    keywords: ["tax", "80c", "tax saving", "elss", "deduction"],
    signals: ["save tax", "reduce tax", "tax benefit"],
    pitch: "TAX_CALCULATOR",
  },

  TRADING_INTEREST: {
    keywords: ["trading", "stocks", "share market", "demat", "broker"],
    signals: ["which platform", "best broker", "open account"],
    pitch: "TRADING_PLATFORMS",
  },

  INSURANCE_NEED: {
    keywords: ["insurance", "term plan", "life cover", "protection"],
    signals: ["need insurance", "looking for", "family protection"],
    pitch: "INSURANCE_OPTIONS",
  },

  HIGH_VALUE: {
    keywords: ["lakh", "crore", "10 lakh", "1 crore", "large amount"],
    signals: ["have", "inherit", "received", "want to invest"],
    pitch: "PRIORITY_CONSULTATION",
  },

  CONFUSED: {
    keywords: ["confused", "don't know", "help", "guide", "suggest"],
    signals: ["where to start", "beginner", "new to"],
    pitch: "BEGINNER_GUIDE",
  },
};

export function detectIntent(message, conversationHistory = []) {
  const msg = String(message || "").toLowerCase();
  const detectedIntents = [];

  // Check each intent
  for (const [intentName, intent] of Object.entries(INTENTS)) {
    let score = 0;

    // Check keywords
    (intent.keywords || []).forEach((keyword) => {
      if (keyword && msg.includes(String(keyword).toLowerCase())) score += 2;
    });

    // Check signals
    (intent.signals || []).forEach((signal) => {
      if (signal && msg.includes(String(signal).toLowerCase())) score += 1;
    });

    if (score > 0) {
      detectedIntents.push({ intent: intentName, score, pitch: intent.pitch });
    }
  }

  // Sort by score (highest first)
  detectedIntents.sort((a, b) => b.score - a.score);

  // Return top intent or null
  return detectedIntents[0] || null;
}

export function shouldPitch(conversationLength, lastPitchAt) {
  const len = Number(conversationLength) || 0;

  // Don't pitch immediately
  if (len < 2) return false;

  // Don't pitch too frequently
  if (Number.isFinite(Number(lastPitchAt)) && len - Number(lastPitchAt) < 3) return false;

  return true;
}

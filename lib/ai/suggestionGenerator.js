/**
 * ⚠️⚠️⚠️ CRITICAL FILE - CHATBOT SUGGESTION GENERATOR ⚠️⚠️⚠️
 *
 * This creates the 3 suggestion buttons the user can tap.
 * Breaking this = bad UX and lower conversions.
 *
 * BEFORE MODIFYING:
 * 1) Read /docs/chatbot/CHATBOT_DONT_TOUCH.md
 * 2) Run backup: node scripts/backup-chatbot.js
 * 3) Run validation: node scripts/validate-chatbot.js
 *
 * SAFE TO CHANGE: suggestion text (keep SEBI-safe)
 * NEVER CHANGE casually: function signature/return shape
 *
 * Last modified: 2026-01-09
 * Modified by: [name]
 * Reason: [why]
 */

/**
 * Suggestion Generator
 * Returns 3 SEBI-safe, click-to-send suggestions.
 */

function three(list) {
  return (Array.isArray(list) ? list : []).filter(Boolean).slice(0, 3);
}

export function generateSmartSuggestions(intent, leadScore) {
  const score = Number(leadScore || 0);

  // Hot lead: steer toward consultation / next step (educational + human help)
  if (score >= 80) {
    return three([
      "Book a free consultation call",
      "Get a simple goal-based investment roadmap",
      "See sample portfolio allocation examples",
    ]);
  }

  switch (String(intent || "general")) {
    case "tax":
      return three([
        "Tax-saving options under Section 80C (overview)",
        "Health insurance tax benefits (80D) — explained",
        "ELSS mutual funds: tax + long-term growth (how it works)",
      ]);
    case "retirement":
      return three([
        "How much should I save for retirement?",
        "NPS vs mutual funds for retirement (pros/cons)",
        "Simple retirement planning checklist",
      ]);
    case "education":
      return three([
        "How to plan a child education fund",
        "SIP planning for college fees in 10–15 years",
        "Child insurance vs investing: what to know",
      ]);
    case "insurance":
      return three([
        "Term insurance: how much cover do I need?",
        "Health insurance basics: what to check",
        "Which insurance should I buy first?",
      ]);
    case "sip":
      return three([
        "How to start a SIP with a small monthly amount",
        "How to choose a SIP mutual fund (framework)",
        "SIP calculator: what inputs matter?",
      ]);
    case "stocks":
      return three([
        "Stocks vs mutual funds: which suits beginners?",
        "How to open a demat + trading account (steps)",
        "Equity funds vs direct stocks (risk + effort)",
      ]);
    case "mutualfunds":
      return three([
        "Mutual funds for beginners: key concepts",
        "How to choose mutual funds (checklist)",
        "SIP vs lumpsum: when to use which?",
      ]);
    default:
      return three([
        "How to start investing with a small monthly amount",
        "What insurance do I need? (starter guide)",
        "Mutual funds basics: a quick guide",
      ]);
  }
}

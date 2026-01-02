/**
 * Intent Analyzer
 *
 * Purpose: derive a coarse financial intent from recent conversation history.
 * Input rows are expected from lib/db/conversations.listConversations:
 *   { id, lead_id, message, sender, created_at }
 */

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, words) {
  for (const w of words) {
    if (!w) continue;
    if (text.includes(w)) return true;
  }
  return false;
}

export function analyzeIntent(conversationHistory = []) {
  try {
    const rows = Array.isArray(conversationHistory) ? conversationHistory : [];
    const userText = rows
      .filter((r) => r && r.sender === "user")
      .map((r) => String(r.message || ""))
      .join(" ");

    const t = normalizeText(userText);
    if (!t) return "general";

    if (includesAny(t, ["tax", "80c", "80d", "deduction", "exemption", "tds", "itr"])) return "tax";
    if (includesAny(t, ["retire", "retirement", "pension", "nps", "ppf", "60 years", "old age"])) return "retirement";
    if (includesAny(t, ["child", "education", "college", "school fees", "daughter", "son"])) return "education";
    if (includesAny(t, ["insurance", "cover", "policy", "mediclaim", "term plan", "health"])) return "insurance";
    if (includesAny(t, ["sip", "systematic", "monthly invest", "recurring"])) return "sip";
    if (includesAny(t, ["stock", "equity", "share", "trading", "demat", "broker"])) return "stocks";
    if (includesAny(t, ["mutual fund", " mf ", "scheme", "nav", "aum"])) return "mutualfunds";

    return "general";
  } catch {
    return "general";
  }
}

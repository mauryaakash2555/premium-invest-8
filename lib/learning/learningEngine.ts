export type Action =
  | "DEEPER"
  | "EXAMPLE"
  | "DIFFERENT_ANGLE"
  | "CHALLENGE"
  | "SUMMARY";

export interface LearningSession {
  id: string;
  topic: string; // EXACT user input. NEVER change.
  depth: number; // monotonically increases
  angle: string; // current perspective
  covered: string[]; // concepts already explained
  history: { action: Action; note: string }[];
}

export interface EngineResponse {
  content: string; // ONE atomic slice only
  newConcept: string; // what was added this step
  depthDelta: number; // must be >0 for DEEPER
  angle: string; // resulting angle
  nextActions: Action[]; // what the user can do next
}

function makeId() {
  // Deterministic enough for local sessions; avoids Node/browser crypto differences.
  return (
    "ls_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 10) +
    "_" +
    Math.random().toString(36).slice(2, 10)
  );
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function norm(s: string) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function stableHash(input: string) {
  // FNV-1a 32-bit
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function isAmbiguous(topic: string) {
  const t = norm(topic);
  // Very short tokens (e.g. acronyms) are ambiguous; we ask rather than assume.
  return t.length <= 3;
}

function computeNextActions(action: Action): Action[] {
  // Never dead-end.
  // Keep the set stable and small; UI can map directly.
  switch (action) {
    case "SUMMARY":
      return ["DEEPER", "EXAMPLE", "DIFFERENT_ANGLE", "CHALLENGE"];
    case "CHALLENGE":
      return ["DEEPER", "EXAMPLE", "DIFFERENT_ANGLE", "SUMMARY"];
    default:
      return ["DEEPER", "EXAMPLE", "DIFFERENT_ANGLE", "CHALLENGE", "SUMMARY"];
  }
}

function depthRewardLine(depth: number) {
  if (depth === 3) return "You’ve crossed the surface layer.";
  if (depth === 6) return "This is where most explanations stop.";
  if (depth === 9) return "You’re now reasoning, not memorizing.";
  return "";
}

function pickNewConcept(params: {
  session: LearningSession;
  action: Action;
  nextDepth: number;
  nextAngle: string;
}) {
  const { session, action, nextDepth, nextAngle } = params;

  const base = `${session.topic}::${action}::${nextAngle}::${nextDepth}`;
  let nonce = 0;
  while (nonce < 50) {
    const candidate = `c_${stableHash(`${base}::${nonce}`)}`;
    if (!session.covered.includes(candidate)) return candidate;
    nonce++;
  }
  // Extremely unlikely fallback
  return `c_${stableHash(base)}_${Date.now().toString(36)}`;
}

function renderSlice(params: {
  topic: string;
  action: Action;
  depth: number;
  angle: string;
  newConcept: string;
  alreadyCoveredCount: number;
  ambiguous: boolean;
}) {
  const { topic, action, depth, angle, newConcept, alreadyCoveredCount, ambiguous } = params;

  const reward = depthRewardLine(depth);

  if (ambiguous) {
    // One atomic slice: we ask a clarifying question instead of assuming.
    const lines = [
      `Topic: ${topic}`,
      `Angle: ${angle}`,
      `Depth: ${depth}`,
      "",
      "Clarify (one quick choice):",
      `- When you say “${topic}”, do you mean the concept, the product, or the strategy?`,
      "",
      `Changed this step: depth +1 (kept topic exact; avoided assumptions).`,
    ];
    if (reward) lines.push("", reward);
    return lines.join("\n");
  }

  const changed = action === "DEEPER" ? "depth +1" : "depth unchanged";
  const avoidRepeat = alreadyCoveredCount ? `avoided repeating ${alreadyCoveredCount} covered concept(s)` : "started fresh";

  // Keep it short, scannable, and stateful.
  switch (action) {
    case "DEEPER": {
      const lines = [
        `Topic: ${topic}`,
        `Angle: ${angle}`,
        `Depth: ${depth}`,
        "",
        "One slice:",
        `- New concept added: ${newConcept}`,
        "- One layer deeper: we focus on a smaller mechanism or assumption.",
        "",
        `Changed this step: ${changed} (${avoidRepeat}).`,
      ];
      if (reward) lines.push("", reward);
      return lines.join("\n");
    }

    case "EXAMPLE": {
      const lines = [
        `Topic: ${topic}`,
        `Angle: ${angle}`,
        `Depth: ${depth}`,
        "",
        "One slice (example):",
        `- New concept added: ${newConcept}`,
        "- Example frame: pick one driver, change it once, observe one outcome.",
        "",
        `Changed this step: ${changed} (${avoidRepeat}).`,
      ];
      if (reward) lines.push("", reward);
      return lines.join("\n");
    }

    case "DIFFERENT_ANGLE": {
      const lines = [
        `Topic: ${topic}`,
        `Angle: ${angle}`,
        `Depth: ${depth}`,
        "",
        "One slice (different angle):",
        `- New concept added: ${newConcept}`,
        "- Same topic, new lens: we reframe the driver → effect using this angle.",
        "",
        `Changed this step: angle switched to “${angle}” (${avoidRepeat}).`,
      ];
      if (reward) lines.push("", reward);
      return lines.join("\n");
    }

    case "CHALLENGE": {
      const lines = [
        `Topic: ${topic}`,
        `Angle: ${angle}`,
        `Depth: ${depth}`,
        "",
        "One slice (challenge):",
        `- New concept added: ${newConcept}`,
        "- Prompt: In one sentence, state the main driver and the first effect direction.",
        "- Self-check: driver + first effect + direction are all present.",
        "",
        `Changed this step: ${changed} (${avoidRepeat}).`,
      ];
      if (reward) lines.push("", reward);
      return lines.join("\n");
    }

    case "SUMMARY": {
      const lines = [
        `Topic: ${topic}`,
        `Angle: ${angle}`,
        `Depth: ${depth}`,
        "",
        "One slice (summary):",
        `- New concept added: ${newConcept}`,
        "- Recap: one definition • one driver → effect • one check • one pitfall.",
        "",
        `Changed this step: ${changed} (${avoidRepeat}).`,
      ];
      if (reward) lines.push("", reward);
      return lines.join("\n");
    }

    default: {
      const lines = [
        `Topic: ${topic}`,
        `Angle: ${angle}`,
        `Depth: ${depth}`,
        "",
        "One slice:",
        `- New concept added: ${newConcept}`,
        "",
        `Changed this step: ${changed} (${avoidRepeat}).`,
      ];
      if (reward) lines.push("", reward);
      return lines.join("\n");
    }
  }
}

export function createSession(topic: string): LearningSession {
  const rawTopic = String(topic ?? "");
  const isEmpty = rawTopic.replace(/\s+/g, "").length === 0;
  if (isEmpty) {
    throw new Error("topic_required");
  }

  // Sacred topic must remain EXACT user input.
  const sacredTopic = rawTopic;

  return {
    id: makeId(),
    topic: sacredTopic,
    depth: 0,
    angle: "baseline",
    covered: [],
    history: [],
  };
}

export function step(
  session: LearningSession,
  action: Action,
  options?: { angle?: string }
): { session: LearningSession; response: EngineResponse } {
  const safeSession: LearningSession = {
    id: String(session?.id || makeId()),
    topic: String(session?.topic || ""),
    depth: clamp(Number(session?.depth || 0), 0, 500),
    angle: String(session?.angle || "baseline"),
    covered: Array.isArray(session?.covered) ? session.covered.map(String) : [],
    history: Array.isArray(session?.history)
      ? session.history
          .map((h: any) => ({ action: h?.action as Action, note: String(h?.note || "") }))
          .filter((h) => h.action && typeof h.note === "string")
      : [],
  };

  // Topic is sacred: never mutate it.
  const sacredTopic = safeSession.topic;
  if (!sacredTopic) throw new Error("topic_required");

  const depthDelta = action === "DEEPER" ? 1 : 0;
  const nextDepth = clamp(safeSession.depth + depthDelta, 0, 500);

  const requestedAngle = options?.angle ? norm(options.angle) : "";
  const nextAngle = action === "DIFFERENT_ANGLE" && requestedAngle ? requestedAngle : safeSession.angle;

  const newConcept = pickNewConcept({
    session: safeSession,
    action,
    nextDepth,
    nextAngle,
  });

  const ambiguous = isAmbiguous(sacredTopic);

  const content = renderSlice({
    topic: sacredTopic,
    action,
    depth: nextDepth,
    angle: nextAngle,
    newConcept,
    alreadyCoveredCount: safeSession.covered.length,
    ambiguous,
  });

  const nextSession: LearningSession = {
    ...safeSession,
    // sacred
    topic: sacredTopic,
    depth: nextDepth,
    angle: nextAngle,
    covered: [...safeSession.covered, newConcept].slice(-500),
    history: [...safeSession.history, { action, note: `added:${newConcept}` }].slice(-1000),
  };

  const response: EngineResponse = {
    content,
    newConcept,
    depthDelta,
    angle: nextAngle,
    nextActions: computeNextActions(action),
  };

  return { session: nextSession, response };
}

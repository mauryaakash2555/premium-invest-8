import type { BehaviourConfig, BehaviourToggle } from "./types";

export interface BehaviourEffects {
  /** Multiplier for contributions (e.g. panic may reduce). */
  contributionMultiplier: number;
  /** Additional delay in months before starting contributions. */
  extraDelayMonths: number;
  /** If true, forces an equity de-risking this month (simplified). */
  forceDerisk: boolean;
}

function hasToggle(behaviour: BehaviourConfig, toggle: BehaviourToggle): boolean {
  return behaviour.toggles.includes(toggle);
}

function hasAnyToggle(behaviour: BehaviourConfig, toggles: BehaviourToggle[]): boolean {
  for (const t of toggles) {
    if (hasToggle(behaviour, t)) return true;
  }
  return false;
}

export function computeBehaviourEffects(params: {
  behaviour: BehaviourConfig;
  yearIndex: number;
  monthIndex: number;
  marketCycle: "bull" | "bear" | "sideways" | "crash";
}): BehaviourEffects {
  const { behaviour, marketCycle } = params;
  const intensity = Math.min(1, Math.max(0, behaviour.intensity ?? 0.65));

  let contributionMultiplier = 1;
  let extraDelayMonths = 0;
  let forceDerisk = false;

  if (hasAnyToggle(behaviour, ["delay", "delay_start"])) {
    extraDelayMonths = Math.round(3 + 9 * intensity);
  }

  if (hasAnyToggle(behaviour, ["panic", "panic_sell"])) {
    if (marketCycle === "bear" || marketCycle === "crash") {
      contributionMultiplier *= 1 - 0.35 * intensity;
      forceDerisk = true;
    }
    if (marketCycle === "sideways") {
      contributionMultiplier *= 1 - 0.10 * intensity;
    }
  }

  if (hasAnyToggle(behaviour, ["discipline", "perfect_discipline"])) {
    // Discipline overrides some panic effects (net positive).
    contributionMultiplier *= 1 + 0.10 * intensity;
    // No forced derisk if disciplined.
    forceDerisk = false;
  }

  // Overconfidence: ramps up contributions after gains (consequence-only modeling).
  if (hasAnyToggle(behaviour, ["overconfident"]) && (marketCycle === "bull")) {
    contributionMultiplier *= 1 + 0.15 * intensity;
  }

  return { contributionMultiplier, extraDelayMonths, forceDerisk };
}

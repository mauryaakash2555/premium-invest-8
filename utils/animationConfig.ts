import { TIMING } from './animationTiming';
import { EASING } from './easing';

export const ANIMATION_CONFIG = {
  timing: TIMING,
  easing: EASING,
  defaults: {
    numberDurationMs: 1200,
    numberUpdateDurationMs: 600,
    entranceDurationMs: TIMING.entrance,
  },
} as const;

export function getStaggerDelay(index: number, baseDelay: number = TIMING.stagger): number {
  return index * baseDelay;
}

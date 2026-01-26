export const EASING = {
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export function easeOutCubic(t: number) {
  // Smooth deceleration; good default for number tweens
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

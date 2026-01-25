export const TIMING = {
  // Micro-interactions
  tap: 150,
  hover: 250,

  // Standard transitions
  short: 300,
  medium: 500,

  // Entrance animations
  entrance: 600,

  // Page transitions
  page: 800,

  // Delays for stagger
  stagger: 50,
  cardStagger: 100,
} as const;

export type TimingKey = keyof typeof TIMING;

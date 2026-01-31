// Centralized schedule for the floating chat popup.
// Keep this small and deterministic so behavior is predictable in prod.

export const BOT_POPUP_SCHEDULE = {
  enabled: true,

  // Only attempt auto-open on these paths (regex strings are compiled client-side).
  // Exclude /live-intelligence via WhatsAppFloat guard.
  allowedPathPatterns: [
    '^/$',
    '^/blog(?:/|$)',
    '^/tools(?:/|$)',
    '^/services(?:/|$)',
    '^/contact(?:/|$)',
  ],

  // Delay tuning by route group (first match wins).
  delaysMsByPathPattern: [
    { pattern: '^/$', delayMs: 12000 },
    { pattern: '^/blog(?:/|$)', delayMs: 16000 },
    { pattern: '^/tools(?:/|$)', delayMs: 18000 },
    { pattern: '.*', delayMs: 15000 },
  ],

  // Safety: do not spam.
  maxAutoOpensPerDay: 1,

  // Safety: only if user has been on the page for a bit.
  minDwellMs: 7000,
};

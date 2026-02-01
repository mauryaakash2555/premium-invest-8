// Centralized schedule for the floating chat popup.
// Keep this small and deterministic so behavior is predictable in prod.

export const BOT_POPUP_SCHEDULE = {
  // IMPORTANT: keep chat click-to-open only. Auto-open feels like a pop-up and users reported it opens “all of a sudden”.
  enabled: false,

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

// Soft “nudge” (tooltip bubble) near the bot trigger.
// This does NOT open chat automatically; it only shows a message.
export const BOT_NUDGE_CONFIG = {
  enabled: true,

  allowedPathPatterns: BOT_POPUP_SCHEDULE.allowedPathPatterns,

  // Slightly earlier than the old auto-open, but still after the user is settled.
  delaysMsByPathPattern: [
    { pattern: '^/$', delayMs: 9000 },
    { pattern: '^/blog(?:/|$)', delayMs: 12000 },
    { pattern: '^/tools(?:/|$)', delayMs: 12000 },
    { pattern: '.*', delayMs: 11000 },
  ],

  maxNudgesPerDay: 1,
  minDwellMs: 6000,

  // Extra friendly one-liners (rotated alongside path-specific messages).
  // Keep it light, no promises.
  extraMessages: [
    'You are 100% my favourite human today',
    'Need help? Click me',
  ],

  // Repeating “love” pulse near the bot (does NOT open chat automatically).
  // The heart itself should appear frequently but briefly.
  lovePulse: {
    enabled: true,
    // Random interval range. Requested: every 15–25 seconds.
    minIntervalMs: 15000,
    maxIntervalMs: 25000,
    // How long the heart stays visible.
    visibleMs: 1600,
  },

  // Keep it short and friendly; no promises.
  textByPathPattern: [
    { pattern: '^/tools/itr-filing-help(?:/|$)', text: 'Want help? Upload Form 16 / AIS and I will explain the estimate.' },
    { pattern: '^/tools(?:/|$)', text: 'Need a calculator? Tell me your goal — SIP, tax, or insurance.' },
    { pattern: '^/blog(?:/|$)', text: 'Want a quick summary? Ask me what this article means for you.' },
    { pattern: '.*', text: 'Need help? Click me' },
  ],
};

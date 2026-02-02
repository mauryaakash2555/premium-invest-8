/**
 * FILE: components/WhatsAppFloat.jsx
 * PURPOSE: Floating WhatsApp button that opens the on-site AI chat modal.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - components/user/AIChatFloat.jsx
 * - components/shared/ChatErrorBoundary.jsx
 *
 * SIMPLE EXPLANATION:
 * This shows a small chat icon on the page.
 * When you click it, the AI chat window opens.
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import AIChatFloat from '@/components/user/AIChatFloat';
import ChatErrorBoundary from '@/components/shared/ChatErrorBoundary';
import Chatbot3DTrigger from '../../src/components/Chatbot3DTrigger';
import { BOT_POPUP_SCHEDULE, BOT_NUDGE_CONFIG } from '@/config/botPopupSchedule';

function safeNow() {
  try {
    return Date.now();
  } catch {
    return new Date().getTime();
  }
}

function localDayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function compilePatterns(patterns) {
  return (Array.isArray(patterns) ? patterns : [])
    .map((p) => {
      try {
        return new RegExp(String(p));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function pickDelayMs(pathname, schedule) {
  const list = Array.isArray(schedule?.delaysMsByPathPattern) ? schedule.delaysMsByPathPattern : [];
  for (const row of list) {
    try {
      const re = new RegExp(String(row?.pattern || ''));
      if (re.test(pathname)) {
        const ms = Number(row?.delayMs);
        return Number.isFinite(ms) ? ms : 15000;
      }
    } catch {
      // ignore
    }
  }
  return 15000;
}

function pickNudgeText(pathname, nudge) {
  const list = Array.isArray(nudge?.textByPathPattern) ? nudge.textByPathPattern : [];
  for (const row of list) {
    try {
      const re = new RegExp(String(row?.pattern || ''));
      if (re.test(pathname)) {
        const t = String(row?.text || '').trim();
        if (t) return t;
      }
    } catch {
      // ignore
    }
  }
  return '';
}

function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function pickRotatingNudgeText(pathname, nudge) {
  const pathText = pickNudgeText(pathname, nudge);
  const extras = Array.isArray(nudge?.extraMessages)
    ? nudge.extraMessages.map((x) => String(x || '').trim()).filter(Boolean)
    : [];

  const variants = [pathText, ...extras].filter(Boolean);
  if (!variants.length) return '';

  // Rotate across variants once per impression, per day.
  const dayKey = localDayKey();
  const key = 'bmw_bot_nudge_variant_v1';
  let idx = 0;
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    const parsed = safeJsonParse(raw);
    if (parsed && parsed.dayKey === dayKey && Number.isFinite(parsed.idx)) idx = parsed.idx;
  } catch {
    idx = 0;
  }

  const picked = variants[idx % variants.length];
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify({ dayKey, idx: idx + 1, at: new Date().toISOString() }));
    }
  } catch {
    // ignore
  }
  return picked;
}

function randInt(min, max) {
  const a = Number(min);
  const b = Number(max);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

const WhatsAppFloat = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeText, setNudgeText] = useState('');
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [showLovePulse, setShowLovePulse] = useState(false);
  const [hasShownFavOnce, setHasShownFavOnce] = useState(false);
  const LOVE_NUDGE_TEXT = 'You are 100% my favorite human today';
  const whatsappHref = "https://wa.me/918850977259";
  const pathname = usePathname();
  const isLiveIntelligence = Boolean(pathname?.startsWith('/live-intelligence'));

  const FAV_ONCE_KEY = 'bmw_bot_fav_once_session_v1';

  useEffect(() => {
    setMounted(true);

    // Session-scoped: treat as "once per login/session".
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        setHasShownFavOnce(window.sessionStorage.getItem(FAV_ONCE_KEY) === '1');
      }
    } catch {
      // ignore
    }
  }, []);

  const schedule = BOT_POPUP_SCHEDULE;
  const nudge = BOT_NUDGE_CONFIG;
  const allowedPatterns = useMemo(
    () => compilePatterns(schedule?.allowedPathPatterns),
    [schedule]
  );
  const nudgeAllowedPatterns = useMemo(
    () => compilePatterns(nudge?.allowedPathPatterns),
    [nudge]
  );
  const didScheduleRef = useRef(false);
  const timerRef = useRef(null);
  const didNudgeRef = useRef(false);
  const nudgeTimerRef = useRef(null);
  const nudgeAutoHideRef = useRef(null);
  const nudgeUnmountRef = useRef(null);
  const lovePulseTimerRef = useRef(null);
  const lovePulseHideRef = useRef(null);

  const clearNudgeTimers = () => {
    if (nudgeAutoHideRef.current) {
      try {
        clearTimeout(nudgeAutoHideRef.current);
      } catch {
        // ignore
      }
      nudgeAutoHideRef.current = null;
    }
    if (nudgeUnmountRef.current) {
      try {
        clearTimeout(nudgeUnmountRef.current);
      } catch {
        // ignore
      }
      nudgeUnmountRef.current = null;
    }
  };

  const beginHideNudge = (openChat = false) => {
    // Start exit animation.
    setNudgeVisible(false);
    clearNudgeTimers();

    // Unmount after transition.
    nudgeUnmountRef.current = setTimeout(() => {
      setShowNudge(false);
      setNudgeVisible(false);
      if (openChat) setOpen(true);
    }, 240);
  };

  const canAutoOpenOnPath = useMemo(() => {
    if (!schedule?.enabled) return false;
    const p = String(pathname || '/');
    if (!allowedPatterns.length) return true;
    return allowedPatterns.some((re) => re.test(p));
  }, [allowedPatterns, pathname, schedule]);

  const canNudgeOnPath = useMemo(() => {
    if (!nudge?.enabled) return false;
    const p = String(pathname || '/');
    if (!nudgeAllowedPatterns.length) return true;
    return nudgeAllowedPatterns.some((re) => re.test(p));
  }, [nudge, nudgeAllowedPatterns, pathname]);

  useEffect(() => {
    // Keep Live Intelligence clean (no bot auto-open, no timers).
    if (isLiveIntelligence) return;

    // Never auto-open if already open.
    if (open) return;
    if (!canAutoOpenOnPath) return;
    if (didScheduleRef.current) return;
    didScheduleRef.current = true;

    // Respect reduced-motion users.
    try {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
        return;
      }
    } catch {
      // ignore
    }

    const dayKey = localDayKey();
    const key = 'bmw_bot_popup_v1';
    const maxPerDay = Number(schedule?.maxAutoOpensPerDay ?? 1);
    const minDwell = Number(schedule?.minDwellMs ?? 7000);

    let alreadyCount = 0;
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.dayKey === dayKey && Number.isFinite(parsed.count)) {
          alreadyCount = parsed.count;
        }
      }
    } catch {
      alreadyCount = 0;
    }

    if (alreadyCount >= maxPerDay) return;

    const delayMs = pickDelayMs(String(pathname || '/'), schedule);
    const start = safeNow();
    const totalDelay = Math.max(minDwell, delayMs);

    timerRef.current = setTimeout(() => {
      // If user navigated away, abort.
      try {
        const currentPath = window.location?.pathname || '';
        if (String(currentPath) !== String(pathname || '')) return;
      } catch {
        // ignore
      }

      // If tab not visible, avoid surprise.
      try {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      } catch {
        // ignore
      }

      // Safety: if system clock jumped, still allow.
      void start;

      setOpen(true);
      try {
        const next = { dayKey, count: alreadyCount + 1, at: new Date().toISOString() };
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
    }, totalDelay);

    return () => {
      if (timerRef.current) {
        try {
          clearTimeout(timerRef.current);
        } catch {
          // ignore
        }
        timerRef.current = null;
      }
    };
  }, [canAutoOpenOnPath, isLiveIntelligence, open, pathname, schedule]);

  useEffect(() => {
    // Keep Live Intelligence clean.
    if (isLiveIntelligence) return;

    // No nudge if chat is open.
    if (open) {
      clearNudgeTimers();
      setShowNudge(false);
      setNudgeVisible(false);
      return;
    }

    if (!canNudgeOnPath) return;
    if (didNudgeRef.current) return;
    didNudgeRef.current = true;

    // Respect reduced-motion users.
    try {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
        return;
      }
    } catch {
      // ignore
    }

    // Only show this line once per session.
    if (hasShownFavOnce) return;

    const minDwell = Number(nudge?.minDwellMs ?? 6000);

    const delayMs = pickDelayMs(String(pathname || '/'), nudge);
    const totalDelay = Math.max(minDwell, delayMs);
    const text = LOVE_NUDGE_TEXT;

    nudgeTimerRef.current = setTimeout(() => {
      // If user navigated away, abort.
      try {
        const currentPath = window.location?.pathname || '';
        if (String(currentPath) !== String(pathname || '')) return;
      } catch {
        // ignore
      }

      // If tab not visible, avoid surprise.
      try {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      } catch {
        // ignore
      }

      setNudgeText(text);
      setShowNudge(true);
      setNudgeVisible(false);

      // Animate in on next frame (prevents popping in at opacity:1)
      try {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => setNudgeVisible(true));
        } else {
          setTimeout(() => setNudgeVisible(true), 16);
        }
      } catch {
        setTimeout(() => setNudgeVisible(true), 16);
      }

      // Auto-dismiss after a short time (premium nudge, not sticky)
      clearNudgeTimers();
      // User request: quick, calm appearance and exit (not sticky)
      const autoHideMs = Math.max(900, Number(nudge?.autoHideMs ?? 1800));
      nudgeAutoHideRef.current = setTimeout(() => {
        // Only auto-hide if still on same path and chat is not open.
        try {
          const currentPath = window.location?.pathname || '';
          if (String(currentPath) !== String(pathname || '')) return;
        } catch {
          // ignore
        }
        if (!open) beginHideNudge(false);
      }, autoHideMs);

      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(FAV_ONCE_KEY, '1');
        }
      } catch {
        // ignore
      }

      setHasShownFavOnce(true);
    }, totalDelay);

    return () => {
      if (nudgeTimerRef.current) {
        try {
          clearTimeout(nudgeTimerRef.current);
        } catch {
          // ignore
        }
        nudgeTimerRef.current = null;
      }
    };
  }, [canNudgeOnPath, hasShownFavOnce, isLiveIntelligence, nudge, open, pathname]);

  useEffect(() => {
    return () => {
      clearNudgeTimers();
    };
  }, []);

  useEffect(() => {
    // Keep Live Intelligence clean.
    if (isLiveIntelligence) return;

    // Don't pulse while chat is open or while a text nudge is already showing.
    if (open || showNudge) {
      setShowLovePulse(false);
      return;
    }

    const lp = nudge?.lovePulse;
    if (!lp?.enabled) return;

    // Only start hearts after the one-time message has been shown/dismissed.
    if (!hasShownFavOnce) return;

    // Respect reduced-motion users.
    try {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
        return;
      }
    } catch {
      // ignore
    }

    const intervalMs = 15000;
    const visibleMs = Number(lp?.visibleMs ?? 1100);

    const clearTimers = () => {
      if (lovePulseTimerRef.current) {
        try {
          clearTimeout(lovePulseTimerRef.current);
        } catch {
          // ignore
        }
        lovePulseTimerRef.current = null;
      }
      if (lovePulseHideRef.current) {
        try {
          clearTimeout(lovePulseHideRef.current);
        } catch {
          // ignore
        }
        lovePulseHideRef.current = null;
      }
    };

    const tick = () => {
      // If tab not visible, skip this tick.
      try {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      } catch {
        // ignore
      }

      // If user navigated away, skip.
      try {
        const currentPath = window.location?.pathname || '';
        if (String(currentPath) !== String(pathname || '')) return;
      } catch {
        // ignore
      }

      setShowLovePulse(true);
      clearTimeout(lovePulseHideRef.current);
      lovePulseHideRef.current = setTimeout(() => {
        setShowLovePulse(false);
      }, Math.max(500, visibleMs));
    };

    clearTimers();
    // First heart appears after 15s, then every 15s.
    lovePulseTimerRef.current = setInterval(tick, intervalMs);

    return () => {
      clearTimers();
    };
  }, [hasShownFavOnce, isLiveIntelligence, nudge, open, pathname, showNudge]);

  if (!mounted) return null;
  if (isLiveIntelligence) return null;

  const showHeart = Boolean(showLovePulse && !showNudge);

  return (
    <div style={{ position: 'relative' }}>
      {/* 🔵 Floating 3D BLACK robot trigger */}
      <Chatbot3DTrigger
        className="chatbot-float"
        aria-label="Open chat"
        sceneUrl="/spline/genkub/scene.splinecode"
        size={200}
        onActivate={() => {
          setShowNudge(false);
          setOpen(true);
        }}
      >
        {/* Heart pulse: anchored near the bot head (desktop + mobile) */}
        <div
          style={{
            position: 'absolute',
            left: '-10px',
            top: '62px',
            zIndex: 5,
            opacity: showHeart ? 1 : 0,
            transform: showHeart ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0,6px,0) scale(0.96)',
            transition: 'opacity 260ms ease, transform 260ms ease',
            pointerEvents: showHeart ? 'auto' : 'none',
          }}
        >
          <button
            type="button"
            aria-label="Need help? Open chat"
            onClick={() => {
              setShowLovePulse(false);
              setOpen(true);
            }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '999px',
              border: '1px solid rgba(170, 198, 255, 0.18)',
              background: 'linear-gradient(135deg, rgba(12,14,20,0.82) 0%, rgba(0,0,0,0.62) 100%)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(235,245,255,0.92)',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">❤️</span>
          </button>
        </div>

        {/* Nudge bubble: anchored above-left of bot */}
        {showNudge ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute',
              left: '-260px',
              bottom: '138px',
              zIndex: 6,
              width: '280px',
              maxWidth: '280px',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                borderRadius: '16px',
                border: '1px solid rgba(170, 198, 255, 0.18)',
                background: 'linear-gradient(135deg, rgba(12,14,20,0.92) 0%, rgba(0,0,0,0.78) 100%)',
                boxShadow: '0 28px 90px rgba(0,0,0,0.75)',
                padding: '12px 12px',
                color: 'rgba(235,245,255,0.92)',
                fontSize: '12px',
                lineHeight: 1.45,
                cursor: 'pointer',
                opacity: nudgeVisible ? 1 : 0,
                transform: nudgeVisible ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0,10px,0) scale(0.985)',
                transition: 'opacity 220ms ease, transform 220ms ease',
                willChange: 'opacity, transform',
              }}
              onClick={() => {
                beginHideNudge(true);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1 }}>{nudgeText}</div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  data-chatbot-ignore-activate="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    beginHideNudge(false);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'rgba(235,245,255,0.65)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Chatbot3DTrigger>

      {/* 🔵 AI Chat modal */}
      <ChatErrorBoundary>
        <AIChatFloat open={open} onClose={() => setOpen(false)} whatsappHref={whatsappHref} />
      </ChatErrorBoundary>
    </div>
  );
};

export default WhatsAppFloat;

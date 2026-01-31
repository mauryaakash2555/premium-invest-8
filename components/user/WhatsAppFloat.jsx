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
import { BOT_POPUP_SCHEDULE } from '@/config/botPopupSchedule';

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

const WhatsAppFloat = () => {
  const [open, setOpen] = useState(false);
  const whatsappHref = "https://wa.me/918850977259";
  const pathname = usePathname();
  const isLiveIntelligence = Boolean(pathname?.startsWith('/live-intelligence'));

  const schedule = BOT_POPUP_SCHEDULE;
  const allowedPatterns = useMemo(
    () => compilePatterns(schedule?.allowedPathPatterns),
    [schedule]
  );
  const didScheduleRef = useRef(false);
  const timerRef = useRef(null);

  const canAutoOpenOnPath = useMemo(() => {
    if (!schedule?.enabled) return false;
    const p = String(pathname || '/');
    if (!allowedPatterns.length) return true;
    return allowedPatterns.some((re) => re.test(p));
  }, [allowedPatterns, pathname, schedule]);

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

  if (isLiveIntelligence) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* 🔵 Floating 3D bot trigger (keeps existing chat logic) */}
      <Chatbot3DTrigger
        className="chatbot-float"
        aria-label="Open chat"
        size={200}
        onActivate={() => setOpen(true)}
      />

      {/* 🔵 AI Chat modal */}
      <ChatErrorBoundary>
        <AIChatFloat open={open} onClose={() => setOpen(false)} whatsappHref={whatsappHref} />
      </ChatErrorBoundary>
    </div>
  );
};

export default WhatsAppFloat;

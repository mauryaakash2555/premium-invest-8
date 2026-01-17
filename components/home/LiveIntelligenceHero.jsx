"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import styles from "./LiveIntelligenceHero.module.css";

const LASER_ASSET_VERSION = "seamless-xfade-fade-2026-01-11";
const WHATSAPP_NUMBER = "918850977259";
const WHATSAPP_COPY = "Get important market updates on WhatsApp. No spam.";
const WHATSAPP_PREFILL = "Hi BM Wealth, I want important market updates on WhatsApp. No spam.";

const CATEGORIES = [
  "Share Market",
  "Mutual Funds",
  "News",
  "Insurance",
  "FD / RD / Bonds",
  "PMS / AIF",
  "Highest Plans",
];

function getIstMinutesNow() {
  try {
    const parts = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
    return hour * 60 + minute;
  } catch {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
}

function getMarketModeIst() {
  const time = getIstMinutesNow();

  if (time >= 360 && time < 570) return { mode: "morning", label: "Morning Brief" };
  if (time >= 570 && time < 930) return { mode: "live", label: "Live Market Pulse" };
  if (time >= 930 && time < 1020) return { mode: "close", label: "Market Close" };
  if (time >= 1020 && time < 1260) return { mode: "evening", label: "Evening Intelligence" };
  if (time >= 1260 && time < 1440) return { mode: "summary", label: "What You Missed Today" };
  return { mode: "global", label: "Global Watch" };
}

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return fallback;
  }
}

function getStorageKey(key) {
  return `bmw_live_intel_${key}`;
}

function getTodayIstKey() {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
      2,
      "0"
    )}`;
  }
}

function getDefaultItems() {
  // WHAT happened — WHY it matters (Master Spec §7)
  return [
    {
      id: "sm_1",
      category: "Share Market",
      urgency: "normal",
      text: "NIFTY holds above 24,000 — sustained FII buying supports trend after consolidation",
    },
    {
      id: "mf_1",
      category: "Mutual Funds",
      urgency: "normal",
      text: "SIP inflows stay strong — steady retail participation signals long-term confidence",
    },
    {
      id: "news_1",
      category: "News",
      urgency: "normal",
      text: "RBI keeps repo rate unchanged — policy stance keeps borrowing-cost outlook stable",
    },
    {
      id: "ins_1",
      category: "Insurance",
      urgency: "normal",
      text: "Insurers push faster claim settlement — service improvements influence customer retention",
    },
    {
      id: "fd_1",
      category: "FD / RD / Bonds",
      urgency: "normal",
      text: "Large banks tweak FD rates — small changes impact risk-free return comparisons",
    },
    {
      id: "pms_1",
      category: "PMS / AIF",
      urgency: "normal",
      text: "AIF allocations rise for HNIs — demand shifts toward diversified, mandate-driven strategies",
    },
  ].filter((x) => CATEGORIES.includes(x.category));
}

export default function LiveIntelligenceHero() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [marketMode, setMarketMode] = useState(() => getMarketModeIst());
  const [isExpanded, setIsExpanded] = useState(false);

  // Rotation state
  const [activeIdx, setActiveIdx] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const headlineShownAtRef = useRef(Date.now());

  // Behavioral counters (WhatsApp gating)
  const [expandCount, setExpandCount] = useState(0);

  // Cursor-follow subtle light (no orange)
  const [cursor, setCursor] = useState({ x: 50, y: 35 });

  // Data (v1: local defaults; ready to swap to RSS/API/admin)
  const items = useMemo(() => getDefaultItems(), []);

  const isSummaryMode = marketMode.mode === "summary";

  const whatsappEligible = useMemo(() => {
    return isSummaryMode || expandCount >= 2 || pauseCount >= 2;
  }, [expandCount, pauseCount, isSummaryMode]);

  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(WHATSAPP_PREFILL);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  }, []);

  // Video autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  // IST market mode refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketMode(getMarketModeIst());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Restore counters (per day, IST)
  useEffect(() => {
    try {
      const day = getTodayIstKey();
      const raw = safeJsonParse(localStorage.getItem(getStorageKey("counters")), {});
      const todays = raw?.[day] || {};
      setExpandCount(Number(todays.expandCount || 0));
      setPauseCount(Number(todays.pauseCount || 0));
    } catch {
      // ignore
    }
  }, []);

  const persistCounters = (nextExpand, nextPause) => {
    try {
      const day = getTodayIstKey();
      const raw = safeJsonParse(localStorage.getItem(getStorageKey("counters")), {});
      const next = {
        ...(raw || {}),
        [day]: {
          expandCount: Number(nextExpand || 0),
          pauseCount: Number(nextPause || 0),
          updatedAt: nowIso(),
        },
      };
      localStorage.setItem(getStorageKey("counters"), JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Rotation (no scrolling): fade → replace → fade (~10s for readability)
  useEffect(() => {
    if (!items.length) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [items.length]);

  // Impression + pause tracking
  useEffect(() => {
    const now = Date.now();
    const elapsed = now - headlineShownAtRef.current;
    const prev = items[(activeIdx - 1 + items.length) % items.length];

    // On index change, evaluate pause for previous headline
    if (prev && elapsed >= 2500) {
      const nextPause = pauseCount + 1;
      setPauseCount(nextPause);
      persistCounters(expandCount, nextPause);
      trackEvent("headline_pause", { headline_id: prev.id, category: prev.category, mode: marketMode.mode });
    }

    const cur = items[activeIdx];
    if (cur) {
      trackEvent("headline_impression", { headline_id: cur.id, category: cur.category, mode: marketMode.mode });
    }

    headlineShownAtRef.current = now;
  }, [activeIdx]);

  // Summary view tracking (once per day)
  useEffect(() => {
    if (!isSummaryMode) return;
    try {
      const day = getTodayIstKey();
      const key = getStorageKey("summary_viewed");
      const raw = safeJsonParse(localStorage.getItem(key), {});
      if (raw?.[day]) return;
      localStorage.setItem(key, JSON.stringify({ ...(raw || {}), [day]: true, at: nowIso() }));
      trackEvent("summary_view", { mode: marketMode.mode });
    } catch {
      trackEvent("summary_view", { mode: marketMode.mode });
    }
  }, [isSummaryMode, marketMode.mode]);

  // Cursor-follow spotlight (subtle, no orange)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCursor({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // WhatsApp CTA view tracking (once per session)
  useEffect(() => {
    if (!whatsappEligible || !isExpanded) return;
    try {
      const key = getStorageKey("whatsapp_viewed_session");
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    trackEvent("whatsapp_cta_view", { mode: marketMode.mode });
  }, [whatsappEligible, isExpanded, marketMode.mode]);

  const active = items[activeIdx] || items[0];

  const onToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);

    if (next) {
      const nextExpand = expandCount + 1;
      setExpandCount(nextExpand);
      persistCounters(nextExpand, pauseCount);
      trackEvent("panel_expand", { mode: marketMode.mode });
    }
  };

  return (
    <section ref={containerRef} className={styles.stage} aria-label="Live Intelligence Hero">
      <div
        className={styles.cursorSpotlight}
        style={{
          // CSS vars used by module
          ["--cx"]: `${cursor.x}%`,
          ["--cy"]: `${cursor.y}%`,
        }}
        aria-hidden="true"
      />

      <video
        ref={videoRef}
        className={styles.laserVideo}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
      >
        <source src={`/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`} type="video/mp4" />
      </video>

      <div className={styles.topFade} aria-hidden="true" />
      <div className={styles.bottomFade} aria-hidden="true" />

      {/* Huly-style top content */}
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Live Intelligence</h1>
        <p className={styles.heroSubtitle}>
          Educational, observational market signals — designed for clarity. No noise.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/tools" className={styles.ctaPrimary}>
            Access Your Complimentary Wealth Blueprint
          </Link>
          <Link href="/services" className={styles.ctaSecondary}>
            Explore Services 
          </Link>
        </div>
      </div>

      {/* LIVE INTELLIGENCE STRIP (NOT a ticker / NOT scrolling) */}
      <div className={styles.liveMoodContainer}>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span className={styles.liveText}>LIVE</span>
          <span className={styles.modeLabel}>{marketMode.label}</span>
        </div>

        <motion.div
          className={styles.panel}
          onClick={onToggleExpand}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onToggleExpand();
          }}
          initial={false}
          animate={{ scale: isExpanded ? 1 : 0.98, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          aria-expanded={isExpanded}
        >
          {!isExpanded && active && (
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className={styles.headlineRow}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <span className={styles.headlineCategory}>{active.category}</span>
                <span className={styles.headlineText}>{active.text}</span>
              </motion.div>
            </AnimatePresence>
          )}

          {isExpanded && (
            <motion.div
              className={styles.expandedContent}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {isSummaryMode && (
                <div className={styles.summaryHeader}>
                  <span className={styles.summaryIcon}>🌙</span>
                  <span>What You Missed Today</span>
                </div>
              )}

              {items.slice(0, 7).map((h) => (
                <div key={h.id} className={styles.expandedHeadline}>
                  <span className={styles.headlineCategory}>{h.category}</span>
                  <span className={styles.headlineText}>{h.text}</span>
                </div>
              ))}

              {whatsappEligible && (
                <div className={styles.whatsappCtaWrap}>
                  <div className={styles.whatsappCopy}>{WHATSAPP_COPY}</div>
                  <a
                    className={styles.whatsappBtn}
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent("whatsapp_cta_click", { mode: marketMode.mode })}
                  >
                    WhatsApp Opt-In
                  </a>
                </div>
              )}
            </motion.div>
          )}

          <div className={styles.expandHint}>{isExpanded ? "Click to collapse" : "Click to expand"}</div>
        </motion.div>
      </div>
    </section>
  );
}

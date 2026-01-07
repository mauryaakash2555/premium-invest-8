/**
 * FILE: components\user\PremiumMarketTicker.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - react
 * - ./PremiumMarketTicker.module.css
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

﻿"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PremiumMarketTicker.module.css";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function toFiniteNumber(v) {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    // allow "24,857.30" / "₹7,245" / "90.214" etc.
    const cleaned = v.replace(/[^0-9.+-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Requested: Display formatting
function formatNumber(num, maximumFractionDigits) {
  const n = toFiniteNumber(num);
  if (n == null) return "—";
  try {
    const opts = {};
    if (typeof maximumFractionDigits === "number") opts.maximumFractionDigits = maximumFractionDigits;
    return new Intl.NumberFormat("en-IN", opts).format(n);
  } catch {
    return String(n);
  }
}

function fmtValue(item) {
  const v = toFiniteNumber(item?.value);
  if (v == null) return "—";
  // Keep values numeric-only (no currency prefix) to avoid any CSS/spacing issues.
  if (item.kind === "fx") return formatNumber(v, 2);
  return formatNumber(v, 0);
}

function fmtPct(p) {
  const n = toFiniteNumber(p);
  if (n == null) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function IconIndex({ tone = "up" }) {
  // â€œBar chartâ€ glyph similar to screenshot
  const c = tone === "down" ? "#d44" : "#32c26b";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className={styles.icon}>
      <rect x="2" y="11" width="3" height="7" rx="0.6" fill={c} opacity="0.95" />
      <rect x="7" y="8" width="3" height="10" rx="0.6" fill={c} opacity="0.95" />
      <rect x="12" y="4" width="3" height="14" rx="0.6" fill={c} opacity="0.95" />
      <path d="M1.5 18.5H18.5" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
    </svg>
  );
}

function IconCoin({ metal = "gold" }) {
  // Coin glyph similar to screenshot (subtle inner ring)
  const rim = metal === "silver" ? "#d3d7dd" : "#d7b152";
  const core = metal === "silver" ? "#aeb6c1" : "#caa24a";
  const hi = metal === "silver" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.20)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className={styles.icon}>
      <circle cx="11" cy="11" r="9" fill={rim} opacity="0.95" />
      <circle cx="11" cy="11" r="6.2" fill={core} opacity="0.92" />
      <path
        d="M6.2 9.0c1.6-2.9 6.2-4.2 9.2-2.2"
        fill="none"
        stroke={hi}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M7.2 14.6c2.0 1.7 6.1 1.9 8.3 0.2"
        fill="none"
        stroke="rgba(0,0,0,0.20)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

function IconFx() {
  // FX arrows (blue) similar to screenshot
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="M7 7h10l-2.2-2.2"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 17H7l2.2 2.2"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 7v6"
        fill="none"
        stroke="rgba(59,130,246,0.45)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 17v-6"
        fill="none"
        stroke="rgba(59,130,246,0.45)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getIcon(item) {
  if (item.id === "USDINR") return <IconFx />;
  if (item.id === "GOLD") return <IconCoin metal="gold" />;
  if (item.id === "SILVER") return <IconCoin metal="silver" />;
  // index
  return <IconIndex tone={item.direction} />;
}

function inferChangePct(x, value) {
  const pct = toFiniteNumber(
    x?.changePct ??
      x?.changePercent ??
      x?.change_percent ??
      x?.pctChange ??
      x?.pct_change ??
      x?.percentChange ??
      x?.percent_change ??
      x?.changePercentage ??
      x?.change_percentage
  );
  if (pct != null) return pct;

  const changeAbs = toFiniteNumber(
    x?.change ?? x?.delta ?? x?.diff ?? x?.variation ?? x?.changeValue ?? x?.change_value
  );

  if (changeAbs == null) return null;
  const v = toFiniteNumber(value);
  if (v == null) return null;

  const prev = v - changeAbs;
  if (!prev || !Number.isFinite(prev)) return null;

  const calculated = (changeAbs / prev) * 100;
  if (!Number.isFinite(calculated)) return null;
  if (Math.abs(calculated) > 100) return null;
  return calculated;
}

function inferDirection(x, changePct) {
  const dir = String(x?.direction || "").toLowerCase();
  if (dir === "up" || dir === "down" || dir === "flat") return dir;
  const pct = toFiniteNumber(changePct);
  if (pct == null) return "flat";
  if (pct > 0) return "up";
  if (pct < 0) return "down";
  return "flat";
}

function normalizeApi(json) {
  const items = Array.isArray(json?.items) ? json.items : [];
  return items
    .map((x) => {
      const value = toFiniteNumber(x.value ?? x.last ?? x.price ?? x.close);
      const changePct = inferChangePct(x, value);
      return {
        id: String(x.id || ""),
        name: String(x.name || x.label || ""),
        kind: String(x.kind || ""),
        value,
        changePct,
        direction: inferDirection(x, changePct),
        currency: String(x.currency || ""),
      };
    })
    // Keep items even if changePct is missing; we still want prices to show.
    .filter((x) => x.id && x.value != null);
}

// Requested: FALLBACK_DATA (if API fails)
const FALLBACK_DATA = [
  { id: "NIFTY50", name: "NIFTY 50", kind: "index", value: 24857, change: 127, changePercent: 0.52, changePct: 0.52, direction: "up", currency: "INR" },
  { id: "SENSEX", name: "SENSEX", kind: "index", value: 82365, change: 445, changePercent: 0.54, changePct: 0.54, direction: "up", currency: "INR" },
  { id: "USDINR", name: "USD/INR", kind: "fx", value: 84.32, change: 0.08, changePercent: 0.09, changePct: 0.09, direction: "up", currency: "INR" },
  { id: "GOLD", name: "GOLD", kind: "metal", value: 7245, change: 12, changePercent: 0.17, changePct: 0.17, direction: "up", currency: "INR" },
];

export default function PremiumMarketTicker({ className }) {
  // Show numbers immediately on first paint (SSR + hydration) while live data loads.
  const [data, setData] = useState(FALLBACK_DATA);
  const [asOf, setAsOf] = useState(null);
  const lastDataRef = useRef(FALLBACK_DATA);

  const placeholderItems = useMemo(
    () => [
      { id: "SENSEX", name: "SENSEX", kind: "index", direction: "flat", placeholder: true },
      { id: "NIFTY", name: "NIFTY 50", kind: "index", direction: "flat", placeholder: true },
      { id: "USDINR", name: "USD/INR", kind: "fx", direction: "flat", placeholder: true },
      { id: "GOLD", name: "GOLD", kind: "metal", direction: "flat", placeholder: true },
    ],
    []
  );

  // flash state per id when values change
  const [flashById, setFlashById] = useState({});

  // marquee engine
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const xRef = useRef(0);
  const baseSpeedRef = useRef(42); // px/s (slow, premium)

  const [pausedHover, setPausedHover] = useState(false);
  const [pausedTap, setPausedTap] = useState(false);
  const resumeKickRef = useRef(0);

  const paused = pausedHover || pausedTap;

  const doubled = useMemo(() => {
    const base = data.length ? data : placeholderItems;
    return base.length ? [...base, ...base] : [];
  }, [data, placeholderItems]);

  useEffect(() => {
    let stop = false;

    function applyFallback(reason, detail) {
      if (stop) return;
      // Only apply fallback if we don't already have last-known values.
      if (Array.isArray(lastDataRef.current) && lastDataRef.current.length) return;
      console.warn("Ticker fetch failed (fallback used):", reason, detail ?? "");
      lastDataRef.current = FALLBACK_DATA;
      setData(FALLBACK_DATA);
      setAsOf(null);
    }

    async function fetchNow() {
      try {
        const r = await fetch("/api/market-data", { cache: "no-store" });
        const j = await r.json().catch(() => null);

        if (!r.ok || !j?.ok) {
          applyFallback("bad_response", { status: r.status, ok: r.ok, bodyOk: Boolean(j?.ok) });
          return;
        }

        const next = normalizeApi(j);
        if (!next.length) {
          applyFallback("empty_items", j);
          return;
        }

        // detect changes for micro-highlight
        const prev = lastDataRef.current;
        const prevMap = new Map(prev.map((p) => [p.id, p]));
        const flashes = {};
        for (const item of next) {
          const p = prevMap.get(item.id);
          if (!p) continue;
          const changed = Math.abs(item.value - p.value) > 1e-9 || item.direction !== p.direction;
          if (changed) flashes[item.id] = Date.now();
        }
        if (Object.keys(flashes).length) {
          setFlashById((cur) => ({ ...cur, ...flashes }));
          // clear flashes after 700ms
          setTimeout(() => {
            setFlashById((cur) => {
              const out = { ...cur };
              for (const k of Object.keys(flashes)) delete out[k];
              return out;
            });
          }, 700);
        }

        lastDataRef.current = next;
        setData(next);
        setAsOf(String(j.asOf || ""));
      } catch (err) {
        console.error("Ticker fetch failed:", err);
        applyFallback("fetch_failed", String(err?.message || err));
      }
    }

    fetchNow();
    const id = setInterval(fetchNow, 60000);

    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  // marquee loop (requestAnimationFrame)
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    function loop(ts) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const contentWidth = track.scrollWidth / 2;
      const speed = paused ? 0 : baseSpeedRef.current;

      // rubber kick when resuming from tap
      let kick = 0;
      if (resumeKickRef.current > 0) {
        resumeKickRef.current -= dt;
        const t = 1 - clamp(resumeKickRef.current / 0.22, 0, 1); // 0..1
        // small back-then-forward impulse
        kick = (Math.sin(t * Math.PI) * -10) + (Math.sin(t * Math.PI) * 14 * t);
      }

      xRef.current -= speed * dt;

      // wrap seamlessly
      if (contentWidth > 0 && Math.abs(xRef.current) >= contentWidth) {
        xRef.current = xRef.current % contentWidth;
      }

      const x = xRef.current + kick;
      track.style.transform = `translate3d(${x}px,0,0)`;
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lastTsRef.current = 0;
    };
  }, [paused, doubled.length]);

  function onTapPause() {
    // mobile/tablet behavior: pause for 2s, then auto-resume with a â€œrubber pullâ€ kick
    if (pausedTap) return;
    setPausedTap(true);
    window.clearTimeout(window.__bmTickerTapTimer);
    window.__bmTickerTapTimer = window.setTimeout(() => {
      setPausedTap(false);
      resumeKickRef.current = 0.22; // seconds
    }, 2000);
  }

  return (
    <div
      ref={containerRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPausedHover(true)}
      onMouseLeave={() => setPausedHover(false)}
      onPointerDown={(e) => {
        // do not block scrolling; just detect a deliberate tap/click on the ticker
        if (e.pointerType === "touch" || e.pointerType === "pen") {
          onTapPause();
        } else {
          // desktop click also triggers the 2s pause
          onTapPause();
        }
      }}
      role="region"
      aria-label="Market Snapshot"
    >
      <div className={styles.inner}>
        <div className={styles.track} ref={trackRef}>
          {doubled.map((item, idx) => {
            const flash = flashById[item.id];
            const dir = item.direction;
            const isUp = dir === "up";
            const isDown = dir === "down";

            const isPlaceholder = Boolean(item.placeholder);
            const valueText = isPlaceholder ? "—" : fmtValue(item);
            const changeText = isPlaceholder ? "—" : fmtPct(item.changePct);

            // Keep SENSEX palette exactly as-is (your current look): label/value neutral, delta red/green only.
            const isSensex = item.id === "SENSEX";

            return (
              <div
                key={`${item.id}-${idx}`}
                className={[
                  styles.item,
                  flash ? styles.itemFlash : "",
                  isUp ? styles.up : "",
                  isDown ? styles.down : "",
                ].join(" ")}
                data-id={item.id}
              >
                <div className={styles.iconWrap}>{getIcon(item)}</div>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.value}>{valueText}</div>
                <div className={[styles.change, isUp ? styles.changeUp : isDown ? styles.changeDown : styles.changeFlat].join(" ")}
                >
                  {changeText}
                </div>
                <div className={styles.dot} aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.metaBadge} aria-hidden="true">
        Indicative • Delayed
      </div>
    </div>
  );
}

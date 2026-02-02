/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔒🔒🔒 CORE PROTECTED MODULE - BANK LEVEL ISOLATION 🔒🔒🔒               ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  ⛔ STOP! AI ASSISTANT - READ /core/marketTicker/README.md FIRST! ⛔     ║
 * ║                                                                          ║
 * ║  FILE: core/marketTicker/MarketTicker.jsx                                ║
 * ║  PURPOSE: Self-contained, isolated market ticker component               ║
 * ║                                                                          ║
 * ║  ISOLATION RULES (NEVER BREAK THESE):                                    ║
 * ║  ✗ NO imports from outside core/marketTicker/                            ║
 * ║  ✗ NO global state or context                                            ║
 * ║  ✗ NO external dependencies                                              ║
 * ║  ✓ CSS is module-scoped (MarketTicker.module.css)                        ║
 * ║  ✓ API calls to /api/market-data only                                    ║
 * ║  ✓ All utilities are internal                                            ║
 * ║                                                                          ║
 * ║  WHY ISOLATED: Other code changes CANNOT break this component            ║
 * ║                                                                          ║
 * ║  LAST LOCKED: 2026-01-07 | BULLETPROOF VERSION                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MarketTicker.module.css";

// ============ INTERNAL UTILITIES (no external deps) ============

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function toFiniteNumber(v) {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.+-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

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
  // Handle "Updating..." indicator
  if (item?.value === "---" || item?.updating) return "Updating...";
  
  const v = toFiniteNumber(item?.value);
  if (v == null) return "—";
  if (item.kind === "fx") return formatNumber(v, 2);
  return formatNumber(v, 0);
}

function fmtPct(p) {
  const n = toFiniteNumber(p);
  if (n == null) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function ensureRequiredItems(items) {
  const list = Array.isArray(items) ? items : [];
  const byId = new Map(list.map((x) => [x.id, x]));

  const required = [
    { id: "NIFTY50", name: "NIFTY 50", kind: "index", currency: "INR" },
    { id: "SENSEX", name: "SENSEX", kind: "index", currency: "INR" },
    { id: "USDINR", name: "USD/INR", kind: "fx", currency: "INR" },
    { id: "BTC", name: "BITCOIN", kind: "crypto", currency: "USD" },
    { id: "GOLD", name: "MCX GOLD", kind: "metal", currency: "INR" },
    { id: "SILVER", name: "MCX SILVER", kind: "metal", currency: "INR" },
    { id: "CRUDEOIL", name: "MCX CRUDE", kind: "commodity", currency: "INR" },
  ];

  const padded = required.map((r) => {
    const existing = byId.get(r.id);
    if (existing) return existing;
    return {
      ...r,
      value: "---",
      changePct: null,
      direction: "flat",
      updating: true,
    };
  });

  // Append any extra items not in the required list
  for (const item of list) {
    if (!item?.id) continue;
    if (byId.has(item.id) && required.some((r) => r.id === item.id)) continue;
    padded.push(item);
  }

  return padded;
}

// ============ INTERNAL ICONS (no external deps) ============

function IconIndex({ tone = "up" }) {
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
  const rim = metal === "silver" ? "#d3d7dd" : "#d7b152";
  const core = metal === "silver" ? "#aeb6c1" : "#caa24a";
  const hi = metal === "silver" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.20)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className={styles.icon}>
      <circle cx="11" cy="11" r="9" fill={rim} opacity="0.95" />
      <circle cx="11" cy="11" r="6.2" fill={core} opacity="0.92" />
      <path d="M6.2 9.0c1.6-2.9 6.2-4.2 9.2-2.2" fill="none" stroke={hi} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7.2 14.6c2.0 1.7 6.1 1.9 8.3 0.2" fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function IconFx() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d="M7 7h10l-2.2-2.2" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H7l2.2 2.2" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 7v6" fill="none" stroke="rgba(59,130,246,0.45)" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 17v-6" fill="none" stroke="rgba(59,130,246,0.45)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function getIcon(item) {
  if (item.id === "USDINR") return <IconFx />;
  if (item.id === "GOLD") return <IconCoin metal="gold" />;
  if (item.id === "SILVER") return <IconCoin metal="silver" />;
  return <IconIndex tone={item.direction} />;
}

// ============ DATA HANDLING ============

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
  const normalized = items
    .map((x) => {
      // Handle "Updating..." items (value is "---")
      const rawValue = x.value ?? x.last ?? x.price ?? x.close;
      const value = rawValue === "---" ? rawValue : toFiniteNumber(rawValue);
      const changePct = inferChangePct(x, value);
      return {
        id: String(x.id || ""),
        name: String(x.name || x.label || ""),
        kind: String(x.kind || ""),
        value,
        changePct,
        direction: inferDirection(x, changePct),
        currency: String(x.currency || ""),
        updating: rawValue === "---" ? true : !!x.updating, // Flag for styling
      };
    })
    .filter((x) => x.id); // Keep all items with IDs (including updating ones)

  return ensureRequiredItems(normalized);
}

// Fallback data when API fails
// NOTE: No dummy prices — show "Updating..." until live data arrives.
const FALLBACK_DATA = ensureRequiredItems([]);

// ============ MAIN COMPONENT ============

export default function MarketTicker({ className }) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(FALLBACK_DATA);
  const lastDataRef = useRef(FALLBACK_DATA);
  const [flashById, setFlashById] = useState({});

  // Marquee state
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const xRef = useRef(0);
  const baseSpeedRef = useRef(42);

  const [pausedHover, setPausedHover] = useState(false);
  const [pausedTap, setPausedTap] = useState(false);
  const resumeKickRef = useRef(0);

  const paused = pausedHover || pausedTap;

  // Prevent hydration mismatch - only show dynamic data after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const placeholderItems = useMemo(() => [
    { id: "SENSEX", name: "SENSEX", kind: "index", direction: "flat", placeholder: true },
    { id: "NIFTY", name: "NIFTY 50", kind: "index", direction: "flat", placeholder: true },
    { id: "USDINR", name: "USD/INR", kind: "fx", direction: "flat", placeholder: true },
    { id: "GOLD", name: "GOLD", kind: "metal", direction: "flat", placeholder: true },
  ], []);

  // Always enforce required instruments at render-time as well.
  // This protects against any transient state where only a subset is present.
  const displayData = useMemo(() => ensureRequiredItems(data), [data]);

  const doubled = useMemo(() => {
    const base = displayData.length ? displayData : placeholderItems;
    return base.length ? [...base, ...base] : [];
  }, [displayData, placeholderItems]);

  // Data fetching
  useEffect(() => {
    let stop = false;

    function applyFallback() {
      if (stop) return;
      if (Array.isArray(lastDataRef.current) && lastDataRef.current.length) return;
      lastDataRef.current = FALLBACK_DATA;
      setData(FALLBACK_DATA);
    }

    async function fetchNow() {
      try {
        const r = await fetch("/api/market-data?nocache=1", { cache: "no-store" });
        const j = await r.json().catch(() => null);

        if (!r.ok || !j?.ok) {
          applyFallback();
          return;
        }

        const next = normalizeApi(j);
        if (!next.length) {
          applyFallback();
          return;
        }

        // Flash detection
        const prev = lastDataRef.current;
        const prevMap = new Map(prev.map((p) => [p.id, p]));
        const flashes = {};
        for (const item of next) {
          const p = prevMap.get(item.id);
          if (!p) continue;
          // Skip flash detection for "Updating..." items
          if (item.value === "---" || p.value === "---") continue;
          const changed = Math.abs(item.value - p.value) > 1e-9 || item.direction !== p.direction;
          if (changed) flashes[item.id] = Date.now();
        }
        if (Object.keys(flashes).length) {
          setFlashById((cur) => ({ ...cur, ...flashes }));
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
      } catch {
        applyFallback();
      }
    }

    fetchNow();
    const id = setInterval(fetchNow, 60000);

    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  // Marquee animation
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

      let kick = 0;
      if (resumeKickRef.current > 0) {
        resumeKickRef.current -= dt;
        const t = 1 - clamp(resumeKickRef.current / 0.22, 0, 1);
        kick = (Math.sin(t * Math.PI) * -10) + (Math.sin(t * Math.PI) * 14 * t);
      }

      xRef.current -= speed * dt;

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
    if (pausedTap) return;
    setPausedTap(true);
    window.clearTimeout(window.__bmTickerTapTimer);
    window.__bmTickerTapTimer = window.setTimeout(() => {
      setPausedTap(false);
      resumeKickRef.current = 0.22;
    }, 2000);
  }

  function handleTickerClick(e) {
    // Route to the Live Intelligence PAGE (overlay removed)
    try {
      if (typeof window !== 'undefined') {
        window.location.assign('/live-intelligence');
      }
    } catch {
      // ignore
    }
  }

  return (
    <div
      ref={containerRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      onMouseEnter={() => setPausedHover(true)}
      onMouseLeave={() => setPausedHover(false)}
      onPointerDown={() => onTapPause()}
      onClick={handleTickerClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTickerClick(e);
        }
      }}
      aria-label="Market Snapshot - Click to open Live Intelligence"
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.inner}>
        <div className={styles.track} ref={trackRef}>
          {doubled.map((item, idx) => {
            const flash = flashById[item.id];
            const dir = item.direction;
            const isUp = dir === "up";
            const isDown = dir === "down";
            const isPlaceholder = Boolean(item.placeholder);
            const isUpdating = Boolean(item.updating || item.value === "---");
            const valueText = isPlaceholder ? "—" : fmtValue(item);
            const changeText = isPlaceholder || isUpdating ? "—" : fmtPct(item.changePct);

            return (
              <div
                key={`${item.id}-${idx}`}
                className={[
                  styles.item,
                  mounted && flash && styles.itemFlash,
                  mounted && isUp && styles.up,
                  mounted && isDown && styles.down,
                  mounted && isUpdating && styles.itemUpdating,
                ].filter(Boolean).join(" ")}
                data-id={item.id}
                suppressHydrationWarning
              >
                <div className={styles.iconWrap}>{getIcon(item)}</div>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.value} suppressHydrationWarning>{mounted ? valueText : "—"}</div>
                <div className={[styles.change, mounted && isUp ? styles.changeUp : mounted && isDown ? styles.changeDown : styles.changeFlat].join(" ")} suppressHydrationWarning>
                  {mounted ? changeText : "—"}
                </div>
                <div className={styles.dot} aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

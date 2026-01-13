"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./IsolatedLiveMood.module.css";

const LASER_ASSET_VERSION = "seamless-xfade-fade-2026-01-11";

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

function useInView(ref, options) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver((entries) => {
      setInView(Boolean(entries?.[0]?.isIntersecting));
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options]);

  return inView;
}

function NoiseCanvas({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const { width, height } = canvas;
      if (!width || !height) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const image = ctx.createImageData(width, height);
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 14; // subtle
      }
      ctx.putImageData(image, 0, 0);

      rafId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [active]);

  return <canvas ref={canvasRef} className={styles.noise} aria-hidden="true" />;
}

export default function IsolatedLiveMood() {
  const triggerRef = useRef(null);
  const dismissRef = useRef(null);

  const triggerInView = useInView(triggerRef, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
  const dismissInView = useInView(dismissRef, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });

  const [marketMode, setMarketMode] = useState(() => getMarketModeIst());
  const [overlayActive, setOverlayActive] = useState(false);
  const [autoUsed, setAutoUsed] = useState(false);
  const [preview, setPreview] = useState("desktop");

  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    const interval = setInterval(() => setMarketMode(getMarketModeIst()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (triggerInView && !autoUsed && !overlayActive) {
      setOverlayActive(true);
      setAutoUsed(true);
    }
  }, [triggerInView, autoUsed, overlayActive]);

  useEffect(() => {
    if (dismissInView && overlayActive) {
      setOverlayActive(false);
    }
  }, [dismissInView, overlayActive]);

  const previewClass = useMemo(() => {
    if (!isDev) return "";
    if (preview === "mobile") return styles.previewMobile;
    if (preview === "tablet") return styles.previewTablet;
    return styles.previewDesktop;
  }, [preview, isDev]);

  return (
    <div className={`${styles.page} ${previewClass}`}>
      {isDev && (
        <div className={styles.previewBar}>
          <span className={styles.previewLabel}>Preview</span>
          <button type="button" className={preview === "mobile" ? styles.previewBtnActive : styles.previewBtn} onClick={() => setPreview("mobile")}>
            Mobile
          </button>
          <button type="button" className={preview === "tablet" ? styles.previewBtnActive : styles.previewBtn} onClick={() => setPreview("tablet")}>
            Tablet
          </button>
          <button type="button" className={preview === "desktop" ? styles.previewBtnActive : styles.previewBtn} onClick={() => setPreview("desktop")}>
            Desktop
          </button>
          <span className={styles.previewHint}>Use this inside VS Code Simple Browser</span>
        </div>
      )}

      {/* Normal website content (no laser on load) */}
      <header className={styles.normalHeader}>
        <div className={styles.brand}>BM Wealth</div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>
            Home
          </a>
          <a href="#" className={styles.navLink}>
            Services
          </a>
          <a href="#" className={styles.navLink}>
            Blog
          </a>
          <a href="#" className={styles.navLink}>
            Contact
          </a>
        </nav>
      </header>

      <section className={styles.normalHero}>
        <div className={styles.normalHeroInner}>
          <h1 className={styles.normalTitle}>Your website opens normally.</h1>
          <p className={styles.normalSubtitle}>Scroll down — the Live Mood experience triggers when you pass it.</p>
          <button
            type="button"
            className={styles.openPill}
            onClick={() => {
              setOverlayActive(true);
              setAutoUsed(true);
            }}
          >
            LIVE MOOD
          </button>
          <p className={styles.openHint}>After the first auto-trigger, it’s click-to-open.</p>
        </div>
      </section>

      <section className={styles.normalSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Regular content</h2>
          <p className={styles.sectionText}>
            This is placeholder site content so you can test scroll-trigger and retract behavior without touching staging.
          </p>
        </div>
      </section>

      <section className={styles.triggerSection}>
        <div className={styles.sectionInner}>
          <div ref={triggerRef} className={styles.triggerCard}>
            <div className={styles.triggerTitle}>LIVE MOOD</div>
            <div className={styles.triggerText}>Scroll past this card to trigger the hero overlay.</div>
            <div className={styles.triggerMeta}>Mode: {marketMode.label} (IST)</div>
            {autoUsed && <div className={styles.triggerMetaMuted}>Auto-trigger already used. Click LIVE MOOD above to reopen.</div>}
          </div>
        </div>
      </section>

      <section className={styles.normalSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>More site content</h2>
          <p className={styles.sectionText}>Keep scrolling a bit more — the overlay should retract upward.</p>
        </div>
      </section>

      <section className={styles.dismissSpacer}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionText}>Scroll a little more…</p>
        </div>
      </section>

      <div ref={dismissRef} className={styles.dismissSentinel} aria-hidden="true" />

      <section className={styles.footerSpace}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Back to website</h2>
          <p className={styles.sectionText}>Once you’re past the hero zone, the overlay closes and the page stays normal.</p>
        </div>
      </section>

      {/* Overlay (laser + attached panel) */}
      <AnimatePresence>
        {overlayActive && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Live Mood overlay"
          >
            <div className={styles.overlayBg} aria-hidden="true" />
            <div className={styles.fogA} aria-hidden="true" />
            <div className={styles.fogB} aria-hidden="true" />

            <NoiseCanvas active={overlayActive} />

            <video className={styles.laserVideo} autoPlay muted playsInline loop preload="auto">
              <source src={`/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`} type="video/mp4" />
            </video>

            <div className={styles.overlayInner}>
              <div className={styles.heroLeft}>
                <div className={styles.kicker}>BM Wealth</div>
                <h1 className={styles.heroTitle}>Live Intelligence</h1>
                <p className={styles.heroSub}>
                  Educational, observational market signals — designed for clarity. No noise.
                </p>

                <div className={styles.ctaRow}>
                  <button type="button" className={styles.primaryCta}>
                    See in Action
                    <span className={styles.ctaArrow} aria-hidden="true">
                      →
                    </span>
                  </button>
                  <button type="button" className={styles.secondaryCta} onClick={() => setOverlayActive(false)}>
                    Close
                  </button>
                </div>
              </div>

              <div className={styles.dockWrap}>
                <div className={styles.dock}>
                  <div className={styles.dockStrip}>
                    <span className={styles.liveDot} aria-hidden="true" />
                    <span className={styles.dockLive}>LIVE</span>
                    <span className={styles.dockMode}>{marketMode.label}</span>
                    <span className={styles.dockHint}>Scroll down to retract</span>
                  </div>

                  <div className={styles.panel}>
                    <div className={styles.panelGrid}>
                      <div className={styles.panelSide}>
                        <div className={styles.panelChipActive}>Issues</div>
                        <div className={styles.panelChip}>Inbox</div>
                        <div className={styles.panelChip}>Tracker</div>
                      </div>
                      <div className={styles.panelMain}>
                        <div className={styles.panelHeader}>
                          <div className={styles.panelTitle}>Today’s Intelligence</div>
                          <div className={styles.panelMeta}>Calm rotation • no ticker</div>
                        </div>
                        <div className={styles.bento}>
                          <div className={styles.bentoCard} />
                          <div className={styles.bentoCard} />
                          <div className={styles.bentoCardWide} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.dockGlow} aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

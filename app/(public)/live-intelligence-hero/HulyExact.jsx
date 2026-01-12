"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./HulyExact.module.css";

/**
 * LIVE MOOD HERO - Matches YOUR actual BM Wealth homepage
 * 
 * LASER IS LOCKED - Unicorn Studio asset, DO NOT MODIFY
 * 
 * Animation Flow:
 * 1. Page loads NORMALLY (looks like bmwealth.co.in homepage)
 * 2. User scrolls → reaches LIVE MOOD zone → animation triggers
 * 3. Dark layer fades in + fog appears + laser activates + panel reveals
 * 4. User scrolls past → everything retracts → normal website returns
 * 5. After first auto-trigger → click only to reopen
 */

const LASER_VERSION = "unicorn-locked-2026-01-11";

function useInView(ref, options = {}) {
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

export default function HulyExact() {
  const triggerRef = useRef(null);
  const exitRef = useRef(null);
  const videoRef = useRef(null);

  // Animation state
  const [overlayActive, setOverlayActive] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [fogReady, setFogReady] = useState(false);

  // Scroll-trigger detection
  const triggerInView = useInView(triggerRef, { threshold: 0.5 });
  const exitInView = useInView(exitRef, { threshold: 0.3 });

  // FIRST TIME scroll trigger
  useEffect(() => {
    if (triggerInView && !autoTriggered && !overlayActive) {
      // Sequence: fog first, then laser, then panel
      setFogReady(true);
      setTimeout(() => {
        setOverlayActive(true);
        setAutoTriggered(true);
      }, 400);
    }
  }, [triggerInView, autoTriggered, overlayActive]);

  // Exit when scrolling past
  useEffect(() => {
    if (exitInView && overlayActive) {
      setOverlayActive(false);
      setTimeout(() => setFogReady(false), 500);
    }
  }, [exitInView, overlayActive]);

  // Play video when overlay activates
  useEffect(() => {
    if (overlayActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [overlayActive]);

  // Manual toggle (after first auto-trigger)
  const handleManualOpen = useCallback(() => {
    if (autoTriggered) {
      setFogReady(true);
      setTimeout(() => setOverlayActive(true), 300);
    }
  }, [autoTriggered]);

  return (
    <div className={styles.page}>
      {/* ================================================================
          NORMAL WEBSITE (YOUR BM WEALTH HOMEPAGE)
          ================================================================ */}
      
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoGold}>BM</span>
          <span className={styles.logoText}>Wealth</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/about" className={styles.navLink}>About Us</Link>
          <Link href="/services" className={styles.navLink}>Services</Link>
          <Link href="/platforms" className={styles.navLink}>Platforms</Link>
          <Link href="/tools" className={styles.navLink}>Tools</Link>
          <Link href="/blog" className={styles.navLink}>Blog</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
        </nav>
      </header>

      {/* Hero Section - Matches your actual homepage */}
      <section className={styles.heroSection}>
        {/* Background Image (your Mumbai skyline) */}
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        {/* Hero Content */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroKicker}>
            BM WEALTH - DISTINGUISHED WEALTH ARCHITECTURE
          </h1>
          <p className={styles.heroSubtitle}>
            Empowering Mumbai's elite investors with bespoke wealth strategies
          </p>
          <div className={styles.heroCtas}>
            <Link href="/tools" className={styles.ctaPrimary}>
              Access Your Complimentary Wealth Blueprint
            </Link>
            <Link href="/services" className={styles.ctaSecondary}>
              Explore Services →
            </Link>
          </div>
        </div>

        {/* LIVE MOOD Trigger Zone */}
        <div ref={triggerRef} className={styles.liveMoodTrigger}>
          <button
            type="button"
            className={styles.liveMoodPill}
            onClick={handleManualOpen}
            disabled={!autoTriggered}
          >
            <span className={styles.liveDot} />
            <span>LIVE MOOD</span>
          </button>
          {!autoTriggered && (
            <p className={styles.triggerHint}>Scroll to activate</p>
          )}
          {autoTriggered && !overlayActive && (
            <p className={styles.triggerHint}>Click to reopen</p>
          )}
        </div>
      </section>

      {/* Services Section (placeholder to show normal site continues) */}
      <section className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>Our Services</h2>
        <p className={styles.sectionSubtitle}>
          Premium services designed for clarity and confidence
        </p>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>Mutual Funds</div>
          <div className={styles.serviceCard}>Insurance</div>
          <div className={styles.serviceCard}>Fixed Deposits</div>
        </div>
      </section>

      {/* Exit sentinel (overlay closes when this comes into view) */}
      <div ref={exitRef} className={styles.exitSentinel} />

      {/* More content to scroll through */}
      <section className={styles.moreSection}>
        <h2 className={styles.sectionTitle}>Why Choose BM Wealth?</h2>
        <p className={styles.sectionSubtitle}>
          Your website continues normally after the LIVE MOOD experience
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 BM Wealth. All rights reserved.</p>
      </footer>

      {/* ================================================================
          ANIMATION OVERLAY (Fog + Laser + Panel)
          Covers hero when triggered
          ================================================================ */}
      
      {/* Fog Layer (fades in first) */}
      <AnimatePresence>
        {fogReady && (
          <motion.div
            className={styles.fogLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            aria-hidden="true"
          >
            <div className={styles.fogTop} />
            <div className={styles.fogBottom} />
            <div className={styles.vignette} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Laser + Panel (fades in after fog) */}
      <AnimatePresence>
        {overlayActive && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Dark base */}
            <div className={styles.overlayBg} />

            {/* LOCKED UNICORN LASER - DO NOT MODIFY */}
            <video
              ref={videoRef}
              className={styles.laser}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
            >
              <source src={`/videos/laser-beam.mp4?v=${LASER_VERSION}`} type="video/mp4" />
            </video>

            {/* Glow effects */}
            <div className={styles.glowTop} aria-hidden="true" />
            <div className={styles.glowBottom} aria-hidden="true" />

            {/* Panel Vessel (empty container - content comes later) */}
            <motion.div
              className={styles.panelWrap}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Laser entry glow */}
              <div className={styles.laserEntry} aria-hidden="true" />

              {/* Glass Panel */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelLive}>
                    <span className={styles.panelDot} />
                    LIVE INTELLIGENCE
                  </span>
                  <button
                    type="button"
                    className={styles.panelClose}
                    onClick={() => {
                      setOverlayActive(false);
                      setTimeout(() => setFogReady(false), 400);
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Empty bento grid - placeholder for Phase 2 */}
                <div className={styles.panelBody}>
                  <div className={styles.bentoGrid}>
                    <div className={styles.bentoCard} />
                    <div className={styles.bentoCard} />
                    <div className={styles.bentoCardWide} />
                    <div className={styles.bentoCard} />
                    <div className={styles.bentoCard} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scroll hint */}
            <div className={styles.scrollHint}>
              Scroll down to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

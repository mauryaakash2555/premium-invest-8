"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HulyHero.module.css";

export default function LiveIntelligenceHeroPage() {
  const rootRef = useRef(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia?.("(pointer: coarse)");
    const update = () => setIsCoarsePointer(Boolean(mql?.matches));
    update();

    if (!mql) return;

    // Safari < 14 fallback handled by addListener/removeListener.
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let rafId = 0;
    const start = performance.now();

    const tick = (now) => {
      // Drive subtle animated phase for fog + beams.
      const t = (now - start) / 1000;
      el.style.setProperty("--t", String(t));
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // Huly-style feel: the site relies on CSS transitions (not RAF smoothing).
    // We set vars directly on pointer events and let the masked layers interpolate.
    const rectFor = () => el.getBoundingClientRect();

    const setMask = (px, py) => {
      const rect = rectFor();
      const x = Math.min(rect.width, Math.max(0, px));
      const y = Math.min(rect.height, Math.max(0, py));

      el.style.setProperty("--hero-mask-x", `${x.toFixed(2)}px`);
      el.style.setProperty("--hero-mask-y", `${y.toFixed(2)}px`);

      el.style.setProperty("--mx", String(Math.min(1, Math.max(0, x / rect.width))));
      el.style.setProperty("--my", String(Math.min(1, Math.max(0, y / rect.height))));
    };

    const setCenter = () => {
      const rect = rectFor();
      setMask(rect.width * 0.5, rect.height * 0.35);
    };

    const handlePointerMove = (event) => {
      // Avoid jitter on coarse pointers; visuals stay centered.
      if (isCoarsePointer) return;
      const rect = rectFor();
      setMask(event.clientX - rect.left, event.clientY - rect.top);
    };

    const handlePointerLeave = () => {
      setCenter();
    };

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);

    const handleResize = () => setCenter();
    window.addEventListener("resize", handleResize);

    // Default center point.
    el.style.setProperty("--hero-mask-size", "0px");
    setCenter();
    const openTimer = window.setTimeout(() => {
      el.style.setProperty("--hero-mask-size", "200px");
    }, 260);

    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(openTimer);
    };
  }, [isCoarsePointer]);

  return (
    <main ref={rootRef} className={styles.stage} aria-label="Live Intelligence Hero preview">
      <div className={styles.bg} aria-hidden="true">
        {/* Deep void - the absolute darkness behind everything */}
        <div className={styles.deepVoid} />

        {/* Fog backdrop - atmospheric haze behind the video glow */}
        <div className={styles.fogBackdrop} />

        {/* Layer 0: Deep void base */}
        <div className={styles.base} />

        {/* Layer 1: Static atmospheric fog (no animation) */}
        <div className={styles.atmoFog} />

        {/* Layer 2: Static violet haze (spectral depth) */}
        <div className={styles.violetHaze} />

        {/* Layer 3: Beam-reactive bloom (follows laser position) */}
        <div className={styles.beamReact} />

        {/* VIDEO WRAPPER: Huly uses mix-blend-lighten on video wrapper */}
        <div className={styles.videoWrapper}>
          {/* 
            Huly's actual video sources from DevTools:
            - https://huly.io/videos/pages/home/hero/hero.mp4
            - https://huly.io/videos/pages/home/hero/hero.webm
          */}
          <video
            className={styles.video}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          >
            <source
              src="https://huly.io/videos/pages/home/hero/hero.mp4?updated=20240607144404"
              type="video/mp4"
            />
            <source
              src="https://huly.io/videos/pages/home/hero/hero.webm?updated=20240607144404"
              type="video/webm"
            />
          </video>
        </div>

        {/* Masked art layers (like Huly's SVG layers with radial-gradient mask) */}
        <div className={styles.art}>
          <div className={styles.artLayer} data-idx="1" />
          <div className={styles.artLayer} data-idx="2" />
        </div>

        {/* Second masked layer for depth parallax */}
        <div className={styles.artSecondary} />

        {/* Center laser column — the vertical fracture */}
        <div className={styles.centerLaser} aria-hidden="true">
          <div className={styles.laserBloom} />
          <div className={styles.laserCore} />
          <div className={styles.laserFlow} />
          <div className={styles.laserSpecks} />
        </div>

        {/* Depth and atmosphere layers */}
        <div className={styles.vignette} />
        <div className={styles.fog} />
        <div className={styles.glowA} />
        <div className={styles.glowB} />
        <div className={styles.beams}>
          <div className={styles.beam} data-idx="1" />
          <div className={styles.beam} data-idx="2" />
          <div className={styles.beam} data-idx="3" />
        </div>
        <div className={styles.topHaze} />

        {/* TOP FADE - The "black something on top" - gradient from black at top */}
        <div className={styles.topFade} />

        {/* Bottom fade (like Huly's from-grey-1/0 to-grey-1 gradient, z-20) */}
        <div className={styles.bottomFade} />
      </div>
    </main>
  );
}

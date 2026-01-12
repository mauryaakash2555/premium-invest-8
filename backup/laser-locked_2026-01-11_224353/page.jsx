'use client';

import { useEffect, useRef } from 'react';
import styles from './LaserOverlay.module.css';

const LASER_ASSET_VERSION = "seamless-xfade-fade-2026-01-11";

export default function LiveIntelligenceHeroPage() {
  const videoRef = useRef(null);
  // Hide the mobile dock on this page only (does not affect scroll)
  useEffect(() => {
    document.body.setAttribute('data-laser-active', 'true');
    return () => document.body.removeAttribute('data-laser-active');
  }, []);

  // Best-effort autoplay
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, []);

  return (
    <main className={styles.heroWrapper}>
      <section className={styles.laserContainer} aria-label="Laser">
        <video
          ref={videoRef}
          className={styles.laserVideo}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
        >
          <source src={`/videos/laser-beam.unicorn.mp4?v=${LASER_ASSET_VERSION}`} type="video/mp4" />
          <source src={`/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`} type="video/mp4" />
        </video>
      </section>

      <section className={styles.panelWrapper} aria-label="Panel">
        <div className={styles.panelShell}>
          <div className={styles.panelHeaderRow}>
            <div className={styles.panelTitle}>LIVE INTELLIGENCE</div>
            <div className={styles.panelHint}>Vessel only • Phase 2 later</div>
          </div>

          <div className={styles.panelGrid}>
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className={styles.card}>
                <div className={styles.cardTitle} />
                <div className={styles.cardLine} />
                <div className={styles.cardLineShort} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

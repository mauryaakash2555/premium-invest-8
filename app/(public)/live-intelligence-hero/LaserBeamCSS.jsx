"use client";

/**
 * LaserBeamCSS.jsx
 * 
 * Pure CSS recreation of Huly's laser beam effect
 * Exact colors: #FFAA81 (warm orange), #FFFFF5 (cream white)
 * Multiple glow layers + animations
 */

import styles from "./LaserBeam.module.css";

export default function LaserBeamCSS() {
  return (
    <div className={`${styles.laserContainer} ${styles.visible}`}>
      {/* Wide atmospheric purple haze */}
      <div className={styles.atmosphericGlow} />
      
      {/* Extra blur glow - widest orange spread */}
      <div className={`${styles.laserGlow} ${styles.blur}`} />
      
      {/* Primary orange glow layer */}
      <div className={styles.laserGlow} />
      
      {/* Inner bright glow */}
      <div className={styles.laserGlowInner} />
      
      {/* Main vertical laser beam - the bright core */}
      <div className={styles.laserBeam} />
    </div>
  );
}

/**
 * FILE: components\user\AnimatedClouds.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - react
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

﻿'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export default function AnimatedClouds({ enableRain = false, enableLightning = true }) {
  const [lightning, setLightning] = useState(false);
  const [showRain, setShowRain] = useState(false);
  const [rainSeed, setRainSeed] = useState(0);

  const timersRef = useRef({
    lightningTimer: null,
    lightningOffTimer: null,
    rainInterval: null,
    rainOffTimer: null,
  });

  // Random lightning every 8–18 seconds (first strike 3–8s) - ONLY if enabled
  useEffect(() => {
    if (!enableLightning) return;
    let cancelled = false;

    const scheduleLightning = () => {
      if (cancelled) return;

      setLightning(true);
      timersRef.current.lightningOffTimer = setTimeout(() => {
        if (!cancelled) setLightning(false);
      }, 200);

      const nextDelay = Math.random() * 10000 + 8000;
      timersRef.current.lightningTimer = setTimeout(scheduleLightning, nextDelay);
    };

    const initialDelay = Math.random() * 5000 + 3000;
    timersRef.current.lightningTimer = setTimeout(scheduleLightning, initialDelay);

    return () => {
      cancelled = true;
      if (timersRef.current.lightningTimer) clearTimeout(timersRef.current.lightningTimer);
      if (timersRef.current.lightningOffTimer) clearTimeout(timersRef.current.lightningOffTimer);
    };
  }, [enableLightning]);

  // Rain toggle: when enabled, rain starts immediately and stays until disabled
  useEffect(() => {
    // Clear any legacy timers just in case
    if (timersRef.current.rainInterval) clearInterval(timersRef.current.rainInterval);
    if (timersRef.current.rainOffTimer) clearTimeout(timersRef.current.rainOffTimer);

    if (!enableRain) {
      setShowRain(false);
      return;
    }

    // New seed so drops look different each time you toggle on
    setRainSeed((s) => s + 1);
    setShowRain(true);
  }, [enableRain]);


  const rainDrops = useMemo(() => {
    if (!showRain) return [];
    return Array.from({ length: 140 }).map((_, i) => ({
      key: `${rainSeed}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
    }));
  }, [showRain, rainSeed]);

  return (
    <div className={`animated-clouds-container${lightning ? ' is-lightning' : ''}`} aria-hidden="true">
      {lightning && <div className="lightning-flash" />}

      {enableRain && showRain && (
        <div className="rain-container">
          {rainDrops.map((d) => (
            <div
              key={d.key}
              className="rain-drop"
              style={{
                left: `${d.left}%`,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="cloud-layer cloud-layer-1">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      <div className="cloud-layer cloud-layer-2">
        <div className="cloud cloud-4" />
        <div className="cloud cloud-5" />
      </div>

      <div className="cloud-layer cloud-layer-3">
        <div className="cloud cloud-6" />
        <div className="cloud cloud-7" />
      </div>
    </div>
  );
}



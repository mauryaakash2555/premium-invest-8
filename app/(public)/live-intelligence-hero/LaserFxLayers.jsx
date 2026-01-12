'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from './LaserOverlay.module.css';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export default function LaserFxLayers() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  const blobs = useMemo(() => {
    // A few soft fog blobs drifting upward.
    return Array.from({ length: 9 }).map((_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      r: 0.18 + Math.random() * 0.22,
      vx: (Math.random() - 0.5) * 0.015,
      vy: -0.01 - Math.random() * 0.02,
      a: 0.08 + Math.random() * 0.10,
    }));
  }, []);

  const dust = useMemo(() => {
    // Precomputed dust particles to avoid per-frame random allocations.
    return Array.from({ length: 42 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      a: 0.05 + Math.random() * 0.10,
      vy: 0.015 + Math.random() * 0.03,
    }));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;

    const targetFrameMs = 1000 / 30;
    let lastFrameAt = 0;

    // Mouse state
    let mouseX = 0.5;
    let mouseY = 0.6;
    let glow = 0;
    let lastMX = mouseX;
    let lastMY = mouseY;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      // Cap DPR to keep the canvas cheap; video remains full quality.
      const dpr = Math.min(1.0, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const setCssVars = () => {
      root.style.setProperty('--mx', `${Math.round(mouseX * 100)}%`);
      root.style.setProperty('--my', `${Math.round(mouseY * 100)}%`);
      root.style.setProperty('--glow', glow.toFixed(3));
    };

    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);
      const y = (event.clientY - rect.top) / Math.max(1, rect.height);
      mouseX = clamp01(x);
      mouseY = clamp01(y);

      const dx = mouseX - lastMX;
      const dy = mouseY - lastMY;
      const speed = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 12);
      glow = Math.max(glow, speed);
      lastMX = mouseX;
      lastMY = mouseY;
      setCssVars();
    };

    const tick = (now) => {
      if (!lastFrameAt) lastFrameAt = now;
      const elapsed = now - lastFrameAt;
      if (elapsed < targetFrameMs) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastFrameAt = now;

      // decay glow
      glow *= 0.92;
      setCssVars();

      ctx.clearRect(0, 0, width, height);

      // Fog blobs (soft + blue-ish)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.filter = 'none';

      const windX = (mouseX - 0.5) * 0.08;
      const windY = (mouseY - 0.5) * 0.06;

      for (const b of blobs) {
        b.x += b.vx + windX * 0.02;
        b.y += b.vy + windY * 0.02;

        if (b.x < -0.4) b.x = 1.4;
        if (b.x > 1.4) b.x = -0.4;
        if (b.y < -0.6) b.y = 1.3;

        const cx = b.x * width;
        const cy = b.y * height;
        const rr = b.r * Math.min(width, height);

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, `rgba(190, 210, 255, ${b.a})`);
        g.addColorStop(1, 'rgba(190, 210, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
      }

      ctx.restore();

      // Dust particles (subtle, inside beam area)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.filter = 'none';
      const beamX = width * 0.5;
      const beamW = Math.max(140, width * 0.14);

      for (const p of dust) {
        p.y += p.vy;
        if (p.y > 1.15) p.y = -0.15;

        const px = beamX + (p.x - 0.5) * beamW;
        const py = p.y * height;
        ctx.fillStyle = `rgba(220, 235, 255, ${p.a})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      rafId = requestAnimationFrame(tick);
    };

    resize();
    setCssVars();

    // Prefer pointermove, but fall back to mousemove.
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [blobs, dust]);

  return (
    <div ref={rootRef} className={styles.fxRoot} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.fxFogCanvas} />
      <div className={styles.fxGlow} />
      <div className={styles.fxVignette} />
      <div className={styles.fxGrain} />
    </div>
  );
}

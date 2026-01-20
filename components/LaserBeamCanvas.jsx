"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * LaserBeam - Canvas-based animated laser beam border effect
 * 
 * FIXED VERSION:
 * - Uses ResizeObserver to detect container size changes (not just window resize)
 * - Properly handles dynamic height containers (like collapsible calculators)
 * - Smoother, calmer animation with longer duration
 * - Better trail rendering for cleaner visuals
 * 
 * Props:
 * - width/height: Container dimensions (number or string like "100%", "auto")
 * - duration: Animation cycle in seconds (default: 18 for calm effect)
 * - color: Laser color as hex (default: "#c0a062" gold)
 * - borderRadius: Corner radius in px (default: 12)
 * - active: Whether animation runs (default: true)
 * - glowIntensity: Glow blur radius in px (default: 12)
 * - beamLength: Trail length as % of perimeter 0-1 (default: 0.10)
 * - direction: "clockwise" or "counterclockwise"
 * - delay: Seconds before animation starts
 * - borderWidth: Border thickness in px (default: 0)
 * - backgroundColor: Background color (default: "transparent")
 * - children: Content inside the container
 * - className: Additional CSS classes
 */
export function LaserBeam({
  width = "100%",
  height = "auto",
  duration = 18, // Slower, calmer animation
  color = "#C9A24D",
  borderRadius = 12,
  active = true,
  glowIntensity = 12,
  beamLength = 0.10, // Shorter trail for cleaner look
  direction = "clockwise",
  delay = 0,
  borderWidth = 0,
  backgroundColor = "transparent",
  children,
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const startTimeRef = useRef(0);
  const dimensionsRef = useRef({ w: 0, h: 0, r: 0, perimeter: 0 });
  const [isReady, setIsReady] = useState(false);

  // Function to get point on rounded rectangle path given progress (0-1)
  const getPointOnPath = useCallback((progress, dims) => {
    const { w, h, r, straightWidth, straightHeight, cornerLength, perimeter } = dims;
    if (perimeter === 0) return { x: 0, y: 0 };
    
    const adjustedProgress = direction === "counterclockwise" ? 1 - progress : progress;
    let distance = adjustedProgress * perimeter;

    // Top edge (left to right)
    if (distance < straightWidth) {
      return { x: r + distance, y: 0 };
    }
    distance -= straightWidth;

    // Top-right corner
    if (distance < cornerLength) {
      const angle = -Math.PI / 2 + (distance / cornerLength) * (Math.PI / 2);
      return {
        x: w - r + Math.cos(angle) * r,
        y: r + Math.sin(angle) * r,
      };
    }
    distance -= cornerLength;

    // Right edge (top to bottom)
    if (distance < straightHeight) {
      return { x: w, y: r + distance };
    }
    distance -= straightHeight;

    // Bottom-right corner
    if (distance < cornerLength) {
      const angle = 0 + (distance / cornerLength) * (Math.PI / 2);
      return {
        x: w - r + Math.cos(angle) * r,
        y: h - r + Math.sin(angle) * r,
      };
    }
    distance -= cornerLength;

    // Bottom edge (right to left)
    if (distance < straightWidth) {
      return { x: w - r - distance, y: h };
    }
    distance -= straightWidth;

    // Bottom-left corner
    if (distance < cornerLength) {
      const angle = Math.PI / 2 + (distance / cornerLength) * (Math.PI / 2);
      return {
        x: r + Math.cos(angle) * r,
        y: h - r + Math.sin(angle) * r,
      };
    }
    distance -= cornerLength;

    // Left edge (bottom to top)
    if (distance < straightHeight) {
      return { x: 0, y: h - r - distance };
    }
    distance -= straightHeight;

    // Top-left corner
    const angle = Math.PI + (distance / cornerLength) * (Math.PI / 2);
    return {
      x: r + Math.cos(angle) * r,
      y: r + Math.sin(angle) * r,
    };
  }, [direction]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Setup canvas dimensions based on container
    const setupCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return false;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      const r = Math.min(borderRadius, Math.min(w, h) / 2);

      const straightWidth = Math.max(0, w - 2 * r);
      const straightHeight = Math.max(0, h - 2 * r);
      const cornerLength = (Math.PI * r) / 2;
      const perimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerLength;

      dimensionsRef.current = { w, h, r, straightWidth, straightHeight, cornerLength, perimeter };
      return true;
    };

    // Animation function
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = (timestamp - startTimeRef.current) / 1000 - delay;

      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const dims = dimensionsRef.current;
      if (dims.perimeter === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, dims.w, dims.h);

      if (!active) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = (elapsed % duration) / duration;

      // Draw the laser beam trail with smoother gradient
      const steps = 60; // Reduced for performance
      const beamLengthActual = beamLength;

      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const pointProgress = (progress - t * beamLengthActual + 1) % 1;
        const point = getPointOnPath(pointProgress, dims);

        // Smoother opacity fade using easeOutQuad
        const opacity = Math.pow(1 - t, 1.5) * 0.8;

        ctx.beginPath();
        ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();
      }

      // Draw the bright head of the beam
      const headPoint = getPointOnPath(progress, dims);

      // Outer glow - softer
      const gradient = ctx.createRadialGradient(
        headPoint.x, headPoint.y, 0,
        headPoint.x, headPoint.y, glowIntensity
      );
      gradient.addColorStop(0, `${color}cc`);
      gradient.addColorStop(0.4, `${color}66`);
      gradient.addColorStop(0.7, `${color}22`);
      gradient.addColorStop(1, `${color}00`);

      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, glowIntensity, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bright core - smaller
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          cancelAnimationFrame(animationRef.current);
          startTimeRef.current = 0; // Reset animation timing
          if (setupCanvas()) {
            setIsReady(true);
            animationRef.current = requestAnimationFrame(animate);
          }
        }
      }
    });

    // Initial setup with delay to ensure layout is complete
    const initTimeout = setTimeout(() => {
      if (setupCanvas()) {
        setIsReady(true);
        animationRef.current = requestAnimationFrame(animate);
      }
    }, 100);

    resizeObserver.observe(container);

    return () => {
      clearTimeout(initTimeout);
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [active, beamLength, borderRadius, color, delay, direction, duration, glowIntensity, getPointOnPath]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        borderRadius,
        backgroundColor,
        overflow: 'visible',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius,
          pointerEvents: 'none',
          zIndex: 20,
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {children && (
        <div style={{ position: 'relative', zIndex: 10, height: '100%', width: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default LaserBeam;

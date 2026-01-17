"use client";

import { useEffect, useRef, useState } from "react";

/**
 * LaserBeam - Canvas-based animated laser beam border effect
 * Ported from V0 (Huly.io style) - handles complex path tracing math
 * 
 * Props:
 * - width/height: Container dimensions (number or string)
 * - duration: Animation cycle in seconds (default: 6 - slower for calmer effect)
 * - color: Laser color as hex (default: "#00ff88" green, use "#3b82f6" for blue)
 * - borderRadius: Corner radius in px (default: 12)
 * - active: Whether animation runs (default: true)
 * - glowIntensity: Glow blur radius in px (default: 20)
 * - beamLength: Trail length as % of perimeter 0-1 (default: 0.15)
 * - direction: "clockwise" or "counterclockwise"
 * - delay: Seconds before animation starts
 * - borderWidth: Border thickness in px (default: 1)
 * - backgroundColor: Background color (default: "transparent")
 * - children: Content inside the container
 * - className: Additional CSS classes
 */
export function LaserBeam({
  width = 400,
  height = 300,
  duration = 6, // Increased from 4 to 6 for calmer animation
  color = "#00ff88",
  borderRadius = 12,
  active = true,
  glowIntensity = 20,
  beamLength = 0.15,
  direction = "clockwise",
  delay = 0,
  borderWidth = 1,
  backgroundColor = "transparent",
  children,
  className = "",
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(0);
  const startTimeRef = useRef(0);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Handle resize to prevent animation breaking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setDimensions({ w: rect.width, h: rect.height });
    };

    updateDimensions();

    // Use ResizeObserver for reliable resize detection
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    // Prevent zero-dimension canvas
    if (rect.width < 1 || rect.height < 1) return;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const r = Math.min(borderRadius, Math.min(w, h) / 2);

    // Calculate the perimeter of the rounded rectangle
    const straightWidth = Math.max(0, w - 2 * r);
    const straightHeight = Math.max(0, h - 2 * r);
    const cornerLength = (Math.PI * r) / 2;
    const perimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerLength;
    
    // Prevent division by zero
    if (perimeter < 1) return;

    // Get point on rounded rectangle path given progress (0-1)
    const getPointOnPath = (progress) => {
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
    };

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = (timestamp - startTimeRef.current) / 1000 - delay;

      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      if (!active) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = (elapsed % duration) / duration;

      // Draw the laser beam trail
      const steps = 100;
      const beamLengthActual = beamLength;

      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const pointProgress = (progress - t * beamLengthActual + 1) % 1;
        const point = getPointOnPath(pointProgress);

        // Opacity fades from head (bright) to tail (transparent)
        const opacity = Math.pow(1 - t, 2);

        ctx.beginPath();
        ctx.arc(point.x, point.y, borderWidth + 1, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();
      }

      // Draw the bright head of the beam
      const headPoint = getPointOnPath(progress);

      // Outer glow
      const gradient = ctx.createRadialGradient(headPoint.x, headPoint.y, 0, headPoint.x, headPoint.y, glowIntensity);
      gradient.addColorStop(0, `${color}ff`);
      gradient.addColorStop(0.3, `${color}88`);
      gradient.addColorStop(0.6, `${color}33`);
      gradient.addColorStop(1, `${color}00`);

      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, glowIntensity, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, borderWidth + 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [active, beamLength, borderRadius, borderWidth, color, delay, direction, duration, glowIntensity, dimensions]);

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
        border: borderWidth > 0 ? `${borderWidth}px solid rgba(255,255,255,0.1)` : 'none',
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

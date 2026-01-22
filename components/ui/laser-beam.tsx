"use client";

import type React from "react";
import { useEffect, useRef } from "react";

interface LaserBeamProps {
  width?: number | string;
  height?: number | string;
  duration?: number;
  color?: string;
  borderRadius?: number;
  active?: boolean;
  glowIntensity?: number;
  beamLength?: number;
  direction?: "clockwise" | "counterclockwise";
  delay?: number;
  borderWidth?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
  className?: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 59, g: 130, b: 246 };
}

export function LaserBeam({
  width = 400,
  height = 300,
  duration = 4,
  color = "#3b82f6",
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
}: LaserBeamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const glowPadding = glowIntensity + 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      return { canvasW: rect.width, canvasH: rect.height };
    };

    let { canvasW, canvasH } = setup();

    const w = canvasW - glowPadding * 2;
    const h = canvasH - glowPadding * 2;
    const r = Math.min(borderRadius, Math.min(w, h) / 2);
    const offsetX = glowPadding;
    const offsetY = glowPadding;

    const straightWidth = w - 2 * r;
    const straightHeight = h - 2 * r;
    const cornerLength = (Math.PI * r) / 2;
    const perimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerLength;

    const rgb = hexToRgb(color);

    const getPointOnPath = (progress: number): { x: number; y: number } => {
      const adjustedProgress = direction === "counterclockwise" ? 1 - progress : progress;
      let distance = adjustedProgress * perimeter;

      if (distance < straightWidth) {
        return { x: offsetX + r + distance, y: offsetY };
      }
      distance -= straightWidth;

      if (distance < cornerLength) {
        const angle = -Math.PI / 2 + (distance / cornerLength) * (Math.PI / 2);
        return {
          x: offsetX + w - r + Math.cos(angle) * r,
          y: offsetY + r + Math.sin(angle) * r,
        };
      }
      distance -= cornerLength;

      if (distance < straightHeight) {
        return { x: offsetX + w, y: offsetY + r + distance };
      }
      distance -= straightHeight;

      if (distance < cornerLength) {
        const angle = 0 + (distance / cornerLength) * (Math.PI / 2);
        return {
          x: offsetX + w - r + Math.cos(angle) * r,
          y: offsetY + h - r + Math.sin(angle) * r,
        };
      }
      distance -= cornerLength;

      if (distance < straightWidth) {
        return { x: offsetX + w - r - distance, y: offsetY + h };
      }
      distance -= straightWidth;

      if (distance < cornerLength) {
        const angle = Math.PI / 2 + (distance / cornerLength) * (Math.PI / 2);
        return {
          x: offsetX + r + Math.cos(angle) * r,
          y: offsetY + h - r + Math.sin(angle) * r,
        };
      }
      distance -= cornerLength;

      if (distance < straightHeight) {
        return { x: offsetX, y: offsetY + h - r - distance };
      }
      distance -= straightHeight;

      const angle = Math.PI + (distance / cornerLength) * (Math.PI / 2);
      return {
        x: offsetX + r + Math.cos(angle) * r,
        y: offsetY + r + Math.sin(angle) * r,
      };
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = (timestamp - startTimeRef.current) / 1000 - delay;

      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // If the element resized (responsive), re-setup to avoid drift/blurry rendering.
      const rect = canvas.getBoundingClientRect();
      if (Math.abs(rect.width - canvasW) > 0.5 || Math.abs(rect.height - canvasH) > 0.5) {
        ({ canvasW, canvasH } = setup());
      }

      ctx.clearRect(0, 0, canvasW, canvasH);

      if (!active) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = (elapsed % duration) / duration;

      // Draw the beam trail
      const steps = 80;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const pointProgress = (progress - t * beamLength + 1) % 1;
        const point = getPointOnPath(pointProgress);

        const opacity = Math.pow(1 - t, 2);
        const size = borderWidth * (1 - t * 0.5);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        ctx.fill();
      }

      // Draw glow at head
      const headPoint = getPointOnPath(progress);

      const gradient = ctx.createRadialGradient(
        headPoint.x,
        headPoint.y,
        0,
        headPoint.x,
        headPoint.y,
        glowIntensity
      );
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
      gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, glowIntensity, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, borderWidth + 1, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [active, beamLength, borderRadius, borderWidth, color, delay, direction, duration, glowIntensity, glowPadding]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor,
        border: `${borderWidth}px solid rgba(255,255,255,0.1)`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{
          top: -glowPadding,
          left: -glowPadding,
          width: `calc(100% + ${glowPadding * 2}px)`,
          height: `calc(100% + ${glowPadding * 2}px)`,
          borderRadius,
        }}
      />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}

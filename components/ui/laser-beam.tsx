"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface LaserBeamProps {
  width?: number | string
  height?: number | string
  duration?: number
  color?: string
  borderRadius?: number
  active?: boolean
  glowIntensity?: number
  beamLength?: number
  direction?: "clockwise" | "counterclockwise"
  delay?: number
  /** Width of the moving beam/dot */
  borderWidth?: number
  /** Static base border (faint outline) */
  baseBorderWidth?: number
  baseBorderColor?: string
  backgroundColor?: string
  /**
   * When true, keeps perceived motion/trail similar across differently-sized boxes
   * by normalizing to a baseline size (matching the v0 demo).
   */
  normalizeToSize?: boolean
  normalizeBaseWidth?: number
  normalizeBaseHeight?: number
  normalizeBaseBorderRadius?: number
  /**
   * When false, the canvas stays within the component bounds so glow isn't clipped
   * by parent containers with `overflow: hidden`.
   */
  expandCanvas?: boolean
  children?: React.ReactNode
  className?: string
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 0, g: 255, b: 136 }
}

export function LaserBeam({
  width = 400,
  height = 300,
  duration = 4,
  color = "#00ff88",
  borderRadius = 12,
  active = true,
  glowIntensity = 20,
  beamLength = 0.15,
  direction = "clockwise",
  delay = 0,
  borderWidth = 1,
  baseBorderWidth = 1,
  baseBorderColor = "rgba(255,255,255,0.1)",
  backgroundColor = "transparent",
  normalizeToSize = false,
  normalizeBaseWidth = 350,
  normalizeBaseHeight = 220,
  normalizeBaseBorderRadius = 16,
  expandCanvas = true,
  children,
  className = "",
}: LaserBeamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  const glowPadding = glowIntensity + 4

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let canvasW = 0
    let canvasH = 0
    let w = 0
    let h = 0
    let r = 0
    let offsetX = 0
    let offsetY = 0
    let straightWidth = 0
    let straightHeight = 0
    let cornerLength = 0
    let perimeter = 0
    let effectiveDuration = duration
    let effectiveBeamLength = beamLength

    const dpr = window.devicePixelRatio || 1
    const rgb = hexToRgb(color)

    const computePerimeter = (bw: number, bh: number, br: number) => {
      const bwInner = bw - glowPadding * 2
      const bhInner = bh - glowPadding * 2
      const brInner = Math.min(br, Math.min(bwInner, bhInner) / 2)
      const sw = bwInner - 2 * brInner
      const sh = bhInner - 2 * brInner
      const cl = (Math.PI * brInner) / 2
      return 2 * sw + 2 * sh + 4 * cl
    }

    const recalc = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return false

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      canvasW = rect.width
      canvasH = rect.height
      w = canvasW - glowPadding * 2
      h = canvasH - glowPadding * 2
      r = Math.min(borderRadius, Math.min(w, h) / 2)
      offsetX = glowPadding
      offsetY = glowPadding

      straightWidth = w - 2 * r
      straightHeight = h - 2 * r
      cornerLength = (Math.PI * r) / 2
      perimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerLength

      if (normalizeToSize && perimeter > 0) {
        const basePerimeter = computePerimeter(normalizeBaseWidth, normalizeBaseHeight, normalizeBaseBorderRadius)
        if (basePerimeter > 0) {
          // Keep pixels/sec similar (bigger boxes => longer duration)
          effectiveDuration = duration * (perimeter / basePerimeter)
          // Keep trail length in pixels similar (bigger boxes => smaller fraction)
          effectiveBeamLength = beamLength * (basePerimeter / perimeter)
        } else {
          effectiveDuration = duration
          effectiveBeamLength = beamLength
        }
      } else {
        effectiveDuration = duration
        effectiveBeamLength = beamLength
      }

      return true
    }

    if (!recalc()) {
      // If layout isn’t ready yet, try next frame.
      const id = requestAnimationFrame(() => recalc())
      return () => cancelAnimationFrame(id)
    }

    const getPointOnPath = (progress: number): { x: number; y: number } => {
      const adjustedProgress = direction === "counterclockwise" ? 1 - progress : progress
      let distance = adjustedProgress * perimeter

      if (distance < straightWidth) {
        return { x: offsetX + r + distance, y: offsetY }
      }
      distance -= straightWidth

      if (distance < cornerLength) {
        const angle = -Math.PI / 2 + (distance / cornerLength) * (Math.PI / 2)
        return {
          x: offsetX + w - r + Math.cos(angle) * r,
          y: offsetY + r + Math.sin(angle) * r,
        }
      }
      distance -= cornerLength

      if (distance < straightHeight) {
        return { x: offsetX + w, y: offsetY + r + distance }
      }
      distance -= straightHeight

      if (distance < cornerLength) {
        const angle = 0 + (distance / cornerLength) * (Math.PI / 2)
        return {
          x: offsetX + w - r + Math.cos(angle) * r,
          y: offsetY + h - r + Math.sin(angle) * r,
        }
      }
      distance -= cornerLength

      if (distance < straightWidth) {
        return { x: offsetX + w - r - distance, y: offsetY + h }
      }
      distance -= straightWidth

      if (distance < cornerLength) {
        const angle = Math.PI / 2 + (distance / cornerLength) * (Math.PI / 2)
        return {
          x: offsetX + r + Math.cos(angle) * r,
          y: offsetY + h - r + Math.sin(angle) * r,
        }
      }
      distance -= cornerLength

      if (distance < straightHeight) {
        return { x: offsetX, y: offsetY + h - r - distance }
      }
      distance -= straightHeight

      const angle = Math.PI + (distance / cornerLength) * (Math.PI / 2)
      return {
        x: offsetX + r + Math.cos(angle) * r,
        y: offsetY + r + Math.sin(angle) * r,
      }
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = (timestamp - startTimeRef.current) / 1000 - delay

      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Keep in sync with responsive/layout changes.
      recalc()

      ctx.clearRect(0, 0, canvasW, canvasH)

      if (!active) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const safeDuration = Math.max(0.001, effectiveDuration)
      const progress = (elapsed % safeDuration) / safeDuration

      // Draw the beam trail
      // Scale point density with perimeter so large boxes don’t look “cut”/dotted.
      const steps = Math.max(80, Math.min(420, Math.ceil(perimeter / 6)))
      for (let i = 0; i < steps; i++) {
        const t = i / steps
        const pointProgress = (progress - t * effectiveBeamLength + 1) % 1
        const point = getPointOnPath(pointProgress)

        const opacity = Math.pow(1 - t, 2)
        const size = borderWidth * (1 - t * 0.5)

        ctx.beginPath()
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
        ctx.fill()
      }

      // Draw glow at head
      const headPoint = getPointOnPath(progress)

      const gradient = ctx.createRadialGradient(
        headPoint.x,
        headPoint.y,
        0,
        headPoint.x,
        headPoint.y,
        glowIntensity
      )
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`)
      gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`)
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)

      ctx.beginPath()
      ctx.arc(headPoint.x, headPoint.y, glowIntensity, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Bright core
      ctx.beginPath()
      ctx.arc(headPoint.x, headPoint.y, borderWidth + 1, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [
    active,
    beamLength,
    borderRadius,
    borderWidth,
    color,
    delay,
    direction,
    duration,
    glowIntensity,
    glowPadding,
    normalizeToSize,
    normalizeBaseWidth,
    normalizeBaseHeight,
    normalizeBaseBorderRadius,
  ])

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor,
        border: baseBorderWidth > 0 ? `${baseBorderWidth}px solid ${baseBorderColor}` : "none",
      }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{
          top: expandCanvas ? -glowPadding : 0,
          left: expandCanvas ? -glowPadding : 0,
          width: expandCanvas ? `calc(100% + ${glowPadding * 2}px)` : "100%",
          height: expandCanvas ? `calc(100% + ${glowPadding * 2}px)` : "100%",
          borderRadius,
          zIndex: 20,
        }}
      />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

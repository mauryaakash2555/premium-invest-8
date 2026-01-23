// @ts-nocheck

/**
 * FILE: components\ui\slider.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: components
 *
 * DEPENDENCIES:
 * - react
 * - @radix-ui/react-slider
 * - @/lib/utils
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

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef(
  (
    {
      className,
      trackClassName,
      rangeClassName,
      thumbClassName,
      ...props
    },
    ref
  ) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center py-2", className)}
      {...props}>
      <SliderPrimitive.Track
        className={cn(
          "relative h-2 w-full grow overflow-hidden rounded-full bg-primary/20",
          trackClassName
        )}>
        <SliderPrimitive.Range className={cn("absolute h-full bg-primary", rangeClassName)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-6 w-6 rounded-full border-2 border-primary/60 bg-background shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing",
          thumbClassName
        )} />
    </SliderPrimitive.Root>
  )
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

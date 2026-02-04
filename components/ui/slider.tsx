import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
  ariaLabel?: string;
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, trackClassName, rangeClassName, thumbClassName, showTooltip = false, formatValue, ariaLabel, value, ...props }, ref) => {
  const [showingTooltip, setShowingTooltip] = React.useState(false);
  const currentValue = Array.isArray(value) ? value[0] : value;
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      className={cn(
        "relative flex w-full touch-none select-none items-center py-2 group",
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative h-2 w-full grow overflow-hidden rounded-full bg-primary/20 transition-all group-hover:h-2.5",
          trackClassName
        )}
      >
        <SliderPrimitive.Range
          className={cn("absolute h-full bg-primary transition-all", rangeClassName)}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "relative block h-6 w-6 rounded-full border-2 border-primary/60 bg-background shadow-lg",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.78_0.08_65)] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "hover:scale-125 hover:border-[oklch(0.78_0.08_65)] hover:shadow-[0_0_12px_rgba(192,160,98,0.4)]",
          "active:scale-110 active:bg-[oklch(0.78_0.08_65/0.2)]",
          "cursor-grab active:cursor-grabbing",
          "disabled:pointer-events-none disabled:opacity-50",
          thumbClassName
        )}
        onMouseEnter={() => setShowingTooltip(true)}
        onMouseLeave={() => setShowingTooltip(false)}
        onFocus={() => setShowingTooltip(true)}
        onBlur={() => setShowingTooltip(false)}
      >
        {/* Tooltip */}
        {showTooltip && showingTooltip && currentValue !== undefined && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[oklch(0.20_0.02_264)] text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 border border-[oklch(0.78_0.08_65/0.3)]">
            {formatValue ? formatValue(currentValue) : currentValue}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[oklch(0.20_0.02_264)]" />
          </div>
        )}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

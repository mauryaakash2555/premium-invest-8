declare module "@/components/ui/slider" {
  import * as React from "react";
  import * as SliderPrimitive from "@radix-ui/react-slider";

  export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    trackClassName?: string;
    rangeClassName?: string;
    thumbClassName?: string;
  };

  export const Slider: React.ForwardRefExoticComponent<
    SliderProps & React.RefAttributes<React.ElementRef<typeof SliderPrimitive.Root>>
  >;
}

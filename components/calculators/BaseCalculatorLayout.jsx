"use client";

import { DisclaimerFooter } from "@/components/calculators/DisclaimerFooter";
import { LaserBeam } from "@/components/LaserBeamCanvas";

export function BaseCalculatorLayout({
  header,
  children,
  disclaimer = null,
  maxWidthClass = "max-w-md lg:max-w-6xl",
  laserColor = "var(--lux-accent)",
  laserEnabled = true,
}) {
  const innerContent = (
    <div className={`calculator-container w-full ${maxWidthClass}`}>
      <div className="calculator-inner tabular-nums">
        {header}
        {children}
      </div>
      {disclaimer ? <DisclaimerFooter>{disclaimer}</DisclaimerFooter> : null}
    </div>
  );

  return (
    <div className="w-full flex justify-center calculator-backdrop-hover">
      {laserEnabled ? (
        <LaserBeam
          width="100%"
          height="auto"
          color={laserColor}
          borderRadius={12}
          duration={18}
          glowIntensity={12}
          beamLength={0.10}
          borderWidth={1}
          backgroundColor="transparent"
        >
          {innerContent}
        </LaserBeam>
      ) : (
        innerContent
      )}
    </div>
  );
}

"use client";

import { DisclaimerFooter } from "@/components/calculators/DisclaimerFooter";

export function BaseCalculatorLayout({
  header,
  children,
  disclaimer = null,
  maxWidthClass = "max-w-md lg:max-w-6xl",
}) {
  return (
    <div className="w-full flex justify-center calculator-backdrop-hover">
      <div className={`calculator-container w-full ${maxWidthClass}`}>
        <div className="calculator-inner tabular-nums">
          {header}
          {children}
        </div>
        {disclaimer ? <DisclaimerFooter>{disclaimer}</DisclaimerFooter> : null}
      </div>
    </div>
  );
}

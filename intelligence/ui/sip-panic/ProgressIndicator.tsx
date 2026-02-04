"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const defaultLabels = [
  "Choose your mode",
  "Set your SIP",
  "See the crash",
  "View results"
];

export function ProgressIndicator({ 
  currentStep, 
  totalSteps = 4, 
  labels = defaultLabels 
}: ProgressIndicatorProps) {
  return (
    <div className="w-full mb-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                index < currentStep
                  ? "bg-[oklch(0.78_0.08_65)] text-black"
                  : index === currentStep
                  ? "bg-[oklch(0.78_0.08_65/0.3)] border-2 border-[oklch(0.78_0.08_65)] text-[oklch(0.78_0.08_65)]"
                  : "bg-[oklch(0.15_0.02_264)] border border-[oklch(0.30_0.02_264)] text-[oklch(0.50_0.02_264)]"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            
            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                  index < currentStep
                    ? "bg-[oklch(0.78_0.08_65)]"
                    : "bg-[oklch(0.25_0.02_264)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Current step label */}
      <div className="text-center">
        <span className="text-[11px] font-medium text-[oklch(0.78_0.08_65)]">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-[11px] text-[oklch(0.60_0.02_264)] ml-2">
          {labels[currentStep] || ""}
        </span>
      </div>
    </div>
  );
}

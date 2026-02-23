"use client";

/**
 * Portal Onboarding Page — requires authentication (future), progress tracking,
 * skip/complete/assist logging to Supabase via /api/onboarding/event.
 *
 * Design: matches client-portal dark theme. NO gold/yellow/muddy colours.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OnboardingEngine from "@/components/onboarding/OnboardingEngine";
import { onboardingSteps } from "@/components/onboarding/onboardingSteps";
import LaserFooter from "@/components/user/LaserFooter";

/* ───────── Detect ?mode=staff ───────── */
function useStaffMode() {
  if (typeof window === "undefined") return false;
  try { return new URLSearchParams(window.location.search).get("mode") === "staff"; } catch { return false; }
}

export default function PortalOnboardingPage() {
  const staffMode = useStaffMode();

  /* Pre-load completed / skipped steps from API */
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [skippedSteps, setSkippedSteps] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/onboarding/progress");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        setCompletedSteps(new Set(data.completed || []));
        setSkippedSteps(new Set(data.skipped || []));
      } catch {
        /* API may not exist yet — degrade gracefully */
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogEvent = useCallback(async (stepNumber, actionType, meta) => {
    /* Update local state so progress bar reflects immediately */
    if (actionType === "complete") {
      setCompletedSteps((prev) => new Set([...prev, stepNumber]));
    }
    if (actionType === "skip") {
      setSkippedSteps((prev) => new Set([...prev, stepNumber]));
    }
    try {
      await fetch("/api/onboarding/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_number: stepNumber,
          action_type: actionType,
          ...(meta || {}),
        }),
      });
    } catch {
      /* non-blocking */
    }
  }, []);

  const total = onboardingSteps.length;
  const validStepNumbers = new Set(onboardingSteps.map((s) => s.step));
  const done = [...completedSteps].filter((n) => validStepNumbers.has(n)).length;
  const progressPct = total > 0 ? Math.min(Math.round((done / total) * 100), 100) : 0;

  return (
    <main
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(100, 150, 255, 0.06) 0%, transparent 50%),
          linear-gradient(180deg, #0A0B0D 0%, #0D0E12 100%)
        `,
        paddingTop: "100px",
        paddingBottom: "80px",
      }}
    >
      <div className="max-w-[760px] mx-auto px-4">
        {/* Back link */}
        <Link
          href="/client-portal"
          className="inline-flex items-center gap-2 text-[13px] text-white/50 hover:text-white/80 transition-colors no-underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>

        <h1 className="text-[28px] sm:text-[34px] font-bold text-white/95 leading-tight mb-2">
          Investor Onboarding
        </h1>
        <p className="text-[15px] text-white/50 mb-6">
          Complete each step to start investing with BM Wealth.
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-[12px] text-white/40 mb-2">
            <span>{done} of {total} steps completed</span>
            <span>{progressPct}%</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "rgba(255,255,255,0.35)",
              }}
            />
          </div>
        </div>

        {/* Engine */}
        {loaded ? (
          <OnboardingEngine
            steps={onboardingSteps}
            mode="portal"
            onLogEvent={handleLogEvent}
            completedSteps={completedSteps}
            skippedSteps={skippedSteps}
            showSeo={false}
            staffMode={staffMode}
          />
        ) : (
          <div className="space-y-3">
            {onboardingSteps.map((s) => (
              <div
                key={s.step}
                className="h-20 rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.03)" }}
              />
            ))}
          </div>
        )}

        {/* Compliance */}
        <p className="mt-16 text-[11px] text-white/25 text-center leading-relaxed">
          BM Wealth (AMFI ARN 90008 · IRDAI 277925 · PMS 2430447816). External
          links open government and KRA portals — BM Wealth does not control
          their availability.
        </p>
      </div>

      <LaserFooter />
    </main>
  );
}

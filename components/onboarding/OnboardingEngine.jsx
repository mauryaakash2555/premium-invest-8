"use client";

/**
 * OnboardingEngine — shared component for public + portal onboarding.
 *
 * Props:
 *   steps          — Array of step objects from onboardingSteps.js
 *   mode           — "public" | "portal"
 *   onLogEvent     — async (stepNumber, actionType, meta?) => void  (portal only)
 *   completedSteps — Set<number>  (portal only, pre-loaded from DB)
 *   skippedSteps   — Set<number>  (portal only, pre-loaded from DB)
 *   showSeo        — boolean (true for public page, false for portal)
 *   staffMode      — boolean (enables tooltips + operational hints)
 *
 * Design: matches client-portal dark theme (#0A0B0D bg, white-tint cards).
 * NO gold, NO yellow, NO muddy colours. ONLY grayscale + subtle blue tints.
 */

import { useState, useCallback } from "react";
import {
  ExternalLink,
  Check,
  SkipForward,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";

/* ───────────────────────── skip reason options ───────────────────────── */
const SKIP_REASONS = [
  "Already completed offline",
  "Not applicable to my case",
  "Will do later",
  "Need advisor help first",
];

/* ───────────────────────── staff tooltips per step ───────────────────────── */
const STAFF_HINTS = {
  1: "Ask client: Do you have PAN? Is it linked with Aadhaar? If unsure, check here first.",
  2: "Only needed if client does not have PAN. Skip if PAN already exists.",
  3: "Critical step. If KYC not registered, investment will be blocked. Check all 4 KRAs.",
  4: "Run validation even if KYC exists. Mismatches cause silent failures.",
  5: "Common blocker. Name must match exactly across PAN, Aadhaar, and KYC.",
  6: "Only proceed after all verifications pass. Direct to WealthMagic or book advisor call.",
};

/* ───────────────────────── confirmation modal ───────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div
        className="rounded-xl p-6 max-w-sm mx-4 w-full"
        style={{ background: "#16171B", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <p className="text-[14px] text-white/90 mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[12px] font-medium text-white/60 transition-colors hover:bg-white/08 min-h-[44px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-[12px] font-medium text-white/90 transition-colors hover:bg-white/15 min-h-[44px]"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            Yes, Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── monetisation CTA card ───────────────────────── */
function MonetisationCard({ onLogEvent, stepAfter }) {
  const isKyc = stepAfter === 3;

  const trackClick = async (channel) => {
    onLogEvent?.(stepAfter, "monetisation_click", { channel });
    try {
      await fetch("/api/onboarding/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_number: stepAfter, click_type: channel }),
      });
    } catch { /* non-blocking */ }
  };

  return (
    <div
      className="my-6 rounded-xl border p-6"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-[15px] font-semibold text-white/90 mb-1">
        {isKyc ? "Need help completing KYC?" : "Ready to invest?"}
      </p>
      <p className="text-[13px] text-white/50 mb-4">
        {isKyc
          ? "BM Wealth will assist end-to-end — zero paperwork on your end."
          : "Start SIP with expert guidance from BM Wealth advisors."}
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href="https://wa.me/919136065616?text=Hi%2C%20I%20need%20help%20with%20my%20mutual%20fund%20onboarding."
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick("whatsapp")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white/90 transition-colors hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <a
          href="/contact"
          onClick={() => trackClick("advisor_call")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white/90 transition-colors hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Phone className="w-4 h-4" /> Book Consultation
        </a>
        <a
          href="/client-portal"
          onClick={() => trackClick("sip_start")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors hover:bg-white/15"
          style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <ArrowRight className="w-4 h-4" />
          {isKyc ? "Start Assistance" : "Start SIP"}
        </a>
      </div>
    </div>
  );
}

/* ───────────────────────── single step card ───────────────────────── */
function StepCard({
  step,
  mode,
  isExpanded,
  onToggle,
  isCompleted,
  isSkipped,
  onLogEvent,
  showSeo,
  staffMode,
}) {
  const [skipOpen, setSkipOpen] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [assistOpen, setAssistOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // "complete" | "skip" | null
  const [confirmComplete, setConfirmComplete] = useState(false);

  const handlePrimary = useCallback(() => {
    const url = step.primaryLink.url;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) setLinkError(true);
  }, [step.primaryLink.url]);

  const handleAlternate = useCallback(
    (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    []
  );

  const handleComplete = useCallback(async () => {
    setLoadingAction("complete");
    await onLogEvent?.(step.step, "complete");
    setLoadingAction(null);
    setConfirmComplete(false);
  }, [onLogEvent, step.step]);

  const handleSkip = useCallback(
    async (reason) => {
      setLoadingAction("skip");
      await onLogEvent?.(step.step, "skip", { skip_reason: reason });
      setLoadingAction(null);
      setSkipOpen(false);
    },
    [onLogEvent, step.step]
  );

  const handleAssist = useCallback(() => {
    onLogEvent?.(step.step, "assist");
    setAssistOpen((prev) => !prev);
  }, [onLogEvent, step.step]);

  const handleAssistClick = useCallback(
    async (channel, url) => {
      try {
        await fetch("/api/onboarding/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step_number: step.step, click_type: channel }),
        });
      } catch { /* non-blocking */ }
      setAssistOpen(false);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
    [step.step]
  );

  const statusBadge = isCompleted
    ? { label: "Completed", bg: "rgba(255,255,255,0.08)", text: "text-white/70" }
    : isSkipped
    ? { label: "Skipped", bg: "rgba(255,255,255,0.04)", text: "text-white/40" }
    : null;

  return (
    <div
      className="rounded-xl border transition-all duration-200"
      style={{
        background: isExpanded ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
        borderColor: isExpanded ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
      }}
    >
      {/* Header — always visible, min 44px tap target */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left cursor-pointer bg-transparent border-none min-h-[56px]"
      >
        {/* Step number circle */}
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold"
          style={{
            background: isCompleted
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.06)",
            color: isCompleted ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
            border: `1px solid ${isCompleted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : step.step}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-white/90 leading-tight">
              {step.title}
            </span>
            {statusBadge && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge.text}`}
                style={{ background: statusBadge.bg }}
              >
                {statusBadge.label}
              </span>
            )}
          </div>
          <p className="text-[13px] text-white/45 mt-0.5 leading-snug">{step.description}</p>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 shrink-0 text-white/30" />
        ) : (
          <ChevronDown className="w-5 h-5 shrink-0 text-white/30" />
        )}
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 space-y-4">
          {/* Staff hint (only visible with ?mode=staff) */}
          {staffMode && STAFF_HINTS[step.step] && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2"
              style={{ background: "rgba(100,150,255,0.06)", border: "1px solid rgba(100,150,255,0.15)" }}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(130,170,255,0.7)" }} />
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(130,170,255,0.7)" }}>
                {STAFF_HINTS[step.step]}
              </p>
            </div>
          )}

          {/* SEO body text (public page only) */}
          {showSeo && step.seoBody && (
            <p className="text-[13px] text-white/50 leading-relaxed">{step.seoBody}</p>
          )}

          {/* Primary link button — 44px min tap target */}
          <button
            type="button"
            onClick={handlePrimary}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors hover:bg-white/15 min-h-[44px]"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <ExternalLink className="w-4 h-4" />
            {step.primaryLink.label}
          </button>

          {/* Link error fallback — auto-shows alternates */}
          {linkError && (
            <div
              className="flex items-start gap-2 rounded-lg px-4 py-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,180,100,0.15)" }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(255,180,100,0.7)" }} />
              <p className="text-[12px] text-white/60 leading-relaxed">
                Primary portal not responding. Try alternate verification below.
              </p>
            </div>
          )}

          {/* Alternate links — always shown if linkError, otherwise collapsible */}
          {(step.alternates.length > 0) && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">
                Alternate sources
              </p>
              {step.alternates.map((alt) => (
                <button
                  key={alt.url}
                  type="button"
                  onClick={() => handleAlternate(alt.url)}
                  className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white/90 transition-colors bg-transparent border-none cursor-pointer py-1.5 min-h-[44px]"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {alt.label}
                </button>
              ))}
            </div>
          )}

          {/* Portal actions: Complete / Skip / Need Help */}
          {mode === "portal" && (
            <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => setConfirmComplete(true)}
                  disabled={!!loadingAction}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium text-white/90 transition-colors hover:bg-white/12 disabled:opacity-50 min-h-[44px]"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {loadingAction === "complete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Mark Complete
                </button>
              )}

              {!isSkipped && !isCompleted && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSkipOpen(!skipOpen)}
                    disabled={!!loadingAction}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium text-white/60 transition-colors hover:bg-white/08 disabled:opacity-50 min-h-[44px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {loadingAction === "skip" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SkipForward className="w-3.5 h-3.5" />}
                    Skip
                  </button>
                  {skipOpen && (
                    <div
                      className="absolute left-0 top-full mt-1 z-20 rounded-lg py-1 min-w-[220px] shadow-xl"
                      style={{ background: "#16171B", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {SKIP_REASONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSkip(r)}
                          className="block w-full text-left px-4 py-2.5 text-[12px] text-white/70 hover:bg-white/06 transition-colors bg-transparent border-none cursor-pointer min-h-[44px]"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleAssist}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium text-white/60 transition-colors hover:bg-white/08 min-h-[44px]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Need Help
              </button>

              {/* Floating assist panel */}
              {assistOpen && (
                <div
                  className="w-full mt-3 rounded-xl p-4 space-y-1"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="text-[13px] font-medium text-white/80 mb-2">Need help completing this step?</p>
                  <button
                    type="button"
                    onClick={() => handleAssistClick("whatsapp", "https://wa.me/919136065616?text=Hi%2C%20I%20need%20help%20with%20onboarding%20step%20" + step.step)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-[12px] text-white/70 hover:bg-white/06 transition-colors bg-transparent border-none cursor-pointer min-h-[44px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAssistClick("advisor_call", "/contact")}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-[12px] text-white/70 hover:bg-white/06 transition-colors bg-transparent border-none cursor-pointer min-h-[44px]"
                  >
                    <Phone className="w-3.5 h-3.5" /> Book Advisor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAssistClick("callback", "/contact")}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-[12px] text-white/70 hover:bg-white/06 transition-colors bg-transparent border-none cursor-pointer min-h-[44px]"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Back
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation modal for Mark Complete */}
      {confirmComplete && (
        <ConfirmModal
          message={`Mark "${step.title}" as complete? This action will be logged.`}
          onConfirm={handleComplete}
          onCancel={() => setConfirmComplete(false)}
        />
      )}
    </div>
  );
}

/* ───────────────────────── main engine ───────────────────────── */
export default function OnboardingEngine({
  steps,
  mode = "public",
  onLogEvent = () => {},
  completedSteps = new Set(),
  skippedSteps = new Set(),
  showSeo = false,
  staffMode = false,
}) {
  const [expandedStep, setExpandedStep] = useState(steps[0]?.step ?? 1);

  /* Track local state so UI updates instantly without waiting for DB roundtrip */
  const [localCompleted, setLocalCompleted] = useState(completedSteps);
  const [localSkipped, setLocalSkipped] = useState(skippedSteps);

  const handleLogEvent = useCallback(
    async (stepNumber, actionType, meta) => {
      // Optimistic local update
      if (actionType === "complete") {
        setLocalCompleted((prev) => new Set([...prev, stepNumber]));
      }
      if (actionType === "skip") {
        setLocalSkipped((prev) => new Set([...prev, stepNumber]));
      }

      // Delegate to parent (API call)
      await onLogEvent(stepNumber, actionType, meta);
    },
    [onLogEvent]
  );

  // Determine which monetisation slots to show (after step 3 and step 6)
  const monetisationAfter = new Set([3, 6]);

  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div key={s.step}>
          <StepCard
            step={s}
            mode={mode}
            isExpanded={expandedStep === s.step}
            onToggle={() => setExpandedStep(expandedStep === s.step ? null : s.step)}
            isCompleted={localCompleted.has(s.step)}
            isSkipped={localSkipped.has(s.step)}
            onLogEvent={handleLogEvent}
            showSeo={showSeo}
            staffMode={staffMode}
          />
          {monetisationAfter.has(s.step) && (
            <MonetisationCard onLogEvent={handleLogEvent} stepAfter={s.step} />
          )}
        </div>
      ))}
    </div>
  );
}

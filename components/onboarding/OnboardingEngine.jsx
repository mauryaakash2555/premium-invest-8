"use client";

/**
 * OnboardingEngine — Premium guided wealth onboarding experience.
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
 * UX: "Guided journey handled by BM Wealth" — NOT a compliance checklist.
 * Uses --lux-accent (approved subtle gold) for premium CTA styling.
 * NO raw Tailwind color classes. ONLY --lux-* CSS variables + white/black tints.
 */

import { useState, useCallback } from "react";
import {
  ExternalLink,
  Check,
  ChevronDown,
  MessageCircle,
  Phone,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";

/* ───────────────────────── staff tooltips per step ───────────────────────── */
const STAFF_HINTS = {
  1: "Ask client: Do you have PAN? Is it linked with Aadhaar? If unsure, check here first.",
  2: "Only needed if client does not have PAN. Skip if PAN already exists.",
  3: "Critical step. If KYC not registered, investment will be blocked. Check all 4 KRAs.",
  4: "Run validation even if KYC exists. Mismatches cause silent failures.",
  5: "Common blocker. Name must match exactly across PAN, Aadhaar, and KYC.",
  6: "Only proceed after all verifications pass. Direct to WealthMagic or book advisor call.",
};

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
      className="my-8 rounded-2xl p-6 transition-all duration-300"
      style={{
        background: "color-mix(in oklab, var(--lux-accent) 4%, rgba(255,255,255,0.015))",
        border: "1px solid color-mix(in oklab, var(--lux-accent) 15%, rgba(255,255,255,0.05))",
        boxShadow: "0 2px 24px color-mix(in oklab, var(--lux-accent) 4%, transparent)",
      }}
    >
      <p className="text-[16px] font-semibold text-white/90 mb-1">
        {isKyc ? "Need a hand with KYC?" : "Ready to begin your investment journey?"}
      </p>
      <p className="text-[13px] text-white/40 mb-5 leading-relaxed">
        {isKyc
          ? "Our team handles the entire KYC process — zero paperwork on your end."
          : "Start your SIP with personalised guidance from BM Wealth advisors."}
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href="https://wa.me/919136065616?text=Hi%2C%20I%20need%20help%20with%20my%20mutual%20fund%20onboarding."
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick("whatsapp")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 hover:translate-y-[-1px] min-h-[44px]"
          style={{
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp Us
        </a>
        <a
          href="/contact"
          onClick={() => trackClick("advisor_call")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 hover:translate-y-[-1px] min-h-[44px]"
          style={{
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <Phone className="w-4 h-4" /> Book Consultation
        </a>
        <a
          href="/client-portal"
          onClick={() => trackClick("sip_start")}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 hover:translate-y-[-1px] min-h-[44px]"
          style={{
            background: "color-mix(in oklab, var(--lux-accent) 12%, rgba(255,255,255,0.02))",
            border: "1px solid color-mix(in oklab, var(--lux-accent) 28%, transparent)",
            color: "color-mix(in oklab, var(--lux-accent) 85%, white)",
            boxShadow: "0 2px 12px color-mix(in oklab, var(--lux-accent) 6%, transparent)",
          }}
        >
          <ArrowRight className="w-4 h-4" />
          {isKyc ? "Get Assistance" : "Start Investing"}
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
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [assistOpen, setAssistOpen] = useState(false);
  const [altOpen, setAltOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  /* ── Primary CTA: open link, then prompt confirmation ── */
  const handlePrimary = useCallback(() => {
    const url = step.primaryLink.url;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) {
      setLinkError(true);
      setAltOpen(true);
    }
    if (mode === "portal") {
      setTimeout(() => setAwaitingConfirmation(true), 600);
    }
  }, [step.primaryLink.url, mode]);

  /* ── Alternate link click ── */
  const handleAlternate = useCallback(
    (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
      if (mode === "portal") {
        setTimeout(() => setAwaitingConfirmation(true), 600);
      }
    },
    [mode]
  );

  /* ── Confirmation: Yes ── */
  const handleConfirmYes = useCallback(async () => {
    setLoadingAction("complete");
    await onLogEvent?.(step.step, "complete");
    setLoadingAction(null);
    setAwaitingConfirmation(false);
  }, [onLogEvent, step.step]);

  /* ── Confirmation: Not yet ── */
  const handleConfirmNotYet = useCallback(() => {
    setAwaitingConfirmation(false);
  }, []);

  /* ── "Let BM Wealth handle this" ── */
  const handleAssist = useCallback(() => {
    onLogEvent?.(step.step, "assist");
    setAssistOpen((prev) => !prev);
  }, [onLogEvent, step.step]);

  /* ── Assist channel click (WhatsApp / Advisor) ── */
  const handleAssistClick = useCallback(
    async (channel, url) => {
      try {
        await fetch("/api/onboarding/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step_number: step.step, click_type: channel }),
        });
      } catch {
        /* non-blocking */
      }
      setAssistOpen(false);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
    [step.step]
  );

  /* ── Quiet skip buried under assist panel ── */
  const handleSkipQuiet = useCallback(async () => {
    setLoadingAction("skip");
    await onLogEvent?.(step.step, "skip", { skip_reason: "Not applicable" });
    setLoadingAction(null);
    setAssistOpen(false);
  }, [onLogEvent, step.step]);

  return (
    <div
      className="rounded-2xl border transition-all duration-300"
      style={{
        background: isExpanded
          ? "rgba(255,255,255,0.025)"
          : "rgba(255,255,255,0.012)",
        borderColor: isCompleted
          ? "color-mix(in oklab, var(--lux-accent) 25%, rgba(255,255,255,0.06))"
          : isExpanded
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.04)",
        boxShadow: isExpanded
          ? "0 4px 32px rgba(0,0,0,0.25), 0 0 1px rgba(255,255,255,0.04)"
          : "none",
      }}
    >
      {/* ── Header — always visible ── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left cursor-pointer bg-transparent border-none min-h-[64px] transition-all duration-200"
      >
        {/* Step number circle */}
        <div
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-bold transition-all duration-300"
          style={{
            background: isCompleted
              ? "color-mix(in oklab, var(--lux-accent) 14%, rgba(255,255,255,0.04))"
              : "rgba(255,255,255,0.035)",
            color: isCompleted
              ? "color-mix(in oklab, var(--lux-accent) 80%, white)"
              : "rgba(255,255,255,0.4)",
            border: isCompleted
              ? "1px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)"
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: isCompleted
              ? "0 0 14px color-mix(in oklab, var(--lux-accent) 8%, transparent)"
              : "none",
          }}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : step.step}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[15px] md:text-[16px] font-semibold text-white/90 leading-tight">
              {step.title}
            </span>
            {isCompleted && (
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  background:
                    "color-mix(in oklab, var(--lux-accent) 10%, transparent)",
                  color:
                    "color-mix(in oklab, var(--lux-accent) 70%, white)",
                  border:
                    "1px solid color-mix(in oklab, var(--lux-accent) 18%, transparent)",
                }}
              >
                Verified
              </span>
            )}
            {isSkipped && (
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium text-white/30"
                style={{ background: "rgba(255,255,255,0.035)" }}
              >
                Handled by BM Wealth
              </span>
            )}
          </div>
          <p className="text-[13px] text-white/38 mt-1 leading-snug">
            {step.description}
          </p>
        </div>

        <ChevronDown
          className={`w-5 h-5 shrink-0 text-white/20 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Expanded body ── */}
      {isExpanded && (
        <div className="px-5 md:px-6 pb-6 pt-0 space-y-5">
          {/* Staff hint */}
          {staffMode && STAFF_HINTS[step.step] && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{
                background: "rgba(100,150,255,0.04)",
                border: "1px solid rgba(100,150,255,0.10)",
              }}
            >
              <Info
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: "rgba(130,170,255,0.55)" }}
              />
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "rgba(130,170,255,0.55)" }}
              >
                {STAFF_HINTS[step.step]}
              </p>
            </div>
          )}

          {/* SEO body (public page only) */}
          {showSeo && step.seoBody && (
            <p className="text-[13px] text-white/35 leading-relaxed">
              {step.seoBody}
            </p>
          )}

          {/* ── Primary CTA ── */}
          <button
            type="button"
            onClick={handlePrimary}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all duration-300 hover:translate-y-[-1px] min-h-[48px]"
            style={{
              background:
                "color-mix(in oklab, var(--lux-accent) 10%, rgba(255,255,255,0.02))",
              border:
                "1px solid color-mix(in oklab, var(--lux-accent) 28%, transparent)",
              color: "color-mix(in oklab, var(--lux-accent) 85%, white)",
              boxShadow:
                "0 2px 16px color-mix(in oklab, var(--lux-accent) 6%, transparent)",
            }}
          >
            <ExternalLink className="w-4 h-4" />
            {step.primaryLink.label}
          </button>

          {/* ── Secondary: Let BM Wealth handle this (portal only) ── */}
          {mode === "portal" && !isCompleted && !isSkipped && (
            <button
              type="button"
              onClick={handleAssist}
              className="flex items-center gap-2 text-[13px] transition-all duration-200 cursor-pointer bg-transparent border-none py-1 min-h-[44px]"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              }}
            >
              or let BM Wealth handle this
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}

          {/* Link error */}
          {linkError && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,180,100,0.12)",
              }}
            >
              <AlertTriangle
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: "rgba(255,180,100,0.55)" }}
              />
              <p className="text-[12px] text-white/45 leading-relaxed">
                Portal didn&apos;t open. Try an alternate source below.
              </p>
            </div>
          )}

          {/* ── Alternate links (collapsible, kept by requirement) ── */}
          {step.alternates.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setAltOpen(!altOpen)}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium cursor-pointer bg-transparent border-none py-1 transition-colors duration-200 min-h-[36px]"
                style={{ color: "rgba(255,255,255,0.22)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.42)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.22)";
                }}
              >
                Other verification sources
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    altOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {(altOpen || linkError) && (
                <div className="mt-1.5 space-y-0.5 pl-1">
                  {step.alternates.map((alt) => (
                    <button
                      key={alt.url}
                      type="button"
                      onClick={() => handleAlternate(alt.url)}
                      className="flex items-center gap-2 text-[13px] transition-colors duration-200 bg-transparent border-none cursor-pointer py-2 min-h-[40px]"
                      style={{ color: "rgba(255,255,255,0.42)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color =
                          "rgba(255,255,255,0.72)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color =
                          "rgba(255,255,255,0.42)";
                      }}
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {alt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Soft confirmation: "Did this complete?" ── */}
          {awaitingConfirmation && !isCompleted && !isSkipped && (
            <div
              className="rounded-xl p-5 mt-1"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-[14px] text-white/65 mb-3.5 font-medium">
                Did this complete successfully?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmYes}
                  disabled={!!loadingAction}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 hover:translate-y-[-1px] disabled:opacity-50 min-h-[44px]"
                  style={{
                    background:
                      "color-mix(in oklab, var(--lux-accent) 10%, rgba(255,255,255,0.02))",
                    border:
                      "1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)",
                    color:
                      "color-mix(in oklab, var(--lux-accent) 80%, white)",
                  }}
                >
                  {loadingAction === "complete" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Yes, verified
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNotYet}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-200 min-h-[44px]"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Not yet
                </button>
              </div>
            </div>
          )}

          {/* ── Assist panel: "We'll take care of this" ── */}
          {assistOpen && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-[14px] font-medium text-white/70 mb-1">
                We&apos;ll take care of this for you
              </p>
              <p className="text-[12px] text-white/30 mb-4">
                Our team will complete this step on your behalf.
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() =>
                    handleAssistClick(
                      "whatsapp",
                      "https://wa.me/919136065616?text=Hi%2C%20I%20need%20help%20with%20onboarding%20step%20" +
                        step.step
                    )
                  }
                  className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[13px] transition-all duration-200 bg-transparent border-none cursor-pointer min-h-[44px]"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.025)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  }}
                >
                  <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAssistClick("advisor_call", "/contact")
                  }
                  className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[13px] transition-all duration-200 bg-transparent border-none cursor-pointer min-h-[44px]"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.025)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  }}
                >
                  <Phone className="w-4 h-4" /> Book a Call with Advisor
                </button>
              </div>

              {/* Quiet skip — buried under assist, de-emphasised */}
              {!isSkipped && !isCompleted && (
                <button
                  type="button"
                  onClick={handleSkipQuiet}
                  disabled={!!loadingAction}
                  className="mt-3 pt-3 text-[11px] cursor-pointer bg-transparent border-none transition-colors duration-200 disabled:opacity-50 w-full text-left"
                  style={{
                    color: "rgba(255,255,255,0.18)",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.18)";
                  }}
                >
                  {loadingAction === "skip"
                    ? "Updating..."
                    : "Not applicable to my case"}
                </button>
              )}
            </div>
          )}
        </div>
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

  /* Local state for instant UI updates without DB roundtrip */
  const [localCompleted, setLocalCompleted] = useState(completedSteps);
  const [localSkipped, setLocalSkipped] = useState(skippedSteps);

  const handleLogEvent = useCallback(
    async (stepNumber, actionType, meta) => {
      if (actionType === "complete") {
        setLocalCompleted((prev) => new Set([...prev, stepNumber]));
      }
      if (actionType === "skip") {
        setLocalSkipped((prev) => new Set([...prev, stepNumber]));
      }
      await onLogEvent(stepNumber, actionType, meta);
    },
    [onLogEvent]
  );

  const monetisationAfter = new Set([3, 6]);

  return (
    <div className="space-y-4">
      {steps.map((s) => (
        <div key={s.step}>
          <StepCard
            step={s}
            mode={mode}
            isExpanded={expandedStep === s.step}
            onToggle={() =>
              setExpandedStep(expandedStep === s.step ? null : s.step)
            }
            isCompleted={localCompleted.has(s.step)}
            isSkipped={localSkipped.has(s.step)}
            onLogEvent={handleLogEvent}
            showSeo={showSeo}
            staffMode={staffMode}
          />
          {monetisationAfter.has(s.step) && (
            <MonetisationCard
              onLogEvent={handleLogEvent}
              stepAfter={s.step}
            />
          )}
        </div>
      ))}
    </div>
  );
}

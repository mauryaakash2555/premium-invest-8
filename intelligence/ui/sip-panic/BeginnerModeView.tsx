"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { MarketConditions, SIPScenario } from "@/intelligence/simulations/sip-vs-panic";
import { simulateSIPVsPanic } from "@/intelligence/simulations/sip-vs-panic";
import { trackEvent } from "@/lib/analytics";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { LakhTooltip } from "./LakhTooltip";
import { buildShareUrlWithUtm } from "@/lib/urls/shareUtm";

function buildDefaultMarketConditions(): MarketConditions {
  return {
    crashDepthPct: -35,
    crashStartMonth: 30,
    crashDurationMonths: 6,
    recoveryGainPct: 45,
    recoveryDurationMonths: 12,
    secondaryCorrectionDepthPct: -20,
    secondaryCorrectionDurationMonths: 3,
    secondaryCorrectionStartMonth: 78,
  };
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function BeginnerModeView(props: {
  monthlyAmount: number;
  durationYears: number;
  onChangeMonthlyAmount: (monthly: number) => void;
  onChangeDurationYears: (years: number) => void;
  onRequestAdvanced: () => void;
  initialStoryChoice?: "continue" | "stop" | "pause_6" | "pause_12";
  initialStoryStep?: 0 | 1 | 2;
  challengerChoice?: "continue" | "stop" | "pause_6" | "pause_12";
}) {
  const panicStopPct = 30;

  const lastTrackedStoryOutcomeRef = useRef<string>("");

  type StoryChoice = "continue" | "stop" | "pause_6" | "pause_12";
  const [storyStep, setStoryStep] = useState<0 | 1 | 2>(props.initialStoryStep ?? 0);
  const [storyChoice, setStoryChoice] = useState<StoryChoice>((props.initialStoryChoice as StoryChoice) ?? "stop");

  const storyChoiceToLabel = (choice: StoryChoice): string => {
    if (choice === "continue") return "Continue SIP (discipline)";
    if (choice === "pause_6") return "Pause for 6 months, then restart";
    if (choice === "pause_12") return "Pause for 12 months, then restart";
    return "Stop SIP (fear takes over)";
  };

  const choiceLabel = storyChoiceToLabel(storyChoice);

  const challengerLabel = props.challengerChoice
    ? storyChoiceToLabel(props.challengerChoice as StoryChoice)
    : "";

  const primaryTruthLine =
    storyChoice === "continue"
      ? "Continuing your SIP through the crash keeps buying low and compounds the recovery."
      : storyChoice === "pause_6" || storyChoice === "pause_12"
      ? "Pausing during the crash reduces low-price buying; restarting helps, but timing still matters."
      : `Stopping your SIP around a ~${panicStopPct}% drawdown cuts off the crash buying window and the recovery compounding.`;

  function buildChoiceScenario(choice: StoryChoice): SIPScenario {
    if (choice === "continue") {
      return {
        name: "Your choice: Continue SIP",
        description: "Keeps investing through the crash and recovery",
        behaviorType: "discipline",
      };
    }

    if (choice === "pause_6") {
      return {
        name: "Your choice: Pause 6 months",
        description: "Pauses SIP at a 30% drawdown, then restarts after ~6 months",
        behaviorType: "custom",
        panicThreshold: -panicStopPct,
        stopDuration: 6,
      };
    }

    if (choice === "pause_12") {
      return {
        name: "Your choice: Pause 12 months",
        description: "Pauses SIP at a 30% drawdown, then restarts after ~12 months",
        behaviorType: "custom",
        panicThreshold: -panicStopPct,
        stopDuration: 12,
      };
    }

    return {
      name: "Your choice: Stop SIP",
      description: "Stops equity SIP at a 30% drawdown and never restarts in this model",
      behaviorType: "panic",
      panicThreshold: -panicStopPct,
    };
  }

  // Allow deep-linking into a specific story choice.
  // Only apply when props request it (avoid fighting user interaction).
  useEffect(() => {
    const nextChoice = props.initialStoryChoice as StoryChoice | undefined;
    const nextStep = props.initialStoryStep;
    if (!nextChoice && typeof nextStep !== "number") return;

    if (nextChoice && nextChoice !== storyChoice) setStoryChoice(nextChoice);
    if (typeof nextStep === "number" && nextStep !== storyStep) setStoryStep(nextStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialStoryChoice, props.initialStoryStep]);

  // Do not clamp the input value on every keystroke (it makes typing e.g. 15000 nearly impossible).
  // Clamp only for calculations + onBlur.
  const monthlyForCalc = clampInt(props.monthlyAmount, 1_000, 5_00_000);
  const yearsForCalc = clampInt(props.durationYears, 1, 30);
  const market = useMemo(() => buildDefaultMarketConditions(), []);
  const crashStartMonth = market.crashStartMonth ?? 30;
  const crashStartYearApprox = Math.max(0, Math.round((crashStartMonth / 12) * 10) / 10);

  const result = useMemo(() => {
    const disciplineScenario: SIPScenario = {
      name: "Perfect Discipline",
      description: "Never stops SIP, regardless of market conditions",
      behaviorType: "discipline",
    };
    const choiceScenario = buildChoiceScenario(storyChoice);

    const scenarios: SIPScenario[] = [disciplineScenario, choiceScenario];

    const taxConfig = {
      applyCess: true,
      cessRate: 0.04,
      applySurcharge: false,
      surchargeRate: 0,
    };

    const cashAnnualRatePct = 6;

    const out = simulateSIPVsPanic(monthlyForCalc, yearsForCalc, scenarios, market, {
      afterStopMode: "cash",
      cashAnnualRatePct,
      riskComfort: "moderate",
      tax: taxConfig,
      taxCalculationMode: "conservative_stcg_30",
      investmentType: "equity_mf",
    });

    const disciplineRow = out.find((r) => r.scenario.name === disciplineScenario.name) ?? null;
    const choiceRow = out.find((r) => r.scenario.name === choiceScenario.name) ?? null;

    const disciplineAmt = disciplineRow?.postTaxCorpus ?? 0;
    const choiceAmt = choiceRow?.postTaxCorpus ?? 0;
    const behavioralCost = Math.max(0, disciplineAmt - choiceAmt);

    const costPct = disciplineAmt > 0 ? Math.round((behavioralCost / disciplineAmt) * 100) : 0;

    return {
      out,
      disciplineRow,
      choiceRow,
      disciplineAmt,
      choiceAmt,
      behavioralCost,
      costPct,
      cashAnnualRatePct,
      story: {
        step: storyStep,
        choice: storyChoice,
      },
    };
  }, [market, monthlyForCalc, panicStopPct, storyChoice, storyStep, yearsForCalc]);

  // Persist a real completion event with computed outcomes (powers live Story stats).
  useEffect(() => {
    if (storyStep < 2) return;

    const key = `${storyChoice}|${monthlyForCalc}|${yearsForCalc}|${Math.round(result.behavioralCost || 0)}`;
    if (lastTrackedStoryOutcomeRef.current === key) return;
    lastTrackedStoryOutcomeRef.current = key;

    try {
      trackEvent("sip_vs_panic_story_completed", {
        calculator_type: "sip_vs_panic_selling",
        mode: "story",
        story_choice: storyChoice,
        monthly_amount: monthlyForCalc,
        duration_years: yearsForCalc,
        behavioral_cost: Math.round(result.behavioralCost || 0),
        discipline: Math.round(result.disciplineAmt || 0),
        panic: Math.round(result.choiceAmt || 0),
        cost_pct: Math.round(result.costPct || 0),
      });
    } catch {
      // ignore
    }
  }, [monthlyForCalc, result.behavioralCost, result.choiceAmt, result.costPct, result.disciplineAmt, storyChoice, storyStep, yearsForCalc]);

  const buildStoryShareUrl = useMemo(() => {
    try {
      const p = new URLSearchParams();
      p.set("ui", "beginner");
      p.set("story", "1");
      // Enables dynamic OG/meta on the route (used by WhatsApp/Twitter/LinkedIn previews).
      p.set("share", "1");
      p.set("sc", storyChoice);
      p.set("m", String(monthlyForCalc));
      p.set("y", String(yearsForCalc));

      // Include computed outcomes so share previews are specific (no server recompute needed).
      p.set("cost", String(Math.round(result.behavioralCost || 0)));
      p.set("disc", String(Math.round(result.disciplineAmt || 0)));
      p.set("panic", String(Math.round(result.choiceAmt || 0)));

      // Labels used by OG renderer.
      p.set("rc", "moderate");
      p.set("crash", "story");
      p.set("tax", "stcg30");

      return buildShareUrlWithUtm(p, {
        medium: "story",
        content: "sip_vs_panic",
      });
    } catch {
      return "";
    }
  }, [monthlyForCalc, result.behavioralCost, result.choiceAmt, result.disciplineAmt, storyChoice, yearsForCalc]);

  const copyStoryLink = async () => {
    try {
      if (!buildStoryShareUrl) return;
      await navigator.clipboard.writeText(buildStoryShareUrl);
      trackEvent("calculator_share", {
        calculator_type: "sip_vs_panic_selling",
        channel: "story_link_copy",
        story_choice: storyChoice,
      });
    } catch {
      // ignore
    }
  };

  const shareStoryWhatsApp = () => {
    try {
      if (!buildStoryShareUrl) return;
      const title = `SIP vs Panic (Story Mode) — my crash decision: ${choiceLabel}`;
      const gap = Math.max(0, Math.round(result.behavioralCost || 0));
      const gapL = `₹${(gap / 100_000).toFixed(2)}L`;
      const msg = `${title}\n\nEstimated gap vs discipline: ${gapL} (~${String(result.costPct || 0)}%)\nEducation-only model\n\n${buildStoryShareUrl}`;

      trackEvent("calculator_share", {
        calculator_type: "sip_vs_panic_selling",
        channel: "story_whatsapp",
        story_choice: storyChoice,
      });

      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  };

  const buildChallengeUrl = useMemo(() => {
    try {
      const p = new URLSearchParams();
      p.set("ui", "beginner");
      p.set("story", "1");
      // Enables dynamic OG/meta on the route (challenge preview).
      p.set("share", "1");
      p.set("challenge", "1");
      p.set("chc", storyChoice);
      p.set("m", String(monthlyForCalc));
      p.set("y", String(yearsForCalc));

      return buildShareUrlWithUtm(p, {
        medium: "challenge",
        content: "sip_vs_panic",
      });
    } catch {
      return "";
    }
  }, [monthlyForCalc, storyChoice, yearsForCalc]);

  const shareChallengeWhatsApp = () => {
    try {
      if (!buildChallengeUrl) return;
      const msg = `SIP Crash Challenge (2 min) — what would you do at a -${panicStopPct}% crash?\n\nI just ran this simulator. Take the challenge and compare outcomes (education-only).\n\n${buildChallengeUrl}`;
      trackEvent("calculator_share", {
        calculator_type: "sip_vs_panic_selling",
        channel: "story_challenge_whatsapp",
        story_choice: storyChoice,
      });
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  };

  const copyChallengeLink = async () => {
    try {
      if (!buildChallengeUrl) return;
      await navigator.clipboard.writeText(buildChallengeUrl);
      trackEvent("calculator_share", {
        calculator_type: "sip_vs_panic_selling",
        channel: "story_challenge_link_copy",
        story_choice: storyChoice,
      });
    } catch {
      // ignore
    }
  };

  const totalInvested = monthlyForCalc * 12 * yearsForCalc;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-white/70">STORY MODE (2 MIN)</div>
            <div className="mt-1 text-sm font-semibold text-white/90">A guided crash decision, with real numbers</div>
            <div className="mt-1 text-[12px] text-white/65">
              You’ll face a simulated ~{Math.abs(market.crashDepthPct ?? 35)}% crash around Year ~{crashStartYearApprox}.
              Choose your behavior and see the estimated cost.
            </div>
          </div>

          {storyStep === 0 ? (
            <button
              type="button"
              onClick={() => {
                setStoryStep(1);
                trackEvent("calculator_start", {
                  calculator_type: "sip_vs_panic_selling",
                  start_mode: "story",
                });
              }}
              className="min-h-10 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-2 text-xs font-semibold text-black hover:opacity-95"
            >
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStoryStep(0);
                trackEvent("calculator_open", {
                  calculator_type: "sip_vs_panic_selling",
                  open_mode: "story_reset",
                });
              }}
              className="min-h-10 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/5"
            >
              Reset
            </button>
          )}
        </div>

        {storyStep >= 1 ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            {props.challengerChoice ? (
              <div className="mb-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-[11px] font-semibold text-white/85">Challenge</div>
                <div className="mt-1 text-[12px] text-white/70">
                  Someone challenged you — they chose <span className="font-semibold text-white/85">{challengerLabel}</span>.
                  What would you do?
                </div>
              </div>
            ) : null}

            <div className="text-xs font-semibold text-white/85">Scene: “The crash hits.”</div>
            <div className="mt-1 text-[12px] text-white/70">
              Headlines are red. Your portfolio is falling. You notice the market is down ~{panicStopPct}% from peak (drawdown).
              What do you do?
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setStoryChoice("continue");
                  setStoryStep(2);
                  trackEvent("calculator_calculate", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "continue",
                  });
                  trackEvent("calculator_complete", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "continue",
                  });
                }}
                className={
                  "min-h-11 rounded-xl border px-3 py-2 text-[12px] font-semibold hover:bg-white/5 " +
                  (storyChoice === "continue" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-black/10 text-white/85")
                }
              >
                Continue SIP (discipline)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStoryChoice("stop");
                  setStoryStep(2);
                  trackEvent("calculator_calculate", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "stop",
                  });
                  trackEvent("calculator_complete", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "stop",
                  });
                }}
                className={
                  "min-h-11 rounded-xl border px-3 py-2 text-[12px] font-semibold hover:bg-white/5 " +
                  (storyChoice === "stop" ? "border-rose-400/40 bg-rose-400/10 text-rose-100" : "border-white/10 bg-black/10 text-white/85")
                }
              >
                Stop SIP (fear takes over)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStoryChoice("pause_6");
                  setStoryStep(2);
                  trackEvent("calculator_calculate", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "pause_6",
                  });
                  trackEvent("calculator_complete", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "pause_6",
                  });
                }}
                className={
                  "min-h-11 rounded-xl border px-3 py-2 text-[12px] font-semibold hover:bg-white/5 " +
                  (storyChoice === "pause_6" ? "border-indigo-400/40 bg-indigo-400/10 text-indigo-100" : "border-white/10 bg-black/10 text-white/85")
                }
              >
                Pause 6 months, then restart
              </button>

              <button
                type="button"
                onClick={() => {
                  setStoryChoice("pause_12");
                  setStoryStep(2);
                  trackEvent("calculator_calculate", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "pause_12",
                  });
                  trackEvent("calculator_complete", {
                    calculator_type: "sip_vs_panic_selling",
                    mode: "story",
                    story_choice: "pause_12",
                  });
                }}
                className={
                  "min-h-11 rounded-xl border px-3 py-2 text-[12px] font-semibold hover:bg-white/5 " +
                  (storyChoice === "pause_12" ? "border-indigo-300/40 bg-indigo-300/10 text-indigo-100" : "border-white/10 bg-black/10 text-white/85")
                }
              >
                Pause 12 months, then restart
              </button>
            </div>

            {storyStep >= 2 ? (
              <div className="mt-4 text-[12px] text-white/75">
                <div className="font-semibold text-white/85">Outcome (estimated, after tax)</div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                    <div className="text-[11px] font-semibold text-emerald-100/90">Perfect discipline</div>
                    <div className="mt-2 text-2xl font-semibold text-emerald-200 tabular-nums">
                      <LakhTooltip amount={result.disciplineAmt} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <div className="text-[11px] font-semibold text-white/80">{buildChoiceScenario(storyChoice).name}</div>
                    <div className="mt-2 text-2xl font-semibold text-white tabular-nums">
                      <LakhTooltip amount={result.choiceAmt} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="text-[11px] font-semibold text-white/85">Behavioral cost</div>
                  <div className="mt-1 text-[12px] text-white/70">
                    Estimated wealth gap: <span className="font-semibold text-white/85"><LakhTooltip amount={result.behavioralCost} /></span>
                    {result.costPct > 0 ? <span className="text-white/60"> (≈ {result.costPct}% of the disciplined outcome)</span> : null}
                  </div>
                  <div className="mt-1 text-[11px] text-white/55">Education-only, simplified market + tax model.</div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={copyStoryLink}
                    className="min-h-10 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/5"
                  >
                    Copy story link
                  </button>
                  <button
                    type="button"
                    onClick={copyChallengeLink}
                    className="min-h-10 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/5"
                  >
                    Copy challenge link
                  </button>
                  <button
                    type="button"
                    onClick={shareStoryWhatsApp}
                    className="min-h-10 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-2 text-xs font-semibold text-black hover:opacity-95"
                  >
                    Share on WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={shareChallengeWhatsApp}
                    className="min-h-10 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-2 text-xs font-semibold text-black hover:opacity-95"
                  >
                    Challenge on WhatsApp
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950/85 via-slate-950/65 to-indigo-950/55 p-7 sm:p-10 text-center shadow-[0_10px_60px_rgba(0,0,0,0.55)]">
        <div className="text-[11px] font-semibold tracking-wide text-white/70">PRIMARY TRUTH</div>
        <div className="mt-3 text-4xl sm:text-6xl font-semibold text-white tabular-nums leading-tight">
          You could lose <span className="text-rose-300"><LakhTooltip amount={result.behavioralCost} /></span>
        </div>
        <p className="mt-3 text-sm sm:text-base text-white/85 font-semibold">
          Same market path. Different behavior.
        </p>
        <p className="mt-2 text-[12px] text-white/70">
          {primaryTruthLine}
        </p>
        <p className="mt-4 text-[11px] text-white/55">Education-only. Simplified market + tax model.</p>
      </section>

      {yearsForCalc * 12 < crashStartMonth ? (
        <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
          <div className="font-semibold">Why might the cost look like ₹0 for short durations?</div>
          <div className="mt-1 text-xs text-amber-100/90">
            This education model places the “big crash” around Year ~{crashStartYearApprox}. If your duration ends before that,
            the panic trigger may never occur, so the cost can be near zero.
          </div>
        </section>
      ) : null}

      <details className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-white/90">
          Assumptions used in Beginner mode (education-only)
        </summary>
        <div className="mt-3 space-y-3 text-[12px] text-white/75">
          <div>
            <div className="font-semibold text-white/85">Crash / recovery path</div>
            <div>
              Crash: {Math.abs(market.crashDepthPct ?? 35)}% over ~{market.crashDurationMonths ?? 6} months starting ~Month {crashStartMonth} (≈ Year {crashStartYearApprox}).
              Recovery: +{market.recoveryGainPct ?? 45}% over ~{market.recoveryDurationMonths ?? 12} months.
              Secondary correction: {Math.abs(market.secondaryCorrectionDepthPct ?? 20)}% over ~{market.secondaryCorrectionDurationMonths ?? 3} months around Month {market.secondaryCorrectionStartMonth ?? 78}.
            </div>
          </div>

          <div>
            <div className="font-semibold text-white/85">Panic rule</div>
            <div>
              Stops SIP contributions once the market is ~{panicStopPct}% down from the last peak (a drawdown trigger).
              After stopping, contributions are modeled as going to cash at ~{result.cashAnnualRatePct}% annual.
            </div>
          </div>

          <div>
            <div className="font-semibold text-white/85">Tax (simplified)</div>
            <div>
              Equity MF style, conservative gains tax approximation (30% on gains) + 4% cess; no surcharge in Beginner mode.
              This is a teaching model and may differ from your actual taxes.
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-[11px] text-white/65">
            Want to change crash presets, tax profile, or see month-by-month charts? Use Advanced Mode.
          </div>
        </div>
      </details>

      <section className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5 sm:p-6">
        <div className="text-sm font-semibold text-white/90">How much & how long?</div>
        <div className="mt-1 text-[11px] text-white/60">Optional — adjust to match your situation.</div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-semibold text-white/70">Monthly SIP (₹)</div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={1000}
                max={500000}
                step={500}
                value={Number.isFinite(props.monthlyAmount) ? props.monthlyAmount : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  props.onChangeMonthlyAmount(raw === "" ? Number.NaN : Number(raw));
                }}
                onBlur={() => {
                  props.onChangeMonthlyAmount(clampInt(props.monthlyAmount, 1_000, 5_00_000));
                }}
                className="no-spinner h-10 bg-black/25 border-white/12 text-white placeholder:text-white/45"
              />
              <span className="text-[11px] text-white/55">/mo</span>
            </div>
            <div className="mt-2 text-[11px] text-white/60">Total invested: ₹{totalInvested.toLocaleString("en-IN")}</div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold text-white/70">Duration</div>
                <div className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/80 tabular-nums">{yearsForCalc}y</div>
            </div>
            <div className="mt-2">
              <Slider
                min={1}
                max={30}
                step={1}
                value={[yearsForCalc]}
                onValueChange={(arr) => props.onChangeDurationYears(Number(arr?.[0] ?? yearsForCalc))}
                trackClassName="bg-white/10"
                rangeClassName="bg-[oklch(0.78_0.08_65)]"
                thumbClassName="border-[oklch(0.78_0.08_65)] bg-black"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-white/55">
                <span>1y</span>
                <span>30y</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="text-[11px] text-white/60">Quick scenarios</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                props.onChangeMonthlyAmount(5_000);
                props.onChangeDurationYears(5);
              }}
              className="min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:bg-white/5"
            >
              Conservative
            </button>
            <button
              type="button"
              onClick={() => {
                props.onChangeMonthlyAmount(10_000);
                props.onChangeDurationYears(10);
              }}
              className="min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:bg-white/5"
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => {
                props.onChangeMonthlyAmount(20_000);
                props.onChangeDurationYears(20);
              }}
              className="min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:bg-white/5"
            >
              Aggressive
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold text-white/90">Your results (after tax)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center">
            <p className="text-xs text-emerald-100/90 font-semibold">If you stay calm & keep investing</p>
            <div className="mt-3 text-3xl sm:text-4xl font-semibold text-emerald-200 tabular-nums">
              <LakhTooltip amount={result.disciplineAmt} />
            </div>
            <p className="mt-2 text-[11px] text-emerald-100/70">Final wealth estimate</p>
          </div>

          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-6 text-center">
            <p className="text-xs text-red-100/90 font-semibold">If you {choiceLabel.toLowerCase()}</p>
            <div className="mt-3 text-3xl sm:text-4xl font-semibold text-red-200 tabular-nums">
              <LakhTooltip amount={result.choiceAmt} />
            </div>
            <p className="mt-2 text-[11px] text-red-100/70">Final wealth estimate</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 ultra-luxury-glass p-6">
        <h4 className="text-sm font-semibold text-white/90">Why does panic cost so much?</h4>
        <ul className="mt-3 space-y-2 text-sm text-white/75">
          <li>During crashes, prices are low — continuing SIP buys more units.</li>
          <li>When markets recover, those extra units compound your recovery gains.</li>
          <li>Stopping SIP cuts off the cheapest buying period and the rebound.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <button
          type="button"
          onClick={props.onRequestAdvanced}
          className="min-h-11 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-3 text-sm font-semibold text-black hover:opacity-95"
        >
          Switch to Advanced Mode
        </button>
      </section>

      <section className="text-[11px] text-white/60 rounded-xl border border-white/10 bg-black/20 p-4">
        This is for educational purposes only. It does not constitute investment, tax, or legal advice.
      </section>
    </div>
  );
}

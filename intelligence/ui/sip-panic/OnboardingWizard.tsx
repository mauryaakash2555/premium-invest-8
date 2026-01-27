"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export type CrashPreset = "default" | "2008" | "2020" | "2022";
export type AvatarKey = "nervous_nisha" | "balanced_raj" | "aggressive_amit";
export type OnboardingChoice = "stay_calm" | "panic";

export type OnboardingResult = {
  monthlyAmount: number;
  crashPreset: CrashPreset;
  avatar: AvatarKey;
  choice: OnboardingChoice;
};

const AVATARS: Array<{ k: AvatarKey; title: string; subtitle: string; riskComfort: "conservative" | "moderate" | "aggressive" }> = [
  {
    k: "nervous_nisha",
    title: "Nervous Nisha",
    subtitle: "Hates seeing red. Wants peace of mind.",
    riskComfort: "conservative",
  },
  {
    k: "balanced_raj",
    title: "Balanced Raj",
    subtitle: "Stays consistent. Prefers steady progress.",
    riskComfort: "moderate",
  },
  {
    k: "aggressive_amit",
    title: "Aggressive Amit",
    subtitle: "Can handle volatility. Thinks long-term.",
    riskComfort: "aggressive",
  },
];

const CRASH_CARDS: Array<{ k: CrashPreset; title: string; subtitle: string }> = [
  { k: "2008", title: "2008", subtitle: "Deep crash (≈−60%)" },
  { k: "2020", title: "2020", subtitle: "Fast crash (≈−40%)" },
  { k: "2022", title: "2022", subtitle: "Slow grind (≈−18%)" },
];

function formatInrShort(n: number): string {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return `₹${v.toLocaleString("en-IN")}`;
}

export function OnboardingWizard(props: {
  open: boolean;
  defaultMonthlyAmount: number;
  defaultCrashPreset: CrashPreset;
  onClose: () => void;
  onComplete: (r: OnboardingResult) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [monthlyAmount, setMonthlyAmount] = useState<number>(props.defaultMonthlyAmount);
  const [avatar, setAvatar] = useState<AvatarKey>("balanced_raj");
  const [crashPreset, setCrashPreset] = useState<CrashPreset>(props.defaultCrashPreset === "default" ? "2020" : props.defaultCrashPreset);
  const [choice, setChoice] = useState<OnboardingChoice>("stay_calm");

  const stepTitle = useMemo(() => {
    if (step === 1) return "Step 1 of 3: Your monthly SIP";
    if (step === 2) return "Step 2 of 3: Pick a real crash";
    return "Step 3 of 3: Your decision";
  }, [step]);

  return (
    <Dialog
      open={props.open}
      onOpenChange={(next) => {
        if (!next) props.onClose();
      }}
    >
      <DialogContent className="max-w-[720px] bg-black text-white border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base">{stepTitle}</DialogTitle>
          <DialogDescription className="text-white/70">
            Instant results, then you can explore other choices.
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <Label className="text-xs text-white/80">How much can you invest monthly?</Label>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold gold-gradient-text tabular-nums">{formatInrShort(monthlyAmount)}/month</div>
                <div className="text-[11px] text-white/55">Move the slider</div>
              </div>
              <div className="mt-3">
                <Slider
                  value={[monthlyAmount]}
                  min={1000}
                  max={500000}
                  step={1000}
                  onValueChange={(v) => {
                    const next = Array.isArray(v) ? v[0] : monthlyAmount;
                    setMonthlyAmount(next);
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <Label className="text-xs text-white/80">Choose your investor avatar</Label>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AVATARS.map((a) => {
                  const selected = a.k === avatar;
                  return (
                    <button
                      key={a.k}
                      type="button"
                      onClick={() => setAvatar(a.k)}
                      className={
                        "text-left rounded-xl border px-3 py-3 transition " +
                        (selected
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 bg-black/20 hover:border-white/20")
                      }
                    >
                      <div className="text-sm font-semibold text-white/90">{a.title}</div>
                      <div className="mt-1 text-[11px] text-white/65">{a.subtitle}</div>
                      <div className="mt-2 text-[10px] text-white/55">Risk comfort: {a.riskComfort}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <div className="text-xs text-white/70">Pick a real crash to experience.</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CRASH_CARDS.map((c) => {
                const selected = c.k === crashPreset;
                return (
                  <button
                    key={c.k}
                    type="button"
                    onClick={() => setCrashPreset(c.k)}
                    className={
                      "rounded-xl border px-4 py-4 text-left transition " +
                      (selected ? "border-white/30 bg-white/10" : "border-white/10 bg-black/20 hover:border-white/20")
                    }
                  >
                    <div className="text-sm font-semibold text-white/90">{c.title}</div>
                    <div className="mt-1 text-[11px] text-white/65">{c.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <div className="text-xs text-white/70">It’s crash time. What do you do?</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChoice("stay_calm")}
                className={
                  "rounded-xl border px-4 py-4 text-left transition " +
                  (choice === "stay_calm" ? "border-white/30 bg-white/10" : "border-white/10 bg-black/20 hover:border-white/20")
                }
              >
                <div className="text-sm font-semibold text-white/90">Stay calm & keep investing</div>
                <div className="mt-1 text-[11px] text-white/65">You continue the SIP through the crash.</div>
              </button>

              <button
                type="button"
                onClick={() => setChoice("panic")}
                className={
                  "rounded-xl border px-4 py-4 text-left transition " +
                  (choice === "panic" ? "border-white/30 bg-white/10" : "border-white/10 bg-black/20 hover:border-white/20")
                }
              >
                <div className="text-sm font-semibold text-white/90">Panic & stop</div>
                <div className="mt-1 text-[11px] text-white/65">You pause/stop when it gets scary.</div>
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[11px] text-white/65">
              You’ll see results immediately, then you can explore “what-if” choices.
            </div>
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              props.onClose();
            }}
          >
            Skip
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)));
              }}
              disabled={step === 1}
            >
              Back
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => {
                  setStep((s) => ((s + 1) as 1 | 2 | 3));
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => {
                  props.onComplete({ monthlyAmount, crashPreset, avatar, choice });
                }}
              >
                Show my results
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

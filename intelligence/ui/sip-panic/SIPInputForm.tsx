"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export interface SIPInputs {
  monthlyAmount: number;
  durationYears: number;
}

export function SIPInputForm(props: {
  value: SIPInputs;
  onChange: (next: SIPInputs) => void;
  onRun: () => void;
  disabled?: boolean;
}) {
  const { value, onChange, onRun, disabled = false } = props;

  const [touched, setTouched] = useState<{ amount: boolean; years: boolean }>({
    amount: false,
    years: false,
  });

  const [errors, setErrors] = useState<{ amount: string; duration: string }>({ amount: "", duration: "" });

  const validation = useMemo(() => {
    const amountOk = Number.isFinite(value.monthlyAmount) && value.monthlyAmount >= 1_000 && value.monthlyAmount <= 5_00_000;
    const yearsOk = Number.isFinite(value.durationYears) && value.durationYears >= 1 && value.durationYears <= 30;
    return {
      amountOk,
      yearsOk,
      ok: amountOk && yearsOk,
    };
  }, [value.durationYears, value.monthlyAmount]);

  const validateAmount = (nextAmount: number) => {
    if (!Number.isFinite(nextAmount)) {
      setErrors((e) => ({ ...e, amount: "❌ Enter a valid number" }));
      return false;
    }
    if (nextAmount < 1_000) {
      setErrors((e) => ({ ...e, amount: "❌ Minimum SIP amount is ₹1,000" }));
      return false;
    }
    if (nextAmount > 5_00_000) {
      setErrors((e) => ({ ...e, amount: "❌ Maximum SIP amount is ₹5,00,000. Contact us for larger amounts." }));
      return false;
    }
    setErrors((e) => ({ ...e, amount: "" }));
    return true;
  };

  const validateDuration = (nextYears: number) => {
    if (!Number.isFinite(nextYears)) {
      setErrors((e) => ({ ...e, duration: "❌ Enter a valid number" }));
      return false;
    }
    if (nextYears < 1) {
      setErrors((e) => ({ ...e, duration: "❌ Minimum investment duration is 1 year" }));
      return false;
    }
    if (nextYears > 30) {
      setErrors((e) => ({ ...e, duration: "❌ Maximum duration is 30 years for this simulator" }));
      return false;
    }
    if (nextYears < 3) {
      setErrors((e) => ({ ...e, duration: "⚠️ Results are most educational for 3+ year horizons" }));
      return true;
    }
    setErrors((e) => ({ ...e, duration: "" }));
    return true;
  };

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold gold-gradient-text-static">Inputs</h2>
          <p className="mt-1 text-sm text-white/85">
            ⚡ <span className="font-semibold text-white/90">Live Preview</span>: Results update as you adjust inputs.
            <br />
            💾 <span className="font-semibold text-white/90">Create Shareable Link</span>: Click RUN (SAVE &amp; SHARE) to generate a URL you can send to friends/advisor.
          </p>
        </div>
        <Button
          onClick={onRun}
          disabled={disabled || !validation.ok}
          aria-label="Run Simulation"
          className="calculator-premium-cta w-full"
        >
          Run (Save & Share)
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white/90">Monthly SIP (₹)</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={1000}
            max={500000}
            step={500}
            value={Number.isFinite(value.monthlyAmount) ? value.monthlyAmount : ""}
            onChange={(e) => {
              setTouched((t) => ({ ...t, amount: true }));
              const n = Number(e.target.value);
              const next = Number.isFinite(n) ? n : 0;
              onChange({ ...value, monthlyAmount: next });
              validateAmount(next);
            }}
            className="mt-2 no-spinner bg-black/25 border-white/12 text-white placeholder:text-white/45"
            placeholder="10000"
          />
          {touched.amount && errors.amount ? (
            <p className="mt-2 text-xs text-[color:var(--lux-foreground-60)]">{errors.amount}</p>
          ) : (
            <p className="mt-2 text-xs text-white/70">Tip: ₹10,000/month for 10 years matches the Step 2 baseline.</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-white/90">Duration (years)</Label>
            <div className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/80 tabular-nums">
              {Math.max(1, Math.min(30, Math.round(Number.isFinite(value.durationYears) ? value.durationYears : 10)))}y
            </div>
          </div>

          <div className="mt-2">
            <Slider
              data-testid="duration-years-slider"
              min={1}
              max={30}
              step={1}
              value={[Math.max(1, Math.min(30, Math.round(Number.isFinite(value.durationYears) ? value.durationYears : 10)))]}
              onValueChange={(arr) => {
                const next = Number(arr?.[0] ?? 0);
                setTouched((t) => ({ ...t, years: true }));
                onChange({ ...value, durationYears: next });
                validateDuration(next);
              }}
              trackClassName="bg-white/10"
              rangeClassName="bg-[oklch(0.78_0.08_65)]"
              thumbClassName="border-[oklch(0.78_0.08_65)] bg-black"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/55">
              <span>1y</span>
              <span>30y</span>
            </div>
          </div>

          {touched.years && errors.duration ? (
            <p
              className={`mt-2 text-xs ${
                errors.duration.includes("⚠️")
                  ? "text-[color:var(--lux-accent)]"
                  : "text-[color:var(--lux-foreground-60)]"
              }`}
            >
              {errors.duration}
            </p>
          ) : (
            <p className="mt-2 text-xs text-white/70">Uses monthly compounding with a designed crash + recovery.</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-white/70">
        Education-only simulator. Not investment advice.
      </p>
    </div>
  );
}

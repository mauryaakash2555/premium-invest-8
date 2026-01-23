"use client";

import { useEffect, useMemo, useState } from "react";

import type { SIPScenario } from "@/intelligence/simulations/sip-vs-panic";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLang } from "./LangContext";

const TooltipContentAny = TooltipContent as any;

export type ScenarioKey = "discipline" | "panic20" | "panic40" | "stopAnyFall" | "custom";

export interface ScenarioSelectionState {
  enabled: Record<ScenarioKey, boolean>;
  custom: {
    panicThresholdPct: number; // e.g. 30 means -30%
    stopDurationMonths: number;
  };
}

export function buildScenariosFromSelection(selection: ScenarioSelectionState): SIPScenario[] {
  const scenarios: SIPScenario[] = [];

  // Discipline baseline (always included; needed for behavioral cost).
  scenarios.push({
    name: "Perfect Discipline",
    description: "Never stops SIP, regardless of market conditions",
    behaviorType: "discipline",
  });

  if (selection.enabled.panic20) {
    scenarios.push({
      name: "Stop SIP at 20% Drawdown",
      description: "Stops equity SIP when market falls 20% from peak, redirects future saving",
      behaviorType: "panic",
      panicThreshold: -20,
    });
  }

  if (selection.enabled.panic40) {
    scenarios.push({
      name: "Stop SIP at 40% Drawdown",
      description: "Stops equity SIP when market falls 40% from peak, redirects future saving",
      behaviorType: "panic",
      panicThreshold: -40,
    });
  }

  if (selection.enabled.stopAnyFall) {
    scenarios.push({
      name: "Stop During Any Fall",
      description: "Pauses SIP during any negative month, resumes when positive",
      behaviorType: "panic",
      panicThreshold: -1,
    });
  }

  if (selection.enabled.custom) {
    const th = Math.max(5, Math.min(60, Math.round(selection.custom.panicThresholdPct)));
    const stop = Math.max(1, Math.min(24, Math.round(selection.custom.stopDurationMonths)));

    scenarios.push({
      name: `Stop SIP at ${th}% Drawdown (resume after ${stop} months)`,
      description: `Stops equity SIP when market falls ${th}% from peak, then auto-resumes after ${stop} months`,
      behaviorType: "custom",
      panicThreshold: -th,
      stopDuration: stop,
    });
  }

  return scenarios;
}

export function ScenarioSelector(props: {
  value: ScenarioSelectionState;
  onChange: (next: ScenarioSelectionState) => void;
}) {
  const { value, onChange } = props;
  const { t } = useLang();

  const [showMore, setShowMore] = useState<boolean>(() => {
    return Boolean(value.enabled.panic40 || value.enabled.stopAnyFall);
  });

  const [showCustomBuilder, setShowCustomBuilder] = useState<boolean>(() => {
    return Boolean(value.enabled.custom);
  });

  useEffect(() => {
    // If an advanced option becomes enabled (e.g., via external state), ensure it's visible.
    if (value.enabled.panic40 || value.enabled.stopAnyFall) setShowMore(true);
  }, [value.enabled.panic40, value.enabled.stopAnyFall]);

  useEffect(() => {
    // Keep builder visible if custom gets enabled externally.
    if (value.enabled.custom) setShowCustomBuilder(true);
  }, [value.enabled.custom]);

  const rows = useMemo(
    () =>
      [
        {
          key: "discipline" as const,
          title: "Perfect Discipline",
          subtitle: "Never stops SIP — baseline for behavioral cost",
          locked: true,
        },
        {
          key: "panic20" as const,
          title: "Stop SIP at 20% Drawdown",
          subtitle: "Stops SIP contributions once market is down 20% from peak",
        },
        {
          key: "panic40" as const,
          title: "Stop SIP at 40% Drawdown",
          subtitle: "Stops SIP contributions once market is down 40% from peak",
          advanced: true,
        },
        {
          key: "stopAnyFall" as const,
          title: "Pause SIP in Negative Return Months",
          subtitle: "Pauses SIP in negative months, resumes in positive months",
          advanced: true,
        },
        {
          key: "custom" as const,
          title: "Custom Behavior",
          subtitle: "User-defined threshold + auto-resume",
        },
      ] as const,
    [value.custom.panicThresholdPct, value.custom.stopDurationMonths]
  );

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <h2 className="text-base font-semibold gold-gradient-text">{t("scenario.title")}</h2>
      <p className="mt-1 text-sm text-white/85">{t("scenario.subtitle")}</p>

      <div className="mt-5 space-y-4">
        {rows.map((row) => {
          if ((row as any).advanced && !showMore) return null;

          const locked = "locked" in row && Boolean(row.locked);
          const checked = locked ? true : value.enabled[row.key];
          const isCustom = row.key === "custom";
          const th = Math.max(5, Math.min(60, Math.round(value.custom.panicThresholdPct || 30)));
          const stop = Math.max(1, Math.min(24, Math.round(value.custom.stopDurationMonths || 6)));
          const title = isCustom ? `Stop SIP at ${th}% Drawdown` : row.title;
          const subtitle = isCustom
            ? `Stops equity SIP when market falls ${th}% from peak, then auto-resumes after ${stop} months.`
            : row.subtitle;

          return (
            <div key={row.key} className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                disabled={locked}
                onCheckedChange={(v) => {
                  const next = { ...value, enabled: { ...value.enabled } };
                  next.enabled[row.key] = Boolean(v);
                  if (row.key === "custom" && Boolean(v)) setShowCustomBuilder(true);
                  onChange(next);
                }}
                className="mt-1 border-white/25 bg-black/20 data-[state=checked]:bg-[oklch(0.78_0.08_65)] data-[state=checked]:text-black data-[state=checked]:border-[oklch(0.78_0.08_65)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  {locked ? (
                    <span className="text-[11px] text-white/50">Required</span>
                  ) : row.key === "custom" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomBuilder((v) => !v);
                        if (!value.enabled.custom) {
                          onChange({
                            ...value,
                            enabled: { ...value.enabled, custom: true },
                            custom: {
                              ...value.custom,
                              panicThresholdPct: Math.max(5, Math.min(60, Math.round(value.custom.panicThresholdPct || 30))),
                              stopDurationMonths: Math.max(1, Math.min(24, Math.round(value.custom.stopDurationMonths || 6))),
                            },
                          });
                        }
                      }}
                      className="min-h-11 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:border-white/15"
                    >
                      {showCustomBuilder ? "✕ Hide" : "⚙️ Configure"}
                    </button>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-white/75">{subtitle}</p>

                {row.key === "custom" && checked && showCustomBuilder ? (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/85 text-xs">Panic threshold (% fall)</Label>
                      <div className="mt-2">
                        <Slider
                          min={5}
                          max={60}
                          step={1}
                          value={[Math.max(5, Math.min(60, Math.round(value.custom.panicThresholdPct || 30)))]}
                          onValueChange={(arr) => {
                            const n = Number(arr?.[0] ?? 30);
                            onChange({
                              ...value,
                              custom: { ...value.custom, panicThresholdPct: Number.isFinite(n) ? n : 30 },
                            });
                          }}
                          trackClassName="bg-white/10"
                          rangeClassName="bg-[oklch(0.78_0.08_65)]"
                          thumbClassName="border-[oklch(0.78_0.08_65)] bg-black"
                        />
                        <div className="mt-1 text-[11px] text-white/60 tabular-nums">{Math.round(value.custom.panicThresholdPct)}%</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/85 text-xs">Auto-resume after (months)</Label>
                      <div className="mt-2">
                        <Slider
                          min={1}
                          max={24}
                          step={1}
                          value={[Math.max(1, Math.min(24, Math.round(value.custom.stopDurationMonths || 6)))]}
                          onValueChange={(arr) => {
                            const n = Number(arr?.[0] ?? 6);
                            onChange({
                              ...value,
                              custom: { ...value.custom, stopDurationMonths: Number.isFinite(n) ? n : 6 },
                            });
                          }}
                          trackClassName="bg-white/10"
                          rangeClassName="bg-[oklch(0.78_0.08_65)]"
                          thumbClassName="border-[oklch(0.78_0.08_65)] bg-black"
                        />
                        <div className="mt-1 text-[11px] text-white/60 tabular-nums">{Math.round(value.custom.stopDurationMonths)} months</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    setShowMore(true);
                    onChange({
                      ...value,
                      enabled: { ...value.enabled, custom: true },
                      custom: {
                        ...value.custom,
                        panicThresholdPct: Math.max(5, Math.min(60, Math.round(value.custom.panicThresholdPct || 30))),
                        stopDurationMonths: Math.max(1, Math.min(24, Math.round(value.custom.stopDurationMonths || 6))),
                      },
                    });
                  }}
                  className="w-full min-h-11 rounded-xl border border-dashed border-white/20 bg-white/10 px-4 py-3 text-xs text-white hover:border-white/30"
                >
                  {t("scenario.createCustom")}
                </button>
              </TooltipTrigger>
              <TooltipContentAny side="top" className="max-w-[260px] border border-white/10 bg-black/90 text-white/90">
                <div className="text-[11px] text-white/80 leading-snug">{t("scenario.customTooltip")}</div>
              </TooltipContentAny>
            </Tooltip>
          </TooltipProvider>
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="w-full min-h-11 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/80 hover:border-white/15"
          >
            {showMore ? t("scenario.hideMore") : t("scenario.more")}
          </button>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-white/70">
        Panic scenarios model “stopping equity SIP” (savings may shift to low-risk instruments). This is educational consequence modeling.
      </p>
    </div>
  );
}

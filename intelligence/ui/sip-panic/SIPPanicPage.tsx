"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { MarketConditions, SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";
import { simulateSIPVsPanic } from "@/intelligence/simulations/sip-vs-panic";
import { trackEvent } from "@/lib/analytics";
import BackRow from "@/components/shared/BackRow";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { SIPInputForm } from "./SIPInputForm";
import { ScenarioSelector, buildScenariosFromSelection, type ScenarioKey, type ScenarioSelectionState } from "./ScenarioSelector";
import { ResultsDashboard } from "./ResultsDashboard";
import { TimelineChart } from "./TimelineChart";
import { CalculationDetails } from "./CalculationDetails";
import { DrawdownPainChart } from "./DrawdownPainChart";
import { LearningBubble } from "./LearningBubble";
import { SocialProofBanner } from "./SocialProofBanner";
import { RegretCalculator } from "./RegretCalculator";
import { QuizModal } from "./QuizModal";
import { MissedRecoveryAnimation } from "./MissedRecoveryAnimation";
import { downloadPremiumReport } from "./premiumReport";
import { ComplianceBanner } from "./ComplianceBanner";
import { TaxCalculationMode, type TaxCalculationModeKey } from "./TaxCalculationMode";
import { LakhTooltip, formatLakhsInlineText } from "./LakhTooltip";
import { LangProvider } from "./LangContext";
import { LanguageToggle } from "./LanguageToggle";
import { ModeToggle, type SIPUiMode } from "./ModeToggle";
import { BeginnerModeView } from "./BeginnerModeView";
import type { Lang } from "./i18n";
import { isLang, t as tStatic, type TranslationKey } from "./i18n";

const CALCULATOR_TYPE = "sip_vs_panic_selling";
const LEARNING_BUBBLES_KEY = "bm.sipPanicSelling.hideLearningBubbles";
const TAX_PROFILE_KEY = "bm.sipPanicSelling.taxProfile";
const TAX_CALC_MODE_KEY = "bm.sipPanicSelling.taxCalcMode";
const LANG_KEY = "bm.sipPanicSelling.lang";
const INVESTMENT_TYPE_KEY = "bm.sipPanicSelling.investmentType";
const QUIZ_PROFILE_KEY = "bm.sipPanicSelling.quizProfileV1";
const UI_MODE_KEY = "bm.sipPanicSelling.uiMode";

const TooltipContentAny: any = TooltipContent;

type TaxProfileKey = "lt50l" | "50l_1cr" | "1cr_2cr" | "2cr_5cr" | "5cr_plus";

const TAX_PROFILES: Array<{ k: TaxProfileKey; label: string; surchargeRate: number }> = [
  { k: "lt50l", label: "Below ₹50 lakh (₹50,00,000) — no surcharge", surchargeRate: 0 },
  { k: "50l_1cr", label: "₹50 lakh–₹1 crore (₹50,00,000–₹1,00,00,000) — 10% surcharge", surchargeRate: 0.1 },
  { k: "1cr_2cr", label: "₹1 crore–₹2 crore (₹1,00,00,000–₹2,00,00,000) — 15% surcharge", surchargeRate: 0.15 },
  { k: "2cr_5cr", label: "₹2 crore–₹5 crore (₹2,00,00,000–₹5,00,00,000) — 25% surcharge", surchargeRate: 0.25 },
  { k: "5cr_plus", label: "₹5 crore+ (₹5,00,00,000+) — 37% surcharge", surchargeRate: 0.37 },
];

function formatInr(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

function formatInrLakhs(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  const short = `₹${(v / 100_000).toFixed(2)}L`;
  return `${short} (${formatInr(v)})`;
}

function safeTaxCalcMode(v: string | null): TaxCalculationModeKey | null {
  if (v === "conservative_stcg_30" || v === "optimized_ltcg_indexation_20") return v;
  return null;
}

function safeCrashPreset(v: string | null): "default" | "2008" | "2020" | "2022" | null {
  if (v === "default" || v === "2008" || v === "2020" || v === "2022") return v;
  return null;
}

function safeRiskComfort(v: string | null): "conservative" | "moderate" | "aggressive" | null {
  if (v === "conservative" || v === "moderate" || v === "aggressive") return v;
  return null;
}

function safeScenarioKey(v: string | null): ScenarioKey | null {
  if (v === "discipline" || v === "panic20" || v === "panic40" || v === "stopAnyFall" || v === "custom") return v;
  return null;
}

function safeLang(v: string | null): Lang | null {
  return isLang(v) ? v : null;
}

function safeUiMode(v: string | null): SIPUiMode | null {
  if (v === "beginner" || v === "advanced") return v;
  return null;
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function getScenarioKeyFromRow(row: SIPSimulationResult | null): ScenarioKey {
  if (!row) return "discipline";
  if (row.scenario.behaviorType === "discipline") return "discipline";
  if (row.scenario.behaviorType === "custom") return "custom";
  if (row.scenario.behaviorType === "panic" && row.scenario.panicThreshold === -40) return "panic40";
  if (row.scenario.behaviorType === "panic" && row.scenario.panicThreshold === -20) return "panic20";
  if (row.scenario.behaviorType === "panic" && row.scenario.panicThreshold === -1) return "stopAnyFall";
  return "discipline";
}

function formatPct(p: number): string {
  if (!Number.isFinite(p)) return "0.0%";
  return `${p.toFixed(1)}%`;
}

function getTaxProfileLabel(key: string): string {
  return TAX_PROFILES.find((p) => p.k === key)?.label ?? String(key);
}

function buildMarketConditionsForPreset(preset: "default" | "2008" | "2020" | "2022"): MarketConditions {
  if (preset === "2008") {
    return {
      crashDepthPct: -60,
      crashStartMonth: 6,
      crashDurationMonths: 14,
      recoveryGainPct: 110,
      recoveryDurationMonths: 24,
      secondaryCorrectionDepthPct: -18,
      secondaryCorrectionDurationMonths: 6,
      secondaryCorrectionStartMonth: 60,
      forceScenario: true,
    };
  }
  if (preset === "2020") {
    return {
      crashDepthPct: -40,
      crashStartMonth: 2,
      crashDurationMonths: 2,
      recoveryGainPct: 55,
      recoveryDurationMonths: 6,
      secondaryCorrectionDepthPct: -18,
      secondaryCorrectionDurationMonths: 4,
      secondaryCorrectionStartMonth: 42,
      forceScenario: true,
    };
  }
  if (preset === "2022") {
    return {
      crashDepthPct: -18,
      crashStartMonth: 10,
      crashDurationMonths: 8,
      recoveryGainPct: 22,
      recoveryDurationMonths: 4,
      secondaryCorrectionDepthPct: -12,
      secondaryCorrectionDurationMonths: 4,
      secondaryCorrectionStartMonth: 54,
      forceScenario: true,
    };
  }
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

export default function SIPPanicPage(props?: {
  embed?: boolean;
  partner?: string;
  faqs?: Array<{ q: string; a: string }>;
}) {
  const searchParams = useSearchParams();
  const qsEmbed = searchParams?.get("embed") === "1";
  const qsPartner = searchParams?.get("partner") || "";
  const qsMode = searchParams?.get("mode") || "";
  const qsUi = searchParams?.get("ui") || "";
  const qsHideDisclaimer = searchParams?.get("hideDisclaimer") === "1";
  const qsCta = searchParams?.get("cta") === "1";
  const qsCtaText = searchParams?.get("ctaText") || "";
  const qsCtaUrl = searchParams?.get("ctaUrl") || "";

  const embed = props?.embed ?? qsEmbed;
  const partner = props?.partner ?? qsPartner;
  const faqs = props?.faqs ?? [];
  const hideDisclaimer = embed ? qsHideDisclaimer : false;
  const showCta = embed ? qsCta : false;
  const ctaText = (qsCtaText || "Book a call") as string;
  const ctaUrl = (qsCtaUrl || "https://bmwealth.co.in/contact") as string;

  const [inputs, setInputs] = useState({ monthlyAmount: 10_000, durationYears: 10 });

  const [uiMode, setUiMode] = useState<SIPUiMode>("beginner");

  const [riskComfort, setRiskComfort] = useState<"conservative" | "moderate" | "aggressive">("moderate");

  const [taxProfile, setTaxProfile] = useState<TaxProfileKey>("lt50l");

  const [taxCalcMode, setTaxCalcMode] = useState<TaxCalculationModeKey>("conservative_stcg_30");

  const [investmentType, setInvestmentType] = useState<"equity_mf" | "stocks">("equity_mf");

  const [lang, setLang] = useState<Lang>("en");

  const [learningBubblesDisabled, setLearningBubblesDisabled] = useState(false);
  const hasTrackedStart = useRef(false);
  const hasAppliedShareParams = useRef(false);

  const [selection, setSelection] = useState<ScenarioSelectionState>({
    enabled: {
      discipline: true,
      panic20: true,
      panic40: false,
      stopAnyFall: false,
      custom: true,
    },
    custom: {
      panicThresholdPct: 30,
      stopDurationMonths: 6,
    },
  });

  const scenarios = useMemo(() => buildScenariosFromSelection(selection), [selection]);

  const [results, setResults] = useState<SIPSimulationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [crashPreset, setCrashPreset] = useState<"default" | "2008" | "2020" | "2022">("default");

  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizProfileLabel, setQuizProfileLabel] = useState<string>("");

  useEffect(() => {
    // Initialize language from query string (share) or localStorage.
    try {
      const qsLang = safeLang(searchParams?.get("lang") ?? null);
      if (qsLang) {
        setLang(qsLang);
        window.localStorage.setItem(LANG_KEY, qsLang);
        return;
      }

      const stored = safeLang(window.localStorage.getItem(LANG_KEY));
      if (stored) setLang(stored);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(QUIZ_PROFILE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const label = typeof parsed?.label === "string" ? parsed.label : "";
      if (label) setQuizProfileLabel(label);
    } catch {
      // ignore
    }
  }, []);

  const onLangChange = (next: Lang) => {
    setLang(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
      const p = new URLSearchParams(window.location.search);
      p.set("lang", next);
      window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
    } catch {
      // ignore
    }
  };

  const t = (key: TranslationKey, vars?: Record<string, string | number>) => tStatic(lang, key, vars);

  const marketConditions: MarketConditions = useMemo(() => {
    return buildMarketConditionsForPreset(crashPreset);
  }, [crashPreset]);

  const marketAssumptions = useMemo(() => {
    const y = Math.max(0, Math.floor(inputs.durationYears));
    if (y <= 2) {
      return {
        title: "Short horizon scenario",
        lines: [
          "Stable growth only (no Year-3 crash)",
          "Crash occurs after your investment ends",
          "Designed for a short educational view",
        ],
        note: "Behavioral crash lessons need longer horizons; this run focuses on steady compounding.",
      };
    }
    if (y === 3) {
      return {
        title: "3-year scenario",
        lines: [
          "Crash begins around Month 30 (late Year 3)",
          "Crash + recovery are compressed to fit the window",
          "Designed to show the panic trigger near the end",
        ],
        note: "Education-only path: the simulator injects a late crash so you can see what panic does, even in a short window.",
      };
    }
    if (y <= 5) {
      return {
        title: "Medium horizon scenario",
        lines: ["Includes one small correction (~15%) mid-way", "Then a recovery phase"],
        note: "Designed teaching moments, not forecasts.",
      };
    }
    if (y <= 9) {
      return {
        title: "Long horizon scenario",
        lines: ["Includes one medium crash (~25%)", "Then a recovery phase"],
        note: "Designed teaching moments, not forecasts.",
      };
    }
    return {
      title: "Very long horizon scenario",
      lines: ["Crash: -35% over ~6 months (Year 3)", "Recovery: +45% over ~12 months", "Secondary correction: -20% over ~3 months (Year 7)"],
      note: "These are designed teaching moments, not forecasts.",
    };
  }, [inputs.durationYears]);

  const chartData = results[0]?.chartData ?? [];

  const discipline = useMemo(
    () => results.find((r) => r.scenario.behaviorType === "discipline") ?? null,
    [results]
  );

  const worst = useMemo(() => {
    const candidates = results.filter((r) => r.scenario.behaviorType !== "discipline");
    if (!candidates.length) return null;
    return candidates.reduce((best, cur) => (cur.behavioralCost > best.behavioralCost ? cur : best), candidates[0]);
  }, [results]);

  const estimatedBaseGainsTax = discipline?.taxBreakdown?.baseTax ?? 0;
  const cessRate = 0.04;
  const estimateSurchargeImpact = (surchargeRate: number): number => {
    const r = Number.isFinite(surchargeRate) ? Math.max(0, surchargeRate) : 0;
    const base = Number.isFinite(estimatedBaseGainsTax) ? Math.max(0, estimatedBaseGainsTax) : 0;
    // Approx incremental tax from surcharge (and cess applied on surcharge too).
    return Math.round(base * r * (1 + cessRate));
  };

  useEffect(() => {
    trackEvent("calculator_view", {
      calculator_type: CALCULATOR_TYPE,
      page_path: "/intelligence/sip-vs-panic",
      embed,
      partner,
    });
  }, []);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(LEARNING_BUBBLES_KEY);
      setLearningBubblesDisabled(v === "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(TAX_PROFILE_KEY) as TaxProfileKey | null;
      if (v && TAX_PROFILES.some((p) => p.k === v)) setTaxProfile(v);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const v = safeTaxCalcMode(window.localStorage.getItem(TAX_CALC_MODE_KEY));
      if (v) setTaxCalcMode(v);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(INVESTMENT_TYPE_KEY);
      if (v === "equity_mf" || v === "stocks") setInvestmentType(v);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const fromQuery = safeUiMode((qsMode || qsUi || "").toLowerCase());
    if (fromQuery) {
      setUiMode(fromQuery);
      return;
    }

    try {
      const saved = safeUiMode(window.localStorage.getItem(UI_MODE_KEY));
      if (saved) setUiMode(saved);
    } catch {
      // ignore
    }
  }, [qsMode, qsUi]);

  const onUiModeChange = (next: SIPUiMode) => {
    setUiMode(next);
    try {
      window.localStorage.setItem(UI_MODE_KEY, next);
    } catch {
      // ignore
    }
  };

  const onInvestmentTypeChange = (next: "equity_mf" | "stocks") => {
    setInvestmentType(next);
    try {
      window.localStorage.setItem(INVESTMENT_TYPE_KEY, next);
      const p = new URLSearchParams(window.location.search);
      p.set("inv", next);
      window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
    } catch {
      // ignore
    }
  };

  const taxConfig = useMemo(() => {
    const profile = TAX_PROFILES.find((p) => p.k === taxProfile) ?? TAX_PROFILES[0];
    return {
      applyCess: true,
      cessRate: 0.04,
      applySurcharge: profile.surchargeRate > 0,
      surchargeRate: profile.surchargeRate,
    };
  }, [taxProfile]);

  const compute = (opts?: { track?: boolean }) => {
    const out = simulateSIPVsPanic(inputs.monthlyAmount, inputs.durationYears, scenarios, marketConditions, {
      afterStopMode: "cash",
      riskComfort,
      tax: taxConfig,
      taxCalculationMode: taxCalcMode,
      investmentType,
    });
    setResults(out);

    if (!opts?.track) return;

    // Social-proof tracking: worst-case selected behavior.
    const disciplineRow = out.find((r) => r.scenario.behaviorType === "discipline") ?? null;
    const worstRow = out
      .filter((r) => r.scenario.behaviorType !== "discipline")
      .reduce<SIPSimulationResult | null>((best, cur) => {
        if (!best) return cur;
        return cur.behavioralCost > best.behavioralCost ? cur : best;
      }, null);

    const scenarioKey = worstRow ? getScenarioKeyFromRow(worstRow) : disciplineRow ? "discipline" : "";

    void fetch("/api/intelligence/sip-vs-panic/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenario_key: scenarioKey,
        panic_threshold_pct: worstRow?.scenario.behaviorType === "custom" ? selection.custom.panicThresholdPct : null,
        behavioral_cost: worstRow?.behavioralCost ?? 0,
        monthly_amount: inputs.monthlyAmount,
        duration_years: inputs.durationYears,
        tax_profile: taxProfile,
        tax_calc_mode: taxCalcMode,
        investment_type: investmentType,
        risk_comfort: riskComfort,
        crash_preset: crashPreset,
        embed,
        partner,
      }),
    }).catch(() => undefined);

    trackEvent("calculator_calculate", {
      calculator_type: CALCULATOR_TYPE,
      monthly_amount: inputs.monthlyAmount,
      duration_years: inputs.durationYears,
      risk_comfort: riskComfort,
      tax_profile: taxProfile,
      tax_calc_mode: taxCalcMode,
      investment_type: investmentType,
      scenarios_count: scenarios.length,
      crash_preset: crashPreset,
      embed,
      partner,
    });

    return out;
  };

  const buildShareParams = (out: SIPSimulationResult[]) => {
    const disciplineRow = out.find((r) => r.scenario.behaviorType === "discipline") ?? null;
    const worstRow = out
      .filter((r) => r.scenario.behaviorType !== "discipline")
      .reduce<SIPSimulationResult | null>((best, cur) => {
        if (!best) return cur;
        return cur.behavioralCost > best.behavioralCost ? cur : best;
      }, null);

    const cost = worstRow?.behavioralCost ?? 0;
    const disciplineAmt = disciplineRow?.postTaxCorpus ?? 0;
    const worstAmt = worstRow?.postTaxCorpus ?? 0;
    const focus = getScenarioKeyFromRow(worstRow);

    const enabledKeys = (Object.keys(selection.enabled) as ScenarioKey[]).filter((k) => selection.enabled[k]);

    const p = new URLSearchParams();
    p.set("share", "1");
    p.set("m", String(inputs.monthlyAmount));
    p.set("y", String(inputs.durationYears));
    p.set("tax", String(taxProfile));
    p.set("tcm", String(taxCalcMode));
    p.set("inv", String(investmentType));
    p.set("rc", String(riskComfort));
    p.set("crash", String(crashPreset));
    p.set("en", enabledKeys.join(","));
    p.set("focus", focus);
    p.set("cost", String(Math.round(cost)));
    p.set("disc", String(Math.round(disciplineAmt)));
    p.set("panic", String(Math.round(worstAmt)));
    p.set("lang", String(lang));

    if (selection.enabled.custom) {
      p.set("pt", String(clampInt(selection.custom.panicThresholdPct, 5, 60)));
      p.set("sd", String(clampInt(selection.custom.stopDurationMonths, 1, 24)));
    }

    const th = worstRow?.scenario?.panicThreshold;
    if (typeof th === "number") {
      if (th === -1) p.set("pth", "any");
      else if (th < 0) p.set("pth", String(Math.abs(th)));
    }

    return { params: p, focus, disciplineRow, worstRow };
  };

  const run = () => {
    try {
      setError(null);
      const out = compute({ track: true });

      // Update URL so "Copy link" reflects the current run.
      if (typeof window !== "undefined" && Array.isArray(out)) {
        const next = new URLSearchParams(window.location.search);
        const built = buildShareParams(out);
        for (const [k, v] of built.params.entries()) next.set(k, v);
        window.history.replaceState(null, "", `${window.location.pathname}?${next.toString()}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to run simulation";
      setError(msg);
    }
  };

  useEffect(() => {
    if (!searchParams || hasAppliedShareParams.current) return;
    if (searchParams.get("share") !== "1") return;
    hasAppliedShareParams.current = true;

    const nextLang = safeLang(searchParams.get("lang"));
    if (nextLang) setLang(nextLang);

    const mRaw = Number(searchParams.get("m"));
    const yRaw = Number(searchParams.get("y"));
    const m = clampInt(mRaw, 1_000, 5_00_000);
    const y = clampInt(yRaw, 1, 30);

    setInputs({ monthlyAmount: m, durationYears: y });

    const nextTax = searchParams.get("tax") as TaxProfileKey | null;
    if (nextTax && TAX_PROFILES.some((p) => p.k === nextTax)) setTaxProfile(nextTax);

    const nextTcm = safeTaxCalcMode(searchParams.get("tcm"));
    if (nextTcm) setTaxCalcMode(nextTcm);

    const nextInv = searchParams.get("inv");
    if (nextInv === "equity_mf" || nextInv === "stocks") setInvestmentType(nextInv);

    const nextRc = safeRiskComfort(searchParams.get("rc"));
    if (nextRc) setRiskComfort(nextRc);

    const nextCrash = safeCrashPreset(searchParams.get("crash"));
    if (nextCrash) setCrashPreset(nextCrash);

    const enabledCsv = searchParams.get("en");
    const focus = safeScenarioKey(searchParams.get("focus"));
    const ptRaw = Number(searchParams.get("pt"));
    const sdRaw = Number(searchParams.get("sd"));

    setSelection((prev) => {
      const next: ScenarioSelectionState = {
        ...prev,
        enabled: { ...prev.enabled },
        custom: { ...prev.custom },
      };

      if (enabledCsv) {
        const enabledSet = new Set(
          enabledCsv
            .split(",")
            .map((s) => safeScenarioKey(s.trim()))
            .filter(Boolean) as ScenarioKey[]
        );

        (Object.keys(next.enabled) as ScenarioKey[]).forEach((k) => {
          if (k === "discipline") next.enabled[k] = true;
          else next.enabled[k] = enabledSet.has(k);
        });
      }

      if (focus && focus !== "discipline") next.enabled[focus] = true;

      if (Number.isFinite(ptRaw)) next.custom.panicThresholdPct = clampInt(ptRaw, 5, 60);
      if (Number.isFinite(sdRaw)) next.custom.stopDurationMonths = clampInt(sdRaw, 1, 24);

      return next;
    });
  }, [searchParams]);

  useEffect(() => {
    // Real-time impact calculator: update results as inputs change (no tracking).
    // Keep explicit "Run" for analytics + share-state.
    const handle = window.setTimeout(() => {
      try {
        compute({ track: false });
      } catch {
        // ignore
      }
    }, 220);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.monthlyAmount, inputs.durationYears, riskComfort, taxProfile, selection]);

  useEffect(() => {
    // Keep results in sync when tax calc mode changes (no tracking).
    try {
      compute({ track: false });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxCalcMode]);

  useEffect(() => {
    // Precompute default view so the page isn't empty on first paint.
    // Intentionally does not fire "calculator_calculate" analytics.
    try {
      compute({ track: false });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Update the visuals instantly when a crash preset changes (no tracking).
    try {
      compute({ track: false });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crashPreset]);

  const shareToWhatsApp = () => {
    try {
      const out = results;
      const { params, worstRow } = buildShareParams(out);
      const canonical = `${window.location.origin}/intelligence/sip-vs-panic`;
      const shareUrl = `${canonical}?${params.toString()}`;

      const cost = worstRow?.behavioralCost ?? 0;
      const disciplineAmt = out.find((r) => r.scenario.behaviorType === "discipline")?.postTaxCorpus ?? 0;
      const worstAmt = worstRow?.postTaxCorpus ?? 0;
      const costPct = disciplineAmt > 0 ? Math.round((cost / disciplineAmt) * 100) : 0;

      const worstName = worstRow?.scenario.name ?? "Panic behavior";
      const th = worstRow?.scenario?.panicThreshold;
      const thresholdLine =
        typeof th === "number"
          ? th === -1
            ? "Panic rule: pause in any red month"
            : th < 0
              ? `Panic rule: stop at ${Math.abs(th)}% drawdown`
              : ""
          : "";

      const message =
        `🚨 If you stop SIP during crashes, you could lose ${formatInrLakhs(cost)}.\n\n` +
        `✅ Stay Disciplined: ${formatInrLakhs(disciplineAmt)}\n` +
        `❌ ${worstName}: ${formatInrLakhs(worstAmt)}\n` +
        (costPct > 0 ? `📉 That’s ~${costPct}% of your potential wealth.\n` : "") +
        (thresholdLine ? `ℹ️ ${thresholdLine}\n` : "") +
        `\nInputs: ₹${inputs.monthlyAmount.toLocaleString("en-IN")}/month • ${inputs.durationYears} years\n` +
        `Tax mode: ${taxCalcMode === "optimized_ltcg_indexation_20" ? t("taxMode.optimizedTitle") : t("taxMode.conservativeTitle")}\n\n` +
        `Try it: ${shareUrl}\n` +
        `Via BM Wealth Intelligence`;

      trackEvent("calculator_share", {
        calculator_type: CALCULATOR_TYPE,
        channel: "whatsapp",
        behavioral_cost: cost,
        tax_profile: taxProfile,
      });

      trackEvent("sip_whatsapp_shared", {
        calculator_type: CALCULATOR_TYPE,
        behavioral_cost: cost,
        panic_threshold: typeof th === "number" ? Math.abs(th) : undefined,
        sip_amount: inputs.monthlyAmount,
        duration_years: inputs.durationYears,
      });

      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  };

  const shareToEmail = () => {
    try {
      const out = results;
      const { params, worstRow } = buildShareParams(out);
      const canonical = `${window.location.origin}/intelligence/sip-vs-panic`;
      const shareUrl = `${canonical}?${params.toString()}`;

      const cost = worstRow?.behavioralCost ?? 0;
      const disciplineAmt = out.find((r) => r.scenario.behaviorType === "discipline")?.postTaxCorpus ?? 0;
      const worstAmt = worstRow?.postTaxCorpus ?? 0;
      const costPct = disciplineAmt > 0 ? Math.round((cost / disciplineAmt) * 100) : 0;

      const th = worstRow?.scenario?.panicThreshold;
      const thresholdLine =
        typeof th === "number"
          ? th === -1
            ? "Panic rule: pause in any red month"
            : th < 0
              ? `Panic rule: stop at ${Math.abs(th)}% drawdown`
              : ""
          : "";

      const subject = "My SIP vs Panic Selling Analysis";
      const body =
        `My SIP vs Panic analysis (education-only)\n\n` +
        `Inputs: ₹${inputs.monthlyAmount.toLocaleString("en-IN")}/month • ${inputs.durationYears} years\n` +
        `Tax mode: ${taxCalcMode === "optimized_ltcg_indexation_20" ? t("taxMode.optimizedTitle") : t("taxMode.conservativeTitle")}\n` +
        (thresholdLine ? `${thresholdLine}\n` : "") +
        `\nResults (after tax):\n` +
        `- Stay disciplined: ${formatInrLakhs(disciplineAmt)}\n` +
        `- Panic behavior: ${formatInrLakhs(worstAmt)}\n` +
        `- Behavioral cost: ${formatInrLakhs(cost)}${costPct > 0 ? ` (~${costPct}% of potential)` : ""}\n\n` +
        `Try the simulator: ${shareUrl}\n`;

      trackEvent("calculator_share", {
        calculator_type: CALCULATOR_TYPE,
        channel: "email",
        behavioral_cost: cost,
        tax_profile: taxProfile,
      });

      trackEvent("sip_email_shared", {
        calculator_type: CALCULATOR_TYPE,
        behavioral_cost: cost,
        sip_amount: inputs.monthlyAmount,
        duration_years: inputs.durationYears,
      });

      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch {
      // ignore
    }
  };

  const disableLearningBubbles = (disabled: boolean) => {
    setLearningBubblesDisabled(disabled);
    try {
      window.localStorage.setItem(LEARNING_BUBBLES_KEY, disabled ? "1" : "0");
    } catch {
      // ignore
    }
  };

  const onTaxProfileChange = (next: TaxProfileKey) => {
    setTaxProfile(next);
    try {
      window.localStorage.setItem(TAX_PROFILE_KEY, next);
    } catch {
      // ignore
    }
  };

  const onTaxCalcModeChange = (next: TaxCalculationModeKey) => {
    setTaxCalcMode(next);
    try {
      window.localStorage.setItem(TAX_CALC_MODE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <LangProvider value={{ lang, setLang: onLangChange }}>
      <QuizModal
        open={showQuiz}
        onClose={() => setShowQuiz(false)}
        onSubmit={(profile) => {
          try {
            window.localStorage.setItem(QUIZ_PROFILE_KEY, JSON.stringify(profile));
          } catch {
            // ignore
          }
          setQuizProfileLabel(profile.label);

          setRiskComfort(profile.riskComfort);
          setSelection((prev) => ({
            ...prev,
            enabled: {
              ...prev.enabled,
              custom: true,
              panic20: false,
              panic40: false,
              stopAnyFall: false,
            },
            custom: {
              ...prev.custom,
              panicThresholdPct: profile.thresholdPct,
            },
          }));
          setTimeout(() => run(), 0);
        }}
      />
      <main className="sip-panic-readable px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {!embed ? <BackRow /> : null}

        <div className="max-w-6xl mx-auto">
          <header className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] text-white/95">
              <span className="gold-gradient-text font-semibold">{t("page.badgeTitle")}</span>
              <span aria-hidden="true">•</span>
              <span className="text-white/90">{t("page.badgeSubtitle")}</span>
              {partner ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="text-white/90">{t("page.partner", { partner })}</span>
                </>
              ) : null}
            </div>

            <div className="mt-4">
              <ComplianceBanner />
            </div>

            <div className="mt-5">
              <ModeToggle currentMode={uiMode} onChange={onUiModeChange} />
            </div>

            {uiMode === "advanced" ? (
              <div className="mt-5 flex justify-center">
                <LanguageToggle />
              </div>
            ) : null}

            <h1 className="mt-6 text-3xl sm:text-4xl font-semibold gold-gradient-text">{t("page.title")}</h1>
            <p className="mt-3 text-sm sm:text-base text-white/90 max-w-3xl mx-auto">{t("page.subtitle")}</p>
          </header>

          {uiMode === "beginner" ? (
            <BeginnerModeView
              monthlyAmount={inputs.monthlyAmount}
              durationYears={inputs.durationYears}
              onChangeMonthlyAmount={(monthly) =>
                setInputs((prev) => ({
                  ...prev,
                  monthlyAmount: clampInt(monthly, 1_000, 5_00_000),
                }))
              }
              onChangeDurationYears={(years) =>
                setInputs((prev) => ({
                  ...prev,
                  durationYears: clampInt(years, 1, 30),
                }))
              }
              onRequestAdvanced={() => onUiModeChange("advanced")}
            />
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
                <div className="text-sm font-semibold text-white/90">Advanced Mode — full customization for professionals</div>
                <div className="mt-1 text-xs text-white/70">
                  Tax assumptions, scenario builders, risk profile, crash presets, and all details.
                </div>
              </div>

              <SocialProofBanner />

        <div className="mt-6 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold gold-gradient-text">{t("quiz.cardTitle")}</h2>
              <p className="mt-1 text-xs text-white/90">{t("quiz.cardSubtitle")}</p>
              <div className="mt-3 text-[11px] text-white/70">
                ✓ Personalized insights · ✓ Compare your profile · ✓ Apply a recommended scenario
              </div>
              {quizProfileLabel ? (
                <div className="mt-2 text-[11px] text-white/65">
                  Your last profile: <span className="font-semibold text-white/80">{quizProfileLabel}</span>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setShowQuiz(true)}
              className={
                "min-h-11 rounded-xl border border-white/20 bg-[color:var(--lux-accent)] px-4 py-2 text-xs font-semibold text-black hover:opacity-95"
              }
            >
              {quizProfileLabel ? "Retake quiz" : t("quiz.show")}
            </button>
          </div>
          <div className="mt-3 text-[11px] text-white/85">{t("quiz.tip")}</div>
        </div>

        {showCta ? (
          <div className="mt-6 rounded-2xl border border-white/10 ultra-luxury-glass p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white/90">Want a PMS-first plan for your goals?</div>
              <div className="mt-1 text-xs text-white/70">Talk to a BM Wealth specialist (no obligation).</div>
            </div>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="calculator-premium-cta inline-flex items-center justify-center px-5 py-2"
            >
              {ctaText}
            </a>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold gold-gradient-text">{t("crash.title")}</h2>
              <p className="mt-1 text-xs text-white/75">{t("crash.subtitle")}</p>
            </div>
            <LearningBubble title="How it works" disabled={learningBubblesDisabled} onDisableChange={disableLearningBubbles}>
              These presets tune crash depth, duration, and recovery windows in the deterministic market path.
              The goal is teaching behavior, not forecasting returns.
            </LearningBubble>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {(
              [
                { k: "default" as const, label: "Default (Education)" },
                { k: "2008" as const, label: "2008-like (-60%)" },
                { k: "2020" as const, label: "2020-like (-40%)" },
                { k: "2022" as const, label: "2022-like (-18%)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.k}
                type="button"
                onClick={() => setCrashPreset(opt.k)}
                className={
                  crashPreset === opt.k
                    ? "min-h-11 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white"
                    : "min-h-11 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-white/80 hover:bg-white/5"
                }
              >
                {opt.k === "default"
                  ? t("crash.default")
                  : opt.k === "2008"
                    ? t("crash.2008")
                    : opt.k === "2020"
                      ? t("crash.2020")
                      : t("crash.2022")}
              </button>
            ))}
          </div>
        </div>

        {inputs.durationYears < 3 ? (
          <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
            <div className="font-semibold">⚠️ Short-horizon note</div>
            <div className="mt-1 text-xs text-amber-100/90">
              This simulator is designed for 3+ year horizons to demonstrate crash behavior and recovery compounding.
              Your {inputs.durationYears}-year timeframe may not include the full behavioral pattern.
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Inputs */}
          <div className="lg:col-span-3 space-y-4" id="sip-panic-inputs">
            <div
              onPointerDown={() => {
                if (hasTrackedStart.current) return;
                hasTrackedStart.current = true;
                trackEvent("calculator_start", { calculator_type: CALCULATOR_TYPE });
              }}
            >
              <SIPInputForm
                value={inputs}
                onChange={(next) => {
                  setInputs(next);
                  if (hasTrackedStart.current) return;
                  hasTrackedStart.current = true;
                  trackEvent("calculator_start", { calculator_type: CALCULATOR_TYPE });
                }}
                onRun={run}
              />
            </div>

            <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold gold-gradient-text">{t("risk.title")}</h2>
                  <p className="mt-1 text-xs text-white/75">{t("risk.subtitle")}</p>
                </div>
                <LearningBubble
                  title="Why we ask this"
                  disabled={learningBubblesDisabled}
                  onDisableChange={disableLearningBubbles}
                >
                  Risk comfort helps you interpret drawdowns. The math stays the same — your emotional tolerance doesn’t.
                </LearningBubble>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                {(
                  [
                    { k: "conservative" as const, label: "Conservative" },
                    { k: "moderate" as const, label: "Moderate" },
                    { k: "aggressive" as const, label: "Aggressive" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.k}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 cursor-pointer hover:border-white/15"
                  >
                    <input
                      type="radio"
                      name="riskComfort"
                      value={opt.k}
                      checked={riskComfort === opt.k}
                      onChange={() => setRiskComfort(opt.k)}
                      className="accent-[oklch(0.78_0.08_65)]"
                    />
                    <span className="text-white/90">
                      {opt.k === "conservative" ? t("risk.conservative") : opt.k === "moderate" ? t("risk.moderate") : t("risk.aggressive")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <div>
                <h2 className="text-base font-semibold gold-gradient-text">What are you investing in?</h2>
                <p className="mt-1 text-xs text-white/75">Used for education-only tax defaults (MF vs direct stocks).</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                <label className="min-h-11 flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 cursor-pointer hover:border-white/15">
                  <input
                    type="radio"
                    name="investmentType"
                    value="equity_mf"
                    checked={investmentType === "equity_mf"}
                    onChange={() => onInvestmentTypeChange("equity_mf")}
                    className="mt-1 accent-[oklch(0.78_0.08_65)]"
                  />
                  <span className="min-w-0">
                    <span className="text-white/90 font-medium">Equity Mutual Fund SIP</span>
                    <span className="block text-xs text-white/65">Default engine tax rules for equity mutual funds.</span>
                  </span>
                </label>

                <label className="min-h-11 flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 cursor-pointer hover:border-white/15">
                  <input
                    type="radio"
                    name="investmentType"
                    value="stocks"
                    checked={investmentType === "stocks"}
                    onChange={() => onInvestmentTypeChange("stocks")}
                    className="mt-1 accent-[oklch(0.78_0.08_65)]"
                  />
                  <span className="min-w-0">
                    <span className="text-white/90 font-medium">Direct Stocks SIP</span>
                    <span className="block text-xs text-white/65">Uses direct equity defaults in the tax engine.</span>
                  </span>
                </label>
              </div>
            </div>

            <TaxCalculationMode value={taxCalcMode} onChange={onTaxCalcModeChange} />

            <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold gold-gradient-text">Tax profile (education-only)</h2>
                  <p className="mt-1 text-xs text-white/75">Applies 4% cess and a simple surcharge assumption on gains tax.</p>
                </div>
                <LearningBubble
                  title="Why we ask this"
                  disabled={learningBubblesDisabled}
                  onDisableChange={disableLearningBubbles}
                >
                  For simplicity we apply cess (4%) and an optional surcharge on the computed capital gains tax.
                  This is still an educational model and may differ from your actual tax computation.
                </LearningBubble>
              </div>

              <TooltipProvider delayDuration={150}>
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                  {TAX_PROFILES.map((opt) => {
                    const impact = estimateSurchargeImpact(opt.surchargeRate);
                    const ratePct = Math.round(opt.surchargeRate * 100);
                    const isZero = opt.surchargeRate <= 0;
                    return (
                      <label
                        key={opt.k}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 cursor-pointer hover:border-white/15"
                      >
                        <input
                          type="radio"
                          name="taxProfile"
                          value={opt.k}
                          checked={taxProfile === opt.k}
                          onChange={() => onTaxProfileChange(opt.k)}
                          className="accent-[oklch(0.78_0.08_65)]"
                        />
                        <span className="text-white/90">{opt.label}</span>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={`Explain surcharge for ${opt.label}`}
                              className="ml-auto inline-flex h-11 w-11 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-white/10 bg-black/25 text-[11px] text-white/70 hover:text-white/90 hover:border-white/15"
                            >
                              i
                            </button>
                          </TooltipTrigger>
                          <TooltipContentAny side="top" className="max-w-[300px] border border-white/10 bg-black/90 text-white/90">
                            <div className="text-[11px] text-white/85 leading-snug">
                              {isZero ? (
                                <>No surcharge in this bracket. Only cess (4%) is applied on the modeled gains tax.</>
                              ) : (
                                <>
                                  Adds a {ratePct}% surcharge on the modeled gains tax (plus cess on the surcharge).
                                  {estimatedBaseGainsTax > 0 ? (
                                    <>
                                      <br />
                                      With your current inputs, this increases tax by ~{formatInr(impact)} (reducing after-tax value by ~{formatInr(impact)}).
                                    </>
                                  ) : null}
                                </>
                              )}
                              <div className="mt-2 text-[10px] text-white/60">Education-only approximation; actual tax may differ.</div>
                            </div>
                          </TooltipContentAny>
                        </Tooltip>
                      </label>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold gold-gradient-text">Panic point (slider)</h2>
                  <p className="mt-1 text-xs text-white/75">Set the drawdown where you’d likely stop SIP (enables Custom Behavior).</p>
                </div>
                <LearningBubble
                  title="What this means"
                  disabled={learningBubblesDisabled}
                  onDisableChange={disableLearningBubbles}
                >
                  “Panic point” is the market fall from its previous peak where an investor often stops equity SIP contributions.
                  This simulator models the consequence of that behavior for education — it’s not advice.
                </LearningBubble>
              </div>

              <div className="mt-4">
                <Label className="text-white/85 text-xs">Panic threshold (% fall from peak)</Label>
                <div className="mt-2">
                  <Slider
                    min={5}
                    max={60}
                    step={1}
                    value={[Math.max(5, Math.min(60, Math.round(selection.custom.panicThresholdPct || 30)))]}
                    onValueChange={(arr) => {
                      const n = Number(arr?.[0] ?? 30);
                      setSelection((prev) => ({
                        ...prev,
                        enabled: { ...prev.enabled, custom: true },
                        custom: {
                          ...prev.custom,
                          panicThresholdPct: Number.isFinite(n) ? Math.max(5, Math.min(60, Math.round(n))) : 30,
                        },
                      }));
                    }}
                    trackClassName="bg-white/10"
                    rangeClassName="bg-[oklch(0.78_0.08_65)]"
                    thumbClassName="border-[oklch(0.78_0.08_65)] bg-black"
                  />
                  <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-white/60">
                    <span>More sensitive</span>
                    <span className="tabular-nums text-white/80">{Math.round(selection.custom.panicThresholdPct)}%</span>
                    <span>More patient</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-white/70">Auto-resume months can be tuned under Scenarios → Custom Behavior.</p>
            </div>

            <ScenarioSelector value={selection} onChange={setSelection} />
          </div>

          {/* Center: Charts */}
          <div className="lg:col-span-6 space-y-4">
            <TimelineChart
              data={chartData}
              show={{
                discipline: selection.enabled.discipline,
                panic20: selection.enabled.panic20,
                panic40: selection.enabled.panic40,
                anyFall: selection.enabled.stopAnyFall,
                custom: selection.enabled.custom,
                invested: false,
              }}
              labels={{
                discipline: "Discipline",
                panic20: "Stop at 20%",
                panic40: "Stop at 40%",
                anyFall: "Pause in Red Months",
                custom: selection.enabled.custom
                  ? `Custom (${Math.round(selection.custom.panicThresholdPct || 30)}% / ${Math.round(selection.custom.stopDurationMonths || 6)}m)`
                  : "Custom",
                invested: "Invested",
              }}
              title="Graph 1 — Your Wealth Path"
              subtitle="Disciplined SIP vs panic behaviors across the same market path."
              exportId="sip-panic-wealth-chart"
              headerRight={
                <LearningBubble
                  title="How to read this"
                  disabled={learningBubblesDisabled}
                  onDisableChange={disableLearningBubbles}
                >
                  The gold line is “stay calm”. Panic lines stop equity SIP contributions when drawdowns trigger. Hover to compare values.
                </LearningBubble>
              }
            />

            <DrawdownPainChart
              data={chartData}
              title="Graph 2 — Drawdown Pain Chart"
              subtitle="Where fear peaks: the market’s fall from its previous high."
              headerRight={
                <LearningBubble
                  title="The psychology"
                  disabled={learningBubblesDisabled}
                  onDisableChange={disableLearningBubbles}
                >
                  Most people stop investing near the bottom because drawdowns feel permanent — even when recoveries historically follow.
                </LearningBubble>
              }
            />
          </div>

          {/* Right: Consequence */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <h2 className="text-base font-semibold gold-gradient-text">Based on your profile</h2>
              <p className="mt-1 text-xs text-white/75">Rule-based guidance (education-only). Simulation math stays deterministic.</p>

              {(() => {
                const profileLabel = riskComfort === "conservative" ? "Conservative" : riskComfort === "aggressive" ? "Aggressive" : "Moderate";
                const taxLabel = getTaxProfileLabel(taxProfile);

                const recommendKey =
                  riskComfort === "conservative" ? "stopAnyFall" : riskComfort === "aggressive" ? "discipline" : "custom";

                const avoidKey =
                  riskComfort === "conservative" ? "panic20" : riskComfort === "aggressive" ? "panic20" : "stopAnyFall";

                const recommendedTitle =
                  recommendKey === "stopAnyFall"
                    ? "Pause SIP in Negative Return Months"
                    : recommendKey === "custom"
                      ? `Custom: Panic at ${Math.round(selection.custom.panicThresholdPct)}% fall, resume after ${Math.round(selection.custom.stopDurationMonths)} months`
                      : "Perfect Discipline";

                const avoidTitle =
                  avoidKey === "stopAnyFall" ? "Pause SIP in Negative Return Months" : avoidKey === "panic20" ? "Stop SIP at 20% Drawdown" : "—";

                const quickOutFor = (key: "stopAnyFall" | "panic20" | "discipline" | "custom") => {
                  const scenariosForOne = buildScenariosFromSelection({
                    enabled: {
                      discipline: true,
                      panic20: key === "panic20",
                      panic40: false,
                      stopAnyFall: key === "stopAnyFall",
                      custom: key === "custom",
                    },
                    custom: selection.custom,
                  });
                  const out = simulateSIPVsPanic(inputs.monthlyAmount, inputs.durationYears, scenariosForOne, marketConditions, {
                    afterStopMode: "cash",
                    riskComfort,
                    tax: taxConfig,
                  });
                  const disciplineRow = out.find((r) => r.scenario.behaviorType === "discipline") ?? null;
                  const behaviorRow =
                    key === "discipline" ? disciplineRow : out.find((r) => r.scenario.behaviorType !== "discipline") ?? null;
                  return { disciplineRow, behaviorRow };
                };

                const recommended = recommendKey === "discipline" ? quickOutFor("discipline") : recommendKey === "stopAnyFall" ? quickOutFor("stopAnyFall") : quickOutFor("custom");
                const avoided = avoidKey === "stopAnyFall" ? quickOutFor("stopAnyFall") : quickOutFor("panic20");
                const estimatedNaturalCost = Math.max(0, recommended.behaviorRow?.behavioralCost ?? 0);
                const avoidCost = Math.max(0, avoided.behaviorRow?.behavioralCost ?? 0);

                return (
                  <>
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-white/80">
                      <div>
                        🎯 You selected <span className="text-white font-semibold">{profileLabel}</span> + <span className="text-white font-semibold">{taxLabel}</span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] tracking-wide text-white/60 uppercase">Recommended for you</div>
                      <div className="mt-2 text-sm text-white/90">
                        <span className="text-emerald-200 font-semibold">✓</span> {recommendedTitle}
                      </div>
                      <div className="mt-2 text-sm text-white/90">
                        <span className="text-amber-200 font-semibold">⚠️</span> Not ideal for your profile: {avoidTitle}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 text-[11px] text-white/75">
                        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 flex items-center justify-between gap-4">
                          <span>Estimated cost of your natural behavior</span>
                          <span className="font-semibold text-white tabular-nums">
                            <LakhTooltip amount={estimatedNaturalCost} />
                          </span>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 flex items-center justify-between gap-4">
                          <span>Cost if you stay disciplined</span>
                          <span className="font-semibold text-white tabular-nums">
                            <LakhTooltip amount={0} />
                          </span>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 flex items-center justify-between gap-4">
                          <span>Difference you can save</span>
                          <span className="font-semibold gold-gradient-text tabular-nums">
                            <LakhTooltip amount={estimatedNaturalCost} />
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelection((prev) => {
                              const next = { ...prev, enabled: { ...prev.enabled } };
                              if (recommendKey === "stopAnyFall") next.enabled.stopAnyFall = true;
                              if (recommendKey === "custom") next.enabled.custom = true;
                              // discipline is always included in buildScenariosFromSelection
                              return next;
                            });
                          }}
                          className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/85 hover:border-white/15"
                        >
                          Apply Recommended Scenario
                        </button>
                        <div className="text-[11px] text-white/60">
                          Extra context: this profile would typically avoid ~{formatLakhsInlineText(avoidCost)} cost by not panicking early.
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
              <h2 className="text-base font-semibold gold-gradient-text">Your Consequence Summary</h2>
              <p className="mt-1 text-xs text-white/75">The cost of fear vs staying disciplined (after tax).</p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
                <div className="text-[11px] tracking-wide text-white/60 uppercase">Behavioral cost</div>
                <div className="mt-2 text-3xl font-semibold gold-gradient-text tabular-nums">
                  <LakhTooltip amount={worst?.behavioralCost ?? 0} className="text-3xl font-semibold gold-gradient-text tabular-nums" />
                </div>
                <div className="mt-2 text-xs text-white/80">
                  {worst ? (
                    <>
                      Worst selected behavior: <span className="text-white font-semibold">{worst.scenario.name}</span>
                    </>
                  ) : (
                    <>Select at least one panic behavior to compare.</>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <div className="text-white/55">If you stayed calm</div>
                  <div className="mt-1 font-semibold text-white/90 tabular-nums">
                    {formatInr(discipline?.postTaxCorpus ?? 0)}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <div className="text-white/55">With panic behavior</div>
                  <div className="mt-1 font-semibold text-white/90 tabular-nums">
                    {formatInr(worst?.postTaxCorpus ?? 0)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={shareToWhatsApp}
                  className="calculator-premium-cta w-full"
                >
                  Share Your Result on WhatsApp
                </button>

                <button
                  type="button"
                  onClick={shareToEmail}
                  className="min-h-11 w-full touch-manipulation rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/85 hover:border-white/15"
                >
                  Share via Email
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const disciplineRow = results.find((r) => r.scenario.behaviorType === "discipline") ?? null;
                      const worstRow = results
                        .filter((r) => r.scenario.behaviorType !== "discipline")
                        .reduce<SIPSimulationResult | null>((best, cur) => {
                          if (!best) return cur;
                          return cur.behavioralCost > best.behavioralCost ? cur : best;
                        }, null);

                      trackEvent("sip_pdf_downloaded", {
                        calculator_type: CALCULATOR_TYPE,
                        behavioral_cost: worstRow?.behavioralCost ?? 0,
                        tax_profile: taxProfile,
                        discipline_post_tax: disciplineRow?.postTaxCorpus ?? 0,
                        panic_post_tax: worstRow?.postTaxCorpus ?? 0,
                        panic_threshold: typeof worstRow?.scenario?.panicThreshold === "number" ? Math.abs(worstRow.scenario.panicThreshold) : undefined,
                      });
                    } catch {
                      // ignore
                    }

                    void downloadPremiumReport({
                      results,
                      monthlyAmount: inputs.monthlyAmount,
                      durationYears: inputs.durationYears,
                      riskComfort,
                      taxProfile: getTaxProfileLabel(taxProfile),
                      taxCalcMode: taxCalcMode === "optimized_ltcg_indexation_20" ? t("taxMode.optimizedTitle") : t("taxMode.conservativeTitle"),
                      marketAssumptionTitle: marketAssumptions.title,
                      chartSvgId: "sip-panic-wealth-chart",
                    });
                  }}
                  className="min-h-11 w-full touch-manipulation rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/85 hover:border-white/15"
                >
                  Download Client Report (PDF)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("sip-panic-inputs");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="min-h-11 w-full touch-manipulation rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/85 hover:border-white/15"
                >
                  Try a different choice
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/15 px-3 py-3">
                <div className="text-[11px] text-white/60">Market assumption used</div>
                <div className="mt-1 text-xs text-white/75 font-semibold">{marketAssumptions.title}</div>
                <ul className="mt-2 text-[11px] text-white/65 space-y-1">
                  {marketAssumptions.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-white/60">{marketAssumptions.note}</p>

                <div className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                  <div className="text-[11px] font-semibold text-white/80">India context (education-only)</div>
                  <ul className="mt-2 text-[11px] text-white/65 space-y-1">
                    <li>Market-return intuition: Nifty-style long-term averages often quoted ~14–15% annual (not guaranteed).</li>
                    <li>Crash references: 2008 (≈−60%), 2020 (≈−40%), 2022 (≈−18%) used as illustration presets.</li>
                    <li>Rupee-cost averaging: in drawdowns you buy more units, lowering average cost over time.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ResultsDashboard results={results} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold gold-gradient-text">Compare across crashes</h2>
              <p className="mt-1 text-xs text-white/75">Same inputs + behavior, different crash paths (education-only).</p>
            </div>
          </div>

          {(() => {
            const presets: Array<{ k: "default" | "2008" | "2020" | "2022"; label: string; crash: string }> = [
              { k: "default", label: "Default", crash: "-35%" },
              { k: "2008", label: "2008", crash: "-60%" },
              { k: "2020", label: "2020", crash: "-40%" },
              { k: "2022", label: "2022", crash: "-18%" },
            ];

            const scenariosForCompare = buildScenariosFromSelection({
              enabled: { discipline: true, panic20: true, panic40: false, stopAnyFall: false, custom: false },
              custom: selection.custom,
            });

            const rows = presets.map((p) => {
              const mc = buildMarketConditionsForPreset(p.k);
              const out = simulateSIPVsPanic(inputs.monthlyAmount, inputs.durationYears, scenariosForCompare, mc, {
                afterStopMode: "cash",
                riskComfort,
                tax: taxConfig,
              });
              const disciplineRow = out.find((r) => r.scenario.behaviorType === "discipline") ?? null;
              const panic20Row = out.find((r) => r.scenario.behaviorType !== "discipline") ?? null;
              return {
                key: p.k,
                label: p.label,
                crash: p.crash,
                discipline: disciplineRow,
                panic20: panic20Row,
              };
            });

            return (
              <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                <table className="min-w-[820px] w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-white/60">
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3">Metric</th>
                      {rows.map((r) => (
                        <th key={r.key} className="text-right px-4 py-3">{r.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-white/85">
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-white/75">Crash</td>
                      {rows.map((r) => (
                        <td key={r.key} className="px-4 py-3 text-right tabular-nums">{r.crash}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-white/75">Discipline (post-tax)</td>
                      {rows.map((r) => (
                        <td key={r.key} className="px-4 py-3 text-right tabular-nums gold-gradient-text font-semibold">
                          <LakhTooltip amount={r.discipline?.postTaxCorpus ?? 0} className="font-semibold gold-gradient-text tabular-nums" />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-white/75">Panic20 (post-tax)</td>
                      {rows.map((r) => (
                        <td key={r.key} className="px-4 py-3 text-right tabular-nums">
                          <LakhTooltip amount={r.panic20?.postTaxCorpus ?? 0} className="tabular-nums" />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-white/75">Behavioral cost</td>
                      {rows.map((r) => (
                        <td key={r.key} className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--color-destructive)" }}>
                          <LakhTooltip
                            amount={r.panic20?.behavioralCost ?? 0}
                            className="tabular-nums"
                            prefix="-"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-white/75">Panic20 XIRR</td>
                      {rows.map((r) => (
                        <td key={r.key} className="px-4 py-3 text-right tabular-nums">{formatPct(r.panic20?.xirr ?? 0)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

        <MissedRecoveryAnimation discipline={discipline} worst={worst} chartData={chartData} monthlyAmount={inputs.monthlyAmount} />

        <RegretCalculator monthlyAmount={inputs.monthlyAmount} />

        {faqs.length ? (
          <div className="mt-10 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
            <h2 className="text-base font-semibold gold-gradient-text">Frequently asked questions</h2>
            <div className="mt-4 space-y-2">
              {faqs.map((f) => (
                <details key={f.q} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <summary className="cursor-pointer select-none text-sm text-white/90 font-semibold">
                    {f.q}
                  </summary>
                  <div className="mt-2 text-xs text-white/75 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        ) : null}

        <CalculationDetails results={results} />

        {!hideDisclaimer ? (
        <div className="mt-10 rounded-2xl border border-white/10 ultra-luxury-glass p-5">
          <h2 className="text-base font-semibold gold-gradient-text">Important Disclaimer</h2>

          <p className="mt-2 text-xs text-white/70">
            This simulator is for educational and informational purposes only. It uses a deterministic market path and simplified tax modeling.
            It does not constitute investment, tax, or legal advice, and it does not guarantee returns.
          </p>

          <p className="mt-3 text-xs text-white/70">
            Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance may or may not be sustained in the future.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-white/70">
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div className="text-white/55">Portfolio Management (PMS)</div>
              <div className="mt-1 font-semibold text-white/85">Premium portfolio guidance</div>
              <div className="mt-1 text-[10px] text-white/60">Offered through appropriate regulated entities / partners, as applicable.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div className="text-white/55">AMFI Registration</div>
              <div className="mt-1 font-semibold text-white/85">ARN 90008</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div className="text-white/55">IRDAI License</div>
              <div className="mt-1 font-semibold text-white/85">277925</div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-white/65">
            Verify and read more:
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              <a
                href="https://www.mutualfundssahihai.com/en/disclaimer/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                AMFI disclaimer
              </a>
              <a
                href="https://investor.sebi.gov.in/disclaimer.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                SEBI Investor Portal disclaimer
              </a>
              <a
                href="https://scores.sebi.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                SEBI SCORES
              </a>
            </div>
          </div>
        </div>
        ) : null}
            </>
          )}
      </div>
      </main>
    </LangProvider>
  );
}

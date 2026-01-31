"use client";

import { useMemo, useState } from "react";

import { useLang } from "./LangContext";

import type { AnswerKey, QuizQuestion } from "./quizEngine";
import { computeProfileFromAnswers, QUESTIONS_BY_LANG } from "./quizEngine";

export function BehavioralQuiz(props: {
  onApply: (params: { thresholdPct: number; riskComfort: "conservative" | "moderate" | "aggressive" }) => void;
  className?: string;
}) {
  const { onApply, className } = props;
  const { lang, t } = useLang();

  const QUESTIONS: QuizQuestion[] = useMemo(() => {
    return QUESTIONS_BY_LANG[lang] ?? QUESTIONS_BY_LANG.en;
  }, [lang]);

  const [answers, setAnswers] = useState<Record<string, AnswerKey | null>>(() => {
    const out: Record<string, AnswerKey | null> = {};
    for (const q of (QUESTIONS_BY_LANG.en ?? [])) out[q.id] = null;
    return out;
  });

  const computed = useMemo(() => computeProfileFromAnswers(answers), [answers]);

  return (
    <div className={`rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5 ${className ?? ""}`}>
      <h2 className="text-base font-semibold gold-gradient-text-static">{t("quiz.title")}</h2>
      <p className="mt-2 text-xs text-white/70">{t("quiz.subtitle")}</p>

      <div className="mt-4 space-y-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/90">{q.title}</div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              {q.options.map((o) => (
                <label
                  key={o.k}
                  className="min-h-11 flex items-center gap-3 rounded-lg border border-white/10 bg-black/15 px-3 py-2 cursor-pointer hover:border-white/15"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={o.k}
                    checked={answers[q.id] === o.k}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: o.k }))}
                    className="accent-[oklch(0.78_0.08_65)]"
                  />
                  <span className="text-white/85">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {computed ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="text-xs text-white/60">{t("quiz.predicted")}</div>
          <div className="mt-1 text-sm font-semibold text-white">{computed.label}</div>
          <div className="mt-2 text-xs text-white/80">
            {t("quiz.panicAround", { pct: computed.thresholdPct })}
          </div>
          <button
            type="button"
            onClick={() => onApply({ thresholdPct: computed.thresholdPct, riskComfort: computed.riskComfort })}
            className="mt-3 calculator-premium-cta min-h-11"
          >
            {t("quiz.apply")}
          </button>
        </div>
      ) : (
        <div className="mt-4 text-xs text-white/60">{t("quiz.completeHint")}</div>
      )}
    </div>
  );
}

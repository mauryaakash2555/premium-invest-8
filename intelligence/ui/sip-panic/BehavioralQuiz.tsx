"use client";

import { useMemo, useState } from "react";

type AnswerKey = "a" | "b" | "c" | "d";

type Question = {
  id: string;
  title: string;
  options: Array<{ k: AnswerKey; label: string }>;
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "Q1: Your ₹10L portfolio drops to ₹7L overnight. You:",
    options: [
      { k: "a", label: "Check if it's time to buy more" },
      { k: "b", label: "Feel uncomfortable but do nothing" },
      { k: "c", label: "Consider selling to prevent further loss" },
      { k: "d", label: "Sell immediately" },
    ],
  },
  {
    id: "q2",
    title: "Q2: You check your portfolio during volatility:",
    options: [
      { k: "a", label: "Rarely (monthly/quarterly)" },
      { k: "b", label: "Weekly" },
      { k: "c", label: "Daily" },
      { k: "d", label: "Many times a day" },
    ],
  },
  {
    id: "q3",
    title: "Q3: You believe market crashes are:",
    options: [
      { k: "a", label: "Opportunities to accumulate" },
      { k: "b", label: "Normal but stressful" },
      { k: "c", label: "Dangerous and unpredictable" },
      { k: "d", label: "A sign to exit and re-enter later" },
    ],
  },
  {
    id: "q4",
    title: "Q4: If headlines scream " + "\"market crash\"" + ", you usually:",
    options: [
      { k: "a", label: "Stick to your plan" },
      { k: "b", label: "Pause and wait" },
      { k: "c", label: "Reduce risk" },
      { k: "d", label: "Exit completely" },
    ],
  },
  {
    id: "q5",
    title: "Q5: Your comfort with volatility is:",
    options: [
      { k: "a", label: "High" },
      { k: "b", label: "Medium" },
      { k: "c", label: "Low" },
      { k: "d", label: "Very low" },
    ],
  },
];

const SCORE: Record<AnswerKey, number> = { a: 1, b: 2, c: 3, d: 4 };

function profileFromAvg(avg: number): { label: string; thresholdPct: number; riskComfort: "conservative" | "moderate" | "aggressive" } {
  if (avg <= 1.5) return { label: "Aggressive", thresholdPct: 40, riskComfort: "aggressive" };
  if (avg <= 2.5) return { label: "Moderate", thresholdPct: 27, riskComfort: "moderate" };
  if (avg <= 3.5) return { label: "Conservative", thresholdPct: 18, riskComfort: "conservative" };
  return { label: "Very Conservative", thresholdPct: 10, riskComfort: "conservative" };
}

export function BehavioralQuiz(props: {
  onApply: (params: { thresholdPct: number; riskComfort: "conservative" | "moderate" | "aggressive" }) => void;
  className?: string;
}) {
  const { onApply, className } = props;

  const [answers, setAnswers] = useState<Record<string, AnswerKey | null>>(() => {
    const out: Record<string, AnswerKey | null> = {};
    for (const q of QUESTIONS) out[q.id] = null;
    return out;
  });

  const computed = useMemo(() => {
    const keys = Object.keys(answers);
    if (!keys.length) return null;
    const filled = keys.filter((k) => answers[k]);
    if (filled.length !== keys.length) return null;

    const total = keys.reduce((sum, k) => sum + SCORE[(answers[k] as AnswerKey) ?? "b"], 0);
    const avg = total / keys.length;
    return profileFromAvg(avg);
  }, [answers]);

  return (
    <div className={`rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5 ${className ?? ""}`}>
      <h2 className="text-base font-semibold gold-gradient-text">Your Behavioral Profile (5-question quiz)</h2>
      <p className="mt-2 text-xs text-white/70">Answer quickly — your first instinct is usually your real instinct.</p>

      <div className="mt-4 space-y-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/90">{q.title}</div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              {q.options.map((o) => (
                <label
                  key={o.k}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/15 px-3 py-2 cursor-pointer hover:border-white/15"
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
          <div className="text-xs text-white/60">Your predicted behavior</div>
          <div className="mt-1 text-sm font-semibold text-white">{computed.label}</div>
          <div className="mt-2 text-xs text-white/80">
            You would likely panic around a <span className="font-semibold text-white">{computed.thresholdPct}%</span> fall.
          </div>
          <button
            type="button"
            onClick={() => onApply({ thresholdPct: computed.thresholdPct, riskComfort: computed.riskComfort })}
            className="mt-3 calculator-premium-cta"
          >
            See what this costs you
          </button>
        </div>
      ) : (
        <div className="mt-4 text-xs text-white/60">Answer all questions to see your profile.</div>
      )}
    </div>
  );
}

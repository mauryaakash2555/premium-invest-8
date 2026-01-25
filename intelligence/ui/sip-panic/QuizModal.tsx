"use client";

import { useEffect, useMemo, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useLang } from "./LangContext";
import type { AnswerKey, BehavioralProfile, QuizQuestion } from "./quizEngine";
import { computeProfileFromAnswers, QUESTIONS_BY_LANG } from "./quizEngine";

export function QuizModal(props: {
  open: boolean;
  onClose: () => void;
  onSubmit: (profile: BehavioralProfile) => void;
}) {
  const { open, onClose, onSubmit } = props;
  const { lang } = useLang();

  const questions: QuizQuestion[] = useMemo(() => {
    return QUESTIONS_BY_LANG[lang] ?? QUESTIONS_BY_LANG.en;
  }, [lang]);

  const [showIncentive, setShowIncentive] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerKey | null>>({});

  useEffect(() => {
    // Reset state whenever the modal opens.
    if (!open) return;
    const init: Record<string, AnswerKey | null> = {};
    for (const q of (questions.length ? questions : QUESTIONS_BY_LANG.en)) init[q.id] = null;
    setAnswers(init);
    setCurrentIdx(0);
    setShowIncentive(true);
  }, [open, questions]);

  const progressPct = questions.length ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;
  const question = questions[currentIdx];

  const handleSelect = (qId: string, choice: AnswerKey) => {
    const next = { ...answers, [qId]: choice };
    setAnswers(next);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      return;
    }

    const profile = computeProfileFromAnswers(next);
    if (profile) onSubmit(profile);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => (!v ? onClose() : undefined)}>
      <DialogContent className="max-w-md border border-white/10 bg-black/95 text-white">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold gold-gradient-text">🎯 Quick Behavioral Profile</DialogTitle>
        </DialogHeader>

        {showIncentive ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-sm font-medium text-white/90">✨ Complete this 2-min quiz to:</p>
            <ul className="mt-2 space-y-1 text-xs text-white/75">
              <li>✓ Get personalized recommendations</li>
              <li>✓ Compare your profile vs others</li>
              <li>✓ Apply a suggested panic rule instantly</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowIncentive(false)}
              className="mt-2 text-xs text-[oklch(0.78_0.08_65)] hover:opacity-90"
            >
              Got it →
            </button>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="h-2 w-full rounded bg-white/10">
            <div
              className="h-2 rounded bg-[oklch(0.78_0.08_65)] transition-all"
              style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-white/60">
            Question {Math.min(questions.length, currentIdx + 1)} of {questions.length}
          </div>
        </div>

        {question ? (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-white/90">{question.title}</h3>
            <div className="mt-3 space-y-2">
              {question.options.map((o) => (
                <button
                  key={o.k}
                  type="button"
                  onClick={() => handleSelect(question.id, o.k)}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-left text-sm text-white/85 hover:border-white/15 hover:bg-black/45"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-white/70">Loading…</div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-11 w-full touch-manipulation rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75 hover:border-white/15"
        >
          Skip for now
        </button>
      </DialogContent>
    </Dialog>
  );
}

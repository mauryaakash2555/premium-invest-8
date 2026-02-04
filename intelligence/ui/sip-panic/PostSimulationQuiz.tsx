"use client";

import { useState } from "react";

interface PostSimulationQuizProps {
  behavioralCost: number;
  disciplineAmt: number;
  choiceAmt: number;
  storyChoice: string;
  onComplete?: (score: number, badge: string) => void;
}

const quizQuestions = [
  {
    question: "What typically happens to disciplined SIP investors during market crashes?",
    options: [
      { text: "They lose all their money", correct: false },
      { text: "They buy more units at lower prices", correct: true },
      { text: "They should always switch to FDs", correct: false },
      { text: "They should wait for market recovery", correct: false },
    ],
    explanation: "During crashes, your SIP buys more units at lower prices. When markets recover, these extra units compound - this is 'rupee cost averaging' working in your favor."
  },
  {
    question: "Why does panic selling during a crash often hurt investors?",
    options: [
      { text: "They miss the discounted buying opportunity", correct: true },
      { text: "Crashes always lead to total market collapse", correct: false },
      { text: "SIPs don't work during volatility", correct: false },
      { text: "Cash is always better than equity", correct: false },
    ],
    explanation: "Panic sellers lock in losses and miss the recovery. Historically, markets have recovered from every major crash, rewarding those who stayed invested."
  },
  {
    question: "What's the key behavioral lesson from this simulation?",
    options: [
      { text: "Always time the market perfectly", correct: false },
      { text: "Never invest in equity markets", correct: false },
      { text: "Emotional decisions often cost more than market volatility", correct: true },
      { text: "Stop SIP during every correction", correct: false },
    ],
    explanation: "The simulation shows that behavioral costs (panic selling) often exceed market volatility costs. Staying disciplined typically beats trying to time the market."
  },
];

export function PostSimulationQuiz({ 
  behavioralCost, 
  disciplineAmt, 
  choiceAmt, 
  storyChoice,
  onComplete 
}: PostSimulationQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = quizQuestions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (question.options[index].correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = score + (question.options[selectedAnswer!]?.correct ? 1 : 0);
      const badge = getBadge(finalScore);
      setCompleted(true);
      onComplete?.(finalScore, badge.title);
    }
  };

  const getBadge = (finalScore: number) => {
    if (finalScore === 3) return { icon: "🏆", title: "Master Investor", desc: "Perfect score! You understand behavioral finance." };
    if (finalScore === 2) return { icon: "🌟", title: "Smart Investor", desc: "Great understanding! Keep learning." };
    return { icon: "📚", title: "Growing Investor", desc: "Keep exploring to build your knowledge." };
  };

  if (completed) {
    const finalScore = score + (question.options[selectedAnswer!]?.correct ? 1 : 0);
    const badge = getBadge(finalScore);
    
    return (
      <div className="rounded-2xl border border-[oklch(0.78_0.08_65/0.3)] bg-[oklch(0.10_0.02_264)] p-6 text-center">
        <div className="text-5xl mb-3">{badge.icon}</div>
        <div className="text-lg font-bold text-[oklch(0.78_0.08_65)]">{badge.title}</div>
        <div className="text-sm text-[oklch(0.70_0.04_65)] mt-1">{badge.desc}</div>
        <div className="mt-4 py-2 px-4 rounded-full inline-block bg-[oklch(0.78_0.08_65/0.15)] text-[oklch(0.85_0.06_65)] text-sm font-semibold">
          Score: {finalScore}/{quizQuestions.length}
        </div>
        <p className="mt-4 text-[11px] text-[oklch(0.50_0.02_264)]">
          Share your badge with friends and challenge them!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[oklch(0.78_0.08_65/0.3)] bg-[oklch(0.10_0.02_264)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-semibold tracking-wide text-[oklch(0.78_0.08_65)] uppercase">
          Test Your Knowledge
        </div>
        <div className="text-[11px] text-[oklch(0.60_0.02_264)]">
          {currentQuestion + 1} of {quizQuestions.length}
        </div>
      </div>
      
      <p className="text-sm font-medium text-white mb-4">{question.question}</p>
      
      <div className="space-y-2">
        {question.options.map((option, index) => {
          let buttonClass = "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ";
          
          if (selectedAnswer === null) {
            buttonClass += "border-[oklch(0.30_0.02_264)] bg-[oklch(0.08_0.01_264)] text-[oklch(0.80_0.02_264)] hover:border-[oklch(0.78_0.08_65/0.5)] hover:bg-[oklch(0.12_0.02_264)]";
          } else if (option.correct) {
            buttonClass += "border-green-500 bg-green-500/10 text-green-300";
          } else if (index === selectedAnswer) {
            buttonClass += "border-red-500 bg-red-500/10 text-red-300";
          } else {
            buttonClass += "border-[oklch(0.20_0.02_264)] bg-[oklch(0.06_0.01_264)] text-[oklch(0.50_0.02_264)]";
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={buttonClass}
            >
              {option.text}
              {selectedAnswer !== null && option.correct && " ✓"}
            </button>
          );
        })}
      </div>
      
      {showExplanation && (
        <div className="mt-4 p-3 rounded-xl bg-[oklch(0.78_0.08_65/0.1)] border border-[oklch(0.78_0.08_65/0.2)]">
          <p className="text-[12px] text-[oklch(0.85_0.05_65)]">{question.explanation}</p>
        </div>
      )}
      
      {selectedAnswer !== null && (
        <button
          onClick={handleNext}
          className="mt-4 w-full py-3 rounded-xl bg-[oklch(0.78_0.08_65)] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {currentQuestion < quizQuestions.length - 1 ? "Next Question →" : "See Results"}
        </button>
      )}
    </div>
  );
}

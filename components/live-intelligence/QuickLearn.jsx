'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════
// QUICK LEARN - 30-second micro lessons on financial concepts
// CLEAN DESIGN - Matches overlay laser blue theme exactly
// ═══════════════════════════════════════════════════════════

const QUICK_LEARN_LESSONS = [
  {
    id: 'compound_interest',
    topic: 'Compound Interest',
    question: 'Why is compound interest called the "8th wonder of the world"?',
    answer: 'Albert Einstein allegedly said this! Compound interest earns interest on interest. ₹10,000 at 12% for 30 years = ₹3 lakhs. The same amount with simple interest? Just ₹46,000.',
    fact: 'Start early: ₹5,000/month from age 25 = ₹1.6 Cr at 60. Start at 35? Only ₹50 lakhs.',
    category: 'Basics',
  },
  {
    id: 'mutual_fund_nav',
    topic: 'NAV Explained',
    question: 'What is NAV and why shouldn\'t you use it to judge a fund?',
    answer: 'NAV (Net Asset Value) = Fund Assets ÷ Units. A ₹10 NAV fund isn\'t cheaper than a ₹500 NAV fund. What matters is the % returns, not the NAV number.',
    fact: 'A fund with NAV ₹500 giving 15% return = ₹575. A ₹10 fund at 15% = ₹11.50. Same growth!',
    category: 'Mutual Funds',
  },
  {
    id: 'sip_power',
    topic: 'SIP Magic',
    question: 'Why is SIP better than lump sum for most people?',
    answer: 'Rupee Cost Averaging! When markets fall, your SIP buys more units. When they rise, fewer units. Over time, this averages your cost and reduces risk.',
    fact: 'SIP in Nifty 50 since 2000: ₹10,000/month = ₹2.7 Cr today (invested just ₹29 lakhs).',
    category: 'SIP',
  },
  {
    id: 'insurance_vs_investment',
    topic: 'Insurance ≠ Investment',
    question: 'Why should you never mix insurance with investment?',
    answer: 'ULIPs and endowment plans give low insurance coverage AND poor returns. Buy term insurance for protection (cheap, high cover) and invest separately in mutual funds.',
    fact: '₹1 Cr term cover costs ~₹12,000/year at age 30. LIC endowment? ~₹5 lakhs/year for same cover!',
    category: 'Insurance',
  },
  {
    id: 'emergency_fund',
    topic: 'Emergency Fund',
    question: 'How much should your emergency fund be?',
    answer: '6-12 months of expenses in a liquid fund or savings account. This protects you from job loss, medical emergencies, or urgent repairs without breaking investments.',
    fact: '70% of Indians have less than 3 months emergency savings. Don\'t be in that group!',
    category: 'Planning',
  },
  {
    id: 'diversification',
    topic: 'Diversification',
    question: 'Why not put all money in one "best performing" fund?',
    answer: 'Today\'s top performer might be tomorrow\'s worst. Diversify across large cap, mid cap, international, and debt. When one falls, others may rise.',
    fact: 'In 2008, equity fell 52%. Gold rose 30%. In 2020, small caps fell 40%, large caps only 23%.',
    category: 'Strategy',
  },
  {
    id: 'fd_vs_debt_funds',
    topic: 'FD vs Debt Funds',
    question: 'Are FDs really the safest option for your money?',
    answer: 'After taxes, FD returns often beat inflation by just 1-2%. Debt mutual funds can give similar safety with better tax efficiency for 3+ year holdings.',
    fact: '7% FD in 30% tax bracket = 4.9% post-tax. Inflation at 6%? You\'re losing purchasing power!',
    category: 'Fixed Income',
  },
  {
    id: 'elss_tax_saving',
    topic: 'ELSS Advantage',
    question: 'Why is ELSS the best 80C option for most people?',
    answer: 'ELSS has lowest lock-in (3 years vs 5 for FD, 15 for PPF). It\'s equity-linked so can give 12-15% returns. Plus, 80C benefit up to ₹1.5 lakhs.',
    fact: '₹1.5L in ELSS at 12% for 20 years = ₹14 lakhs. Same in PPF at 7.1% = ₹6.5 lakhs.',
    category: 'Tax Saving',
  },
  {
    id: 'expense_ratio',
    topic: 'Expense Ratio',
    question: 'Does 1% expense ratio really matter?',
    answer: 'Over 30 years, 1% extra fee can eat 25% of your wealth! Index funds charge 0.1-0.2%. Active funds charge 1-2%. Choose wisely.',
    fact: '₹1 Cr at 12% for 30 years = ₹30 Cr. At 11% (1% fee)? Only ₹23 Cr. ₹7 Cr gone in fees!',
    category: 'Costs',
  },
  {
    id: 'rebalancing',
    topic: 'Portfolio Rebalancing',
    question: 'Why should you rebalance your portfolio yearly?',
    answer: 'If equity grows 20% and debt 5%, your 60:40 becomes 65:35. Rebalancing books profits from winners and buys more of laggards at lower prices.',
    fact: 'Rebalanced portfolios historically outperform by 0.5-1% annually with lower volatility.',
    category: 'Strategy',
  },
];

const getTodaysLesson = () => {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return QUICK_LEARN_LESSONS[dayOfYear % QUICK_LEARN_LESSONS.length];
};

/**
 * QuickLearn - Clean laser blue theme matching overlay
 */
export default function QuickLearn() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setLesson(getTodaysLesson());
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem('li_quicklearn_completed');
    if (lastCompleted === today) {
      setCompleted(true);
      setShowAnswer(true);
    }
  }, []);

  if (!lesson) return null;

  return (
    <>
      <div className="ql-wrap">
        <div className="ql-header">
          <span className="ql-badge">30s Learn</span>
          <span className="ql-cat">{lesson.category}</span>
        </div>

        <div className="ql-topic">{lesson.topic}</div>
        <div className="ql-question">{lesson.question}</div>

        {!showAnswer ? (
          <button className="ql-btn" onClick={() => setShowAnswer(true)}>
            Show Answer
          </button>
        ) : (
          <div className="ql-answer-wrap">
            <div className="ql-answer">
              <span className="ql-label">Answer</span>
              {lesson.answer}
            </div>
            <div className="ql-fact">
              <span className="ql-label">Did you know?</span>
              {lesson.fact}
            </div>
            {!completed ? (
              <button className="ql-done" onClick={() => {
                setCompleted(true);
                localStorage.setItem('li_quicklearn_completed', new Date().toDateString());
              }}>
                Got it!
              </button>
            ) : (
              <div className="ql-completed">Completed for today</div>
            )}
          </div>
        )}

        <div className="ql-footer">
          Lesson {QUICK_LEARN_LESSONS.findIndex(l => l.id === lesson.id) + 1}/{QUICK_LEARN_LESSONS.length}
        </div>
      </div>

      <style jsx>{`
        .ql-wrap {
          background: rgba(10, 14, 22, 0.95);
          border: 1px solid rgba(100, 160, 255, 0.12);
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
        }
        .ql-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .ql-badge {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 4px 8px;
          background: rgba(100, 160, 255, 0.12);
          border: 1px solid rgba(100, 160, 255, 0.2);
          border-radius: 4px;
          color: rgba(140, 190, 255, 0.85);
        }
        .ql-cat {
          font-size: 10px;
          color: rgba(180, 195, 230, 0.45);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .ql-topic {
          font-size: 15px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.92);
          margin-bottom: 8px;
        }
        .ql-question {
          font-size: 13px;
          color: rgba(200, 215, 240, 0.75);
          line-height: 1.5;
          padding: 10px 12px;
          background: rgba(100, 160, 255, 0.04);
          border-left: 2px solid rgba(100, 160, 255, 0.35);
          border-radius: 0 6px 6px 0;
          margin-bottom: 12px;
        }
        .ql-btn {
          width: 100%;
          padding: 10px;
          background: rgba(100, 160, 255, 0.1);
          border: 1px solid rgba(100, 160, 255, 0.25);
          border-radius: 6px;
          color: rgba(140, 190, 255, 0.9);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .ql-btn:hover {
          background: rgba(100, 160, 255, 0.18);
        }
        .ql-answer-wrap {
          animation: fadeUp 0.2s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ql-answer {
          font-size: 12px;
          color: rgba(210, 225, 245, 0.85);
          line-height: 1.55;
          padding: 10px;
          background: rgba(100, 160, 255, 0.06);
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .ql-fact {
          font-size: 11px;
          color: rgba(180, 200, 230, 0.7);
          line-height: 1.5;
          padding: 8px 10px;
          background: rgba(80, 140, 200, 0.05);
          border: 1px solid rgba(100, 160, 255, 0.08);
          border-radius: 5px;
          margin-bottom: 10px;
        }
        .ql-label {
          display: block;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(100, 170, 255, 0.7);
          margin-bottom: 4px;
        }
        .ql-done {
          width: 100%;
          padding: 8px;
          background: rgba(100, 180, 140, 0.12);
          border: 1px solid rgba(100, 180, 140, 0.25);
          border-radius: 5px;
          color: rgba(140, 210, 170, 0.9);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .ql-done:hover {
          background: rgba(100, 180, 140, 0.2);
        }
        .ql-completed {
          text-align: center;
          font-size: 11px;
          color: rgba(140, 200, 170, 0.65);
          padding: 6px;
        }
        .ql-footer {
          text-align: right;
          font-size: 9px;
          color: rgba(180, 195, 230, 0.3);
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid rgba(100, 160, 255, 0.06);
        }
      `}</style>
    </>
  );
}

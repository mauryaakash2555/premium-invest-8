'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════
// QUICK LEARN - 30-second micro lessons on financial concepts
// Daily rotating educational content in bite-sized format
// PREMIUM REDESIGN - Glass morphism + animated gradients
// ═══════════════════════════════════════════════════════════

const QUICK_LEARN_LESSONS = [
  {
    id: 'compound_interest',
    topic: 'Compound Interest',
    emoji: '📈',
    question: 'Why is compound interest called the "8th wonder of the world"?',
    answer: 'Albert Einstein allegedly said this! Compound interest earns interest on interest. ₹10,000 at 12% for 30 years = ₹3 lakhs. The same amount with simple interest? Just ₹46,000.',
    fact: 'Start early: ₹5,000/month from age 25 = ₹1.6 Cr at 60. Start at 35? Only ₹50 lakhs.',
    category: 'Basics',
  },
  {
    id: 'mutual_fund_nav',
    topic: 'NAV Explained',
    emoji: '💰',
    question: 'What is NAV and why shouldn\'t you use it to judge a fund?',
    answer: 'NAV (Net Asset Value) = Fund Assets ÷ Units. A ₹10 NAV fund isn\'t cheaper than a ₹500 NAV fund. What matters is the % returns, not the NAV number.',
    fact: 'A fund with NAV ₹500 giving 15% return = ₹575. A ₹10 fund at 15% = ₹11.50. Same growth!',
    category: 'Mutual Funds',
  },
  {
    id: 'sip_power',
    topic: 'SIP Magic',
    emoji: '🔄',
    question: 'Why is SIP better than lump sum for most people?',
    answer: 'Rupee Cost Averaging! When markets fall, your SIP buys more units. When they rise, fewer units. Over time, this averages your cost and reduces risk.',
    fact: 'SIP in Nifty 50 since 2000: ₹10,000/month = ₹2.7 Cr today (invested just ₹29 lakhs).',
    category: 'SIP',
  },
  {
    id: 'insurance_vs_investment',
    topic: 'Insurance ≠ Investment',
    emoji: '🛡️',
    question: 'Why should you never mix insurance with investment?',
    answer: 'ULIPs and endowment plans give low insurance coverage AND poor returns. Buy term insurance for protection (cheap, high cover) and invest separately in mutual funds.',
    fact: '₹1 Cr term cover costs ~₹12,000/year at age 30. LIC endowment? ~₹5 lakhs/year for same cover!',
    category: 'Insurance',
  },
  {
    id: 'emergency_fund',
    topic: 'Emergency Fund',
    emoji: '🆘',
    question: 'How much should your emergency fund be?',
    answer: '6-12 months of expenses in a liquid fund or savings account. This protects you from job loss, medical emergencies, or urgent repairs without breaking investments.',
    fact: '70% of Indians have less than 3 months emergency savings. Don\'t be in that group!',
    category: 'Planning',
  },
  {
    id: 'diversification',
    topic: 'Diversification',
    emoji: '🥚',
    question: 'Why not put all money in one "best performing" fund?',
    answer: 'Today\'s top performer might be tomorrow\'s worst. Diversify across large cap, mid cap, international, and debt. When one falls, others may rise.',
    fact: 'In 2008, equity fell 52%. Gold rose 30%. In 2020, small caps fell 40%, large caps only 23%.',
    category: 'Strategy',
  },
  {
    id: 'fd_vs_debt_funds',
    topic: 'FD vs Debt Funds',
    emoji: '🏦',
    question: 'Are FDs really the safest option for your money?',
    answer: 'After taxes, FD returns often beat inflation by just 1-2%. Debt mutual funds can give similar safety with better tax efficiency for 3+ year holdings.',
    fact: '7% FD in 30% tax bracket = 4.9% post-tax. Inflation at 6%? You\'re losing purchasing power!',
    category: 'Fixed Income',
  },
  {
    id: 'elss_tax_saving',
    topic: 'ELSS Advantage',
    emoji: '📊',
    question: 'Why is ELSS the best 80C option for most people?',
    answer: 'ELSS has lowest lock-in (3 years vs 5 for FD, 15 for PPF). It\'s equity-linked so can give 12-15% returns. Plus, 80C benefit up to ₹1.5 lakhs.',
    fact: '₹1.5L in ELSS at 12% for 20 years = ₹14 lakhs. Same in PPF at 7.1% = ₹6.5 lakhs.',
    category: 'Tax Saving',
  },
  {
    id: 'expense_ratio',
    topic: 'Expense Ratio',
    emoji: '💸',
    question: 'Does 1% expense ratio really matter?',
    answer: 'Over 30 years, 1% extra fee can eat 25% of your wealth! Index funds charge 0.1-0.2%. Active funds charge 1-2%. Choose wisely.',
    fact: '₹1 Cr at 12% for 30 years = ₹30 Cr. At 11% (1% fee)? Only ₹23 Cr. ₹7 Cr gone in fees!',
    category: 'Costs',
  },
  {
    id: 'rebalancing',
    topic: 'Portfolio Rebalancing',
    emoji: '⚖️',
    question: 'Why should you rebalance your portfolio yearly?',
    answer: 'If equity grows 20% and debt 5%, your 60:40 becomes 65:35. Rebalancing books profits from winners and buys more of laggards at lower prices.',
    fact: 'Rebalanced portfolios historically outperform by 0.5-1% annually with lower volatility.',
    category: 'Strategy',
  },
];

// Get today's lesson based on date
const getTodaysLesson = () => {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return QUICK_LEARN_LESSONS[dayOfYear % QUICK_LEARN_LESSONS.length];
};

/**
 * QuickLearn Component - 30-second daily micro-lessons
 * PREMIUM DESIGN with glass morphism and animated gradients
 */
export default function QuickLearn() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setLesson(getTodaysLesson());
    // Check if already completed today
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem('li_quicklearn_completed');
    if (lastCompleted === today) {
      setCompleted(true);
      setShowAnswer(true);
    }
  }, []);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleComplete = () => {
    setCompleted(true);
    localStorage.setItem('li_quicklearn_completed', new Date().toDateString());
  };

  if (!lesson) return null;

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '20px',
      border: '1px solid rgba(100, 160, 255, 0.15)',
      background: 'linear-gradient(135deg, rgba(100, 140, 220, 0.08) 0%, rgba(140, 100, 200, 0.08) 50%, rgba(180, 100, 160, 0.08) 100%)',
      backdropFilter: 'blur(16px)',
      margin: '16px 0',
    }}>
      {/* Animated gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(100, 160, 255, 0.05) 0%, rgba(140, 100, 200, 0.08) 50%, rgba(180, 100, 160, 0.05) 100%)',
        animation: 'pulseGlow 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      
      <div style={{ position: 'relative', padding: '24px' }}>
        {/* Header with icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(140, 100, 200, 0.25) 0%, rgba(100, 160, 255, 0.25) 100%)',
            border: '1px solid rgba(140, 100, 200, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
            {lesson.emoji}
          </div>
          <div>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(180, 140, 220, 0.9)',
              marginBottom: '4px',
            }}>
              Today's Market Insight
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              background: 'linear-gradient(90deg, rgba(235, 242, 255, 0.95) 0%, rgba(200, 215, 240, 0.85) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {lesson.topic}
            </div>
          </div>
          <div style={{
            marginLeft: 'auto',
            fontSize: '10px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(100, 160, 255, 0.15)',
            border: '1px solid rgba(100, 160, 255, 0.2)',
            color: 'rgba(140, 190, 255, 0.9)',
          }}>
            {lesson.category}
          </div>
        </div>
        
        {/* Question card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '14px',
          padding: '18px',
          marginBottom: '16px',
          border: '1px solid rgba(100, 160, 255, 0.1)',
          borderLeft: '3px solid rgba(140, 100, 200, 0.5)',
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'rgba(220, 230, 250, 0.9)',
            lineHeight: 1.5,
          }}>
            {lesson.question}
          </div>
        </div>
        
        {/* Answer reveal */}
        <AnimatePresence mode="wait">
          {!showAnswer ? (
            <motion.button
              key="reveal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={handleShowAnswer}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, rgba(140, 100, 200, 0.2) 0%, rgba(100, 160, 255, 0.2) 100%)',
                border: '1px solid rgba(140, 100, 200, 0.3)',
                borderRadius: '12px',
                color: 'rgba(200, 180, 240, 0.95)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span>Reveal Answer</span>
              <span>→</span>
            </motion.button>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                background: 'linear-gradient(135deg, rgba(100, 180, 140, 0.12) 0%, rgba(80, 160, 120, 0.08) 100%)',
                borderRadius: '14px',
                padding: '18px',
                border: '1px solid rgba(100, 180, 140, 0.2)',
                marginBottom: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '18px', color: 'rgba(100, 200, 150, 0.9)' }}>✓</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(120, 200, 160, 0.9)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Answer</div>
                    <div style={{ fontSize: '14px', color: 'rgba(220, 240, 230, 0.9)', lineHeight: 1.6 }}>{lesson.answer}</div>
                  </div>
                </div>
              </div>
              
              {/* Fun fact */}
              <div style={{
                background: 'rgba(100, 160, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
                border: '1px solid rgba(100, 160, 255, 0.15)',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(140, 190, 255, 0.9)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  📌 Did you know?
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(180, 210, 240, 0.85)', lineHeight: 1.5 }}>{lesson.fact}</div>
              </div>
              
              {/* Complete button or status */}
              {!completed ? (
                <motion.button
                  onClick={handleComplete}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, rgba(100, 180, 140, 0.25) 0%, rgba(80, 160, 120, 0.25) 100%)',
                    border: '1px solid rgba(100, 180, 140, 0.35)',
                    borderRadius: '10px',
                    color: 'rgba(160, 220, 190, 0.95)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  ✓ Got it!
                </motion.button>
              ) : (
                <div style={{
                  textAlign: 'center',
                  fontSize: '13px',
                  color: 'rgba(140, 200, 170, 0.8)',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  <span style={{
                    background: 'rgba(100, 180, 140, 0.25)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}>✓</span>
                  Completed for today
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Progress indicator */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: 'rgba(180, 195, 230, 0.45)',
        }}>
          <span>Daily lesson · Resets at midnight</span>
          <span>Lesson {(QUICK_LEARN_LESSONS.findIndex(l => l.id === lesson.id) + 1)}/{QUICK_LEARN_LESSONS.length}</span>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

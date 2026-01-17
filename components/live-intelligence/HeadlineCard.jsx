'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES, URGENCY_LEVELS, formatRelativeTime } from '@/lib/live-intelligence/headlines';

// ═══════════════════════════════════════════════════════════
// CTA BUTTONS BY CATEGORY - Opens WhatsApp or service page
// ═══════════════════════════════════════════════════════════
const CTA_BUTTONS = {
  mutual_funds: {
    text: 'Explore Funds',
    icon: '📊',
    action: () => window.open('/services/mutual-funds', '_blank'),
  },
  insurance: {
    text: 'Get Quote',
    icon: '🛡️',
    action: () => window.open('https://wa.me/918850977259?text=Hi%2C%20I%20saw%20an%20insurance%20update%20on%20BM%20Wealth.%20I%27d%20like%20to%20get%20a%20quote.', '_blank'),
  },
  fixed_income: {
    text: 'Compare Rates',
    icon: '🏦',
    action: () => window.open('/tools/fd-calculator', '_blank'),
  },
  bonds: {
    text: 'Learn More',
    icon: '📜',
    action: () => window.open('/services/fixed-deposits', '_blank'),
  },
  sip: {
    text: 'Start SIP',
    icon: '📈',
    action: () => window.open('https://wa.me/918850977259?text=Hi%2C%20I%20want%20to%20start%20a%20SIP.%20Please%20guide%20me.', '_blank'),
  },
  tax_insight: {
    text: 'Tax Consult',
    icon: '💰',
    action: () => window.open('https://wa.me/918850977259?text=Hi%2C%20I%20need%20tax%20planning%20help.', '_blank'),
  },
  rbi: {
    text: 'Impact Analysis',
    icon: '🏛️',
    action: () => window.open('https://wa.me/918850977259?text=Hi%2C%20I%20want%20to%20understand%20how%20RBI%20policy%20affects%20my%20investments.', '_blank'),
  },
  sebi: {
    text: 'Learn More',
    icon: '📋',
    action: () => window.open('/regulatory-compliance', '_blank'),
  },
  ipo: {
    text: 'IPO Details',
    icon: '🎯',
    action: () => window.open('https://wa.me/918850977259?text=Hi%2C%20I%27m%20interested%20in%20IPO%20investing.%20Please%20share%20details.', '_blank'),
  },
  market_update: {
    text: 'Get Advice',
    icon: '📊',
    action: () => window.open('https://wa.me/918850977259?text=Hi%2C%20I%20saw%20a%20market%20update%20and%20want%20to%20discuss%20my%20portfolio.', '_blank'),
  },
};

// ═══════════════════════════════════════════════════════════
// SAVE FOR LATER - localStorage system
// ═══════════════════════════════════════════════════════════
const savedHeadlines = {
  save: (headline) => {
    if (typeof localStorage === 'undefined') return;
    const saved = JSON.parse(localStorage.getItem('li_saved_headlines') || '[]');
    // Store headline with timestamp
    const entry = { ...headline, savedAt: new Date().toISOString() };
    if (!saved.find(h => h.id === headline.id)) {
      saved.unshift(entry);
      localStorage.setItem('li_saved_headlines', JSON.stringify(saved.slice(0, 50))); // Max 50
    }
  },
  unsave: (headlineId) => {
    if (typeof localStorage === 'undefined') return;
    const saved = JSON.parse(localStorage.getItem('li_saved_headlines') || '[]');
    const filtered = saved.filter(h => h.id !== headlineId);
    localStorage.setItem('li_saved_headlines', JSON.stringify(filtered));
  },
  isSaved: (headlineId) => {
    if (typeof localStorage === 'undefined') return false;
    const saved = JSON.parse(localStorage.getItem('li_saved_headlines') || '[]');
    return saved.some(h => h.id === headlineId);
  },
  getAll: () => {
    if (typeof localStorage === 'undefined') return [];
    return JSON.parse(localStorage.getItem('li_saved_headlines') || '[]');
  },
};

// Export for use in overlay
export { savedHeadlines };

// Detailed explanations for headlines - educational content
const HEADLINE_DETAILS = {
  // SIP related
  'SIP inflows hit all-time high': {
    whatHappened: 'Indian investors invested a record ₹26,459 crore through Systematic Investment Plans (SIPs) in January 2026, surpassing the previous record.',
    whyItHappened: 'Growing financial literacy, increased trust in mutual funds after consistent returns, and easier digital onboarding have made SIP investing mainstream. The government\'s push for financial inclusion and rising disposable income among the middle class are key drivers.',
    howItBenefits: '• Shows strong market confidence from retail investors\n• Higher inflows support market stability during volatility\n• Indicates healthy domestic liquidity — reduces FII dependency\n• Long-term wealth creation becoming a national habit',
    expertTip: 'If you haven\'t started a SIP yet, now is a great time. Even ₹500/month can grow significantly over 10+ years through compounding.',
  },
  'NIFTY crosses 25,000': {
    whatHappened: 'The NIFTY 50 index crossed the historic 25,000 mark for the first time, reflecting strong market momentum and investor confidence.',
    whyItHappened: 'Strong corporate earnings, robust GDP growth, controlled inflation, and continued domestic retail participation. FIIs have also turned net buyers after a period of selling.',
    howItBenefits: '• Portfolio values increase for equity investors\n• Positive sentiment attracts more foreign investment\n• Creates wealth effect — consumer spending may rise\n• Validates India\'s growth story on the global stage',
    expertTip: 'While milestones are exciting, focus on your asset allocation and long-term goals rather than short-term market levels.',
  },
  'FIIs added': {
    whatHappened: 'Foreign Institutional Investors (FIIs) invested ₹2,300 crore in large-cap banking stocks, signaling renewed interest in India\'s financial sector.',
    whyItHappened: 'Attractive valuations after recent corrections, strong loan growth, improving asset quality, and expectations of interest rate cuts making banks more profitable.',
    howItBenefits: '• Banking stocks may see price appreciation\n• Indicates smart money confidence in financials\n• Strengthens rupee due to dollar inflows\n• Good for existing bank stock/fund holders',
    expertTip: 'Consider banking sector funds if you\'re underweight financials. They typically benefit from economic growth cycles.',
  },
  'Gold touches': {
    whatHappened: 'Gold prices reached ₹63,500 per 10 grams as global economic uncertainty and geopolitical tensions increased safe-haven demand.',
    whyItHappened: 'Global uncertainty from geopolitical conflicts, potential US recession fears, and central banks diversifying reserves into gold. Traditionally, gold rises when risk appetite falls.',
    howItBenefits: '• Portfolio hedge against equity volatility\n• Sovereign Gold Bonds earn 2.5% extra interest\n• Gold historically preserves purchasing power\n• Good for diversification — typically 5-10% allocation recommended',
    expertTip: 'SGBs are the best way to hold gold — no storage cost, earn interest, and tax-free at maturity if held 8 years.',
  },
  'RBI signals': {
    whatHappened: 'The Reserve Bank of India indicated it may cut the repo rate in the upcoming February monetary policy meeting, potentially reducing borrowing costs.',
    whyItHappened: 'Inflation has moderated within RBI\'s target range, economic growth remains strong, and global central banks are also turning dovish. Lower rates support economic activity.',
    howItBenefits: '• Lower EMIs for home/car loans\n• Banks\' net interest margins may compress, but loan growth increases\n• Rate-sensitive sectors (real estate, auto) typically rally\n• Existing bond fund holders see NAV appreciation',
    expertTip: 'Consider locking in current FD rates before cuts. For debt funds, medium to long duration funds benefit most from rate cuts.',
  },
  'SBI revises FD rates': {
    whatHappened: 'State Bank of India increased fixed deposit rates, now offering 7.25% for senior citizens — the best rates in 18 months.',
    whyItHappened: 'Banks compete for deposits as credit demand rises. Higher rates attract savers while RBI maintains tight monetary policy to control inflation.',
    howItBenefits: '• Higher risk-free returns for conservative investors\n• Senior citizens get extra 0.50% over regular rates\n• Good for emergency fund parking\n• Tax-saving FDs offer 7.25% with 80C benefit',
    expertTip: 'Ladder your FDs — don\'t put everything in one tenure. This balances liquidity with higher rates.',
  },
  'default': {
    whatHappened: 'This is a significant financial development that impacts investors and the broader market.',
    whyItHappened: 'Multiple economic and market factors contributed to this development, reflecting ongoing trends in the financial ecosystem.',
    howItBenefits: '• Stay informed about market movements\n• Make better investment decisions\n• Understand the broader economic picture\n• Align your portfolio with market conditions',
    expertTip: 'Always consult with your financial advisor before making significant investment decisions based on news.',
  },
};

// Get detailed info for a headline
const getHeadlineDetails = (headline) => {
  const headlineText = headline.headline.toLowerCase();
  
  for (const [key, details] of Object.entries(HEADLINE_DETAILS)) {
    if (key !== 'default' && headlineText.includes(key.toLowerCase())) {
      return details;
    }
  }
  return HEADLINE_DETAILS.default;
};

/**
 * HeadlineCard - Displays a single headline with category, urgency, and CTA
 * Now CLICKABLE with detailed educational modal
 */
export default function HeadlineCard({ headline, isActive = false, onSaveChange }) {
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const touchStartY = useRef(0);
  const category = CATEGORIES[headline.category];
  const urgency = URGENCY_LEVELS[headline.urgency];
  const details = getHeadlineDetails(headline);
  const ctaConfig = CTA_BUTTONS[headline.category];

  // Check if saved on mount
  useEffect(() => {
    setIsSaved(savedHeadlines.isSaved(headline.id));
  }, [headline.id]);

  // Toggle save status
  const handleSave = useCallback((e) => {
    e?.stopPropagation();
    if (isSaved) {
      savedHeadlines.unsave(headline.id);
      setIsSaved(false);
    } else {
      savedHeadlines.save(headline);
      setIsSaved(true);
    }
    onSaveChange?.();
  }, [isSaved, headline, onSaveChange]);

  // Mobile gestures: Long press to save
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    const timer = setTimeout(() => {
      handleSave();
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800);
    setLongPressTimer(timer);
  }, [handleSave]);

  const handleTouchEnd = useCallback((e) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    // Swipe up gesture to open modal
    const touchEndY = e.changedTouches[0].clientY;
    const swipeDistance = touchStartY.current - touchEndY;
    if (swipeDistance > 80) {
      setShowModal(true);
    }
  }, [longPressTimer]);

  const handleTouchMove = useCallback(() => {
    // Cancel long press if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    
    // Lock body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [showModal]);

  const handleCardClick = (e) => {
    // Prevent any scroll behavior from parent containers
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <div 
        className={`li-headline-card ${isActive ? 'active' : ''} ${headline.urgency === 'BREAKING' ? 'breaking' : ''} ${isSaved ? 'saved' : ''}`}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCardClick(e);
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave(e);
          }
        }}
        style={{
          '--urgency-color': urgency?.color || 'rgba(170, 198, 255, 1)',
          '--urgency-dim': urgency?.colorDim || 'rgba(170, 198, 255, 0.25)',
          '--urgency-glow': urgency?.glow || 'rgba(170, 198, 255, 0.3)',
          cursor: 'pointer',
        }}
      >
        {/* Header: Category + Urgency + Time + Save */}
        <div className="li-headline-header">
          <div className="li-headline-category">
            <span className="li-headline-cat-icon">{category?.icon}</span>
            <span className="li-headline-cat-label">{category?.label}</span>
          </div>
          
          {urgency?.key !== 'REGULAR' && (
            <span className={`li-headline-urgency ${urgency?.key?.toLowerCase()}`}>
              {urgency?.label}
            </span>
          )}
          
          <span className="li-headline-time">
            {formatRelativeTime(headline.timestamp)}
          </span>
          
          {/* Save/Bookmark Button */}
          <button
            className={`li-headline-save ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
            title={isSaved ? 'Saved! Click to remove' : 'Save for later'}
          >
            {isSaved ? '🔖' : '📑'}
          </button>
        </div>

        {/* Main Content */}
        <div className="li-headline-body">
          <h4 className="li-headline-title">{headline.headline}</h4>
          <p className="li-headline-why">{headline.whyItMatters}</p>
        </div>

        {/* Footer: Data Point + Source + Read More */}
        <div className="li-headline-footer">
          {headline.dataPoint && (
            <span className="li-headline-data">{headline.dataPoint}</span>
          )}
          <span className="li-headline-source">Source: {headline.source}</span>
          <span className="li-headline-cta">Tap to read more →</span>
        </div>
      </div>

      <style jsx>{`
        .li-headline-card {
          background: linear-gradient(180deg, rgba(20, 25, 35, 0.90) 0%, rgba(12, 14, 20, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px 20px;
          transition: all 0.35s ease;
          opacity: 0.85;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .li-headline-card:hover,
        .li-headline-card.active {
          opacity: 1;
          border-color: var(--urgency-dim);
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.4),
            0 0 40px var(--urgency-glow);
          transform: translateY(-2px);
        }

        /* Breaking News Red Pulse Glow */
        .li-headline-card.breaking {
          border-color: rgba(255, 80, 80, 0.35);
          animation: breakingPulseGlow 2s ease-in-out infinite;
        }

        @keyframes breakingPulseGlow {
          0%, 100% {
            box-shadow:
              0 4px 24px rgba(0, 0, 0, 0.4),
              0 0 30px rgba(255, 80, 80, 0.4),
              inset 0 0 20px rgba(255, 80, 80, 0.05);
          }
          50% {
            box-shadow:
              0 4px 30px rgba(0, 0, 0, 0.5),
              0 0 50px rgba(255, 80, 80, 0.7),
              inset 0 0 30px rgba(255, 80, 80, 0.08);
          }
        }

        .li-headline-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .li-headline-category {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .li-headline-cat-icon {
          font-size: 14px;
        }

        .li-headline-cat-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(180, 195, 230, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .li-headline-urgency {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: var(--urgency-dim);
          color: var(--urgency-color);
        }

        .li-headline-urgency.breaking {
          animation: urgencyPulse 1.5s ease-in-out 3;
        }

        @keyframes urgencyPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .li-headline-time {
          margin-left: auto;
          font-size: 11px;
          color: rgba(180, 195, 230, 0.5);
          font-variant-numeric: tabular-nums;
        }

        /* Save/Bookmark Button */
        .li-headline-save {
          background: none;
          border: none;
          padding: 4px 6px;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.5;
          transition: all 0.2s ease;
          border-radius: 4px;
        }

        .li-headline-save:hover {
          opacity: 1;
          background: rgba(100, 160, 255, 0.15);
        }

        .li-headline-save.saved {
          opacity: 1;
        }

        /* Saved card indicator */
        .li-headline-card.saved {
          border-left: 3px solid rgba(100, 160, 255, 0.6);
        }

        .li-headline-body {
          margin-bottom: 14px;
          flex: 1;
        }

        .li-headline-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.95);
          line-height: 1.4;
          letter-spacing: -0.01em;
        }

        .li-headline-why {
          margin: 0;
          font-size: 14px;
          color: rgba(200, 215, 240, 0.70);
          line-height: 1.5;
        }

        .li-headline-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .li-headline-data {
          font-size: 13px;
          font-weight: 600;
          color: var(--urgency-color);
          font-variant-numeric: tabular-nums;
        }

        .li-headline-source {
          font-size: 11px;
          color: rgba(180, 195, 230, 0.45);
        }

        .li-headline-cta {
          font-size: 11px;
          color: rgba(140, 190, 255, 0.80);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        /* Modal Styles */
        .li-headline-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 100050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: modalFadeIn 0.25s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .li-headline-modal {
          position: relative;
          width: 100%;
          max-width: 580px;
          max-height: 85vh;
          overflow-y: auto;
          background: linear-gradient(180deg, rgba(18, 22, 32, 0.98) 0%, rgba(10, 12, 18, 0.99) 100%);
          border: 1px solid rgba(100, 160, 255, 0.20);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 
            0 24px 80px rgba(0, 0, 0, 0.60),
            0 0 100px rgba(100, 160, 255, 0.08);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }

        .li-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.06);
          border: none;
          border-radius: 50%;
          color: rgba(200, 215, 240, 0.7);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .li-modal-close:hover {
          background: rgba(255, 80, 80, 0.15);
          color: rgba(255, 150, 150, 1);
        }

        .li-modal-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .li-modal-category {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(100, 160, 255, 0.12);
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .li-modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.98);
          line-height: 1.4;
        }

        .li-modal-section {
          margin-bottom: 20px;
        }

        .li-modal-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(140, 190, 255, 0.90);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .li-modal-section-content {
          font-size: 14px;
          color: rgba(200, 215, 240, 0.85);
          line-height: 1.65;
          white-space: pre-line;
        }

        .li-modal-benefits {
          background: rgba(140, 220, 180, 0.06);
          border: 1px solid rgba(140, 220, 180, 0.15);
          border-radius: 12px;
          padding: 16px;
        }

        .li-modal-tip {
          background: linear-gradient(135deg, rgba(100, 160, 255, 0.10) 0%, rgba(140, 190, 255, 0.05) 100%);
          border: 1px solid rgba(100, 160, 255, 0.20);
          border-radius: 12px;
          padding: 16px;
        }

        .li-modal-tip-icon {
          font-size: 20px;
          margin-right: 8px;
        }

        .li-modal-data {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          margin-top: 16px;
        }

        .li-modal-data-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--urgency-color);
          font-variant-numeric: tabular-nums;
        }

        .li-modal-data-source {
          font-size: 11px;
          color: rgba(180, 195, 230, 0.55);
        }

        /* Custom scrollbar for modal */
        .li-headline-modal::-webkit-scrollbar {
          width: 6px;
        }

        .li-headline-modal::-webkit-scrollbar-track {
          background: rgba(20, 25, 35, 0.5);
          border-radius: 10px;
        }

        .li-headline-modal::-webkit-scrollbar-thumb {
          background: rgba(100, 160, 255, 0.35);
          border-radius: 10px;
        }

        @media (max-width: 640px) {
          .li-headline-card {
            padding: 14px 16px;
          }

          .li-headline-title {
            font-size: 15px;
          }

          .li-headline-why {
            font-size: 13px;
          }

          .li-headline-modal {
            padding: 20px;
            border-radius: 16px;
          }

          .li-modal-title {
            font-size: 18px;
          }
        }
      `}</style>

      {/* Detailed Modal */}
      {showModal && typeof document !== 'undefined' && document.body
        ? createPortal(
            <div
              className="li-headline-modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Headline details"
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <div className="li-headline-modal">
                <button
                  className="li-modal-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className="li-modal-header">
                  <div className="li-modal-category">
                    <span>{category?.icon}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'rgba(140, 190, 255, 0.90)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {category?.label}
                    </span>
                  </div>
                  <h3 className="li-modal-title">{headline.headline}</h3>
                </div>

                <div className="li-modal-section">
                  <h4 className="li-modal-section-title">
                    <span>📰</span> What Happened
                  </h4>
                  <p className="li-modal-section-content">{details.whatHappened}</p>
                </div>

                <div className="li-modal-section">
                  <h4 className="li-modal-section-title">
                    <span>🔍</span> Why It Happened
                  </h4>
                  <p className="li-modal-section-content">{details.whyItHappened}</p>
                </div>

                <div className="li-modal-section">
                  <div className="li-modal-benefits">
                    <h4 className="li-modal-section-title" style={{ color: 'rgba(140, 220, 180, 0.95)' }}>
                      <span>✅</span> How It Benefits You
                    </h4>
                    <p className="li-modal-section-content">{details.howItBenefits}</p>
                  </div>
                </div>

                <div className="li-modal-section">
                  <div className="li-modal-tip">
                    <h4 className="li-modal-section-title">
                      <span className="li-modal-tip-icon">💡</span> Expert Tip
                    </h4>
                    <p className="li-modal-section-content">{details.expertTip}</p>
                  </div>
                </div>

                {headline.dataPoint && (
                  <div className="li-modal-data">
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'rgba(200, 215, 240, 0.55)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: '4px',
                        }}
                      >
                        Key Data
                      </div>
                      <div className="li-modal-data-value">{headline.dataPoint}</div>
                    </div>
                    <div className="li-modal-data-source">Source: {headline.source}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="li-modal-actions" style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                }}>
                  {/* Save Button */}
                  <button
                    className={`li-modal-action-btn li-modal-save-btn ${isSaved ? 'saved' : ''}`}
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      minWidth: '140px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: `1px solid ${isSaved ? 'rgba(100, 160, 255, 0.5)' : 'rgba(100, 160, 255, 0.25)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: isSaved ? 'rgba(100, 160, 255, 0.25)' : 'rgba(100, 160, 255, 0.15)',
                      color: 'rgba(140, 190, 255, 0.95)',
                    }}
                  >
                    {isSaved ? '🔖 Saved' : '📑 Save'}
                  </button>
                  
                  {/* CTA Button based on category */}
                  {ctaConfig && (
                    <button
                      className="li-modal-action-btn li-modal-cta-btn"
                      onClick={() => {
                        ctaConfig.action();
                        setShowModal(false);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid rgba(100, 160, 255, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, rgba(100, 160, 255, 0.3) 0%, rgba(80, 140, 220, 0.3) 100%)',
                        color: 'rgba(200, 220, 255, 0.95)',
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{ctaConfig.icon}</span> {ctaConfig.text}
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

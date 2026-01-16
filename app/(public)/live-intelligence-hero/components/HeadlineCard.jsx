'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES, URGENCY_LEVELS, formatRelativeTime } from '@/lib/live-intelligence/headlines';
import { getGamificationTracker } from '@/lib/live-intelligence/gamification';
import { getVoiceReader } from '@/lib/live-intelligence/voice';
import { getPersonalizationEngine } from '@/lib/live-intelligence/personalization';

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
export default function HeadlineCard({ headline, isActive = false }) {
  const [showModal, setShowModal] = useState(false);
  const [portalContainer, setPortalContainer] = useState(null);
  const category = CATEGORIES[headline.category];
  const urgency = URGENCY_LEVELS[headline.urgency];
  const details = getHeadlineDetails(headline);

  // Create portal container on mount (client-side only)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Handle headline click - track read and show modal
  const handleClick = useCallback(() => {
    // Track the read for gamification
    const tracker = getGamificationTracker();
    tracker.recordHeadlineRead(headline.category);
    
    // Track for personalization
    const personalization = getPersonalizationEngine();
    personalization.recordInteraction(headline.category, 'read');
    
    setShowModal(true);
  }, [headline.category]);

  // Handle voice read
  const handleVoiceRead = useCallback((e) => {
    e.stopPropagation();
    const reader = getVoiceReader();
    reader.readHeadline(headline.headline, headline.whyItMatters);
  }, [headline.headline, headline.whyItMatters]);

  return (
    <>
      <div 
        className={`li-headline-card ${isActive ? 'active' : ''} ${urgency?.key === 'BREAKING' ? 'breaking-news' : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        style={{
          '--urgency-color': urgency?.color || 'rgba(170, 198, 255, 1)',
          '--urgency-dim': urgency?.colorDim || 'rgba(170, 198, 255, 0.25)',
          '--urgency-glow': urgency?.glow || 'rgba(170, 198, 255, 0.3)',
          cursor: 'pointer',
        }}
      >
        {/* Header: Category + Urgency + Time + Voice */}
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
          
          {/* Voice read button */}
          <button
            type="button"
            onClick={handleVoiceRead}
            className="li-headline-voice-btn"
            title="Read aloud"
            aria-label="Read this headline aloud"
          >
            🔊
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
        
        .li-headline-voice-btn {
          appearance: none;
          border: none;
          background: rgba(100, 180, 255, 0.08);
          color: rgba(170, 198, 255, 0.75);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: auto;
        }
        
        .li-headline-voice-btn:hover {
          background: rgba(100, 180, 255, 0.18);
          color: rgba(170, 198, 255, 1);
          transform: scale(1.05);
        }

        /* 🔴 BREAKING NEWS - Red pulse glow effect (3x only) */
        .li-headline-card.breaking-news {
          border-color: rgba(255, 80, 80, 0.5);
          animation: breakingNewsGlow 1.5s ease-in-out 3;
          /* Final state after 3 pulses */
          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(255, 80, 80, 0.3),
            0 0 60px rgba(255, 80, 80, 0.15);
        }

        .li-headline-card.breaking-news:hover,
        .li-headline-card.breaking-news.active {
          border-color: rgba(255, 80, 80, 0.7);
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(255, 80, 80, 0.5),
            0 0 80px rgba(255, 80, 80, 0.3),
            inset 0 0 20px rgba(255, 80, 80, 0.05);
        }

        @keyframes breakingNewsGlow {
          0%, 100% {
            box-shadow:
              0 4px 20px rgba(0, 0, 0, 0.3),
              0 0 30px rgba(255, 80, 80, 0.3),
              0 0 60px rgba(255, 80, 80, 0.15);
          }
          50% {
            box-shadow:
              0 4px 24px rgba(0, 0, 0, 0.4),
              0 0 50px rgba(255, 80, 80, 0.5),
              0 0 100px rgba(255, 80, 80, 0.25),
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

        /* 🔴 Breaking urgency badge - enhanced red pulse (3x only) */
        .li-headline-urgency.breaking {
          background: rgba(255, 80, 80, 0.25);
          color: rgba(255, 100, 100, 1);
          animation: breakingBadgePulse 1s ease-in-out 3;
          box-shadow: 0 0 8px rgba(255, 80, 80, 0.4);
        }

        @keyframes breakingBadgePulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 8px rgba(255, 80, 80, 0.4);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.05);
            box-shadow: 0 0 16px rgba(255, 80, 80, 0.6);
          }
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

        .li-headline-body {
          margin-bottom: 14px;
          flex: 1;
        }
          margin-bottom: 14px;
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
          z-index: 9999;
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

      {/* Detailed Modal - Rendered via Portal to escape overlay scroll context */}
      {showModal && portalContainer && createPortal(
        <div 
          className="li-headline-modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 12, 20, 0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 99999,
            animation: 'liModalFadeIn 0.25s ease-out',
          }}
        >
          <style>{`
            @keyframes liModalFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes liModalSlideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div 
            className="li-headline-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'linear-gradient(165deg, rgba(25, 35, 55, 0.98) 0%, rgba(15, 22, 38, 0.98) 100%)',
              border: '1px solid rgba(100, 160, 255, 0.20)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(100, 160, 255, 0.15)',
              animation: 'liModalSlideUp 0.3s ease-out',
            }}
          >
            <button 
              className="li-modal-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(false);
              }}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                border: 'none',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(200, 215, 240, 0.7)',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ✕
            </button>

            <div className="li-modal-header" style={{ marginBottom: '20px' }}>
              <div className="li-modal-category" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span>{category?.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(140, 190, 255, 0.90)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {category?.label}
                </span>
              </div>
              <h3 className="li-modal-title" style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: 'rgba(235, 242, 255, 0.98)',
                lineHeight: 1.4,
              }}>{headline.headline}</h3>
            </div>

            <div className="li-modal-section" style={{ marginBottom: '20px' }}>
              <h4 className="li-modal-section-title" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 0 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(140, 190, 255, 0.90)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                <span>📰</span> What Happened
              </h4>
              <p className="li-modal-section-content" style={{
                fontSize: '14px',
                color: 'rgba(200, 215, 240, 0.85)',
                lineHeight: 1.65,
                whiteSpace: 'pre-line',
                margin: 0,
              }}>{details.whatHappened}</p>
            </div>

            <div className="li-modal-section" style={{ marginBottom: '20px' }}>
              <h4 className="li-modal-section-title" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 0 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(140, 190, 255, 0.90)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                <span>🔍</span> Why It Happened
              </h4>
              <p className="li-modal-section-content" style={{
                fontSize: '14px',
                color: 'rgba(200, 215, 240, 0.85)',
                lineHeight: 1.65,
                whiteSpace: 'pre-line',
                margin: 0,
              }}>{details.whyItHappened}</p>
            </div>

            <div className="li-modal-section" style={{ marginBottom: '20px' }}>
              <div className="li-modal-benefits" style={{
                background: 'rgba(140, 220, 180, 0.06)',
                border: '1px solid rgba(140, 220, 180, 0.15)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <h4 className="li-modal-section-title" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 0 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(140, 220, 180, 0.95)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  <span>✅</span> How It Benefits You
                </h4>
                <p className="li-modal-section-content" style={{
                  fontSize: '14px',
                  color: 'rgba(200, 215, 240, 0.85)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-line',
                  margin: 0,
                }}>{details.howItBenefits}</p>
              </div>
            </div>

            <div className="li-modal-section" style={{ marginBottom: '20px' }}>
              <div className="li-modal-tip" style={{
                background: 'linear-gradient(135deg, rgba(100, 160, 255, 0.10) 0%, rgba(140, 190, 255, 0.05) 100%)',
                border: '1px solid rgba(100, 160, 255, 0.20)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <h4 className="li-modal-section-title" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 0 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(140, 190, 255, 0.90)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>💡</span> Expert Tip
                </h4>
                <p className="li-modal-section-content" style={{
                  fontSize: '14px',
                  color: 'rgba(200, 215, 240, 0.85)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-line',
                  margin: 0,
                }}>{details.expertTip}</p>
              </div>
            </div>

            {headline.dataPoint && (
              <div className="li-modal-data" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                marginTop: '16px',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(200, 215, 240, 0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    Key Data
                  </div>
                  <div className="li-modal-data-value" style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: urgency?.color || 'rgba(170, 198, 255, 1)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{headline.dataPoint}</div>
                </div>
                <div className="li-modal-data-source" style={{
                  fontSize: '11px',
                  color: 'rgba(180, 195, 230, 0.55)',
                }}>Source: {headline.source}</div>
              </div>
            )}
          </div>
        </div>,
        portalContainer
      )}
    </>
  );
}

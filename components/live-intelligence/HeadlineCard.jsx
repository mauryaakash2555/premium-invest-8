'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES, URGENCY_LEVELS, formatRelativeTime } from '@/lib/live-intelligence/headlines';
import { trackCtaClick } from '@/lib/live-intelligence/analytics';
import { getExplainUserContext } from '@/lib/live-intelligence/userContextClient';

const PORTFOLIO_STORAGE_KEY = 'li_portfolio_context_v1';

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeTicker(value) {
  const s = String(value || '').trim();
  if (!s) return '';
  return s.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function getPortfolioTickersFromStorage() {
  if (typeof window === 'undefined') return [];
  const raw = safeJsonParse(window.localStorage.getItem(PORTFOLIO_STORAGE_KEY) || 'null', null);
  const list = Array.isArray(raw?.tickers) ? raw.tickers : Array.isArray(raw?.symbols) ? raw.symbols : [];
  const cleaned = (list || [])
    .map((t) => normalizeTicker(t))
    .filter(Boolean)
    .slice(0, 20);
  return Array.from(new Set(cleaned));
}

function getMatchedPortfolioTickers(headlineText, portfolioTickers) {
  const text = String(headlineText || '');
  if (!text || !Array.isArray(portfolioTickers) || portfolioTickers.length === 0) return [];

  const upper = text.toUpperCase();
  const matches = [];

  for (const rawTicker of portfolioTickers) {
    const ticker = normalizeTicker(rawTicker);
    if (!ticker || ticker.length < 2) continue;
    // word-boundary-ish match for common tickers
    const re = new RegExp(`(^|[^A-Z0-9])${ticker}([^A-Z0-9]|$)`);
    if (re.test(upper)) matches.push(ticker);
  }

  return matches.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════
// ⚠️ PALETTE NOTE (Jan 21, 2026 spec):
// Avoid muddy/tan washes. Premium accents are allowed (including gold for IMPORTANT / market_close).
// Keep backgrounds neutral and glassy; use accents sparingly.
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// CATEGORY SHORT CODES - Clean text labels with symbols
// ═══════════════════════════════════════════════════════════
const CATEGORY_SHORT_CODES = {
  mutual_funds: 'MF',
  insurance: 'INS',
  sip: 'SIP',
  bonds: 'BOND',
  pms_aif: '◆ PMS',
  trading: 'TRADE',
  fixed_income: 'FD',
  ipo: 'IPO',
  market: 'MKT',
  regulatory: 'REG',
  global: 'GLOBAL',
  sectors: 'SECT',
  economy: 'ECON',
  breaking: 'ALERT',
  corporate: 'CORP',
  results: 'RSLT',
  insider: 'DEAL',
  forex_gold: 'FX',
  real_estate: 'REALTY',
  rbi: 'RBI',
  sebi: 'SEBI',
  tax_insight: 'TAX',
  market_update: 'MKT',
};

const getCategoryShortCode = (categoryKey) => {
  return CATEGORY_SHORT_CODES[categoryKey] || categoryKey?.toUpperCase()?.slice(0, 4) || 'NEWS';
};

const getTrustBadge = (trustLabel, trustScore) => {
  const label = String(trustLabel || '').toLowerCase();
  if (!label) return null;

  if (label === 'official') return { text: 'OFFICIAL', variant: 'official', title: 'Official source' };
  if (label === 'reputable') return { text: 'REPUTABLE', variant: 'reputable', title: 'Reputable source' };
  if (label === 'community') return { text: 'COMMUNITY', variant: 'community', title: 'Community / social source' };
  const score = typeof trustScore === 'number' ? trustScore : null;
  return { text: score != null ? `TRUST ${score}` : 'TRUST', variant: 'unknown', title: 'Source trust signal' };
};

// ═══════════════════════════════════════════════════════════
// CTA BUTTONS BY CATEGORY - Opens WhatsApp or service page
// ═══════════════════════════════════════════════════════════
const CTA_BUTTONS = {
  mutual_funds: {
    text: 'Explore Funds',
    icon: '📊',
    action: () => window.open('/mutual-funds', '_blank'),
  },
  insurance: {
    text: 'Get Quote',
    icon: '🛡️',
    action: () => window.open('https://wa.me/918850977259?text=Hi%2C%20I%20saw%20an%20insurance%20update%20on%20BM%20Wealth.%20I%27d%20like%20to%20get%20a%20quote.', '_blank'),
  },
  fixed_income: {
    text: 'Compare Rates',
    icon: '🏦',
    action: () => window.open('/fixed-deposits', '_blank'),
  },
  bonds: {
    text: 'Learn More',
    icon: '📜',
    action: () => window.open('/fixed-deposits', '_blank'),
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
    const savedRaw = localStorage.getItem('li_saved_headlines') || '[]';
    const saved = Array.isArray(safeJsonParse(savedRaw, [])) ? safeJsonParse(savedRaw, []) : [];
    // Store headline with timestamp
    const entry = { ...headline, savedAt: new Date().toISOString() };
    if (!saved.find(h => h.id === headline.id)) {
      saved.unshift(entry);
      try {
        localStorage.setItem('li_saved_headlines', JSON.stringify(saved.slice(0, 50))); // Max 50
      } catch {
        // ignore write errors
      }
    }
  },
  unsave: (headlineId) => {
    if (typeof localStorage === 'undefined') return;
    const savedRaw = localStorage.getItem('li_saved_headlines') || '[]';
    const saved = Array.isArray(safeJsonParse(savedRaw, [])) ? safeJsonParse(savedRaw, []) : [];
    const filtered = saved.filter(h => h && h.id !== headlineId);
    try {
      localStorage.setItem('li_saved_headlines', JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },
  isSaved: (headlineId) => {
    if (typeof localStorage === 'undefined') return false;
    const savedRaw = localStorage.getItem('li_saved_headlines') || '[]';
    const saved = Array.isArray(safeJsonParse(savedRaw, [])) ? safeJsonParse(savedRaw, []) : [];
    return saved.some(h => h && h.id === headlineId);
  },
  getAll: () => {
    if (typeof localStorage === 'undefined') return [];
    const savedRaw = localStorage.getItem('li_saved_headlines') || '[]';
    const saved = safeJsonParse(savedRaw, []);
    return Array.isArray(saved) ? saved : [];
  },
};

// Export for use in overlay
export { savedHeadlines };

function deriveDetailsFromHeadline(headline) {
  const whatHappened =
    headline?.block_what_happened ||
    headline?.what_happened ||
    headline?.headline ||
    '';
  const whyItMatters =
    headline?.block_why_it_matters ||
    headline?.why_it_matters ||
    headline?.whyItMatters ||
    '';
  const howItBenefits =
    headline?.block_where_fits ||
    headline?.how_it_benefits ||
    headline?.where_fits ||
    headline?.block_who_cares ||
    '';
  const expertTip = headline?.expert_tip || '';

  return { whatHappened, whyItMatters, howItBenefits, expertTip };
}

// Get detailed info for a headline - prioritize AI-generated content from database
const getHeadlineDetails = (headline) => {
  return deriveDetailsFromHeadline(headline);
};

/**
 * HeadlineCard - Displays a single headline with category, urgency, and CTA
 * CLICKABLE with AI-powered detailed educational modal
 * 
 * Props:
 * - headline: The headline data object
 * - isActive: Whether the card is currently active/highlighted
 * - onSaveChange: Callback when save status changes
 * - mode: 'live' (default) opens modal, 'archive' opens source URL
 */
export default function HeadlineCard({ headline, isActive = false, onSaveChange, mode = 'live' }) {
  const [showModal, setShowModal] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [, setNowTick] = useState(0);

    // Keep relative-time labels fresh (e.g., 26m → 27m)
    useEffect(() => {
      const t = setInterval(() => setNowTick((x) => x + 1), 60000);
      return () => clearInterval(t);
    }, []);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [portfolioTickers, setPortfolioTickers] = useState([]);
  const touchStartY = useRef(0);
  const category = CATEGORIES[headline.category];

  const headlineTitle = String(
    headline?.headline ||
      headline?.title ||
      headline?.block_what_happened ||
      headline?.what_happened ||
      ''
  ).trim();
  const urgency = URGENCY_LEVELS[headline.urgency];
  const ctaConfig = CTA_BUTTONS[headline.category];

  // Lightweight portfolio context (optional): highlight headlines mentioning your tickers.
  useEffect(() => {
    setPortfolioTickers(getPortfolioTickersFromStorage());
    const onStorage = (e) => {
      if (!e || e.key === PORTFOLIO_STORAGE_KEY) {
        setPortfolioTickers(getPortfolioTickersFromStorage());
      }
    };
    const onPortfolioUpdated = () => setPortfolioTickers(getPortfolioTickersFromStorage());
    window.addEventListener('storage', onStorage);
    window.addEventListener('li-portfolio-updated', onPortfolioUpdated);
    return () => {
      window.removeEventListener('li-portfolio-updated', onPortfolioUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const portfolioMatches = getMatchedPortfolioTickers(headlineTitle, portfolioTickers);

  // Fetch AI content when modal opens
  useEffect(() => {
    if (!showModal || aiContent) return;
    
    // Check if headline already has AI content from database
    if (headline.block_what_happened && headline.block_what_happened !== 'Processing...') {
      setAiError(null);
      setAiContent(deriveDetailsFromHeadline(headline));
      return;
    }
    
    // Fetch AI-generated content
    setAiLoading(true);
    setAiError(null);
    const titleForAi = headlineTitle || 'Market update';

    fetch('/api/live-intelligence/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: titleForAi,
        category: headline.category,
        whyItMatters: headline.whyItMatters,
        dataPoint: headline.dataPoint,
        source: headline.source,
        url: headline.url,
        trustLabel: headline.trustLabel,
        trustScore: headline.trustScore,
        opportunityScore: headline.opportunityScore,
        riskLevel: headline.riskLevel,
        userContext: getExplainUserContext(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.content) {
          setAiContent(data.content);
        } else {
          setAiError('AI explanation unavailable');
          setAiContent(null);
        }
      })
      .catch(() => {
        setAiError('AI explanation unavailable');
        setAiContent(null);
      })
      .finally(() => setAiLoading(false));
  }, [showModal, aiContent, headline]);

  // Reset AI content when headline changes
  useEffect(() => {
    setAiContent(null);
    setAiError(null);
  }, [headline.id]);

  // Get display content (AI or fallback)
  const details = aiContent || deriveDetailsFromHeadline(headline);

  // Check if saved on mount
  useEffect(() => {
    setIsSaved(savedHeadlines.isSaved(headline.id));
  }, [headline.id]);

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

  // Track if user is scrolling to prevent accidental card opens
  const isScrollingRef = useRef(false);
  const touchStartXRef = useRef(0);

  // Mobile gestures: Long press to save
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    isScrollingRef.current = false;
    const timer = setTimeout(() => {
      if (!isScrollingRef.current) {
        handleSave();
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(50);
      }
    }, 800);
    setLongPressTimer(timer);
  }, [handleSave]);

  const handleTouchEnd = useCallback((e) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    // Only trigger swipe-to-open if NOT scrolling (minimal movement)
    if (!isScrollingRef.current) {
      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY.current - touchEndY;
      // Swipe up gesture to open modal - increased threshold
      if (swipeDistance > 100) {
        setShowModal(true);
      }
    }
  }, [longPressTimer]);

  const handleTouchMove = useCallback((e) => {
    // Track movement - if user moves more than 15px, they are scrolling
    const moveY = Math.abs(e.touches[0].clientY - touchStartY.current);
    const moveX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
    if (moveY > 15 || moveX > 15) {
      isScrollingRef.current = true;
    }
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
    
    // Don't open if user was scrolling (mobile)
    if (isScrollingRef.current) {
      return;
    }
    
    // In archive mode, open source URL directly
    if (mode === 'archive') {
      const sourceUrl = headline.cta_button?.link || headline.sourceUrl || headline.link;
      if (sourceUrl) {
        window.open(sourceUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    
    // Default: open the AI explanation modal
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
        {/* Header: Prominent Category Badge + Urgency + Time + Save */}
        <div className="li-headline-header">
          {/* BREAKING Badge - prominent red for breaking news */}
          {headline.urgency === 'BREAKING' && (
            <span className="li-breaking-badge">
              <span className="li-breaking-dot" />
              BREAKING
            </span>
          )}

          {headline.urgency === 'IMPORTANT' && (
            <span className="li-breaking-badge">
              <span className="li-breaking-dot" />
              IMPORTANT
            </span>
          )}
          
          <div className={`li-cat-badge cat-${headline.category}`}>
            {getCategoryShortCode(headline.category)}
          </div>
          
          {urgency?.key !== 'REGULAR' && urgency?.key !== 'BREAKING' && urgency?.key !== 'IMPORTANT' && (
            <span className={`li-headline-urgency ${urgency?.key?.toLowerCase()}`}>
              {urgency?.label}
            </span>
          )}
          
          <span className="li-headline-time">
            {formatRelativeTime(headline.timestamp)}
          </span>

          {/* Micro-badges: Trust / Opportunity / Risk (clean, non-animated) */}
          {(() => {
            const trust = getTrustBadge(headline.trustLabel, headline.trustScore);
            const riskLevel = String(headline.riskLevel || '').toLowerCase();
            const opp = typeof headline.opportunityScore === 'number' ? headline.opportunityScore : null;
            const hasPortfolioMatch = Array.isArray(portfolioMatches) && portfolioMatches.length > 0;

            const showOpp = opp != null && opp >= 70;
            const showRisk = riskLevel === 'moderate' || riskLevel === 'high';

            // Keep header clean: trust + (risk OR opportunity)
            const secondary = showRisk
              ? { text: riskLevel === 'high' ? 'RISK HIGH' : 'RISK MOD', variant: riskLevel, title: 'Risk signal (heuristic)' }
              : showOpp
                ? { text: `OPP ${opp}`, variant: 'opportunity', title: 'Opportunity signal (heuristic)' }
                : null;

            if (!trust && !secondary && !hasPortfolioMatch) return null;
            return (
              <span className="li-signal-group" onClick={(e) => e.stopPropagation()}>
                {trust && (
                  <span className={`li-signal-badge trust ${trust.variant}`} title={trust.title}>
                    {trust.text}
                  </span>
                )}
                {secondary && (
                  <span className={`li-signal-badge ${secondary.variant}`} title={secondary.title}>
                    {secondary.text}
                  </span>
                )}
                {hasPortfolioMatch && (
                  <span
                    className="li-signal-badge portfolio"
                    title={`Matches your portfolio context: ${portfolioMatches.join(', ')}`}
                  >
                    YOUR LIST
                  </span>
                )}
              </span>
            );
          })()}
          
          {/* Save/Bookmark Button - clean icon */}
          <button
            className={`li-headline-save ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
            title={isSaved ? 'Saved! Click to remove' : 'Save for later'}
          >
            {isSaved ? '★' : '☆'}
          </button>
        </div>

        {/* Main Content */}
        <div className="li-headline-body">
          <h4 className="li-headline-title" title={headlineTitle || undefined}>
            {headlineTitle || 'Market update'}
          </h4>
          <p className="li-headline-why">{headline.whyItMatters}</p>
        </div>

        {/* Footer: Data Point + Source + Read More */}
        <div className="li-headline-footer">
          {headline.dataPoint && (
            <span className="li-headline-data">{headline.dataPoint}</span>
          )}
          <span className="li-headline-source">
            Source: {headline.source}
            {headline.url ? (
              <button
                type="button"
                className="li-source-link"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(String(headline.url), '_blank', 'noopener,noreferrer');
                }}
                aria-label="Open source"
                title="Open source"
              >
                ↗
              </button>
            ) : null}
          </span>
          {ctaConfig ? (
            <button
              type="button"
              className="li-headline-action"
              onClick={(e) => {
                e.stopPropagation();
                trackCtaClick(headline, { text: ctaConfig.text });
                ctaConfig.action();
              }}
            >
              {ctaConfig.text} →
            </button>
          ) : (
            <span className="li-headline-cta">Tap to read more →</span>
          )}
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
          animation: breakingPulseGlow 2s ease-in-out 3;
        }

        /* BREAKING BADGE - Prominent red badge */
        .li-breaking-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: linear-gradient(135deg, rgba(220, 40, 40, 0.95) 0%, rgba(180, 30, 30, 0.95) 100%);
          border: 1px solid rgba(255, 100, 100, 0.5);
          border-radius: 4px;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(255, 60, 60, 0.4);
          animation: breakingBadgePulse 1.5s ease-in-out infinite;
        }

        .li-breaking-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          animation: breakingDotPulse 1s ease-in-out infinite;
        }

        @keyframes breakingBadgePulse {
          0%, 100% { opacity: 1; box-shadow: 0 2px 8px rgba(255, 60, 60, 0.4); }
          50% { opacity: 0.9; box-shadow: 0 2px 16px rgba(255, 60, 60, 0.6); }
        }

        @keyframes breakingDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.8); }
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

        /* PROMINENT CATEGORY BADGE - Clean text, no emoji */
        .li-cat-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 5px 10px;
          border-radius: 4px;
          background: rgba(100, 160, 255, 0.12);
          border: 1px solid rgba(100, 160, 255, 0.25);
          color: rgba(140, 190, 255, 0.95);
        }
        
        /* Category-specific colors for easy recognition */
        .li-cat-badge.cat-mutual_funds { 
          background: rgba(100, 180, 140, 0.12); 
          border-color: rgba(100, 180, 140, 0.3); 
          color: rgba(140, 210, 170, 0.95); 
        }
        .li-cat-badge.cat-sip { 
          background: rgba(80, 160, 220, 0.12); 
          border-color: rgba(80, 160, 220, 0.3); 
          color: rgba(120, 190, 255, 0.95); 
        }
        .li-cat-badge.cat-insurance { 
          background: rgba(80, 180, 200, 0.12); 
          border-color: rgba(80, 180, 200, 0.3); 
          color: rgba(120, 210, 230, 0.95); 
        }
        .li-cat-badge.cat-pms_aif { 
          background: rgba(180, 120, 220, 0.12); 
          border-color: rgba(180, 120, 220, 0.3); 
          color: rgba(200, 160, 240, 0.95); 
        }
        .li-cat-badge.cat-bonds { 
          background: rgba(120, 170, 255, 0.10);
          border-color: rgba(120, 170, 255, 0.28);
          color: rgba(170, 215, 255, 0.95);
        }
        .li-cat-badge.cat-fixed_income { 
          background: rgba(140, 160, 180, 0.12); 
          border-color: rgba(140, 160, 180, 0.3); 
          color: rgba(180, 200, 220, 0.95); 
        }
        .li-cat-badge.cat-ipo { 
          background: rgba(255, 140, 100, 0.12); 
          border-color: rgba(255, 140, 100, 0.3); 
          color: rgba(255, 170, 140, 0.95); 
        }
        .li-cat-badge.cat-breaking { 
          background: rgba(255, 80, 80, 0.12); 
          border-color: rgba(255, 80, 80, 0.4); 
          color: rgba(255, 120, 120, 0.95);
          animation: breakingBadge 1.5s ease-in-out 3;
        }
        @keyframes breakingBadge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
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

        .li-signal-group {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .li-signal-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(210, 225, 255, 0.82);
          user-select: none;
          white-space: nowrap;
        }

        .li-signal-badge.official {
          border-color: rgba(80, 200, 140, 0.35);
          background: rgba(80, 200, 140, 0.10);
          color: rgba(150, 240, 200, 0.92);
        }
        .li-signal-badge.reputable {
          border-color: rgba(120, 170, 255, 0.35);
          background: rgba(120, 170, 255, 0.10);
          color: rgba(180, 215, 255, 0.92);
        }
        .li-signal-badge.community {
          border-color: rgba(255, 190, 90, 0.35);
          background: rgba(255, 190, 90, 0.10);
          color: rgba(255, 220, 170, 0.92);
        }
        .li-signal-badge.unknown {
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.05);
        }

        .li-signal-badge.opportunity {
          border-color: rgba(80, 200, 140, 0.25);
          background: rgba(80, 200, 140, 0.07);
          color: rgba(150, 240, 200, 0.80);
        }
        .li-signal-badge.portfolio {
          border-color: rgba(255, 210, 110, 0.30);
          background: rgba(255, 210, 110, 0.08);
          color: rgba(255, 225, 160, 0.90);
        }
        .li-signal-badge.moderate {
          border-color: rgba(255, 190, 90, 0.30);
          background: rgba(255, 190, 90, 0.08);
          color: rgba(255, 220, 170, 0.86);
        }
        .li-signal-badge.high {
          border-color: rgba(255, 90, 90, 0.35);
          background: rgba(255, 90, 90, 0.10);
          color: rgba(255, 170, 170, 0.92);
        }

        /* Save/Bookmark Button - clean star icon */
        .li-headline-save {
          background: none;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 16px;
          color: rgba(180, 195, 230, 0.4);
          opacity: 0.7;
          transition: all 0.2s ease;
          border-radius: 4px;
        }

        .li-headline-save:hover {
          opacity: 1;
          color: rgba(100, 160, 255, 0.9);
          background: rgba(100, 160, 255, 0.15);
        }

        .li-source-link {
          margin-left: 8px;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.10);
          color: rgba(180, 195, 230, 0.65);
          padding: 2px 6px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          line-height: 1;
          opacity: 0.9;
          transition: all 0.15s ease;
        }

        .li-source-link:hover {
          opacity: 1;
          color: rgba(140, 190, 255, 0.95);
          border-color: rgba(140, 190, 255, 0.25);
          background: rgba(140, 190, 255, 0.08);
        }

        .li-headline-save.saved {
          opacity: 1;
          color: rgba(255, 200, 80, 0.95);
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

        .li-headline-action {
          border: 1px solid rgba(100, 160, 255, 0.22);
          background: rgba(100, 160, 255, 0.10);
          color: rgba(140, 190, 255, 0.9);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-radius: 10px;
          padding: 8px 10px;
          cursor: pointer;
          white-space: nowrap;
        }

        .li-headline-action:hover {
          background: rgba(100, 160, 255, 0.16);
          border-color: rgba(100, 160, 255, 0.30);
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

        @keyframes li-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .li-ai-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(100, 160, 255, 0.2);
          border-top: 3px solid rgba(100, 160, 255, 0.9);
          border-radius: 50%;
          animation: li-spin 1s linear infinite;
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
                  {/* Top bar: Category + Source + Date */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}>
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
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(180, 195, 220, 0.55)',
                    }}>
                      {headline.source} • {formatRelativeTime(headline.published_at || headline.created_at)}
                    </span>
                  </div>
                  {/* Headline - no logo here, clean title */}
                  <h3 className="li-modal-title" style={{ marginTop: 0 }}>{headlineTitle || 'Market update'}</h3>
                </div>

                {/* AI Loading State */}
                {aiLoading && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    gap: '16px',
                  }}>
                    <div className="li-ai-spinner" />
                    <p style={{
                      color: 'rgba(140, 180, 255, 0.8)',
                      fontSize: '14px',
                      margin: 0,
                    }}>Generating AI insights...</p>
                  </div>
                )}

                {/* Content - shown when not loading */}
                {!aiLoading && (
                  <>
                    <div className="li-modal-section">
                      <h4 className="li-modal-section-title">
                        <span>📰</span> What Happened
                      </h4>
                      <p className="li-modal-section-content">{details.whatHappened}</p>
                    </div>

                    <div className="li-modal-section">
                      <h4 className="li-modal-section-title">
                        <span>🔍</span> Why It Matters
                      </h4>
                      <p className="li-modal-section-content">{details.whyItMatters || details.whyItHappened}</p>
                    </div>

                    {details.whyThisMattersToYou && (
                      <div className="li-modal-section">
                        <h4 className="li-modal-section-title">
                          <span>🎯</span> Why This Matters To You
                        </h4>
                        <p className="li-modal-section-content">{details.whyThisMattersToYou}</p>
                      </div>
                    )}

                    <div className="li-modal-section">
                      <div className="li-modal-benefits">
                        <h4 className="li-modal-section-title" style={{ color: 'rgba(140, 220, 180, 0.95)' }}>
                          <span>💰</span> How It Affects You
                        </h4>
                        <p className="li-modal-section-content" style={{ whiteSpace: 'pre-line' }}>{details.howItBenefits}</p>
                      </div>
                    </div>

                    <div className="li-modal-section">
                      <div className="li-modal-tip">
                        <h4 className="li-modal-section-title">
                          <span className="li-modal-tip-icon">💡</span> Context (Education)
                        </h4>
                        <p className="li-modal-section-content">{details.expertTip}</p>
                      </div>
                    </div>

                    {/* View Archive Link */}
                    <div style={{
                      marginTop: '12px',
                      textAlign: 'center',
                    }}>
                      <a 
                        href="/archive"
                        style={{
                          color: 'rgba(140, 180, 255, 0.8)',
                          fontSize: '13px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowModal(false);
                          window.location.href = '/archive';
                        }}
                      >
                        📂 View Intelligence Archive →
                      </a>
                    </div>
                  </>
                )}

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

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentModeConfig, getISTTime } from '@/lib/live-intelligence/modes';
import { downloadDailySummaryPDF } from '@/lib/live-intelligence/pdfGenerator';
import WhatsAppShare from './WhatsAppShare';
import { trackNightSummaryView } from '@/lib/live-intelligence/analytics';

/**
 * NightSummary - Instagram-style swipeable cards for 9PM-12AM
 * 
 * 5 Slides:
 * 1. Markets Recap (NIFTY, SENSEX, Bank Nifty, FII)
 * 2. Top Gainers/Losers
 * 3. Key Developments (4 items)
 * 4. Tomorrow's Watch
 * 5. Share Summary (WhatsApp CTA)
 * 
 * Fetches real data from /api/live-intelligence/night-summary
 */

// Default summary structure (shown while loading)
const DEFAULT_SUMMARY = {
  date: new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }),
  markets: {
    nifty: { value: 24850, change: 125, percent: 0.51 },
    sensex: { value: 81950, change: 380, percent: 0.47 },
    bankNifty: { value: 52100, change: 245, percent: 0.47 },
    fii: { value: 1250, type: 'buyer' },
  },
  gainers: [
    { name: 'HDFC Bank', change: 2.8 },
    { name: 'Reliance', change: 2.3 },
    { name: 'TCS', change: 1.9 },
  ],
  losers: [
    { name: 'Adani Ports', change: -1.5 },
    { name: 'ONGC', change: -1.2 },
    { name: 'Coal India', change: -0.9 },
  ],
  developments: [
    { icon: '💰', text: 'FIIs net buyers for 3rd consecutive session' },
    { icon: '📈', text: 'IT stocks rally on strong US market cues' },
    { icon: '🏦', text: 'Banking sector leads gains' },
    { icon: '⚡', text: 'Oil prices stabilize, supports market sentiment' },
  ],
  tomorrow: [
    { time: '9:15 AM', text: 'Market opens - Watch for gap-up continuation' },
    { time: '10:00 AM', text: 'Q3 earnings: HDFC Bank results' },
    { time: '2:30 PM', text: 'RBI policy meeting outcome expected' },
  ],
  isLive: false,
};

export default function NightSummary() {
  const [mode, setMode] = useState(null);
  const [time, setTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [summaryData, setSummaryData] = useState(DEFAULT_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackedViewRef = useRef(false);
  
  const TOTAL_SLIDES = 5;

  useEffect(() => {
    const checkMode = () => {
      const currentMode = getCurrentModeConfig();
      setMode(currentMode);
      setTime(getISTTime());
      setIsVisible(currentMode.key === 'night_summary');
    };

    checkMode();
    const interval = setInterval(checkMode, 60000);
    return () => clearInterval(interval);
  }, []);

  // Analytics: count a view when the dashboard becomes visible
  useEffect(() => {
    if (!isVisible) return;
    if (trackedViewRef.current) return;
    trackedViewRef.current = true;
    trackNightSummaryView({ surface: 'night_summary' });
  }, [isVisible]);

  // Fetch night summary data from API
  useEffect(() => {
    if (!isVisible) return;
    
    async function fetchSummary() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/live-intelligence/night-summary');
        const data = await response.json();
        
        if (data.success && data.markets) {
          setSummaryData({
            date: data.date || DEFAULT_SUMMARY.date,
            markets: data.markets || DEFAULT_SUMMARY.markets,
            gainers: data.gainers?.length > 0 ? data.gainers : DEFAULT_SUMMARY.gainers,
            losers: data.losers?.length > 0 ? data.losers : DEFAULT_SUMMARY.losers,
            developments: data.developments?.length > 0 ? data.developments : DEFAULT_SUMMARY.developments,
            tomorrow: data.tomorrow?.length > 0 ? data.tomorrow : DEFAULT_SUMMARY.tomorrow,
            isLive: data.isLive ?? true,
          });
        } else {
          // API failed - use DEFAULT_SUMMARY
          setSummaryData(DEFAULT_SUMMARY);
          setError(data.message || 'Failed to load summary');
        }
      } catch (err) {
        console.error('Failed to fetch night summary:', err);
        // On error - use DEFAULT_SUMMARY
        setSummaryData(DEFAULT_SUMMARY);
        setError('Unable to load market summary');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSummary();
    return () => {};
  }, [isVisible]);

  // Auto-advance every 10 seconds
  useEffect(() => {
    if (!isVisible || !isAutoPlaying) return;
    
    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [currentSlide, isVisible, isAutoPlaying]);

  const goToSlide = useCallback((index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 30 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 30000);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 30000);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 30000);
  }, []);

  // Swipe handlers
  const handleDragEnd = useCallback((e, { offset, velocity }) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000) {
      nextSlide();
    } else if (swipe > 10000) {
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  // Slide 5: Share Summary
  // Must be declared before any early return to keep hook order stable.
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePdfDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadDailySummaryPDF({
        summary: summaryData,
        headlines: summaryData.developments.map((d) => ({
          headline: d.text,
          whyItMatters: '',
        })),
      });
    } catch (err) {
      console.error('PDF download error:', err);
    }
    setIsDownloading(false);
  }, [summaryData]);

  // Only show in night_summary mode (9PM - 12AM)
  if (!isVisible || !mode) return null;

  const formatNumber = (num) => num != null ? num.toLocaleString('en-IN') : '--';
  const formatChange = (change, percent) => {
    if (change == null || percent == null) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatNumber(change)} (${sign}${percent.toFixed(2)}%)`;
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  // Slide 1: Markets Recap
  const MarketsSlide = () => (
    <div className="li-ns-slide">
      <div className="li-ns-slide-header">
        <span className="li-ns-slide-icon">📊</span>
        <h4 className="li-ns-slide-title">Markets Recap</h4>
      </div>
      <div className="li-ns-market-grid">
        <div className="li-ns-market-item">
          <span className="li-ns-market-label">NIFTY 50</span>
          <span className="li-ns-market-value">{formatNumber(summaryData.markets.nifty.value)}</span>
          <span className={`li-ns-market-change ${summaryData.markets.nifty.change >= 0 ? 'positive' : 'negative'}`}>
            {formatChange(summaryData.markets.nifty.change, summaryData.markets.nifty.percent)}
          </span>
        </div>
        <div className="li-ns-market-item">
          <span className="li-ns-market-label">SENSEX</span>
          <span className="li-ns-market-value">{formatNumber(summaryData.markets.sensex.value)}</span>
          <span className={`li-ns-market-change ${summaryData.markets.sensex.change >= 0 ? 'positive' : 'negative'}`}>
            {formatChange(summaryData.markets.sensex.change, summaryData.markets.sensex.percent)}
          </span>
        </div>
        <div className="li-ns-market-item">
          <span className="li-ns-market-label">BANK NIFTY</span>
          <span className="li-ns-market-value">{formatNumber(summaryData.markets.bankNifty.value)}</span>
          <span className={`li-ns-market-change ${summaryData.markets.bankNifty.change >= 0 ? 'positive' : 'negative'}`}>
            {formatChange(summaryData.markets.bankNifty.change, summaryData.markets.bankNifty.percent)}
          </span>
        </div>
        <div className="li-ns-market-item">
          <span className="li-ns-market-label">FII Flow</span>
          <span className="li-ns-market-value">₹{formatNumber(summaryData.markets.fii.value)} Cr</span>
          <span className={`li-ns-market-change ${summaryData.markets.fii.type === 'buyers' ? 'positive' : 'negative'}`}>
            Net {summaryData.markets.fii.type}
          </span>
        </div>
      </div>
    </div>
  );

  // Slide 2: Top Gainers/Losers
  const GainersLosersSlide = () => (
    <div className="li-ns-slide">
      <div className="li-ns-slide-header">
        <span className="li-ns-slide-icon">📈</span>
        <h4 className="li-ns-slide-title">Top Movers</h4>
      </div>
      <div className="li-ns-movers-grid">
        <div className="li-ns-movers-column">
          <h5 className="li-ns-movers-heading positive">Top Gainers</h5>
          {summaryData.gainers.map((stock, i) => (
            <div key={i} className="li-ns-mover-item">
              <span className="li-ns-mover-name">{stock.name}</span>
              <span className="li-ns-mover-change positive">+{stock.change}%</span>
            </div>
          ))}
        </div>
        <div className="li-ns-movers-column">
          <h5 className="li-ns-movers-heading negative">Top Losers</h5>
          {summaryData.losers.map((stock, i) => (
            <div key={i} className="li-ns-mover-item">
              <span className="li-ns-mover-name">{stock.name}</span>
              <span className="li-ns-mover-change negative">{stock.change}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Slide 3: Key Developments
  const DevelopmentsSlide = () => (
    <div className="li-ns-slide">
      <div className="li-ns-slide-header">
        <span className="li-ns-slide-icon">⚡</span>
        <h4 className="li-ns-slide-title">Key Developments</h4>
      </div>
      <ul className="li-ns-list">
        {summaryData.developments.map((item, i) => (
          <li key={i} className="li-ns-list-item">
            <span className="li-ns-list-icon">{item.icon}</span>
            <span className="li-ns-list-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  // Slide 4: Tomorrow's Watch
  const TomorrowSlide = () => (
    <div className="li-ns-slide">
      <div className="li-ns-slide-header">
        <span className="li-ns-slide-icon">🔮</span>
        <h4 className="li-ns-slide-title">Tomorrow's Watch</h4>
      </div>
      <ul className="li-ns-list">
        {summaryData.tomorrow.map((item, i) => (
          <li key={i} className="li-ns-list-item li-ns-tomorrow-item">
            <span className="li-ns-time-badge">{item.time}</span>
            <span className="li-ns-list-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const ShareSlide = () => (
    <div className="li-ns-slide li-ns-share-slide">
      <div className="li-ns-slide-header">
        <span className="li-ns-slide-icon">📤</span>
        <h4 className="li-ns-slide-title">Share This Summary</h4>
      </div>
      <p className="li-ns-share-desc">
        Get your daily market summary directly on WhatsApp every evening at 9 PM.
      </p>
      
      {/* PDF Download Button */}
      <button
        onClick={handlePdfDownload}
        disabled={isDownloading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px 16px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(100, 160, 255, 0.2) 0%, rgba(80, 140, 220, 0.2) 100%)',
          border: '1px solid rgba(100, 160, 255, 0.3)',
          borderRadius: '10px',
          color: 'rgba(140, 190, 255, 0.95)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: isDownloading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isDownloading ? 0.7 : 1,
        }}
      >
        <span>📄</span>
        {isDownloading ? 'Generating PDF...' : 'Download PDF Summary'}
      </button>
      
      <WhatsAppShare 
        summary={{
          title: `What You Missed Today - ${summaryData.date}`,
          marketSummary: {
            nifty: {
              close: formatNumber(summaryData.markets.nifty.value),
              change: summaryData.markets.nifty.change > 0 ? `+${summaryData.markets.nifty.change}` : summaryData.markets.nifty.change,
              changePercent: `${summaryData.markets.nifty.percent > 0 ? '+' : ''}${summaryData.markets.nifty.percent}%`,
            },
            sensex: {
              close: formatNumber(summaryData.markets.sensex.value),
              change: summaryData.markets.sensex.change > 0 ? `+${summaryData.markets.sensex.change}` : summaryData.markets.sensex.change,
              changePercent: `${summaryData.markets.sensex.percent > 0 ? '+' : ''}${summaryData.markets.sensex.percent}%`,
            },
            trend: summaryData.markets.nifty.change > 0 ? 'bullish' : 'bearish',
          },
          topHeadlines: summaryData.developments.map(d => ({
            headline: d.text,
            impact: 'Notable',
          })),
          keyTakeaways: [
            `Markets ${summaryData.markets.nifty.change > 0 ? 'rallied' : 'declined'} with FII as net ${summaryData.markets.fii.type}`,
            'Q3 earnings season begins tomorrow',
          ],
          tomorrowWatch: summaryData.tomorrow.map(t => ({
            event: t.text,
            time: t.time,
          })),
        }}
        type="night"
        showOptIn={true}
      />
    </div>
  );

  const slides = [
    <MarketsSlide key="markets" />,
    <GainersLosersSlide key="gainers" />,
    <DevelopmentsSlide key="developments" />,
    <TomorrowSlide key="tomorrow" />,
    <ShareSlide key="share" />,
  ];

  return (
    <>
      <div className="li-night-summary">
        {/* Header */}
        <div className="li-ns-header">
          <span className="li-ns-icon">🌙</span>
          <div className="li-ns-title-block">
            <h3 className="li-ns-title">What You Missed Today</h3>
            <p className="li-ns-date">{summaryData.date}</p>
          </div>
          <span className="li-ns-time">{time} IST</span>
        </div>

        {/* Carousel */}
        <div className="li-ns-carousel">
          {/* Navigation Arrows */}
          <button 
            className="li-ns-nav-btn li-ns-nav-prev" 
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>
          
          {/* Slides Container */}
          <div className="li-ns-slides-container">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="li-ns-slide-wrapper"
              >
                {slides[currentSlide]}
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            className="li-ns-nav-btn li-ns-nav-next" 
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>

        {/* Progress Dots */}
        <div className="li-ns-dots">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              className={`li-ns-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="li-ns-counter">
          {currentSlide + 1} / {TOTAL_SLIDES}
        </div>
      </div>

      <style jsx>{`
        .li-night-summary {
          background: linear-gradient(180deg, rgba(18, 22, 30, 0.96) 0%, rgba(10, 10, 12, 0.98) 100%);
          border: 1px solid rgba(170, 198, 255, 0.12);
          border-radius: 24px;
          padding: 24px;
          margin-top: 24px;
          box-shadow:
            0 4px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(140, 190, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          position: relative;
          overflow: hidden;
        }

        .li-ns-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(100, 140, 220, 0.15);
        }

        .li-ns-icon {
          font-size: 28px;
          filter: drop-shadow(0 0 8px rgba(100, 140, 220, 0.5));
        }

        .li-ns-title-block {
          flex: 1;
        }

        .li-ns-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.95);
          letter-spacing: -0.02em;
        }

        .li-ns-date {
          margin: 4px 0 0;
          font-size: 12px;
          color: rgba(180, 195, 230, 0.6);
        }

        .li-ns-time {
          font-size: 13px;
          color: rgba(100, 140, 220, 0.9);
          font-variant-numeric: tabular-nums;
          background: rgba(100, 140, 220, 0.12);
          padding: 5px 10px;
          border-radius: 6px;
        }

        /* Carousel */
        .li-ns-carousel {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .li-ns-nav-btn {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(100, 140, 220, 0.25);
          background: rgba(100, 140, 220, 0.08);
          color: rgba(200, 215, 240, 0.8);
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .li-ns-nav-btn:hover {
          background: rgba(100, 140, 220, 0.18);
          border-color: rgba(100, 140, 220, 0.40);
          color: rgba(235, 242, 255, 1);
        }

        .li-ns-slides-container {
          flex: 1;
          overflow: hidden;
          min-height: 280px;
        }

        .li-ns-slide-wrapper {
          cursor: grab;
        }

        .li-ns-slide-wrapper:active {
          cursor: grabbing;
        }

        /* Slide Content */
        .li-ns-slide {
          background: rgba(20, 25, 40, 0.5);
          border: 1px solid rgba(100, 140, 220, 0.12);
          border-radius: 16px;
          padding: 20px;
          min-height: 250px;
        }

        .li-ns-slide-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .li-ns-slide-icon {
          font-size: 22px;
        }

        .li-ns-slide-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(100, 140, 220, 0.95);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Markets Grid */
        .li-ns-market-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .li-ns-market-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .li-ns-market-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(180, 195, 230, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .li-ns-market-value {
          font-size: 18px;
          font-weight: 600;
          color: rgba(235, 242, 255, 0.95);
          font-variant-numeric: tabular-nums;
        }

        .li-ns-market-change {
          font-size: 12px;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        .li-ns-market-change.positive {
          color: rgba(80, 220, 140, 0.9);
        }

        .li-ns-market-change.negative {
          color: rgba(255, 100, 100, 0.9);
        }

        /* Gainers/Losers */
        .li-ns-movers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .li-ns-movers-heading {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .li-ns-movers-heading.positive {
          color: rgba(80, 220, 140, 0.9);
        }

        .li-ns-movers-heading.negative {
          color: rgba(255, 100, 100, 0.9);
        }

        .li-ns-mover-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(100, 140, 220, 0.08);
        }

        .li-ns-mover-name {
          font-size: 13px;
          color: rgba(220, 230, 255, 0.85);
        }

        .li-ns-mover-change {
          font-size: 13px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .li-ns-mover-change.positive {
          color: rgba(80, 220, 140, 0.9);
        }

        .li-ns-mover-change.negative {
          color: rgba(255, 100, 100, 0.9);
        }

        /* List Styles */
        .li-ns-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .li-ns-list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: rgba(220, 230, 255, 0.85);
          line-height: 1.45;
        }

        .li-ns-list-icon {
          flex-shrink: 0;
          font-size: 15px;
        }

        .li-ns-tomorrow-item {
          align-items: center;
        }

        .li-ns-time-badge {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 600;
          color: rgba(100, 140, 220, 0.9);
          background: rgba(100, 140, 220, 0.15);
          padding: 3px 8px;
          border-radius: 4px;
          font-variant-numeric: tabular-nums;
        }

        /* Share Slide */
        .li-ns-share-slide {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .li-ns-share-slide .li-ns-slide-header {
          justify-content: center;
        }

        .li-ns-share-desc {
          margin: 0 0 20px;
          font-size: 14px;
          color: rgba(200, 215, 240, 0.7);
          line-height: 1.5;
        }

        /* Progress Dots */
        .li-ns-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }

        .li-ns-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(100, 140, 220, 0.25);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .li-ns-dot.active {
          background: rgba(100, 140, 220, 0.9);
          transform: scale(1.2);
        }

        .li-ns-dot:hover:not(.active) {
          background: rgba(100, 140, 220, 0.45);
        }

        /* Counter */
        .li-ns-counter {
          position: absolute;
          top: 28px;
          right: 80px;
          font-size: 11px;
          color: rgba(180, 195, 230, 0.7);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          background: rgba(20, 25, 40, 0.9);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(100, 140, 220, 0.25);
          z-index: 10;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .li-night-summary {
            padding: 18px;
            border-radius: 18px;
          }

          .li-ns-header {
            flex-wrap: wrap;
          }

          .li-ns-title {
            font-size: 18px;
          }

          .li-ns-nav-btn {
            width: 32px;
            height: 32px;
            font-size: 20px;
          }

          .li-ns-slides-container {
            min-height: 300px;
          }

          .li-ns-slide {
            padding: 16px;
          }

          .li-ns-market-grid {
            gap: 12px;
          }

          .li-ns-market-value {
            font-size: 16px;
          }

          .li-ns-movers-grid {
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}

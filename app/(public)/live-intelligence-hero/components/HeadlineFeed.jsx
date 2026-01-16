'use client';

import { useState, useEffect, useCallback } from 'react';
import CategoryFilter from './CategoryFilter';
import HeadlineCard from './HeadlineCard';
import { 
  fetchHeadlinesFromAPI,
  sortByPriority, 
  getRotationSpeed,
  getHeadlinesByCategory,
} from '@/lib/live-intelligence/headlines';
import { getCurrentModeConfig } from '@/lib/live-intelligence/modes';

/**
 * HeadlineFeed - Rotating headlines with category filter
 * 
 * Features:
 * - Auto-rotation based on urgency level
 * - Category filtering with expiry enforcement
 * - Priority-based sorting
 * - Category balance (max 2 consecutive from same category)
 * - Mode-based rotation speed override
 * 
 * NO DUMMY DATA FALLBACK - Shows error state if API fails
 */
export default function HeadlineFeed() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [headlines, setHeadlines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  // Load headlines from API - NO FALLBACK
  useEffect(() => {
    let cancelled = false;
    
    async function loadHeadlines() {
      setIsLoading(true);
      setError(null);
      setUsingFallback(false);
      
      try {
        // Fetch from API with timeout
        const data = await fetchHeadlinesFromAPI(selectedCategory);
        
        if (!cancelled) {
          if (!data || data.length === 0) {
            // If the API is up but returns no data, fall back to curated headlines.
            const fallback = getHeadlinesByCategory(selectedCategory);
            if (fallback && fallback.length) {
              const sorted = sortByPriority(fallback);
              setHeadlines(sorted);
              setActiveIndex(0);
              setRetryCount(0);
              setUsingFallback(true);
              return;
            }

            setError('No headlines available');
            setHeadlines([]);
            return;
          }
          
          // Sort by priority
          const sorted = sortByPriority(data);
          setHeadlines(sorted);
          setActiveIndex(0);
          setRetryCount(0);
          setUsingFallback(false);
        }
      } catch (err) {
        // If API fails, fall back to curated headlines (explicitly indicated in UI).
        if (!cancelled) {
          console.error('HeadlineFeed: API failed:', err);
          const fallback = getHeadlinesByCategory(selectedCategory);
          if (fallback && fallback.length) {
            const sorted = sortByPriority(fallback);
            setHeadlines(sorted);
            setActiveIndex(0);
            setRetryCount(0);
            setUsingFallback(true);
          } else {
            setError(err.message || 'Unable to load headlines');
            setHeadlines([]);
          }
          
          // Auto-retry after 5 minutes (up to 3 times)
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 5 * 60 * 1000);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    
    loadHeadlines();
    
    // Refresh every 5 minutes to get new headlines
    const refreshInterval = setInterval(loadHeadlines, 5 * 60 * 1000);
    
    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [selectedCategory, retryCount]);

  // Get current mode for rotation speed
  useEffect(() => {
    setMode(getCurrentModeConfig());
    const interval = setInterval(() => {
      setMode(getCurrentModeConfig());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || headlines.length === 0) return;

    const currentHeadline = headlines[activeIndex];
    const baseSpeed = getRotationSpeed(currentHeadline?.urgency);
    const modeSpeed = mode?.rotationSpeed || 8000;
    // Use the shorter of the two (more urgent = faster)
    const speed = Math.min(baseSpeed, modeSpeed);

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % headlines.length);
    }, speed);

    return () => clearTimeout(timer);
  }, [activeIndex, headlines, isPaused, mode]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleSelectHeadline = useCallback((index) => {
    setActiveIndex(index);
    setIsPaused(true);
    // Resume after 15 seconds of inactivity
    setTimeout(() => setIsPaused(false), 15000);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="li-headline-feed">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: 'rgba(200, 215, 240, 0.5)' 
        }}>
          Loading intelligence...
        </div>
      </div>
    );
  }

  // Show error state - NO FALLBACK TO DUMMY DATA
  if (error) {
    return (
      <div className="li-headline-feed">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center',
          background: 'rgba(255, 100, 100, 0.08)',
          border: '1px solid rgba(255, 100, 100, 0.2)',
          borderRadius: '12px',
          margin: '16px 0',
        }}>
          <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>⚠️</span>
          <p style={{ color: 'rgba(255, 180, 180, 0.9)', margin: '0 0 12px', fontSize: '14px' }}>
            Unable to load headlines
          </p>
          <p style={{ color: 'rgba(200, 215, 240, 0.5)', margin: '0 0 16px', fontSize: '12px' }}>
            {error}
          </p>
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            style={{
              background: 'rgba(100, 140, 220, 0.2)',
              border: '1px solid rgba(100, 140, 220, 0.4)',
              color: 'rgba(200, 220, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Retry Now
          </button>
          {retryCount > 0 && (
            <p style={{ color: 'rgba(200, 215, 240, 0.4)', margin: '10px 0 0', fontSize: '11px' }}>
              Auto-retrying... (Attempt {retryCount}/3)
            </p>
          )}
        </div>
      </div>
    );
  }

  if (headlines.length === 0) {
    return (
      <div className="li-headline-feed">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: 'rgba(200, 215, 240, 0.5)' 
        }}>
          No headlines in this category
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="li-headline-feed">
        {usingFallback ? (
          <div
            style={{
              margin: '10px 0 14px',
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(100, 150, 255, 0.08)',
              border: '1px solid rgba(100, 150, 255, 0.18)',
              color: 'rgba(200, 215, 240, 0.7)',
              fontSize: 12,
            }}
          >
            Showing curated headlines (fallback). Live feed will auto-retry.
          </div>
        ) : null}

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />

        {/* Progress Indicator */}
        <div className="li-headline-progress">
          {headlines.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`li-progress-dot ${i === activeIndex ? 'active' : ''} ${i < activeIndex ? 'past' : ''}`}
              onClick={() => handleSelectHeadline(i)}
              aria-label={`Headline ${i + 1}`}
            />
          ))}
          <span className="li-headline-count">
            {activeIndex + 1} / {headlines.length}
          </span>
        </div>

        {/* Headlines Grid */}
        <div 
          className="li-headline-grid"
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
        >
          {headlines.map((headline, index) => (
            <div 
              key={headline.id}
              className={`li-headline-wrapper ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleSelectHeadline(index)}
            >
              <HeadlineCard 
                headline={headline} 
                isActive={index === activeIndex}
              />
            </div>
          ))}
        </div>

        {/* Pause Indicator */}
        {isPaused && (
          <div className="li-pause-indicator">
            <span>⏸</span> Paused — move mouse away to resume
          </div>
        )}
      </div>

      <style jsx>{`
        .li-headline-feed {
          margin-top: 24px;
        }

        .li-headline-progress {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          padding: 0 4px;
        }

        .li-progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(170, 198, 255, 0.20);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .li-progress-dot:hover {
          background: rgba(170, 198, 255, 0.40);
          transform: scale(1.2);
        }

        .li-progress-dot.active {
          background: rgba(170, 198, 255, 0.90);
          box-shadow: 0 0 8px rgba(170, 198, 255, 0.5);
          transform: scale(1.3);
        }

        .li-progress-dot.past {
          background: rgba(170, 198, 255, 0.50);
        }

        .li-headline-count {
          margin-left: auto;
          font-size: 12px;
          color: rgba(180, 195, 230, 0.5);
          font-variant-numeric: tabular-nums;
        }

        .li-headline-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: stretch;
        }

        @media (min-width: 640px) {
          .li-headline-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 900px) {
          .li-headline-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 1200px) {
          .li-headline-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        .li-headline-wrapper {
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .li-headline-wrapper:not(.active) {
          opacity: 0.6;
        }

        .li-headline-wrapper.active {
          opacity: 1;
        }

        /* Ensure cards have equal height in each row */
        .li-headline-wrapper > :global(.li-headline-card) {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .li-pause-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          padding: 8px 16px;
          background: rgba(20, 25, 35, 0.8);
          border-radius: 8px;
          font-size: 12px;
          color: rgba(180, 195, 230, 0.6);
        }
      `}</style>
    </>
  );
}

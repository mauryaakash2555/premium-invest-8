'use client';

import { useState, useEffect, useCallback } from 'react';
import CategoryFilter from './CategoryFilter';
import HeadlineCard from './HeadlineCard';
import { 
  getHeadlinesByCategory, 
  sortByPriority, 
  getRotationSpeed,
  CURATED_HEADLINES 
} from '@/lib/live-intelligence/headlines';
import { getCurrentModeConfig } from '@/lib/live-intelligence/modes';

// Sort headlines with BREAKING first, then by urgency priority
const sortHeadlinesWithBreakingFirst = (headlines) => {
  const urgencyOrder = { BREAKING: 0, IMPORTANT: 1, PREMIUM: 2, REGULAR: 3, EDUCATIONAL: 4 };
  
  return [...headlines].sort((a, b) => {
    // Breaking news always first
    const aIsBreaking = a.urgency === 'BREAKING' || a.category === 'breaking';
    const bIsBreaking = b.urgency === 'BREAKING' || b.category === 'breaking';
    
    if (aIsBreaking && !bIsBreaking) return -1;
    if (!aIsBreaking && bIsBreaking) return 1;
    
    // Then sort by urgency level
    const aOrder = urgencyOrder[a.urgency] ?? 3;
    const bOrder = urgencyOrder[b.urgency] ?? 3;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Then by timestamp (newest first)
    return new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0);
  });
};

/**
 * HeadlineFeed - Rotating headlines with category filter
 * 
 * Features:
 * - LIVE DATA: Fetches from /api/live-intelligence/feed
 * - Auto-rotation based on urgency level
 * - Category filtering
 * - Priority-based sorting
 * - Mode-based rotation speed override
 * - Falls back to curated headlines if API fails
 */
export default function HeadlineFeed() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [headlines, setHeadlines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live headlines from API
  const fetchLiveHeadlines = useCallback(async (category) => {
    try {
      const url = category === 'all' 
        ? '/api/live-intelligence/feed?limit=20'
        : `/api/live-intelligence/feed?category=${category}&limit=20`;
      
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Feed API failed');
      
      const data = await res.json();
      if (data.ok && data.headlines && data.headlines.length > 0) {
        // Sort: Breaking news first, then by urgency/priority
        const sorted = sortHeadlinesWithBreakingFirst(data.headlines);
        setHeadlines(sorted);
        setIsLive(data.source === 'database');
        setActiveIndex(0);
        return true;
      }
    } catch (err) {
      console.warn('[HeadlineFeed] Live feed unavailable:', err.message);
    }
    return false;
  }, []);

  // Load headlines - try live first, then fallback to curated
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchLiveHeadlines(selectedCategory).then((success) => {
      if (cancelled) return;
      if (!success) {
        // Fallback to curated headlines
        const filtered = getHeadlinesByCategory(selectedCategory);
        const sorted = sortByPriority(filtered);
        setHeadlines(sorted);
        setActiveIndex(0);
        setIsLive(false);
      }
      setIsLoading(false);
    });
    
    // Refresh live headlines every 3 minutes
    const refreshInterval = setInterval(() => {
      fetchLiveHeadlines(selectedCategory);
    }, 3 * 60 * 1000);
    
    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [selectedCategory, fetchLiveHeadlines]);

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

  if (headlines.length === 0) {
    return (
      <div className="li-headline-feed">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
        <div style={{ 
          padding: '48px 20px', 
          textAlign: 'center', 
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.8 }}>📡</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: 'rgba(200, 215, 240, 0.7)',
            marginBottom: '8px'
          }}>
            {isLoading ? 'Updating Live Intelligence…' : 'No updates yet'}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'rgba(180, 195, 230, 0.5)'
          }}>
            {isLoading
              ? (isLive ? 'Connected. Loading the latest headlines…' : 'Preparing today\'s brief…')
              : 'Try another category or refresh in a moment.'}
          </div>

          <button
            type="button"
            onClick={() => fetchLiveHeadlines(selectedCategory)}
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(100, 160, 255, 0.22)',
              background: 'rgba(100, 160, 255, 0.10)',
              color: 'rgba(140, 190, 255, 0.9)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="li-headline-feed" data-headline-feed>
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

        @media (min-width: 768px) {
          .li-headline-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .li-headline-grid {
            grid-template-columns: repeat(3, 1fr);
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

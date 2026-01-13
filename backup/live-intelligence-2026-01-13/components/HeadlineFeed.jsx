'use client';

import { useState, useEffect, useCallback } from 'react';
import CategoryFilter from './CategoryFilter';
import HeadlineCard from './HeadlineCard';
import { 
  getHeadlinesByCategory, 
  sortByPriority, 
  getRotationSpeed,
  DUMMY_HEADLINES 
} from '@/lib/live-intelligence/headlines';
import { getCurrentModeConfig } from '@/lib/live-intelligence/modes';

/**
 * HeadlineFeed - Rotating headlines with category filter
 * 
 * Features:
 * - Auto-rotation based on urgency level
 * - Category filtering
 * - Priority-based sorting
 * - Mode-based rotation speed override
 */
export default function HeadlineFeed() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [headlines, setHeadlines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState(null);

  // Load and filter headlines
  useEffect(() => {
    const filtered = getHeadlinesByCategory(selectedCategory);
    const sorted = sortByPriority(filtered);
    setHeadlines(sorted);
    setActiveIndex(0);
  }, [selectedCategory]);

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
        }

        .li-headline-wrapper:not(.active) {
          opacity: 0.6;
        }

        .li-headline-wrapper.active {
          opacity: 1;
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

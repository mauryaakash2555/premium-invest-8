/**
 * Feed Toggle Component
 * @file components/live-intelligence/FeedToggle.jsx
 * 
 * Toggle between Market View (all headlines) and My View (personalized)
 * Persists preference in localStorage
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPersonalizationEngine } from '@/lib/live-intelligence/personalization';

export function FeedToggle({ onFeedChange, className = '' }) {
  const [feedMode, setFeedMode] = useState('market'); // 'market' | 'personalized'
  const [hasPersonalization, setHasPersonalization] = useState(false);
  
  useEffect(() => {
    const engine = getPersonalizationEngine();
    if (engine) {
      const saved = engine.getFeedMode();
      setFeedMode(saved);
      
      const insights = engine.getInsights();
      setHasPersonalization(insights.hasPersonalization);
    }
  }, []);
  
  const handleToggle = (mode) => {
    setFeedMode(mode);
    
    const engine = getPersonalizationEngine();
    if (engine) {
      engine.setFeedMode(mode);
    }
    
    if (onFeedChange) {
      onFeedChange(mode);
    }
  };
  
  return (
    <div className={`flex items-center gap-1 bg-[var(--li-button-bg,rgba(170,198,255,0.10))] rounded-full p-1 ${className}`}>
      <button
        onClick={() => handleToggle('market')}
        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
          feedMode === 'market'
            ? 'text-[var(--li-text,rgba(235,242,255,0.94))]'
            : 'text-[var(--li-text-muted,rgba(220,230,255,0.62))] hover:text-[var(--li-text,rgba(235,242,255,0.94))]'
        }`}
      >
        {feedMode === 'market' && (
          <motion.div
            layoutId="feedToggle"
            className="absolute inset-0 bg-[var(--li-button-hover,rgba(170,198,255,0.20))] rounded-full"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <span>🌐</span>
          <span className="hidden sm:inline">Market View</span>
        </span>
      </button>
      
      <button
        onClick={() => handleToggle('personalized')}
        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
          feedMode === 'personalized'
            ? 'text-[var(--li-text,rgba(235,242,255,0.94))]'
            : 'text-[var(--li-text-muted,rgba(220,230,255,0.62))] hover:text-[var(--li-text,rgba(235,242,255,0.94))]'
        }`}
      >
        {feedMode === 'personalized' && (
          <motion.div
            layoutId="feedToggle"
            className="absolute inset-0 bg-[var(--li-button-hover,rgba(170,198,255,0.20))] rounded-full"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <span>👤</span>
          <span className="hidden sm:inline">My View</span>
          {!hasPersonalization && feedMode !== 'personalized' && (
            <span className="hidden sm:inline text-xs opacity-60">(New)</span>
          )}
        </span>
      </button>
    </div>
  );
}

/**
 * Personalization Insights Card
 * Shows user's reading patterns and preferences
 */
export function PersonalizationInsights({ className = '' }) {
  const [insights, setInsights] = useState(null);
  
  useEffect(() => {
    const engine = getPersonalizationEngine();
    if (engine) {
      setInsights(engine.getInsights());
    }
  }, []);
  
  if (!insights || !insights.hasPersonalization) {
    return (
      <div className={`bg-[var(--li-card-bg,rgba(20,30,50,0.50))] rounded-lg p-4 border border-[var(--li-border,rgba(170,198,255,0.15))] ${className}`}>
        <div className="flex items-center gap-2 text-[var(--li-text-muted,rgba(220,230,255,0.62))]">
          <span>👤</span>
          <span className="text-sm">
            Keep reading to build your personalized feed
          </span>
        </div>
      </div>
    );
  }
  
  // Format preferred time
  const formatTime = (hour) => {
    if (hour === null) return null;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };
  
  return (
    <div className={`bg-[var(--li-card-bg,rgba(20,30,50,0.50))] rounded-lg p-4 border border-[var(--li-border,rgba(170,198,255,0.15))] ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <span className="text-sm font-bold text-[var(--li-text,rgba(235,242,255,0.94))]">
          Your Intelligence Profile
        </span>
      </div>
      
      {insights.topCategories.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-[var(--li-text-muted,rgba(220,230,255,0.62))] mb-1">
            You mostly read:
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.topCategories.map(cat => (
              <span 
                key={cat}
                className="px-2 py-1 text-xs rounded bg-[var(--li-accent-glow,rgba(170,198,255,0.18))] text-[var(--li-accent,rgba(170,198,255,0.70))]"
              >
                {cat.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {insights.preferredTime !== null && (
        <div className="text-xs text-[var(--li-text-muted,rgba(220,230,255,0.62))]">
          📅 Best time: <span className="text-[var(--li-accent,rgba(170,198,255,0.70))]">
            {formatTime(insights.preferredTime)} - {formatTime((insights.preferredTime + 1) % 24)}
          </span>
        </div>
      )}
      
      <div className="text-xs text-[var(--li-text-dim,rgba(200,215,240,0.45))] mt-2">
        Based on {insights.totalInteractions} interactions
      </div>
    </div>
  );
}

export default FeedToggle;

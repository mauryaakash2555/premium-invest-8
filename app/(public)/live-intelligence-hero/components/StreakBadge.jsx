'use client';

import { useState, useEffect } from 'react';
import { 
  getStreakData, 
  updateStreak, 
  getStreakMilestone 
} from '@/lib/live-intelligence/personalization';

/**
 * StreakBadge - Displays user's visit streak with gamification
 * 
 * Features:
 * - Current streak display
 * - Milestone celebrations
 * - Longest streak record
 */
export default function StreakBadge({ showDetails = false }) {
  const [streak, setStreak] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update streak on mount
    const result = updateStreak();
    if (result) {
      setStreak(result);
      
      // Check for milestone
      const ms = getStreakMilestone(result.currentStreak);
      if (ms && result.streakExtended) {
        setMilestone(ms);
        setShowMilestone(true);
        
        // Hide milestone after 5 seconds
        setTimeout(() => setShowMilestone(false), 5000);
      }
    }
  }, []);

  if (!streak) return null;

  return (
    <>
      <div className="li-streak-badge">
        {/* Main badge */}
        <button
          type="button"
          className={`li-streak-main ${streak.currentStreak >= 7 ? 'hot' : ''}`}
          onClick={() => showDetails && setIsExpanded(!isExpanded)}
        >
          <span className="li-streak-fire">
            {streak.currentStreak >= 7 ? '🔥' : streak.currentStreak >= 3 ? '✨' : '📅'}
          </span>
          <span className="li-streak-count">{streak.currentStreak}</span>
          <span className="li-streak-label">day{streak.currentStreak !== 1 ? 's' : ''}</span>
        </button>

        {/* Milestone popup */}
        {showMilestone && milestone && (
          <div className="li-streak-milestone">
            <span className="li-milestone-emoji">{milestone.emoji}</span>
            <span className="li-milestone-text">{milestone.message}</span>
          </div>
        )}

        {/* Expanded details */}
        {isExpanded && showDetails && (
          <div className="li-streak-details">
            <div className="li-streak-stat">
              <span className="li-stat-label">Current Streak</span>
              <span className="li-stat-value">{streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}</span>
            </div>
            <div className="li-streak-stat">
              <span className="li-stat-label">Longest Streak</span>
              <span className="li-stat-value">{streak.longestStreak} day{streak.longestStreak !== 1 ? 's' : ''}</span>
            </div>
            <div className="li-streak-stat">
              <span className="li-stat-label">Total Visits</span>
              <span className="li-stat-value">{streak.totalVisits || 1}</span>
            </div>
            <p className="li-streak-tip">
              Visit daily to build your streak and become a more informed investor!
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .li-streak-badge {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .li-streak-main {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(20, 25, 35, 0.8);
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .li-streak-main:hover {
          background: rgba(100, 160, 255, 0.12);
        }

        .li-streak-main.hot {
          background: linear-gradient(180deg, rgba(100, 160, 255, 0.18) 0%, rgba(140, 190, 255, 0.08) 100%);
        }

        .li-streak-fire {
          font-size: 14px;
        }

        .li-streak-count {
          font-size: 14px;
          font-weight: 700;
          color: rgba(140, 190, 255, 0.95);
          font-variant-numeric: tabular-nums;
        }

        .li-streak-label {
          font-size: 11px;
          color: rgba(180, 200, 230, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .li-streak-milestone {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          padding: 12px 16px;
          background: linear-gradient(180deg, rgba(100, 160, 255, 0.18) 0%, rgba(140, 190, 255, 0.12) 100%);
          border: 1px solid rgba(100, 160, 255, 0.25);
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
          animation: milestoneSlide 0.4s ease-out;
          box-shadow: 0 4px 20px rgba(100, 160, 255, 0.2);
          z-index: 100;
        }

        @keyframes milestoneSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .li-milestone-emoji {
          font-size: 24px;
        }

        .li-milestone-text {
          font-size: 13px;
          color: rgba(200, 220, 255, 0.95);
          font-weight: 500;
        }

        .li-streak-details {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          padding: 16px;
          background: rgba(20, 25, 35, 0.95);
          border: 1px solid rgba(100, 160, 255, 0.15);
          border-radius: 12px;
          min-width: 200px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 100;
        }

        .li-streak-stat {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .li-streak-stat:last-of-type {
          border-bottom: none;
        }

        .li-stat-label {
          font-size: 12px;
          color: rgba(180, 200, 230, 0.6);
        }

        .li-stat-value {
          font-size: 13px;
          font-weight: 600;
          color: rgba(140, 190, 255, 0.9);
        }

        .li-streak-tip {
          margin: 12px 0 0;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 11px;
          color: rgba(200, 215, 240, 0.5);
          line-height: 1.5;
        }
      `}</style>
    </>
  );
}

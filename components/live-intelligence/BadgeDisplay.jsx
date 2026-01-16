/**
 * Badge Display Component
 * @file components/live-intelligence/BadgeDisplay.jsx
 * 
 * Shows earned badges and progress towards new badges
 * Trophy icon button opens modal with all achievements
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { badges, tierColors, getGamificationTracker } from '@/lib/live-intelligence/gamification';

/**
 * Badge Progress Bar
 */
function BadgeProgressBar({ current, max, tier }) {
  const percentage = Math.min(100, (current / max) * 100);
  const colors = tierColors[tier] || tierColors.bronze;
  
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
      />
    </div>
  );
}

/**
 * Individual Badge Progress Card
 */
function BadgeProgressCard({ badgeId }) {
  const [progress, setProgress] = useState({ current: 0, levels: [] });
  
  useEffect(() => {
    const tracker = getGamificationTracker();
    if (tracker) {
      setProgress(tracker.getBadgeProgress(badgeId));
    }
  }, [badgeId]);
  
  const badge = badges[badgeId];
  if (!badge) return null;
  
  // Find next unlockable tier
  const nextLevel = progress.levels.find(l => !l.unlocked) || progress.levels[progress.levels.length - 1];
  const highestUnlocked = [...progress.levels].reverse().find(l => l.unlocked);
  
  return (
    <div 
      className="rounded-lg p-4"
      style={{
        background: 'rgba(20, 30, 50, 0.60)',
        border: '1px solid rgba(100, 160, 255, 0.12)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{badge.icon}</span>
        <div className="flex-1">
          <div className="font-medium" style={{ color: 'rgba(235, 242, 255, 0.95)' }}>{badge.name}</div>
          <div className="text-xs" style={{ color: 'rgba(200, 215, 240, 0.55)' }}>{badge.description}</div>
        </div>
      </div>
      
      {/* Tier badges */}
      <div className="flex gap-2 mb-3">
        {progress.levels.map(level => {
          const colors = tierColors[level.tier];
          return (
            <div
              key={level.tier}
              className={`px-2 py-1 rounded text-xs font-medium ${
                level.unlocked 
                  ? `${colors.bg} ${colors.text}` 
                  : 'bg-white/5 text-white/30'
              }`}
            >
              {level.tier.charAt(0).toUpperCase() + level.tier.slice(1)}
            </div>
          );
        })}
      </div>
      
      {/* Progress */}
      {nextLevel && !nextLevel.unlocked && (
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(200, 215, 240, 0.55)' }}>
            <span>
              {progress.current} / {nextLevel.requirement}
            </span>
            <span className={tierColors[nextLevel.tier].text}>
              {nextLevel.reward}
            </span>
          </div>
          <BadgeProgressBar 
            current={progress.current} 
            max={nextLevel.requirement} 
            tier={nextLevel.tier}
          />
        </div>
      )}
      
      {/* All completed */}
      {highestUnlocked?.tier === 'gold' && (
        <div className="text-xs text-yellow-400 font-medium">
          ✨ All tiers completed!
        </div>
      )}
    </div>
  );
}

/**
 * Main Badge Display Component
 */
export function BadgeDisplay({ className = '' }) {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const tracker = getGamificationTracker();
    if (tracker) {
      setEarnedBadges(tracker.getEarnedBadges());
      setStats(tracker.getStats());
    }
  }, [isOpen]);
  
  // Keyboard shortcut (Ctrl+A)
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.shiftKey) {
        // Don't override select all in input fields
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(prev => !prev);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);
  
  const handleClose = useCallback(() => setIsOpen(false), []);
  
  return (
    <>
      {/* Trophy Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--li-button-bg,rgba(170,198,255,0.10))] hover:bg-[var(--li-button-hover,rgba(170,198,255,0.20))] transition-all ${className}`}
        title="View achievements (Ctrl+A)"
      >
        <span className="text-xl">🏆</span>
        {earnedBadges.length > 0 && (
          <span className="text-sm font-medium text-[var(--li-text,rgba(235,242,255,0.94))]">
            {earnedBadges.length}
          </span>
        )}
      </button>
      
      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="backdrop-blur-2xl rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] overflow-auto"
              style={{
                background: 'linear-gradient(180deg, rgba(12, 16, 28, 0.98) 0%, rgba(8, 10, 18, 0.99) 100%)',
                border: '1px solid rgba(100, 160, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 80px rgba(100, 160, 255, 0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'rgba(235, 242, 255, 0.95)' }}>
                    🏆 Your Achievements
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(200, 215, 240, 0.55)' }}>
                    Track your progress and unlock badges
                  </p>
                </div>
                <button 
                  onClick={handleClose}
                  className="text-2xl transition-colors p-2"
                  style={{ color: 'rgba(200, 215, 240, 0.5)' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'rgba(235, 242, 255, 0.95)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'rgba(200, 215, 240, 0.5)'}
                >
                  ×
                </button>
              </div>
              
              {/* Stats Summary */}
              {stats && (
                <div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 rounded-xl"
                  style={{
                    background: 'rgba(20, 30, 50, 0.60)',
                    border: '1px solid rgba(100, 160, 255, 0.12)',
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'rgba(100, 180, 255, 1)' }}>
                      {stats.totalBadges}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(200, 215, 240, 0.55)' }}>Badges Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'rgba(255, 180, 100, 1)' }}>
                      🔥 {stats.currentStreak}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(200, 215, 240, 0.55)' }}>Current Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'rgba(100, 220, 150, 1)' }}>
                      {stats.headlinesRead}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(200, 215, 240, 0.55)' }}>Headlines Read</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'rgba(200, 150, 255, 1)' }}>
                      {stats.categoriesExplored}/8
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(200, 215, 240, 0.55)' }}>Categories</div>
                  </div>
                </div>
              )}
              
              {/* Earned Badges */}
              {earnedBadges.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'rgba(235, 242, 255, 0.95)' }}>
                    Earned Badges
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {earnedBadges.map(({ badge, level, key }) => {
                      const colors = tierColors[level.tier];
                      return (
                        <motion.div
                          key={key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="rounded-lg p-4 text-center"
                          style={{
                            background: 'rgba(20, 30, 50, 0.60)',
                            border: `1px solid ${colors.border || 'rgba(100, 160, 255, 0.15)'}`,
                          }}
                        >
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <div className="text-sm font-bold mb-1" style={{ color: 'rgba(235, 242, 255, 0.95)' }}>
                            {badge.name}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded inline-block ${colors.bg} ${colors.text}`}>
                            {level.tier.toUpperCase()}
                          </div>
                          <div className="text-xs mt-2" style={{ color: 'rgba(200, 215, 240, 0.45)' }}>
                            {level.reward}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* All Badge Progress */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: 'rgba(235, 242, 255, 0.95)' }}>
                  Badge Progress
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.keys(badges).map(badgeId => (
                    <BadgeProgressCard key={badgeId} badgeId={badgeId} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BadgeDisplay;

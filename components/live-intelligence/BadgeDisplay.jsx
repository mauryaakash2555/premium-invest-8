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
  
  return (
    <div style={{
      width: '100%',
      height: '6px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, rgba(100, 160, 255, 0.8) 0%, rgba(140, 190, 255, 0.9) 100%)',
          borderRadius: '10px',
        }}
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
      style={{
        borderRadius: '12px',
        padding: '16px',
        background: 'rgba(20, 30, 50, 0.60)',
        border: '1px solid rgba(100, 160, 255, 0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>{badge.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, color: 'rgba(235, 242, 255, 0.95)', fontSize: '14px' }}>{badge.name}</div>
          <div style={{ fontSize: '11px', color: 'rgba(200, 215, 240, 0.55)' }}>{badge.description}</div>
        </div>
      </div>
      
      {/* Tier badges */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {progress.levels.map(level => {
          const isUnlocked = level.unlocked;
          return (
            <div
              key={level.tier}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                background: isUnlocked ? 'rgba(100, 160, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isUnlocked ? 'rgba(140, 190, 255, 0.95)' : 'rgba(255, 255, 255, 0.3)',
                border: isUnlocked ? '1px solid rgba(100, 160, 255, 0.25)' : '1px solid transparent',
              }}
            >
              {level.tier.charAt(0).toUpperCase() + level.tier.slice(1)}
            </div>
          );
        })}
      </div>
      
      {/* Progress */}
      {nextLevel && !nextLevel.unlocked && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: 'rgba(200, 215, 240, 0.55)' }}>
            <span>{progress.current} / {nextLevel.requirement}</span>
            <span style={{ color: 'rgba(140, 190, 255, 0.9)' }}>{nextLevel.reward}</span>
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
        <div style={{ fontSize: '11px', color: 'rgba(140, 190, 255, 0.9)', fontWeight: 500 }}>
          ✓ All tiers completed
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '8px',
          background: 'rgba(100, 160, 255, 0.10)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        title="View achievements (Ctrl+A)"
      >
        <span style={{ fontSize: '14px' }}>🏆</span>
        {earnedBadges.length > 0 && (
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(235, 242, 255, 0.94)' }}>
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
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10003,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '16px',
            }}
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '720px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                background: 'linear-gradient(180deg, rgba(12, 16, 28, 0.98) 0%, rgba(8, 10, 18, 0.99) 100%)',
                border: '1px solid rgba(100, 160, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 80px rgba(100, 160, 255, 0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(235, 242, 255, 0.95)', margin: 0 }}>
                    Your Achievements
                  </h2>
                  <p style={{ fontSize: '13px', marginTop: '4px', color: 'rgba(200, 215, 240, 0.55)' }}>
                    Track your progress and unlock badges
                  </p>
                </div>
                <button 
                  onClick={handleClose}
                  style={{
                    fontSize: '20px',
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(200, 215, 240, 0.5)',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Stats Summary */}
              {stats && (
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: '24px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(20, 30, 50, 0.60)',
                    border: '1px solid rgba(100, 160, 255, 0.12)',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(100, 180, 255, 1)' }}>
                      {stats.totalBadges}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(200, 215, 240, 0.55)' }}>Badges</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255, 160, 80, 1)' }}>
                      {stats.currentStreak}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(200, 215, 240, 0.55)' }}>Streak</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(100, 200, 150, 1)' }}>
                      {stats.headlinesRead}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(200, 215, 240, 0.55)' }}>Read</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(180, 140, 255, 1)' }}>
                      {stats.categoriesExplored}/8
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(200, 215, 240, 0.55)' }}>Categories</div>
                  </div>
                </div>
              )}
              
              {/* Earned Badges */}
              {earnedBadges.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'rgba(235, 242, 255, 0.95)' }}>
                    Earned Badges
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {earnedBadges.map(({ badge, level, key }) => {
                      return (
                        <motion.div
                          key={key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            borderRadius: '12px',
                            padding: '14px',
                            textAlign: 'center',
                            background: 'rgba(20, 30, 50, 0.60)',
                            border: '1px solid rgba(100, 160, 255, 0.15)',
                          }}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>{badge.icon}</div>
                          <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: 'rgba(235, 242, 255, 0.95)' }}>
                            {badge.name}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            display: 'inline-block',
                            background: 'rgba(100, 160, 255, 0.15)',
                            color: 'rgba(140, 190, 255, 0.95)',
                            border: '1px solid rgba(100, 160, 255, 0.25)',
                          }}>
                            {level.tier.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '10px', marginTop: '6px', color: 'rgba(200, 215, 240, 0.45)' }}>
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
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'rgba(235, 242, 255, 0.95)' }}>
                  Badge Progress
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
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

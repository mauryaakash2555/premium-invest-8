/**
 * Achievement Popup Component
 * @file components/live-intelligence/AchievementPopup.jsx
 * 
 * Shows animated popup when user unlocks a new badge
 * Listens for 'achievement-unlocked' custom event
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tierColors } from '@/lib/live-intelligence/gamification';

export function AchievementPopup() {
  const [achievement, setAchievement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleAchievement = (event) => {
      setAchievement(event.detail);
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setAchievement(null), 500);
      }, 5000);
    };
    
    window.addEventListener('achievement-unlocked', handleAchievement);
    return () => window.removeEventListener('achievement-unlocked', handleAchievement);
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setAchievement(null), 500);
  };
  
  if (!achievement) return null;
  
  const colors = tierColors[achievement.level?.tier] || tierColors.bronze;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -120, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: 'spring', 
            damping: 20, 
            stiffness: 300 
          }}
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10004,
            maxWidth: '360px',
            width: 'calc(100% - 32px)',
          }}
          onClick={handleDismiss}
        >
          {/* Glow effect */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(100, 160, 255, 0.3) 0%, rgba(180, 120, 220, 0.2) 100%)',
              opacity: 0.4,
              filter: 'blur(20px)',
              borderRadius: '16px',
            }}
          />
          
          {/* Main card */}
          <div 
            style={{
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(20, 30, 50, 0.98) 0%, rgba(12, 16, 28, 0.99) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(100, 160, 255, 0.25)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(100, 160, 255, 0.1)',
              cursor: 'pointer',
            }}
          >
            {/* Confetti animation */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '16px', pointerEvents: 'none' }}>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    top: '50%', 
                    left: '50%',
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.05,
                    ease: 'easeOut'
                  }}
                  style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: i % 3 === 0 ? 'rgba(100, 180, 255, 0.8)' : i % 3 === 1 ? 'rgba(180, 120, 220, 0.8)' : 'rgba(100, 200, 150, 0.8)',
                  }}
                />
              ))}
            </div>
            
            {/* Content */}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              {/* Badge Icon - smaller size */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  damping: 10, 
                  delay: 0.2 
                }}
                style={{ fontSize: '32px', marginBottom: '12px' }}
              >
                {achievement.badge?.icon}
              </motion.div>
              
              {/* Achievement Unlocked Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  marginBottom: '6px',
                  color: 'rgba(140, 190, 255, 0.95)',
                }}
              >
                ✨ Achievement Unlocked
              </motion.div>
              
              {/* Badge Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'rgba(235, 242, 255, 0.95)',
                  marginBottom: '8px',
                }}
              >
                {achievement.badge?.name}
              </motion.div>
              
              {/* Tier Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(100, 160, 255, 0.15)',
                  color: 'rgba(140, 190, 255, 0.95)',
                  border: '1px solid rgba(100, 160, 255, 0.25)',
                  marginBottom: '8px',
                }}
              >
                {achievement.level?.tier?.toUpperCase()}
              </motion.div>
              
              {/* Reward Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{
                  fontSize: '13px',
                  color: 'rgba(200, 215, 240, 0.7)',
                }}
              >
                {achievement.level?.reward}
              </motion.div>
              
              {/* Click to dismiss */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                style={{
                  fontSize: '11px',
                  color: 'rgba(200, 215, 240, 0.4)',
                  marginTop: '16px',
                }}
              >
                Tap to dismiss
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementPopup;

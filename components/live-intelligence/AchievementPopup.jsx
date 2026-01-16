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
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[10004] max-w-sm w-full mx-4"
          onClick={handleDismiss}
        >
          {/* Glow effect */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-20 blur-xl rounded-2xl`}
          />
          
          {/* Main card */}
          <div 
            className={`relative bg-gradient-to-br from-[rgba(20,30,50,0.95)] to-[rgba(30,40,60,0.95)] backdrop-blur-xl rounded-2xl p-6 border-2 ${colors.border} shadow-2xl cursor-pointer`}
          >
            {/* Confetti animation */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(12)].map((_, i) => (
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
                  className="absolute w-2 h-2 rounded-full"
                  style={{ 
                    background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFA500' : '#FF6B6B'
                  }}
                />
              ))}
            </div>
            
            {/* Content */}
            <div className="relative text-center">
              {/* Stars */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 text-2xl"
              >
                ✨
              </motion.div>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1 -left-1 text-xl"
              >
                ⭐
              </motion.div>
              
              {/* Badge Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  damping: 10, 
                  delay: 0.2 
                }}
                className="text-6xl mb-3"
              >
                {achievement.badge?.icon}
              </motion.div>
              
              {/* Achievement Unlocked Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-sm uppercase font-bold tracking-wider mb-1 ${colors.text}`}
              >
                🎉 Achievement Unlocked!
              </motion.div>
              
              {/* Badge Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-white mb-1"
              >
                {achievement.badge?.name}
              </motion.div>
              
              {/* Tier Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} mb-2`}
              >
                {achievement.level?.tier?.toUpperCase()}
              </motion.div>
              
              {/* Reward Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-white/70"
              >
                {achievement.level?.reward}
              </motion.div>
              
              {/* Click to dismiss */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="text-xs text-white/40 mt-4"
              >
                Click to dismiss
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementPopup;

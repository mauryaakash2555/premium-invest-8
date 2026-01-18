/**
 * FILE: components/user/MarketMoodStrip.jsx
 * PURPOSE: Live Intelligence rotating mood strip
 * COLORS: Premium laser blue theme (NO gold/brown)
 * 
 * LIVE DATA: Fetches headlines from /api/live-intelligence/feed
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CURATED_HEADLINES, sortByPriority, CATEGORIES } from '@/lib/live-intelligence/headlines';
import { getCurrentModeConfig } from '@/lib/live-intelligence/modes';

const COLORS = {
  accent: 'rgba(100, 150, 255, 1)',
  accentDim: 'rgba(100, 150, 255, 0.35)',
  text: 'rgba(170, 198, 255, 0.85)',
};

// Category icons for live headlines
const CATEGORY_ICONS = {
  market_update: '📊',
  market_move: '📈',
  regulatory: '⚖️',
  opportunity: '💎',
  rbi: '🏦',
  sebi: '📋',
  portfolio_tip: '💡',
  tax_insight: '💰',
  global: '🌐',
  insurance: '🛡️',
  mutual_funds: '💰',
  bonds: '📜',
  sip: '📊',
  breaking: '🔴',
  ipo: '🎯',
};

export default function MarketMoodStrip({ onToggleRain }) {
  const [index, setMoodIndex] = useState(0);
  const [headlines, setHeadlines] = useState([]);
  const [modeConfig, setModeConfig] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const router = useRouter();

  // Fetch live headlines from API
  const fetchLiveHeadlines = useCallback(async () => {
    try {
      const res = await fetch('/api/live-intelligence/feed?limit=10', { 
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (!res.ok) throw new Error('Feed API failed');
      const data = await res.json();
      
      if (data.ok && data.headlines && data.headlines.length > 0) {
        setHeadlines(data.headlines);
        setIsLive(data.source === 'database');
        return true;
      }
    } catch (err) {
      console.warn('[MarketMoodStrip] Live feed unavailable, using curated:', err.message);
    }
    return false;
  }, []);

  useEffect(() => {
    // Try to fetch live headlines first
    fetchLiveHeadlines().then((success) => {
      if (!success) {
        // Fallback to curated headlines
        const sorted = sortByPriority(CURATED_HEADLINES);
        setHeadlines(sorted.slice(0, 8));
      }
    });
    
    setModeConfig(getCurrentModeConfig());
    
    // Refresh live headlines every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchLiveHeadlines();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchLiveHeadlines]);

  useEffect(() => {
    if (headlines.length === 0) return;
    const speed = (modeConfig && modeConfig.rotationSpeed) ? modeConfig.rotationSpeed : 12000;
    const timer = setInterval(() => {
      setMoodIndex((prev) => (prev + 1) % headlines.length);
    }, speed);
    return () => clearInterval(timer);
  }, [headlines.length, modeConfig]);

  const currentHeadline = headlines[index];
  // Support both live API format and curated format
  const category = currentHeadline ? (CATEGORIES[currentHeadline.category] || { icon: CATEGORY_ICONS[currentHeadline.category] }) : null;
  const icon = currentHeadline?.icon || (category && category.icon) ? (currentHeadline?.icon || category?.icon) : '📡';
  const headlineText = currentHeadline?.headline || currentHeadline?.title || '';
  const whyText = currentHeadline?.whyItMatters || currentHeadline?.summary || '';
  const displayText = currentHeadline 
    ? icon + ' ' + headlineText + (whyText ? ' — ' + whyText : '')
    : 'Loading market intelligence...';

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.__openLiveIntelligence) {
      window.__openLiveIntelligence();
    } else {
      router.push('/live-intelligence');
    }
  };

  return (
    <div className='w-full bg-transparent py-1 z-50 overflow-hidden relative border-b border-[rgba(100,150,255,0.10)]' style={{ minHeight: '28px' }}>
      <div className='max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-start gap-3 h-5'>
        <div
          className='flex items-center gap-2 flex-shrink-0 z-10 pr-2 px-2 py-[2px] rounded-full bg-black/25 backdrop-blur-sm'
          onClick={() => onToggleRain && onToggleRain()}
          style={{ cursor: 'pointer' }}
        >
          <span className='relative inline-flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full rounded-full animate-ping' style={{ animationDuration: '2.6s', background: isLive ? 'rgba(100, 160, 255, 0.35)' : COLORS.accentDim }} />
            <span className='relative inline-flex rounded-full h-2 w-2 opacity-80' style={{ background: isLive ? 'rgba(100, 160, 255, 1)' : COLORS.accent }} />
          </span>
          <span className='text-[8px] font-medium tracking-[1.6px] uppercase opacity-70 whitespace-nowrap' style={{ color: COLORS.text }}>{isLive ? 'Live' : 'Live Mood'}</span>
        </div>
        
        <div className='h-full w-[1px] mx-2 flex-shrink-0 z-10 hidden md:block' style={{ background: 'rgba(100, 150, 255, 0.08)' }} />

        <div
          className='relative flex-1 overflow-hidden h-full flex items-center rounded-full bg-black/20 backdrop-blur-sm px-2'
          role='button'
          tabIndex={0}
          onClick={handleClick}
          aria-label='Open Live Intelligence'
          style={{ cursor: 'pointer' }}
        >
          <div className='absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-10' />
          <div className='absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/20 to-transparent z-10' />
          
          <AnimatePresence mode='wait'>
            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className='whitespace-nowrap flex items-center'>
              <motion.p
                initial={{ x: '10%' }}
                animate={{ x: ['10%', '-100%'] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                className='text-[9px] md:text-[10px] font-light tracking-[1.1px] uppercase m-0 pr-[50%]'
                style={{ color: 'rgba(200, 215, 240, 0.75)' }}
              >
                {displayText}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

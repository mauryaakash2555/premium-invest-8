/**
 * FILE: components/user/MarketMoodStrip.jsx
 * PURPOSE: Live Intelligence rotating strip (news-style headlines)
 * COLORS: Premium laser blue theme (NO gold/brown)
 * 
 * LIVE DATA: Fetches live intelligence headlines from /api/live-intelligence/feed
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentModeConfig } from '@/lib/live-intelligence/modes';

const COLORS = {
  accent: 'rgba(100, 150, 255, 1)',
  accentDim: 'rgba(100, 150, 255, 0.35)',
  text: 'rgba(170, 198, 255, 0.85)',
};

export default function MarketMoodStrip({ onToggleRain }) {
  const [index, setMoodIndex] = useState(0);
  const [moodLines, setMoodLines] = useState([]);
  const [modeConfig, setModeConfig] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const router = useRouter();

  const categoryLabel = (cat) => {
    const c = String(cat || '').toLowerCase();
    if (c === 'market' || c === 'share_market') return 'Share Market';
    if (c === 'mutual_funds' || c === 'mutualfunds') return 'Mutual Funds';
    if (c === 'breaking') return 'Breaking News';
    if (c === 'insurance') return 'Insurance';
    if (c === 'fixed_income' || c === 'fd_rd_bonds') return 'FD/RD/Bonds';
    if (c === 'pms' || c === 'aif' || c === 'pms_aif') return 'PMS/AIF';
    if (c === 'real_estate') return 'Real Estate';
    if (c === 'forex_gold') return 'Forex/Gold';
    return cat ? String(cat) : 'Intel';
  };

  const normalizeIcon = (h) => {
    const icon = String(h?.icon || '').trim();
    if (icon) return icon;
    const c = String(h?.category || '').toLowerCase();
    if (c === 'breaking') return '🔴';
    if (c === 'market') return '📈';
    if (c === 'mutual_funds') return '💰';
    if (c === 'insurance') return '🛡️';
    if (c === 'fixed_income') return '🏦';
    if (c === 'pms') return '💎';
    if (c === 'real_estate') return '🏠';
    if (c === 'forex_gold') return '💵';
    return '🧠';
  };

  const buildFallbackLines = useCallback(() => {
    const ts = new Date().toISOString();
    // Keep UI calm: do not repeatedly tell users it's broken.
    return [{ id: `fallback_${ts}`, icon: '🧠', text: 'Live Mood updating…', ts }];
  }, []);

  const fetchMoodFallback = useCallback(async () => {
    try {
      const res = await fetch('/api/live-intelligence/mood?nocache=1', {
        cache: 'no-store',
        next: { revalidate: 0 },
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      const moodText = String(data?.mood_text || '').replace(/\s+/g, ' ').trim();
      if (!moodText) return null;
      // If the API itself says unavailable, we still avoid showing that exact phrase in the ticker.
      if (moodText.toLowerCase().includes('temporarily unavailable')) return { text: 'Live Mood updating…' };
      return { text: moodText };
    } catch {
      return null;
    }
  }, []);

  // Fetch live headlines from API
  const fetchLiveHeadlines = useCallback(async () => {
    try {
      const limit = 12;
      const res = await fetch(`/api/live-intelligence/feed?limit=${limit}&nocache=1`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error('Feed API failed');
      const data = await res.json();

      if (data?.ok && Array.isArray(data?.headlines) && data.headlines.length > 0) {
        const mapped = data.headlines
          .filter((h) => h && (h.headline || h.text))
          .slice(0, limit)
          .map((h, idx) => {
            const headline = String(h.headline || h.text || '').replace(/\s+/g, ' ').trim();
            const why = String(h.why_it_matters || h.whyItMatters || '').replace(/\s+/g, ' ').trim();
            const label = categoryLabel(h.category);
            const merged = `${label} → ${headline}${why ? ` — ${why}` : ''}`.trim();
            const text = merged.length > 160 ? merged.slice(0, 157).trimEnd() + '…' : merged;
            const ts = h.timestamp || h.created_at || new Date().toISOString();
            return {
              id: String(h.id || `headline_${idx}_${ts}`),
              icon: normalizeIcon(h),
              text,
              ts,
            };
          });

        if (mapped.length > 0) {
          setMoodLines(mapped);
          setIsLive(true);
          return true;
        }
      }
    } catch (err) {
      console.warn('[MarketMoodStrip] Live headlines unavailable:', err.message);
      const mood = await fetchMoodFallback();
      if (mood?.text) {
        const ts = new Date().toISOString();
        setMoodLines([{ id: `mood_${ts}`, icon: '🧠', text: mood.text, ts }]);
      } else {
        setMoodLines(buildFallbackLines());
      }
      setIsLive(false);
    } finally {
      setHasTriedFetch(true);
    }

    // Empty/invalid payload: show a stable fallback line.
    {
      const mood = await fetchMoodFallback();
      if (mood?.text) {
        const ts = new Date().toISOString();
        setMoodLines([{ id: `mood_${ts}`, icon: '🧠', text: mood.text, ts }]);
      } else {
        setMoodLines(buildFallbackLines());
      }
      setIsLive(false);
    }
    return false;
  }, [buildFallbackLines, fetchMoodFallback]);

  useEffect(() => {
    fetchLiveHeadlines();
    
    setModeConfig(getCurrentModeConfig());
    
    // Refresh headlines every 5 min (API caches for 5 min)
    const refreshInterval = setInterval(() => {
      fetchLiveHeadlines();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchLiveHeadlines]);

  useEffect(() => {
    if (moodLines.length === 0) return;
    if (modeConfig?.key === 'night_summary') return;
    const speed = (modeConfig && modeConfig.rotationSpeed) ? modeConfig.rotationSpeed : 12000;
    const timer = setInterval(() => {
      setMoodIndex((prev) => (prev + 1) % moodLines.length);
    }, speed);
    return () => clearInterval(timer);
  }, [moodLines.length, modeConfig]);

  const currentMood = moodLines[index];
  const icon = currentMood?.icon || '📡';
  const headlineText = currentMood?.text || '';

  const isNightSummary = modeConfig?.key === 'night_summary';
  const displayText = isNightSummary
    ? '🌙 What You Missed Today — Tap to open'
    : (currentMood
        ? icon + ' ' + headlineText
        : (hasTriedFetch ? '🧠 Live Mood updating…' : 'Loading Live Mood…'));

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
          <span className='text-[8px] font-medium tracking-[1.6px] uppercase opacity-70 whitespace-nowrap' style={{ color: COLORS.text }}>Live Mood</span>
        </div>
        
        <div className='h-full w-[1px] mx-2 flex-shrink-0 z-10 hidden md:block' style={{ background: 'rgba(100, 150, 255, 0.08)' }} />

        <div
          className='relative flex-1 overflow-hidden h-full flex items-center rounded-full bg-black/20 backdrop-blur-sm px-3'
          role='button'
          tabIndex={0}
          onClick={handleClick}
          aria-label='Open Live Intelligence'
          style={{ cursor: 'pointer' }}
        >
          <div className='absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-10' />
          <div className='absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/20 to-transparent z-10' />

          <AnimatePresence mode='wait'>
            <motion.div
              key={isNightSummary ? 'night' : index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className='w-full'
            >
              <p
                className='text-[9px] md:text-[10px] font-light tracking-[1.1px] uppercase m-0 truncate'
                style={{ color: 'rgba(200, 215, 240, 0.75)' }}
                title={displayText}
              >
                {displayText}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

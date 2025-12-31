'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const moods = [
  'Market Mood: Cautious optimism amid global cues.',
  'Volatility persists; long-term discipline remains essential.',
  'Institutional flows show steady accumulation in quality names.',
  'Macroeconomic indicators signaling resilience in domestic markets.'
];

export default function MarketMoodStrip({ onToggleRain }) {
  const [index, setMoodIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMoodIndex((prev) => (prev + 1) % moods.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='w-full bg-transparent py-1 z-50 overflow-hidden relative border-b border-[#C0A062]/[0.10]'>
      <div className='max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-start gap-3 h-5'>
        <div
          className='flex items-center gap-2 flex-shrink-0 z-10 pr-2 px-2 py-[2px] rounded-full bg-black/25 backdrop-blur-sm'
          onClick={() => onToggleRain?.()}
          style={{ cursor: 'pointer' }}
        >
          {/* subtle pulse dot (slow + premium, not flashy) */}
          <span className='relative inline-flex h-2 w-2 bm-mood-dot'>
            {/* ring pulse */}
            <span
              className='absolute inline-flex h-full w-full rounded-full bg-[#C0A062]/30 animate-ping'
              style={{ animationDuration: '2.6s' }}
              aria-hidden='true'
            />
            <span className='relative inline-flex rounded-full h-2 w-2 bg-[#C0A062] opacity-70' />
          </span>
          <span className='text-[8px] font-medium tracking-[1.6px] uppercase text-[#C0A062] opacity-55 whitespace-nowrap'>Live Mood</span>
        </div>
        
        {/* ultra-faint divider (premium, near-invisible) */}
        <div className='h-full w-[1px] bg-[#C0A062]/[0.06] mx-2 flex-shrink-0 z-10 hidden md:block' />

        <div className='relative flex-1 overflow-hidden h-full flex items-center rounded-full bg-black/20 backdrop-blur-sm px-2'>
          {/* restore the slightly darker “old” mood fades */}
          <div className='absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-10' />
          <div className='absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/20 to-transparent z-10' />
          
          <AnimatePresence mode='wait'>
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className='whitespace-nowrap flex items-center'
            >
              <motion.p
                initial={{ x: '10%' }}
                animate={{ 
                  x: ['10%', '-100%'] 
                }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity, 
                  ease: 'linear',
                  repeatDelay: 1
                }}
              className='text-[9px] md:text-[10px] font-light tracking-[1.1px] uppercase text-white/70 m-0 pr-[50%]'
              >
                {moods[index]}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* pseudo-element ring (requested) */}
      <style jsx>{`
        .bm-mood-dot::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 999px;
          border: 1px solid rgba(192, 160, 98, 0.35);
          opacity: 0.9;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}



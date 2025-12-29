'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const moods = [
  'Market Mood: Cautious optimism amid global cues.',
  'Volatility persists; long-term discipline remains essential.',
  'Institutional flows show steady accumulation in quality names.',
  'Macroeconomic indicators signaling resilience in domestic markets.'
];

export default function MarketMoodStrip() {
  const [index, setMoodIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMoodIndex((prev) => (prev + 1) % moods.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='w-full bg-[#050505] py-2 z-50 overflow-hidden relative shadow-[0_-10px_30px_rgba(0,0,0,0.8)]'>
      <div className='max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-start gap-4 h-6'>
        <div className='flex items-center gap-2 flex-shrink-0 z-10 bg-[#050505] pr-2'>
          <span className='relative flex h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C0A062] opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2 w-2 bg-[#C0A062]'></span>
          </span>
          <span className='text-[9px] font-bold tracking-[2px] uppercase text-[#C0A062] opacity-60 whitespace-nowrap'>Live Mood</span>
        </div>
        
        <div className='h-full w-[1px] bg-[#C0A062]/20 mx-2 flex-shrink-0 z-10 hidden md:block' />

        <div className='relative flex-1 overflow-hidden h-full flex items-center'>
          <div className='absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#050505] to-transparent z-10' />
          <div className='absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#050505] to-transparent z-10' />
          
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
                className='text-[10px] md:text-[11px] font-light tracking-[1.2px] uppercase text-white/90 m-0 pr-[50%]'
              >
                {moods[index]}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

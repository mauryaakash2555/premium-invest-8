"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

interface GardenAnimationProps {
  month: number;
  totalMonths: number;
  isCrash: boolean;
  isRecovery: boolean;
  isPaused: boolean;
  isPanic: boolean;
  monthlyAmount: number;
  onAnimationComplete?: () => void;
}

/**
 * GardenAnimation - Visual story metaphor for SIP journey
 * 
 * Seeds (SIP) → Saplings → Trees → Forest
 * Storm (Crash) → Some trees shake but roots hold
 * Sunshine (Recovery) → Trees grow taller
 * Panic (Stop) → Garden stops growing
 */
export function GardenAnimation(props: GardenAnimationProps) {
  const { 
    month, 
    totalMonths, 
    isCrash, 
    isRecovery, 
    isPaused, 
    isPanic,
    monthlyAmount 
  } = props;

  const [showSeed, setShowSeed] = useState(false);
  const [seedCount, setSeedCount] = useState(0);

  // Trigger seed animation when month changes
  useEffect(() => {
    if (!isPaused && !isPanic) {
      setShowSeed(true);
      setSeedCount(prev => prev + 1);
      const timer = setTimeout(() => setShowSeed(false), 600);
      return () => clearTimeout(timer);
    }
  }, [month, isPaused, isPanic]);

  // Calculate garden state
  const gardenState = useMemo(() => {
    const progress = month / totalMonths;
    const treeCount = Math.min(Math.floor(month / 3), 24); // One tree per quarter, max 24
    const treeHeight = Math.min(30 + (progress * 70), 100); // 30% to 100%
    
    return {
      progress,
      treeCount,
      treeHeight,
      phase: progress < 0.25 ? 'seeding' : progress < 0.5 ? 'growing' : progress < 0.75 ? 'maturing' : 'flourishing'
    };
  }, [month, totalMonths]);

  // Weather based on market state
  const weather = useMemo(() => {
    if (isCrash) return { icon: '⛈️', label: 'Storm', bg: 'from-slate-800 to-slate-950', shake: true };
    if (isRecovery) return { icon: '🌤️', label: 'Recovery', bg: 'from-amber-950/50 to-slate-950', shake: false };
    if (isPanic) return { icon: '🥀', label: 'Abandoned', bg: 'from-red-950/50 to-slate-950', shake: false };
    return { icon: '☀️', label: 'Growing', bg: 'from-emerald-950/40 to-slate-950', shake: false };
  }, [isCrash, isRecovery, isPanic]);

  // Tree rendering
  const trees = useMemo(() => {
    const arr: Array<{ id: number; size: number; left: number; bottom: number }> = [];
    for (let i = 0; i < gardenState.treeCount; i++) {
      const size = 20 + Math.random() * 30;
      const left = 5 + (i % 8) * 12;
      const bottom = 10 + Math.floor(i / 8) * 15;
      arr.push({ id: i, size, left, bottom });
    }
    return arr;
  }, [gardenState.treeCount]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.75_0.15_85/0.2)] bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      {/* Sky and Weather */}
      <div className={`absolute inset-0 bg-gradient-to-b ${weather.bg} transition-all duration-1000`} />
      
      {/* Weather indicator */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-xs">
        <span>{weather.icon}</span>
        <span className="text-white/70">{weather.label}</span>
      </div>

      {/* Month indicator */}
      <div className="absolute top-3 left-3 z-10 rounded-lg bg-black/40 px-2 py-1 text-xs text-white/70">
        Month {month}
      </div>

      {/* Garden scene */}
      <div className="relative h-48 sm:h-64">
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 rounded-t-3xl bg-gradient-to-t from-emerald-950 to-emerald-900/50" />

        {/* Trees */}
        {trees.map(tree => (
          <div
            key={tree.id}
            className={`absolute transition-all duration-500 ${weather.shake ? 'animate-pulse' : ''}`}
            style={{
              left: `${tree.left}%`,
              bottom: `${tree.bottom}%`,
              fontSize: `${tree.size}px`,
              transform: isPanic ? 'scale(0.7) grayscale(1)' : 'scale(1)',
              opacity: isPanic ? 0.5 : 1
            }}
          >
            🌳
          </div>
        ))}

        {/* Falling seed animation */}
        {showSeed && !isPaused && !isPanic && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 animate-bounce text-2xl"
            style={{ animation: 'seedDrop 0.6s ease-in forwards' }}
          >
            🌱
          </div>
        )}

        {/* Storm clouds during crash */}
        {isCrash && (
          <div className="absolute top-2 left-0 right-0 flex justify-center gap-4 text-3xl animate-pulse">
            <span>⛈️</span>
            <span className="opacity-70">🌧️</span>
            <span>⛈️</span>
          </div>
        )}

        {/* Sunshine during recovery */}
        {isRecovery && (
          <div className="absolute top-2 right-8 text-4xl animate-pulse">
            ☀️
          </div>
        )}

        {/* Panic indicator */}
        {isPanic && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl bg-red-950/80 px-4 py-2 text-center">
              <div className="text-2xl">😰</div>
              <div className="text-xs text-red-300">Garden abandoned</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 relative h-2 rounded-full bg-slate-800 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
          style={{ width: `${gardenState.progress * 100}%` }}
        />
      </div>

      {/* Status */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
        <span>Seeds planted: {seedCount}</span>
        <span className="capitalize">{gardenState.phase}</span>
        <span>₹{(monthlyAmount * month).toLocaleString('en-IN')}</span>
      </div>

      {/* Custom animation keyframes */}
      <style jsx>{`
        @keyframes seedDrop {
          0% { top: 0; opacity: 1; }
          100% { top: 70%; opacity: 0; transform: translateX(-50%) scale(0.5); }
        }
      `}</style>
    </div>
  );
}

/**
 * Simple tree growth visualization
 */
export function TreeGrowth(props: { progress: number; label?: string }) {
  const { progress, label } = props;
  
  const treeEmoji = useMemo(() => {
    if (progress < 0.2) return '🌱';
    if (progress < 0.4) return '🌿';
    if (progress < 0.6) return '🪴';
    if (progress < 0.8) return '🌲';
    return '🌳';
  }, [progress]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className="text-3xl transition-all duration-500"
        style={{ transform: `scale(${0.5 + progress * 0.5})` }}
      >
        {treeEmoji}
      </div>
      {label && <div className="text-[10px] text-white/50">{label}</div>}
    </div>
  );
}

export default GardenAnimation;

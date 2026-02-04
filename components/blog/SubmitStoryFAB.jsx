'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SubmitStoryFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Show FAB after scrolling down 300px
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on contact/submit pages
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('/contact') || path.includes('/submit')) {
      return null;
    }
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      {/* Expanded Panel */}
      <div 
        className={`absolute bottom-16 right-0 mb-2 transition-all duration-200 ${
          isExpanded 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-xl w-64">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <span>✍️</span> Got a Money Story?
          </h4>
          <p className="text-sm text-gray-400 mb-3">
            Share your experience—wins, lessons, or questions. We'll feature the best stories!
          </p>
          <Link
            href="/contact?type=story"
            className="block w-full py-2 px-4 bg-[oklch(0.78_0.08_65)] hover:bg-[oklch(0.72_0.09_65)] text-black font-bold text-center rounded-lg transition"
          >
            Submit Your Story →
          </Link>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        className={`group relative flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
          isExpanded
            ? 'bg-[oklch(0.78_0.08_65)] text-black'
            : 'bg-zinc-900 text-[oklch(0.78_0.08_65)] border border-[oklch(0.78_0.08_65)]/30 hover:bg-zinc-800'
        }`}
        aria-label="Submit your story"
      >
        <span className="text-xl">✍️</span>
        <span className="font-bold whitespace-nowrap">
          {isExpanded ? 'Submit Story' : 'Share Your Story'}
        </span>
        
        {/* Pulse indicator */}
        {!isExpanded && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.78_0.08_65)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[oklch(0.78_0.08_65)]"></span>
          </span>
        )}
      </button>
    </div>
  );
}

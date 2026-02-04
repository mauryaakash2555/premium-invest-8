'use client';

import Link from 'next/link';

export default function SubmitStoryCTA({ variant = 'default' }) {
  const variants = {
    default: {
      bg: 'bg-gradient-to-r from-zinc-900 to-zinc-800',
      border: 'border border-[oklch(0.78_0.08_65)]/20'
    },
    highlight: {
      bg: 'bg-gradient-to-r from-[oklch(0.78_0.08_65)]/20 to-zinc-900',
      border: 'border border-[oklch(0.78_0.08_65)]/30'
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <div className={`${style.bg} ${style.border} rounded-2xl p-6 md:p-8 my-8`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Icon */}
        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[oklch(0.78_0.08_65)]/10 flex items-center justify-center">
          <span className="text-3xl md:text-4xl">📝</span>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            Have a Money Story to Share?
          </h3>
          <p className="text-gray-400 mb-0 md:mb-0">
            Whether it's an investment win, a financial lesson learned, or a question that's been bugging you—we want to hear it. 
            The best stories get featured on our blog!
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex-shrink-0">
          <Link
            href="/contact?type=story"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[oklch(0.78_0.08_65)] hover:bg-[oklch(0.72_0.09_65)] text-black font-bold rounded-xl transition shadow-lg shadow-[oklch(0.78_0.08_65)]/20"
          >
            <span>Submit Your Story</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 pt-6 border-t border-white/5">
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <span>🔒</span> Anonymous submissions welcome
        </span>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <span>⚡</span> Typically featured within 48 hours
        </span>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <span>🎁</span> Exclusive rewards for featured stories
        </span>
      </div>
    </div>
  );
}

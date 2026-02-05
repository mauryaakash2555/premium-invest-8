'use client';

import Link from 'next/link';

export default function SubmitStoryCTA() {
  return (
    <div className="relative my-12 rounded-2xl overflow-hidden"
      style={{
        background: 'oklch(0.10 0.005 280)',
        border: '1px solid oklch(0.95 0.01 85 / 0.10)',
      }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(135deg, oklch(0.78 0.08 65 / 0.05) 0%, transparent 50%)',
        }}
      />

      <div className="relative px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Icon */}
          <div 
            className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'oklch(0.78 0.08 65 / 0.10)',
              border: '1px solid oklch(0.78 0.08 65 / 0.20)',
            }}
          >
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="oklch(0.78 0.08 65)" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 
              className="text-xl md:text-2xl font-semibold mb-2"
              style={{ color: 'oklch(0.95 0.01 85)' }}
            >
              Do You Have a Story to Share?
            </h3>
            <p 
              className="text-sm md:text-base leading-relaxed mb-0"
              style={{ color: 'oklch(0.95 0.01 85 / 0.60)' }}
            >
              Whether it's an investment insight, a lesson learned, or a question on your mind—we'd love to hear from you. 
              The best stories get featured on our editorial.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Link
              href="/contact?type=story"
              className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'oklch(0.78 0.08 65)',
                color: 'oklch(0.10 0.005 280)',
              }}
            >
              <span>Share Your Story</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div 
          className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-6 pt-6"
          style={{ borderTop: '1px solid oklch(0.95 0.01 85 / 0.08)' }}
        >
          <span className="text-xs flex items-center gap-1.5" style={{ color: 'oklch(0.95 0.01 85 / 0.40)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Anonymous submissions welcome
          </span>
          <span className="text-xs flex items-center gap-1.5" style={{ color: 'oklch(0.95 0.01 85 / 0.40)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Featured within 48 hours
          </span>
        </div>
      </div>
    </div>
  );
}

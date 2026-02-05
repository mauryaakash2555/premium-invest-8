'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function SubmitStoryCTA() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-28 md:py-32 border-t border-[color:var(--lux-foreground-05)]">
      <div className="mx-auto max-w-7xl border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/45 backdrop-blur-xl p-10 md:p-14">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div>
            <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Next step</div>
            <div className={`${cormorant.className} mt-6 text-4xl md:text-5xl font-medium text-[color:var(--lux-foreground-80)]`}>
              Do you have a story to share?
            </div>
            <div className="mt-6 text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)] max-w-2xl">
              Share an investment insight, a lesson learned, or a question on your mind — and we may feature it on the blog.
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/contact?type=story"
              className="group relative overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-10 md:px-12 py-5 md:py-6 no-underline"
            >
              <span className="relative z-10 flex items-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
                Share your story
                <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-2" />
              </span>
              <span
                className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-[color:var(--lux-foreground-05)] pt-8">
          <div className="text-[12px] leading-[1.9] tracking-wide text-[color:var(--lux-foreground-40)]">
            Note: Anonymous submissions are welcome. Submissions may be edited for clarity.
          </div>
        </div>
      </div>
    </section>
  );
}

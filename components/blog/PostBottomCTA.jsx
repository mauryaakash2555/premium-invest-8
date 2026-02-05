'use client';

import Link from 'next/link';

export default function PostBottomCTA({ 
  title = "Enjoyed this article?",
  showNewsletter = true,
  showSubmitStory = true 
}) {
  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      {/* Main CTA Box */}
      <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/45 backdrop-blur-xl p-6 md:p-8">
        <h3 className="text-2xl md:text-3xl font-medium text-[color:var(--lux-foreground-80)] mb-2">
          {title}
        </h3>
        <p className="text-[color:var(--lux-foreground-60)] mb-6 leading-[1.9] tracking-wide font-light">
          Join thousands of smart investors who stay ahead of the market.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Newsletter Signup */}
          {showNewsletter && (
            <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/35 backdrop-blur-xl p-5">
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Newsletter</div>
              <h4 className="mt-4 font-medium text-[color:var(--lux-foreground-80)]">Weekly Digest</h4>
              <p className="mt-3 text-sm leading-[1.9] tracking-wide font-light text-[color:var(--lux-foreground-60)] mb-4">
                Get our best insights delivered to your inbox every Saturday.
              </p>
              <Link
                href="/contact?type=newsletter"
                className="group relative overflow-hidden block w-full bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-6 py-4 no-underline"
              >
                <span className="relative z-10 flex items-center justify-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
                  Subscribe
                  <span aria-hidden="true">→</span>
                </span>
                <span
                  className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}

          {/* Submit Story */}
          {showSubmitStory && (
            <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/35 backdrop-blur-xl p-5">
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Contribute</div>
              <h4 className="mt-4 font-medium text-[color:var(--lux-foreground-80)]">Share Your Story</h4>
              <p className="mt-3 text-sm leading-[1.9] tracking-wide font-light text-[color:var(--lux-foreground-60)] mb-4">
                Share an insight, a lesson learned, or a question — we may feature it.
              </p>
              <Link
                href="/contact?type=story"
                className="group relative overflow-hidden block w-full bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-6 py-4 no-underline"
              >
                <span className="relative z-10 flex items-center justify-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
                  Share your story
                  <span aria-hidden="true">→</span>
                </span>
                <span
                  className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}
        </div>

        {/* Social Follow */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-sm text-gray-500 mb-3">Follow us for daily insights:</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://twitter.com/bmwealthindia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>@bmwealthindia</span>
            </a>
            <a
              href="https://www.linkedin.com/company/bmwealth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>BMWealth</span>
            </a>
            <a
              href="https://wa.me/919876543210?text=Hi%20BM%20Wealth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Related Reading Teaser */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          📚 Keep learning: Check out our <Link href="/learn" className="text-[oklch(0.78_0.08_65)] hover:underline">Learning Hub</Link> for more guides.
        </p>
      </div>
    </div>
  );
}

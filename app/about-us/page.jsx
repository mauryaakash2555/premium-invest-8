'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const EASE_LUXURY = [0.16, 1, 0.3, 1];
const WORDS = ['Trust', 'Discretion', 'Discipline', 'Clarity'];

const LUX = {
  background: 'oklch(0.06 0.005 280)',
  foreground: 'oklch(0.95 0.01 85)',
  card: 'oklch(0.10 0.005 280)',
  muted: 'oklch(0.55 0.01 85)',
  accent: 'oklch(0.78 0.08 65)',
};

const grainSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/></filter>" +
  "<rect width='140' height='140' filter='url(#n)' opacity='.55'/></svg>";

const grainDataUrl = `data:image/svg+xml,${encodeURIComponent(grainSvg)}`;

function MotionLine({ delay = 0.8 }) {
  return (
    <div className="h-px w-20 bg-gradient-to-r from-[var(--lux-accent)] to-transparent" aria-hidden="true" />
  );
}

function RevealText({ children, delay = 0.9 }) {
  return (
    <span className="block">{children}</span>
  );
}

export default function AboutUsPage() {
  const containerRef = useRef(null);
  const storyRef = useRef(null);
  const [wordIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const faqs = [
    {
      question: 'What regulatory credentials does BM Wealth hold?',
      answer:
        "BM Wealth holds AMFI registration (ARN 90008) for mutual fund distribution, PMS empanelment (Cert. 2430447816) for portfolio management services, and IRDAI licensing (277925) for insurance distribution — all issued by India's primary financial regulators.",
    },
    {
      question: 'What is the minimum investment to work with BM Wealth?',
      answer:
        'For PMS engagements, the regulatory minimum is Rs. 50 lakh. For mutual fund and insurance advisory, there is no fixed minimum — though our focus is on clients with investable surplus above Rs. 25 lakh who are looking for structured, long-term wealth management.',
    },
    {
      question: 'How is BM Wealth different from a bank relationship manager?',
      answer:
        'A bank relationship manager is incentivised to sell in-house products. BM Wealth is an independent distributor — we work across multiple fund houses, PMS providers, and insurers, and our recommendations are based on client fit, not product targets.',
    },
    {
      question: 'How does BM Wealth earn — fees or commissions?',
      answer:
        'BM Wealth earns distributor commission as per AMFI and IRDAI regulations — disclosed transparently at the time of each transaction. There are no hidden charges. Distribution remuneration follows industry-standard norms set by regulators.',
    },
    {
      question: 'How do I begin the onboarding process?',
      answer:
        'The first step is a complimentary consultation where we review your current portfolio, goals, and risk profile. From there we propose a structured plan before any product recommendation is made. You can initiate this via the Contact page or WhatsApp concierge.',
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Skip heavy 40 MB video on mobile — only render on screens ≥ 768px
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(Boolean(mq.matches));
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const themeStyle = useMemo(
    () =>
      /** @type {React.CSSProperties} */ ({
        '--lux-background': LUX.background,
        '--lux-foreground': LUX.foreground,
        '--lux-foreground-80': 'oklch(0.95 0.01 85 / 0.80)',
        '--lux-foreground-60': 'oklch(0.95 0.01 85 / 0.60)',
        '--lux-foreground-40': 'oklch(0.95 0.01 85 / 0.40)',
        '--lux-foreground-10': 'oklch(0.95 0.01 85 / 0.10)',
        '--lux-foreground-05': 'oklch(0.95 0.01 85 / 0.05)',
        '--lux-card': LUX.card,
        '--lux-muted': LUX.muted,
        '--lux-accent': LUX.accent,
      }),
    []
  );

  const scrollToStory = () => storyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div style={themeStyle} className={`${jakarta.className} relative min-h-screen bg-[var(--lux-background)] text-[color:var(--lux-foreground)]`}>
      {/* HERO */}
      <section ref={containerRef} className="relative overflow-hidden">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload={isDesktop ? 'metadata' : 'none'}
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23101018' width='1' height='1'/%3E%3C/svg%3E"
          >
            <source src="/videos/about-us-animated.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[var(--lux-background)]/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--lux-background)]/75 via-[var(--lux-background)]/55 to-[var(--lux-background)]" />
        </div>

        <div className="relative z-20 px-6 md:px-12 lg:px-24 pt-28 md:pt-32 lg:pt-36 pb-24 md:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-6">
              <div className="h-10 w-px bg-[color:var(--lux-foreground-10)]" aria-hidden="true" />
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">
                Mumbai • Since 1989
              </div>
            </div>

            <div className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-14 lg:gap-16 items-end">
              <div>
                <div className="text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-60)]">
                  Wealth distribution • PMS support • Mutual funds • Insurance
                </div>

                <h1
                  data-testid="about-heading"
                  className={`${cormorant.className} mt-6 font-light leading-[0.82] tracking-[-0.04em] text-[14vw] md:text-[11vw] lg:text-[8.5vw]`}
                >
                  <RevealText delay={0.75}>About Us</RevealText>
                  <RevealText delay={0.9}>
                    <span className="text-[color:var(--lux-foreground-80)]">BM Wealth</span>
                  </RevealText>
                </h1>

                <div className="mt-10 flex items-center gap-6">
                  <MotionLine delay={0.95} />
                  <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-accent)]">
                    PRINCIPLED ADVICE
                  </div>
                </div>

                <div className="mt-10 max-w-2xl">
                  <p className="text-base md:text-[17px] leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                    A Mumbai-based advisory practice serving 700+ clients with a process-first approach. We focus on suitability,
                    documentation, and clear disclosures — so you understand options, costs, and risks before you decide.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      type="button"
                      onClick={scrollToStory}
                      className="group relative overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-10 md:px-12 py-5 md:py-6"
                    >
                      <span className="relative z-10 flex items-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
                        Explore our approach
                        <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-2" />
                      </span>
                      <span
                        className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700"
                        aria-hidden="true"
                      />
                    </button>

                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 backdrop-blur-xl p-10">
                  <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Values</div>
                  <div className="mt-6 space-y-5">
                    {[{ t: 'Client-first suitability', i: Users }, { t: 'Disclosure-led process', i: ShieldCheck }, { t: 'Goal alignment', i: Target }, { t: 'Education & calm', i: Sparkles }].map(
                      (item) => (
                        <div key={item.t} className="flex items-center gap-4">
                          <div className="h-11 w-11 flex items-center justify-center rounded-full border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground-40)] transition-all duration-500 hover:border-[color:var(--lux-accent)]/50 hover:text-[color:var(--lux-accent)]">
                            <item.i className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                          <div className="text-[13px] tracking-[0.08em] text-[color:var(--lux-foreground-60)]">{item.t}</div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-10 border-t border-[color:var(--lux-foreground-05)] pt-8">
                    <div className="text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-60)]">Built on</div>
                    <div className={`${cormorant.className} mt-2 text-3xl font-medium text-[color:var(--lux-foreground-80)]`}>
                      <span className="inline-block">{WORDS[wordIndex]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 md:mt-20 flex items-center gap-6">
              <div className="h-14 w-px bg-gradient-to-b from-[color:var(--lux-accent)]/80 via-[color:var(--lux-accent)]/20 to-transparent" aria-hidden="true" />
              <div className="text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-40)]">Scroll</div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section ref={storyRef} className="px-6 md:px-12 lg:px-24 py-28 md:py-32">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <div>
            <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Our story</div>
            <h2 className={`${cormorant.className} mt-6 text-4xl md:text-5xl font-medium text-[color:var(--lux-foreground-80)]`}>
              A long-term Mumbai practice — built to last.
            </h2>
            <div className="mt-10 space-y-6">
              <p className="text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                BM Wealth is a Mumbai-based wealth advisory firm led by <span className="text-[color:var(--lux-foreground-80)] font-medium">Brahmdeo Maurya</span>, a seasoned wealth advisor with decades of client experience across portfolios, mutual funds, insurance, and long-horizon financial planning.
              </p>
              <p className="text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                The practice was built on a PMS-first philosophy that prioritises structured, accountable portfolio decisions over generic advice or reactive commentary. We focus on clarity before action and process before product.
              </p>
              <p className="text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                Every engagement begins with a documented investment rationale, clear objectives, and a review framework that can be revisited calmly over time. That structure helps preserve context and accountability as portfolios evolve, so clients have a disciplined path they can understand, question, and monitor with confidence through changing market conditions.
              </p>
            </div>
          </div>

          <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 backdrop-blur-xl p-10 md:p-12">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Principal advisor</div>
                <div className={`${cormorant.className} mt-3 text-3xl md:text-4xl font-medium text-[color:var(--lux-foreground-80)]`}>
                  Brahmdeo Maurya
                </div>
                <div className="mt-2 text-[13px] tracking-[0.08em] text-[color:var(--lux-foreground-40)]">Founder • Mumbai</div>
              </div>
              <div className="h-16 w-px bg-[color:var(--lux-foreground-10)]" aria-hidden="true" />
              <div className="text-right text-[10px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-accent)]">35+ years</div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6">
              <div className="flex items-start justify-between gap-6 border-t border-[color:var(--lux-foreground-05)] pt-6">
                <div className="text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-40)]">AMFI ARN 90008</div>
                <div className="max-w-[420px] text-sm leading-[1.9] tracking-[0.04em] text-[color:var(--lux-foreground-60)] text-right">
                  AMFI-registered Mutual Fund Distributor. All mutual fund transactions are processed through AMFI-regulated channels on behalf of clients.
                </div>
              </div>
              <div className="flex items-start justify-between gap-6 border-t border-[color:var(--lux-foreground-05)] pt-6">
                <div className="text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-40)]">PMS Certification 2430447816</div>
                <div className="max-w-[420px] text-sm leading-[1.9] tracking-[0.04em] text-[color:var(--lux-foreground-60)] text-right">
                  SEBI-empanelled PMS Distributor. Clients access structured portfolio management through SEBI-regulated PMS providers.
                </div>
              </div>
              <div className="flex items-start justify-between gap-6 border-t border-[color:var(--lux-foreground-05)] pt-6">
                <div className="text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-40)]">IRDAI License 277925</div>
                <div className="max-w-[420px] text-sm leading-[1.9] tracking-[0.04em] text-[color:var(--lux-foreground-60)] text-right">
                  IRDAI-licensed Insurance Distributor. Insurance recommendations are backed by a valid IRDAI distribution license.
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-[color:var(--lux-foreground-05)] pt-8">
              <div className="text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                These credentials sit inside a review-led operating model: product access is always paired with documentation, periodic evaluation, and communication that remains understandable even when markets are noisy.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="px-6 md:px-12 lg:px-24 py-28 md:py-32 border-t border-[color:var(--lux-foreground-05)]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div>
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Our philosophy</div>
              <h2 className={`${cormorant.className} mt-6 text-4xl md:text-5xl font-medium text-[color:var(--lux-foreground-80)]`}>
                Wealth management built on structure, not noise.
              </h2>
            </div>
            <MotionLine delay={0.2} />
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9 md:p-10">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 flex items-center justify-center rounded-full border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-accent)]">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">01</div>
              </div>
              <div className={`${cormorant.className} mt-6 text-2xl font-medium text-[color:var(--lux-foreground-80)]`}>Our Philosophy</div>
              <div className="mt-5 space-y-5 text-[15px] leading-[1.9] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                <p>
                  Wealth management is not about chasing returns. It is about structured decision-making, documented reviews, and clear accountability at every stage. BM Wealth operates on a review-first model — every client portfolio is evaluated periodically against stated goals, not market noise.
                </p>
                <p>
                  We believe the most valuable thing a wealth advisor can offer is not a product recommendation, but a disciplined process that holds up in both bull and bear markets. That means suitability before execution, clarity before action, and a written framework that can be revisited with confidence when circumstances change. A disciplined review cycle protects judgment when markets become emotional, and helps keep decisions anchored to objectives rather than headlines.
                </p>
              </div>
            </div>

            <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9 md:p-10">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 flex items-center justify-center rounded-full border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-accent)]">
                  <Users className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">02</div>
              </div>
              <div className={`${cormorant.className} mt-6 text-2xl font-medium text-[color:var(--lux-foreground-80)]`}>Who We Serve</div>
              <div className="mt-5 space-y-5 text-[15px] leading-[1.9] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                <p>
                  BM Wealth works with Mumbai-based professionals, business owners, and families with investable surplus above Rs. 25 lakh. Our clients are not looking for tips or shortcuts — they want a structured wealth partner who documents decisions, follows through on reviews, and communicates clearly.
                </p>
                <p>
                  Many are balancing multiple financial priorities at once: portfolio growth, liquidity planning, protection, tax efficiency, and long-term family goals. Most want a long-term advisory relationship rather than intermittent transaction help. We do not take on clients we cannot serve well. The relationship is designed for people who value consistency, accountability, and a steady advisory process over improvisation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 lg:px-24 py-28 md:py-32 border-t border-[color:var(--lux-foreground-05)]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div>
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Questions</div>
              <h2 className={`${cormorant.className} mt-6 text-4xl md:text-5xl font-medium text-[color:var(--lux-foreground-80)]`}>
                Questions people ask before they begin.
              </h2>
            </div>
            <MotionLine delay={0.2} />
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9 md:p-10"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 flex items-center justify-center rounded-full border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-accent)]">
                    {index % 2 === 0 ? <Target className="h-5 w-5" strokeWidth={1.5} /> : <Sparkles className="h-5 w-5" strokeWidth={1.5} />}
                  </div>
                  <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">0{index + 1}</div>
                </div>
                <div className={`${cormorant.className} mt-6 text-2xl font-medium text-[color:var(--lux-foreground-80)]`}>
                  {faq.question}
                </div>
                <div className="mt-5 text-[15px] leading-[1.9] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-[color:var(--lux-foreground-05)]">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ n: '35+', l: 'Years of experience' }, { n: '700+', l: 'Clients served' }, { n: '1989', l: 'Established' }, { n: '6+', l: 'Registrations' }].map(
            (s) => (
              <div key={s.l} className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/40 backdrop-blur-xl p-7 md:p-8">
                <div className={`${cormorant.className} tabular-nums text-4xl md:text-5xl font-medium text-[color:var(--lux-accent)]`}>{s.n}</div>
                <div className="mt-2 text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-40)]">{s.l}</div>
              </div>
            )
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-24 py-28 md:py-32 border-t border-[color:var(--lux-foreground-05)]">
        <div className="mx-auto max-w-7xl border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/45 backdrop-blur-xl p-10 md:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div>
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Next step</div>
              <div className={`${cormorant.className} mt-6 text-4xl md:text-5xl font-medium text-[color:var(--lux-foreground-80)]`}>
                Schedule a consultation.
              </div>
              <div className="mt-6 text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)] max-w-2xl">
                Discuss goals, risk comfort, and constraints — and get a documented, process-first path forward.
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                className="group relative overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-10 md:px-12 py-5 md:py-6 no-underline"
              >
                <span className="relative z-10 flex items-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
                  Schedule now
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
              Disclosures: Investments are subject to market risks. Returns are not assured. Please review all product documents and
              disclosures before investing.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

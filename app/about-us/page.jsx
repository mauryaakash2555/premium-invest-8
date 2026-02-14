'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Award, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';

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
    <motion.div
      initial={{ width: 0 }}
      whileInView={{ width: 80 }}
      viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
      transition={{ duration: 1.5, delay, ease: EASE_LUXURY }}
      className="h-px bg-gradient-to-r from-[var(--lux-accent)] to-transparent"
      aria-hidden="true"
    />
  );
}

function RevealText({ children, delay = 0.9 }) {
  return (
    <span className="block overflow-hidden [perspective:900px]">
      <motion.span
        className="block"
        initial={{ y: '130%', rotateX: -20 }}
        whileInView={{ y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-20% 0px -10% 0px' }}
        transition={{ duration: 1.6, delay, ease: EASE_LUXURY }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function AboutUsPage() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const storyRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setWordIndex((i) => (i + 1) % WORDS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Keep the background animation subtle so the video stays smooth on mobile.
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  const scrollToStory = () => storyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div style={themeStyle} className={`${jakarta.className} relative min-h-screen bg-[var(--lux-background)] text-[color:var(--lux-foreground)]`}>
      {/* HERO */}
      <section ref={containerRef} className="relative overflow-hidden">
        <motion.div
          style={{ scale: prefersReducedMotion ? 1 : videoScale }}
          className="absolute inset-0 z-0"
          aria-hidden="true"
        >
          {/* Cinematic video background */}
          <motion.video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/about-bg-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
            src="/about-bg.mp4"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_LUXURY }}
          />

          {/* Dark overlay tints for text legibility */}
          <div className="absolute inset-0 bg-[var(--lux-background)]/36" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--lux-background)] via-[var(--lux-background)]/14 to-[var(--lux-background)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--lux-background)]/70 via-[var(--lux-background)]/14 to-[var(--lux-background)]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--lux-background)] via-transparent to-transparent opacity-46" />
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url('${grainDataUrl}')` }}
          />
        </motion.div>

        <div className="relative z-20 px-6 md:px-12 lg:px-24 pt-28 md:pt-32 lg:pt-36 pb-24 md:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-6">
              <div className="h-10 w-px bg-[color:var(--lux-foreground-10)]" aria-hidden="true" />
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">
                Mumbai • Since 1989
              </div>
            </div>

            <div className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-14 lg:gap-16 items-end">
              <motion.div style={{ y: prefersReducedMotion ? 0 : contentY }}>
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
                    <motion.button
                      type="button"
                      onClick={scrollToStory}
                      className="group relative overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-10 md:px-12 py-5 md:py-6"
                      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                      transition={{ duration: 0.6, ease: EASE_LUXURY }}
                    >
                      <span className="relative z-10 flex items-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold">
                        Explore our approach
                        <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-2" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-[color:var(--lux-accent)]"
                        initial={{ x: '-101%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.6, ease: EASE_LUXURY }}
                        aria-hidden="true"
                      />
                    </motion.button>

                  </div>
                </div>
              </motion.div>

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
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={wordIndex}
                          initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -60, filter: 'blur(10px)' }}
                          transition={{ duration: 1, ease: EASE_LUXURY }}
                          className="inline-block"
                        >
                          {WORDS[wordIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 md:mt-20 flex items-center gap-6">
              <motion.div
                animate={prefersReducedMotion ? undefined : { y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-14 w-px bg-gradient-to-b from-[color:var(--lux-accent)]/80 via-[color:var(--lux-accent)]/20 to-transparent"
                aria-hidden="true"
              />
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
                Led by <span className="text-[color:var(--lux-foreground-80)] font-medium">Brahmdeo Maurya</span>, BM Wealth serves
                investors from early-career SIP starters to established entrepreneurs managing complex portfolios.
              </p>
              <p className="text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                Since 1989, we’ve focused on disciplined execution, transparent communication, and documentation-first workflows.
                The goal is simple: help you make decisions with clarity — not pressure.
              </p>
              <p className="text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                Our support spans portfolio management (PMS), mutual fund distribution, SIP execution, and insurance distribution —
                with disclosure-led processes and suitability checks at every step.
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
              {[
                { k: 'PMS Certification', v: '2430447816' },
                { k: 'AMFI Registration', v: 'ARN 90008' },
                { k: 'IRDAI License', v: '277925' },
              ].map((row) => (
                <div key={row.k} className="flex items-start justify-between gap-6 border-t border-[color:var(--lux-foreground-05)] pt-6">
                  <div className="text-[11px] tracking-[0.25em] uppercase font-medium text-[color:var(--lux-foreground-40)]">{row.k}</div>
                  <div className="text-sm tracking-[0.12em] text-[color:var(--lux-foreground-80)]">{row.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-[color:var(--lux-foreground-05)] pt-8">
              <div className="text-base leading-[2] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
                Our approach combines practical planning and calm execution: we explain risks and costs, document disclosures, and help
                you stay aligned to goals across market cycles.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="px-6 md:px-12 lg:px-24 py-28 md:py-32 border-t border-[color:var(--lux-foreground-05)]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-10 flex-wrap">
            <div>
              <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Principles</div>
              <h2 className={`${cormorant.className} mt-6 text-4xl md:text-5xl font-medium text-[color:var(--lux-foreground-80)]`}>
                Premium service — measured in process.
              </h2>
            </div>
            <MotionLine delay={0.2} />
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Users,
                title: 'Client-first suitability',
                body: 'Every recommendation starts with goals, constraints, and risk comfort — not market noise.',
              },
              {
                icon: Award,
                title: 'Professional standards',
                body: 'Documentation, disclosures, and disciplined execution across mutual funds, PMS support, and insurance.',
              },
              {
                icon: ShieldCheck,
                title: 'Trust through clarity',
                body: 'Transparent costs and risks — so decisions feel calm, deliberate, and well understood.',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                transition={{ duration: 1.2, delay: 0.15 * i, ease: EASE_LUXURY }}
                className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/60 backdrop-blur-xl p-9 md:p-10"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 flex items-center justify-center rounded-full border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-accent)]">
                    <card.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">0{i + 1}</div>
                </div>
                <div className={`${cormorant.className} mt-6 text-2xl font-medium text-[color:var(--lux-foreground-80)]`}>{card.title}</div>
                <div className="mt-5 text-[15px] leading-[1.9] tracking-wide font-light text-[color:var(--lux-foreground-60)]">{card.body}</div>
              </motion.div>
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

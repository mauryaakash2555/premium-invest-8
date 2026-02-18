"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const cyclingWords = ["Legacy", "Prosperity", "Fortune", "Dynasty"];

export default function HeroContent() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-6 md:px-12 lg:px-24">
      {/* LABEL WITH LINE */}
      <div className="flex items-center gap-6 mb-10 md:mb-12">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 54 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-px"
          style={{
            background:
              "linear-gradient(to right, var(--lux-accent), color-mix(in oklab, var(--lux-accent) 0%, transparent))",
          }}
        />
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[10px] md:text-[11px] tracking-[0.40em] uppercase font-semibold"
          style={{ color: "var(--lux-accent)" }}
        >
          Distinguished Wealth Architecture
        </motion.span>
      </div>

      {/* MAIN HEADLINE */}
      <div className="mb-8 md:mb-10 max-w-5xl">
        {/* Line 1 */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "130%", rotateX: -20 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[7.4vw] md:text-[5.0vw] lg:text-[3.7vw] font-light leading-[0.95] tracking-[-0.03em]"
            style={{ color: "oklch(0.95 0.01 85)" }}
          >
            Architect Your
          </motion.h1>
        </div>

        {/* Line 2 */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "130%", rotateX: -20 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{ duration: 1.4, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[7.4vw] md:text-[5.0vw] lg:text-[3.7vw] font-extralight italic leading-[0.95] tracking-[-0.03em]"
            style={{ color: "oklch(0.95 0.01 85 / 0.70)" }}
          >
            Financial
          </motion.h1>
        </div>

        {/* Line 3 */}
        <div className="overflow-hidden min-h-[1.2em] pb-[0.1em]">
          <AnimatePresence mode="wait">
            <motion.h1
              key={cyclingWords[wordIndex]}
              initial={{ y: "115%", opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-115%", opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[7.4vw] md:text-[5.0vw] lg:text-[3.7vw] font-light leading-[1.02] tracking-[-0.03em]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--lux-accent), color-mix(in oklab, var(--lux-accent) 55%, white), var(--lux-accent))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {cyclingWords[wordIndex]}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* DESCRIPTION */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-sans text-[12px] md:text-[14px] leading-[1.85] tracking-wide font-light max-w-xl mb-8 md:mb-9"
        style={{ color: "oklch(0.95 0.01 85 / 0.40)" }}
      >
        Empowering Mumbai&apos;s elite investors with bespoke wealth strategies. Portfolio Management, Mutual Funds, and systematic
        investment planning.
      </motion.p>

      {/* BUTTONS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-5 mb-10 md:mb-12"
      >
        <Link
          href="/blueprint"
          className="group relative overflow-hidden px-7 md:px-8 py-3.5 md:py-4 no-underline transition-[color,opacity,transform] duration-500"
          style={{
            backgroundColor: "oklch(0.95 0.01 85)",
            color: "oklch(0.06 0.005 280)",
          }}
        >
          <span className="relative z-10 flex items-center gap-3 font-sans text-[9px] tracking-[0.22em] uppercase font-semibold">
            Complimentary Wealth Blueprint
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
          </span>
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500"
            style={{ backgroundColor: "var(--lux-accent)" }}
          />
        </Link>

        <Link
          href="/services"
          className="group flex items-center gap-2.5 no-underline font-sans text-[9px] tracking-[0.22em] uppercase font-medium transition-colors duration-500"
          style={{ color: "color-mix(in oklab, var(--lux-accent) 70%, transparent)" }}
        >
          <span className="group-hover:text-[color:var(--lux-accent)] transition-colors duration-500">Explore Services</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
        </Link>
      </motion.div>

      {/* PMS BADGE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3"
      >
        <div
          className="flex items-center justify-center w-11 h-11 border"
          style={{
            backgroundColor: "oklch(0.10 0.01 280)",
            borderColor: "oklch(0.95 0.01 85 / 0.10)",
          }}
        >
          <span className="font-sans text-[10px] tracking-[0.15em] font-bold" style={{ color: "oklch(0.95 0.01 85)" }}>
            PMS
          </span>
        </div>

        <div className="h-10 w-px" style={{ backgroundColor: "oklch(0.95 0.01 85 / 0.10)" }} />

        <div className="flex flex-col gap-1">
          <span
            className="inline-block px-2 py-[3px] font-sans text-[8px] tracking-[0.15em] uppercase font-bold w-fit max-w-[70vw] md:max-w-none whitespace-normal text-center"
            style={{
              backgroundColor: "oklch(0.78 0.08 65 / 0.90)",
              color: "oklch(0.06 0.005 280)",
            }}
          >
            PMS Distribution | Credentialed
          </span>
          <span className="font-sans text-[9px] tracking-[0.22em] uppercase" style={{ color: "oklch(0.95 0.01 85 / 0.40)" }}>
            Certification No. 2430447816
          </span>
        </div>
      </motion.div>
    </div>
  );
}

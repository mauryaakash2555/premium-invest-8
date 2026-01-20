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
          animate={{ width: 80 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-px"
          style={{
            background:
              "linear-gradient(to right, oklch(0.78 0.08 65), color-mix(in oklab, oklch(0.78 0.08 65) 0%, transparent))",
          }}
        />
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[10px] tracking-[0.4em] uppercase font-semibold"
          style={{ color: "oklch(0.78 0.08 65)" }}
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
            className="font-serif text-[10.5vw] md:text-[7.8vw] lg:text-[6vw] font-light leading-[0.92] tracking-[-0.03em]"
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
            className="font-serif text-[10.5vw] md:text-[7.8vw] lg:text-[6vw] font-extralight italic leading-[0.92] tracking-[-0.03em]"
            style={{ color: "oklch(0.95 0.01 85 / 0.70)" }}
          >
            Financial
          </motion.h1>
        </div>

        {/* Line 3 */}
        <div className="overflow-hidden h-[10.5vw] md:h-[7.8vw] lg:h-[6vw]">
          <AnimatePresence mode="wait">
            <motion.h1
              key={cyclingWords[wordIndex]}
              initial={{ y: 80, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -80, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[10.5vw] md:text-[7.8vw] lg:text-[6vw] font-light leading-[0.92] tracking-[-0.03em]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, oklch(0.78 0.08 65), oklch(0.95 0.01 85), oklch(0.78 0.08 65))",
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
        className="font-sans text-base md:text-lg leading-[2] tracking-wide font-light max-w-xl mb-10 md:mb-12"
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
        className="flex flex-wrap items-center gap-6 mb-12 md:mb-16"
      >
        <Link
          href="/blueprint"
          className="group relative overflow-hidden px-10 py-5 no-underline transition-all duration-500"
          style={{
            backgroundColor: "oklch(0.95 0.01 85)",
            color: "oklch(0.06 0.005 280)",
          }}
        >
          <span className="relative z-10 flex items-center gap-4 font-sans text-[10px] tracking-[0.2em] uppercase font-semibold">
            Complimentary Wealth Blueprint
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
          </span>
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500"
            style={{ backgroundColor: "oklch(0.78 0.08 65)" }}
          />
        </Link>

        <Link
          href="/services"
          className="group flex items-center gap-3 no-underline font-sans text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-500"
          style={{ color: "oklch(0.95 0.01 85 / 0.60)" }}
        >
          <span className="group-hover:text-[oklch(0.95_0.01_85)] transition-colors duration-500">Explore Services</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
        </Link>
      </motion.div>

      {/* PMS BADGE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4"
      >
        <div
          className="flex items-center justify-center w-14 h-14 border"
          style={{
            backgroundColor: "oklch(0.10 0.01 280)",
            borderColor: "oklch(0.95 0.01 85 / 0.10)",
          }}
        >
          <span className="font-sans text-[11px] tracking-[0.15em] font-bold" style={{ color: "oklch(0.95 0.01 85)" }}>
            PMS
          </span>
        </div>

        <div className="h-10 w-px" style={{ backgroundColor: "oklch(0.95 0.01 85 / 0.10)" }} />

        <div className="flex flex-col gap-1">
          <span
            className="inline-block px-2.5 py-1 font-sans text-[9px] tracking-[0.15em] uppercase font-bold w-fit"
            style={{
              backgroundColor: "oklch(0.78 0.08 65 / 0.90)",
              color: "oklch(0.06 0.005 280)",
            }}
          >
            SEBI Registered
          </span>
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase" style={{ color: "oklch(0.95 0.01 85 / 0.40)" }}>
            Certification No. 2430447816
          </span>
        </div>
      </motion.div>
    </div>
  );
}

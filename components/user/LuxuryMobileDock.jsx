/**
 * FILE: components\user\LuxuryMobileDock.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - react
 * - next/navigation
 * - lucide-react
 * - @/lib/utils
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

﻿"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Briefcase, Users, Menu, X, Info, Layers, BookOpen, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { label: "Home", icon: <Home className="w-5 h-5" strokeWidth={1} />, href: "/" },
  { label: "About Us", icon: <Info className="w-5 h-5" strokeWidth={1} />, href: "/about-us" },
  { label: "Partners", icon: <Users className="w-5 h-5" strokeWidth={1} />, href: "/partners" },
  { label: "Tools", icon: <Layers className="w-5 h-5" strokeWidth={1} />, href: "/tools" },
];

const allNavItems = [
  { label: "Home", icon: <Home className="w-6 h-6" strokeWidth={1} />, href: "/" },
  { label: "About", icon: <Info className="w-6 h-6" strokeWidth={1} />, href: "/about-us" },
  { label: "Services", icon: <Briefcase className="w-6 h-6" strokeWidth={1} />, href: "/services" },
  { label: "Intelligence", icon: <Layers className="w-6 h-6" strokeWidth={1} />, href: "/intelligence" },
  { label: "Live Intel", icon: <Layers className="w-6 h-6" strokeWidth={1} />, href: "/live-intelligence" },
  { label: "Tools", icon: <Layers className="w-6 h-6" strokeWidth={1} />, href: "/tools" },
  { label: "Partners", icon: <Users className="w-6 h-6" strokeWidth={1} />, href: "/partners" },
  { label: "Client Portal", icon: <Briefcase className="w-6 h-6" strokeWidth={1} />, href: "/client-portal" },
  { label: "Blog", icon: <BookOpen className="w-6 h-6" strokeWidth={1} />, href: "/blog" },
  { label: "Contact", icon: <Mail className="w-6 h-6" strokeWidth={1} />, href: "/contact" },
];

export function LuxuryMobileDock() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [idleIndex, setIdleIndex] = useState(null);
  const [pressedIndex, setPressedIndex] = useState(null);
  const [menuIsScrolling, setMenuIsScrolling] = useState(false);
  const [dockGlareKey, setDockGlareKey] = useState(0);
  const [dockGlareVisible, setDockGlareVisible] = useState(false);
  const lastScrollYRef = useRef(0);
  const scrollRafRef = useRef(0);
  const scrollTimeoutRef = useRef(0);
  const highlightTimeoutRef = useRef(0);
  const pressedTimeoutRef = useRef(0);
  const menuScrollRafRef = useRef(0);
  const menuScrollTimeoutRef = useRef(0);
  const dockGlareTimeoutRef = useRef(0);
  const lastDockGlareAtRef = useRef(0);
  const pathname = usePathname();
  const router = useRouter();

  // Keep the calculator screen clean (no dock overlay)
  // IMPORTANT: Do NOT return early before hooks below (breaks hook ordering).
  const hideDock =
    pathname?.startsWith("/tools/tax-optimization") ||
    pathname?.startsWith("/tools/tax-leak-detector") ||
    pathname?.startsWith("/tax-leak-detector") ||
    pathname?.startsWith("/live-intelligence");

  // Let other floating UI (e.g., the bot) know how much space the dock needs.
  // When the dock is hidden (route-level) or visually down (reading mode), the bot can sit lower.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const dockVisible = !hideDock && !isReading;
    // Matches the dock's visual footprint (bottom-3 + padding), but keeps it minimal.
    const clearancePx = dockVisible ? 72 : 6;
    root.style.setProperty("--li-mobile-dock-clearance", `${clearancePx}px`);
    return () => {
      root.style.removeProperty("--li-mobile-dock-clearance");
    };
  }, [hideDock, isReading]);

  // If we navigate into a route where the dock is hidden, force-close any open menu
  // and clear transient highlight state.
  useEffect(() => {
    if (!hideDock) return;
    setIsMenuOpen(false);
    setHoveredIndex(null);
    setIdleIndex(null);
    setPressedIndex(null);
    setMenuIsScrolling(false);
    setIsReading(false);
    setIsScrolling(false);
  }, [hideDock]);

  // When the "pop-out" (full-screen) menu closes, ensure no stale hover state
  // remains (hover events may not fire on unmount, causing buttons to look stuck).
  useEffect(() => {
    if (hideDock) return;
    if (!isMenuOpen) {
      setHoveredIndex(null);
      setIdleIndex(null);
      setPressedIndex(null);
    }
  }, [isMenuOpen, hideDock]);

  useEffect(() => {
    if (hideDock) return;
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;

    const handleScroll = () => {
      // When the overlay menu is open, don't let scroll-driven UI states fight the animation
      if (isMenuOpen) return;
      if (scrollRafRef.current) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = 0;

        const currentScrollY = window.scrollY;
        const nextScrolled = currentScrollY > 50;
        setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

        // "Animate while scrolling" (brief shimmer burst)
        setIsScrolling((prev) => (prev ? prev : true));
        if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = window.setTimeout(() => setIsScrolling(false), 180);

        // Super smooth reading mode detection
        const last = lastScrollYRef.current;
        const nextReading =
          (currentScrollY > last + 15 && currentScrollY > 250) ? true :
          (currentScrollY < last - 15 || currentScrollY < 50) ? false :
          null;
        if (nextReading !== null) {
          setIsReading((prev) => (prev === nextReading ? prev : nextReading));
        }
        lastScrollYRef.current = currentScrollY;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = 0;
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = 0;
    };
  }, [isMenuOpen, hideDock]);

  const pulseHighlight = (index) => {
    if (typeof window === "undefined") return;
    if (highlightTimeoutRef.current) window.clearTimeout(highlightTimeoutRef.current);
    setHoveredIndex(index);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHoveredIndex(null);
    }, 520);
  };

  const pulsePressed = (index) => {
    if (typeof window === "undefined") return;
    if (pressedTimeoutRef.current) window.clearTimeout(pressedTimeoutRef.current);
    setPressedIndex(index);
    pressedTimeoutRef.current = window.setTimeout(() => {
      setPressedIndex(null);
    }, 650);
  };

  const triggerDockGlare = () => {
    if (typeof window === "undefined") return;
    if (dockGlareTimeoutRef.current) window.clearTimeout(dockGlareTimeoutRef.current);
    lastDockGlareAtRef.current = Date.now();
    setDockGlareKey((k) => k + 1);
    setDockGlareVisible(true);
    dockGlareTimeoutRef.current = window.setTimeout(() => setDockGlareVisible(false), 650);
  };

  // Premium idle effect: occasional full-dock glare sweep (pause → sweep → pause)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hideDock) return;
    if (isMenuOpen) return;
    if (isReading) return;
    if (isScrolling) return;

    let cancelled = false;
    let timer = 0;

    const scheduleNext = () => {
      if (cancelled) return;
      // Premium feel: short, irregular pause between sweeps
      const baseDelayMs = 4800 + Math.floor(Math.random() * 1400); // ~4.8s → ~6.2s
      // Never sweep too frequently (esp. right after user interaction)
      const minGapMs = 3800;
      const elapsedMs = Date.now() - (lastDockGlareAtRef.current || 0);
      const nextDelayMs = Math.max(baseDelayMs, minGapMs - elapsedMs);
      timer = window.setTimeout(() => {
        triggerDockGlare();
        scheduleNext();
      }, nextDelayMs);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };
  }, [hideDock, isMenuOpen, isReading, isScrolling]);

  // Idle "alive" animation (dock): gently cycles highlight across dock buttons.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hideDock) return;
    if (isMenuOpen) return;

    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (hoveredIndex === null && !isScrolling && !isReading) {
        setIdleIndex(i % (mainNavItems.length + 1)); // last slot used for "More"
        i += 1;
      }
    };

    const start = window.setTimeout(() => tick(), 1200);
    const interval = window.setInterval(() => tick(), 2600);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearInterval(interval);
      setIdleIndex(null);
    };
  }, [isMenuOpen, hoveredIndex, isScrolling, isReading, hideDock]);

  // Idle "alive" animation (menu): when full-screen menu is open, cycle a gentle highlight.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hideDock) return;
    if (!isMenuOpen) return;

    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      // Only when not hovering and not actively scrolling inside menu.
      if (hoveredIndex === null && !menuIsScrolling) {
        setIdleIndex(i % allNavItems.length);
        i += 1;
      }
    };

    const start = window.setTimeout(() => tick(), 500);
    const interval = window.setInterval(() => tick(), 2200);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearInterval(interval);
      setIdleIndex(null);
    };
  }, [isMenuOpen, hoveredIndex, menuIsScrolling, hideDock]);

  // Lock background scroll while the full-screen menu is open (prevents flicker/glitch)
  useEffect(() => {
    if (hideDock) return;
    if (!isMenuOpen) return;
    setIsReading(false);

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isMenuOpen, hideDock]);

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
    setHoveredIndex(null);
    setIdleIndex(null);
    setPressedIndex(null);
    router.push(href);
  };

  const handleMenuNavClick = (href, index) => {
    setHoveredIndex(null);
    setIdleIndex(index);
    pulsePressed(index);
    window.setTimeout(() => handleNavClick(href), 220);
  };

  const highlightIndex = hoveredIndex ?? idleIndex;

  const handleMenuScroll = () => {
    if (typeof window === "undefined") return;
    if (menuScrollRafRef.current) return;
    menuScrollRafRef.current = window.requestAnimationFrame(() => {
      menuScrollRafRef.current = 0;
      setMenuIsScrolling(true);
      if (menuScrollTimeoutRef.current) window.clearTimeout(menuScrollTimeoutRef.current);
      menuScrollTimeoutRef.current = window.setTimeout(() => setMenuIsScrolling(false), 180);
    });
  };

  if (hideDock) return null;

  return (
    <>
      {/* Main Dock - ULTRA LUXURY EDITION */}
      <nav
        className={cn(
          "fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] lg:hidden",
          "w-[calc(100%-24px)] max-w-[400px]", // Responsive width with safe margins
          "transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]", // Premium ultra-smooth easing
          scrolled ? "scale-90" : "scale-100",
          isReading ? "opacity-0 pointer-events-none scale-75 translate-y-10 blur-sm" : "opacity-100 pointer-events-auto scale-100 translate-y-0 blur-0"
        )}
      >
        <div
          className={cn(
            "luxury-dock-shell luxury-particles ambient-glow-pulse",
            // Removed shimmer sweep on the main dock; glare is handled per-button on hover/highlight.
            "relative flex items-center justify-between gap-0.5 px-2 sm:px-3 py-2 rounded-full backdrop-blur-xl bg-[#000000]", // Responsive padding
            "border-[2.5px] border-[#C0A062]", // High-visibility thicker gold border
            "shadow-[0_0_40px_rgba(192,160,98,0.5),0_0_80px_rgba(192,160,98,0.3),inset_0_0_20px_rgba(192,160,98,0.2)]"
          )}
          onMouseEnter={() => triggerDockGlare()}
          onTouchStart={() => triggerDockGlare()}
        >
          {dockGlareVisible && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div key={dockGlareKey} className="lux-dock-glare lux-dock-glare--dock" />
            </div>
          )}

          {/* Floating Gold Dust Elements - Increased Density */}
          <div className="gold-particle top-1 left-[10%]" style={{ animationDelay: '0s', width: '2px', height: '2px' }} />
          <div className="gold-particle bottom-2 left-[25%]" style={{ animationDelay: '1.5s', width: '3px', height: '3px' }} />
          <div className="gold-particle top-1/2 left-[40%]" style={{ animationDelay: '3s', width: '1.5px', height: '1.5px' }} />
          <div className="gold-particle top-3 left-[60%]" style={{ animationDelay: '0.7s', width: '2.5px', height: '2.5px' }} />
          <div className="gold-particle bottom-1 left-[75%]" style={{ animationDelay: '2.2s', width: '2px', height: '2px' }} />
          <div className="gold-particle top-1/2 left-[90%]" style={{ animationDelay: '4s', width: '3px', height: '3px' }} />
          <div className="gold-particle bottom-4 left-[15%]" style={{ animationDelay: '3.5s', width: '1.5px', height: '1.5px' }} />
          <div className="gold-particle top-2 left-[80%]" style={{ animationDelay: '1.1s', width: '2px', height: '2px' }} />

          {/* Saturated Accent Dots with halos */}
          <div className="absolute top-1/2 left-2.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C0A062] shadow-[0_0_12px_#C0A062] animate-pulse" />
          <div
            className="absolute top-1/2 right-2.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C0A062] shadow-[0_0_12px_#C0A062] animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          {mainNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            const isHighlighted = highlightIndex === index; // Removed active-path auto-highlight
            return (
              <button
                key={index}
                onClick={() => handleNavClick(item.href)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => {
                  triggerDockGlare();
                  pulseHighlight(index);
                }}
                onPointerDown={() => {
                  triggerDockGlare();
                  pulseHighlight(index);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center px-2 sm:px-4 py-1.5 flex-1 min-w-0",
                  "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  "hover:scale-120 active:scale-95 group"
                )}
                aria-label={item.label}
              >
                {isHighlighted && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C0A062]/40 via-[#C0A062]/10 to-white/20 blur-xl animate-in fade-in duration-500 shadow-[0_0_25px_rgba(192,160,98,0.4)]" />
                )}

                <div
                  className={cn(
                    "relative transition-all duration-500 flex items-center justify-center",
                    isHighlighted ? "text-[#D4B576] brightness-150 scale-110" : "text-[#C0A062]/70",
                    "group-hover:drop-shadow-[0_0_18px_rgba(192,160,98,1)]"
                  )}
                >
                  {item.icon}
                </div>
                <span
                  className={cn(
                    "font-inter text-[8px] mt-1.5 transition-all duration-500",
                    "tracking-[0.12em] uppercase font-bold",
                    isHighlighted ? "text-[#D4B576] brightness-125" : "text-[#C0A062]/50",
                    "group-hover:scale-110"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMenuOpen(true)}
            onMouseEnter={() => setHoveredIndex(mainNavItems.length)}
            onMouseLeave={() => setHoveredIndex(null)}
            onTouchStart={() => {
              triggerDockGlare();
              pulseHighlight(mainNavItems.length);
            }}
            onPointerDown={() => {
              triggerDockGlare();
              pulseHighlight(mainNavItems.length);
            }}
            className={cn(
              "relative flex flex-col items-center justify-center px-2 sm:px-4 py-1.5 flex-1 min-w-0",
              "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              "hover:scale-120 active:scale-95 group"
            )}
            aria-label="More menu"
          >
            {(hoveredIndex === mainNavItems.length || highlightIndex === mainNavItems.length) && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C0A062]/40 via-[#C0A062]/10 to-white/20 blur-xl animate-in fade-in duration-500 shadow-[0_0_25px_rgba(192,160,98,0.4)]" />
            )}

            <div
              className={cn(
                "relative text-[#C0A062]/70 transition-all duration-500",
                "group-hover:text-[#D4B576] group-hover:brightness-150",
                "group-hover:drop-shadow-[0_0_18px_rgba(192,160,98,1)]",
                "group-hover:rotate-90"
              )}
            >
              <Menu className="w-5 h-5" strokeWidth={1} />
            </div>
            <span
              className={cn(
                "font-inter text-[8px] mt-1.5 transition-all duration-500",
                "tracking-[0.12em] uppercase font-bold",
                "text-[#C0A062]/50 group-hover:text-[#D4B576] group-hover:brightness-125",
                "group-hover:scale-110"
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Full-Screen Overlay Menu - FIXED ALIGNMENT & FOLLOW-THE-MOUSE LOGIC */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[10000] animate-in fade-in duration-300 transform-gpu" style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}>
          <div
            className="absolute inset-0 backdrop-blur-xl transform-gpu"
            style={{ backgroundColor: "rgba(0,0,0,0.995)", WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
            onClick={() => setIsMenuOpen(false)}
          />

          <div
            className={cn(
              "gold-grain-texture luxury-particles scrollbar-hide", 
              "relative h-full flex flex-col items-center p-8 overflow-y-auto overscroll-contain transform-gpu", 
              "bg-gradient-to-b from-[#000000] via-[#0a0a0a] to-[#000000]",
              "animate-in slide-in-from-bottom-8 fade-in duration-500"
            )}
            style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
            onScroll={handleMenuScroll}
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "fixed top-8 right-8 group z-[10001]", 
                "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                "hover:scale-125 hover:rotate-90 active:scale-95",
                "text-[#C0A062]"
              )}
              aria-label="Close menu"
            >
              <div className="relative group-hover:drop-shadow-[0_0_25px_rgba(192,160,98,1)]">
                <X className="w-8 h-8" strokeWidth={1} />
              </div>
            </button>

            <div className="absolute top-8 left-8">
              <h2 className="gold-gradient-text font-serif text-2xl tracking-[0.2em] uppercase">Navigation</h2>
              <div className="h-[1px] w-full bg-gradient-to-r from-[#C0A062] to-transparent mt-2" />
            </div>

            <nav className="flex flex-col items-stretch gap-4 w-full max-w-sm pt-24 pb-12"> 
              {allNavItems.map((item, index) => {
                const isActive = pathname === item.href;
                const isMenuHighlighted = (hoveredIndex ?? idleIndex) === index;
                const isPressed = pressedIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleMenuNavClick(item.href, index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => {
                      pulseHighlight(index);
                      pulsePressed(index);
                      setIdleIndex(index);
                    }}
                    onPointerDown={() => {
                      pulseHighlight(index);
                      pulsePressed(index);
                      setIdleIndex(index);
                    }}
                    className={cn(
                      "group w-full relative",
                      "flex items-center gap-6 px-8 py-5 rounded-2xl",
                      "border border-[#C0A062]/20",
                      "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                      "hover:bg-gradient-to-r hover:from-[#C0A062]/15 hover:via-[#C0A062]/5 hover:to-transparent",
                      "hover:border-[#C0A062]/60 hover:shadow-[0_0_35px_rgba(192,160,98,0.4)]",
                      "hover:scale-105 hover:translate-x-2",
                      "backdrop-blur-sm",
                      isMenuHighlighted &&
                        "bg-gradient-to-r from-[#C0A062]/10 via-transparent to-transparent border-[#C0A062]/45 scale-[1.03] translate-x-2 shadow-[0_0_35px_rgba(192,160,98,0.35)]",
                      isPressed &&
                        "bg-gradient-to-r from-[#C0A062]/15 via-[#C0A062]/5 to-transparent border-[#C0A062]/60 shadow-[0_0_35px_rgba(192,160,98,0.4)] scale-105 translate-x-2"
                    )}
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    {/* Only show the glowing pop on hover (follow the mouse) */}
                    {(hoveredIndex === index || (hoveredIndex === null && idleIndex === index)) && (
                      <div className="absolute left-8 w-12 h-12 bg-[#C0A062]/25 rounded-full blur-2xl transition-all duration-500 animate-pulse" />
                    )}

                    <div
                      className={cn(
                        "relative z-10 transition-all duration-500",
                        isActive ? "text-[#D4B576] scale-110" : "text-[#C0A062]",
                        "group-hover:text-[#D4B576] group-hover:scale-125 group-hover:rotate-12 group-hover:filter group-hover:brightness-150 group-hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.8)]"
                      )}
                    >
                      {item.icon}
                    </div>
                    
                    <div className="flex flex-col items-start flex-1 relative z-10">
                      <span
                        className={cn(
                          "font-serif text-2xl transition-all duration-500 text-left w-full", 
                          isActive ? "text-[#D4B576]" : "text-[#C0A062]",
                          "group-hover:text-[#D4B576] group-hover:tracking-wider group-hover:drop-shadow-[0_0_10px_rgba(192,160,98,0.6)]"
                        )}
                      >
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "font-inter text-[10px] transition-all duration-500 text-left w-full", 
                          isActive ? "text-[#C0A062]/80" : "text-[#C0A062]/40",
                          "group-hover:text-[#C0A062]/80",
                          "tracking-[0.15em] uppercase mt-1"
                        )}
                      >
                        Navigate to {item.label.toLowerCase()}
                      </span>
                    </div>

                    {/* ONLY ONE DOT SHOWING - THE ONE UNDER THE MOUSE */}
                    <div
                      className={cn(
                        "relative z-10 w-2.5 h-2.5 rounded-full transition-all duration-500",
                        isMenuHighlighted ? "bg-[#C0A062] shadow-[0_0_20px_rgba(192,160,98,1)] scale-150" : "bg-transparent scale-0",
                        "group-hover:scale-150"
                      )}
                    >
                      <div className="absolute inset-0 rounded-full bg-[#C0A062] opacity-50 animate-ping" />
                    </div>

                    {/* Luxury Shimmer - always slightly on, strong on hover */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-700",
                      hoveredIndex === index || isPressed ? "opacity-100" : isMenuHighlighted ? "opacity-45" : "opacity-20"
                    )}>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#C0A062]/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200" />
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="flex flex-col items-center gap-4 pb-12 opacity-40">
              <div className="relative w-32 h-[2px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4B576] to-transparent blur-sm animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LuxuryMobileDock;


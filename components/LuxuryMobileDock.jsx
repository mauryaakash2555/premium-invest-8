"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Briefcase, Users, Menu, X, Info, Layers, BookOpen, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { label: "Home", icon: <Home className="w-5 h-5" strokeWidth={1} />, href: "/" },
  { label: "Services", icon: <Briefcase className="w-5 h-5" strokeWidth={1} />, href: "/services" },
  { label: "Partners", icon: <Users className="w-5 h-5" strokeWidth={1} />, href: "/curated-partners" },
];

const allNavItems = [
  { label: "Home", icon: <Home className="w-6 h-6" strokeWidth={1} />, href: "/" },
  { label: "About", icon: <Info className="w-6 h-6" strokeWidth={1} />, href: "/about-us" },
  { label: "Services", icon: <Briefcase className="w-6 h-6" strokeWidth={1} />, href: "/services" },
  { label: "Platforms", icon: <Layers className="w-6 h-6" strokeWidth={1} />, href: "/platforms" },
  { label: "Curated Partners", icon: <Users className="w-6 h-6" strokeWidth={1} />, href: "/curated-partners" },
  { label: "Blog", icon: <BookOpen className="w-6 h-6" strokeWidth={1} />, href: "/blog" },
  { label: "Contact", icon: <Mail className="w-6 h-6" strokeWidth={1} />, href: "/contact" },
];

export function LuxuryMobileDock() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      // Super smooth reading mode detection
      if (currentScrollY > lastScrollY + 15 && currentScrollY > 250) {
        setIsReading(true);
      } else if (currentScrollY < lastScrollY - 15 || currentScrollY < 50) {
        setIsReading(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
    setHoveredIndex(null);
    router.push(href);
  };

  return (
    <>
      {/* Main Dock - ULTRA LUXURY EDITION */}
      <nav
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] lg:hidden",
          "transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]", // Premium ultra-smooth easing
          scrolled ? "scale-90" : "scale-100",
          isReading ? "opacity-0 pointer-events-none scale-75 translate-y-10 blur-sm" : "opacity-100 pointer-events-auto scale-100 translate-y-0 blur-0"
        )}
      >
        <div
          className={cn(
            "luxury-dock-shell luxury-wave-container luxury-particles ultra-luxury-glass ambient-glow-pulse",
            "relative flex items-center gap-1.5 px-4.5 py-3 bg-[#000000] rounded-full", // Pitch black bg
            "border-[2.5px] border-[#C0A062]", // High-visibility thicker gold border
            "shadow-[0_0_40px_rgba(192,160,98,0.5),0_0_80px_rgba(192,160,98,0.3),inset_0_0_20px_rgba(192,160,98,0.2)]"
          )}
        >
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
            return (
              <button
                key={index}
                onClick={() => handleNavClick(item.href)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex flex-col items-center justify-center px-4 py-1.5",
                  "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  "hover:scale-120 active:scale-95 group"
                )}
                aria-label={item.label}
              >
                {(hoveredIndex === index || isActive) && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C0A062]/40 via-[#C0A062]/10 to-white/20 blur-xl animate-in fade-in duration-500 shadow-[0_0_25px_rgba(192,160,98,0.4)]" />
                )}

                <div
                  className={cn(
                    "relative transition-all duration-500 flex items-center justify-center",
                    isActive || hoveredIndex === index ? "text-[#D4B576] brightness-150 scale-110" : "text-[#C0A062]/70",
                    "group-hover:drop-shadow-[0_0_18px_rgba(192,160,98,1)]"
                  )}
                >
                  {item.icon}
                </div>
                <span
                  className={cn(
                    "font-inter text-[8px] mt-1.5 transition-all duration-500",
                    "tracking-[0.12em] uppercase font-bold",
                    isActive || hoveredIndex === index ? "text-[#D4B576] brightness-125" : "text-[#C0A062]/50",
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
            onMouseEnter={() => setHoveredIndex(999)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "relative flex flex-col items-center justify-center px-4 py-1.5",
              "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              "hover:scale-120 active:scale-95 group"
            )}
            aria-label="More menu"
          >
            {hoveredIndex === 999 && (
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
        <div className="fixed inset-0 z-[10000] animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)} />

          <div
            className={cn(
              "gold-grain-texture luxury-particles scrollbar-hide", 
              "relative h-full flex flex-col items-center p-8 overflow-y-auto", 
              "bg-gradient-to-b from-[#000000] via-[#0a0a0a] to-[#000000]"
            )}
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
                return (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={cn(
                      "group w-full relative",
                      "flex items-center gap-6 px-8 py-5 rounded-2xl",
                      "border border-[#C0A062]/20",
                      "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                      "hover:bg-gradient-to-r hover:from-[#C0A062]/15 hover:via-[#C0A062]/5 hover:to-transparent",
                      "hover:border-[#C0A062]/60 hover:shadow-[0_0_35px_rgba(192,160,98,0.4)]",
                      "hover:scale-105 hover:translate-x-2",
                      "backdrop-blur-sm"
                    )}
                  >
                    {/* Only show the glowing pop on hover (follow the mouse) */}
                    {hoveredIndex === index && (
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
                        hoveredIndex === index ? "bg-[#C0A062] shadow-[0_0_20px_rgba(192,160,98,1)] scale-150" : "bg-transparent scale-0",
                        "group-hover:scale-150"
                      )}
                    >
                      <div className="absolute inset-0 rounded-full bg-[#C0A062] opacity-50 animate-ping" />
                    </div>

                    {/* Luxury Shimmer - always slightly on, strong on hover */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-700",
                      hoveredIndex === index ? "opacity-100" : "opacity-20"
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


"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// CONFIGURATION - NO DUMMY DATA ANYWHERE
// ============================================================
const MODES = {
  market: {
    label: "Market Pulse",
    gradient: "from-emerald-500/20 via-teal-500/15 to-cyan-500/20",
    accent: "rgb(52, 211, 153)",      // emerald-400 for button
    accentDim: "rgb(16, 185, 129)",   // emerald-500 for button hover
  },
  global: {
    label: "Global Watch",
    gradient: "from-blue-500/20 via-indigo-500/15 to-purple-500/20",
    accent: "rgb(96, 165, 250)",      // blue-400
    accentDim: "rgb(59, 130, 246)",   // blue-500
  },
  sector: {
    label: "Sector Spotlight",
    gradient: "from-amber-500/20 via-orange-500/15 to-yellow-500/20",
    accent: "rgb(251, 191, 36)",      // amber-400
    accentDim: "rgb(245, 158, 11)",   // amber-500
  },
  crypto: {
    label: "Crypto Corner",
    gradient: "from-violet-500/20 via-purple-500/15 to-fuchsia-500/20",
    accent: "rgb(167, 139, 250)",     // violet-400
    accentDim: "rgb(139, 92, 246)",   // violet-500
  },
};

// FIXED TEXT COLOR - Never changes regardless of mode (for readability)
const TEXT_COLOR = "rgba(200, 215, 240, 0.85)";

// Only button/tab colors change based on mode
const getModeColors = (mode) => MODES[mode] || MODES.market;

// ============================================================
// COMPONENT
// ============================================================
export default function MarketMoodStrip() {
  const [mode, setMode] = useState("market");
  const [headlines, setHeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch live headlines - NO FALLBACK DATA
  useEffect(() => {
    let mounted = true;
    
    async function fetchHeadlines() {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await fetch("/api/live-intelligence/headlines", {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!mounted) return;
        
        if (data?.headlines?.length > 0) {
          setHeadlines(data.headlines);
        } else {
          // No headlines available - show empty state, NOT dummy data
          setHeadlines([]);
          setError("No headlines available");
        }
      } catch (err) {
        console.error("Failed to fetch headlines:", err);
        if (mounted) {
          setError(err.message);
          setHeadlines([]); // NO FALLBACK - empty array
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchHeadlines();
    const interval = setInterval(fetchHeadlines, 60000); // Refresh every minute

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [mode]);

  // Scroll animation
  useEffect(() => {
    if (!scrollRef.current || isPaused || headlines.length === 0) return;

    const el = scrollRef.current;
    let pos = 0;
    const speed = 0.5; // pixels per frame

    function animate() {
      pos += speed;
      if (pos >= el.scrollWidth / 2) {
        pos = 0;
      }
      el.style.transform = `translateX(-${pos}px)`;
      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, headlines]);

  const modeColors = getModeColors(mode);

  // Doubled headlines for seamless scroll
  const displayHeadlines = useMemo(() => {
    if (headlines.length === 0) return [];
    return [...headlines, ...headlines];
  }, [headlines]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Single thin separator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
      
      <div className={`relative bg-gradient-to-r ${modeColors.gradient} backdrop-blur-sm`}>
        <div className="flex items-center h-8 px-2 gap-2">
          {/* Mode Button - ONLY THIS CHANGES COLOR */}
          <button
            onClick={() => {
              const keys = Object.keys(MODES);
              const idx = keys.indexOf(mode);
              setMode(keys[(idx + 1) % keys.length]);
            }}
            className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: `${modeColors.accent}20`,
              color: modeColors.accent,
              borderColor: modeColors.accentDim,
              borderWidth: "1px",
            }}
          >
            {modeColors.label}
          </button>

          {/* Scrolling Headlines Container */}
          <div 
            className="flex-1 overflow-hidden relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {isLoading ? (
              <span 
                className="text-xs animate-pulse"
                style={{ color: TEXT_COLOR }}
              >
                Loading market intelligence...
              </span>
            ) : error || headlines.length === 0 ? (
              <span 
                className="text-xs"
                style={{ color: TEXT_COLOR, opacity: 0.6 }}
              >
                Connecting to live market feed...
              </span>
            ) : (
              <div
                ref={scrollRef}
                className="flex items-center whitespace-nowrap"
                style={{ willChange: "transform" }}
              >
                {displayHeadlines.map((headline, idx) => (
                  <span
                    key={`${headline.id || idx}-${idx}`}
                    className="inline-flex items-center text-xs mx-4"
                    style={{ color: TEXT_COLOR }}
                  >
                    <span className="mr-2 opacity-40">•</span>
                    {headline.text || headline.title || headline}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Live indicator */}
          <div className="flex-shrink-0 flex items-center gap-1 text-xs" style={{ color: TEXT_COLOR, opacity: 0.6 }}>
            <span className="relative flex h-2 w-2">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: modeColors.accent }}
              />
              <span 
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: modeColors.accent }}
              />
            </span>
            <span className="hidden sm:inline">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client"

/**
 * LaserFooter.jsx - Premium Footer for Live Intelligence Hero Page
 * 
 * This is a SEPARATE footer component for the laser page only.
 * It uses the same structure as the main Footer but with:
 * - Panel's premium icy color palette (no gold/yellow)
 * - Ice/snow particles instead of gold dust
 * - All animations preserved
 * - Beautiful diamond ice shine on Vault icon
 */

import { MessageCircle, ArrowRight, ExternalLink, ShieldCheck, Gem, Crown, Info, MapPin } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useIsMobile } from "@/hooks/useIsMobile"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Premium Panel Color Palette (matching laser page panel)
const COLORS = {
  accent: 'rgba(170, 198, 255, 0.70)',        // --li-panel-accent
  accentStrong: 'rgba(170, 198, 255, 0.82)',  // --li-panel-accent-strong
  accentGlow: 'rgba(170, 198, 255, 0.18)',    // soft glow
  title: 'rgba(235, 242, 255, 0.94)',         // --li-panel-title
  body: 'rgba(220, 230, 255, 0.70)',          // --li-panel-body
  muted: 'rgba(220, 230, 255, 0.62)',         // --li-panel-muted
  border: 'rgba(170, 198, 255, 0.22)',
  bgGradient: 'linear-gradient(135deg, rgba(6, 8, 14, 0.92) 0%, rgba(0, 0, 0, 0.98) 100%)',
  // Diamond shine colors
  diamondCore: 'rgba(200, 220, 255, 1)',
  diamondGlow: 'rgba(170, 198, 255, 0.9)',
  diamondSparkle: 'rgba(255, 255, 255, 0.95)',
}

// ICY Newsletter Signup Component (inline - no gold)
const LaserNewsletterSignup = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        setStatus("success")
        setEmail("")
        setTimeout(() => setStatus("idle"), 5000)
      } else {
        setStatus("error")
        setTimeout(() => setStatus("idle"), 5000)
      }
    } catch (error) {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  return (
    <div 
      className="relative overflow-hidden rounded-2xl px-6 py-8 md:px-10 md:py-9"
      style={{
        background: 'rgba(0, 0, 0, 0.40)',
        border: `1px solid ${COLORS.border}`,
        boxShadow: `0 0 0 1px ${COLORS.accentGlow}, 0 18px 60px rgba(0, 0, 0, 0.55)`,
      }}
    >
      {/* Icy accent glow */}
      <div 
        className="absolute inset-[-1px] pointer-events-none"
        style={{
          background: `
            radial-gradient(900px 320px at 10% 10%, ${COLORS.accentGlow} 0%, transparent 60%),
            radial-gradient(700px 260px at 90% 0%, rgba(170, 198, 255, 0.10) 0%, transparent 62%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0) 55%)
          `,
          opacity: 0.9,
        }}
      />

      {/* Shimmer animation */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.06) 18%, transparent 38%, transparent 100%)',
          animation: 'newsletterShimmer 9s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-3">
            <span className="h-[1px] w-10" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)` }} />
            <div className="text-[10px] uppercase tracking-[0.55em]" style={{ color: 'rgba(255,255,255,0.55)' }}>Private Note</div>
            <span className="h-[1px] w-10" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)` }} />
          </div>

          <h3 
            className="mt-3 text-2xl md:text-[34px] font-serif m-0 tracking-[0.02em]"
            style={{ color: COLORS.title }}
          >
            BM Wealth Dispatch
          </h3>
          <p className="mt-2 text-sm md:text-[13px] m-0 max-w-xl tracking-wide" style={{ color: 'rgba(255,255,255,0.70)' }}>
            One note monthly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={status === "loading"}
                className="w-full sm:w-[320px] rounded-xl px-4 py-3 outline-none transition-colors"
                style={{
                  background: 'rgba(0, 0, 0, 0.30)',
                  border: `1px solid ${COLORS.border}`,
                  color: 'white',
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.accentStrong}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
              <div 
                className="absolute inset-[-1px] rounded-xl pointer-events-none"
                style={{ boxShadow: `0 0 0 1px ${COLORS.accentGlow}`, opacity: 0.55 }}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-300"
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.accent}`,
                color: COLORS.title,
                opacity: status === "loading" ? 0.7 : 1,
                cursor: status === "loading" ? 'not-allowed' : 'pointer',
                boxShadow: `0 0 15px ${COLORS.accentGlow}`,
              }}
              onMouseEnter={(e) => { 
                if (status !== "loading") {
                  e.target.style.transform = 'scale(1.02)'
                  e.target.style.borderColor = COLORS.accentStrong
                  e.target.style.boxShadow = `0 0 25px ${COLORS.accentGlow}`
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.borderColor = COLORS.accent
                e.target.style.boxShadow = `0 0 15px ${COLORS.accentGlow}`
              }}
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </div>

          {status === "success" ? (
            <div className="mt-3 text-[11px] text-emerald-300/90">Subscribed. Check your inbox.</div>
          ) : status === "error" ? (
            <div className="mt-3 text-[11px] text-red-300/90">Unable to subscribe right now. Try again.</div>
          ) : (
            <div className="mt-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Unsubscribe anytime.
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        @keyframes newsletterShimmer {
          0%, 55% { transform: translateX(-120%); opacity: 0; }
          62% { opacity: 1; }
          78% { transform: translateX(120%); opacity: 0.85; }
          100% { transform: translateX(120%); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const LaserFooter = ({ onHomeClick, onNavigate, inLiveOverlay = false } = {}) => {
  const [hoveredLink, setHoveredLink] = useState(null)
  const [isWHAHovered, setIsWHAHovered] = useState(false)
  const [isWHAActive, setIsWHAActive] = useState(false)
  const [isWHAScrollBoost, setIsWHAScrollBoost] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const isMobile = useIsMobile()
  const whatsAppCardRef = useRef(null)
  const sebiRef = useRef(null)
  const noticeRef = useRef(null)
  const [sebiActive, setSebiActive] = useState(false)
  const [noticeActive, setNoticeActive] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1"
    const timeouts = []
    let raf = 0
    let cooldown = false
    let intervalId = null

    const pulse = (setter, ms) => {
      setter(true)
      const t = setTimeout(() => setter(false), ms)
      timeouts.push(t)
    }

    const makeObserver = (el, onVisible, options) => {
      if (!el) return null
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) onVisible()
      }, options)
      obs.observe(el)
      return obs
    }

    const obs1 = makeObserver(whatsAppCardRef.current, () => {
      if (debug) console.log("WhatsApp card visible")
      pulse(setIsWHAScrollBoost, 2500)
    }, { threshold: 0.15, rootMargin: "0px 0px -20% 0px" })

    const isMobileViewport = typeof window !== "undefined" && (
      window.matchMedia
        ? window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)").matches
        : window.innerWidth <= 768
    )

    const inEyeLine = () => {
      const el = whatsAppCardRef.current
      if (!el) return false
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 0
      const centerY = (rect.top + rect.bottom) / 2
      return (
        vh > 0 &&
        rect.bottom > 0 &&
        rect.top < vh &&
        centerY >= vh * 0.25 &&
        centerY <= vh * 0.85
      )
    }

    const onScroll = () => {
      if (cooldown) return
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        if (!inEyeLine()) return
        cooldown = true
        pulse(setIsWHAScrollBoost, 3500)
        const t = setTimeout(() => { cooldown = false }, 4200)
        timeouts.push(t)
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    intervalId = window.setInterval(() => {
      if (cooldown) return
      if (!inEyeLine()) return
      cooldown = true
      pulse(setIsWHAScrollBoost, 3500)
      const t = setTimeout(() => { cooldown = false }, 4200)
      timeouts.push(t)
    }, 700)

    const obs2 = isMobile ? makeObserver(sebiRef.current, () => {
      if (debug) console.log("Disclaimer visible on mobile: SEBI")
      pulse(setSebiActive, 2500)
    }, { threshold: 0.15, rootMargin: "0px 0px -20% 0px" }) : null

    const obs3 = isMobile ? makeObserver(noticeRef.current, () => {
      if (debug) console.log("Disclaimer visible on mobile: Notice")
      pulse(setNoticeActive, 2500)
    }, { threshold: 0.15, rootMargin: "0px 0px -20% 0px" }) : null

    return () => {
      if (obs1) obs1.disconnect()
      if (obs2) obs2.disconnect()
      if (obs3) obs3.disconnect()
      window.removeEventListener("scroll", onScroll)
      if (raf) window.cancelAnimationFrame(raf)
      if (intervalId) window.clearInterval(intervalId)
      timeouts.forEach((t) => clearTimeout(t))
    }
  }, [isMobile])

  const navigationLinks = {
    quick: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
      { label: "Services", href: "/services" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
    resources: [
      { label: "Tools", href: "/tools" },
      { label: "Investment Platforms", href: "/platforms" },
      { label: "Curated Partners", href: "/curated-partners" },
      { label: "Careers", href: "/careers" },
      { label: "Sitemap", href: "/sitemap-page" },
    ],
    legal: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Compliance", href: "/compliance" },
    ],
  }

  const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=66,+Vinod+Villa+Bldg.,+1st+floor+office+no.+108,+Cavel+Cross+Lane+3,+Kalbadevi,+Mumbai+-+400002,+Maharashtra,+India"

  const handleInternalLinkClick = (e, href, label) => {
    if (!inLiveOverlay) return;
    if (label === 'Home' && typeof onHomeClick === 'function') {
      e.preventDefault();
      e.stopPropagation();
      onHomeClick();
      return;
    }
    if (typeof onNavigate === 'function' && typeof href === 'string' && href.startsWith('/')) {
      onNavigate();
    }
  }

  const isWHAPremium = isWHAScrollBoost || (isMobile && isWHAActive) || isWHAHovered

  // Deterministic particle positions for SSR
  const particles = Array.from({ length: 25 }).map((_, i) => {
    const seeded = (n) => {
      const x = Math.sin(n * 9301 + 49297) * 233280
      return Math.abs(x - Math.floor(x))
    }

    return {
      top: Math.floor(seeded(i + 1) * 95),
      left: Math.floor(seeded(i + 11) * 95),
      dur: (7 + Math.floor(seeded(i + 21) * 12)).toFixed(3),
      delay: (seeded(i + 31) * 15).toFixed(3),
    }
  })

  return (
    <footer 
      className="laser-footer relative w-full mt-0 font-inter overflow-hidden"
      style={{ background: '#090A0C' }}
    >
      {/* Top wave accent bar */}
      <div 
        className="absolute top-0 left-0 w-full h-[3px] z-30"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.accent} 50%, transparent 100%)`,
          opacity: 0.4,
        }}
      />

      <div 
        className="relative"
        style={{
          background: COLORS.bgGradient,
          borderTop: `3px solid ${COLORS.border}`,
          borderRadius: '64px 64px 0 0',
          boxShadow: `0 -30px 120px rgba(60, 120, 255, 0.12), 0 -10px 40px rgba(0, 0, 0, 0.55)`,
          backdropFilter: 'blur(26px) saturate(1.5)',
        }}
      >
        
        {/* ICE/SNOW Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {particles.map((p, i) => (
            <div 
              key={i}
              className="ice-particle"
              style={{ 
                position: 'absolute',
                top: `${p.top}%`, 
                left: `${p.left}%`,
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'rgba(200, 220, 255, 0.6)',
                boxShadow: '0 0 6px rgba(170, 198, 255, 0.8), 0 0 12px rgba(200, 220, 255, 0.4)',
                animation: `dust-drift-random-${(i % 3) + 1} ${p.dur}s infinite linear`,
                animationDelay: `${p.delay}s`,
              }} 
            />
          ))}
        </div>

        {/* Branding Section */}
        <div className="relative pt-24 pb-16 px-6 flex flex-col items-center z-20">
          <div className="flex items-center gap-12 mb-10 group cursor-default">
            {/* Shimmering Wings (Left) */}
            <div 
              className="hidden lg:block relative w-40 h-[2px] overflow-hidden"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${COLORS.accent} 50%, transparent 100%)` }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.7), transparent)',
                  animation: 'linearSweep 1.5s infinite linear',
                }}
              />
            </div>
            
            <div className="flex flex-col items-center">
              <h2 
                className="font-serif text-4xl md:text-6xl font-bold tracking-[6px] uppercase leading-none m-0"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.title} 0%, rgba(255,255,255,0.92) 50%, ${COLORS.title} 100%)`,
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(170, 198, 255, 0.3))',
                  animation: 'gold-shine 4s linear infinite',
                }}
              >
                BM Wealth
              </h2>
              <div 
                className="h-[2px] w-48 mt-2 opacity-80"
                style={{ background: `linear-gradient(90deg, transparent 0%, ${COLORS.accent} 50%, transparent 100%)` }}
              />
            </div>

            {/* Shimmering Wings (Right) */}
            <div 
              className="hidden lg:block relative w-40 h-[2px] overflow-hidden"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${COLORS.accent} 50%, transparent 100%)` }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to left, transparent, rgba(255, 255, 255, 0.7), transparent)',
                  animation: 'linearSweep 1.5s infinite linear',
                }}
              />
            </div>
          </div>

          <p 
            className="text-[13px] tracking-[5px] font-bold uppercase mb-4 m-0 text-center"
            style={{ color: COLORS.title }}
          >
            Distinguished Wealth Architecture
          </p>
          <p 
            className="text-sm font-light italic max-w-xl text-center leading-relaxed m-0 opacity-80 px-8"
            style={{ 
              color: COLORS.muted,
              borderLeft: `1px solid ${COLORS.border}`,
              borderRight: `1px solid ${COLORS.border}`,
            }}
          >
            Empowering Mumbai's elite investors with bespoke wealth strategies and unwavering integrity.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 py-24 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
            
            {/* Vault Column */}
            <div className="space-y-10">
              <h3 
                className="text-[14px] font-serif font-bold uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start"
                style={{ color: COLORS.title }}
              >
                {/* Diamond Ice Shine Gem Icon - Static glow only, no animation */}
                <Gem 
                  className="w-5 h-5" 
                  style={{ 
                    color: COLORS.diamondCore,
                    filter: `drop-shadow(0 0 3px ${COLORS.diamondGlow}) drop-shadow(0 0 6px ${COLORS.diamondGlow}) drop-shadow(0 0 10px rgba(170, 198, 255, 0.4))`,
                  }} 
                  strokeWidth={1.5} 
                />
                Vault
              </h3>
              <ul className="space-y-6 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.quick.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] transition-all duration-500 no-underline justify-center lg:justify-start font-medium laser-footer-link"
                      style={{ color: COLORS.body }}
                      onClick={(e) => handleInternalLinkClick(e, link.href, link.label)}
                      onMouseEnter={(e) => e.target.style.color = COLORS.title}
                      onMouseLeave={(e) => e.target.style.color = COLORS.body}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Intelligence Column */}
            <div className="space-y-10">
              <h3 
                className="text-[14px] font-serif font-bold uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start"
                style={{ color: COLORS.title }}
              >
                <Info className="w-5 h-5" style={{ color: COLORS.accent, filter: `drop-shadow(0 0 4px ${COLORS.accentGlow})` }} strokeWidth={1.5} />
                Intelligence
              </h3>
              <ul className="space-y-6 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] transition-all duration-500 no-underline justify-center lg:justify-start font-medium"
                      style={{ color: COLORS.body }}
                      onClick={(e) => handleInternalLinkClick(e, link.href, link.label)}
                      onMouseEnter={(e) => e.target.style.color = COLORS.title}
                      onMouseLeave={(e) => e.target.style.color = COLORS.body}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Charter Column */}
            <div className="space-y-10">
              <h3 
                className="text-[14px] font-serif font-bold uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start"
                style={{ color: COLORS.title }}
              >
                <Crown className="w-5 h-5" style={{ color: COLORS.accent, filter: `drop-shadow(0 0 4px ${COLORS.accentGlow})` }} strokeWidth={1.5} />
                Charter
              </h3>
              <ul className="space-y-6 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] md:text-[15px] transition-all duration-500 no-underline justify-center lg:justify-start font-medium"
                      style={{ color: COLORS.body }}
                      onMouseEnter={(e) => e.target.style.color = COLORS.title}
                      onMouseLeave={(e) => e.target.style.color = COLORS.body}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concierge Column */}
            <div className="space-y-10">
              <h3 
                className="text-[14px] font-serif font-bold uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start"
                style={{ color: COLORS.title }}
              >
                <MessageCircle className="w-5 h-5" style={{ color: COLORS.accent, filter: `drop-shadow(0 0 4px ${COLORS.accentGlow})` }} strokeWidth={1.5} />
                Concierge
              </h3>
              <div className="space-y-8 text-[15px] text-center lg:text-left font-semibold" style={{ color: COLORS.body }}>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[2px] m-0" style={{ color: COLORS.muted }}>Phone</p>
                  <p 
                    className="m-0 cursor-pointer text-base md:text-lg tracking-wider transition-colors duration-300"
                    style={{ color: COLORS.body }}
                    onMouseEnter={(e) => e.target.style.color = COLORS.title}
                    onMouseLeave={(e) => e.target.style.color = COLORS.body}
                  >
                    +91 8850977259
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[2px] m-0" style={{ color: COLORS.muted }}>Email</p>
                  <p 
                    className="m-0 cursor-pointer tracking-wide break-all transition-colors duration-300"
                    style={{ color: COLORS.body }}
                    onMouseEnter={(e) => e.target.style.color = COLORS.title}
                    onMouseLeave={(e) => e.target.style.color = COLORS.body}
                  >
                    support@bmwealth.co.in
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[2px] m-0" style={{ color: COLORS.muted }}>Location</p>
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="m-0 flex items-center gap-2 transition-all duration-300 no-underline italic font-bold group justify-center lg:justify-start"
                    style={{ color: COLORS.body }}
                    onMouseEnter={(e) => e.target.style.color = COLORS.title}
                    onMouseLeave={(e) => e.target.style.color = COLORS.body}
                  >
                    <MapPin className="w-4 h-4 transition-transform group-hover:scale-125" />
                    Mumbai, Maharashtra
                  </a>
                </div>
              </div>

              {/* WhatsApp Card */}
              <a
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsWHAHovered(true)}
                onMouseLeave={() => { setIsWHAHovered(false); setIsWHAActive(false); }}
                onMouseDown={() => setIsWHAActive(true)}
                onMouseUp={() => setIsWHAActive(false)}
                onTouchStart={() => setIsWHAActive(true)}
                onTouchEnd={() => setIsWHAActive(false)}
                ref={whatsAppCardRef}
                className={cn(
                  "whatsapp-card relative flex items-center rounded-xl no-underline overflow-hidden w-full max-w-[280px] md:max-w-[320px] bg-black h-[60px] border-[2.5px] transition-all duration-500 mx-auto lg:mx-0 px-4 md:px-5",
                  (isWHAScrollBoost || (isMobile && isWHAActive)) && "is-scroll-boost"
                )}
                style={{ 
                  borderColor: isWHAPremium ? '#25D366' : COLORS.accent,
                  transform: isWHAPremium ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isWHAPremium ? '0 0 60px rgba(37, 211, 102, 0.6)' : `0 0 30px ${COLORS.accentGlow}`,
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                {/* Dynamic Expansion */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
                  style={{ 
                    background: isWHAActive 
                      ? 'radial-gradient(circle at center, rgba(37, 211, 102, 0.45) 0%, transparent 75%)' 
                      : (isWHAPremium ? 'radial-gradient(circle at center, rgba(100, 140, 200, 0.35) 0%, transparent 75%)' : 'transparent'),
                    transform: isWHAPremium ? 'scale(2.5)' : 'scale(0)',
                    opacity: isWHAPremium ? 1 : 0,
                    zIndex: 1
                  }} 
                />
                
                {/* Shimmer */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 z-10",
                  isWHAPremium ? "translate-x-[100%]" : "-translate-x-[100%]"
                )} />
                
                {/* Content Container */}
                <div className="relative z-20 flex items-center gap-4">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-1000 bg-gradient-to-br from-[#111111] to-[#000000]"
                    style={{ 
                      borderColor: isWHAPremium ? '#25D366' : COLORS.border,
                      transform: isWHAPremium ? 'rotate(360deg)' : 'rotate(0deg)'
                    }}
                  >
                    <MessageCircle 
                      size={20} 
                      className="text-[#25D366]" 
                      style={{ strokeWidth: 2.5 }}
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center text-left">
                    <p 
                      className="m-0 font-black uppercase tracking-[1.5px] transition-colors duration-500"
                      style={{ 
                        fontSize: isDesktop ? '16px' : '15px',
                        color: isWHAPremium ? '#25D366' : '#FFFFFF'
                      }}
                    >
                      WhatsApp Us
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse shadow-[0_0_10px_#25D366]" />
                      <p className={cn(
                        "text-[9px] md:text-[10px] m-0 uppercase tracking-[3px] md:tracking-[4px] font-black transition-colors duration-500"
                      )}
                      style={{ color: isWHAPremium ? '#fff' : COLORS.accentStrong }}
                      >
                        Concierge
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div 
          className="max-w-[1400px] mx-auto px-10 md:px-16 py-12 relative z-20"
          style={{ borderTop: `1px solid ${COLORS.border}` }}
        >
          
          {/* Newsletter Signup - ICY VERSION */}
          <div className="mb-16">
            <LaserNewsletterSignup />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Market Risk Disclosure - with glowing side line */}
            <div 
              ref={sebiRef} 
              className={cn("laser-disclaimer group relative", sebiActive && "is-scroll-active")} 
              onTouchStart={() => { if (!isMobile) return; setSebiActive(true); setTimeout(() => setSebiActive(false), 2500); }}
              style={{
                paddingLeft: '24px',
              }}
            >
              {/* Glowing side line */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-500"
                style={{
                  background: sebiActive 
                    ? `linear-gradient(180deg, transparent 0%, ${COLORS.accentStrong} 20%, ${COLORS.accentStrong} 80%, transparent 100%)`
                    : `linear-gradient(180deg, transparent 0%, ${COLORS.border} 20%, ${COLORS.border} 80%, transparent 100%)`,
                  boxShadow: sebiActive ? `0 0 12px ${COLORS.accentGlow}, 0 0 20px ${COLORS.accentGlow}` : 'none',
                }}
              />
              <div className="space-y-3 text-left">
                <h4 
                  className="text-[11px] font-bold uppercase tracking-[0.3em] m-0 transition-colors duration-500"
                  style={{ color: sebiActive ? COLORS.title : COLORS.body }}
                >
                  Market Risk Disclosure
                </h4>
                <p 
                  className="text-[13px] leading-relaxed font-light m-0 transition-colors duration-500"
                  style={{ color: sebiActive ? COLORS.body : COLORS.muted }}
                >
                  Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. 
                </p>
              </div>
            </div>

            {/* Investment Notice - with glowing side line */}
            <div 
              ref={noticeRef} 
              className={cn("laser-disclaimer group relative", noticeActive && "is-scroll-active")} 
              onTouchStart={() => { if (!isMobile) return; setNoticeActive(true); setTimeout(() => setNoticeActive(false), 2500); }}
              style={{
                paddingLeft: '24px',
              }}
            >
              {/* Glowing side line */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-500"
                style={{
                  background: noticeActive 
                    ? `linear-gradient(180deg, transparent 0%, ${COLORS.accentStrong} 20%, ${COLORS.accentStrong} 80%, transparent 100%)`
                    : `linear-gradient(180deg, transparent 0%, ${COLORS.border} 20%, ${COLORS.border} 80%, transparent 100%)`,
                  boxShadow: noticeActive ? `0 0 12px ${COLORS.accentGlow}, 0 0 20px ${COLORS.accentGlow}` : 'none',
                }}
              />
              <div className="space-y-3 text-left">
                <h4 
                  className="text-[11px] font-bold uppercase tracking-[0.3em] m-0 transition-colors duration-500"
                  style={{ color: noticeActive ? COLORS.title : COLORS.body }}
                >
                  Investment Notice
                </h4>
                <p 
                  className="text-[13px] leading-relaxed font-light m-0 transition-colors duration-500"
                  style={{ color: noticeActive ? COLORS.body : COLORS.muted }}
                >
                  Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully. BM Wealth acts as a distributor, not a manufacturer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Compliance */}
        <div 
          className="relative pt-12 pb-20 px-8 flex flex-col items-center z-20"
          style={{ borderTop: `1px solid ${COLORS.border}` }}
        >
          <div className="relative z-10 flex flex-col items-center space-y-10">
            <div className="inline-flex items-center justify-center">
              <div 
                className="group inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border px-4 py-3 backdrop-blur-2xl"
                style={{
                  borderColor: 'rgba(255,255,255,0.10)',
                  background: 'rgba(0,0,0,0.40)',
                  boxShadow: '0 0 30px rgba(0,0,0,0.55)',
                }}
              >
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.70)' }}>
                  Regulatory IDs
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.24em] uppercase" style={{ color: COLORS.accentStrong }}>
                  PMS 2430447816
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.24em] uppercase" style={{ color: COLORS.accentStrong }}>
                  IRDAI 277925
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.24em] uppercase" style={{ color: COLORS.accentStrong }}>
                  AMFI ARN 90008
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.70)' }}>
                  Wealth Distribution
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <p className="text-[12px] font-light tracking-[0.4em] uppercase m-0 opacity-60" style={{ color: COLORS.muted }}>
                © 2025 BM Wealth. All rights reserved.
              </p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase m-0 opacity-60" style={{ color: COLORS.body }}>
                Crafted for Mumbai's Distinguished Investors
              </p>
              
              <p className="text-[11px] italic font-light mt-4 text-center max-w-2xl opacity-80" style={{ color: COLORS.muted }}>
                Investment products are subject to market dynamics. Carefully review all documentation before commitment.
              </p>

              <p className="text-[10px] font-light italic mt-3 text-center max-w-3xl opacity-60" style={{ color: COLORS.muted }}>
                Market data displayed is indicative and may be delayed. This information is provided for general awareness only and does not constitute investment advice.
              </p>

              <p className="text-[10px] font-light italic mt-3 text-center max-w-3xl opacity-60" style={{ color: COLORS.muted }}>
                This is an educational calculator. Not investment advice. Mutual funds are subject to market risks. PMS 2430447816 | ARN 90008 | Consult your advisor before investing.
              </p>

              {/* Legal Micro-Text - Premium subtle compliance */}
              <div className="flex flex-col items-center mt-6 space-y-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
                <p className="text-[8px] tracking-[0.5px] m-0" style={{ color: COLORS.muted }}>
                  PMS 2430447816 | AMFI ARN-90008 | IRDAI-277925 | Distribution remuneration as per industry standards
                </p>
                <p className="text-[7px] tracking-[0.3px] m-0 max-w-md text-center" style={{ color: 'rgba(180, 200, 230, 0.35)' }}>
                  Educational content only · Not SEBI registered advisory · Past performance ≠ future results
                </p>
                <div className="flex gap-4">
                  <Link 
                    href="/legal-disclosures" 
                    className="text-[8px] no-underline transition-colors"
                    style={{ color: COLORS.muted }}
                    onMouseEnter={(e) => e.target.style.color = COLORS.accentStrong}
                    onMouseLeave={(e) => e.target.style.color = COLORS.muted}
                  >
                    Legal Disclosures
                  </Link>
                  <span className="text-[8px]" style={{ color: COLORS.muted }}>|</span>
                  <Link 
                    href="/regulatory-compliance" 
                    className="text-[8px] no-underline transition-colors"
                    style={{ color: COLORS.muted }}
                    onMouseEnter={(e) => e.target.style.color = COLORS.accentStrong}
                    onMouseLeave={(e) => e.target.style.color = COLORS.muted}
                  >
                    Regulatory Compliance
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes gold-shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes linearSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </footer>
  )
}

export default LaserFooter

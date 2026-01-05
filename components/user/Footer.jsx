/**
 * FILE: components\user\Footer.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - lucide-react
 * - react
 * - @/hooks/useIsMobile
 * - @/lib/utils
 * - next/link
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

﻿"use client"

import { MessageCircle, ArrowRight, ExternalLink, ShieldCheck, Gem, Crown, Info, MapPin } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useIsMobile } from "@/hooks/useIsMobile"
import { cn } from "@/lib/utils"
import Link from "next/link"
import NewsletterSignup from "@/components/shared/NewsletterSignup"

const Footer = () => {
  const [hoveredLink, setHoveredLink] = useState(null)
  const [mounted, setMounted] = useState(false)
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
    setMounted(true)
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

    // Always observe ONLY the footer Concierge WhatsApp card (desktop + mobile)
    const obs1 = makeObserver(whatsAppCardRef.current, () => {
      if (debug) console.log("WhatsApp card visible")
      pulse(setIsWHAScrollBoost, 2500)
    }, { threshold: 0.15, rootMargin: "0px 0px -20% 0px" })

    // Mobile fallback: IntersectionObserver can be flaky in some webviews — add a lightweight scroll eye-line trigger.
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
        // Wider band to be reliable across mobile browsers/webviews
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

    // Absolute fallback: some mobile browsers/webviews won't reliably fire scroll events.
    // Poll briefly while the user is on the page; pulse when the card is visible.
    intervalId = window.setInterval(() => {
      if (cooldown) return
      if (!inEyeLine()) return
      cooldown = true
      pulse(setIsWHAScrollBoost, 3500)
      const t = setTimeout(() => { cooldown = false }, 4200)
      timeouts.push(t)
    }, 700)

    // Keep disclaimers mobile-only
    const obs2 = isMobile ? makeObserver(sebiRef.current, () => {
      if (debug) console.log("Disclaimer visible on mobile: SEBI")
      pulse(setSebiActive, 2500)
    }, { threshold: 0.15, rootMargin: "0px 0px -20% 0px" }) : null

    const obs3 = isMobile ? makeObserver(noticeRef.current, () => {
      if (debug) console.log("Disclaimer visible on mobile: Notice")
      pulse(setNoticeActive, 2500)
    }, { threshold: 0.15, rootMargin: "0px 0px -20% 0px" }) : null

    if (debug) console.log("Observing footer elements")

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

  if (!mounted) return null;

  const isWHAPremium = isWHAScrollBoost || (isMobile && isWHAActive) || isWHAHovered

return (
    <footer className="relative w-full mt-20 font-inter overflow-hidden bg-black">
      {/* ULTRA LUXURY WAVE TOP */}
      <div className="absolute top-0 left-0 w-full h-[6px] luxury-wave-3s z-30 opacity-90" />

      <div className={cn(
        "ultra-luxury-glass luxury-particles ambient-glow-pulse luxury-wave-3s", 
        "bg-[#000000] rounded-t-[64px] border-t-[3px] border-[#C0A062]/70",
        "shadow-[0_-30px_120px_rgba(192,160,98,0.25)]"
      )}>
        
        {/* ENHANCED: Truly Randomized Floating Dust Particles Across Whole Footer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(isMobile ? 14 : 25)].map((_, i) => (
            <div 
              key={i}
              className="gold-particle" 
              style={{ 
                top: `${Math.random() * 95}%`, 
                left: `${Math.random() * 95}%`, 
                animation: `dust-drift-random-${(i % 3) + 1} ${7 + Math.random() * 12}s infinite linear`,
                animationDelay: `${Math.random() * 15}s`
              }} 
            />
          ))}
        </div>

        {/* Branding Masterpiece Section */}
        <div className="relative pt-24 pb-16 px-6 flex flex-col items-center z-20">
          <div className="flex items-center gap-12 mb-10 group cursor-default">
            {/* Turbo Shimmering Wings (Left) */}
            <div className="hidden lg:block relative w-40 h-[2px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-linearSweep duration-[1.2s]" />
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="gold-gradient-text font-serif text-4xl md:text-6xl font-bold tracking-[6px] uppercase leading-none m-0 filter drop-shadow-[0_0_20px_rgba(192,160,98,0.3)]">
                BM Wealth
              </h2>
              <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#C0A062] to-transparent mt-2 opacity-80" />
            </div>

            {/* Turbo Shimmering Wings (Right) */}
            <div className="hidden lg:block relative w-40 h-[2px] bg-gradient-to-l from-transparent via-[#C0A062] to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent animate-linearSweep duration-[1.2s]" />
            </div>
          </div>

          <p className="text-[13px] tracking-[5px] text-[#D4B576] font-bold uppercase mb-4 m-0 text-center">
            Distinguished Wealth Architecture
          </p>
          <p className="text-sm text-gray-400 font-light italic max-w-xl text-center leading-relaxed m-0 opacity-80 border-x border-[#C0A062]/20 px-8">
            Empowering Mumbai's elite investors with bespoke wealth strategies and unwavering integrity.
          </p>
        </div>

        {/* Navigation Grid - Optimized for Desktop & Mobile */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 py-24 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
            
            {/* Vault Column */}
            <div className="space-y-10">
              <h3 className="text-[14px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start">
                <Gem className="w-5 h-5 text-[#C0A062]" strokeWidth={1.5} />
                Vault
              </h3>
              <ul className="space-y-6 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.quick.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-gray-400 transition-all duration-500 no-underline justify-center lg:justify-start font-medium premium-side-line"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Intelligence Column */}
            <div className="space-y-10">
              <h3 className="text-[14px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start">
                <Info className="w-5 h-5 text-[#C0A062]" strokeWidth={1.5} />
                Intelligence
              </h3>
              <ul className="space-y-6 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-gray-400 transition-all duration-500 no-underline justify-center lg:justify-start font-medium premium-side-line"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Charter Column */}
            <div className="space-y-10">
              <h3 className="text-[14px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start">
                <Crown className="w-5 h-5 text-[#C0A062]" strokeWidth={1.5} />
                Charter
              </h3>
              <ul className="space-y-6 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] md:text-[15px] text-gray-400 transition-all duration-500 no-underline justify-center lg:justify-start font-medium premium-side-line"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concierge Column - COMPLETE WITH LABELS & SPACE */}
            <div className="space-y-10">
              <h3 className="text-[14px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.5em] flex items-center gap-4 m-0 justify-center lg:justify-start">
                <MessageCircle className="w-5 h-5 text-[#C0A062]" strokeWidth={1.5} />
                Concierge
              </h3>
              <div className="space-y-8 text-[15px] text-gray-300 text-center lg:text-left font-semibold">
                <div className="space-y-2">
                  <p className="text-[10px] text-[#C0A062] uppercase tracking-[2px] m-0">Phone</p>
                  <p className="m-0 transition-all hover:text-[#C0A062] cursor-pointer text-base md:text-lg tracking-wider">+91 8850977259</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-[#C0A062] uppercase tracking-[2px] m-0">Email</p>
                  <p className="m-0 transition-all hover:text-[#C0A062] cursor-pointer tracking-wide break-all">support@bmwealth.co.in</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-[#C0A062] uppercase tracking-[2px] m-0">Location</p>
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="m-0 flex items-center gap-2 text-[#C0A062] hover:text-white transition-all duration-300 no-underline italic font-bold group justify-center lg:justify-start"
                  >
                    <MapPin className="w-4 h-4 transition-transform group-hover:scale-125" />
                    Mumbai, Maharashtra
                  </a>
                </div>
              </div>

              {/* RECTANGLE WHATSAPP CARD - LEFT ALIGNED FOR BOTH MOBILE & DESKTOP */}
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
                ref={whatsAppCardRef}                className={cn(
                  "whatsapp-card relative flex items-center rounded-xl no-underline overflow-hidden w-full max-w-[280px] md:max-w-[320px] bg-black h-[60px] border-[2.5px] transition-all duration-500 mx-auto lg:mx-0 px-4 md:px-5",
                  (isWHAScrollBoost || (isMobile && isWHAActive)) && "is-scroll-boost"
                )}
                style={{ 
                  borderColor: isWHAPremium ? '#25D366' : '#C0A062',
                  transform: isWHAPremium ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isWHAPremium ? '0 0 60px rgba(37, 211, 102, 0.6)' : '0 0 30px rgba(192, 160, 98, 0.2)',
                  display: 'flex',
                  justifyContent: 'flex-start', // Always start from left
                }}
              >
                {/* Dynamic Expansion - Brown to Green from Inside */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
                  style={{ 
                    background: isWHAActive 
                      ? 'radial-gradient(circle at center, rgba(37, 211, 102, 0.45) 0%, transparent 75%)' 
                      : (isWHAPremium ? 'radial-gradient(circle at center, rgba(139, 111, 71, 0.35) 0%, transparent 75%)' : 'transparent'),
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
                  {/* Inner Emoji Container */}
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-1000 bg-gradient-to-br from-[#111111] to-[#000000]"
                    style={{ 
                      borderColor: isWHAPremium ? '#25D366' : 'rgba(192, 160, 98, 0.3)',
                      transform: isWHAPremium ? 'rotate(360deg)' : 'rotate(0deg)'
                    }}
                  >
                    <MessageCircle 
                      size={20} 
                      className="text-[#25D366]" 
                      style={{ strokeWidth: 2.5 }}
                    />
                  </div>
                  
                  {/* WhatsApp Us Text */}
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
                        "text-[9px] md:text-[10px] m-0 uppercase tracking-[3px] md:tracking-[4px] font-black transition-colors duration-500",
                        isWHAPremium ? "text-white" : "text-[#C0A062]"
                      )}>
                        Concierge
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* INTERACTIVE HALF-TO-FULL SIDE LINE DISCLAIMERS */}
        <div className="max-w-[1400px] mx-auto px-10 md:px-16 py-12 border-t border-[#C0A062]/15 relative z-20">
          
          {/* Newsletter Signup */}
          <div className="mb-16">
            <NewsletterSignup />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div ref={sebiRef} className={cn("premium-half-line group", sebiActive && "is-scroll-active")} onTouchStart={() => { if (!isMobile) return; setSebiActive(true); setTimeout(() => setSebiActive(false), 2500); }}>
              <div className="side-line" />
              <div className="space-y-3 text-left">
                <h4 className="text-[11px] font-bold text-[#C0A062] uppercase tracking-[0.3em] m-0 transition-colors group-hover:text-white">SEBI Disclosure</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light m-0 transition-colors group-hover:text-gray-300">
                  Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. 
                </p>
              </div>
            </div>

            <div ref={noticeRef} className={cn("premium-half-line group", noticeActive && "is-scroll-active")} onTouchStart={() => { if (!isMobile) return; setNoticeActive(true); setTimeout(() => setNoticeActive(false), 2500); }}>
              <div className="side-line" />
              <div className="space-y-3 text-left">
                <h4 className="text-[11px] font-bold text-[#C0A062] uppercase tracking-[0.3em] m-0 transition-colors group-hover:text-white">Investment Notice</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light m-0 transition-colors group-hover:text-gray-300">
                  Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully. BM Wealth acts as a distributor, not a manufacturer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Copyright & Active Compliance Badge */}
        <div className="relative pt-12 pb-20 px-8 flex flex-col items-center border-t border-[#C0A062]/10 z-20">
          <div className="relative z-10 flex flex-col items-center space-y-10">
            <div className="inline-flex items-center justify-center">
              <div className="relative overflow-hidden border-[1.5px] border-[#C0A062]/40 rounded-full px-12 py-4 bg-black/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(192,160,98,0.15)] transition-all duration-700 hover:border-[#C0A062] hover:bg-[#C0A062]/10 group cursor-default">
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:animate-[linearSweep_3s_infinite_linear] pointer-events-none z-10" />
                
                <p className="relative z-20 text-[14px] font-serif text-[#C0A062] font-bold tracking-[4px] uppercase m-0 flex items-center gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" />
                  IRDAI Licensed | AMFI Registered Wealth Distribution
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" />
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <p className="text-[12px] text-gray-400 font-light tracking-[0.4em] uppercase m-0 opacity-60">
                © 2025 BM Wealth. All rights reserved.
              </p>
              <p className="text-[10px] text-[#C0A062] font-bold tracking-[0.2em] uppercase m-0 opacity-60">
                Crafted for Mumbai's Distinguished Investors
              </p>
              
              {/* SOPHISTICATED MARKET DYNAMICS NOTICE */}
              <p className="text-[11px] text-gray-500 italic font-light mt-4 text-center max-w-2xl opacity-80">
                Investment products are subject to market dynamics. Carefully review all documentation before commitment.
              </p>

              <p className="text-[10px] text-[#666] font-light italic mt-3 text-center max-w-3xl opacity-60">Market data displayed is indicative and may be delayed. This information is provided for general awareness only and does not constitute investment advice.</p>

              <p className="text-[10px] text-[#666] font-light italic mt-3 text-center max-w-3xl opacity-60">
                This is an educational calculator. Not investment advice. Mutual funds are subject to market risks. ARN 90008 | Consult your advisor before investing.
              </p>

              {/* LEGAL MICRO-TEXT FOR AUDITORS */}
              <div className="flex flex-col items-center mt-6 space-y-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
                <p className="text-[8px] text-[#666] tracking-[0.5px] m-0">
                  AMFI ARN-90008 | IRDAI-277925 | Distribution remuneration as per industry standards
                </p>
                <div className="flex gap-4">
                  <Link href="/legal-disclosures" className="text-[8px] text-[#666] hover:text-[#C0A062] no-underline">
                    Legal Disclosures
                  </Link>
                  <span className="text-[8px] text-[#666]">|</span>
                  <Link href="/regulatory-compliance" className="text-[8px] text-[#666] hover:text-[#C0A062] no-underline">
                    Regulatory Compliance
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer




















"use client"

import { MessageCircle, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const Footer = () => {
  const [hoveredLink, setHoveredLink] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null;

  return (
    <footer className="relative w-full mt-20 font-inter overflow-hidden">
      {/* 
          ULTRA LUXURY WAVE TOP - Continuous 3s flow
      */}
      <div className="absolute top-0 left-0 w-full h-[4px] luxury-wave-3s z-20" />

      <div className={cn(
        "ultra-luxury-glass luxury-particles ambient-glow-pulse luxury-wave-3s", 
        "bg-[#000000] rounded-t-[64px] border-t-[3px] border-[#C0A062]/70",
        "shadow-[0_-30px_100px_rgba(192,160,98,0.2)]"
      )}>
        
        {/* Floating Gold Dust - Intensified for whole footer area */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gold-particle top-[10%] left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="gold-particle top-[30%] right-[15%]" style={{ animationDelay: '1.5s' }} />
          <div className="gold-particle top-[50%] left-[25%]" style={{ animationDelay: '3s' }} />
          <div className="gold-particle top-[70%] right-[20%]" style={{ animationDelay: '4.5s' }} />
          <div className="gold-particle bottom-[10%] left-[40%]" style={{ animationDelay: '6s' }} />
          <div className="gold-particle bottom-[30%] right-[30%]" style={{ animationDelay: '7.5s' }} />
          <div className="gold-particle top-[20%] left-[60%]" style={{ animationDelay: '9s' }} />
          <div className="gold-particle bottom-[50%] right-[10%]" style={{ animationDelay: '10.5s' }} />
        </div>

        {/* Branding Masterpiece Section */}
        <div className="relative pt-20 pb-12 px-6 flex flex-col items-center">
          <div className="flex items-center gap-8 mb-8 group cursor-default">
            {/* Turbo Shimmering Wings (Left) */}
            <div className="hidden lg:block relative w-32 h-[2px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-linearSweep duration-[1.5s]" />
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="gold-gradient-text font-serif text-5xl md:text-6xl font-bold tracking-[6px] uppercase leading-none m-0 filter drop-shadow-[0_0_20px_rgba(192,160,98,0.3)]">
                BM Wealth
              </h2>
              <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#C0A062] to-transparent mt-2 opacity-80" />
            </div>

            {/* Turbo Shimmering Wings (Right) */}
            <div className="hidden lg:block relative w-32 h-[2px] bg-gradient-to-l from-transparent via-[#C0A062] to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent animate-linearSweep duration-[1.5s]" />
            </div>
          </div>

          <p className="text-[13px] tracking-[5px] text-[#D4B576] font-bold uppercase mb-4 m-0 text-center drop-shadow-[0_0_10px_rgba(212,181,118,0.4)]">
            Distinguished Financial Architecture
          </p>
          <p className="text-sm text-gray-400 font-light italic max-w-xl text-center leading-relaxed m-0 opacity-80 border-x border-[#C0A062]/20 px-8">
            Empowering Mumbai's elite investors with bespoke wealth strategies and unwavering integrity.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="max-w-[1400px] mx-auto px-10 md:px-16 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            
            {/* Quick Links Column */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                Vault
              </h3>
              <ul className="space-y-4 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.quick.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onMouseEnter={() => setHoveredLink(link.label)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className={cn(
                        "text-[15px] text-gray-400 transition-all duration-500 flex items-center gap-0 hover:gap-4 group no-underline justify-center lg:justify-start font-medium",
                        "hover:text-[#D4B576] hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.5)]",
                        hoveredLink === link.label && "text-[#D4B576]"
                      )}
                    >
                      <ArrowRight className={cn(
                        "w-4 h-4 transition-all duration-500 opacity-0 -translate-x-4 hidden lg:block",
                        "group-hover:opacity-100 group-hover:translate-x-0 text-[#C0A062]"
                      )} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                Intelligence
              </h3>
              <ul className="space-y-4 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onMouseEnter={() => setHoveredLink(link.label)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className={cn(
                        "text-[15px] text-gray-400 transition-all duration-500 flex items-center gap-0 hover:gap-4 group no-underline justify-center lg:justify-start font-medium",
                        "hover:text-[#D4B576] hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.5)]",
                        hoveredLink === link.label && "text-[#D4B576]"
                      )}
                    >
                      <ArrowRight className={cn(
                        "w-4 h-4 transition-all duration-500 opacity-0 -translate-x-4 hidden lg:block",
                        "group-hover:opacity-100 group-hover:translate-x-0 text-[#C0A062]"
                      )} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                Charter
              </h3>
              <ul className="space-y-4 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onMouseEnter={() => setHoveredLink(link.label)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className={cn(
                        "text-[15px] text-gray-400 transition-all duration-500 flex items-center gap-0 hover:gap-4 group no-underline justify-center lg:justify-start font-medium",
                        "hover:text-[#D4B576] hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.5)]",
                        hoveredLink === link.label && "text-[#D4B576]"
                      )}
                    >
                      <ArrowRight className={cn(
                        "w-4 h-4 transition-all duration-500 opacity-0 -translate-x-4 hidden lg:block",
                        "group-hover:opacity-100 group-hover:translate-x-0 text-[#C0A062]"
                      )} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & COMPACT WhatsApp Concierge */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                  Concierge
                </h3>
                <div className="space-y-3 text-[14px] text-gray-400 text-center lg:text-left font-medium">
                  <p className="m-0 text-gray-300 transition-colors hover:text-[#C0A062]">+91 8850977259</p>
                  <p className="m-0 text-gray-300 transition-colors hover:text-[#C0A062]">support@bmwealth.co.in</p>
                  <p className="m-0 text-gray-300">Mumbai, Maharashtra</p>
                </div>
              </div>

              {/* WHATSAPP CTA - COMPACT "LEVEL UP" EDITION (EVEN SMALLER) */}
              <a
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "relative group flex items-center gap-3 p-3 rounded-[16px] no-underline overflow-hidden w-fit mx-auto lg:mx-0", // Smaller padding, rounded, w-fit
                  "bg-black border-[1.5px] border-[#C0A062]/40",
                  "transition-all duration-700 hover:scale-[1.03] hover:border-[#C0A062]",
                  "hover:shadow-[0_15px_30px_rgba(192,160,98,0.2)]"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C0A062]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#25D366] blur-xl opacity-20 group-hover:opacity-40 animate-pulse" />
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111111] to-[#000000] flex items-center justify-center border border-[#C0A062]/20 group-hover:border-[#25D366]/50 transition-all duration-700">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </div>
                </div>
                
                <div className="text-left relative z-10">
                  <p className="text-[12px] font-bold text-white m-0 uppercase tracking-[1px] group-hover:text-[#D4B576] transition-colors">WhatsApp Us</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#25D366] animate-pulse shadow-[0_0_8px_#25D366]" />
                    <p className="text-[8px] text-[#C0A062]/80 m-0 uppercase tracking-[2px] font-bold group-hover:text-white transition-colors">Concierge</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Royal Disclaimer Section - RESTORED SIDE LINES */}
        <div className="max-w-[1400px] mx-auto px-10 md:px-16 py-12 border-t border-[#C0A062]/15">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* SEBI Disclosure */}
            <div className="flex gap-6 group">
              <div className="w-[2px] h-auto bg-[#C0A062] opacity-60 flex-shrink-0 group-hover:opacity-100 transition-opacity" />
              <div className="space-y-3 text-left">
                <h4 className="text-[11px] font-bold text-[#C0A062] uppercase tracking-[0.3em] m-0">SEBI Disclosure</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light m-0">
                  Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. 
                </p>
              </div>
            </div>

            {/* Investment Notice */}
            <div className="flex gap-6 group">
              <div className="w-[2px] h-auto bg-[#C0A062] opacity-60 flex-shrink-0 group-hover:opacity-100 transition-opacity" />
              <div className="space-y-3 text-left">
                <h4 className="text-[11px] font-bold text-[#C0A062] uppercase tracking-[0.3em] m-0">Investment Notice</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light m-0">
                  Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully. BM Wealth acts as a distributor, not a manufacturer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Copyright & Active Compliance Badge */}
        <div className="relative pt-12 pb-20 px-8 flex flex-col items-center border-t border-[#C0A062]/10">
          <div className="relative z-10 flex flex-col items-center space-y-10">
            {/* Luxury Compliance Badge - WAVE ON HOVER (3s) */}
            <div className="inline-flex items-center justify-center">
              <div className="relative overflow-hidden border-[1.5px] border-[#C0A062]/40 rounded-full px-12 py-4 bg-black/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(192,160,98,0.15)] transition-all duration-700 hover:border-[#C0A062] hover:bg-[#C0A062]/10 group cursor-default">
                {/* 3s Wave Effect Inside Badge - Active on Hover */}
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-[#C0A062]/20 to-transparent translate-x-[-100%] group-hover:animate-[linearSweep_3s_infinite_linear] pointer-events-none" />
                
                <p className="relative z-10 text-[14px] font-serif text-[#C0A062] font-bold tracking-[4px] uppercase m-0 flex items-center gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" />
                  IRDAI Licensed | AMFI Registered
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" />
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3 opacity-60">
              <p className="text-[12px] text-gray-400 font-light tracking-[0.4em] uppercase m-0">
                © 2025 BM Wealth. All rights reserved.
              </p>
              <p className="text-[10px] text-[#C0A062] font-bold tracking-[0.2em] uppercase m-0">
                Crafted for Mumbai's Distinguished Investors
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

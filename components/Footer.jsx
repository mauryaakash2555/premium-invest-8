"use client"

import { MessageCircle, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const Footer = () => {
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

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=66,+Vinod+Villa+Bldg.,+1st+floor+office+no.+108,+Cavel+Cross+Lane+3,+Kalbadevi,+Mumbai+-+400002,+Maharashtra,+India"

  if (!mounted) return null;

  return (
    <footer className="relative w-full mt-20 font-inter overflow-hidden">
      {/* ULTRA LUXURY WAVE TOP */}
      <div className="absolute top-0 left-0 w-full h-[6px] luxury-wave-3s z-30 opacity-90" />

      <div className={cn(
        "ultra-luxury-glass luxury-particles ambient-glow-pulse luxury-wave-3s", 
        "bg-[#000000] rounded-t-[64px] border-t-[3px] border-[#C0A062]/70",
        "shadow-[0_-30px_120px_rgba(192,160,98,0.25)]"
      )}>
        
        {/* Randomized Popping Dust Particles - POPPING FROM ANYWHERE */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="gold-particle" 
              style={{ 
                top: `${Math.random() * 90}%`, 
                left: `${Math.random() * 90}%`, 
                animation: `dust-drift-random-${(i % 3) + 1} ${8 + Math.random() * 10}s infinite linear`,
                animationDelay: `${Math.random() * 10}s`
              }} 
            />
          ))}
        </div>

        {/* Branding Masterpiece Section */}
        <div className="relative pt-24 pb-16 px-6 flex flex-col items-center z-20">
          <div className="flex items-center gap-12 mb-10 group cursor-default">
            <div className="hidden lg:block relative w-40 h-[2px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-linearSweep duration-[1.2s]" />
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="gold-gradient-text font-serif text-5xl md:text-6xl font-bold tracking-[6px] uppercase leading-none m-0 filter drop-shadow-[0_0_20px_rgba(192,160,98,0.3)]">
                BM Wealth
              </h2>
              <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#C0A062] to-transparent mt-2 opacity-80" />
            </div>

            <div className="hidden lg:block relative w-40 h-[2px] bg-gradient-to-l from-transparent via-[#C0A062] to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent animate-linearSweep duration-[1.2s]" />
            </div>
          </div>

          <p className="text-[13px] tracking-[5px] text-[#D4B576] font-bold uppercase mb-4 m-0 text-center">
            Distinguished Financial Architecture
          </p>
          <p className="text-sm text-gray-400 font-light italic max-w-xl text-center leading-relaxed m-0 opacity-80 border-x border-[#C0A062]/20 px-8">
            Empowering Mumbai's elite investors with bespoke wealth strategies and unwavering integrity.
          </p>
        </div>

        {/* Navigation Grid - REVERTED TO 15px, KEPT GAPINGS */}
        <div className="max-w-[1400px] mx-auto px-10 md:px-16 py-16 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            
            <div className="space-y-8">
              <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                Vault
              </h3>
              <ul className="space-y-4 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.quick.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-gray-400 transition-all duration-500 hover:text-[#D4B576] no-underline justify-center lg:justify-start font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                Intelligence
              </h3>
              <ul className="space-y-4 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-gray-400 transition-all duration-500 hover:text-[#D4B576] no-underline justify-center lg:justify-start font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                Charter
              </h3>
              <ul className="space-y-4 list-none p-0 m-0 text-center lg:text-left">
                {navigationLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-gray-400 transition-all duration-500 hover:text-[#D4B576] no-underline justify-center lg:justify-start font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & WhatsApp Concierge */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h3 className="text-[11px] font-serif font-bold text-[#C0A062] uppercase tracking-[0.3em] flex items-center gap-3 m-0 justify-center lg:justify-start">
                  Concierge
                </h3>
                <div className="space-y-4 text-[15px] text-gray-300 text-center lg:text-left font-medium">
                  <p className="m-0 transition-colors hover:text-[#C0A062] cursor-pointer">+91 8850977259</p>
                  <p className="m-0 transition-colors hover:text-[#C0A062] cursor-pointer">support@bmwealth.co.in</p>
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="m-0 block text-[#C0A062] hover:text-white transition-all duration-300 no-underline italic underline underline-offset-4"
                  >
                    Mumbai, Maharashtra
                  </a>
                </div>
              </div>

              {/* WHATSAPP MASTERPIECE - KEPT FROM LAST STEP */}
              <a
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "relative group flex items-center gap-5 p-5 rounded-[24px] no-underline overflow-hidden w-fit mx-auto lg:mx-0",
                  "bg-black border-[2.5px] border-[#C0A062] shadow-[0_0_30px_rgba(192,160,98,0.2)]",
                  "transition-all duration-700 hover:scale-[1.12] hover:border-[#25D366] hover:shadow-[0_0_60px_rgba(37,211,102,0.6)]"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-800" />
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#25D366] blur-3xl opacity-30 group-hover:opacity-80 animate-pulse" />
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111111] to-[#000000] flex items-center justify-center border-2 border-[#C0A062] group-hover:border-[#25D366] group-hover:rotate-[360deg] transition-all duration-1000 shadow-[inset_0_0_15px_rgba(192,160,98,0.3)]">
                    <MessageCircle className="w-7 h-7 text-[#25D366]" />
                  </div>
                </div>
                <div className="text-left relative z-10">
                  <p className="text-[16px] font-black text-white m-0 uppercase tracking-[2px] group-hover:text-[#25D366] transition-colors">WhatsApp Us</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shadow-[0_0_15px_#25D366]" />
                    <p className="text-[11px] text-[#C0A062] m-0 uppercase tracking-[4px] font-black group-hover:text-white transition-colors">Concierge</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* CLASSIC Side-Line Disclaimers - REVERTED TO SIMPLE GOLD LINES */}
        <div className="max-w-[1400px] mx-auto px-10 md:px-16 py-12 border-t border-[#C0A062]/15 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex gap-6 group">
              <div className="w-[2px] h-auto bg-[#C0A062] opacity-60 flex-shrink-0 group-hover:opacity-100 transition-opacity" />
              <div className="space-y-3 text-left">
                <h4 className="text-[11px] font-bold text-[#C0A062] uppercase tracking-[0.3em] m-0">SEBI Disclosure</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light m-0">
                  Investments in securities market are subject to market risks. Read all the related documents carefully before investing. Past performance is not indicative of future returns. 
                </p>
              </div>
            </div>

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

        {/* Final Copyright & Active Compliance Badge - ENHANCED TURBO WAVE */}
        <div className="relative pt-12 pb-20 px-8 flex flex-col items-center border-t border-[#C0A062]/10 z-20">
          <div className="relative z-10 flex flex-col items-center space-y-10">
            <div className="inline-flex items-center justify-center">
              <div className="relative overflow-hidden border-[1.5px] border-[#C0A062]/40 rounded-full px-12 py-4 bg-black/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(192,160,98,0.15)] transition-all duration-700 hover:border-[#C0A062] hover:bg-[#C0A062]/10 group cursor-default">
                {/* Fixed & Visible 3s Wave Inside Badge */}
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:animate-[linearSweep_3s_infinite_linear] pointer-events-none z-10" />
                
                <p className="relative z-20 text-[14px] font-serif text-[#C0A062] font-bold tracking-[4px] uppercase m-0 flex items-center gap-4">
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

/**
 * FILE: components\user\Navigation.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - next/link
 * - next/navigation
 * - react
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

﻿'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef(null);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const partnersRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    let lastY = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      // Glass should be hidden at the very top; re-appear after a small scroll.
      setIsScrolled(y > 10);
      // Route-level auto-hide for /tools/*
      const onTools = pathname?.startsWith('/tools/');
      if (onTools) {
        const goingDown = y > lastY;
        const threshold = 24;
        if (y > threshold && goingDown) setShowNav(false);
        else setShowNav(true);
      } else {
        setShowNav(true);
      }
      lastY = y;
    };
    
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    // Close dropdown on route change
    setServicesOpen(false);
    setPartnersOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!servicesOpen && !partnersOpen) return;

    const onMouseDown = (e) => {
      const servicesEl = servicesRef.current;
      const partnersEl = partnersRef.current;

      if (servicesOpen && servicesEl && e.target instanceof Node && !servicesEl.contains(e.target)) {
        setServicesOpen(false);
      }
      if (partnersOpen && partnersEl && e.target instanceof Node && !partnersEl.contains(e.target)) {
        setPartnersOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        setPartnersOpen(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [servicesOpen, partnersOpen]);

  const serviceLinks = [
    { path: '/services', label: 'Services Overview', sub: 'What we offer' },
    { path: '/portfolio-management', label: 'Portfolio Management', sub: 'PMS-first planning' },
    { path: '/mutual-funds', label: 'Mutual Funds', sub: 'Goal-based allocation' },
    { path: '/insurance', label: 'Insurance', sub: 'Protection architecture' },
    { path: '/fixed-deposits', label: 'Fixed Deposits', sub: 'Liquidity & stability' },
    { path: '/sip-calculator', label: 'SIP Calculator', sub: 'SIP planning tool' },
  ];

  const servicesActive = serviceLinks.some((l) => pathname === l.path);

  const partnerLinks = [
    { path: '/execution-partners', label: 'Execution Partners', sub: 'Optional routing links' },
    { path: '/curated-partners', label: 'Curated Partners', sub: 'Placement framework' },
    { path: '/platforms', label: 'Investment Platforms', sub: 'Platforms directory' },
  ];

  const partnersActive = partnerLinks.some((l) => pathname === l.path);

  const DesktopLink = ({ path, label }) => {
    const isActive = pathname === path;
    return isActive ? (
      <Link
        href={path}
        className="bm-navlink-active relative text-[12px] font-bold uppercase tracking-[2.5px] no-underline text-[color:var(--lux-accent)] nav-active-glow"
      >
        {label}
        <span
          className="absolute -bottom-2 left-0 w-full h-[1px] pointer-events-none bg-gradient-to-r from-transparent via-[color:var(--lux-accent)] to-transparent"
          aria-hidden="true"
        />
      </Link>
    ) : (
      <Link
        href={path}
        className="bm-navlink group relative text-[12px] font-medium transition-all duration-300 uppercase tracking-[2.5px] no-underline text-white/90 hover:text-white hover:scale-105"
      >
        {label}
        <span
          className="absolute -bottom-2 left-1/2 w-0 h-[1px] transition-all duration-300 group-hover:left-0 group-hover:w-full pointer-events-none bg-gradient-to-r from-transparent via-[color:var(--lux-accent)] to-transparent"
          aria-hidden="true"
        />
      </Link>
    );
  };

  // Ultra-Luxury Logo Component - Matching Mobile Dock Aesthetic
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" className="group flex items-center gap-4 no-underline">
      <div className="relative">
        {/* Multidimensional Radiant Glow */}
        <div className="absolute inset-0 bg-[color:var(--lux-accent)] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-full" />
        <div className="absolute inset-0 bg-[color:var(--lux-accent)] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-full" />
        
        <Image
          src="/logo.webp"
          alt="BM Wealth Logo"
          width={size}
          height={size}
          className="relative z-10 transition-transform duration-500 group-hover:scale-110"
          style={{ objectFit: 'contain', display: 'block' }}
          priority
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span 
            className="font-serif font-bold tracking-[2px] whitespace-nowrap transition-all duration-500 group-hover:tracking-[3.5px] gold-gradient-text nav-logo-text"
            style={{ fontSize }}
          >
            BM Wealth
          </span>
        </div>
        {/* Luxury Subline Underline */}
        <div className="h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-transparent via-[color:var(--lux-accent)] to-transparent transition-all duration-700 mx-auto mt-1" />
      </div>
    </Link>
  );

  // Hide brand/navigation on pages that provide their own header.
  // (Prevents the fixed public navbar overlaying and blocking admin controls.)
  const hideNav =
    pathname === '/sip-calculator' ||
    pathname === '/archive' ||
    pathname.startsWith('/admin-secret-akash') ||
    pathname?.startsWith('/live-intelligence');

  if (hideNav) {
    // Render nothing on this route; page provides its own minimal header.
    return null;
  }

  // Always render desktop version during SSR and initial render to prevent hydration mismatch.
  // Use CSS to hide/show based on screen size instead of conditional rendering.
  // Wrap in a single div to ensure consistent tree structure between server and client.
  return (
    <div className="navigation-wrapper" suppressHydrationWarning>
      {/* Mobile Header - hidden on lg+ */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-transform duration-300 ease-in-out px-5 h-[70px] flex items-center lg:hidden",
          isScrolled ? "bg-black/30 backdrop-blur-xl" : "bg-transparent"
        )}
        style={{ transform: showNav ? 'translateY(0)' : 'translateY(-100%)' }}
        suppressHydrationWarning
      >
        <Logo size={38} fontSize="19px" />
      </header>

      {/* Desktop Navigation - hidden on mobile */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-transform duration-300 ease-in-out h-[85px] hidden lg:flex items-center justify-center px-10",
          isScrolled ? "bg-black/30 backdrop-blur-xl" : "bg-transparent"
        )}
        style={{ transform: showNav ? 'translateY(0)' : 'translateY(-100%)' }}
        suppressHydrationWarning
      >
        <div className="w-full max-w-[1600px] flex items-center">
          <Logo size={48} fontSize="24px" />
          <div className="ml-auto flex items-center justify-end gap-6">
            <DesktopLink path="/" label="Home" />
            <DesktopLink path="/about-us" label="About Us" />
            <DesktopLink path="/intelligence" label="Intelligence" />

            {/* Desktop-only glass dropdown for Services */}
            <div className="relative" ref={servicesRef}>
              <button
                type="button"
                onClick={() => setServicesOpen((v) => !v)}
                className={cn(
                  "group relative text-[12px] uppercase tracking-[2.5px] no-underline transition-all duration-300",
                  servicesActive
                    ? "font-bold text-[color:var(--lux-accent)]"
                    : "font-medium text-white/90 hover:text-white hover:scale-105"
                )}
                aria-haspopup="menu"
                aria-expanded={servicesOpen}
              >
                Services
                <span
                  className={cn(
                    "ml-2 inline-block align-middle transition-transform duration-200",
                    servicesOpen ? "rotate-180" : "rotate-0"
                  )}
                  aria-hidden="true"
                >
                  ▾
                </span>
                <span
                  className={cn(
                    "absolute -bottom-2 left-1/2 w-0 h-[1px] transition-all duration-300 group-hover:left-0 group-hover:w-full pointer-events-none bg-gradient-to-r from-transparent via-[color:var(--lux-accent)] to-transparent",
                    servicesActive ? "left-0 w-full" : ""
                  )}
                  aria-hidden="true"
                />
              </button>

              {servicesOpen ? (
                <div
                  role="menu"
                  className="absolute left-1/2 -translate-x-1/2 mt-5 w-[520px] rounded-2xl border border-white/10 bg-black/20 backdrop-blur-3xl shadow-[0_30px_120px_rgba(0,0,0,0.55)] overflow-hidden"
                >
                  <div className="p-5">
                    <div className="text-[11px] tracking-[0.35em] uppercase text-white/60">Services</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {serviceLinks.map((l) => (
                        <Link
                          key={l.path}
                          href={l.path}
                          role="menuitem"
                          className={cn(
                            "rounded-xl border border-white/10 px-4 py-3 no-underline transition-all duration-200",
                            pathname === l.path ? "bg-white/10" : "bg-white/0 hover:bg-white/5"
                          )}
                          style={{ outline: 'none' }}
                        >
                          <div className="text-[13px] font-semibold text-white/90">{l.label}</div>
                          <div className="mt-1 text-[11px] text-white/60">{l.sub}</div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[color:var(--lux-accent)] to-transparent opacity-40" />
                    <div className="mt-4 text-[11px] text-white/60">
                      Premium planning across PMS, funds, insurance and liquidity.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Desktop-only glass dropdown for Partners */}
            <div className="relative" ref={partnersRef}>
              <button
                type="button"
                onClick={() => setPartnersOpen((v) => !v)}
                className={cn(
                  "group relative text-[12px] uppercase tracking-[2.5px] no-underline transition-all duration-300",
                  partnersActive
                    ? "font-bold text-[color:var(--lux-accent)]"
                    : "font-medium text-white/90 hover:text-white hover:scale-105"
                )}
                aria-haspopup="menu"
                aria-expanded={partnersOpen}
              >
                Partners
                <span
                  className={cn(
                    "ml-2 inline-block align-middle transition-transform duration-200",
                    partnersOpen ? "rotate-180" : "rotate-0"
                  )}
                  aria-hidden="true"
                >
                  ▾
                </span>
                <span
                  className={cn(
                    "absolute -bottom-2 left-1/2 w-0 h-[1px] transition-all duration-300 group-hover:left-0 group-hover:w-full pointer-events-none bg-gradient-to-r from-transparent via-[color:var(--lux-accent)] to-transparent",
                    partnersActive ? "left-0 w-full" : ""
                  )}
                  aria-hidden="true"
                />
              </button>

              {partnersOpen ? (
                <div
                  role="menu"
                  className="absolute left-1/2 -translate-x-1/2 mt-5 w-[520px] rounded-2xl border border-white/10 bg-black/20 backdrop-blur-3xl shadow-[0_30px_120px_rgba(0,0,0,0.55)] overflow-hidden"
                >
                  <div className="p-5">
                    <div className="text-[11px] tracking-[0.35em] uppercase text-white/60">Partners</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {partnerLinks.map((l) => (
                        <Link
                          key={l.path}
                          href={l.path}
                          role="menuitem"
                          className={cn(
                            "rounded-xl border border-white/10 px-4 py-3 no-underline transition-all duration-200",
                            pathname === l.path ? "bg-white/10" : "bg-white/0 hover:bg-white/5"
                          )}
                          style={{ outline: 'none' }}
                        >
                          <div className="text-[13px] font-semibold text-white/90">{l.label}</div>
                          <div className="mt-1 text-[11px] text-white/60">{l.sub}</div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[color:var(--lux-accent)] to-transparent opacity-40" />
                    <div className="mt-4 text-[11px] text-white/60">
                      Optional routing links and partner framework pages.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <DesktopLink path="/tools" label="Tools" />
            <DesktopLink path="/live-intelligence" label="Live Intel" />
            <DesktopLink path="/client-portal" label="Client Portal" />
            <DesktopLink path="/blog" label="Blog" />
            <DesktopLink path="/contact" label="Contact" />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;

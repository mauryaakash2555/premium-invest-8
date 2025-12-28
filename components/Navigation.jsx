'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about-us', label: 'About Us' },
    { path: '/services', label: 'Services' },
    { path: '/platforms', label: 'Platforms' },
    { path: '/curated-partners', label: 'Curated Partners' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  // Clean & Minimalist Logo Component
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" className="group flex items-center gap-3 no-underline">
      <div className="relative">
        {/* Multidimensional Radiant Glow */}
        <div className="absolute inset-0 bg-[#C0A062] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-full animate-ambientGlowPulse" />
        <div className="absolute inset-0 bg-[#C0A062] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-full animate-ambientGlowPulse delay-200" />
        
        <img 
          src="/logo.webp" 
          alt="BM Wealth Logo" 
          className="relative z-10 transition-transform duration-500 group-hover:scale-110"
          style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'block' }}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span 
            className="font-serif font-bold tracking-[2.5px] whitespace-nowrap transition-all duration-500 group-hover:tracking-[3.5px] gold-gradient-text"
            style={{ 
              fontSize: fontSize, 
              filter: 'drop-shadow(0 0 10px rgba(192, 160, 98, 0.4))' 
            }}
          >
            BM Wealth
          </span>
        </div>
        {/* Luxury Subline Underline */}
        <div className="h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-transparent via-[#C0A062] to-transparent transition-all duration-700 mx-auto mt-1" />
      </div>
    </Link>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-in-out px-5 h-[70px] flex items-center",
          isScrolled 
            ? "bg-black/95 backdrop-blur-xl border-b border-[#C0A062]/40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
            : "bg-transparent border-b border-transparent"
        )}
      >
        <Logo size={38} fontSize="19px" />
      </header>
    );
  }

  // Desktop Navigation
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-in-out h-[85px] flex items-center justify-center px-10",
        isScrolled 
          ? "ultra-luxury-glass border-b border-[#C0A062]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
          : "bg-transparent"
      )}
    >
      <div className="w-full max-w-[1600px] flex justify-between items-center">
        <Logo size={48} fontSize="24px" />
        <div className="flex gap-10 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "relative text-[12px] font-medium transition-all duration-300 uppercase tracking-[2.5px] no-underline",
                  isActive ? "text-[#C0A062] font-bold drop-shadow-[0_0_8px_rgba(192,160,98,0.6)]" : "text-white/90 hover:text-white hover:scale-105",
                  "group"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

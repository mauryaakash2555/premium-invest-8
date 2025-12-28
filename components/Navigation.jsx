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

  // Ultra-Luxury Logo Component with Animated Wings
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" className="group flex items-center gap-4 no-underline">
      <div className="relative">
        {/* Multidimensional Logo Glow Layer */}
        <div className="absolute -inset-3 bg-[#C0A062]/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
        <div className="absolute inset-0 bg-[#D4B576]/5 blur-lg rounded-full" />
        
        {/* Circular Orbit Border */}
        <div className="relative z-10 p-1.5 rounded-full border border-[#C0A062]/20 bg-black/40 backdrop-blur-sm transition-all duration-500 group-hover:border-[#C0A062]/50 group-hover:shadow-[0_0_20px_rgba(192,160,98,0.3)]">
          <img 
            src="/logo.webp" 
            alt="BM Wealth Logo" 
            className="rounded-full transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110"
            style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Shimmering Wing - Left */}
        <div className="hidden sm:block relative w-8 h-[1px] bg-[#C0A062]/30 overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[linearSweep_2s_infinite]" />
        </div>

        <span 
          className="font-serif font-bold tracking-[2.5px] whitespace-nowrap transition-all duration-500 group-hover:tracking-[3.5px]"
          style={{ 
            fontSize: fontSize, 
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D4B576 25%, #F0E6D2 50%, #D4B576 75%, #FFFFFF 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gold-shine 4s linear infinite',
            filter: 'drop-shadow(0 0 15px rgba(212, 181, 118, 0.3))'
          }}
        >
          BM Wealth
        </span>

        {/* Shimmering Wing - Right */}
        <div className="hidden sm:block relative w-8 h-[1px] bg-[#C0A062]/30 overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/40 to-transparent translate-x-full animate-[linearSweep_2s_infinite]" />
        </div>
      </div>
    </Link>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ease-in-out px-5 h-[75px] flex items-center",
          isScrolled 
            ? "ultra-luxury-glass border-b border-[#C0A062]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)]" 
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
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ease-in-out h-[100px] flex items-center justify-center px-10",
        isScrolled 
          ? "ultra-luxury-glass border-b border-[#C0A062]/20 shadow-[0_10px_50px_rgba(0,0,0,0.8)]" 
          : "bg-transparent"
      )}
    >
      <div className="w-full max-w-[1400px] flex justify-between items-center">
        <Logo size={52} fontSize="26px" />
        <div className="flex gap-12 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "relative text-[13px] font-semibold transition-all duration-500 uppercase tracking-[2px] no-underline",
                  isActive ? "text-[#D4B576] drop-shadow-[0_0_8px_rgba(212,181,118,0.5)]" : "text-white/90 hover:text-[#D4B576] hover:scale-110"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-3 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent animate-pulse" />
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

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

  // High-Intensity Luxury Logo Component
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" className="group flex items-center gap-4 no-underline">
      <div className="relative">
        {/* Intense Multidimensional Radiant Glow */}
        <div className="absolute -inset-4 bg-[#C0A062]/25 blur-2xl rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[#D4B576]/30 blur-lg rounded-full" />
        
        <img 
          src="/logo.webp" 
          alt="BM Wealth Logo" 
          className="relative z-10 transition-all duration-700 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(192,160,98,0.8)]"
          style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'block' }}
        />
      </div>
      
      <div className="flex items-center gap-3">
        {/* Shimmering Wing - Left (Intense Always-On) */}
        <div className="hidden sm:block relative w-12 h-[2px] bg-[#C0A062]/40 overflow-hidden rounded-full shadow-[0_0_10px_rgba(192,160,98,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-[linearSweep_1.2s_infinite]" />
        </div>

        <span 
          className="font-serif font-bold tracking-[2.5px] whitespace-nowrap transition-all duration-500 group-hover:tracking-[3.5px]"
          style={{ 
            fontSize: fontSize, 
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D4B576 25%, #F0E6D2 50%, #D4B576 75%, #FFFFFF 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gold-shine 3s linear infinite', // Faster, more intense shine
            filter: 'drop-shadow(0 0 15px rgba(212, 181, 118, 0.4))'
          }}
        >
          BM Wealth
        </span>

        {/* Shimmering Wing - Right (Intense Always-On) */}
        <div className="hidden sm:block relative w-12 h-[2px] bg-[#C0A062]/40 overflow-hidden rounded-full shadow-[0_0_10px_rgba(192,160,98,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/80 to-transparent translate-x-full animate-[linearSweep_1.2s_infinite]" />
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
            ? "ultra-luxury-glass border-b border-[#C0A062]/40 shadow-[0_10px_50px_rgba(0,0,0,0.9)]" 
            : "bg-transparent border-b border-transparent"
        )}
      >
        <Logo size={40} fontSize="20px" />
      </header>
    );
  }

  // Desktop Navigation
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ease-in-out h-[100px] flex items-center justify-center px-10",
        isScrolled 
          ? "ultra-luxury-glass border-b border-[#C0A062]/30 shadow-[0_10px_60px_rgba(0,0,0,0.9)]" 
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
                  "relative text-[14px] font-bold transition-all duration-500 uppercase tracking-[2px] no-underline",
                  isActive ? "text-[#D4B576] drop-shadow-[0_0_12px_rgba(212,181,118,0.6)]" : "text-white hover:text-[#D4B576] hover:scale-110"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent animate-pulse shadow-[0_0_10px_#C0A062]" />
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

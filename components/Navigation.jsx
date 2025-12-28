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

  // Premium Logo Component with Shine & Glow (No cheap circles)
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" className="group flex items-center gap-4 no-underline">
      <div className="relative">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-[#C0A062]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        <img 
          src="/logo.webp" 
          alt="BM Wealth Logo" 
          className="relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.6)]"
          style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'block' }}
        />
      </div>
      
      <div className="flex items-center gap-3">
        {/* Luxurious Wing - Left (Linear Shimmer) */}
        <div className="hidden sm:block relative w-10 h-[1.5px] bg-[#C0A062]/20 overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C0A062]/60 to-transparent -translate-x-full animate-[linearSweep_1.5s_infinite]" />
        </div>

        <span 
          className="font-serif font-bold tracking-[2px] whitespace-nowrap transition-all duration-500 group-hover:tracking-[3px]"
          style={{ 
            fontSize: fontSize, 
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D4B576 50%, #FFFFFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 12px rgba(212, 181, 118, 0.2))'
          }}
        >
          BM Wealth
        </span>

        {/* Luxurious Wing - Right (Linear Shimmer) */}
        <div className="hidden sm:block relative w-10 h-[1.5px] bg-[#C0A062]/20 overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#C0A062]/60 to-transparent translate-x-full animate-[linearSweep_1.5s_infinite]" />
        </div>
      </div>
    </Link>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ease-in-out px-5 h-[70px] flex items-center",
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
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ease-in-out h-[90px] flex items-center justify-center px-10",
        isScrolled 
          ? "ultra-luxury-glass border-b border-[#C0A062]/20 shadow-[0_10px_50px_rgba(0,0,0,0.8)]" 
          : "bg-transparent"
      )}
    >
      <div className="w-full max-w-[1400px] flex justify-between items-center">
        <Logo size={48} fontSize="24px" />
        <div className="flex gap-10 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "relative text-[13px] font-semibold transition-all duration-500 uppercase tracking-[1.5px] no-underline",
                  isActive ? "text-[#D4B576] drop-shadow-[0_0_8px_rgba(212,181,118,0.4)]" : "text-white hover:text-[#D4B576] hover:scale-105"
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

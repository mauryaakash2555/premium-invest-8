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

  // Premium Logo Component
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" className="group flex items-center gap-3 no-underline">
      <div className="relative">
        {/* Outer Rotating Luxury Ring */}
        <div className="absolute -inset-1.5 rounded-full border border-[#C0A062]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -inset-1.5 rounded-full border-t border-transparent border-r-[#C0A062]/40 border-b-transparent border-l-transparent animate-spin duration-[3s] opacity-0 group-hover:opacity-100" />
        
        {/* Internal Radiant Glow */}
        <div className="absolute inset-0 bg-[#C0A062] blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full" />
        
        <div className="relative z-10 p-1.5 rounded-full border border-[#C0A062]/10 bg-black/40 backdrop-blur-sm transition-all duration-500 group-hover:border-[#C0A062]/40 group-hover:shadow-[0_0_20px_rgba(192,160,98,0.3)]">
          <img 
            src="/logo.webp" 
            alt="BM Wealth Logo" 
            className="transition-transform duration-700 group-hover:scale-110 rounded-full"
            style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>
      <div className="flex flex-col items-start -gap-1">
        <div className="flex items-center gap-2">
          {/* Elegant Logo Wings */}
          <div className="hidden sm:block w-3 h-[1px] bg-gradient-to-r from-transparent to-[#C0A062] opacity-20 group-hover:w-5 transition-all duration-700" />
          <span 
            className="gold-gradient-text font-serif font-bold tracking-[2px] whitespace-nowrap transition-all duration-500 group-hover:tracking-[3px]"
            style={{ fontSize: fontSize }}
          >
            BM Wealth
          </span>
          <div className="hidden sm:block w-3 h-[1px] bg-gradient-to-l from-transparent to-[#C0A062] opacity-20 group-hover:w-5 transition-all duration-700" />
        </div>
        <span className="text-[8px] text-[#C0A062]/40 uppercase tracking-[0.3em] font-medium ml-5 hidden sm:block">Excellence in Wealth</span>
      </div>
    </Link>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-in-out px-5 h-[70px] flex items-center",
          isScrolled 
            ? "bg-black/95 backdrop-blur-xl border-b border-[#C0A062]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
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
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-in-out h-[90px] flex items-center justify-center px-10",
        isScrolled 
          ? "bg-black/95 backdrop-blur-xl border-b border-[#C0A062]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
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
                  "relative text-[13px] font-medium transition-all duration-300 uppercase tracking-[1.5px] no-underline",
                  isActive ? "text-[#D4B576]" : "text-white hover:text-[#D4B576]"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent" />
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

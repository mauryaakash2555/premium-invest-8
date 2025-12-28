'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  // Common Logo Component with standard <img> for maximum reliability
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" className="flex items-center gap-3 no-underline">
      <img 
        src="/logo.webp" 
        alt="BM Wealth Logo" 
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      />
      <span style={{ 
        fontSize: fontSize, 
        fontFamily: "'Playfair Display', serif", 
        fontWeight: 700, 
        color: '#DAA520',
        letterSpacing: '1px',
        whiteSpace: 'nowrap'
      }}>
        BM Wealth
      </span>
    </Link>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={cn(
          "hidden lg:flex fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 h-20 items-center justify-center border-b border-transparent px-10",
          isScrolled ? "bg-black/95 backdrop-blur-xl border-white/10" : "bg-transparent"
        )}
      >
        <div className="w-full max-w-[1400px] flex justify-between items-center">
          <Logo size={45} fontSize="22px" />
          <div className="flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "no-underline text-[13px] font-medium transition-colors duration-300 uppercase tracking-widest",
                  pathname === link.path ? "text-[#DAA520]" : "text-white hover:text-[#DAA520]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Top Header Only (Bottom is handled by LuxuryMobileDock) */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 h-16 flex items-center px-5 border-b",
          isScrolled ? "bg-black/98 backdrop-blur-xl border-[#DAA520]/30" : "bg-black/90 backdrop-blur-xl border-white/10"
        )}
      >
        <Logo size={36} fontSize="18px" />
      </div>
    </>
  );
};

export default Navigation;

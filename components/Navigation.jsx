'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
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

  const mobileLinks = [
    { href: '/', label: 'Home' },
    { href: '/about-us', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className="hidden md:block fixed top-0 left-0 right-0 z-[999] transition-all duration-300"
        style={{
          background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(218, 165, 32, 0.1)' : 'none',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image 
              src="/logo.webp" 
              alt="BM Wealth Logo" 
              width={40} 
              height={40}
              style={{ objectFit: 'contain' }}
            />
            <span style={{ fontSize: '16px', fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, #DAA520, #B8860B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>
              BM Wealth
            </span>
          </Link>
          <div className="flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="no-underline text-[11px] font-medium transition-colors duration-300 uppercase tracking-widest"
                style={{
                  color: pathname === link.path ? '#DAA520' : '#FFFFFF',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Top Header with Logo */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[999] px-5 py-3 transition-all duration-300 border-b border-white/10"
        style={{
          background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottomColor: 'rgba(218, 165, 32, 0.2)',
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image 
            src="/logo.webp" 
            alt="BM Wealth Logo" 
            width={36} 
            height={36}
            style={{ objectFit: 'contain' }}
          />
          <span style={{ fontSize: '15px', fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, #DAA520, #B8860B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>
            BM Wealth
          </span>
        </Link>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] py-3 transition-all duration-300 border-t border-white/10"
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTopColor: 'rgba(218, 165, 32, 0.2)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex justify-around items-center max-w-[400px] mx-auto">
          {mobileLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center no-underline transition-colors duration-200"
                style={{
                  color: isActive ? '#DAA520' : '#888',
                }}
              >
                <span className="text-[10px]" style={{ fontWeight: isActive ? 600 : 400 }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;

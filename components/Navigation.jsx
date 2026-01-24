'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const STORE_URL = 'https://store.bmwealth.co.in';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    handleResize();
    
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

  const mobileLinks = [
    { href: '/', label: 'Home' },
    { href: '/about-us', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: STORE_URL, label: 'Store', external: true },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        style={{
          display: isMobile ? 'none' : 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '1px solid color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.06))' : 'none',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <Image 
              src="/logo.webp" 
              alt="BM Wealth Logo" 
              width={40} 
              height={40}
              style={{ objectFit: 'contain' }}
            />
            <span style={{ fontSize: '28px', fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, var(--lux-accent), color-mix(in oklab, var(--lux-accent) 70%, white))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>
              BM Wealth
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                style={{
                  color: pathname === link.path ? 'var(--lux-accent)' : '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'color 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onClick={(e) => {
                  // Ensure navigation happens
                  e.currentTarget.blur();
                }}
              >
                {link.label}
              </Link>
            ))}

            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--lux-accent)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'color 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Digital Store
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header with Logo */}
      <div
        style={{
          display: isMobile ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid color-mix(in oklab, var(--lux-accent) 22%, rgba(255,255,255,0.06))',
          padding: '12px 20px',
          transition: 'all 0.3s ease',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image 
            src="/logo.webp" 
            alt="BM Wealth Logo" 
            width={36} 
            height={36}
            style={{ objectFit: 'contain' }}
          />
          <span style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, var(--lux-accent), color-mix(in oklab, var(--lux-accent) 70%, white))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>
            BM Wealth
          </span>
        </Link>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        style={{
          display: isMobile ? 'block' : 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid color-mix(in oklab, var(--lux-accent) 22%, rgba(255,255,255,0.06))',
          padding: '12px 0',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '400px', margin: '0 auto' }}>
          {mobileLinks.map((item) => {
            const isActive = pathname === item.href;

            const style = {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--lux-accent)' : '#9aa3ad',
              fontSize: '10px',
              fontWeight: isActive ? 600 : 400,
              transition: 'color 0.2s ease',
            };

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={style}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                style={style}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;

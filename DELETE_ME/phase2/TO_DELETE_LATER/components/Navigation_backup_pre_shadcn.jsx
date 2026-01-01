'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

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

  const mobileLinks = [
    { href: '/', label: 'Home' },
    { href: '/about-us', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  // Common Logo Component
  const Logo = ({ size = 40, fontSize = '20px' }) => (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
      <img 
        src="/logo.webp" 
        alt="BM Wealth Logo" 
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', display: 'block' }}
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

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Header */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: isScrolled ? 'rgba(0, 0, 0, 0.98)' : 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(218, 165, 32, 0.3)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            height: '60px',
            boxSizing: 'border-box'
          }}
        >
          <Logo size={36} fontSize="18px" />
        </div>

        {/* Mobile Bottom Navigation */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(218, 165, 32, 0.3)',
            padding: '10px 0',
            paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 'auto'
          }}
        >
          {mobileLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: isActive ? '#DAA520' : '#888',
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'color 0.2s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </>
    );
  }

  // Desktop Navigation
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled ? 'rgba(0, 0, 0, 0.98)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(218, 165, 32, 0.2)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 40px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo size={45} fontSize="22px" />
        <div style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              style={{
                color: pathname === link.path ? '#DAA520' : '#FFFFFF',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'color 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Users, MoreHorizontal, Menu, X } from 'lucide-react';

export default function LuxuryMobileDock() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'HOME' },
    { href: '/services', icon: Briefcase, label: 'SERVICES' },
    { href: '/curated-partners', icon: Users, label: 'PARTNERS' },
    { href: '/more', icon: MoreHorizontal, label: 'MORE' },
  ];

  const menuItems = [
    { href: '/', label: 'Home', sublabel: 'Welcome' },
    { href: '/about-us', label: 'About Us', sublabel: 'Our Story' },
    { href: '/services', label: 'Services', sublabel: 'What We Offer' },
    { href: '/platforms', label: 'Platforms', sublabel: 'Investment Options' },
    { href: '/curated-partners', label: 'Curated Partners', sublabel: 'Our Network' },
    { href: '/blog', label: 'Blog', sublabel: 'Insights & News' },
    { href: '/contact', label: 'Contact', sublabel: 'Get in Touch' },
  ];

  return (
    <>
      {/* Mobile Navigation Dock - Only visible on mobile */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: isScrolled ? 'translateX(-50%) scale(0.92)' : 'translateX(-50%) scale(1)',
          zIndex: 9999,
          width: 'calc(100% - 40px)',
          maxWidth: '420px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isScrolled ? 0.92 : 1,
        }}
      >
        {/* Gold Halo Glow Effect */}
        <div
          style={{
            position: 'absolute',
            inset: '-12px',
            background: 'radial-gradient(ellipse at center, rgba(192, 160, 98, 0.25) 0%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
            opacity: 0.6,
          }}
        />

        {/* Main Dock Container */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(10, 10, 10, 0.95) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1.5px solid rgba(192, 160, 98, 0.4)',
            borderRadius: '9999px',
            padding: '16px 24px',
            boxShadow: `
              0 10px 40px rgba(0, 0, 0, 0.8),
              0 0 1px rgba(192, 160, 98, 0.3),
              inset 0 1px 0 rgba(192, 160, 98, 0.15),
              inset 0 -1px 0 rgba(0, 0, 0, 0.5)
            `,
          }}
        >
          {/* Subtle Gold Grain Texture Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(192, 160, 98, 0.02) 2px,
                  rgba(192, 160, 98, 0.02) 4px
                )
              `,
              borderRadius: '9999px',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Navigation Items */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
            }}
          >
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href === '/more' ? '#' : item.href}
                  onClick={(e) => {
                    if (item.href === '/more') {
                      e.preventDefault();
                      setIsMenuOpen(true);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '24px',
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(192, 160, 98, 0.2) 0%, rgba(192, 160, 98, 0.08) 100%)'
                      : 'transparent',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    textDecoration: 'none',
                    position: 'relative',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  {/* Active Indicator Glow */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-4px',
                        background: 'radial-gradient(circle at center, rgba(192, 160, 98, 0.2) 0%, transparent 70%)',
                        filter: 'blur(8px)',
                        pointerEvents: 'none',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                  )}

                  <Icon
                    size={22}
                    strokeWidth={1}
                    style={{
                      color: isActive ? '#C0A062' : 'rgba(192, 160, 98, 0.5)',
                      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(192, 160, 98, 0.6))' : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 500,
                      letterSpacing: '0.8px',
                      color: isActive ? '#C0A062' : 'rgba(192, 160, 98, 0.5)',
                      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      textTransform: 'uppercase',
                      textShadow: isActive ? '0 0 10px rgba(192, 160, 98, 0.4)' : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-Screen Overlay Menu */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.98)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            animation: 'fadeIn 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(192, 160, 98, 0.1)',
              border: '1px solid rgba(192, 160, 98, 0.3)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <X size={24} strokeWidth={1.5} style={{ color: '#C0A062' }} />
          </button>

          {/* Menu Items */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
              maxWidth: '400px',
              marginTop: '20px',
            }}
          >
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '20px 24px',
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(192, 160, 98, 0.15) 0%, rgba(192, 160, 98, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isActive ? 'rgba(192, 160, 98, 0.3)' : 'rgba(192, 160, 98, 0.1)'}`,
                    borderRadius: '16px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    animation: `slideInStagger ${0.3 + index * 0.05}s ease-out`,
                    transform: 'translateY(0)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '22px',
                      fontWeight: 600,
                      color: isActive ? '#C0A062' : '#FFFFFF',
                      transition: 'color 0.3s ease',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: 'rgba(192, 160, 98, 0.6)',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {item.sublabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInStagger {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}

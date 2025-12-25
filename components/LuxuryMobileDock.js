"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Briefcase, BookOpen, Phone } from 'lucide-react';

export const LuxuryMobileDock = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/about', icon: User, label: 'About' },
    { href: '/services', icon: Briefcase, label: 'Services' },
    { href: '/blog', icon: BookOpen, label: 'Blog' },
    { href: '/contact', icon: Phone, label: 'Contact' },
  ];

  return (
    <div
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(218, 165, 32, 0.2)',
        padding: '12px 0',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: isActive ? 'rgba(218, 165, 32, 0.15)' : 'transparent',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
              }}
            >
              <Icon
                size={24}
                style={{
                  color: isActive ? '#DAA520' : '#888888',
                  transition: 'color 0.3s ease',
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: isActive ? '#DAA520' : '#888888',
                  transition: 'color 0.3s ease',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LuxuryMobileDock;




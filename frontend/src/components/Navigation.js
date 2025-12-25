import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
    { path: '/compliance', label: 'Compliance' },
    { path: '/platforms', label: 'Platforms' },
    { path: '/curated-partners', label: 'Partners' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(184, 134, 11, 0.1)' : 'none',
        transition: 'all 0.3s ease',
        height: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <img
            src="/logo.webp"
            alt="BM Wealth Logo"
            width="40"
            height="40"
            loading="eager"
            fetchpriority="high"
            style={{ objectFit: 'contain' }}
          />
          <div
            style={{
              fontSize: '28px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              background: 'linear-gradient(135deg, #DAA520 0%, #C0A062 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BM Wealth
          </div>
        </Link>

        {/* Desktop Menu */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
          }}
          className="desktop-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: isActive(link.path) ? '#B8860B' : '#FFFFFF',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#B8860B')}
              onMouseLeave={(e) =>
                (e.target.style.color = isActive(link.path) ? '#B8860B' : '#FFFFFF')
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#B8860B',
            cursor: 'pointer',
            padding: '8px',
            zIndex: 1000,
          }}
          className="mobile-menu-toggle"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.98)',
            backdropFilter: 'blur(20px)',
            padding: '20px',
            borderTop: '1px solid rgba(184, 134, 11, 0.2)',
          }}
          className="mobile-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'block',
                color: isActive(link.path) ? '#B8860B' : '#FFFFFF',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 500,
                padding: '12px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        /* Desktop Navigation (> 768px) */
        @media (min-width: 769px) {
          .mobile-menu-toggle {
            display: none !important;
          }
          .desktop-menu {
            display: flex !important;
          }
        }
        
        /* Mobile Navigation (≤ 768px) - Enhanced UX */
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          
          /* Mobile menu container - Smooth slide-in */
          .mobile-menu {
            animation: slideDown 0.3s ease-out;
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Mobile menu links - Better touch targets */
          .mobile-menu a {
            padding: 16px 8px !important;
            font-size: 17px !important;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
          }
          
          .mobile-menu a:hover,
          .mobile-menu a:active {
            background: rgba(184, 134, 11, 0.1);
            border-left-color: #B8860B;
            padding-left: 16px !important;
          }
          
          /* Navigation bar - Fixed height on mobile */
          nav {
            height: 70px !important;
          }
        }
        
        /* Small phones (≤ 480px) */
        @media (max-width: 480px) {
          nav {
            height: 65px !important;
            padding: 0 12px !important;
          }
          
          .mobile-menu {
            padding: 16px !important;
          }
          
          .mobile-menu a {
            padding: 14px 8px !important;
            font-size: 16px !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;

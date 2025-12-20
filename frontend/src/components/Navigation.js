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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/recommended-platforms', label: 'Platforms' },
    { path: '/curated-partners', label: 'Curated Partners' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: isScrolled
          ? 'rgba(0, 0, 0, 0.95)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(218, 165, 32, 0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            style={{
              objectFit: 'contain',
            }}
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
            gap: '32px',
            alignItems: 'center',
          }}
          className="desktop-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              data-testid={`nav-${link.label.toLowerCase()}`}
              style={{
                color:
                  location.pathname === link.path ? '#DAA520' : '#FFFFFF',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.3s ease',
                position: 'relative',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
              onMouseLeave={(e) =>
                (e.target.style.color =
                  location.pathname === link.path ? '#DAA520' : '#FFFFFF')
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#DAA520',
            cursor: 'pointer',
            padding: '8px',
            zIndex: 1000,
            position: 'relative',
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
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.98)',
            backdropFilter: 'blur(20px)',
            padding: '40px 20px',
            borderTop: '1px solid rgba(218, 165, 32, 0.2)',
            overflowY: 'auto',
            zIndex: 998,
          }}
          className="mobile-menu"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  color:
                    location.pathname === link.path ? '#DAA520' : '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '20px',
                  fontWeight: 500,
                  padding: '16px 24px',
                  marginBottom: '4px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  minHeight: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = 'rgba(218, 165, 32, 0.1)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: block !important;
            z-index: 1001 !important;
          }
          
          /* Ensure mobile menu is above all content */
          .mobile-menu {
            z-index: 998 !important;
          }
          
          /* Prevent body scroll when menu open */
          body.mobile-menu-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;

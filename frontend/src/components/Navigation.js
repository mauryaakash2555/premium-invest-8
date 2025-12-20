import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlatformsDropdownOpen, setIsPlatformsDropdownOpen] = useState(false);
  const [isMobilePlatformsOpen, setIsMobilePlatformsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPlatformsDropdownOpen(false);
      }
    };

    if (isPlatformsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPlatformsDropdownOpen]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  const platformsLinks = [
    { path: '/recommended-platforms', label: 'Recommended Platforms' },
    { path: '/curated-partners', label: 'Curated Partners' },
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
          {navLinks.slice(0, 3).map((link) => (
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

          {/* Platforms Dropdown - CLICK to open */}
          <div
            ref={dropdownRef}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => setIsPlatformsDropdownOpen(!isPlatformsDropdownOpen)}
              style={{
                color: (location.pathname === '/recommended-platforms' || location.pathname === '/curated-partners') ? '#DAA520' : '#FFFFFF',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.3s ease',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#DAA520')}
              onMouseLeave={(e) =>
                (e.target.style.color =
                  (location.pathname === '/recommended-platforms' || location.pathname === '/curated-partners') ? '#DAA520' : '#FFFFFF')
              }
            >
              Platforms
              <ChevronDown 
                size={14} 
                style={{ 
                  transition: 'transform 0.3s ease', 
                  transform: isPlatformsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                }} 
              />
            </button>

            {isPlatformsDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '12px',
                  background: 'rgba(0, 0, 0, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(192, 160, 98, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 0',
                  minWidth: '240px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                }}
              >
                {platformsLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsPlatformsDropdownOpen(false)}
                    style={{
                      display: 'block',
                      color: location.pathname === link.path ? '#DAA520' : '#FFFFFF',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '10px 20px',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(192, 160, 98, 0.1)';
                      e.target.style.color = '#DAA520';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = location.pathname === link.path ? '#DAA520' : '#FFFFFF';
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(3).map((link) => (
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
            background: 'rgba(0, 0, 0, 0.98)',
            backdropFilter: 'blur(20px)',
            padding: '20px',
            borderTop: '1px solid rgba(218, 165, 32, 0.2)',
          }}
          className="mobile-menu"
        >
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'block',
                color:
                  location.pathname === link.path ? '#DAA520' : '#FFFFFF',
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

          {/* Mobile Platforms Accordion */}
          <div>
            <button
              onClick={() => setIsMobilePlatformsOpen(!isMobilePlatformsOpen)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: (location.pathname === '/recommended-platforms' || location.pathname === '/curated-partners') ? '#DAA520' : '#FFFFFF',
                fontSize: '18px',
                fontWeight: 500,
                padding: '12px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              Platforms
              <ChevronDown 
                size={18} 
                style={{ 
                  transition: 'transform 0.3s ease', 
                  transform: isMobilePlatformsOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                }} 
              />
            </button>
            {isMobilePlatformsOpen && (
              <div style={{ paddingLeft: '20px' }}>
                {platformsLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsMobilePlatformsOpen(false);
                    }}
                    style={{
                      display: 'block',
                      color: location.pathname === link.path ? '#DAA520' : 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: 400,
                      padding: '10px 0',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(3).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'block',
                color:
                  location.pathname === link.path ? '#DAA520' : '#FFFFFF',
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
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: block !important;
            z-index: 1001 !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, Menu, X, Info, Layers, BookOpen, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

const mainNavItems = [
  { label: 'Home', icon: <Home className="w-5 h-5" strokeWidth={1} />, href: '/' },
  { label: 'Services', icon: <Briefcase className="w-5 h-5" strokeWidth={1} />, href: '/services' },
  { label: 'Partners', icon: <Users className="w-5 h-5" strokeWidth={1} />, href: '/curated-partners' },
];

const allNavItems = [
  { label: 'Home', icon: <Home className="w-6 h-6" strokeWidth={1} />, href: '/' },
  { label: 'About Us', icon: <Info className="w-6 h-6" strokeWidth={1} />, href: '/about-us' },
  { label: 'Services', icon: <Briefcase className="w-6 h-6" strokeWidth={1} />, href: '/services' },
  { label: 'Platforms', icon: <Layers className="w-6 h-6" strokeWidth={1} />, href: '/platforms' },
  { label: 'Curated Partners', icon: <Users className="w-6 h-6" strokeWidth={1} />, href: '/curated-partners' },
  { label: 'Blog', icon: <BookOpen className="w-6 h-6" strokeWidth={1} />, href: '/blog' },
  { label: 'Contact', icon: <Mail className="w-6 h-6" strokeWidth={1} />, href: '/contact' },
];

export function LuxuryMobileDock() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const location = useLocation();

  // Check if on blog page or reading content
  useEffect(() => {
    const isBlogPage = location.pathname === '/blog' || location.pathname.includes('/blog/');
    setIsReading(isBlogPage);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Detect scroll direction - hide when scrolling down on blog pages
          if (isReading) {
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              setIsScrollingDown(true); // Scrolling down - hide dock
            } else if (currentScrollY < lastScrollY) {
              setIsScrollingDown(false); // Scrolling up - show dock
            }
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    if (isReading) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY, isReading]);

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
    window.location.href = href;
  };

  // Hide dock when scrolling down on blog pages
  const shouldHideDock = isReading && isScrollingDown;

  return (
    <>
      {/* MOBILE ONLY - Desktop completely hidden with md:hidden */}
      <nav
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] md:hidden',
          scrolled ? 'scale-90 opacity-85' : 'scale-100 opacity-100',
          shouldHideDock ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0'
        )}
      >
        <div
          className={cn(
            'gold-shimmer luxury-particles ultra-luxury-glass ambient-glow-pulse',
            'relative flex items-center gap-1 px-5 py-3.5 bg-[#000000] rounded-full',
            'border-[1.5px] border-[#C0A062]',
            'shadow-[0_0_25px_rgba(192,160,98,0.4),0_0_50px_rgba(192,160,98,0.25),0_0_75px_rgba(192,160,98,0.15),inset_0_0_20px_rgba(192,160,98,0.08)]'
          )}
        >
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-1 h-1 rounded-full bg-[#C0A062] opacity-60 animate-pulse" />
          <div
            className="absolute top-1/2 right-3 -translate-y-1/2 w-1 h-1 rounded-full bg-[#C0A062] opacity-60 animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {mainNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavClick(item.href)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                'relative flex flex-col items-center justify-center px-4 py-2',
                'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                'hover:scale-125 active:scale-95 group'
              )}
              aria-label={item.label}
            >
              {hoveredIndex === index && (
                <div className="absolute inset-0 rounded-lg bg-[#C0A062]/10 blur-xl animate-in fade-in zoom-in duration-300" />
              )}

              <div
                className={cn(
                  'relative text-[#C0A062] transition-all duration-500',
                  'group-hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.8)]',
                  'group-hover:drop-shadow-[0_0_30px_rgba(192,160,98,0.5)]',
                  'group-hover:filter group-hover:brightness-125',
                  location.pathname === item.href && 'drop-shadow-[0_0_15px_rgba(192,160,98,0.8)]'
                )}
              >
                {item.icon}
              </div>
              <span
                className={cn(
                  'text-[9px] mt-1.5 transition-all duration-500',
                  'tracking-widest uppercase',
                  'text-[#C0A062]/60 group-hover:text-[#C0A062]',
                  'group-hover:drop-shadow-[0_0_8px_rgba(192,160,98,0.6)]',
                  'group-hover:scale-110',
                  location.pathname === item.href && 'text-[#C0A062]'
                )}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item.label}
              </span>
            </button>
          ))}

          {/* More Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            onMouseEnter={() => setHoveredIndex(999)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              'relative flex flex-col items-center justify-center px-4 py-2',
              'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
              'hover:scale-125 active:scale-95 group'
            )}
            aria-label="More menu"
          >
            {hoveredIndex === 999 && (
              <div className="absolute inset-0 rounded-lg bg-[#C0A062]/10 blur-xl animate-in fade-in zoom-in duration-300" />
            )}

            <div
              className={cn(
                'relative text-[#C0A062] transition-all duration-500',
                'group-hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.8)]',
                'group-hover:drop-shadow-[0_0_30px_rgba(192,160,98,0.5)]',
                'group-hover:filter group-hover:brightness-125',
                'group-hover:rotate-90'
              )}
            >
              <Menu className="w-5 h-5" strokeWidth={1} />
            </div>
            <span
              className={cn(
                'text-[9px] mt-1.5 transition-all duration-500',
                'tracking-widest uppercase',
                'text-[#C0A062]/60 group-hover:text-[#C0A062]',
                'group-hover:drop-shadow-[0_0_8px_rgba(192,160,98,0.6)]',
                'group-hover:scale-110'
              )}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Full-Screen Overlay Menu - MOBILE ONLY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-500 md:hidden">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)} />

          <div
            className={cn(
              'gold-grain-texture luxury-particles',
              'relative h-full flex flex-col items-center justify-center p-8',
              'bg-gradient-to-b from-[#000000] via-[#0a0a0a] to-[#000000]'
            )}
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                'absolute top-8 right-8 group',
                'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                'hover:scale-125 hover:rotate-90 active:scale-95',
                'text-[#C0A062]'
              )}
              aria-label="Close menu"
            >
              <div
                className={cn(
                  'relative',
                  'group-hover:drop-shadow-[0_0_20px_rgba(192,160,98,0.9)]',
                  'group-hover:drop-shadow-[0_0_40px_rgba(192,160,98,0.6)]'
                )}
              >
                <X className="w-8 h-8" strokeWidth={1} />
              </div>
            </button>

            <div className="absolute top-8 left-8">
              <h2 
                className="gold-gradient-text text-2xl tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Navigation
              </h2>
              <div className="h-[1px] w-full bg-gradient-to-r from-[#C0A062] to-transparent mt-2" />
            </div>

            <nav className="flex flex-col items-center gap-4 w-full max-w-md">
              {allNavItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'group w-full relative',
                    'flex items-center gap-6 px-8 py-5 rounded-2xl',
                    'border border-[#C0A062]/20',
                    'hover:border-[#C0A062]/60',
                    'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    'hover:bg-gradient-to-r hover:from-[#C0A062]/10 hover:via-[#C0A062]/5 hover:to-transparent',
                    'hover:shadow-[0_0_30px_rgba(192,160,98,0.3),inset_0_0_20px_rgba(192,160,98,0.1)]',
                    'hover:scale-105 hover:translate-x-2',
                    'backdrop-blur-sm'
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="absolute left-8 w-12 h-12 bg-[#C0A062]/0 group-hover:bg-[#C0A062]/20 rounded-full blur-2xl transition-all duration-500" />

                  <div
                    className={cn(
                      'relative z-10 text-[#C0A062] transition-all duration-500',
                      'group-hover:drop-shadow-[0_0_15px_rgba(192,160,98,0.8)]',
                      'group-hover:drop-shadow-[0_0_30px_rgba(192,160,98,0.5)]',
                      'group-hover:scale-125 group-hover:rotate-12',
                      'group-hover:filter group-hover:brightness-125'
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="flex flex-col items-start flex-1 relative z-10">
                    <span
                      className={cn(
                        'text-2xl transition-all duration-500',
                        'text-[#C0A062] group-hover:text-[#D4B576]',
                        'tracking-wide',
                        'group-hover:drop-shadow-[0_0_10px_rgba(192,160,98,0.8)]',
                        'group-hover:tracking-wider'
                      )}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        'text-xs transition-all duration-500',
                        'text-[#C0A062]/40 group-hover:text-[#C0A062]/70',
                        'tracking-widest uppercase mt-1'
                      )}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Navigate to {item.label.toLowerCase()}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'relative z-10 w-3 h-3 rounded-full transition-all duration-500',
                      'bg-[#C0A062]/0 group-hover:bg-[#C0A062]',
                      'group-hover:shadow-[0_0_20px_rgba(192,160,98,0.8)]',
                      'group-hover:scale-150'
                    )}
                  >
                    <div className="absolute inset-0 rounded-full bg-[#C0A062] opacity-0 group-hover:opacity-50 group-hover:animate-ping" />
                  </div>

                  <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#C0A062]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </button>
              ))}
            </nav>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
              <div className="relative w-32 h-[2px] bg-gradient-to-r from-transparent via-[#C0A062] to-transparent">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4B576] to-transparent blur-sm animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C0A062] animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LuxuryMobileDock;

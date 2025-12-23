'use client';

import React, { useState, useEffect } from 'react';
import './MobileNavDock.css';

// Mobile Navigation Dock Component - Mobile Only
const MobileNavDock = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Main navigation items displayed in the dock
    const mainNavItems = [
      { label: 'Home', icon: '🏠', href: '#home' },
      { label: 'Services', icon: '💼', href: '#services' },
      { label: 'Partners', icon: '👥', href: '#partners' },
        ];

    // All navigation items for the expanded menu
    const allNavItems = [
      { label: 'Home', icon: '🏠', href: '#home' },
      { label: 'About', icon: 'ℹ️', href: '#about' },
      { label: 'Services', icon: '💼', href: '#services' },
      { label: 'Platforms', icon: '📚', href: '#platforms' },
      { label: 'Curated Partners', icon: '👥', href: '#curated-partners' },
      { label: 'Blog', icon: '📖', href: '#blog' },
      { label: 'Contact', icon: '✉️', href: '#contact' },
        ];

    useEffect(() => {
          const handleScroll = () => {
                  setScrolled(window.scrollY > 50);
          };

                  window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (href) => {
          setIsOpen(false);
          const element = document.querySelector(href);
          if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
          }
    };

    // Mobile-only: Only render on mobile screens
    return (
          <>
            {/* Main Mobile Dock Navigation */}
                <nav className={`mobile-dock ${scrolled ? 'scrolled' : ''}`}>
                        <div className="dock-container">
                          {/* Decorative elements */}
                                  <div className="dock-accent dot dot-left" />
                                  <div className="dock-accent dot dot-right" />
                        
                          {/* Main navigation items */}
                          {mainNavItems.map((item, index) => (
                        <button
                                        key={index}
                                        onClick={() => handleNavClick(item.href)}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={`nav-item ${hoveredIndex === index ? 'hovered' : ''}`}
                                        aria-label={item.label}
                                      >
                                      <span className="nav-icon">{item.icon}</span>span>
                                      <span className="nav-label">{item.label}</span>span>
                        </button>button>
                      ))}
                        
                          {/* More button */}
                                  <button
                                                onClick={() => setIsOpen(!isOpen)}
                                                onMouseEnter={() => setHoveredIndex(999)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                                className={`nav-item more-btn ${hoveredIndex === 999 ? 'hovered' : ''}`}
                                                aria-label="More menu"
                                              >
                                              <span className="nav-icon">☰</span>span>
                                              <span className="nav-label">More</span>span>
                                  </button>button>
                        </div>div>
                </nav>nav>
          
            {/* Full Screen Mobile Menu */}
            {isOpen && (
                    <div className="mobile-menu-overlay">
                                                       <div className="mobile-menu-content">
                                                         {/* Close button */}
                                                                   <button
                                                                                   onClick={() => setIsOpen(false)}
                                                                                   className="menu-close-btn"
                                                                                   aria-label="Close menu"
                                                                                 >
                                                                                 ✕
                                                                   </button>button>
                                                       
                                                         {/* Menu title */}
                                                                   <div className="menu-header">
                                                                                 <h2>Navigation</h2>h2>
                                                                                 <div className="menu-divider"></div>div>
                                                                   </div>div>
                                                       
                                                         {/* Menu items */}
                                                                   <nav className="menu-nav">
                                                                     {allNavItems.map((item, index) => (
                                      <button
                                                          key={index}
                                                          onClick={() => handleNavClick(item.href)}
                                                          className="menu-item"
                                                          style={{ '--item-delay': `${index * 80}ms` }}
                                                        >
                                                        <div className="item-glow"></div>div>
                                                        <span className="item-icon">{item.icon}</span>span>
                                                        <div className="item-text">
                                                                            <span className="item-title">{item.label}</span>span>
                                                                            <span className="item-subtitle">Navigate to {item.label.toLowerCase()}</span>span>
                                                        </div>div>
                                                        <div className="item-dot"></div>div>
                                                        <div className="item-shimmer"></div>div>
                                      </button>button>
                                    ))}
                                                                   </nav>nav>
                                                       
                                                         {/* Bottom decorative elements */}
                                                                   <div className="menu-footer">
                                                                                 <div className="footer-line"></div>div>
                                                                                 <div className="footer-dots">
                                                                                                 <div className="dot pulse"></div>div>
                                                                                                 <div className="dot pulse" style={{ '--pulse-delay': '0.5s' }}></div>div>
                                                                                                 <div className="dot pulse" style={{ '--pulse-delay': '1s' }}></div>div>
                                                                                 </div>div>
                                                                   </div>div>
                                                       </div>div>
                    </div>div>
                )}
          </>>
        );
};

export default MobileNavDock;</>

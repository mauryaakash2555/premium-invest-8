import React, { useState } from 'react';
import './MobileNavDock.css';

const MobileNavDock = () => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
      { icon: '🏠', label: 'Home', href: '/' },
      { icon: '🏢', label: 'Services', href: '/services' },
      { icon: '🤝', label: 'Partners', href: '/partners' },
      { icon: '📱', label: 'More', href: '#', submenu: true }
        ];

    return (
          <>
                <nav className="mobile-nav-dock-container">
                        <div className="dock-background"></div>div>
                        <div className="dock-particles">
                          {[...Array(5)].map((_, i) => (
                        <div key={i} className="particle" style={{
                                        '--particle-delay': `${i * 0.2}s`,
                                        '--particle-index': i
                        }}></div>div>
                      ))}
                        </div>div>
                        <div className="nav-dock">
                          {menuItems.map((item, index) => (
                        <a
                                        key={index}
                                        href={item.href}
                                        className="nav-item"
                                        style={{ '--item-index': index }}
                                        title={item.label}
                                      >
                                      <span className="item-shimmer"></span>span>
                                      <span className="item-glow"></span>span>
                                      <span className="item-icon">{item.icon}</span>span>
                                      <span className="item-label">{item.label}</span>span>
                        </a>a>
                      ))}
                        </div>div>
                        <div className="ambient-light"></div>div>
                </nav>nav>
          </>>
        );
};

export default MobileNavDock;</>

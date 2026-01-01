'use client';

/**
 * V0.dev Compatibility Test Component
 * This is a simple navigation dock component from v0.dev to test compatibility
 */

import { useState } from 'react';
import { Home, Search, Bell, User, Settings } from 'lucide-react';

export default function V0Test() {
  const [activeItem, setActiveItem] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#000',
      padding: '20px'
    }}>
      <h2 style={{
        color: '#DAA520',
        marginBottom: '40px',
        fontFamily: 'Playfair Display, serif'
      }}>
        V0.dev Component Test
      </h2>
      
      {/* Navigation Dock */}
      <nav style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '50px',
        border: '1px solid rgba(218, 165, 32, 0.2)',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isActive 
                  ? 'linear-gradient(135deg, #DAA520 0%, #C0A062 100%)' 
                  : 'transparent',
                color: isActive ? '#000' : '#888',
              }}
              aria-label={item.label}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </nav>

      <p style={{
        color: '#666',
        marginTop: '40px',
        fontSize: '14px'
      }}>
        Click the icons to test interactivity
      </p>
      
      <div style={{
        marginTop: '20px',
        padding: '20px 40px',
        background: activeItem === 'home' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(218, 165, 32, 0.1)',
        borderRadius: '12px',
        border: `1px solid ${activeItem === 'home' ? 'rgba(37, 211, 102, 0.3)' : 'rgba(218, 165, 32, 0.3)'}`,
      }}>
        <span style={{ color: '#fff' }}>
          Active: <strong style={{ color: '#DAA520' }}>{activeItem}</strong>
        </span>
      </div>
    </div>
  );
}


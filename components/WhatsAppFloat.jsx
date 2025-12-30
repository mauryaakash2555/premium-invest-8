'use client';

import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const WhatsAppFloat = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia?.('(max-width: 768px)');
    const update = () => setIsMobile(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.('change', update);
    return () => mq?.removeEventListener?.('change', update);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <a
        href="https://wa.me/918850977259"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat with us on WhatsApp"
        style={{
          // Keep ORIGINAL floating WhatsApp look (green + glow) regardless of global CSS experiments.
          position: 'fixed',
          bottom: isMobile ? '90px' : '30px',
          right: isMobile ? '20px' : '30px',
          width: isMobile ? '55px' : '60px',
          height: isMobile ? '55px' : '60px',
          zIndex: 9999,

          background: '#25D366',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isHovered
            ? '0 6px 30px rgba(37, 211, 102, 0.6)'
            : '0 4px 20px rgba(37, 211, 102, 0.4)',
          color: '#FFFFFF',
          textDecoration: 'none',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={() => {
          setShowTooltip(true);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
          setIsHovered(false);
        }}
      >
        {/* WhatsApp logo (crisp + recognizable) */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false"
          style={{ display: 'block' }}
        >
          <path
            fill="#FFFFFF"
            d="M19.11 17.07c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.57-1.48-1.84-.16-.27-.02-.41.12-.54.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.06-.13-.61-1.47-.84-2.01-.22-.52-.44-.45-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.99 2.67 1.13 2.85.14.18 1.95 2.98 4.73 4.18.66.29 1.18.46 1.58.59.66.21 1.26.18 1.74.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.16.16-1.28-.07-.12-.25-.2-.52-.34zM16 5.33c-5.88 0-10.67 4.79-10.67 10.67 0 1.88.49 3.7 1.43 5.31L5.33 26.67l5.52-1.37c1.55.85 3.3 1.3 5.15 1.3 5.88 0 10.67-4.79 10.67-10.67S21.88 5.33 16 5.33zm0 19.2c-1.64 0-3.24-.45-4.63-1.29l-.33-.2-3.27.81.87-3.18-.21-.33c-.95-1.46-1.45-3.15-1.45-4.88 0-5.03 4.09-9.12 9.12-9.12s9.12 4.09 9.12 9.12-4.09 9.07-9.12 9.07z"
          />
        </svg>
      </a>
      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            background: '#25D366',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 999,
            fontWeight: '500',
          }}
        >
          Chat with us Instantly
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              right: '20px',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #25D366',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WhatsAppFloat;

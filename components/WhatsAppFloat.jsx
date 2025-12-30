'use client';

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import AIChatFloat from './AIChatFloat';
import ChatErrorBoundary from './ChatErrorBoundary';

const WhatsAppFloat = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [open, setOpen] = useState(false);
  const whatsappHref = "https://wa.me/918850977259";

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="whatsapp-float"
        aria-label="Open chat"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={28} style={{ width: '28px', height: '28px' }} />
      </button>
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
            pointerEvents: 'none',
            userSelect: 'none',
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

      <ChatErrorBoundary>
        <AIChatFloat open={open} onClose={() => setOpen(false)} whatsappHref={whatsappHref} />
      </ChatErrorBoundary>
    </div>
  );
};

export default WhatsAppFloat;


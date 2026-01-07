/**
 * 🔒 CORE PROTECTED MODULE - DO NOT EDIT
 * 
 * FILE: core/chat/ChatButton.jsx
 * PURPOSE: Self-contained floating chat button
 * 
 * ISOLATION RULES:
 * 1. Minimal external deps (only react, lucide-react icon)
 * 2. All styles inline
 * 3. Just the button UI - chat panel imported separately
 * 
 * LAST LOCKED: 2026-01-07
 */

'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatErrorBoundary from './ChatErrorBoundary';
// The actual chat panel is imported from the main components
// This is intentional - we protect the entry point but allow the panel to be updated
import AIChatFloat from '@/components/user/AIChatFloat';

export default function ChatButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [open, setOpen] = useState(false);
  const whatsappHref = "https://wa.me/918850977259";

  return (
    <div style={{ position: 'relative' }}>
      {/* Floating button */}
      <button
        type="button"
        className="whatsapp-float"
        aria-label="Open chat"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom))',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        <MessageCircle size={28} style={{ width: '28px', height: '28px', color: '#fff' }} />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(150px + env(safe-area-inset-bottom))',
            right: '20px',
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

      {/* Chat modal with error boundary */}
      <ChatErrorBoundary>
        <AIChatFloat open={open} onClose={() => setOpen(false)} whatsappHref={whatsappHref} />
      </ChatErrorBoundary>
    </div>
  );
}

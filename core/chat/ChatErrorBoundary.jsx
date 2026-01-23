/**
 * 🔒 CORE PROTECTED MODULE - DO NOT EDIT
 * 
 * FILE: core/chat/ChatErrorBoundary.jsx
 * PURPOSE: Self-contained error boundary for chat
 * 
 * ISOLATION RULES:
 * 1. NO imports from outside core/chat/
 * 2. Zero external dependencies (only React)
 * 3. All styles inline
 * 
 * LAST LOCKED: 2026-01-07
 */

'use client';

import React from 'react';

function safeJsonError(err) {
  try {
    return {
      name: err?.name || 'Error',
      message: err?.message || String(err),
      stack: typeof err?.stack === 'string' ? err.stack.slice(0, 4000) : null,
    };
  } catch {
    return { name: 'Error', message: 'unknown_error', stack: null };
  }
}

export default class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, resetKey: 0 };
    this._timer = null;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Chat crashed:', error, info);

    // Best-effort log to server
    try {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'chat_error',
          data: {
            error: safeJsonError(error),
            componentStack: typeof info?.componentStack === 'string' ? info.componentStack.slice(0, 4000) : null,
            href: typeof window !== 'undefined' ? window.location.href : null,
            ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            at: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    } catch {}

    // Auto-reload after 3 seconds
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.setState((s) => ({ hasError: false, resetKey: (s.resetKey || 0) + 1 }));
    }, 3000);
  }

  componentWillUnmount() {
    if (this._timer) clearTimeout(this._timer);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            right: 18,
            bottom: 94,
            zIndex: 2000,
            width: 'min(360px, calc(100vw - 36px))',
            borderRadius: 18,
            background: 'rgba(7,7,8,0.72)',
            border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            padding: '14px 14px',
            color: 'rgba(255,255,255,0.92)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          role="status"
          aria-live="polite"
        >
          <div style={{ fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12, color: 'color-mix(in oklab, var(--lux-accent) 85%, transparent)' }}>
            Concierge
          </div>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.45, opacity: 0.9 }}>
            Temporarily unavailable.
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.65 }}>
            Retrying automatically in 3 seconds.
          </div>
        </div>
      );
    }

    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

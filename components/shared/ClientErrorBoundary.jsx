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

export default class ClientErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, resetKey: 0 };
    this._timer = null;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    try {
      const eventType = this.props.eventType || 'ui_error';
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          data: {
            name: this.props.name || null,
            error: safeJsonError(error),
            componentStack:
              typeof info?.componentStack === 'string' ? info.componentStack.slice(0, 4000) : null,
            href: typeof window !== 'undefined' ? window.location.href : null,
            ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            at: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    const autoResetMs = typeof this.props.autoResetMs === 'number' ? this.props.autoResetMs : null;
    if (typeof autoResetMs === 'number' && autoResetMs > 0) {
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.setState((s) => ({ hasError: false, resetKey: (s.resetKey || 0) + 1 }));
      }, autoResetMs);
    }
  }

  componentWillUnmount() {
    if (this._timer) clearTimeout(this._timer);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

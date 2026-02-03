'use client';

import { useState } from 'react';

export default function NewsletterSignup({ source = 'blog' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      style={{
        borderRadius: 0,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '18px',
        marginTop: '10px',
        marginBottom: '26px',
      }}
    >
      <div style={{ color: 'var(--lux-accent)', fontWeight: 800, marginBottom: '6px' }}>Get weekly insights</div>
      <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px', lineHeight: 1.6 }}>
        Market notes + community stories. No spam.
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2" style={{ alignItems: 'stretch' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          style={{
            flex: 1,
            padding: '12px 12px',
            borderRadius: 0,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(0,0,0,0.55)',
            color: 'rgba(235,242,255,0.92)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            padding: '12px 14px',
            borderRadius: 0,
            border: '1px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            color: 'rgba(245,245,245,0.92)',
            fontWeight: 800,
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            minWidth: '120px',
          }}
        >
          {status === 'submitting' ? '…' : 'Subscribe'}
        </button>
      </form>

      {status === 'success' ? <div style={{ color: 'rgba(235,242,255,0.86)', marginTop: '10px' }}>Subscribed.</div> : null}
      {status === 'error' ? <div style={{ color: 'rgba(235,242,255,0.86)', marginTop: '10px' }}>Subscription failed.</div> : null}
    </div>
  );
}

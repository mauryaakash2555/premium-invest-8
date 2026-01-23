/**
 * 🔒 CORE PROTECTED MODULE - DO NOT EDIT
 * 
 * FILE: core/admin/AdminAuth.jsx
 * PURPOSE: Self-contained admin login component
 * 
 * ISOLATION RULES:
 * 1. NO imports from outside core/admin/
 * 2. NO global state or context
 * 3. All styles inline (no external CSS)
 * 4. API calls are internal only
 * 
 * LAST LOCKED: 2026-01-07
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// ============ INTERNAL UTILITIES ============

function fmtSeconds(s) {
  const n = Math.max(0, Number(s) || 0);
  if (n < 60) return `${n}s`;
  const m = Math.ceil(n / 60);
  return `${m}m`;
}

// ============ STYLES (inline to avoid external deps) ============

const STYLES = {
  screen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px 32px',
    background: 'rgba(20, 20, 20, 0.95)',
    borderRadius: '16px',
    border: '1px solid color-mix(in oklab, var(--lux-accent) 20%, transparent)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--lux-accent)',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 48px 14px 16px',
    fontSize: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    padding: '4px',
  },
  error: {
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'center',
  },
  warn: {
    color: '#f59e0b',
    fontSize: '14px',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, var(--lux-accent) 0%, var(--lux-accent) 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  hint: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: '24px',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    color: 'var(--lux-accent)',
    fontSize: '18px',
  },
};

// ============ LOGIN COMPONENT ============

export function AdminLogin({ title, subtitle, onLogin }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lockedFor, setLockedFor] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!lockedFor) return;
    const t = setInterval(() => setLockedFor((x) => (x > 1 ? x - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [lockedFor]);

  const canSubmit = useMemo(() => !busy && lockedFor === 0, [busy, lockedFor]);

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const password = String(inputRef.current?.value || '').trim();
    if (!password) return;

    setBusy(true);
    setError('');

    try {
      const res = await onLogin(password);
      if (res?.lockedForSeconds) {
        setLockedFor(res.lockedForSeconds);
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
      try {
        if (inputRef.current) inputRef.current.value = '';
      } catch {}
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={STYLES.screen}>
      <div style={STYLES.card}>
        <div style={STYLES.title}>{title}</div>
        <div style={STYLES.subtitle}>{subtitle}</div>

        <form onSubmit={submit} style={STYLES.form}>
          <div style={STYLES.inputWrap}>
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              autoComplete="current-password"
              style={STYLES.input}
              disabled={!canSubmit}
            />
            <button
              type="button"
              style={STYLES.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={!canSubmit}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 5c-5.5 0-10 4.2-11 7 1 2.8 5.5 7 11 7s10-4.2 11-7c-1-2.8-5.5-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
                />
              </svg>
            </button>
          </div>

          {error && <div style={STYLES.error}>{error}</div>}
          {lockedFor > 0 && (
            <div style={STYLES.warn}>Too many attempts. Try again in {fmtSeconds(lockedFor)}.</div>
          )}

          <button
            type="submit"
            style={{
              ...STYLES.button,
              ...(canSubmit ? {} : STYLES.buttonDisabled),
            }}
            disabled={!canSubmit}
          >
            {busy ? 'Checking…' : lockedFor ? 'Locked' : 'Access Control Panel'}
          </button>
        </form>

        <div style={STYLES.hint}>This page is private. Unauthorized access is monitored.</div>
      </div>
    </div>
  );
}

// ============ AUTH CLIENT UTILITIES ============

const ADMIN_TOKEN_KEY = 'bm_admin_token_v1';

export function setAdminToken(token) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ADMIN_TOKEN_KEY, String(token || ''));
    }
  } catch {}
}

export function getAdminToken() {
  try {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(ADMIN_TOKEN_KEY) || '';
    }
  } catch {}
  return '';
}

export function clearAdminToken() {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {}
}

export async function fetchAdminJSON(url, options = {}) {
  const token = getAdminToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['x-bm-admin-token'] = token;
  
  const r = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  const j = await r.json().catch(() => null);
  return { r, j };
}

// ============ LOADING COMPONENT ============

export function AdminLoading() {
  return <div style={STYLES.loading}>Loading…</div>;
}

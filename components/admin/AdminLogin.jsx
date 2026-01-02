'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function fmtSeconds(s) {
  const n = Math.max(0, Number(s) || 0);
  if (n < 60) return `${n}s`;
  const m = Math.ceil(n / 60);
  return `${m}m`;
}

export function AdminLogin({ title, subtitle, onLogin }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lockedFor, setLockedFor] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // countdown UI for lockout
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
    <div className="sa-loginScreen">
      <div className="sa-loginCard">
        <div className="sa-loginTitle">{title}</div>
        <div className="sa-loginSub">{subtitle}</div>

        <form onSubmit={submit} className="sa-loginForm">
          <div className="sa-loginPassword">
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              autoComplete="current-password"
              className="sa-loginInput"
              disabled={!canSubmit}
            />

            <button
              type="button"
              className="sa-loginEyeBtn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={!canSubmit}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M12 5c-5.5 0-10 4.2-11 7 1 2.8 5.5 7 11 7s10-4.2 11-7c-1-2.8-5.5-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
                />
              </svg>
            </button>
          </div>

          {error ? <div className="sa-loginError">{error}</div> : null}
          {lockedFor ? (
            <div className="sa-loginWarn">Too many attempts. Try again in {fmtSeconds(lockedFor)}.</div>
          ) : null}

          <button type="submit" className="sa-loginBtn" disabled={!canSubmit}>
            {busy ? 'Checking…' : lockedFor ? 'Locked' : 'Access Control Panel'}
          </button>
        </form>

        <div className="sa-loginHint">This page is private. Unauthorized access is monitored.</div>
      </div>
    </div>
  );
}

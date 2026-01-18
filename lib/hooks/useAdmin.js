/**
 * Admin Authentication Hook (client-side convenience)
 * NOTE: Real auth uses server cookie from /api/admin/login.
 */

'use client';

import { useCallback, useState } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (password) => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        setIsAdmin(false);
        setError(j?.error || "login_failed");
        return false;
      }
      setIsAdmin(true);
      return true;
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Cookie-based auth logout would need a route; keep it UI-only for now.
    setIsAdmin(false);
  }, []);

  return { isAdmin, busy, error, login, logout };
}






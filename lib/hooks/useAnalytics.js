/**
 * Analytics Hook (admin)
 */

'use client';

import { useCallback, useState } from "react";

export function useAnalytics() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/analytics", { method: "GET" });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        setError(j?.error || "analytics_failed");
        return null;
      }
      setData(j);
      return j;
    } finally {
      setBusy(false);
    }
  }, []);

  return { data, busy, error, refresh };
}





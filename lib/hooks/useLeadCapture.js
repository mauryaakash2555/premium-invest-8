/**
 * Lead Capture Hook
 */

'use client';

import { useCallback, useState } from "react";

export function useLeadCapture() {
  const [lead, setLead] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upsert = useCallback(async ({ name, email, phone }) => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        setError(j?.error || "lead_capture_failed");
        return { ok: false, lead: null };
      }
      setLead(j.lead || null);
      return { ok: true, lead: j.lead || null };
    } finally {
      setBusy(false);
    }
  }, []);

  return { lead, busy, error, upsert };
}






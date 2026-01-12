/**
 * AI Chat Hook
 */

'use client';

import { useCallback, useState } from "react";

export function useAIChat() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = useCallback(async ({ message, mode = "user", leadId, conversationId, conversationHistory }) => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          mode,
          leadId: leadId || undefined,
          conversationId: conversationId || undefined,
          conversationHistory: conversationHistory || undefined,
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        const e = j?.error || "chat_failed";
        setError(e);
        return { ok: false, reply: "", error: e };
      }
      return { ok: true, reply: String(j.reply || ""), error: null, meta: j };
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, send };
}






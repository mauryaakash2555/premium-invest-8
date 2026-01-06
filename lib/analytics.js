export const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      const calculator_type = params?.calculator_type || "tax_optimization";
      window.gtag("event", eventName, {
        ...params,
        calculator_type,
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    // ignore
  }

  // Best-effort server-side analytics for daily KPI reporting.
  // Keep it bounded to a small allowlist to avoid flooding the DB.
  try {
    if (typeof window === "undefined") return;
    const allow = new Set([
      "calculator_view",
      "calculator_start",
      "calculator_calculate",
      "calculator_complete",
      "lead_submit_free",
      "lead_submit_pay",
      "lead_captured",
      "premium_click",
      "payment_start",
      "payment_cancelled",
      "payment_failed",
      "payment_success",
      "purchase",
      "pdf_downloaded",
    ]);
    if (!allow.has(String(eventName || ""))) return;

    const leadId = params?.leadId ? String(params.leadId) : undefined;
    const data = { ...(params || {}) };
    delete data.leadId;

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        event_type: String(eventName || ""),
        data,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
};

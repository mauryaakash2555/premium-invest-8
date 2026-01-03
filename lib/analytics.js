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
};

export const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        ...params,
        calculator_type: "tax_optimization",
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    // ignore
  }
};

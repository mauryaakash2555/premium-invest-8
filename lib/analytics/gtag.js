/**
 * GA4 Event Tracking Helper
 * 
 * Safe wrapper that only sends events if gtag is loaded
 */

export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const trackPageView = (url) => {
  trackEvent('page_view', {
    page_path: url,
  });
};

export const trackClick = (category, label) => {
  trackEvent('click', {
    event_category: category,
    event_label: label,
  });
};

export const trackServiceView = (serviceName) => {
  trackEvent('service_view', {
    service_name: serviceName,
  });
};

export const trackFormSubmission = (formName, success = true) => {
  trackEvent('form_submission', {
    form_name: formName,
    success: success,
  });
};

export const trackOutboundLink = (url) => {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: url,
    transport_type: 'beacon',
  });
};

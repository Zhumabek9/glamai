export function trackEvent(eventName, properties = {}) {
  const payload = {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  const baseUrl = import.meta.env.VITE_API_URL || '';
  fetch(`${baseUrl}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Keep analytics fire-and-forget; never block UX flows.
  });
}


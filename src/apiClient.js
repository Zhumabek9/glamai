/**
 * Clerk token helper — retrieves the current Clerk session token
 * and attaches it as Authorization: Bearer header to every API call.
 */

/**
 * Get Authorization headers with the current Clerk session token.
 * Returns empty object if user is not logged in.
 */
export async function getAuthHeaders() {
  if (typeof window !== 'undefined' && window.Clerk?.session) {
    try {
      const token = await window.Clerk.session.getToken();
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch (err) {
      console.warn('Error fetching Clerk token:', err);
    }
  }
  return {};
}

/**
 * Authenticated fetch — wraps fetch() with Clerk Bearer token.
 */
export async function authFetch(url, options = {}) {
  const authHeaders = await getAuthHeaders();
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return fetch(baseUrl + url, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });
}

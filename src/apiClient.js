/**
 * Firebase token helper — retrieves the current Firebase ID token
 * and attaches it as Authorization: Bearer header to every API call.
 */
import { auth } from './firebase';

/**
 * Get Authorization headers with the current Firebase ID token.
 * Returns empty object if user is not logged in.
 */
export async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

/**
 * Authenticated fetch — wraps fetch() with Firebase Bearer token.
 */
export async function authFetch(url, options = {}) {
  const authHeaders = await getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });
}

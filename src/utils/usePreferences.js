import { useState, useEffect, useCallback } from 'react';

/**
 * usePreferences — persists favorite styles/colors for logged-in users
 * Stored in localStorage under `glamai_prefs_{userId}`
 */
export function usePreferences(userId) {
  const storageKey = userId ? `glamai_prefs_${userId}` : null;

  const load = () => {
    if (!storageKey) return {};
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  };

  const [prefs, setPrefs] = useState(load);

  // Reload when userId changes
  useEffect(() => {
    setPrefs(load());
  }, [userId]);

  const savePreference = useCallback((key, value) => {
    if (!storageKey) return;
    setPrefs(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [storageKey]);

  const getFavoriteStyles = useCallback(() => {
    return prefs.lastStyles || [];
  }, [prefs]);

  const saveLastStyle = useCallback((styleId) => {
    if (!storageKey) return;
    setPrefs(prev => {
      const existing = prev.lastStyles || [];
      const updated = [styleId, ...existing.filter(s => s !== styleId)].slice(0, 3);
      const newPrefs = { ...prev, lastStyles: updated };
      try { localStorage.setItem(storageKey, JSON.stringify(newPrefs)); } catch {}
      return newPrefs;
    });
  }, [storageKey]);

  const saveLastColor = useCallback((colorId) => {
    savePreference('lastColor', colorId);
  }, [savePreference]);

  return {
    prefs,
    savePreference,
    getFavoriteStyles,
    saveLastStyle,
    saveLastColor,
    lastColor: prefs.lastColor || null,
    lastStyles: prefs.lastStyles || [],
  };
}

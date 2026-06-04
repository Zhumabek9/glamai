import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'glamai_achievements';

const ACHIEVEMENT_DEFS = {
  first_generation: {
    id: 'first_generation',
    message: '✨ First Style Generated! Welcome to GlamAI!',
    once: true,
  },
  first_save: {
    id: 'first_save',
    message: '💾 First Save! You earned +5 bonus credits!',
    once: true,
  },
  daily_return: {
    id: 'daily_return',
    message: '🌟 Welcome back! +2 daily credits!',
    once: false, // resets daily
  },
  share_result: {
    id: 'share_result',
    message: '🔗 Shared! Thanks for spreading the love!',
    once: false,
  },
};

export function useAchievements() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const [pendingToast, setPendingToast] = useState(null);

  const save = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota exceeded or other storage errors
    }
  };

  // Check daily return on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('glamai_last_visit');
    if (lastVisit !== today) {
      localStorage.setItem('glamai_last_visit', today);
      if (lastVisit) {
        // They came back on a different day
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPendingToast(ACHIEVEMENT_DEFS.daily_return.message);
      }
    }
  }, []);

  const trigger = useCallback((achievementId) => {
    const def = ACHIEVEMENT_DEFS[achievementId];
    if (!def) return;

    if (def.once && unlocked[achievementId]) return;

    setUnlocked(prev => {
      const updated = { ...prev, [achievementId]: true };
      save(updated);
      return updated;
    });

    setPendingToast(def.message);
  }, [unlocked]);

  const clearToast = useCallback(() => {
    setPendingToast(null);
  }, []);

  return { trigger, pendingToast, clearToast };
}

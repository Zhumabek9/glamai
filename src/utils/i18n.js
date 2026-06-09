import translations from '../translations.json';

const ALLOWED_LANGS = ['en', 'es', 'fr', 'de', 'ru'];
const DEFAULT_LANG = 'en';

// Detect initial language based on storage or browser preferences
function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem('glamai_language');
    if (saved && ALLOWED_LANGS.includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('LocalStorage not accessible:', e);
  }

  // Fallback to browser language
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  const langCode = browserLang.split('-')[0];
  if (ALLOWED_LANGS.includes(langCode)) {
    return langCode;
  }

  return DEFAULT_LANG;
}

let currentLang = detectInitialLanguage();
try {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLang;
  }
} catch (e) {}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (ALLOWED_LANGS.includes(lang)) {
    currentLang = lang;
    try {
      localStorage.setItem('glamai_language', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      console.warn('Failed to save language to LocalStorage:', e);
    }
  }
}

export function t(key, replacementsOrFallback = {}, replacements = {}) {
  // Support both:
  //   t('key', { count: 5 })           → replacements object
  //   t('key', 'Fallback string')       → old 2-arg form (fallback ignored, kept for compat)
  //   t('key', 'Fallback', { count: 5}) → full 3-arg form
  const actualReplacements =
    typeof replacementsOrFallback === 'object' && replacementsOrFallback !== null
      ? replacementsOrFallback
      : replacements;

  // Support both nested structure and old flat structure (during transition if any)
  const langGroup = translations[currentLang] || {};
  let value = langGroup[key];
  
  if (value === undefined) {
    // Check English fallback
    const enGroup = translations[DEFAULT_LANG] || {};
    value = enGroup[key];
  }

  // If still not found, check if translations is flat (old style)
  if (value === undefined) {
    value = translations[key];
  }

  if (value === undefined) {
    // Use provided string fallback if available, otherwise return the key
    if (typeof replacementsOrFallback === 'string') {
      value = replacementsOrFallback;
    } else {
      return key;
    }
  }
  
  // Replace placeholders like {count} or {max} — escape regex special chars in key names
  let strValue = String(value);
  Object.keys(actualReplacements).forEach((k) => {
    // Escape any regex special characters in the placeholder key name
    const escapedKey = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    strValue = strValue.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), actualReplacements[k]);
  });
  
  return strValue;
}

export default t;

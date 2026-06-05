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

export function t(key, replacements = {}) {
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
    // Final fallback
    return key;
  }
  
  // Replace placeholders like {count} or {max} or {needed}
  let strValue = String(value);
  Object.keys(replacements).forEach((k) => {
    strValue = strValue.replace(new RegExp(`{${k}}`, 'g'), replacements[k]);
  });
  
  return strValue;
}

export default t;

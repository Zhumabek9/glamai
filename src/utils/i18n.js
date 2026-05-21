import translations from '../translations.json';

export function t(key, replacements = {}) {
  let value = translations[key];
  if (!value) {
    // Fallback if key not found
    return key;
  }
  
  // Replace placeholders like {count} or {max} or {needed}
  Object.keys(replacements).forEach((k) => {
    value = value.replace(new RegExp(`{${k}}`, 'g'), replacements[k]);
  });
  
  return value;
}

export default t;

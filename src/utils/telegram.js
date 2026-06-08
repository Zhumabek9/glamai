import WebApp from '@twa-dev/sdk';

export const isTMA = () => {
  return WebApp.initData !== '';
};

export const getTelegramUser = () => {
  if (!isTMA()) return null;
  return WebApp.initDataUnsafe?.user || null;
};

export const initTelegramApp = () => {
  if (isTMA()) {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('secondary_bg_color');
  }
};
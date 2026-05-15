import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './zh.json';
import en from './en.json';

const savedLang = typeof window !== 'undefined' ? window.localStorage.getItem('lang') : null;
const defaultLang = savedLang || (typeof navigator !== 'undefined' && navigator.language.startsWith('zh') ? 'zh' : 'en');

i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: defaultLang,
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

export function toggleLang() {
  const next = i18n.language === 'zh' ? 'en' : 'zh';
  i18n.changeLanguage(next);
  window.localStorage.setItem('lang', next);
}

export default i18n;

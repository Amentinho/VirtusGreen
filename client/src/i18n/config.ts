import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import it from './locales/it.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  it: { translation: it },
  es: { translation: es },
};

const savedLang = localStorage.getItem('language');
const browserLang = navigator.language?.split('-')[0];
const supportedLangs = ['en', 'it', 'es'];
const detectedLang = savedLang || (supportedLangs.includes(browserLang) ? browserLang : 'it');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

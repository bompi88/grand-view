import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../../locales/en/common.json';
import noNB from '../../../locales/no-NB/common.json';

export const SUPPORTED_LANGUAGES = ['en', 'no-NB'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    'no-NB': { common: noNB },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;

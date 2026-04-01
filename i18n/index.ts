import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import fr from './fr.json';

const savedLanguage = null; // loaded from AsyncStorage in app before this init

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
const defaultLanguage = deviceLanguage.startsWith('fr') ? 'fr' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: savedLanguage ?? defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;

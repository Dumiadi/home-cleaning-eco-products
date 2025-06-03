import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ro',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ro: {
        translation: {
          welcome: "Bun venit",
          services: "Servicii",
          // alte traduceri
        },
      },
      en: {
        translation: {
          welcome: "Welcome",
          services: "Services",
          // alte traduceri
        },
      },
    },
  });

export default i18n;

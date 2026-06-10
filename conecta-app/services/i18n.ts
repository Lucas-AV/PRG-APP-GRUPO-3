import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from '@/constants/translations/pt.json';
import en from '@/constants/translations/en.json';

export const LANGUAGE_STORAGE_KEY = '@app_language';
export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  pt: 'Português (Brasil)',
  en: 'English',
};

/**
 * Detect the initial language:
 * 1. Previously stored preference via AsyncStorage
 * 2. Device locale (if supported)
 * 3. Fallback to 'pt'
 */
async function detectLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // ignore read errors
  }

  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'pt';
  const deviceLang = deviceLocale.split('-')[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(deviceLang) ? deviceLang : 'pt';
}

/**
 * Persist and change the active language at runtime.
 */
export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

/**
 * Initialise i18next. Must be awaited before rendering the app.
 */
export async function initI18n(): Promise<void> {
  const lng = await detectLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        pt: { translation: pt },
        en: { translation: en },
      },
      lng,
      fallbackLng: 'pt',
      interpolation: {
        // React already escapes by default
        escapeValue: false,
      },
      compatibilityJSON: 'v4',
    });
}

export default i18n;

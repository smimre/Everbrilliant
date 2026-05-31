import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Direction } from '@/types';

interface LocaleConfig {
  lang: Language;
  dir: Direction;
  font: string;
  flag: string;
  label: string;
}

const LOCALES: Record<Language, LocaleConfig> = {
  en: { lang: 'en', dir: 'ltr', font: 'var(--font-sans)', flag: '🇬🇧', label: 'English' },
  fa: { lang: 'fa', dir: 'rtl', font: "'Vazirmatn', sans-serif", flag: '🇮🇷', label: 'فارسی' },
  ar: { lang: 'ar', dir: 'rtl', font: "'Cairo', sans-serif", flag: '🇸🇦', label: 'العربية' },
  hi: { lang: 'hi', dir: 'ltr', font: 'var(--font-sans)', flag: '🇮🇳', label: 'हिन्दी' },
};

interface LocaleStore {
  lang: Language;
  dir: Direction;
  locales: typeof LOCALES;
  currentLocale: () => LocaleConfig;
  setLocale: (lang: Language) => void;
  t: (key: string, translations: Partial<Record<Language, string>>) => string;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      lang: 'en',
      dir: 'ltr',
      locales: LOCALES,

      currentLocale: () => LOCALES[get().lang],

      setLocale: (lang) => {
        const locale = LOCALES[lang];
        set({ lang, dir: locale.dir });
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
          document.documentElement.dir = locale.dir;
          document.body.style.fontFamily = locale.font;
        }
      },

      t: (key, translations) => {
        const lang = get().lang;
        return translations[lang] || translations.en || key;
      },
    }),
    {
      name: 'eb-locale',
      partialize: (s) => ({ lang: s.lang, dir: s.dir }),
    }
  )
);

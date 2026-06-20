import { create } from 'zustand';
import { I18nManager } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type Lang = 'fa' | 'en' | 'ar' | 'hi';

interface LocaleState {
  lang: Lang;
  isRTL: boolean;
  setLang: (lang: Lang) => void;
  hydrate: () => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  lang:  'fa',
  isRTL: true,

  setLang: (lang: Lang) => {
    const rtl = lang === 'fa' || lang === 'ar';
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    SecureStore.setItemAsync('lang', lang).catch(() => {});
    set({ lang, isRTL: rtl });
  },

  hydrate: async () => {
    try {
      const saved = (await SecureStore.getItemAsync('lang')) as Lang | null;
      if (saved) {
        const rtl = saved === 'fa' || saved === 'ar';
        I18nManager.allowRTL(rtl);
        I18nManager.forceRTL(rtl);
        set({ lang: saved, isRTL: rtl });
      }
    } catch {}
  },
}));

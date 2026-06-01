import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Theme, Module } from '@/types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  activeModule: Module;
  theme: Theme;
  toasts: Toast[];
  isCommandPaletteOpen: boolean;
  isMobile: boolean;
  _hasHydrated: boolean;
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveModule: (module: Module) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toast: (type: Toast['type'], message: string, duration?: number) => void;
  setCommandPalette: (open: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
  setHasHydrated: (v: boolean) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    immer((set, get) => ({
      sidebarOpen: true,
      activeModule: 'trading' as Module,
      theme: 'dark' as Theme,
      toasts: [],
      isCommandPaletteOpen: false,
      isMobile: false,
      _hasHydrated: false,

      setSidebarOpen: (sidebarOpen) => set((s) => { s.sidebarOpen = sidebarOpen; }),

      toggleSidebar: () => set((s) => { s.sidebarOpen = !s.sidebarOpen; }),

      setActiveModule: (activeModule) => set((s) => { s.activeModule = activeModule; }),

      setTheme: (theme) => {
        set((s) => { s.theme = theme; });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
          document.documentElement.classList.toggle('light', theme === 'light');
        }
      },

      toggleTheme: () => {
        const current = get().theme;
        get().setTheme(current === 'dark' ? 'light' : 'dark');
      },

      addToast: (toastData) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const duration = toastData.duration ?? 4000;
        set((s) => { s.toasts.push({ ...toastData, id }); });
        if (duration > 0) {
          setTimeout(() => get().removeToast(id), duration);
        }
        return id;
      },

      removeToast: (id) => set((s) => {
        s.toasts = s.toasts.filter((t) => t.id !== id);
      }),

      clearToasts: () => set((s) => { s.toasts = []; }),

      toast: (type, message, duration) => {
        get().addToast({ type, message, duration });
      },

      setCommandPalette: (isCommandPaletteOpen) => set((s) => { s.isCommandPaletteOpen = isCommandPaletteOpen; }),

      setIsMobile: (isMobile) => set((s) => { s.isMobile = isMobile; }),

      setHasHydrated: (v) => set((s) => { s._hasHydrated = v; }),
    })),
    {
      name: 'eb-ui',
      partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen, activeModule: s.activeModule }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

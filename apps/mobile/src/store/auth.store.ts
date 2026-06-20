import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/api/client';

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  companyId: number;
  role?: string;
  isCompanyAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  accessToken:     null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync('accessToken'),
        SecureStore.getItemAsync('user'),
      ]);
      if (token && userJson) {
        set({ accessToken: token, user: JSON.parse(userJson), isAuthenticated: true });
      }
    } catch {
      // Secure store not available in dev — continue unauthenticated
    }
  },

  setAuth: async (user: User, token: string) => {
    await Promise.all([
      SecureStore.setItemAsync('accessToken', token),
      SecureStore.setItemAsync('user', JSON.stringify(user)),
    ]).catch(() => {});
    set({ user, accessToken: token, isAuthenticated: true, error: null });
  },

  login: async (phone: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ accessToken: string; user: User }>('/auth/login', { phone, password });
      await get().setAuth(res.user, res.accessToken);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Login failed. Check credentials.';
      set({ error: Array.isArray(msg) ? msg[0] : msg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('user'),
    ]).catch(() => {});
    set({ user: null, accessToken: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
